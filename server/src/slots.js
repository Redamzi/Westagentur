import { addDays, localDate, weekdayOf, zonedToUtc } from './time.js';
import { isHolidayNRW } from './holidays.js';

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

/**
 * Free appointment slots, grouped by local day.
 * Returns [{ date: 'YYYY-MM-DD', slots: [ISO start, ...] }] for days that have slots.
 */
export const computeSlots = (db, { from, days, now = new Date() }) => {
  const settings = db.getSettings();
  const { timezone, slotMinutes, minNoticeHours, maxDaysAhead } = settings;
  const earliest = now.getTime() + minNoticeHours * 3_600_000;
  const latest = now.getTime() + maxDaysAhead * 86_400_000;

  const startDate = from && from > localDate(now, timezone) ? from : localDate(now, timezone);
  const endDate = addDays(startDate, days);
  const rangeStart = zonedToUtc(startDate, 0, timezone).toISOString();
  const rangeEnd = zonedToUtc(endDate, 0, timezone).toISOString();

  const busy = [...db.confirmedBookingsBetween(rangeStart, rangeEnd), ...db.listBlocks(rangeStart)].map((b) => [
    Date.parse(b.start_utc),
    Date.parse(b.end_utc),
  ]);
  const windows = db.listAvailability();

  const result = [];
  for (let date = startDate; date < endDate; date = addDays(date, 1)) {
    if (isHolidayNRW(date)) continue; // no appointments on public holidays
    const weekday = weekdayOf(date);
    const slots = [];
    for (const w of windows.filter((row) => row.weekday === weekday)) {
      for (let min = w.start_min; min + slotMinutes <= w.end_min; min += slotMinutes) {
        const start = zonedToUtc(date, min, timezone).getTime();
        const end = start + slotMinutes * 60_000;
        if (start < earliest || start > latest) continue;
        if (busy.some(([bStart, bEnd]) => overlaps(start, end, bStart, bEnd))) continue;
        slots.push(new Date(start).toISOString());
      }
    }
    if (slots.length) result.push({ date, slots: slots.sort() });
  }
  return { timezone, slotMinutes, days: result };
};

/** True if the given ISO start is currently a bookable slot. */
export const isSlotFree = (db, startIso, now = new Date()) => {
  const { timezone } = db.getSettings();
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return false;
  const date = localDate(start, timezone);
  const { days } = computeSlots(db, { from: date, days: 1, now });
  const free = days.flatMap((d) => d.slots);
  return free.includes(start.toISOString());
};
