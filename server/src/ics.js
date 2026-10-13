// iCalendar (RFC 5545) invitations for bookings.

const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const escapeText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

// Lines longer than 75 octets must be folded.
const fold = (line) => {
  const out = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = ' ' + rest.slice(cut);
  }
  out.push(rest);
  return out.join('\r\n');
};

/**
 * Builds an .ics file for a booking. method "REQUEST" for new/updated
 * appointments, "CANCEL" for cancellations.
 */
export const buildIcs = ({ booking, method = 'REQUEST', organizerEmail, summary, description, now = new Date() }) => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Westagentur//Termine//DE',
    'CALSCALE:GREGORIAN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}@westagentur.de`,
    `SEQUENCE:${booking.sequence ?? 0}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(new Date(booking.start_utc))}`,
    `DTEND:${stamp(new Date(booking.end_utc))}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `ORGANIZER;CN=Westagentur:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${escapeText(booking.name)};ROLE=REQ-PARTICIPANT:mailto:${booking.email}`,
    `STATUS:${method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
};
