import { HttpError, clientIp, createRouter, readJson, sendJson } from './http.js';
import { LEAD_STATUSES, line, text, validateBooking, validateContact } from './validate.js';
import { computeSlots } from './slots.js';
import { SlotTakenError } from './services.js';
import { createSessions, getStats, passwordMatches } from './admin.js';
import { createVapiHandler, vapiSecretMatches } from './vapi.js';
import { isLocalDate } from './time.js';

const PUBLIC_BOOKING_FIELDS = ['start_utc', 'end_utc', 'status', 'name', 'service', 'lang'];
const publicBooking = (b) => Object.fromEntries(PUBLIC_BOOKING_FIELDS.map((k) => [k, b[k]]));

// Paths that are not counted in the statistics.
const UNTRACKED = /^\/(admin|termin\/verwalten|en\/appointment\/manage)(\/|$)/;

/**
 * Creates the request handler. Dependencies are injected so the API can be tested in isolation.
 * limiters: { contact, booking, login, track }
 */
export const createApp = ({ db, services, config, limiters, logger = console, now = () => new Date() }) => {
  const sessions = createSessions({ db, config, now: () => now().getTime() });
  const vapi = createVapiHandler({ db, services, logger, now });

  const limit = (limiter, req) => {
    if (!limiter.hit(clientIp(req))) throw new HttpError(429, 'rate_limited');
  };
  const requireAdmin = (req) => {
    if (!sessions.isValid(req)) throw new HttpError(401, 'unauthorized');
  };
  const bookingByToken = (token) => {
    const booking = db.getBookingByToken(token);
    if (!booking) throw new HttpError(404, 'not_found');
    return booking;
  };
  const created = (res, payload = {}) => sendJson(res, 201, { ok: true, ...payload });

  const routes = [
    ['GET', '/api/health', (ctx) => sendJson(ctx.res, 200, { ok: true })],

    // ---------------------------------------------------------- website
    ['POST', '/api/contact', async ({ req, res }) => {
      limit(limiters.contact, req);
      const result = validateContact(await readJson(req), now().getTime());
      if (result.spam) return created(res);
      if (result.errors) return sendJson(res, 400, { ok: false, errors: result.errors });
      await services.createLead({ source: 'contact_form', ...result.data });
      return created(res);
    }],

    ['GET', '/api/slots', ({ res, url }) => {
      const from = url.searchParams.get('from');
      const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 14, 1), 31);
      return sendJson(res, 200, computeSlots(db, { from: isLocalDate(from) ? from : undefined, days, now: now() }));
    }],

    ['POST', '/api/bookings', async ({ req, res }) => {
      limit(limiters.booking, req);
      const result = validateBooking(await readJson(req), now().getTime());
      if (result.spam) return created(res);
      if (result.errors) return sendJson(res, 400, { ok: false, errors: result.errors });
      try {
        const booking = await services.book(result.data);
        return created(res, { booking: publicBooking(booking) });
      } catch (err) {
        if (err instanceof SlotTakenError) return sendJson(res, 409, { ok: false, error: 'slot_taken' });
        throw err;
      }
    }],

    ['GET', '/api/bookings/:token', ({ res, params }) =>
      sendJson(res, 200, { ok: true, booking: publicBooking(bookingByToken(params.token)) })],

    ['POST', '/api/bookings/:token/cancel', async ({ res, params }) => {
      const booking = bookingByToken(params.token);
      if (booking.status !== 'confirmed') return sendJson(res, 409, { ok: false, error: 'not_active' });
      return sendJson(res, 200, { ok: true, booking: publicBooking(await services.cancel(booking)) });
    }],

    ['POST', '/api/bookings/:token/reschedule', async ({ req, res, params }) => {
      limit(limiters.booking, req);
      const booking = bookingByToken(params.token);
      if (booking.status !== 'confirmed') return sendJson(res, 409, { ok: false, error: 'not_active' });
      const { start } = await readJson(req);
      if (Number.isNaN(Date.parse(start))) return sendJson(res, 400, { ok: false, errors: { start: 'invalid' } });
      try {
        return sendJson(res, 200, { ok: true, booking: publicBooking(await services.reschedule(booking, start)) });
      } catch (err) {
        if (err instanceof SlotTakenError) return sendJson(res, 409, { ok: false, error: 'slot_taken' });
        throw err;
      }
    }],

    // Cookieless page view counter: no IP, no ID – only day, path and referring host.
    ['POST', '/api/track', async ({ req, res }) => {
      limit(limiters.track, req);
      const body = await readJson(req);
      const path = line(body.path, 200).split(/[?#]/)[0];
      if (path.startsWith('/') && !UNTRACKED.test(path)) {
        let referrer = '';
        try {
          const host = new URL(text(body.referrer, 500)).hostname.replace(/^www\./, '');
          if (host && !config.publicUrl.includes(host)) referrer = host;
        } catch {
          // no or invalid referrer
        }
        db.trackPageview(now().toISOString().slice(0, 10), path, referrer);
      }
      res.writeHead(204).end();
    }],

    // ---------------------------------------------------------- Vapi
    ['POST', '/api/vapi', async ({ req, res }) => {
      if (!config.vapiSecret) throw new HttpError(503, 'vapi_disabled');
      if (!vapiSecretMatches(req.headers['x-vapi-secret'], config.vapiSecret)) throw new HttpError(401, 'unauthorized');
      return sendJson(res, 200, await vapi(await readJson(req)));
    }],

    // ---------------------------------------------------------- admin
    ['POST', '/api/admin/login', async ({ req, res }) => {
      if (!config.adminPassword) throw new HttpError(503, 'admin_disabled');
      limit(limiters.login, req);
      const { password } = await readJson(req);
      if (!passwordMatches(String(password ?? ''), config.adminPassword)) throw new HttpError(401, 'wrong_password');
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': sessions.create() });
    }],
    ['POST', '/api/admin/logout', ({ req, res }) => sendJson(res, 200, { ok: true }, { 'Set-Cookie': sessions.destroy(req) })],
    ['GET', '/api/admin/me', ({ req, res }) => {
      requireAdmin(req);
      return sendJson(res, 200, { ok: true });
    }],

    ['GET', '/api/admin/leads', ({ req, res, url }) => {
      requireAdmin(req);
      const status = url.searchParams.get('status');
      return sendJson(res, 200, { leads: db.listLeads({ status: LEAD_STATUSES.includes(status) ? status : undefined }) });
    }],
    ['PATCH', '/api/admin/leads/:id', async ({ req, res, params }) => {
      requireAdmin(req);
      const body = await readJson(req);
      if (body.status !== undefined && !LEAD_STATUSES.includes(body.status)) {
        return sendJson(res, 400, { ok: false, errors: { status: 'invalid' } });
      }
      const lead = await services.updateLead(Number(params.id), {
        status: body.status,
        notes: body.notes === undefined ? undefined : text(body.notes, 5000),
      });
      if (!lead) throw new HttpError(404, 'not_found');
      return sendJson(res, 200, { ok: true, lead });
    }],

    ['GET', '/api/admin/bookings', ({ req, res, url }) => {
      requireAdmin(req);
      const upcoming = url.searchParams.get('when') !== 'past';
      return sendJson(res, 200, { bookings: db.listBookings({ upcoming, now: now().toISOString() }) });
    }],
    ['POST', '/api/admin/bookings/:id/cancel', async ({ req, res, params }) => {
      requireAdmin(req);
      const booking = db.getBooking(Number(params.id));
      if (!booking) throw new HttpError(404, 'not_found');
      if (booking.status !== 'confirmed') return sendJson(res, 409, { ok: false, error: 'not_active' });
      return sendJson(res, 200, { ok: true, booking: await services.cancel(booking) });
    }],

    ['GET', '/api/admin/settings', ({ req, res }) => {
      requireAdmin(req);
      return sendJson(res, 200, {
        settings: db.getSettings(),
        availability: db.listAvailability(),
        blocks: db.listBlocks(now().toISOString()),
      });
    }],
    ['PUT', '/api/admin/settings', async ({ req, res }) => {
      requireAdmin(req);
      const body = await readJson(req);
      const s = body.settings ?? {};
      const settings = {
        slotMinutes: [15, 20, 30, 45, 60].includes(s.slotMinutes) ? s.slotMinutes : undefined,
        minNoticeHours: Number.isInteger(s.minNoticeHours) && s.minNoticeHours >= 0 && s.minNoticeHours <= 168 ? s.minNoticeHours : undefined,
        maxDaysAhead: Number.isInteger(s.maxDaysAhead) && s.maxDaysAhead >= 1 && s.maxDaysAhead <= 180 ? s.maxDaysAhead : undefined,
      };
      const availability = Array.isArray(body.availability) ? body.availability : undefined;
      const validRow = (r) =>
        Number.isInteger(r.weekday) && r.weekday >= 0 && r.weekday <= 6 &&
        Number.isInteger(r.start_min) && Number.isInteger(r.end_min) &&
        r.start_min >= 0 && r.end_min <= 1440 && r.start_min < r.end_min;
      if (availability && !availability.every(validRow)) return sendJson(res, 400, { ok: false, errors: { availability: 'invalid' } });

      db.saveSettings(Object.fromEntries(Object.entries(settings).filter(([, v]) => v !== undefined)));
      if (availability) db.replaceAvailability(availability);
      return sendJson(res, 200, { ok: true, settings: db.getSettings(), availability: db.listAvailability() });
    }],
    ['POST', '/api/admin/blocks', async ({ req, res }) => {
      requireAdmin(req);
      const { start, end, reason } = await readJson(req);
      const s = Date.parse(start);
      const e = Date.parse(end);
      if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return sendJson(res, 400, { ok: false, errors: { range: 'invalid' } });
      const id = db.insertBlock({ start_utc: new Date(s).toISOString(), end_utc: new Date(e).toISOString(), reason: line(reason, 200) });
      return created(res, { id });
    }],
    ['DELETE', '/api/admin/blocks/:id', ({ req, res, params }) => {
      requireAdmin(req);
      if (!db.deleteBlock(Number(params.id))) throw new HttpError(404, 'not_found');
      return sendJson(res, 200, { ok: true });
    }],

    ['GET', '/api/admin/stats', ({ req, res, url }) => {
      requireAdmin(req);
      const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 30, 1), 365);
      return sendJson(res, 200, getStats(db, { days, now: now() }));
    }],
  ];

  const route = createRouter(routes);

  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      const match = route(req.method, url.pathname);
      if (match.handler) return await match.handler({ req, res, url, params: match.params });
      if (match.notAllowed) return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
      return sendJson(res, 404, { ok: false, error: 'not_found' });
    } catch (err) {
      if (err instanceof HttpError) return sendJson(res, err.status, { ok: false, error: err.code });
      logger.error('[api] unexpected error:', err);
      return sendJson(res, 500, { ok: false, error: 'server_error' });
    }
  };
};
