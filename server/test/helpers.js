import http from 'node:http';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';
import { createRateLimiter } from '../src/rateLimit.js';
import { createServices } from '../src/services.js';
import { loadConfig } from '../src/config.js';

export const silent = { info() {}, warn() {}, error() {} };

/** Starts the API on a random port with an in-memory DB and a recording mailer. */
export const startApp = async ({ now = () => new Date(), env = {}, limit = 50 } = {}) => {
  const config = loadConfig({ ADMIN_PASSWORD: 'geheim', SECURE_COOKIES: 'false', VAPI_WEBHOOK_SECRET: 'vapi-secret', ...env });
  const db = openDatabase(':memory:');
  const sent = [];
  const mailer = {
    owner: 'owner@westagentur.de',
    failFor: null,
    async send(message) {
      if (this.failFor && message.to === this.failFor) throw new Error('smtp down');
      sent.push(message);
    },
  };
  const services = createServices({ db, mailer, config, logger: silent, now });
  const limiters = {
    contact: createRateLimiter({ limit, windowMs: 60_000 }),
    booking: createRateLimiter({ limit, windowMs: 60_000 }),
    login: createRateLimiter({ limit: 3, windowMs: 60_000 }),
    track: createRateLimiter({ limit: 1000, windowMs: 60_000 }),
  };
  const server = http.createServer(createApp({ db, services, config, limiters, logger: silent, now }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const request = (method, path, body, headers = {}) =>
    fetch(base + path, {
      method,
      headers: body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });

  const stop = async () => {
    Object.values(limiters).forEach((l) => l.stop());
    await new Promise((resolve) => server.close(resolve));
    db.close();
  };

  return { db, sent, mailer, services, config, request, stop };
};
