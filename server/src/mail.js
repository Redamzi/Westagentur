import nodemailer from 'nodemailer';

const SERVICE_LABELS = {
  de: { webdesign: 'Webdesign', automation: 'KI-Automatisierung', telephony: 'KI-Telefonie', other: 'Sonstiges' },
  en: { webdesign: 'Web design', automation: 'AI automation', telephony: 'AI telephony', other: 'Other' },
};

const esc = (value) =>
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
<tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#525252">Westagentur · Kielstraße 28 · 44145 Dortmund · +49 152 27506958 · westagentur.de</td></tr>
</table></body></html>`;

/** Internal notification with all lead details. */
export const notificationMail = (lead, id) => {
  const service = SERVICE_LABELS.de[lead.service];
  const rows = [
    ['Name', lead.name],
    ['E-Mail', lead.email],
    ['Telefon', lead.phone || '–'],
    ['Unternehmen', lead.company || '–'],
    ['Interesse', service],
    ['Seite', lead.page || '–'],
    ['Sprache', lead.lang],
  ];
  return {
    subject: `Neue Anfrage #${id}: ${lead.name} (${service})`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nNachricht:\n${lead.message}`,
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 16px">Neue Anfrage #${id}</h1>
      <table role="presentation" style="border-collapse:collapse;margin-bottom:16px">
        ${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#525252">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('')}
      </table>
      <p style="margin:0 0 8px;color:#525252">Nachricht:</p>
      <p style="margin:0;white-space:pre-line">${esc(lead.message)}</p>`),
  };
};

/**
 * Confirmation for the sender. Deliberately contains no user-supplied text except
 * the (shortened) name, so the form cannot be abused to send spam to third parties.
 */
export const confirmationMail = (lead) => {
  const name = lead.name.slice(0, 50);
  if (lead.lang === 'en') {
    return {
      subject: 'Your enquiry to Westagentur',
      text: `Hello ${name},\n\nthank you for your enquiry. We have received your message and will get back to you within 24 hours on working days.\n\nBest regards\nWestagentur`,
      html: layout(`<p>Hello ${esc(name)},</p>
        <p>thank you for your enquiry. We have received your message and will get back to you <strong>within 24 hours</strong> on working days.</p>
        <p>Best regards<br>Westagentur</p>`),
    };
  }
  return {
    subject: 'Ihre Anfrage an die Westagentur',
    text: `Hallo ${name},\n\nvielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und melden uns werktags innerhalb von 24 Stunden bei Ihnen.\n\nViele Grüße\nWestagentur`,
    html: layout(`<p>Hallo ${esc(name)},</p>
      <p>vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und melden uns werktags <strong>innerhalb von 24 Stunden</strong> bei Ihnen.</p>
      <p>Viele Grüße<br>Westagentur</p>`),
  };
};

/** Creates the mail sender. Without SMTP host, mails are only logged (development). */
export const createMailer = ({ smtp, mail }, logger = console) => {
  const transport = smtp.host
    ? nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
      })
    : null;

  if (!transport) logger.warn('[mail] SMTP_HOST not set – mails are logged instead of sent');

  const send = async (message) => {
    if (!transport) {
      logger.info(`[mail] (not sent) to=${message.to} subject="${message.subject}"`);
      return;
    }
    await transport.sendMail({ from: mail.from, ...message });
  };

  return {
    sendNotification: (lead, id) => send({ to: mail.to, replyTo: lead.email, ...notificationMail(lead, id) }),
    sendConfirmation: (lead) => send({ to: lead.email, replyTo: mail.to, ...confirmationMail(lead) }),
    verify: () => transport?.verify(),
  };
};
