import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { revealContact, type Lang } from '../seo/site';

const LABELS: Record<Lang, Record<'email' | 'phone', string>> = {
  de: { email: 'E-Mail-Adresse anzeigen', phone: 'Telefonnummer anzeigen' },
  en: { email: 'Show email address', phone: 'Show phone number' },
};

interface ProtectedContactProps {
  kind: 'email' | 'phone';
  lang: Lang;
  className?: string;
  icon?: boolean;
}

/**
 * Contact details that crawlers and AI scrapers cannot read:
 * - e-mail: visible via CSS generated content, mailto link built on click
 * - phone: revealed on click (not in HTML or DOM before that)
 */
const ProtectedContact: React.FC<ProtectedContactProps> = ({ kind, lang, className = '', icon = false }) => {
  const [value, setValue] = useState<string>();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const Icon = kind === 'email' ? Mail : Phone;
  const iconEl = icon ? <Icon aria-hidden="true" className="w-5 h-5 text-accent shrink-0" /> : null;

  useEffect(() => {
    if (value) linkRef.current?.focus();
  }, [value]);

  // E-mail is shown directly (via CSS, see .email-protected); the mailto link is only built on click.
  if (kind === 'email') {
    return (
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          window.location.href = `mailto:${revealContact('email')}`;
        }}
        aria-label={lang === 'de' ? 'E-Mail an die Westagentur schreiben' : 'Email Westagentur'}
        className={`inline-flex items-center gap-3 min-h-[44px] ${className}`}
      >
        {iconEl}
        <span className="email-protected" />
      </a>
    );
  }

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => setValue(revealContact(kind))}
        className={`inline-flex items-center gap-3 min-h-[44px] underline underline-offset-4 decoration-dotted ${className}`}
      >
        {iconEl}
        {LABELS[lang][kind]}
      </button>
    );
  }

  const href = kind === 'email' ? `mailto:${value}` : `tel:${value.replace(/[^+\d]/g, '')}`;
  return (
    <a ref={linkRef} href={href} className={`inline-flex items-center gap-3 min-h-[44px] ${className}`}>
      {iconEl}
      {value}
    </a>
  );
};

export default ProtectedContact;
