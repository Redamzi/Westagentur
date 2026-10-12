const bool = (value, fallback) => (value === undefined || value === '' ? fallback : value === 'true');

export const loadConfig = (env = process.env) => ({
  port: Number(env.API_PORT || 8787),
  host: env.API_HOST || '127.0.0.1',
  dataDir: env.DATA_DIR || './data',
  backupKeepDays: Number(env.BACKUP_KEEP_DAYS || 14),
  rateLimit: {
    limit: Number(env.RATE_LIMIT_MAX || 5),
    windowMs: Number(env.RATE_LIMIT_WINDOW_MIN || 60) * 60_000,
  },
  smtp: {
    host: env.SMTP_HOST || '',
    port: Number(env.SMTP_PORT || 587),
    secure: bool(env.SMTP_SECURE, Number(env.SMTP_PORT) === 465),
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
  },
  mail: {
    from: env.MAIL_FROM || 'Westagentur <mail@westagentur.de>',
    to: env.MAIL_TO || 'mail@westagentur.de',
  },
});
