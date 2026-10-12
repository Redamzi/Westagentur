import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import AIAssistant from '../sections/AIAssistant';
import { SERVICES, SERVICE_UI, type ServiceKey } from '../content/services';
import { HOME_PATH, type Lang } from '../seo/site';

interface ServicePageProps {
  serviceKey: ServiceKey;
  lang: Lang;
}

const ServicePage: React.FC<ServicePageProps> = ({ serviceKey, lang }) => {
  const s = SERVICES[lang][serviceKey];
  const ui = SERVICE_UI[lang];

  return (
    <>
      {/* Hero */}
      <section className="section-dark relative bg-background border-b border-border overflow-hidden pt-28 md:pt-40 pb-16 md:pb-24">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to={HOME_PATH[lang]} className="hover:text-accent transition-colors inline-block py-2.5">
                  {ui.home}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-primary">{s.navLabel}</li>
            </ol>
          </nav>
          <h1 className="heading-xl text-primary mb-8">{s.h1}</h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed mb-10">{s.intro}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#kontakt" className="btn-primary w-full sm:w-auto">
              {ui.cta} <ArrowRight className="w-5 h-5" />
            </a>
            {s.demo && (
              <a href="#ki-assistent" className="btn-ghost w-full sm:w-auto">
                {ui.demo}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <h2 className="heading-section mb-12 md:mb-16">{ui.benefits}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {s.benefits.map((b, i) => (
              <div key={b.title} className="card-swiss">
                <span className="text-accent font-display text-sm font-bold tracking-widest mb-4 block">
                  {(i + 1).toString().padStart(2, '0')} //
                </span>
                <h3 className="text-xl md:text-2xl font-display font-semibold text-primary mb-3">{b.title}</h3>
                <p className="text-muted leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding bg-surface border-b border-border">
        <div className="container mx-auto px-6">
          <h2 className="heading-section mb-12 md:mb-16">{ui.packages}</h2>
          {s.packages ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {s.packages.map((p) => (
                <div key={p.name} className="border border-border bg-background p-8">
                  <h3 className="text-2xl font-display font-bold text-primary">{p.name}</h3>
                  <p className="text-3xl md:text-4xl font-display font-bold text-accent my-4">{p.price}</p>
                  <p className="text-muted leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-2xl md:text-3xl font-display font-bold text-accent mb-6">{ui.pricingIndividual}</p>
          )}
          <p className="text-muted text-lg max-w-3xl">{s.priceNote}</p>
        </div>
      </section>

      {s.demo && <AIAssistant />}

      {/* Process */}
      <section className="section-padding bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <h2 className="heading-section mb-12 md:mb-16">{ui.process}</h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {s.steps.map((step, i) => (
              <li key={step.title} className="border-t-2 border-accent pt-6">
                <span className="text-accent font-display font-bold text-sm tracking-widest">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <h3 className="text-xl font-display font-semibold text-primary mt-2 mb-2">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background border-b border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="heading-section mb-12">{ui.faq}</h2>
          <div className="border-t border-border">
            {s.faq.map((item) => (
              <details key={item.q} className="group border-b border-border">
                <summary className="flex items-center justify-between gap-4 py-6 cursor-pointer list-none text-lg md:text-xl font-display font-medium text-primary hover:text-accent transition-colors">
                  {item.q}
                  <Plus aria-hidden="true" className="w-5 h-5 shrink-0 text-accent group-open:rotate-45 transition-transform" />
                </summary>
                <p className="pb-6 text-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicePage;
