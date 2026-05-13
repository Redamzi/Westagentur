import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const { t } = useTranslation();
  const items: { q: string; a: string }[] = t('faq.items', { returnObjects: true });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32 bg-background border-b border-border overflow-hidden">
      
      {/* Background Number */}
      <div className="bg-number top-0 -left-10">05</div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-primary uppercase"
          >
            {t('faq.title')}
          </motion.h2>
        </div>

        <div className="border-t border-border">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border transition-colors hover:bg-surface/50"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between py-8 text-left group"
                >
                  <span className="text-xl md:text-2xl font-display font-medium text-primary pr-8 group-hover:text-accent transition-colors">
                    {item.q}
                  </span>
                  <div className="w-8 h-8 flex items-center justify-center border border-border shrink-0 text-muted group-hover:border-accent group-hover:text-accent transition-colors">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="pb-8 text-lg text-muted font-sans max-w-4xl leading-relaxed">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
