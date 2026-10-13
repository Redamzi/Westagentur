import { formatDateTime } from './time.js';

export const SERVICE_LABELS = {
  de: { webdesign: 'Webdesign', automation: 'KI-Automatisierung', telephony: 'KI-Telefonie', other: 'Sonstiges' },
  en: { webdesign: 'Web design', automation: 'AI automation', telephony: 'AI telephony', other: 'Other' },
};

const SOURCE_LABELS = { contact_form: 'Kontaktformular', booking: 'Terminbuchung', phone: 'KI-Telefon' };

export const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const layout = (body) => `<!doctype html>
<html><body style="margin:0;padding:24px;background:#fafaf9;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7">
<tr><td style="padding:24px 32px;background:#050505;color:#f3f4f6;font-size:20px;font-weight:bold">WEST<span style="color:#00e5ff;font-style:italic;font-weight:normal">AGENTUR</span></td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#525252">Westagentur · Kielstraße 28 · 44145 Dortmund · +49 1522 7506958 · westagentur.de</td></tr>
</table></body></html>`;

const button = (href, label) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:12px 24px;text-decoration:none">${esc(label)}</a></p>`;

const table = (rows) =>
  `<table role="presentation" style="border-collapse:collapse;margin:16px 0">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#525252;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`)
    .join('')}</table>`;

const textTable = (rows) => rows.map(([k, v]) => `${k}: ${v}`).join('\n');

// Customer-facing mails contain no free text from the request (only the shortened
// name), so the forms cannot be abused to send spam to third parties.
const shortName = (name) => String(name).slice(0, 50);

const greet = (lang, name) => (lang === 'en' ? `Hello ${shortName(name)},` : `Hallo ${shortName(name)},`);
const regards = (lang) => (lang === 'en' ? 'Best regards\nWestagentur' : 'Viele Grüße\nWestagentur');
const p = (text) => `<p>${esc(text).replace(/\n/g, '<br>')}</p>`;

const mail = (subject, paragraphs, extra = {}) => ({
  subject,
  text: [...paragraphs.map((x) => (typeof x === 'string' ? x : x.text))].join('\n\n'),
  html: layout(paragraphs.map((x) => (typeof x === 'string' ? p(x) : x.html)).join('')),
  ...extra,
});

const block = (html, text) => ({ html, text });

// ---------------------------------------------------------------- leads

export const leadNotification = (lead, id) => {
  const rows = [
    ['Quelle', SOURCE_LABELS[lead.source] ?? lead.source],
    ['Name', lead.name],
    ['E-Mail', lead.email || '–'],
    ['Telefon', lead.phone || '–'],
    ['Unternehmen', lead.company || '–'],
    ['Interesse', SERVICE_LABELS.de[lead.service] ?? lead.service],
    ['Seite', lead.page || '–'],
    ['Sprache', lead.lang],
  ];
  return mail(`Neue Anfrage #${id}: ${lead.name} (${SERVICE_LABELS.de[lead.service] ?? lead.service})`, [
    block(`<h1 style="font-size:20px;margin:0 0 8px">Neue Anfrage #${id}</h1>${table(rows)}`, textTable(rows)),
    block(`<p style="margin:0 0 8px;color:#525252">Nachricht:</p><p style="white-space:pre-line">${esc(lead.message)}</p>`, `Nachricht:\n${lead.message}`),
  ]);
};

export const leadConfirmation = (lead) =>
  lead.lang === 'en'
    ? mail('Your enquiry to Westagentur', [
        greet('en', lead.name),
        'thank you for your enquiry. We have received your message and will get back to you within 24 hours on working days.',
        regards('en'),
      ])
    : mail('Ihre Anfrage an die Westagentur', [
        greet('de', lead.name),
        'vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und melden uns werktags innerhalb von 24 Stunden bei Ihnen.',
        regards('de'),
      ]);

export const offerFollowUp = (lead, round) =>
  lead.lang === 'en'
    ? mail(round === 1 ? 'Any questions about our offer?' : 'Following up on our offer', [
        greet('en', lead.name),
        round === 1
          ? 'a few days ago we sent you our offer. Do you have any questions or would you like to discuss details? Just reply to this email or give us a call.'
          : 'we wanted to check in once more about our offer. If the timing is not right yet, that is fine – just let us know and we will not follow up again.',
        regards('en'),
      ])
    : mail(round === 1 ? 'Fragen zu unserem Angebot?' : 'Kurze Rückfrage zu unserem Angebot', [
        greet('de', lead.name),
        round === 1
          ? 'vor ein paar Tagen haben wir Ihnen unser Angebot geschickt. Haben Sie Fragen oder möchten Sie Details besprechen? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.'
          : 'wir wollten uns noch einmal zu unserem Angebot melden. Falls es gerade nicht passt, ist das völlig in Ordnung – geben Sie uns kurz Bescheid, dann melden wir uns nicht erneut.',
        regards('de'),
      ]);

export const reviewRequest = (lead, reviewUrl) =>
  lead.lang === 'en'
    ? mail('How was your project with Westagentur?', [
        greet('en', lead.name),
        'thank you for working with us! If you are happy with the result, we would really appreciate a short review – it only takes a minute.',
        block(button(reviewUrl, 'Write a review'), reviewUrl),
        regards('en'),
        'If you do not want to receive such emails, just reply briefly and we will remove you. No costs other than standard transmission costs apply.',
      ])
    : mail('Wie zufrieden waren Sie mit der Westagentur?', [
        greet('de', lead.name),
        'vielen Dank für die Zusammenarbeit! Wenn Sie mit dem Ergebnis zufrieden sind, würden wir uns sehr über eine kurze Bewertung freuen – das dauert nur eine Minute.',
        block(button(reviewUrl, 'Bewertung schreiben'), reviewUrl),
        regards('de'),
        'Sie möchten solche E-Mails nicht erhalten? Eine kurze Antwort genügt, dann tragen wir Sie aus. Es entstehen keine anderen als die Übermittlungskosten nach den Basistarifen.',
      ]);

// ---------------------------------------------------------------- bookings

const when = (booking, tz) => formatDateTime(new Date(booking.start_utc), booking.lang, tz);

export const bookingConfirmation = (booking, { tz, manageUrl, slotMinutes }) =>
  booking.lang === 'en'
    ? mail('Your appointment with Westagentur is confirmed', [
        greet('en', booking.name),
        `your free initial consultation (${slotMinutes} min.) is booked for:`,
        block(`<p style="font-size:18px;font-weight:bold">${esc(when(booking, tz))}</p>`, when(booking, tz)),
        `We will call you at ${booking.phone}. The calendar invitation is attached.`,
        block(button(manageUrl, 'Reschedule or cancel'), `Reschedule or cancel: ${manageUrl}`),
        regards('en'),
      ])
    : mail('Ihr Termin bei der Westagentur ist bestätigt', [
        greet('de', booking.name),
        `Ihr kostenloses Erstgespräch (${slotMinutes} Min.) ist gebucht für:`,
        block(`<p style="font-size:18px;font-weight:bold">${esc(when(booking, tz))}</p>`, when(booking, tz)),
        `Wir rufen Sie unter ${booking.phone} an. Die Kalendereinladung finden Sie im Anhang.`,
        block(button(manageUrl, 'Termin verschieben oder absagen'), `Termin verschieben oder absagen: ${manageUrl}`),
        regards('de'),
      ]);

export const bookingRescheduled = (booking, { tz, manageUrl }) =>
  booking.lang === 'en'
    ? mail('Your appointment has been moved', [
        greet('en', booking.name),
        'your appointment has been moved to:',
        block(`<p style="font-size:18px;font-weight:bold">${esc(when(booking, tz))}</p>`, when(booking, tz)),
        'The updated calendar invitation is attached.',
        block(button(manageUrl, 'Manage appointment'), manageUrl),
        regards('en'),
      ])
    : mail('Ihr Termin wurde verschoben', [
        greet('de', booking.name),
        'Ihr Termin wurde verschoben auf:',
        block(`<p style="font-size:18px;font-weight:bold">${esc(when(booking, tz))}</p>`, when(booking, tz)),
        'Die aktualisierte Kalendereinladung finden Sie im Anhang.',
        block(button(manageUrl, 'Termin verwalten'), manageUrl),
        regards('de'),
      ]);

export const bookingCancelled = (booking, { tz, bookUrl }) =>
  booking.lang === 'en'
    ? mail('Your appointment has been cancelled', [
        greet('en', booking.name),
        `your appointment on ${when(booking, tz)} has been cancelled.`,
        block(button(bookUrl, 'Book a new appointment'), `Book a new appointment: ${bookUrl}`),
        regards('en'),
      ])
    : mail('Ihr Termin wurde abgesagt', [
        greet('de', booking.name),
        `Ihr Termin am ${when(booking, tz)} wurde abgesagt.`,
        block(button(bookUrl, 'Neuen Termin buchen'), `Neuen Termin buchen: ${bookUrl}`),
        regards('de'),
      ]);

export const bookingReminder = (booking, { tz, manageUrl }) =>
  booking.lang === 'en'
    ? mail('Reminder: your appointment tomorrow', [
        greet('en', booking.name),
        `a quick reminder of your appointment on ${when(booking, tz)}. We will call you at ${booking.phone}.`,
        block(button(manageUrl, 'Reschedule or cancel'), manageUrl),
        regards('en'),
      ])
    : mail('Erinnerung: Ihr Termin morgen', [
        greet('de', booking.name),
        `kurze Erinnerung an Ihren Termin am ${when(booking, tz)}. Wir rufen Sie unter ${booking.phone} an.`,
        block(button(manageUrl, 'Termin verschieben oder absagen'), manageUrl),
        regards('de'),
      ]);

export const bookingOwnerNotice = (booking, kind, { tz }) => {
  const titles = { new: 'Neuer Termin', rescheduled: 'Termin verschoben', cancelled: 'Termin abgesagt' };
  const rows = [
    ['Termin', formatDateTime(new Date(booking.start_utc), 'de', tz)],
    ['Name', booking.name],
    ['E-Mail', booking.email || '–'],
    ['Telefon', booking.phone || '–'],
    ['Unternehmen', booking.company || '–'],
    ['Interesse', SERVICE_LABELS.de[booking.service] ?? booking.service],
    ['Quelle', booking.source === 'phone' ? 'KI-Telefon' : 'Website'],
  ];
  return mail(`${titles[kind]}: ${booking.name}, ${formatDateTime(new Date(booking.start_utc), 'de', tz)}`, [
    block(`<h1 style="font-size:20px;margin:0 0 8px">${titles[kind]} #${booking.id}</h1>${table(rows)}`, textTable(rows)),
    ...(booking.note
      ? [block(`<p style="margin:0 0 8px;color:#525252">Notiz:</p><p style="white-space:pre-line">${esc(booking.note)}</p>`, `Notiz:\n${booking.note}`)]
      : []),
  ]);
};

// ---------------------------------------------------------------- owner digest

export const ownerDigest = ({ appointments, openLeads, tz, adminUrl }) => {
  const apptRows = appointments.map((b) => [formatDateTime(new Date(b.start_utc), 'de', tz).replace(/^.*?, /, ''), `${b.name} (${b.phone || b.email})`]);
  const leadRows = openLeads.map((l) => [`#${l.id} ${l.created_at.slice(0, 10)}`, `${l.name} – ${SERVICE_LABELS.de[l.service] ?? l.service}`]);
  return mail(`Tagesübersicht: ${appointments.length} Termine, ${openLeads.length} offene Anfragen`, [
    block(`<h1 style="font-size:20px;margin:0">Termine heute</h1>${apptRows.length ? table(apptRows) : '<p>Keine Termine.</p>'}`, `Termine heute:\n${textTable(apptRows) || 'Keine'}`),
    block(
      `<h1 style="font-size:20px;margin:16px 0 0">Unbearbeitete Anfragen</h1>${leadRows.length ? table(leadRows) : '<p>Keine.</p>'}`,
      `Unbearbeitete Anfragen:\n${textTable(leadRows) || 'Keine'}`
    ),
    block(button(adminUrl, 'Admin öffnen'), adminUrl),
  ]);
};
