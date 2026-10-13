// Time zone helpers based on Intl (no external libraries).

const formatters = new Map();
const partsFormatter = (timeZone) => {
  if (!formatters.has(timeZone)) {
    formatters.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }
  return formatters.get(timeZone);
};

/** Wall-clock parts of an instant in the given time zone. */
export const zonedParts = (date, timeZone) => {
  const parts = Object.fromEntries(
    partsFormatter(timeZone)
      .formatToParts(date)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, Number(p.value)])
  );
  return parts; // { year, month, day, hour, minute, second }
};

const offsetMs = (date, timeZone) => {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
};

/** Converts a local date ("YYYY-MM-DD") and minutes after midnight in timeZone to a UTC Date. */
export const zonedToUtc = (localDate, minutes, timeZone) => {
  const [y, m, d] = localDate.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  const first = guess - offsetMs(new Date(guess), timeZone);
  // Second pass corrects guesses that land on the other side of a DST change.
  return new Date(guess - offsetMs(new Date(first), timeZone));
};

/** Local calendar date ("YYYY-MM-DD") of an instant. */
export const localDate = (date, timeZone) => {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
};

/** Day of week (0 = Sunday) of a local date string. */
export const weekdayOf = (localDateStr) => {
  const [y, m, d] = localDateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const addDays = (localDateStr, days) => {
  const [y, m, d] = localDateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

export const isLocalDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Human readable date and time, e.g. "Dienstag, 13. Oktober 2026, 10:00 Uhr". */
export const formatDateTime = (date, lang, timeZone) => {
  const text = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'de-DE', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return lang === 'en' ? text : `${text} Uhr`;
};
