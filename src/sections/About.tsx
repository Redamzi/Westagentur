import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const advantages = t('about.advantages', { returnObjects: true });

  return (
    <section id="about" className="relative py-32 bg-background border-b border-border overflow-hidden">
      
      {/* Background Number */}
      <div className="bg-number top-0 -right-10 text-right">02</div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-primary uppercase"
          >
            {t('about.title')}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Text Content */}
          <div className="space-y-8 text-xl font-sans text-muted leading-relaxed">
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {t('about.p1')}
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              {t('about.p2')}
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              {t('about.p3')}
            </motion.p>
          </div>

          {/* Advantages List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="border-l border-border pl-8 md:pl-16 flex flex-col justify-center"
          >
            <h3 className="text-sm font-display text-accent uppercase tracking-widest mb-8">{t('about.advantages_title')}</h3>
            <ul className="space-y-6">
              {advantages.map((adv, index) => (
                <li key={index} className="flex items-start gap-4 text-primary font-display text-lg">
                  <span className="text-border mt-1">→</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
