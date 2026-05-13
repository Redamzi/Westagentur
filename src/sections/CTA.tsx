import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  const { t } = useTranslation();

  return (
    <section id="kontakt" className="relative py-32 bg-accent text-background overflow-hidden">
      {/* Structural Grid Background for CTA */}
      <div className="absolute inset-0 grid-bg opacity-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-xl mb-8"
          >
            {t('cta.title')}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-display font-medium mb-6"
          >
            {t('cta.sub')}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl font-sans text-background/80 mb-16 max-w-2xl"
          >
            {t('cta.desc')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8"
          >
            <a
              href="mailto:mail@westagentur.de"
              className="inline-flex items-center justify-center gap-2 bg-background text-primary px-8 py-5 font-display font-medium text-lg hover:bg-neutral-800 transition-colors duration-300 relative overflow-hidden group w-full sm:w-auto"
            >
              {t('cta.button')} 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-display font-bold uppercase tracking-widest text-background/60">
                {t('cta.phone_text')}
              </span>
              <a href="tel:+4915227506958" className="text-2xl font-display font-bold hover:text-white transition-colors">
                {t('cta.phone')}
              </a>
              <span className="text-sm font-sans text-background/80 mt-1">
                {t('cta.callback')}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
