import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, MIN_FILL_MS } from '../src/validate.js';

const now = 1_000_000;
const valid = {
  name: 'Erika Muster',
  email: 'Erika@Example.de',
  phone: '+49 231 123456',
  company: 'Muster GmbH',
  service: 'webdesign',
  message: 'Wir brauchen eine neue Website.',
  consent: true,
  website: '',
  startedAt: now - MIN_FILL_MS - 1,
  lang: 'de',
  page: '/webdesign',
};

test('accepts a valid submission and normalises data', () => {
  const { data, errors } = validateContact(valid, now);
  assert.equal(errors, undefined);
  assert.equal(data.email, 'erika@example.de');
  assert.equal(data.service, 'webdesign');
});

test('honeypot and too-fast submissions are spam', () => {
  assert.deepEqual(validateContact({ ...valid, website: 'http://spam' }, now), { spam: true });
  assert.deepEqual(validateContact({ ...valid, startedAt: now - 500 }, now), { spam: true });
  assert.deepEqual(validateContact({ ...valid, startedAt: undefined }, now), { spam: true });
});

test('reports field errors', () => {
  const { errors } = validateContact({ ...valid, name: 'A', email: 'kein-mail', phone: 'abc', message: 'kurz', consent: false }, now);
  assert.deepEqual(errors, { name: 'required', email: 'invalid', phone: 'invalid', message: 'too_short', consent: 'required' });
});

test('strips line breaks from single-line fields and falls back for unknown values', () => {
  const { data } = validateContact({ ...valid, name: 'Erika\r\nBcc: x@y.de', service: 'hack', lang: 'fr' }, now);
  assert.equal(data.name, 'Erika Bcc: x@y.de');
  assert.equal(data.service, 'other');
  assert.equal(data.lang, 'de');
});
