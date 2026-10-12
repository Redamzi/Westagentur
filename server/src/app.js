import { validateContact } from './validate.js';

const MAX_BODY_BYTES = 20_000;

class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
      reject(new HttpError(415, 'unsupported_media_type'));
      return;
    }
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'payload_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'invalid_json'));
      }
    });
    req.on('error', reject);
  });

// nginx sets X-Real-IP; fall back to the socket address when running standalone.
const clientIp = (req) => String(req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown');

/** Creates the request handler. Dependencies are injected so the API can be tested in isolation. */
export const createApp = ({ db, mailer, limiter, logger = console, now = Date.now }) => {
  const handleContact = async (req, res) => {
    if (!limiter.hit(clientIp(req))) return sendJson(res, 429, { ok: false, error: 'rate_limited' });

    const result = validateContact(await readJson(req), now());
    if (result.spam) return sendJson(res, 201, { ok: true });
    if (result.errors) return sendJson(res, 400, { ok: false, errors: result.errors });

    const lead = result.data;
    const id = db.insertLead(lead);
    logger.info(`[contact] lead #${id} saved (${lead.service})`);

    // The lead is stored either way; mail problems must not fail the request.
    const [notify, confirm] = await Promise.allSettled([
      mailer.sendNotification(lead, id),
      mailer.sendConfirmation(lead),
    ]);
    if (notify.status === 'fulfilled') db.markMailSent(id, 'notify');
    else logger.error(`[contact] notification for #${id} failed:`, notify.reason?.message);
    if (confirm.status === 'fulfilled') db.markMailSent(id, 'confirm');
    else logger.error(`[contact] confirmation for #${id} failed:`, confirm.reason?.message);

    return sendJson(res, 201, { ok: true });
  };

  return async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    try {
      if (pathname === '/api/health' && req.method === 'GET') return sendJson(res, 200, { ok: true });
      if (pathname === '/api/contact') {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
        return await handleContact(req, res);
      }
      return sendJson(res, 404, { ok: false, error: 'not_found' });
    } catch (err) {
      if (err instanceof HttpError) return sendJson(res, err.status, { ok: false, error: err.code });
      logger.error('[api] unexpected error:', err);
      return sendJson(res, 500, { ok: false, error: 'server_error' });
    }
  };
};
