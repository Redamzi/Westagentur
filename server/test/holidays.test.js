import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easterSunday, holidaysNRW, isHolidayNRW } from '../src/holidays.js';
import { openDatabase } from '../src/db.js';
import { computeSlots } from '../src/slots.js';

test('computes Easter correctly', () => {
  assert.equal(easterSunday(2025), '2025-04-20');
  assert.equal(easterSunday(2026), '2026-04-05');
  assert.equal(easterSunday(2027), '2027-03-28');
});

test('knows the NRW holidays of 2026', () => {
  const days = holidaysNRW(2026);
  assert.equal(days.get('2026-04-03'), 'Karfreitag');
  assert.equal(days.get('2026-05-14'), 'Christi Himmelfahrt');
  assert.equal(days.get('2026-06-04'), 'Fronleichnam');
  assert.equal(days.get('2026-11-01'), 'Allerheiligen');
  assert.ok(isHolidayNRW('2026-12-25'));
  assert.ok(!isHolidayNRW('2026-12-24'));
});

test('no slots on public holidays', () => {
  const db = openDatabase(':memory:');
  // Mon 28 Dec 2026 is a normal working day, Fri 25 Dec is Christmas
  const { days } = computeSlots(db, { from: '2026-12-24', days: 5, now: new Date('2026-12-20T08:00:00Z') });
  const dates = days.map((d) => d.date);
  assert.ok(dates.includes('2026-12-24'));
  assert.ok(!dates.includes('2026-12-25'));
  assert.ok(dates.includes('2026-12-28'));
});
