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
 * Shows e-mail address or phone number only after a click. The value is not part
 * of the HTML or the rendered DOM before that, so crawlers and AI scrapers cannot read it.
 */
const ProtectedContact: React.FC<ProtectedContactProps> = ({ kind, lang, className = '', icon = false }) => {
  const [value, setValue] = useState<string>();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const Icon = kind === 'email' ? Mail : Phone;
  const iconEl = icon ? <Icon aria-hidden="true" className="w-5 h-5 text-accent shrink-0" /> : null;

  useEffect(() => {
    if (value) linkRef.current?.focus();
  }, [value]);

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
