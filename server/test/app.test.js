import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';
import { createRateLimiter } from '../src/rateLimit.js';
import { confirmationMail } from '../src/mail.js';

const silent = { info() {}, warn() {}, error() {} };
let server, base, db, sent, limiter, mailFails;

const payload = (overrides = {}) => ({
  name: 'Erika Muster',
  email: 'erika@example.de',
  service: 'automation',
  message: 'Bitte melden Sie sich bei mir.',
  consent: true,
  website: '',
  startedAt: Date.now() - 10_000,
  lang: 'de',
  ...overrides,
});

const post = (body, headers = {}) =>
  fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

beforeEach(async () => {
  db = openDatabase(':memory:');
  sent = [];
  mailFails = false;
  const mailer = {
    sendNotification: async (lead, id) => {
      if (mailFails) throw new Error('smtp down');
      sent.push({ kind: 'notify', to: 'owner', id });
    },
    sendConfirmation: async (lead) => sent.push({ kind: 'confirm', to: lead.email }),
  };
  limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
  server = http.createServer(createApp({ db, mailer, limiter, logger: silent }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  limiter.stop();
  await new Promise((resolve) => server.close(resolve));
  db.close();
});

test('stores a lead and sends both mails', async () => {
  const res = await post(payload());
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { ok: true });
  const lead = db.getLead(1);
  assert.equal(lead.email, 'erika@example.de');
  assert.equal(lead.status, 'new');
  assert.equal(lead.notify_sent, 1);
  assert.equal(lead.confirm_sent, 1);
  assert.deepEqual(sent.map((m) => m.kind).sort(), ['confirm', 'notify']);
});

test('spam is answered with success but not stored', async () => {
  const res = await post(payload({ website: 'spam' }));
  assert.equal(res.status, 201);
  assert.equal(db.getLead(1), undefined);
  assert.equal(sent.length, 0);
});

test('invalid input returns field errors', async () => {
  const res = await post(payload({ email: 'x', consent: false }));
  assert.equal(res.status, 400);
  assert.deepEqual((await res.json()).errors, { email: 'invalid', consent: 'required' });
});

test('keeps the lead when mail sending fails', async () => {
  mailFails = true;
  const res = await post(payload());
  assert.equal(res.status, 201);
  assert.equal(db.getLead(1).notify_sent, 0);
  assert.equal(db.getLead(1).confirm_sent, 1);
});

test('rate limits per client IP', async () => {
  for (let i = 0; i < 3; i++) assert.equal((await post(payload(), { 'X-Real-IP': '1.2.3.4' })).status, 201);
  assert.equal((await post(payload(), { 'X-Real-IP': '1.2.3.4' })).status, 429);
  assert.equal((await post(payload(), { 'X-Real-IP': '5.6.7.8' })).status, 201);
});

test('rejects wrong content type, bad JSON and other methods', async () => {
  assert.equal((await post('a=b', { 'Content-Type': 'application/x-www-form-urlencoded' })).status, 415);
  assert.equal((await post('{nope')).status, 400);
  assert.equal((await fetch(`${base}/api/contact`)).status, 405);
  assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
});

test('confirmation mail does not echo the message and escapes the name', () => {
  const mail = confirmationMail({ name: '<b>Erika</b>', lang: 'de', message: 'BUY CHEAP PILLS' });
  assert.ok(!mail.html.includes('BUY CHEAP PILLS'));
  assert.ok(!mail.text.includes('BUY CHEAP PILLS'));
  assert.ok(mail.html.includes('&lt;b&gt;Erika&lt;/b&gt;'));
});
