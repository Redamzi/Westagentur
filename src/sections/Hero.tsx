import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BrainCircuit, CalendarCheck, Database, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BOOKING_PATHS } from '../content/booking';

const ease = [0.16, 1, 0.3, 1] as const;

const FLOW_TEXT = {
  de: {
    label: 'Ablauf einer automatisierten Anfrage: Website, KI-Automatisierung, Terminbuchung und CRM',
    system: 'Automatisierung',
    title: 'Vernetzte Prozesse',
    status: 'Aktiv',
    website: ['Website & Leads', 'Besucher · Kontaktanfragen'],
    ai: ['KI-Automatisierung', 'Analysieren · Antworten · Weiterleiten'],
    booking: 'Terminbuchung',
    crm: 'CRM & Daten',
    footer: 'Weniger Handarbeit. Mehr Wachstum.',
  },
  en: {
    label: 'Flow of an automated inquiry: website, AI automation, appointment booking and CRM',
    system: 'Automation',
    title: 'Connected processes',
    status: 'Active',
    website: ['Website & leads', 'Visitors · Inquiries'],
    ai: ['AI automation', 'Analyse · Respond · Route'],
    booking: 'Appointments',
    crm: 'CRM & data',
    footer: 'Less manual work. More growth.',
  },
};

const Hero = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'de';
  const pills = t('hero.pills', { returnObjects: true });
  const flow = FLOW_TEXT[lang];
  const reduceMotion = !!useReducedMotion();

  // Custom Highlight logic to make specific words italic and colored
  const h1Text = t('hero.h1');
  const renderHighlightedText = (text: string) => {
    // We split by "KI-Automatisierung" or "AI Automation" to give it the pro-look
    const parts = text.split(/(KI-Automatisierung|AI Automation)/gi);
    return parts.map((part, i) =>
      (part.toLowerCase() === 'ki-automatisierung' || part.toLowerCase() === 'ai automation')
        ? <span key={i} className="text-accent italic font-normal whitespace-nowrap">{part}</span>
        : part
    );
  };

  return (
    <section className="section-dark relative min-h-[90vh] flex items-center pt-28 md:pt-32 pb-16 md:pb-20 bg-background overflow-hidden border-b border-border">
      {/* Structural Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] items-center gap-12 xl:gap-20">
        {/* Text stays visible right away (no entry animation) – it is what Google measures first. */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10">
            {pills.map((pill, index) => (
              <span key={index} className="px-3 py-1.5 border border-border text-xs font-display text-muted uppercase tracking-widest">
                {pill}
              </span>
            ))}
          </div>

          <h1 className="heading-xl lg:!text-[clamp(3rem,5.2vw,4.75rem)] text-primary mb-8">
            {renderHighlightedText(h1Text)}
          </h1>

          <p className="text-lg md:text-xl text-muted mb-10 md:mb-12 max-w-2xl leading-relaxed">
            {t('hero.subheadline')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-12 md:mb-16">
            <Link to={BOOKING_PATHS[lang].book} className="btn-primary w-full sm:w-auto group">
              {t('hero.cta_primary')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#projekte" className="btn-ghost w-full sm:w-auto">
              {t('hero.cta_secondary')}
            </a>
          </div>

          <div className="pt-8 border-t border-border inline-block">
             <span className="text-sm font-medium text-muted uppercase tracking-wider">
               {t('hero.trust')}
             </span>
          </div>
        </div>

        {/* Workflow illustration (desktop only, so the buttons stay at the top on phones) */}
        <figure role="img" aria-label={flow.label} className="hidden lg:block relative m-0">
          <div aria-hidden="true" className="relative border border-border bg-surface/80 backdrop-blur-sm p-6 xl:p-7 shadow-2xl shadow-black">
            <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-border">
              <div>
                <p className="text-xs font-display uppercase tracking-[0.2em] text-muted">{flow.system}</p>
                <p className="font-display font-semibold text-primary mt-1">{flow.title}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs text-muted uppercase tracking-wider">
                <span className="relative flex w-2 h-2">
                  {!reduceMotion && <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />}
                  <span className="relative w-2 h-2 rounded-full bg-accent" />
                </span>
                {flow.status}
              </span>
            </div>

            <FlowNode icon={<Globe className="w-5 h-5" />} title={flow.website[0]} subtitle={flow.website[1]} delay={0.2} reduceMotion={reduceMotion} />
            <FlowConnector delay={0} reduceMotion={reduceMotion} />
            <FlowNode featured icon={<BrainCircuit className="w-5 h-5" />} title={flow.ai[0]} subtitle={flow.ai[1]} delay={0.5} reduceMotion={reduceMotion} />
            <FlowConnector delay={1.2} reduceMotion={reduceMotion} split />
            <div className="grid grid-cols-2 gap-3">
              <FlowNode compact icon={<CalendarCheck className="w-4 h-4" />} title={flow.booking} delay={0.8} reduceMotion={reduceMotion} />
              <FlowNode compact icon={<Database className="w-4 h-4" />} title={flow.crm} delay={0.95} reduceMotion={reduceMotion} />
            </div>

            <p className="mt-5 pt-4 border-t border-border text-sm text-muted">{flow.footer}</p>
          </div>
        </figure>
      </div>
    </section>
  );
};

type FlowNodeProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  featured?: boolean;
  compact?: boolean;
  delay: number;
  reduceMotion: boolean;
};

/** One step of the workflow; fades in once, then stays. */
const FlowNode = ({ icon, title, subtitle, featured = false, compact = false, delay, reduceMotion }: FlowNodeProps) => (
  <motion.div
    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease }}
    className={`flex gap-3 border transition-colors duration-300 hover:border-accent ${
      compact ? 'flex-col items-start p-4' : 'items-center p-4'
    } ${featured ? 'border-accent/60 bg-accent/10' : 'border-border bg-background'}`}
  >
    <span className="text-accent shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="font-display font-semibold text-primary leading-snug">{title}</p>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
  </motion.div>
);

/** Vertical line with a data pulse travelling down (transform only, cheap to animate). */
const FlowConnector = ({ delay, reduceMotion, split = false }: { delay: number; reduceMotion: boolean; split?: boolean }) => (
  <div className="relative h-10">
    {split ? (
      <>
        <span className="absolute left-1/2 top-0 h-1/2 w-px bg-border" />
        <span className="absolute left-1/4 right-1/4 top-1/2 h-px bg-border" />
        <span className="absolute left-1/4 top-1/2 h-1/2 w-px bg-border" />
        <span className="absolute right-1/4 top-1/2 h-1/2 w-px bg-border" />
      </>
    ) : (
      <span className="absolute left-1/2 inset-y-0 w-px bg-border" />
    )}
    {!reduceMotion && (
      <motion.span
        className="absolute left-1/2 top-0 -ml-[3px] w-[7px] h-[7px] bg-accent shadow-[0_0_12px_rgb(var(--c-accent))]"
        animate={{ y: [0, split ? 16 : 34], opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, delay: 1 + delay, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
      />
    )}
  </div>
);

export default Hero;
