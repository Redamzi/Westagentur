import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

const NOW = new Date('2026-10-12T08:00:00.000Z');
let app;
beforeEach(async () => {
  app = await startApp({ now: () => NOW });
});
afterEach(() => app.stop());

const vapi = (message, secret = 'vapi-secret') => app.request('POST', '/api/vapi', { message }, { 'x-vapi-secret': secret });

test('rejects requests without the shared secret', async () => {
  assert.equal((await vapi({ type: 'end-of-call-report' }, 'wrong')).status, 401);
});

test('tool calls: free slots and booking during the call', async () => {
  const call = { id: 'call-1', customer: { number: '+4923112345' } };
  const slots = await (await vapi({
    type: 'tool-calls',
    call,
    toolCallList: [{ id: 't1', function: { name: 'get_free_slots', arguments: {} } }],
  })).json();
  assert.match(slots.results[0].result, /Dienstag, 13\. Oktober 2026 um 09:00 Uhr \(2026-10-13T07:00:00\.000Z\)/);

  const booked = await (await vapi({
    type: 'tool-calls',
    call,
    toolCallList: [{ id: 't2', function: { name: 'book_appointment', arguments: JSON.stringify({ start: '2026-10-13T07:00:00.000Z', name: 'Anna Anruf' }) } }],
  })).json();
  assert.equal(booked.results[0].toolCallId, 't2');
  assert.match(booked.results[0].result, /Termin gebucht/);
  const b = app.db.getBooking(1);
  assert.equal(b.source, 'phone');
  assert.equal(b.phone, '+4923112345');

  const again = await (await vapi({
    type: 'tool-calls',
    call,
    toolCallList: [{ id: 't3', function: { name: 'book_appointment', arguments: { start: '2026-10-13T07:00:00.000Z', name: 'Anna Anruf' } } }],
  })).json();
  assert.match(again.results[0].result, /nicht frei/);

  // End of the same call adds the summary to the existing lead instead of a new one
  await vapi({ type: 'end-of-call-report', call, analysis: { summary: 'Möchte Website.' } });
  const leads = app.db.listLeads();
  assert.equal(leads.length, 1);
  assert.match(leads[0].message, /Möchte Website\./);
});

test('end-of-call report creates a phone lead and notifies only the owner', async () => {
  await vapi({
    type: 'end-of-call-report',
    call: { id: 'call-2', customer: { number: '+49 170 1234567' } },
    analysis: { summary: 'Interesse an KI-Telefonie für Praxis.', structuredData: { name: 'Dr. Weber', service: 'telephony' } },
  });
  const [lead] = app.db.listLeads();
  assert.equal(lead.source, 'phone');
  assert.equal(lead.name, 'Dr. Weber');
  assert.equal(lead.phone, '+49 170 1234567');
  assert.deepEqual(app.sent.map((m) => m.to), ['owner@westagentur.de']);
});
