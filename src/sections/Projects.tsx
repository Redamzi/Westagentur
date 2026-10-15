import React from 'react';
import { useTranslation } from '../i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import { CASE_STUDIES } from '../content/caseStudies';
import { BOOKING_PATHS } from '../content/booking';

interface ProjectItem {
  name: string;
  desc: string;
  url: string;
  tag: string;
}

const Projects = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'de';
  const items: ProjectItem[] = t('projects.items', { returnObjects: true });
  const featured = t('projects.featured', { returnObjects: true }) as { slug: string; label: string; title: string; desc: string; cta: string }[];

  return (
    <section id="projekte" className="relative section-padding bg-background border-b border-border overflow-hidden scroll-mt-16">
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 md:mb-16">
          <SectionLabel>{t('labels.projects')}</SectionLabel>
          <h2
            className="heading-section"
          >
            {t('projects.title')}
          </h2>
        </div>

        {/* Featured case studies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {featured.map((item) => (
            <Link
              key={item.slug}
              to={CASE_STUDIES.find((c) => c.slug === item.slug)!.path}
              className="section-dark group flex flex-col bg-background border border-border p-8 md:p-10 hover:border-accent transition-colors"
            >
              <SectionLabel>{item.label}</SectionLabel>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-primary mb-4 leading-tight">{item.title}</h3>
              <p className="text-muted text-lg leading-relaxed mb-8">{item.desc}</p>
              <span className="mt-auto inline-flex items-center gap-2 font-display font-medium text-accent">
                {item.cta}
                <ArrowRight aria-hidden="true" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {items.map((project) => (
            <li key={project.name} className="bg-surface">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group card-swiss h-full flex flex-col justify-between gap-8 md:min-h-[220px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-accent font-display text-xs font-bold tracking-widest uppercase">{project.tag}</span>
                  <ArrowUpRight aria-hidden="true" className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl xl:text-2xl font-display font-semibold text-primary mb-2">{project.name}</h3>
                  <p className="text-muted">{project.desc}</p>
                  <span className="sr-only"> – {t('projects.visit')} (öffnet in neuem Tab)</span>
                </div>
              </a>
            </li>
          ))}
          <li className="section-dark bg-background">
            <Link to={BOOKING_PATHS[lang].book} className="group h-full p-8 flex flex-col justify-between gap-8 md:min-h-[220px]">
              <span className="text-accent font-display text-xs font-bold tracking-widest uppercase">{t('projects.next.tag')}</span>
              <div>
                <h3 className="text-xl md:text-2xl font-display font-semibold text-primary mb-2">{t('projects.next.title')}</h3>
                <span className="inline-flex items-center gap-2 text-accent font-display">
                  {t('projects.next.cta')} <ArrowRight aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Projects;
