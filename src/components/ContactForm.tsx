import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { legalPath } from '../seo/pages';
import { CONTACT, type Lang } from '../seo/site';
import type { ServiceKey } from '../content/services';
import { inputClass, labelClass } from './formStyles';

type Field = 'name' | 'email' | 'phone' | 'company' | 'message' | 'consent';
type Status = 'idle' | 'sending' | 'success' | 'error' | 'rate_limited';

const SERVICE_OPTIONS = ['webdesign', 'automation', 'telephony', 'other'] as const;


interface ContactFormProps {
  lang: Lang;
  defaultService?: ServiceKey;
}

const ContactForm: React.FC<ContactFormProps> = ({ lang, defaultService }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const startedAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      company: form.get('company'),
      service: form.get('service'),
      message: form.get('message'),
      consent: form.get('consent') === 'on',
      website: form.get('website'),
      startedAt: startedAt.current,
      page: pathname,
      lang,
    };

    setStatus('sending');
    setErrors({});
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('success');
      } else if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setStatus('idle');
        const first = Object.keys(data.errors)[0];
        document.getElementById(`contact-${first}`)?.focus();
      } else {
        setStatus(res.status === 429 ? 'rate_limited' : 'error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="bg-surface border border-border p-8 outline-none">
        <CheckCircle2 aria-hidden="true" className="w-10 h-10 text-accent mb-4" />
        <h3 className="text-2xl font-display font-bold text-primary mb-3">{t('form.success_title')}</h3>
        <p className="text-muted leading-relaxed">{t('form.success')}</p>
      </div>
    );
  }

  const fieldError = (field: Field) =>
    errors[field] ? (
      <p id={`contact-${field}-error`} className="mt-2 text-sm text-red-400">
        {t(`form.errors.${field}`)}
      </p>
    ) : null;

  const a11y = (field: Field) => ({
    id: `contact-${field}`,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="relative bg-surface border border-border p-6 md:p-8 space-y-5">
      <h3 className="text-2xl font-display font-bold text-primary">{t('form.title')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className={labelClass}>{t('form.name')} *</label>
          <input {...a11y('name')} name="name" type="text" autoComplete="name" required maxLength={100} className={inputClass} />
          {fieldError('name')}
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>{t('form.email')} *</label>
          <input {...a11y('email')} name="email" type="email" autoComplete="email" required maxLength={200} className={inputClass} />
          {fieldError('email')}
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>{t('form.phone')}</label>
          <input {...a11y('phone')} name="phone" type="tel" autoComplete="tel" maxLength={30} className={inputClass} />
          {fieldError('phone')}
        </div>
        <div>
          <label htmlFor="contact-company" className={labelClass}>{t('form.company')}</label>
          <input {...a11y('company')} name="company" type="text" autoComplete="organization" maxLength={120} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="contact-service" className={labelClass}>{t('form.service')}</label>
        <select id="contact-service" name="service" defaultValue={defaultService ?? 'webdesign'} className={inputClass}>
          {SERVICE_OPTIONS.map((key) => (
            <option key={key} value={key}>{t(`form.services.${key}`)}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>{t('form.message')} *</label>
        <textarea {...a11y('message')} name="message" rows={5} required maxLength={5000} className={inputClass} />
        {fieldError('message')}
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
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

      {(status === 'error' || status === 'rate_limited') && (
        <p role="alert" className="text-sm text-red-400">
          {t(status === 'error' ? 'form.error' : 'form.rate_limited')}{' '}
          <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a>.
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-60">
        {status === 'sending' ? t('form.sending') : t('form.submit')}
        <ArrowRight aria-hidden="true" className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ContactForm;
