import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import SectionLabel from '../components/SectionLabel';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const { t } = useTranslation();
  const items: { q: string; a: string }[] = t('faq.items', { returnObjects: true });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative section-padding bg-background border-b border-border overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
          <SectionLabel>{t('labels.faq')}</SectionLabel>
          <h2
            className="heading-section"
          >
            {t('faq.title')}
          </h2>
          </div>
        </div>

        <div className="border-t border-border">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border-b border-border transition-colors hover:bg-surface/50"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between py-6 md:py-8 text-left group"
                >
                  <span className="text-lg md:text-2xl font-display font-medium text-primary pr-4 md:pr-8 group-hover:text-accent transition-colors">
                    {item.q}
                  </span>
                  <div aria-hidden="true" className="w-8 h-8 flex items-center justify-center border border-border shrink-0 text-muted group-hover:border-accent group-hover:text-accent transition-colors">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="reveal-in pb-6 md:pb-8 text-base md:text-lg text-muted font-sans max-w-4xl leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
