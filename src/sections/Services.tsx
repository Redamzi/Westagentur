import React from 'react';
import { useTranslation } from '../i18n';
import SectionLabel from '../components/SectionLabel';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SERVICES, SERVICE_UI, type ServiceKey } from '../content/services';
import type { Lang } from '../seo/site';

// Service cards (by position) that have their own detail page.
const DETAIL_PAGES: (ServiceKey | null)[] = ['webdesign', 'telephony', 'automation'];

const Services = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language === 'en' ? 'en' : 'de') as Lang;
  const items: { title: string; desc: string }[] = t('services.items', { returnObjects: true });

  return (
    <section id="leistungen" className="relative section-padding bg-background border-b border-border overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
          <SectionLabel>{t('labels.services')}</SectionLabel>
          <h2
            className="heading-section"
          >
            {t('services.title')}
          </h2>
          </div>
          <div
            className="w-full md:w-1/3 h-[1px] bg-border"
          />
        </div>

        {/* Structural Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border border border-border">
          {items.map((service, index) => (
            <div
              key={index}
              className="card-swiss md:min-h-[320px] flex flex-col justify-between"
            >
              <div>
                <span className="text-accent font-display text-sm font-bold tracking-widest mb-6 block">
                  {(index + 1).toString().padStart(2, '0')} //
                </span>
                <h3 className="text-2xl font-display font-semibold text-primary mb-4 leading-tight">{service.title}</h3>
              </div>
              <div className="mt-6 md:mt-8">
                <p className="text-muted leading-relaxed font-sans">
                  {service.desc}
                </p>
                {DETAIL_PAGES[index] && (
                  <Link
                    to={SERVICES[lang][DETAIL_PAGES[index]!].path}
                    className="mt-6 inline-flex items-center gap-2 py-2.5 font-display font-medium text-accent hover:underline underline-offset-4"
                  >
                    {SERVICE_UI[lang].more}<span className="sr-only">: {service.title}</span>
                    <ArrowRight aria-hidden="true" className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
