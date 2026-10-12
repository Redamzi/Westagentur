import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';
import { leadConfirmation } from '../src/templates.js';

let app;
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

beforeEach(async () => {
  app = await startApp({ limit: 3 });
});
afterEach(() => app.stop());

test('stores a lead and sends both mails', async () => {
  const res = await app.request('POST', '/api/contact', payload());
  assert.equal(res.status, 201);
  const lead = app.db.getLead(1);
  assert.equal(lead.email, 'erika@example.de');
  assert.equal(lead.status, 'new');
  assert.equal(lead.notify_sent, 1);
  assert.equal(lead.confirm_sent, 1);
  assert.deepEqual(app.sent.map((m) => m.to).sort(), ['erika@example.de', 'owner@westagentur.de']);
});

test('spam is answered with success but not stored', async () => {
  assert.equal((await app.request('POST', '/api/contact', payload({ website: 'spam' }))).status, 201);
  assert.equal(app.db.getLead(1), undefined);
  assert.equal(app.sent.length, 0);
});

test('invalid input returns field errors', async () => {
  const res = await app.request('POST', '/api/contact', payload({ email: 'x', consent: false }));
  assert.equal(res.status, 400);
  assert.deepEqual((await res.json()).errors, { email: 'invalid', consent: 'required' });
});

test('keeps the lead when mail sending fails', async () => {
  app.mailer.failFor = 'owner@westagentur.de';
  assert.equal((await app.request('POST', '/api/contact', payload())).status, 201);
  assert.equal(app.db.getLead(1).notify_sent, 0);
  assert.equal(app.db.getLead(1).confirm_sent, 1);
});

test('rate limits per client IP', async () => {
  for (let i = 0; i < 3; i++) assert.equal((await app.request('POST', '/api/contact', payload(), { 'X-Real-IP': '1.2.3.4' })).status, 201);
  assert.equal((await app.request('POST', '/api/contact', payload(), { 'X-Real-IP': '1.2.3.4' })).status, 429);
  assert.equal((await app.request('POST', '/api/contact', payload(), { 'X-Real-IP': '5.6.7.8' })).status, 201);
});

test('rejects wrong content type, bad JSON and other methods', async () => {
  assert.equal((await app.request('POST', '/api/contact', 'a=b', { 'Content-Type': 'application/x-www-form-urlencoded' })).status, 415);
  assert.equal((await app.request('POST', '/api/contact', '{nope')).status, 400);
  assert.equal((await app.request('GET', '/api/contact')).status, 405);
  assert.equal((await app.request('GET', '/api/unknown')).status, 404);
  assert.equal((await app.request('GET', '/api/health')).status, 200);
});

test('confirmation mail does not echo the message and escapes the name', () => {
  const mail = leadConfirmation({ name: '<b>Erika</b>', lang: 'de', message: 'BUY CHEAP PILLS' });
  assert.ok(!mail.html.includes('BUY CHEAP PILLS'));
  assert.ok(!mail.text.includes('BUY CHEAP PILLS'));
  assert.ok(mail.html.includes('&lt;b&gt;Erika&lt;/b&gt;'));
});

test('page views are counted without personal data', async () => {
  await app.request('POST', '/api/track', { path: '/webdesign?utm=x', referrer: 'https://www.google.com/search?q=a' });
  await app.request('POST', '/api/track', { path: '/webdesign', referrer: 'https://westagentur.de/' });
  await app.request('POST', '/api/track', { path: '/admin', referrer: '' });
  const rows = app.db.raw.prepare('SELECT path, referrer, views FROM pageviews ORDER BY referrer').all().map((r) => ({ ...r }));
  assert.deepEqual(rows, [
    { path: '/webdesign', referrer: '', views: 1 },
    { path: '/webdesign', referrer: 'google.com', views: 1 },
  ]);
});
