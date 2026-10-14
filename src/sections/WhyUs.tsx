import React from 'react';
import { useTranslation } from 'react-i18next';
import SectionLabel from '../components/SectionLabel';

const WhyUs = () => {
  const { t } = useTranslation();
  const reasons = t('whyus.reasons', { returnObjects: true });

  return (
    <section className="relative section-padding bg-background border-b border-border overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
          <SectionLabel>{t('labels.whyus')}</SectionLabel>
          <h2
            className="heading-section"
          >
            {t('whyus.title')}
          </h2>
          </div>
        </div>

        <div className="border-t border-l border-border flex flex-wrap">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="w-full md:w-1/2 p-8 border-b border-r border-border hover:bg-surface transition-colors duration-300"
            >
              <div className="text-accent font-display text-sm font-bold tracking-widest mb-4">
                {(index + 1).toString().padStart(2, '0')} //
              </div>
              <p className="text-lg md:text-xl text-primary font-sans leading-snug">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
