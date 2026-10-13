import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BOOKING_PATHS, BOOKING_TEXT } from '../content/booking';
import ContactForm from '../components/ContactForm';
import ProtectedContact from '../components/ProtectedContact';
import type { PageDef } from '../seo/pages';

const CTA: React.FC<{ page: PageDef }> = ({ page }) => {
  const { t } = useTranslation();

  return (
    <section id="kontakt" className="section-dark relative section-padding bg-background border-t border-border overflow-hidden scroll-mt-16">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-xl text-primary mb-8"
          >
            {t('cta.title')}
          </motion.h2>
          <p className="text-xl md:text-2xl font-display font-medium text-primary mb-6">{t('cta.sub')}</p>
          <p className="text-lg text-muted mb-8 max-w-xl">{t('cta.desc')}</p>
          <Link to={BOOKING_PATHS[page.lang].book} className="btn-primary mb-10">
            {BOOKING_TEXT[page.lang].navLabel} <ArrowRight aria-hidden="true" className="w-5 h-5" />
          </Link>

          <p className="text-sm font-display font-bold uppercase tracking-widest text-muted mb-3">{t('cta.phone_text')}</p>
          <ul className="space-y-1 mb-4">
            <li>
              <ProtectedContact kind="phone" lang={page.lang} icon className="text-xl md:text-2xl font-display font-bold text-primary hover:text-accent transition-colors" />
            </li>
            <li>
              <ProtectedContact kind="email" lang={page.lang} icon className="text-lg font-display text-primary hover:text-accent transition-colors" />
            </li>
          </ul>
          <p className="text-sm text-muted">{t('cta.callback')}</p>
        </div>

        <ContactForm lang={page.lang} defaultService={page.serviceKey} />
      </div>
    </section>
  );
};

export default CTA;
