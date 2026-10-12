import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Phone } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import { CONTACT } from '../seo/site';
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
          <p className="text-lg text-muted mb-10 max-w-xl">{t('cta.desc')}</p>

          <p className="text-sm font-display font-bold uppercase tracking-widest text-muted mb-3">{t('cta.phone_text')}</p>
          <ul className="space-y-1 mb-4">
            <li>
              <a href={CONTACT.phoneHref} className="inline-flex items-center gap-3 py-2 text-2xl font-display font-bold text-primary hover:text-accent transition-colors">
                <Phone aria-hidden="true" className="w-5 h-5 text-accent" /> {CONTACT.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-3 py-2 text-lg font-display text-primary hover:text-accent transition-colors">
                <Mail aria-hidden="true" className="w-5 h-5 text-accent" /> {CONTACT.email}
              </a>
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
