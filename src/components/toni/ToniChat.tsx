import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Loader2, Send } from 'lucide-react';
import { legalPath } from '../../seo/pages';
import { formatAppointment } from '../../content/booking';
import type { Lang } from '../../seo/site';
import ChatBooking from './ChatBooking';

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

interface ChatViewProps {
  chat: ToniChatState;
  examples: string[];
  /** Full-screen variant: the message list takes all free space. */
  fill?: boolean;
  autoFocus?: boolean;
}

/** Message list, booking steps and input of the Toni chat. */
export const ChatView: React.FC<ChatViewProps> = ({ chat, examples, fill = false, autoFocus = false }) => {
  const { lang, items, sending } = chat;
  const de = lang === 'de';
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastItem = items[items.length - 1];

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // New text messages scroll to the bottom; the booking widget scrolls itself.
  useEffect(() => {
    const list = listRef.current;
    if (list && lastItem?.from !== 'booking') list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [items.length, sending, lastItem?.from]);

  const bookingOpen = items.some((item) => item.from === 'booking');

  return (
    <>
      <div
        ref={listRef}
        data-chat-list
        aria-live="polite"
        className={`${fill ? 'flex-1 min-h-0' : 'h-96'} relative overflow-y-auto overscroll-contain border border-border bg-background p-4 space-y-3 mb-3`}
      >
        <p className="max-w-[85%] px-4 py-3 bg-surface border border-border text-primary text-sm leading-relaxed">
          {de ? 'Hallo, ich bin Toni. Was kann ich für Sie tun?' : 'Hi, I am Toni. How can I help you?'}
        </p>
        {!items.length && (
          <div className="flex flex-wrap justify-end gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => chat.send(example.replace(/[„“”"]/g, ''))}
                className="px-3 py-2 border border-accent/60 text-accent text-sm hover:bg-accent hover:text-background transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}
        {items.map((item) =>
          item.from === 'booking' ? (
            <ChatBooking key={item.id} lang={lang} transcript={chat.transcript} onBooked={chat.onBooked} />
          ) : (
            <p
              key={item.id}
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                item.from === 'user'
                  ? 'ml-auto bg-accent text-background'
                  : item.from === 'error'
                    ? 'border border-red-500/60 text-red-300'
                    : 'bg-surface border border-border text-primary'
              }`}
            >
              <span className="sr-only">{item.from === 'user' ? (de ? 'Sie: ' : 'You: ') : 'Toni: '}</span>
              {item.text}
            </p>
          )
        )}
        {sending && (
          <p className="inline-flex items-center gap-2 px-4 py-3 bg-surface border border-border text-muted text-sm">
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
            {de ? 'Toni schreibt …' : 'Toni is typing …'}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          chat.send(draft);
          setDraft('');
        }}
        className="flex gap-2"
      >
        <button
          type="button"
          onClick={() => chat.openBooking(false)}
          disabled={bookingOpen && lastItem?.from === 'booking'}
          aria-label={de ? 'Termin buchen' : 'Book an appointment'}
          title={de ? 'Termin buchen' : 'Book an appointment'}
          className="shrink-0 w-12 min-h-[52px] flex items-center justify-center border border-border text-accent hover:border-accent disabled:opacity-40 transition-colors"
        >
          <CalendarPlus aria-hidden="true" className="w-5 h-5" />
        </button>
        <label htmlFor={fill ? 'toni-chat-input-full' : 'toni-chat-input'} className="sr-only">
          {de ? 'Nachricht an Toni' : 'Message to Toni'}
        </label>
        <input
          id={fill ? 'toni-chat-input-full' : 'toni-chat-input'}
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          autoComplete="off"
          enterKeyHint="send"
          placeholder={de ? 'Ihre Nachricht …' : 'Your message …'}
          className="flex-1 min-w-0 min-h-[52px] px-4 text-base bg-background border border-border text-primary placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label={de ? 'Senden' : 'Send'}
          className="shrink-0 w-12 min-h-[52px] flex items-center justify-center bg-accent hover:bg-accent/85 disabled:opacity-50 text-background transition-colors"
        >
          <Send aria-hidden="true" className="w-5 h-5" />
        </button>
      </form>

      <p className="mt-3 text-xs text-muted leading-relaxed">
        {de
          ? 'Nachrichten werden über Vapi und OpenAI (USA) verarbeitet. Bitte keine sensiblen Daten eingeben. '
          : 'Messages are processed by Vapi and OpenAI (USA). Please do not enter sensitive data. '}
        <Link to={legalPath('privacy')} className="underline underline-offset-2 hover:text-primary">
          {de ? 'Datenschutz' : 'Privacy policy'}
        </Link>
      </p>
    </>
  );
};
