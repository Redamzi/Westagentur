import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

// Monday, 12 Oct 2026, 10:00 in Berlin
const NOW = new Date('2026-10-12T08:00:00.000Z');
const TUE_0900 = '2026-10-13T07:00:00.000Z';
let app;

const booking = (overrides = {}) => ({
  start: TUE_0900,
  name: 'Max Kunde',
  email: 'max@example.de',
  phone: '+49 231 987654',
  company: 'Kunde GmbH',
  service: 'webdesign',
  note: 'Neue Website',
  consent: true,
  website: '',
  startedAt: NOW.getTime() - 10_000,
  lang: 'de',
  ...overrides,
});

beforeEach(async () => {
  app = await startApp({ now: () => NOW });
});
afterEach(() => app.stop());

test('lists free slots respecting availability and minimum notice', async () => {
  const res = await app.request('GET', '/api/slots?days=7');
  const body = await res.json();
  assert.equal(body.timezone, 'Europe/Berlin');
  // Monday is within the 12 h notice, weekend is closed
  assert.deepEqual(body.days.map((d) => d.date), ['2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16']);
  assert.equal(body.days[0].slots[0], TUE_0900);
  assert.equal(body.days[0].slots.length, 16); // 09:00–17:00 in 30 min steps
});

test('books a slot, sends mails with calendar invite and blocks the slot', async () => {
  const res = await app.request('POST', '/api/bookings', booking());
  assert.equal(res.status, 201);
  const { booking: b } = await res.json();
  assert.equal(b.start_utc, TUE_0900);
  assert.equal(b.end_utc, '2026-10-13T07:30:00.000Z');
  assert.equal(b.email, undefined, 'public payload hides contact data');

  const stored = app.db.getBooking(1);
  assert.equal(app.db.getLead(stored.lead_id).source, 'booking');
  assert.equal(app.sent.length, 2);
  const customer = app.sent.find((m) => m.to === 'max@example.de');
  assert.match(customer.text, /Dienstag, 13\. Oktober 2026 um 09:00 Uhr/);
  assert.match(customer.text, /\/termin\/verwalten\?t=/);
  assert.match(customer.attachments[0].content, /DTSTART:20261013T070000Z/);

  const slots = await (await app.request('GET', '/api/slots?from=2026-10-13&days=1')).json();
  assert.ok(!slots.days[0].slots.includes(TUE_0900));
  assert.equal((await app.request('POST', '/api/bookings', booking({ email: 'other@example.de' }))).status, 409);
});

test('rejects slots outside availability and requires a phone number', async () => {
  assert.equal((await app.request('POST', '/api/bookings', booking({ start: '2026-10-17T08:00:00.000Z' }))).status, 409); // Saturday
  assert.equal((await app.request('POST', '/api/bookings', booking({ start: '2026-10-12T12:00:00.000Z' }))).status, 409); // too soon
  const res = await app.request('POST', '/api/bookings', booking({ phone: '' }));
  assert.equal(res.status, 400);
  assert.deepEqual((await res.json()).errors, { phone: 'required' });
});

test('manage link: show, reschedule and cancel', async () => {
  await app.request('POST', '/api/bookings', booking());
  const { token } = app.db.getBooking(1);
  app.sent.length = 0;

  const show = await (await app.request('GET', `/api/bookings/${token}`)).json();
  assert.equal(show.booking.status, 'confirmed');

  const moved = await app.request('POST', `/api/bookings/${token}/reschedule`, { start: '2026-10-14T08:00:00.000Z' });
  assert.equal(moved.status, 200);
  assert.equal(app.db.getBooking(1).sequence, 1);
  assert.match(app.sent[0].attachments[0].content, /SEQUENCE:1/);

  const cancelled = await app.request('POST', `/api/bookings/${token}/cancel`, {});
  assert.equal((await cancelled.json()).booking.status, 'cancelled');
  assert.match(app.sent.at(-1).attachments[0].content, /METHOD:CANCEL/);
  assert.equal((await app.request('POST', `/api/bookings/${token}/cancel`, {})).status, 409);
  assert.equal((await app.request('GET', '/api/bookings/wrong-token')).status, 404);

  // the slot is free again
  const slots = await (await app.request('GET', '/api/slots?from=2026-10-14&days=1')).json();
  assert.ok(slots.days[0].slots.includes('2026-10-14T08:00:00.000Z'));
});

test('blocked times are not offered', async () => {
  app.db.insertBlock({ start_utc: '2026-10-13T00:00:00.000Z', end_utc: '2026-10-14T00:00:00.000Z', reason: 'Urlaub' });
  const slots = await (await app.request('GET', '/api/slots?from=2026-10-13&days=2')).json();
  assert.deepEqual(slots.days.map((d) => d.date), ['2026-10-14']);
});
