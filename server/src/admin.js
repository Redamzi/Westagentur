import crypto from 'node:crypto';
import { parseCookies } from './http.js';

export const SESSION_COOKIE = 'wa_admin';
const SESSION_DAYS = 7;

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest();

/** Constant-time password check (hashing first equalises the lengths). */
export const passwordMatches = (given, expected) =>
  Boolean(expected) && crypto.timingSafeEqual(sha256(given), sha256(expected));

export const createSessions = ({ db, config, now = Date.now }) => {
  const cookie = (value, maxAge) =>
    [
      `${SESSION_COOKIE}=${value}`,
      'Path=/api/admin',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${maxAge}`,
      ...(config.secureCookies ? ['Secure'] : []),
    ].join('; ');

  return {
    create() {
      const token = crypto.randomBytes(32).toString('base64url');
      db.insertSession(sha256(token).toString('hex'), now() + SESSION_DAYS * 86_400_000);
      return cookie(token, SESSION_DAYS * 86_400);
    },
    destroy(req) {
      const token = parseCookies(req)[SESSION_COOKIE];
      if (token) db.deleteSession(sha256(token).toString('hex'));
      return cookie('', 0);
    },
    isValid(req) {
      const token = parseCookies(req)[SESSION_COOKIE];
      return Boolean(token && db.getSession(sha256(token).toString('hex'), now()));
    },
  };
};

/** Key figures for the admin dashboard. */
export const getStats = (db, { days = 30, now = new Date() } = {}) => {
  const since = new Date(now.getTime() - days * 86_400_000).toISOString();
  const sinceDay = since.slice(0, 10);
  const all = (sql, ...params) => db.raw.prepare(sql).all(...params);
  const get = (sql, ...params) => db.raw.prepare(sql).get(...params);

  const views = get('SELECT COALESCE(SUM(views), 0) AS n FROM pageviews WHERE day >= ?', sinceDay).n;
  const leads = get('SELECT COUNT(*) AS n FROM leads WHERE created_at >= ?', since).n;

  return {
    days,
    views,
    leads,
    conversionRate: views ? leads / views : 0,
    bookingsUpcoming: get("SELECT COUNT(*) AS n FROM bookings WHERE status = 'confirmed' AND start_utc >= ?", now.toISOString()).n,
    bookingsInPeriod: get("SELECT COUNT(*) AS n FROM bookings WHERE created_at >= ?", since).n,
    leadsBySource: all('SELECT source AS key, COUNT(*) AS n FROM leads WHERE created_at >= ? GROUP BY source ORDER BY n DESC', since),
    leadsByService: all('SELECT service AS key, COUNT(*) AS n FROM leads WHERE created_at >= ? GROUP BY service ORDER BY n DESC', since),
    leadsByStatus: all('SELECT status AS key, COUNT(*) AS n FROM leads GROUP BY status ORDER BY n DESC'),
    viewsPerDay: all('SELECT day AS key, SUM(views) AS n FROM pageviews WHERE day >= ? GROUP BY day ORDER BY day', sinceDay),
    leadsPerDay: all("SELECT substr(created_at, 1, 10) AS key, COUNT(*) AS n FROM leads WHERE created_at >= ? GROUP BY key ORDER BY key", since),
    topPages: all('SELECT path AS key, SUM(views) AS n FROM pageviews WHERE day >= ? GROUP BY path ORDER BY n DESC LIMIT 10', sinceDay),
    topReferrers: all("SELECT referrer AS key, SUM(views) AS n FROM pageviews WHERE day >= ? AND referrer != '' GROUP BY referrer ORDER BY n DESC LIMIT 10", sinceDay),
  };
};
