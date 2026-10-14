import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

let app;
beforeEach(async () => {
  app = await startApp({ env: { GOOGLE_REVIEW_URL: 'https://g.page/r/test/review' } });
});
afterEach(() => app.stop());

const login = async (password = 'geheim') => {
  const res = await app.request('POST', '/api/admin/login', { password });
  return { res, cookie: res.headers.get('set-cookie')?.split(';')[0] };
};

test('admin endpoints require a session', async () => {
  assert.equal((await app.request('GET', '/api/admin/leads')).status, 401);
  assert.equal((await app.request('GET', '/api/admin/me', undefined, { Cookie: 'wa_admin=forged' })).status, 401);
});

test('login sets a strict HttpOnly cookie, logout ends the session', async () => {
  assert.equal((await login('falsch')).res.status, 401);
  const { res, cookie } = await login();
  assert.equal(res.status, 200);
  assert.match(res.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  assert.equal((await app.request('GET', '/api/admin/me', undefined, { Cookie: cookie })).status, 200);
  await app.request('POST', '/api/admin/logout', {}, { Cookie: cookie });
  assert.equal((await app.request('GET', '/api/admin/me', undefined, { Cookie: cookie })).status, 401);
});

test('login is rate limited', async () => {
  for (let i = 0; i < 3; i++) await login('falsch');
  assert.equal((await login()).res.status, 429);
});

test('leads can be updated; completing a project sends a review request', async () => {
  const id = app.db.insertLead({ name: 'Kunde', email: 'k@example.de', service: 'webdesign' });
  const { cookie } = await login();
  const patch = (body) => app.request('PATCH', `/api/admin/leads/${id}`, body, { Cookie: cookie });

  assert.equal((await patch({ status: 'bogus' })).status, 400);
  const res = await patch({ status: 'offer', notes: 'Angebot 3.200 €' });
  assert.equal((await res.json()).lead.notes, 'Angebot 3.200 €');
  assert.equal(app.sent.length, 0);

  await patch({ status: 'completed' });
  assert.equal(app.sent.length, 1);
  assert.match(app.sent[0].text, /g\.page\/r\/test\/review/);
  assert.equal(app.db.getLead(id).review_sent, 1);
});

test('availability and blocks can be managed', async () => {
  const { cookie } = await login();
  const put = await app.request('PUT', '/api/admin/settings', {
    settings: { slotMinutes: 60, minNoticeHours: 24 },
    availability: [{ weekday: 2, start_min: 600, end_min: 720 }],
  }, { Cookie: cookie });
  const body = await put.json();
  assert.equal(body.settings.slotMinutes, 60);
  assert.deepEqual(body.availability, [{ weekday: 2, start_min: 600, end_min: 720 }]);

  const bad = await app.request('PUT', '/api/admin/settings', { availability: [{ weekday: 9, start_min: 1, end_min: 0 }] }, { Cookie: cookie });
  assert.equal(bad.status, 400);

  const block = await app.request('POST', '/api/admin/blocks', { start: '2030-01-01T00:00:00Z', end: '2030-01-02T00:00:00Z', reason: 'Urlaub' }, { Cookie: cookie });
  const { id } = await block.json();
  assert.equal((await app.request('DELETE', `/api/admin/blocks/${id}`, undefined, { Cookie: cookie })).status, 200);
});

test('stats summarise leads and page views', async () => {
  app.db.insertLead({ name: 'A', email: 'a@example.de', service: 'webdesign' });
  await app.request('POST', '/api/track', { path: '/', referrer: '' });
  await app.request('POST', '/api/track', { path: '/', referrer: '' });
  const { cookie } = await login();
  const stats = await (await app.request('GET', '/api/admin/stats?days=7', undefined, { Cookie: cookie })).json();
  assert.equal(stats.views, 2);
  assert.equal(stats.leads, 1);
  assert.equal(stats.conversionRate, 0.5);
});

test('lead list includes the appointment of the lead', async () => {
  const leadId = app.db.insertLead({ source: 'phone', name: 'Toni Test', email: '', service: 'webdesign', message: 'Neue Website' });
  app.db.insertBooking({ token: 'tok', lead_id: leadId, start_utc: '2030-01-07T08:00:00.000Z', end_utc: '2030-01-07T08:30:00.000Z', name: 'Toni Test', email: '' });
  const { cookie } = await login();
  const { leads } = await (await app.request('GET', '/api/admin/leads', undefined, { Cookie: cookie })).json();
  assert.equal(leads[0].booking_start, '2030-01-07T08:00:00.000Z');
  assert.equal(leads[0].booking_status, 'confirmed');
});
