import http from 'node:http';
import path from 'node:path';
import { loadConfig } from './src/config.js';
import { openDatabase, backupDatabase } from './src/db.js';
import { createMailer } from './src/mail.js';
import { createRateLimiter } from './src/rateLimit.js';
import { createServices } from './src/services.js';
import { createScheduler } from './src/scheduler.js';
import { createApp } from './src/app.js';

const config = loadConfig();
const db = openDatabase(path.join(config.dataDir, 'westagentur.db'));
const mailer = createMailer(config);
const services = createServices({ db, mailer, config });
const limiters = {
  contact: createRateLimiter(config.rateLimit),
  booking: createRateLimiter(config.rateLimit),
  login: createRateLimiter({ limit: 5, windowMs: 15 * 60_000 }),
  track: createRateLimiter({ limit: 300, windowMs: 60 * 60_000 }),
  chat: createRateLimiter({ limit: 60, windowMs: 60 * 60_000 }),
};

const server = http.createServer(createApp({ db, services, config, limiters }));
server.listen(config.port, config.host, () => {
  console.info(`[api] listening on http://${config.host}:${config.port}`);
  if (!config.adminPassword) console.warn('[admin] ADMIN_PASSWORD not set – admin area disabled');
  if (!config.vapiSecret) console.warn('[vapi] VAPI_WEBHOOK_SECRET not set – Vapi webhook disabled');
  if (!config.vapiApiKey) console.warn('[chat] VAPI_API_KEY not set – website chat disabled');
});

mailer.verify()?.then(
  () => console.info('[mail] SMTP connection ok'),
  (err) => console.error('[mail] SMTP connection failed:', err.message)
);

// Automations every 5 minutes
const scheduler = createScheduler({ db, mailer, services, config });
setTimeout(() => scheduler.tick(), 10_000).unref();
setInterval(() => scheduler.tick(), 5 * 60_000).unref();

// Daily backup, first one shortly after start.
const runBackup = () => {
  try {
    const file = backupDatabase(db, path.join(config.dataDir, 'backups'), config.backupKeepDays);
    console.info(`[backup] written ${file}`);
  } catch (err) {
    console.error('[backup] failed:', err.message);
  }
};
setTimeout(runBackup, 60_000).unref();
setInterval(runBackup, 24 * 60 * 60_000).unref();

const shutdown = () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
