import crypto from 'node:crypto';
import { buildIcs } from './ics.js';
import { isSlotFree } from './slots.js';
import * as t from './templates.js';

export class SlotTakenError extends Error {}

/** Lead and booking workflows (database + mails), shared by website, admin and Vapi. */
export const createServices = ({ db, mailer, config, logger = console, now = () => new Date() }) => {
  const settings = () => db.getSettings();

  const sendAll = async (label, messages) => {
    const results = await Promise.allSettled(messages.filter((m) => m && m.to).map((m) => mailer.send(m)));
    results.forEach((r) => r.status === 'rejected' && logger.error(`[mail] ${label} failed:`, r.reason?.message));
    return results.map((r) => r.status === 'fulfilled');
  };

  // ------------------------------------------------------------ leads

  const createLead = async (lead, { confirm = true } = {}) => {
    const id = db.insertLead(lead);
    logger.info(`[lead] #${id} saved (${lead.source ?? 'contact_form'}, ${lead.service})`);
    const [notified, confirmed] = await sendAll(`lead #${id}`, [
      { to: mailer.owner, replyTo: lead.email || undefined, ...t.leadNotification({ source: 'contact_form', ...lead }, id) },
      confirm && lead.email ? { to: lead.email, ...t.leadConfirmation(lead) } : { to: '' },
    ]);
    if (notified) db.markMailSent(id, 'notify');
    if (confirmed) db.markMailSent(id, 'confirm');
    return id;
  };

  const updateLead = async (id, changes) => {
    const before = db.getLead(id);
    if (!before) return undefined;
    const lead = db.updateLead(id, changes, now().toISOString());
    // Review request once a project is marked as completed.
    if (lead.status === 'completed' && before.status !== 'completed' && !lead.review_sent && lead.email && config.googleReviewUrl) {
      const [ok] = await sendAll(`review #${id}`, [{ to: lead.email, ...t.reviewRequest(lead, config.googleReviewUrl) }]);
      if (ok) db.setLeadFlag(id, 'review_sent', 1);
    }
    return db.getLead(id);
  };

  // ------------------------------------------------------------ bookings

  const paths = (lang) =>
    lang === 'en' ? { book: '/en/appointment', manage: '/en/appointment/manage' } : { book: '/termin', manage: '/termin/verwalten' };
  const manageUrl = (b) => `${config.publicUrl}${paths(b.lang).manage}?t=${b.token}`;
  const bookUrl = (lang) => `${config.publicUrl}${paths(lang).book}`;

  const icsAttachment = (booking, method) => ({
    filename: method === 'CANCEL' ? 'absage.ics' : 'termin.ics',
    contentType: `text/calendar; charset=utf-8; method=${method}`,
    content: buildIcs({
      booking,
      method,
      organizerEmail: mailer.owner,
      summary: booking.lang === 'en' ? 'Initial consultation – Westagentur' : 'Erstgespräch – Westagentur',
      description:
        booking.lang === 'en'
          ? `We will call you at ${booking.phone}.\nManage: ${manageUrl(booking)}`
          : `Wir rufen Sie unter ${booking.phone} an.\nVerwalten: ${manageUrl(booking)}`,
    }),
  });

  const notifyBooking = (booking, kind) => {
    const { timezone: tz, slotMinutes } = settings();
    const method = kind === 'cancelled' ? 'CANCEL' : 'REQUEST';
    const customer = {
      new: () => t.bookingConfirmation(booking, { tz, manageUrl: manageUrl(booking), slotMinutes }),
      rescheduled: () => t.bookingRescheduled(booking, { tz, manageUrl: manageUrl(booking) }),
      cancelled: () => t.bookingCancelled(booking, { tz, bookUrl: bookUrl(booking.lang) }),
    }[kind]();
    return sendAll(`booking #${booking.id} ${kind}`, [
      booking.email ? { to: booking.email, ...customer, attachments: [icsAttachment(booking, method)] } : { to: '' },
      {
        to: mailer.owner,
        replyTo: booking.email || undefined,
        ...t.bookingOwnerNotice(booking, kind, { tz }),
        attachments: [icsAttachment(booking, method)],
      },
    ]);
  };

  const endOf = (startIso) => new Date(Date.parse(startIso) + settings().slotMinutes * 60_000).toISOString();

  /** Books a slot. Throws SlotTakenError if it is not (or no longer) free. */
  const book = async (input, { source = 'website' } = {}) => {
    const start = new Date(input.start).toISOString();
    const booking = db.transaction(() => {
      if (!isSlotFree(db, start, now())) throw new SlotTakenError();
      const leadId = db.insertLead({
        source: source === 'phone' || source === 'chat' ? source : 'booking',
        name: input.name,
        email: input.email ?? '',
        phone: input.phone,
        company: input.company,
        service: input.service,
        message: input.note,
        page: input.page,
        lang: input.lang,
      });
      const id = db.insertBooking({
        token: crypto.randomBytes(24).toString('base64url'),
        lead_id: leadId,
        source,
        start_utc: start,
        end_utc: endOf(start),
        name: input.name,
        email: input.email ?? '',
        phone: input.phone,
        company: input.company,
        service: input.service,
        note: input.note,
        lang: input.lang,
      });
      return db.getBooking(id);
    });
    logger.info(`[booking] #${booking.id} booked for ${booking.start_utc} (${source})`);
    const [confirmed, notified] = await notifyBooking(booking, 'new');
    if (notified) db.markMailSent(booking.lead_id, 'notify');
    if (confirmed && booking.email) db.markMailSent(booking.lead_id, 'confirm');
    return booking;
  };

  const cancel = async (booking) => {
    const cancelled = db.cancelBooking(booking.id);
    logger.info(`[booking] #${booking.id} cancelled`);
    await notifyBooking(cancelled, 'cancelled');
    return cancelled;
  };

  const reschedule = async (booking, startInput) => {
    const start = new Date(startInput).toISOString();
    const updated = db.transaction(() => {
      if (!isSlotFree(db, start, now())) throw new SlotTakenError();
      return db.rescheduleBooking(booking.id, start, endOf(start));
    });
    logger.info(`[booking] #${booking.id} moved to ${start}`);
    await notifyBooking(updated, 'rescheduled');
    return updated;
  };

  const sendReminder = async (booking) => {
    const { timezone: tz } = settings();
    if (booking.email) await mailer.send({ to: booking.email, ...t.bookingReminder(booking, { tz, manageUrl: manageUrl(booking) }) });
    db.markReminderSent(booking.id);
  };

  return { createLead, updateLead, book, cancel, reschedule, sendReminder, manageUrl };
};
