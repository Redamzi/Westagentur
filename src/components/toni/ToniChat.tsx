import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Loader2, Send } from 'lucide-react';
import { legalPath } from '../../seo/pages';
import type { ToniChatState } from './useToniChat';

// The booking steps are only needed once a visitor asks for an appointment.
const ChatBooking = lazy(() => import('./ChatBooking'));

interface ChatViewProps {
  chat: ToniChatState;
  examples: string[];
  /** Full-screen variant: the message list takes all free space. */
  fill?: boolean;
  /** Little space (keyboard open): hide the privacy note. */
  compact?: boolean;
}

/** Message list, booking steps and input of the Toni chat. */
export const ChatView: React.FC<ChatViewProps> = ({ chat, examples, fill = false, compact = false }) => {
  const { lang, items, sending } = chat;
  const de = lang === 'de';
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const lastItem = items[items.length - 1];

  // New text messages (and a smaller list when the keyboard opens) scroll to the bottom;
  // the booking widget scrolls itself.
  useEffect(() => {
    const list = listRef.current;
    if (list && lastItem?.from !== 'booking') list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [items.length, sending, lastItem?.from, compact]);

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
            <Suspense key={item.id} fallback={<Loader2 aria-hidden="true" className="w-5 h-5 animate-spin text-muted" />}>
              <ChatBooking lang={lang} transcript={chat.transcript} onBooked={chat.onBooked} />
            </Suspense>
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

      <p className={`${compact ? 'sr-only' : ''} mt-3 text-xs text-muted leading-relaxed`}>
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
