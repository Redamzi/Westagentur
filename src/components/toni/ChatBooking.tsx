import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatAppointment, formatSlot } from '../../content/booking';
import { legalPath } from '../../seo/pages';
import type { Lang } from '../../seo/site';

interface SlotDay {
  date: string;
  slots: string[];
}

type Step = 'day' | 'time' | 'details' | 'done';
type Field = 'name' | 'email' | 'phone' | 'consent';

const SERVICES = ['webdesign', 'automation', 'telephony'] as const;
const WEEKDAYS = { de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] };

const fieldClass =
  'w-full bg-surface border border-border px-3 py-2.5 min-h-[44px] text-primary placeholder:text-muted focus:border-accent outline-none aria-[invalid=true]:border-red-400';

/** Days of a month as a Monday-first grid (null = empty cell). */
const monthGrid = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  return [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
  ];
};

interface ChatBookingProps {
  lang: Lang;
  /** Chat transcript, sent along as note so the owner sees what was discussed. */
  transcript: () => string;
  onBooked: (start: string, timeZone: string) => void;
}

/** Appointment booking inside the Toni chat: 1. day, 2. time, 3. details. */
const ChatBooking: React.FC<ChatBookingProps> = ({ lang, transcript, onBooked }) => {
  const { t } = useTranslation();
  const de = lang === 'de';
  const [step, setStep] = useState<Step>('day');
  const [load, setLoad] = useState<'loading' | 'error' | 'ready'>('loading');
  const [days, setDays] = useState<SlotDay[]>([]);
  const [timeZone, setTimeZone] = useState('Europe/Berlin');
  const [month, setMonth] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const startedAt = useRef(Date.now());
  const rootRef = useRef<HTMLDivElement>(null);

  const loadSlots = useCallback(async () => {
    setLoad('loading');
    try {
      const res = await fetch('/api/slots?days=31');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDays(data.days);
      setTimeZone(data.timezone);
      setMonth((current) => current || data.days[0]?.date.slice(0, 7) || '');
      setLoad('ready');
    } catch {
      setLoad('error');
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Keep the top of the widget in view inside the chat list (without scrolling the page).
  useEffect(() => {
    const el = rootRef.current;
    const list = el?.closest<HTMLElement>('[data-chat-list]');
    if (el && list) list.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  }, [step, load]);

  const slotsOf = (d: string) => days.find((day) => day.date === d)?.slots ?? [];
  const months = [...new Set(days.map((d) => d.date.slice(0, 7)))];
  const monthIndex = months.indexOf(month);
  const noon = (d: string) => `${d}T12:00:00Z`;
  const time = (iso: string) => formatSlot(iso, lang, timeZone, { hour: '2-digit', minute: '2-digit' });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setErrors({});
    setNotice('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          service: form.get('service'),
          note: transcript(),
          consent: form.get('consent') === 'on',
          website: form.get('website'),
          startedAt: startedAt.current,
          page: window.location.pathname,
          via: 'chat',
          lang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStep('done');
        onBooked(start, timeZone);
      } else if (res.status === 409) {
        setNotice(de ? 'Dieser Termin wurde gerade vergeben. Bitte wählen Sie eine andere Uhrzeit.' : 'This slot was just taken. Please choose another time.');
        setStart('');
        setStep('time');
        loadSlots();
      } else if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        rootRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(data.errors)[0]}"]`)?.focus();
      } else {
        throw new Error();
      }
    } catch {
      setNotice(de ? 'Die Buchung hat nicht geklappt. Bitte versuchen Sie es erneut.' : 'Booking failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const stepLabel = (n: number, label: string) => (
    <p className="text-xs font-display font-bold uppercase tracking-widest text-accent mb-3">
      {de ? `Schritt ${n} von 3` : `Step ${n} of 3`} · {label}
    </p>
  );
  const back = (to: Step) => (
    <button type="button" onClick={() => setStep(to)} className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary min-h-[44px]">
      <ArrowLeft aria-hidden="true" className="w-4 h-4" /> {de ? 'Zurück' : 'Back'}
    </button>
  );
  const err = (field: Field) =>
    errors[field] ? <p id={`cb-${field}-error`} className="mt-1 text-sm text-red-300">{t(`form.errors.${field}`)}</p> : null;
  const a11y = (field: Field) => ({
    name: field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `cb-${field}-error` : undefined,
  });

  let body: React.ReactNode;
  if (load === 'loading') {
    body = (
      <p role="status" className="flex items-center gap-2 text-sm text-muted">
        <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> {de ? 'Freie Termine werden geladen …' : 'Loading free slots …'}
      </p>
    );
  } else if (load === 'error') {
    body = (
      <p role="alert" className="text-sm text-muted">
        {de ? 'Termine konnten nicht geladen werden.' : 'Slots could not be loaded.'}{' '}
        <button type="button" onClick={loadSlots} className="text-accent underline underline-offset-2 min-h-[44px]">
          {de ? 'Erneut versuchen' : 'Try again'}
        </button>
      </p>
    );
  } else if (!days.length) {
    body = <p className="text-sm text-muted">{de ? 'Aktuell sind keine Termine frei.' : 'There are currently no free slots.'}</p>;
  } else if (step === 'day') {
    body = (
      <>
        {stepLabel(1, de ? 'Tag wählen' : 'Choose a day')}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setMonth(months[monthIndex - 1])}
            disabled={monthIndex <= 0}
            aria-label={de ? 'Vorheriger Monat' : 'Previous month'}
            className="w-11 h-11 flex items-center justify-center text-primary disabled:opacity-25"
          >
            <ChevronLeft aria-hidden="true" className="w-5 h-5" />
          </button>
          <p className="font-display font-semibold text-primary">
            {formatSlot(`${month}-15T12:00:00Z`, lang, 'UTC', { month: 'long', year: 'numeric' })}
          </p>
          <button
            type="button"
            onClick={() => setMonth(months[monthIndex + 1])}
            disabled={monthIndex >= months.length - 1}
            aria-label={de ? 'Nächster Monat' : 'Next month'}
            className="w-11 h-11 flex items-center justify-center text-primary disabled:opacity-25"
          >
            <ChevronRight aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS[lang].map((w) => (
            <span key={w} aria-hidden="true" className="text-xs text-muted py-1">{w}</span>
          ))}
          {monthGrid(month).map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const free = slotsOf(d).length > 0;
            return (
              <button
                key={d}
                type="button"
                disabled={!free}
                onClick={() => {
                  setDate(d);
                  setStep('time');
                }}
                aria-label={formatSlot(noon(d), lang, 'UTC', { weekday: 'long', day: 'numeric', month: 'long' })}
                className={`aspect-square min-h-[40px] flex items-center justify-center text-sm font-display transition-colors ${
                  free
                    ? d === date
                      ? 'bg-accent text-background font-bold'
                      : 'border border-accent/50 text-primary hover:bg-accent hover:text-background'
                    : 'text-muted/40'
                }`}
              >
                {Number(d.slice(8))}
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (step === 'time') {
    body = (
      <>
        {stepLabel(2, de ? 'Uhrzeit wählen' : 'Choose a time')}
        <p className="font-display font-semibold text-primary mb-3">
          {formatSlot(noon(date), lang, 'UTC', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {slotsOf(date).map((iso) => (
            <button
              key={iso}
              type="button"
              onClick={() => {
                setStart(iso);
                setNotice('');
                setStep('details');
              }}
              className={`min-h-[44px] border font-display transition-colors ${
                iso === start ? 'bg-accent text-background border-accent' : 'border-border text-primary hover:border-accent hover:text-accent'
              }`}
            >
              {time(iso)}
            </button>
          ))}
        </div>
        <div className="mt-2">{back('day')}</div>
      </>
    );
  } else if (step === 'details') {
    body = (
      <form onSubmit={submit} noValidate className="relative space-y-3">
        {stepLabel(3, de ? 'Ihre Angaben' : 'Your details')}
        <p className="p-3 border border-accent bg-accent/10 font-display font-semibold text-primary">
          {formatAppointment(start, lang, timeZone)}
        </p>
        <div>
          <label htmlFor="cb-name" className="block text-sm text-primary mb-1">{t('form.name')} *</label>
          <input id="cb-name" {...a11y('name')} autoComplete="name" maxLength={100} className={fieldClass} />
          {err('name')}
        </div>
        <div>
          <label htmlFor="cb-phone" className="block text-sm text-primary mb-1">{de ? 'Telefon (wir rufen Sie an)' : 'Phone (we will call you)'} *</label>
          <input id="cb-phone" {...a11y('phone')} type="tel" autoComplete="tel" maxLength={30} className={fieldClass} />
          {err('phone')}
        </div>
        <div>
          <label htmlFor="cb-email" className="block text-sm text-primary mb-1">{t('form.email')} *</label>
          <input id="cb-email" {...a11y('email')} type="email" autoComplete="email" maxLength={200} className={fieldClass} />
          {err('email')}
        </div>
        <div>
          <label htmlFor="cb-service" className="block text-sm text-primary mb-1">{t('form.service')}</label>
          <select id="cb-service" name="service" className={fieldClass}>
            {SERVICES.map((key) => (
              <option key={key} value={key}>{t(`form.services.${key}`)}</option>
            ))}
          </select>
        </div>
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label htmlFor="cb-website">Website</label>
          <input id="cb-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label className="flex items-start gap-3 text-sm text-muted leading-relaxed">
            <input type="checkbox" {...a11y('consent')} className="mt-0.5 w-5 h-5 shrink-0 accent-[rgb(var(--c-accent))]" />
            <span>
              {t('form.consent_before')}
              <Link to={legalPath('privacy')} className="text-accent underline underline-offset-2">{t('form.consent_link')}</Link>
              {t('form.consent_after')} *
            </span>
          </label>
          {err('consent')}
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full min-h-[52px] flex items-center justify-center gap-2 bg-accent hover:bg-accent/85 disabled:opacity-60 text-background font-display font-semibold transition-colors"
        >
          {sending && <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" />}
          {sending
            ? de ? 'Wird gebucht …' : 'Booking …'
            : de ? `Termin um ${time(start)} Uhr buchen` : `Book ${time(start)}`}
        </button>
        {back('time')}
      </form>
    );
  } else {
    body = (
      <div role="status" className="text-center py-2">
        <CalendarCheck aria-hidden="true" className="w-9 h-9 text-accent mx-auto mb-2" />
        <p className="font-display font-bold text-primary">{de ? 'Ihr Termin ist gebucht!' : 'Your appointment is booked!'}</p>
        <p className="text-primary">{formatAppointment(start, lang, timeZone)}</p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="border border-border bg-surface p-4">
      {notice && <p role="alert" className="mb-3 text-sm text-red-300">{notice}</p>}
      {body}
    </div>
  );
};

export default ChatBooking;
