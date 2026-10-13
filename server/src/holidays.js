// Public holidays in North Rhine-Westphalia (computed, no external service).

/** Easter Sunday (Gregorian calendar, anonymous algorithm). Returns "YYYY-MM-DD". */
export const easterSunday = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const shift = (isoDate, days) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

const cache = new Map();

/** All NRW public holidays of a year as a Map "YYYY-MM-DD" -> name. */
export const holidaysNRW = (year) => {
  if (cache.has(year)) return cache.get(year);
  const easter = easterSunday(year);
  const days = new Map([
    [`${year}-01-01`, 'Neujahr'],
    [shift(easter, -2), 'Karfreitag'],
    [easter, 'Ostersonntag'],
    [shift(easter, 1), 'Ostermontag'],
    [`${year}-05-01`, 'Tag der Arbeit'],
    [shift(easter, 39), 'Christi Himmelfahrt'],
    [shift(easter, 49), 'Pfingstsonntag'],
    [shift(easter, 50), 'Pfingstmontag'],
    [shift(easter, 60), 'Fronleichnam'],
    [`${year}-10-03`, 'Tag der Deutschen Einheit'],
    [`${year}-11-01`, 'Allerheiligen'],
    [`${year}-12-25`, '1. Weihnachtstag'],
    [`${year}-12-26`, '2. Weihnachtstag'],
  ]);
  cache.set(year, days);
  return days;
};

export const isHolidayNRW = (isoDate) => holidaysNRW(Number(isoDate.slice(0, 4))).has(isoDate);
