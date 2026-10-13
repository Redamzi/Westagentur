import { localDate, zonedParts, zonedToUtc } from './time.js';
import { offerFollowUp, ownerDigest } from './templates.js';

const DAY = 86_400_000;
const FOLLOW_UP_DAYS = [2, 7];
const RETENTION_DAYS = 365;

/**
 * Recurring automations, run every few minutes:
 * - appointment reminders 24 h before
 * - follow-ups 2 and 7 days after an offer was sent (status "offer")
 * - daily digest for the owner (today's appointments, unprocessed enquiries)
 * - removal of expired admin sessions
 */
export const createScheduler = ({ db, mailer, services, config, logger = console, now = () => new Date() }) => {
  const reminders = async () => {
    const current = now();
    const due = db.bookingsNeedingReminder(current.toISOString(), new Date(current.getTime() + DAY).toISOString());
    for (const booking of due) {
      // Booked less than a day in advance: the confirmation is reminder enough.
      if (Date.parse(booking.created_at) > Date.parse(booking.start_utc) - DAY) {
        db.markReminderSent(booking.id);
        continue;
      }
      await services.sendReminder(booking);
      logger.info(`[scheduler] reminder sent for booking #${booking.id}`);
    }
  };

  const followUps = async () => {
    const current = now().getTime();
    const leads = db.raw
      .prepare("SELECT * FROM leads WHERE status = 'offer' AND email != '' AND followups_sent < ?")
      .all(FOLLOW_UP_DAYS.length);
    for (const lead of leads) {
      const round = lead.followups_sent + 1;
      const dueAt = Date.parse(lead.status_changed_at ?? lead.created_at) + FOLLOW_UP_DAYS[round - 1] * DAY;
      if (current < dueAt) continue;
      await mailer.send({ to: lead.email, ...offerFollowUp(lead, round) });
      db.setLeadFlag(lead.id, 'followups_sent', round);
      logger.info(`[scheduler] follow-up ${round} sent for lead #${lead.id}`);
    }
  };

  const digest = async () => {
    const { timezone, lastDigest } = db.getSettings();
    const current = now();
    const today = localDate(current, timezone);
    if (lastDigest === today || zonedParts(current, timezone).hour < config.digestHour) return;

    const dayStart = zonedToUtc(today, 0, timezone).toISOString();
    const dayEnd = zonedToUtc(today, 1440, timezone).toISOString();
    const appointments = db.raw
      .prepare("SELECT * FROM bookings WHERE status = 'confirmed' AND start_utc >= ? AND start_utc < ? ORDER BY start_utc")
      .all(dayStart, dayEnd);
    const openLeads = db.raw.prepare("SELECT * FROM leads WHERE status = 'new' ORDER BY created_at").all();

    db.saveSettings({ lastDigest: today });
    if (!appointments.length && !openLeads.length) return;
    await mailer.send({
      to: mailer.owner,
      ...ownerDigest({ appointments, openLeads, tz: timezone, adminUrl: `${config.publicUrl}/admin` }),
    });
    logger.info('[scheduler] daily digest sent');
  };

  // Data retention as stated in the privacy policy (section "Speicherdauer").
  const retention = async () => {
    const deleted = db.deleteStaleLeads(new Date(now().getTime() - RETENTION_DAYS * DAY).toISOString());
    if (deleted) logger.info(`[scheduler] deleted ${deleted} enquiries older than ${RETENTION_DAYS} days`);
  };

  const tick = async () => {
    for (const [name, job] of Object.entries({ reminders, followUps, digest, retention })) {
      try {
        await job();
      } catch (err) {
        logger.error(`[scheduler] ${name} failed:`, err.message);
      }
    }
    db.deleteExpiredSessions(now().getTime());
  };

  return { tick, reminders, followUps, digest, retention };
};
