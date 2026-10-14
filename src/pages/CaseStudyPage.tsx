import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import { CASE_UI, findCaseStudy } from '../content/caseStudies';
import { BOOKING_PATHS } from '../content/booking';
import { HOME_PATH } from '../seo/site';

const CaseStudyPage: React.FC<{ slug: string }> = ({ slug }) => {
  const study = findCaseStudy(slug)!;
  const ui = CASE_UI.de;

  return (
    <>
      <section className="section-dark relative bg-background border-b border-border overflow-hidden pt-28 md:pt-40 pb-16 md:pb-24">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link to={HOME_PATH.de} className="hover:text-accent transition-colors inline-block py-2.5">Start</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link to={`${HOME_PATH.de}#projekte`} className="hover:text-accent transition-colors inline-block py-2.5">Referenzen</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-primary">{study.client}</li>
              </ol>
            </nav>
            <SectionLabel>{ui.label} · {study.client}</SectionLabel>
            <h1 className="heading-xl text-primary mb-8">{study.headline}</h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed mb-8">{study.teaser}</p>
            <ul className="flex flex-wrap gap-2">
              {study.tags.map((tag) => (
                <li key={tag} className="px-3 py-1.5 border border-border text-xs font-display text-muted uppercase tracking-widest">{tag}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface border-b border-border">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-border border-x border-border">
          {study.highlights.map((h) => (
            <div key={h.label} className="bg-surface p-8">
              <p className="text-3xl md:text-4xl font-display font-bold text-accent">{h.value}</p>
              <p className="text-muted mt-2">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      <article className="section-padding bg-background">
        <div className="container mx-auto px-6 max-w-3xl space-y-16">
          <div>
            <SectionLabel>01</SectionLabel>
            <h2 className="heading-section mb-6">{ui.situation}</h2>
            <div className="space-y-4 text-lg text-muted leading-relaxed">
              {study.situation.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </div>
          </div>

          <div>
            <SectionLabel>02</SectionLabel>
            <h2 className="heading-section mb-8">{ui.solution}</h2>
            <ul className="space-y-6">
              {study.solution.map((s) => (
                <li key={s.title} className="flex gap-4">
                  <Check aria-hidden="true" className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-display font-semibold text-primary mb-1">{s.title}</h3>
                    <p className="text-muted leading-relaxed">{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {study.features && (
            <div className="section-dark bg-background border border-border p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-6">{study.features.title}</h2>
              <ul className="space-y-4">
                {study.features.items.map((item) => (
                  <li key={item} className="flex gap-3 text-primary leading-relaxed">
                    <Check aria-hidden="true" className="w-5 h-5 text-accent shrink-0 mt-1" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <SectionLabel>03</SectionLabel>
            <h2 className="heading-section mb-6">{ui.result}</h2>
            <div className="space-y-4 text-lg text-primary leading-relaxed">
              {study.result.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to={BOOKING_PATHS.de.book} className="btn-primary">
              {ui.cta} <ArrowRight aria-hidden="true" className="w-5 h-5" />
            </Link>
            <Link to={study.service.path} className="btn-ghost">{study.service.label}</Link>
          </div>
        </div>
      </article>
    </>
  );
};

export default CaseStudyPage;
