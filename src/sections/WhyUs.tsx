import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const WhyUs = () => {
  const { t } = useTranslation();
  const reasons: string[] = t('whyus.reasons', { returnObjects: true });

  return (
    <section className="relative py-32 bg-background border-b border-border overflow-hidden">
      
      {/* Background Number */}
      <div className="bg-number top-0 -right-10 text-right">04</div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-primary uppercase"
          >
            {t('whyus.title')}
          </motion.h2>
        </div>

        <div className="border-t border-l border-border flex flex-wrap">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full md:w-1/2 p-8 border-b border-r border-border hover:bg-surface transition-colors duration-300"
            >
              <div className="text-accent font-display text-sm font-bold tracking-widest mb-4">
                {(index + 1).toString().padStart(2, '0')} //
              </div>
              <p className="text-xl text-primary font-sans leading-snug">
                {reason}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
