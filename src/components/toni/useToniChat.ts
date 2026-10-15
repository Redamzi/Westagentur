import { useRef, useState } from 'react';
import { formatAppointment } from '../../content/booking';
import type { Lang } from '../../seo/site';

type ChatEntry = { from: 'user' | 'toni' | 'error'; text: string } | { from: 'booking' };
export type ChatItem = ChatEntry & { id: number };

// Visitor asks for an appointment ...
const BOOKING_INTENT = /(termin|buchen|erstgespr|beratungsgespr|rückruf|appointment|book a|schedule a|call back)/i;
// ... or agrees after Toni offered one.
const AGREE = /^(ja|jo|jep|gern|gerne|ok|okay|klar|sehr gern|bitte|yes|sure|please)\b/i;
const OFFER = /(termin|erstgespr|beratung|appointment|consultation)/i;

/** State and actions of the Toni website chat. */
export const useToniChat = (lang: Lang) => {
  const de = lang === 'de';
  const [items, setItems] = useState<ChatItem[]>([]);
  const [sending, setSending] = useState(false);
  const chatIdRef = useRef<string | undefined>(undefined);
  const nextId = useRef(1);

  const add = (...entries: ChatEntry[]) =>
    setItems((prev) => [...prev, ...entries.map((e) => ({ ...e, id: nextId.current++ }))]);

  /** Opens the booking steps in the chat (only one at a time). */
  const openBooking = (intro = true) => {
    setItems((prev) => prev.filter((item) => item.from !== 'booking'));
    add(
      ...(intro
        ? [{ from: 'toni' as const, text: de ? 'Gern! Wählen Sie hier direkt Ihren Wunschtermin – das dauert keine Minute.' : 'Sure! Pick your preferred slot right here – it takes less than a minute.' }]
        : []),
      { from: 'booking' }
    );
  };

  const transcript = () => {
    const lines = items
      .filter((item): item is Extract<ChatItem, { text: string }> => item.from === 'user' || item.from === 'toni')
      .map((item) => `${item.from === 'user' ? 'Besucher' : 'Toni'}: ${item.text}`);
    const text = lines.length ? `Gebucht im Chat mit Toni. Verlauf:\n${lines.join('\n')}` : 'Gebucht im Chat mit Toni.';
    return text.length > 1900 ? `…${text.slice(-1900)}` : text;
  };

  const onBooked = (start: string, timeZone: string) =>
    add({
      from: 'toni',
      text: de
        ? `Perfekt, Ihr Termin am ${formatAppointment(start, lang, timeZone)} steht. Sie erhalten gleich eine Bestätigung per E-Mail – wir rufen Sie dann an. Kann ich sonst noch helfen?`
        : `Great, your appointment on ${formatAppointment(start, lang, timeZone)} is booked. You will receive a confirmation by email shortly. Anything else I can help with?`,
    });

  const send = async (raw: string) => {
    const input = raw.trim();
    if (!input || sending) return;
    const lastToni = [...items].reverse().find((item) => item.from === 'toni');
    const wantsBooking =
      BOOKING_INTENT.test(input) || (AGREE.test(input) && !!lastToni && 'text' in lastToni && OFFER.test(lastToni.text));
    add({ from: 'user', text: input });
    if (wantsBooking) {
      openBooking();
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, chatId: chatIdRef.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) throw new Error(data.error ?? `HTTP ${res.status}`);
      chatIdRef.current = data.chatId;
      add({ from: 'toni', text: data.reply });
    } catch (err) {
      const limited = String((err as Error).message).includes('rate_limited');
      add({
        from: 'error',
        text: limited
          ? de ? 'Sie haben viele Nachrichten gesendet. Bitte versuchen Sie es später erneut.' : 'You have sent many messages. Please try again later.'
          : de ? 'Toni ist gerade nicht erreichbar. Bitte versuchen Sie es gleich noch einmal.' : 'Toni is not available right now. Please try again shortly.',
      });
    } finally {
      setSending(false);
    }
  };

  return { lang, items, sending, send, openBooking, transcript, onBooked };
};

export type ToniChatState = ReturnType<typeof useToniChat>;
