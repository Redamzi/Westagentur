import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CalendarCheck, Check } from 'lucide-react';
import SlotPicker from '../components/SlotPicker';
import { errorClass, inputClass, labelClass } from '../components/formStyles';
import { BOOKING_TEXT, formatAppointment, formatSlot } from '../content/booking';
import { legalPath } from '../seo/pages';
import type { ServiceKey } from '../content/services';
import type { Lang } from '../seo/site';
import ProtectedContact from '../components/ProtectedContact';

type Field = 'name' | 'email' | 'phone' | 'consent';
const SERVICE_OPTIONS: ServiceKey[] = ['webdesign', 'automation', 'telephony'];

const BookingPage: React.FC<{ lang: Lang }> = ({ lang }) => {
  const text = BOOKING_TEXT[lang];
  const { t } = useTranslation();
  const [slot, setSlot] = useState<{ start: string; timeZone: string }>();
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error' | 'taken'>('idle');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [reloadKey, setReloadKey] = useState(0);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (slot) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [slot?.start]);

  useEffect(() => {
    if (status === 'done') doneRef.current?.focus();
  }, [status]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slot) return;
    const form = new FormData(event.currentTarget);
    setStatus('sending');
    setErrors({});
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: slot.start,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          service: form.get('service'),
          note: form.get('note'),
          consent: form.get('consent') === 'on',
          website: form.get('website'),
          startedAt: startedAt.current,
          page: window.location.pathname,
          lang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('done');
      } else if (res.status === 409) {
        setStatus('taken');
        setSlot(undefined);
        setReloadKey((k) => k + 1);
      } else if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setStatus('idle');
        document.getElementById(`booking-${Object.keys(data.errors)[0]}`)?.focus();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const a11y = (field: Field) => ({
    id: `booking-${field}`,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `booking-${field}-error` : undefined,
  });
  const fieldError = (field: Field) =>
    errors[field] ? <p id={`booking-${field}-error`} className={errorClass}>{t(`form.errors.${field}`)}</p> : null;

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-background">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
        <div>
          <h1 className="heading-section mb-6">{text.h1}</h1>
          <p className="text-lg text-muted leading-relaxed mb-8">{text.intro}</p>
          <ul className="space-y-3">
            {text.points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-primary">
                <Check aria-hidden="true" className="w-5 h-5 text-accent shrink-0" /> {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          {status === 'done' && slot ? (
            <div ref={doneRef} tabIndex={-1} role="status" className="bg-surface border border-border p-8 outline-none">
              <CalendarCheck aria-hidden="true" className="w-10 h-10 text-accent mb-4" />
              <h2 className="text-2xl font-display font-bold text-primary mb-2">{text.successTitle}</h2>
              <p className="text-xl font-display text-primary mb-4">{formatAppointment(slot.start, lang, slot.timeZone)}</p>
              <p className="text-muted leading-relaxed">{text.success}</p>
            </div>
          ) : (
            <>
              {status === 'taken' && <p role="alert" className={`${errorClass} mb-6 text-base`}>{text.taken}</p>}
              {!slot ? (
                <>
                  <p className="text-sm font-display font-bold uppercase tracking-widest text-accent mb-6">{text.step1}</p>
                  <SlotPicker lang={lang} onSelect={(start, timeZone) => { setSlot({ start, timeZone }); setStatus('idle'); }} reloadKey={reloadKey} />
                </>
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate className="relative bg-surface border border-border p-6 md:p-8 space-y-5 scroll-mt-24">
                  <p className="text-sm font-display font-bold uppercase tracking-widest text-accent">{text.step2}</p>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-2 border-accent bg-accent/5">
                    <div>
                      <p className="text-sm text-muted">{text.selected}</p>
                      <p className="text-xl md:text-2xl font-display font-bold text-primary">{formatAppointment(slot.start, lang, slot.timeZone)}</p>
                    </div>
                    <button type="button" onClick={() => setSlot(undefined)} className="text-accent underline underline-offset-2 min-h-[44px]">
                      {text.change}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="booking-name" className={labelClass}>{t('form.name')} *</label>
                      <input {...a11y('name')} name="name" autoComplete="name" required maxLength={100} className={inputClass} />
                      {fieldError('name')}
                    </div>
                    <div>
                      <label htmlFor="booking-email" className={labelClass}>{t('form.email')} *</label>
                      <input {...a11y('email')} name="email" type="email" autoComplete="email" required maxLength={200} className={inputClass} />
                      {fieldError('email')}
                    </div>
                    <div>
                      <label htmlFor="booking-phone" className={labelClass}>{lang === 'de' ? 'Telefon' : 'Phone'} *</label>
                      <input {...a11y('phone')} name="phone" type="tel" autoComplete="tel" required maxLength={30} className={inputClass} />
                      <p className="mt-1 text-sm text-muted">{text.phoneHint}</p>
                      {fieldError('phone')}
                    </div>
                    <div>
                      <label htmlFor="booking-company" className={labelClass}>{t('form.company')}</label>
                      <input id="booking-company" name="company" autoComplete="organization" maxLength={120} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking-service" className={labelClass}>{t('form.service')}</label>
                    <select id="booking-service" name="service" className={inputClass}>
                      {SERVICE_OPTIONS.map((key) => (
                        <option key={key} value={key}>{t(`form.services.${key}`)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="booking-note" className={labelClass}>{text.note}</label>
                    <textarea id="booking-note" name="note" rows={3} maxLength={2000} className={inputClass} />
                  </div>

                  <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                    <label htmlFor="booking-website">Website</label>
                    <input id="booking-website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div>
                    <label className="flex items-start gap-3 text-sm text-muted leading-relaxed cursor-pointer">
                      <input {...a11y('consent')} name="consent" type="checkbox" required className="mt-1 w-5 h-5 shrink-0 accent-[rgb(var(--c-accent))]" />
                      <span>
                        {t('form.consent_before')}
                        <Link to={legalPath('privacy')} className="text-accent underline underline-offset-2">{t('form.consent_link')}</Link>
                        {t('form.consent_after')} *
                      </span>
                    </label>
                    {fieldError('consent')}
                  </div>

                  {status === 'error' && <p role="alert" className={errorClass}>{t('form.error')} <ProtectedContact kind="email" lang={lang} /></p>}

                  <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-60">
                    {status === 'sending'
                      ? text.sending
                      : text.submitAt
                          .replace('{date}', formatSlot(slot.start, lang, slot.timeZone, { weekday: 'short', day: 'numeric', month: 'numeric' }))
                          .replace('{time}', formatSlot(slot.start, lang, slot.timeZone, { hour: '2-digit', minute: '2-digit' }))}
                    <ArrowRight aria-hidden="true" className="w-5 h-5" />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingPage;
