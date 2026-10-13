import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zonedToUtc, localDate, weekdayOf, addDays, formatDateTime } from '../src/time.js';

const TZ = 'Europe/Berlin';

test('converts Berlin wall time to UTC in summer and winter', () => {
  assert.equal(zonedToUtc('2026-07-01', 9 * 60, TZ).toISOString(), '2026-07-01T07:00:00.000Z');
  assert.equal(zonedToUtc('2026-12-01', 9 * 60, TZ).toISOString(), '2026-12-01T08:00:00.000Z');
});

test('handles DST change days', () => {
  // 29 March 2026: clocks jump from 02:00 to 03:00
  assert.equal(zonedToUtc('2026-03-29', 10 * 60, TZ).toISOString(), '2026-03-29T08:00:00.000Z');
  // 25 October 2026: clocks go back from 03:00 to 02:00
  assert.equal(zonedToUtc('2026-10-25', 10 * 60, TZ).toISOString(), '2026-10-25T09:00:00.000Z');
});

test('date helpers', () => {
  assert.equal(localDate(new Date('2026-10-12T22:30:00Z'), TZ), '2026-10-13');
  assert.equal(weekdayOf('2026-10-12'), 1);
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(formatDateTime(new Date('2026-10-13T08:00:00Z'), 'de', TZ), 'Dienstag, 13. Oktober 2026 um 10:00 Uhr');
});
