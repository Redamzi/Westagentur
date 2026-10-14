import React from 'react';
import { useTranslation } from 'react-i18next';
import SectionLabel from '../components/SectionLabel';

const About = () => {
  const { t } = useTranslation();
  const advantages = t('about.advantages', { returnObjects: true });

  return (
    <section id="about" className="relative section-padding bg-background border-b border-border overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
          <SectionLabel>{t('labels.about')}</SectionLabel>
          <h2
            className="heading-section"
          >
            {t('about.title')}
          </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Text Content */}
          <div className="space-y-6 md:space-y-8 text-lg md:text-xl font-sans text-muted leading-relaxed">
            <p>
              {t('about.p1')}
            </p>
            <p>
              {t('about.p2')}
            </p>
            <p>
              {t('about.p3')}
            </p>
          </div>

          {/* Advantages List */}
          <div
            className="border-l border-border pl-6 md:pl-16 flex flex-col justify-center"
          >
            <h3 className="text-sm font-display text-accent uppercase tracking-widest mb-8">{t('about.advantages_title')}</h3>
            <ul className="space-y-6">
              {advantages.map((adv, index) => (
                <li key={index} className="flex items-start gap-4 text-primary font-display text-lg">
                  <span aria-hidden="true" className="text-accent mt-1">→</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
