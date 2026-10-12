export const SERVICES = ['webdesign', 'automation', 'telephony', 'other'];
export const LANGS = ['de', 'en'];
export const LEAD_STATUSES = ['new', 'contacted', 'offer', 'won', 'completed', 'lost'];

/** Submissions faster than this after the form was rendered are treated as bots. */
export const MIN_FILL_MS = 3000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s/-]{5,30}$/;

export const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
// Header-like values must stay on one line.
export const line = (value, max) => text(value, max).replace(/[\r\n\t]+/g, ' ');
export const isEmail = (value) => EMAIL_RE.test(value);
export const isPhone = (value) => PHONE_RE.test(value);

const isSpam = (body, now) => {
  // Honeypot field is hidden for humans; time trap catches instant submits.
  if (text(body.website, 200)) return true;
  const startedAt = Number(body.startedAt);
  return !Number.isFinite(startedAt) || now - startedAt < MIN_FILL_MS;
};

const person = (body) => ({
  name: line(body.name, 100),
  email: line(body.email, 200).toLowerCase(),
  phone: line(body.phone, 30),
  company: line(body.company, 120),
  service: SERVICES.includes(body.service) ? body.service : 'other',
  page: line(body.page, 200),
  lang: LANGS.includes(body.lang) ? body.lang : 'de',
});

const personErrors = (data, body, { phoneRequired = false } = {}) => {
  const errors = {};
  if (data.name.length < 2) errors.name = 'required';
  if (!isEmail(data.email)) errors.email = 'invalid';
  if (phoneRequired && !data.phone) errors.phone = 'required';
  else if (data.phone && !isPhone(data.phone)) errors.phone = 'invalid';
  if (body.consent !== true) errors.consent = 'required';
  return errors;
};

/**
 * Validates a contact form payload.
 * Returns { spam: true } for bot submissions, { errors } for invalid input or { data }.
 */
export const validateContact = (body, now = Date.now()) => {
  if (!body || typeof body !== 'object') return { errors: { form: 'invalid' } };
  if (isSpam(body, now)) return { spam: true };

  const data = { ...person(body), message: text(body.message, 5000) };
  const errors = personErrors(data, body);
  if (data.message.length < 10) errors.message = 'too_short';
  return Object.keys(errors).length ? { errors } : { data };
};

/** Validates a booking payload (phone is required, the call happens by phone). */
export const validateBooking = (body, now = Date.now()) => {
  if (!body || typeof body !== 'object') return { errors: { form: 'invalid' } };
  if (isSpam(body, now)) return { spam: true };

  const data = { ...person(body), note: text(body.note, 2000), start: line(body.start, 40) };
  const errors = personErrors(data, body, { phoneRequired: true });
  if (Number.isNaN(Date.parse(data.start))) errors.start = 'invalid';
  return Object.keys(errors).length ? { errors } : { data };
};
