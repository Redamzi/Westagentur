import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const MIGRATIONS = [
  `CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    service TEXT,
    message TEXT,
    page TEXT,
    lang TEXT,
    notify_sent INTEGER NOT NULL DEFAULT 0,
    confirm_sent INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX leads_created_at ON leads (created_at)`,
  // Booking, admin and statistics
  `ALTER TABLE leads ADD COLUMN notes TEXT;
   ALTER TABLE leads ADD COLUMN status_changed_at TEXT;
   ALTER TABLE leads ADD COLUMN followups_sent INTEGER NOT NULL DEFAULT 0;
   ALTER TABLE leads ADD COLUMN review_sent INTEGER NOT NULL DEFAULT 0;

   CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

   CREATE TABLE availability (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
     start_min INTEGER NOT NULL CHECK (start_min BETWEEN 0 AND 1440),
     end_min INTEGER NOT NULL CHECK (end_min BETWEEN 0 AND 1440)
   );
   INSERT INTO availability (weekday, start_min, end_min)
     VALUES (1, 540, 1020), (2, 540, 1020), (3, 540, 1020), (4, 540, 1020), (5, 540, 1020);

   CREATE TABLE blocks (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     start_utc TEXT NOT NULL,
     end_utc TEXT NOT NULL,
     reason TEXT
   );

   CREATE TABLE bookings (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     token TEXT NOT NULL UNIQUE,
     lead_id INTEGER REFERENCES leads (id),
     created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
     source TEXT NOT NULL DEFAULT 'website',
     status TEXT NOT NULL DEFAULT 'confirmed',
     start_utc TEXT NOT NULL,
     end_utc TEXT NOT NULL,
     sequence INTEGER NOT NULL DEFAULT 0,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT,
     company TEXT,
     service TEXT,
     note TEXT,
     lang TEXT,
     reminder_sent INTEGER NOT NULL DEFAULT 0,
     cancelled_at TEXT
   );
   CREATE UNIQUE INDEX bookings_slot ON bookings (start_utc) WHERE status = 'confirmed';

   CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);

   CREATE TABLE pageviews (
     day TEXT NOT NULL,
     path TEXT NOT NULL,
     referrer TEXT NOT NULL DEFAULT '',
     views INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (day, path, referrer)
   );`,
];

export const DEFAULT_SETTINGS = {
  timezone: 'Europe/Berlin',
  slotMinutes: 30,
  minNoticeHours: 12,
  maxDaysAhead: 30,
};

const nowIso = () => new Date().toISOString();

/** Opens the SQLite database (":memory:" for tests) and applies pending migrations. */
export const openDatabase = (file) => {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const version = db.prepare('PRAGMA user_version').get().user_version;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  const q = (sql) => db.prepare(sql);
  const transaction = (fn) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };

  const insertLead = q(`
    INSERT INTO leads (source, name, email, phone, company, service, message, page, lang, status_changed_at)
    VALUES (:source, :name, :email, :phone, :company, :service, :message, :page, :lang, :now)
  `);
  const insertBooking = q(`
    INSERT INTO bookings (token, lead_id, source, start_utc, end_utc, name, email, phone, company, service, note, lang)
    VALUES (:token, :lead_id, :source, :start_utc, :end_utc, :name, :email, :phone, :company, :service, :note, :lang)
  `);

  return {
    raw: db,
    transaction,

    // Leads
    insertLead(lead) {
      const row = {
        source: 'contact_form',
        phone: '',
        company: '',
        service: 'other',
        message: '',
        page: '',
        lang: 'de',
        ...lead,
        now: nowIso(),
      };
      return Number(insertLead.run(row).lastInsertRowid);
    },
    markMailSent(id, kind) {
      q(`UPDATE leads SET ${kind === 'notify' ? 'notify_sent' : 'confirm_sent'} = 1 WHERE id = ?`).run(id);
    },
    getLead: (id) => q('SELECT * FROM leads WHERE id = ?').get(id),
    listLeads({ status } = {}) {
      return status
        ? q('SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT 500').all(status)
        : q('SELECT * FROM leads ORDER BY created_at DESC LIMIT 500').all();
    },
    updateLead(id, { status, notes }, at = nowIso()) {
      const lead = q('SELECT * FROM leads WHERE id = ?').get(id);
      if (!lead) return undefined;
      const nextStatus = status ?? lead.status;
      q(`UPDATE leads SET status = ?, notes = ?, status_changed_at = ?,
           followups_sent = CASE WHEN ? THEN 0 ELSE followups_sent END WHERE id = ?`).run(
        nextStatus,
        notes ?? lead.notes,
        nextStatus !== lead.status ? at : lead.status_changed_at,
        nextStatus !== lead.status ? 1 : 0,
        id
      );
      return q('SELECT * FROM leads WHERE id = ?').get(id);
    },
    setLeadFlag(id, column, value) {
      if (!['followups_sent', 'review_sent'].includes(column)) throw new Error('invalid column');
      q(`UPDATE leads SET ${column} = ? WHERE id = ?`).run(value, id);
    },

    // Settings & availability
    getSettings() {
      const rows = q('SELECT key, value FROM settings').all();
      return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)])) };
    },
    saveSettings(values) {
      const stmt = q('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value');
      for (const [key, value] of Object.entries(values)) stmt.run(key, JSON.stringify(value));
    },
    listAvailability: () => q('SELECT weekday, start_min, end_min FROM availability ORDER BY weekday, start_min').all(),
    replaceAvailability(rows) {
      transaction(() => {
        q('DELETE FROM availability').run();
        const stmt = q('INSERT INTO availability (weekday, start_min, end_min) VALUES (?, ?, ?)');
        for (const r of rows) stmt.run(r.weekday, r.start_min, r.end_min);
      });
    },
    listBlocks: (fromIso) =>
      q('SELECT * FROM blocks WHERE end_utc > ? ORDER BY start_utc').all(fromIso ?? '0000'),
    insertBlock: ({ start_utc, end_utc, reason }) =>
      Number(q('INSERT INTO blocks (start_utc, end_utc, reason) VALUES (?, ?, ?)').run(start_utc, end_utc, reason ?? '').lastInsertRowid),
    deleteBlock: (id) => q('DELETE FROM blocks WHERE id = ?').run(id).changes > 0,

    // Bookings
    insertBooking(booking) {
      return Number(insertBooking.run({ lead_id: null, source: 'website', phone: '', company: '', service: 'other', note: '', lang: 'de', ...booking }).lastInsertRowid);
    },
    getBooking: (id) => q('SELECT * FROM bookings WHERE id = ?').get(id),
    getBookingByToken: (token) => q('SELECT * FROM bookings WHERE token = ?').get(token),
    confirmedBookingsBetween: (fromIso, toIso) =>
      q("SELECT start_utc, end_utc FROM bookings WHERE status = 'confirmed' AND end_utc > ? AND start_utc < ?").all(fromIso, toIso),
    listBookings({ upcoming = true, now = nowIso() } = {}) {
      return upcoming
        ? q("SELECT * FROM bookings WHERE end_utc >= ? ORDER BY start_utc LIMIT 500").all(now)
        : q("SELECT * FROM bookings WHERE end_utc < ? ORDER BY start_utc DESC LIMIT 500").all(now);
    },
    cancelBooking(id) {
      q("UPDATE bookings SET status = 'cancelled', cancelled_at = ?, sequence = sequence + 1 WHERE id = ? AND status = 'confirmed'").run(nowIso(), id);
      return q('SELECT * FROM bookings WHERE id = ?').get(id);
    },
    rescheduleBooking(id, start_utc, end_utc) {
      q("UPDATE bookings SET start_utc = ?, end_utc = ?, sequence = sequence + 1, reminder_sent = 0 WHERE id = ? AND status = 'confirmed'").run(start_utc, end_utc, id);
      return q('SELECT * FROM bookings WHERE id = ?').get(id);
    },
    markReminderSent: (id) => q('UPDATE bookings SET reminder_sent = 1 WHERE id = ?').run(id),
    bookingsNeedingReminder: (fromIso, toIso) =>
      q("SELECT * FROM bookings WHERE status = 'confirmed' AND reminder_sent = 0 AND start_utc > ? AND start_utc <= ?").all(fromIso, toIso),

    /** Deletes enquiries without an order (and their bookings) last touched before cutoffIso. */
    deleteStaleLeads(cutoffIso) {
      return transaction(() => {
        const stale = "SELECT id FROM leads WHERE status IN ('new', 'contacted', 'offer', 'lost') AND COALESCE(status_changed_at, created_at) < :cutoff";
        q(`DELETE FROM bookings WHERE lead_id IN (${stale}) OR (lead_id IS NULL AND end_utc < :cutoff)`).run({ cutoff: cutoffIso });
        return Number(q(`DELETE FROM leads WHERE id IN (${stale})`).run({ cutoff: cutoffIso }).changes);
      });
    },

    // Admin sessions
    insertSession: (tokenHash, expiresAt) => q('INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)').run(tokenHash, expiresAt),
    getSession: (tokenHash, now) => q('SELECT * FROM sessions WHERE token_hash = ? AND expires_at > ?').get(tokenHash, now),
    deleteSession: (tokenHash) => q('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash),
    deleteExpiredSessions: (now) => q('DELETE FROM sessions WHERE expires_at <= ?').run(now),

    // Statistics
    trackPageview(day, pagePath, referrer) {
      q(`INSERT INTO pageviews (day, path, referrer, views) VALUES (?, ?, ?, 1)
         ON CONFLICT (day, path, referrer) DO UPDATE SET views = views + 1`).run(day, pagePath, referrer);
    },

    close() {
      db.close();
    },
  };
};

/** Writes a consistent copy of the database and deletes backups older than keepDays. */
export const backupDatabase = (db, dir, keepDays, now = new Date()) => {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `westagentur-${now.toISOString().slice(0, 10)}.db`);
  fs.rmSync(file, { force: true });
  db.raw.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);

  const cutoff = now.getTime() - keepDays * 86_400_000;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name.endsWith('.db') && fs.statSync(full).mtimeMs < cutoff) fs.rmSync(full);
  }
  return file;
};
