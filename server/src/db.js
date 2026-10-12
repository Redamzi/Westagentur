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
];

/** Opens the SQLite database (":memory:" for tests) and applies pending migrations. */
export const openDatabase = (file) => {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const version = db.prepare('PRAGMA user_version').get().user_version;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.exec('BEGIN');
    db.exec(MIGRATIONS[i]);
    db.exec(`PRAGMA user_version = ${i + 1}`);
    db.exec('COMMIT');
  }

  const insert = db.prepare(`
    INSERT INTO leads (source, name, email, phone, company, service, message, page, lang)
    VALUES (:source, :name, :email, :phone, :company, :service, :message, :page, :lang)
  `);
  const markMail = {
    notify: db.prepare('UPDATE leads SET notify_sent = 1 WHERE id = ?'),
    confirm: db.prepare('UPDATE leads SET confirm_sent = 1 WHERE id = ?'),
  };

  return {
    raw: db,
    insertLead(lead) {
      return Number(insert.run({ source: 'contact_form', ...lead }).lastInsertRowid);
    },
    markMailSent(id, kind) {
      markMail[kind].run(id);
    },
    getLead(id) {
      return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
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
