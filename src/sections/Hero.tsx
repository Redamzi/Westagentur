import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BOOKING_PATHS } from '../content/booking';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'de';
  const pills = t('hero.pills', { returnObjects: true });

  // Custom Highlight logic to make specific words italic and colored
  const h1Text = t('hero.h1');
  const renderHighlightedText = (text: string) => {
    // We split by "KI-Automatisierung" or "AI Automation" to give it the pro-look
    const parts = text.split(/(KI-Automatisierung|AI Automation)/gi);
    return parts.map((part, i) => 
      (part.toLowerCase() === 'ki-automatisierung' || part.toLowerCase() === 'ai automation') 
        ? <span key={i} className="text-accent italic font-normal">{part}</span>
        : part
    );
  };

  return (
    <section className="section-dark relative min-h-[90vh] flex items-center pt-28 md:pt-32 pb-16 md:pb-20 bg-background overflow-hidden border-b border-border">
      {/* Structural Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl">
          
          <motion.div 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10"
          >
            {pills.map((pill, index) => (
              <span key={index} className="px-3 py-1.5 border border-border text-xs font-display text-muted uppercase tracking-widest">
                {pill}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="heading-xl text-primary mb-8"
          >
            {renderHighlightedText(h1Text)}
          </motion.h1>
          
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-muted mb-10 md:mb-12 max-w-2xl leading-relaxed"
          >
            {t('hero.subheadline')}
          </motion.p>
          
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-12 md:mb-16"
          >
            <Link to={BOOKING_PATHS[lang].book} className="btn-primary w-full sm:w-auto group">
              {t('hero.cta_primary')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#projekte" className="btn-ghost w-full sm:w-auto">
              {t('hero.cta_secondary')}
            </a>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-8 border-t border-border inline-block"
          >
             <span className="text-sm font-medium text-muted uppercase tracking-wider">
               {t('hero.trust')}
             </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
