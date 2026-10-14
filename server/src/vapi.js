import crypto from 'node:crypto';
import { computeSlots } from './slots.js';
import { formatDateTime, isLocalDate } from './time.js';
import { SlotTakenError } from './services.js';
import { SERVICES, isEmail, isPhone, line, text } from './validate.js';

const MAX_SLOTS_SPOKEN = 6;

export const vapiSecretMatches = (given, expected) => {
  if (!expected || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
};

const parseArgs = (args) => {
  if (typeof args !== 'string') return args ?? {};
  try {
    return JSON.parse(args);
  } catch {
    return {};
  }
};

const ROLE_LABELS = { user: 'Anrufer', assistant: 'Toni', bot: 'Toni' };

/** Readable transcript from an end-of-call report (plain text or message list). */
const callTranscript = (message) => {
  const plain = message.artifact?.transcript ?? message.transcript;
  if (typeof plain === 'string' && plain.trim()) {
    return text(plain.replace(/^AI:/gm, 'Toni:').replace(/^User:/gm, 'Anrufer:'), 5000);
  }
  const messages = message.artifact?.messages ?? message.messages ?? [];
  const lines = messages
    .filter((m) => ROLE_LABELS[m.role] && typeof m.message === 'string' && m.message.trim())
    .map((m) => `${ROLE_LABELS[m.role]}: ${m.message.trim()}`);
  return text(lines.join('\n'), 5000);
};

/**
 * Handles Vapi server messages:
 * - "tool-calls": get_free_slots / book_appointment (booking during the call)
 * - "end-of-call-report": stores the call as a lead and notifies the owner
 */
export const createVapiHandler = ({ db, services, logger = console, now = () => new Date() }) => {
  const freeSlots = ({ date }) => {
    const { timezone, days } = computeSlots(db, { from: isLocalDate(date) ? date : undefined, days: 14, now: now() });
    const slots = days.flatMap((d) => d.slots).slice(0, MAX_SLOTS_SPOKEN);
    if (!slots.length) return 'Im gewünschten Zeitraum sind leider keine Termine frei.';
    return (
      'Freie Termine (Anzeige; für die Buchung den ISO-Wert in Klammern als "start" verwenden): ' +
      slots.map((iso) => `${formatDateTime(new Date(iso), 'de', timezone)} (${iso})`).join('; ')
    );
  };

  // call: the Vapi call (phone/browser) or the website chat the tool was used in.
  const bookAppointment = async (args, call, source = 'phone') => {
    const phone = line(args.phone, 30) || line(call?.customer?.number, 30);
    const email = line(args.email, 200).toLowerCase();
    const name = line(args.name, 100);
    if (name.length < 2) return 'Bitte zuerst den Namen des Anrufers erfragen.';
    if (!phone || !isPhone(phone)) return 'Bitte eine gültige Telefonnummer erfragen.';
    try {
      const booking = await services.book(
        {
          start: args.start,
          name,
          phone,
          email: isEmail(email) ? email : '',
          company: line(args.company, 120),
          service: SERVICES.includes(args.service) ? args.service : 'other',
          note: text(args.note, 2000),
          page: [source === 'chat' ? 'chat' : 'vapi', call?.id].filter(Boolean).join(':'),
          lang: 'de',
        },
        { source }
      );
      const { timezone } = db.getSettings();
      return `Termin gebucht: ${formatDateTime(new Date(booking.start_utc), 'de', timezone)}.`;
    } catch (err) {
      if (err instanceof SlotTakenError || err instanceof RangeError) {
        return 'Dieser Termin ist leider nicht frei. Bitte einen anderen Termin aus get_free_slots anbieten.';
      }
      throw err;
    }
  };

  const tools = { get_free_slots: freeSlots, book_appointment: bookAppointment };

  const endOfCall = async (message) => {
    const call = message.call ?? {};
    const data = message.analysis?.structuredData ?? {};
    const summary = text(message.analysis?.summary ?? message.summary, 5000);
    const transcript = callTranscript(message);
    // Some setups (e.g. GPT Live) send no summary – keep the transcript instead.
    const report = summary
      ? `Gesprächszusammenfassung:\n${summary}`
      : transcript
        ? `Gesprächsprotokoll:\n${transcript}`
        : '';
    const page = call.id ? `vapi:${call.id}` : 'vapi';

    // A booking during the call already created the lead – just add the report.
    const existing = call.id && db.raw.prepare('SELECT id FROM leads WHERE page = ?').get(page);
    if (existing) {
      if (report) {
        db.raw.prepare("UPDATE leads SET message = TRIM(COALESCE(message, '') || char(10) || char(10) || ?) WHERE id = ?").run(report, existing.id);
      }
      return;
    }

    const phone = line(call.customer?.number, 30);
    if (!report && !phone) return; // nothing useful (e.g. browser demo without content)
    const email = line(data.email, 200).toLowerCase();
    await services.createLead(
      {
        source: 'phone',
        name: line(data.name, 100) || 'Anrufer',
        email: isEmail(email) ? email : '',
        phone: isPhone(phone) ? phone : '',
        company: line(data.company, 120),
        service: SERVICES.includes(data.service) ? data.service : 'telephony',
        message: report || '(kein Gesprächsinhalt übermittelt)',
        page,
        lang: 'de',
      },
      { confirm: false }
    );
  };

  return async (body) => {
    const message = body?.message ?? {};
    if (message.type === 'tool-calls') {
      const calls = message.toolCallList ?? message.toolCalls ?? [];
      const results = [];
      for (const call of calls) {
        const name = call.function?.name;
        const fn = tools[name];
        logger.info(`[vapi] tool-call ${name} ${typeof call.function?.arguments === 'string' ? call.function.arguments : JSON.stringify(call.function?.arguments ?? {})}`);
        // Tools used in the website chat arrive with a "chat" instead of a "call".
        const source = !message.call && message.chat ? 'chat' : 'phone';
        const conversation = message.call ?? message.chat;
        const result = fn ? await fn(parseArgs(call.function.arguments), conversation, source) : `Unbekanntes Tool: ${name}`;
        logger.info(`[vapi] tool-result ${name}: ${String(result).slice(0, 160)}`);
        results.push({ toolCallId: call.id, result });
      }
      return { results };
    }
    if (message.type === 'end-of-call-report') {
      logger.info(`[vapi] end-of-call-report (call ${message.call?.id ?? '?'})`);
      await endOfCall(message);
      return { ok: true };
    }
    logger.info(`[vapi] ignored message type ${message.type}`);
    return { ok: true };
  };
};
