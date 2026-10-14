import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

let app;
afterEach(() => app?.stop());

const fakeVapi = (reply, status = 200) => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return new Response(JSON.stringify(reply), { status, headers: { 'Content-Type': 'application/json' } });
  };
  return { calls, fetchImpl };
};

test('chat is disabled without an API key', async () => {
  app = await startApp();
  assert.equal((await app.request('POST', '/api/chat', { input: 'Hallo' })).status, 503);
});

test('chat forwards the message with the private key and returns the reply', async () => {
  const vapi = fakeVapi({ id: 'chat_2', output: [{ role: 'assistant', content: 'Hallo, hier ist Toni.' }] });
  app = await startApp({ env: { VAPI_API_KEY: 'private-key' }, fetchImpl: vapi.fetchImpl });

  const res = await app.request('POST', '/api/chat', { input: 'Hallo', chatId: 'chat_1' });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, chatId: 'chat_2', reply: 'Hallo, hier ist Toni.' });

  const [call] = vapi.calls;
  assert.equal(call.url, 'https://api.vapi.ai/chat');
  assert.equal(call.init.headers.Authorization, 'Bearer private-key');
  assert.deepEqual(call.body, { assistantId: app.config.vapiAssistantId, input: 'Hallo', previousChatId: 'chat_1' });
});

test('chat validates input and hides Vapi errors', async () => {
  const vapi = fakeVapi({ error: 'bad key' }, 401);
  app = await startApp({ env: { VAPI_API_KEY: 'private-key' }, fetchImpl: vapi.fetchImpl });
  assert.equal((await app.request('POST', '/api/chat', { input: '   ' })).status, 400);

  const res = await app.request('POST', '/api/chat', { input: 'Hallo', chatId: '../evil' });
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { ok: false, error: 'chat_failed' });
  assert.equal(vapi.calls[0].body.previousChatId, undefined);
});

test('chat reads text parts and logs empty replies', async () => {
  const parts = fakeVapi({ id: 'c', output: [{ role: 'assistant', content: [{ type: 'text', text: 'Hallo!' }] }] });
  app = await startApp({ env: { VAPI_API_KEY: 'k' }, fetchImpl: parts.fetchImpl });
  assert.equal((await (await app.request('POST', '/api/chat', { input: 'Hi' })).json()).reply, 'Hallo!');
  await app.stop();

  const empty = fakeVapi({ id: 'c', output: [] });
  app = await startApp({ env: { VAPI_API_KEY: 'k' }, fetchImpl: empty.fetchImpl });
  assert.equal((await app.request('POST', '/api/chat', { input: 'Hi' })).status, 502);
});
