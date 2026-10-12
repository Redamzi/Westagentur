import http from 'node:http';
import path from 'node:path';
import { loadConfig } from './src/config.js';
import { openDatabase, backupDatabase } from './src/db.js';
import { createMailer } from './src/mail.js';
import { createRateLimiter } from './src/rateLimit.js';
import { createApp } from './src/app.js';

const config = loadConfig();
const db = openDatabase(path.join(config.dataDir, 'westagentur.db'));
const mailer = createMailer(config);
const limiter = createRateLimiter(config.rateLimit);

const server = http.createServer(createApp({ db, mailer, limiter }));
server.listen(config.port, config.host, () => {
  console.info(`[api] listening on http://${config.host}:${config.port}`);
});

mailer.verify()?.then(
  () => console.info('[mail] SMTP connection ok'),
  (err) => console.error('[mail] SMTP connection failed:', err.message)
);

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
