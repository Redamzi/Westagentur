import nodemailer from 'nodemailer';

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

  return {
    owner: mail.to,
    /** message: { to, subject, text, html, replyTo?, attachments? } */
    async send(message) {
      if (!message.to) return;
      if (!transport) {
        logger.info(`[mail] (not sent) to=${message.to} subject="${message.subject}"`);
        return;
      }
      await transport.sendMail({ from: mail.from, replyTo: mail.to, ...message });
    },
    verify: () => transport?.verify(),
  };
};
