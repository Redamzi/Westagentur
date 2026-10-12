export const SERVICES = ['webdesign', 'automation', 'telephony', 'other'];
export const LANGS = ['de', 'en'];

/** Submissions faster than this after the form was rendered are treated as bots. */
export const MIN_FILL_MS = 3000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s/-]{5,30}$/;

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
// Header-like values must stay on one line.
const line = (value, max) => text(value, max).replace(/[\r\n\t]+/g, ' ');

/**
 * Validates a contact form payload.
 * Returns { spam: true } for bot submissions, { errors } for invalid input or { data }.
 */
export const validateContact = (body, now = Date.now()) => {
  if (!body || typeof body !== 'object') return { errors: { form: 'invalid' } };

  // Honeypot field is hidden for humans; time trap catches instant submits.
  if (text(body.website, 200)) return { spam: true };
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || now - startedAt < MIN_FILL_MS) return { spam: true };

  const data = {
    name: line(body.name, 100),
    email: line(body.email, 200).toLowerCase(),
    phone: line(body.phone, 30),
    company: line(body.company, 120),
    service: SERVICES.includes(body.service) ? body.service : 'other',
    message: text(body.message, 5000),
    page: line(body.page, 200),
    lang: LANGS.includes(body.lang) ? body.lang : 'de',
  };

  const errors = {};
  if (data.name.length < 2) errors.name = 'required';
  if (!EMAIL_RE.test(data.email)) errors.email = 'invalid';
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = 'invalid';
  if (data.message.length < 10) errors.message = 'too_short';
  if (body.consent !== true) errors.consent = 'required';

  return Object.keys(errors).length ? { errors } : { data };
};
