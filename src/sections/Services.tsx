import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  const items: { title: string; desc: string }[] = t('services.items', { returnObjects: true });

  return (
    <section id="leistungen" className="relative py-32 bg-background border-b border-border overflow-hidden">
      
      {/* Background Number */}
      <div className="bg-number top-0 -left-10">01</div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-primary uppercase"
          >
            {t('services.title')}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="w-full md:w-1/3 h-[1px] bg-border"
          />
        </div>

        {/* Structural Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border border border-border">
          {items.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-swiss min-h-[320px] flex flex-col justify-between"
            >
              <div>
                <span className="text-accent font-display text-sm font-bold tracking-widest mb-6 block">
                  {(index + 1).toString().padStart(2, '0')} //
                </span>
                <h3 className="text-2xl font-display font-semibold text-primary mb-4 leading-tight">{service.title}</h3>
              </div>
              <p className="text-muted leading-relaxed font-sans mt-8">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
