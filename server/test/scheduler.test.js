import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/db.js';
import { createServices } from '../src/services.js';
import { createScheduler } from '../src/scheduler.js';
import { loadConfig } from '../src/config.js';
import { silent } from './helpers.js';

const setup = (nowIso) => {
  let now = new Date(nowIso);
  const db = openDatabase(':memory:');
  const sent = [];
  const mailer = { owner: 'owner@westagentur.de', async send(m) { sent.push(m); } };
  const config = loadConfig({ DIGEST_HOUR: '7' });
  const services = createServices({ db, mailer, config, logger: silent, now: () => now });
  const scheduler = createScheduler({ db, mailer, services, config, logger: silent, now: () => now });
  return { db, sent, scheduler, setNow: (iso) => (now = new Date(iso)) };
};

const insertBooking = (db, { start, created }) => {
  const id = db.insertBooking({ token: `t${start}`, start_utc: start, end_utc: start, name: 'Max', email: 'max@example.de', phone: '0231 1', lang: 'de' });
  db.raw.prepare('UPDATE bookings SET created_at = ? WHERE id = ?').run(created, id);
  return id;
};

test('reminders 24 h before, skipped for short-notice bookings', async () => {
  const { db, sent, scheduler } = setup('2026-10-12T08:00:00Z');
  const early = insertBooking(db, { start: '2026-10-13T07:00:00.000Z', created: '2026-10-01T00:00:00.000Z' });
  const late = insertBooking(db, { start: '2026-10-13T06:00:00.000Z', created: '2026-10-12T07:00:00.000Z' });
  const far = insertBooking(db, { start: '2026-10-20T07:00:00.000Z', created: '2026-10-01T00:00:00.000Z' });
  await scheduler.reminders();
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /Erinnerung/);
  assert.equal(db.getBooking(early).reminder_sent, 1);
  assert.equal(db.getBooking(late).reminder_sent, 1);
  assert.equal(db.getBooking(far).reminder_sent, 0);
  await scheduler.reminders();
  assert.equal(sent.length, 1, 'no duplicates');
});

test('offer follow-ups after 2 and 7 days, stop when status changes', async () => {
  const { db, sent, scheduler, setNow } = setup('2026-10-01T10:00:00Z');
  const id = db.insertLead({ name: 'Kunde', email: 'k@example.de' });
  db.updateLead(id, { status: 'offer' }, '2026-10-01T10:00:00.000Z');

  setNow('2026-10-02T10:00:00Z');
  await scheduler.followUps();
  assert.equal(sent.length, 0);

  setNow('2026-10-03T11:00:00Z');
  await scheduler.followUps();
  assert.equal(sent.length, 1);

  setNow('2026-10-09T11:00:00Z');
  await scheduler.followUps();
  await scheduler.followUps();
  assert.equal(sent.length, 2);

  const other = db.insertLead({ name: 'B', email: 'b@example.de' });
  db.updateLead(other, { status: 'offer' }, '2026-10-01T10:00:00.000Z');
  db.updateLead(other, { status: 'won' }, '2026-10-02T10:00:00.000Z');
  setNow('2026-10-30T11:00:00Z');
  await scheduler.followUps();
  assert.equal(sent.length, 2);
});

test('daily digest once per day after the configured hour', async () => {
  const { db, sent, scheduler, setNow } = setup('2026-10-12T04:00:00Z'); // 06:00 Berlin
  db.insertLead({ name: 'Neu', email: 'n@example.de' });
  await scheduler.digest();
  assert.equal(sent.length, 0);
  setNow('2026-10-12T05:30:00Z'); // 07:30 Berlin
  await scheduler.digest();
  await scheduler.digest();
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /1 offene Anfragen/);
});

test('deletes enquiries without an order after 12 months, keeps orders', async () => {
  const { db, scheduler } = setup('2027-12-01T10:00:00Z');
  const old = db.insertLead({ name: 'Alt', email: 'a@example.de' });
  db.raw.prepare("UPDATE leads SET created_at = '2026-10-01T00:00:00.000Z', status_changed_at = '2026-10-01T00:00:00.000Z' WHERE id = ?").run(old);
  const bookingId = db.insertBooking({ token: 'x', lead_id: old, start_utc: '2026-10-05T08:00:00.000Z', end_utc: '2026-10-05T08:30:00.000Z', name: 'Alt', email: 'a@example.de' });
  const won = db.insertLead({ name: 'Kunde', email: 'k@example.de' });
  db.updateLead(won, { status: 'won' }, '2026-10-01T00:00:00.000Z');
  const recent = db.insertLead({ name: 'Neu', email: 'n@example.de' });
  db.raw.prepare("UPDATE leads SET created_at = '2027-11-01T00:00:00.000Z', status_changed_at = '2027-11-01T00:00:00.000Z' WHERE id = ?").run(recent);

  await scheduler.retention();
  assert.equal(db.getLead(old), undefined);
  assert.equal(db.getBooking(bookingId), undefined);
  assert.ok(db.getLead(won));
  assert.ok(db.getLead(recent));
});
