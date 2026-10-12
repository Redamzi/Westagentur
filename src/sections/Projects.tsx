import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Projects = () => {
  const { t } = useTranslation();
  const items: { name: string; desc: string }[] = t('projects.items', { returnObjects: true });

  return (
    <section id="projekte" className="relative section-padding bg-background border-b border-border overflow-hidden">
      
      {/* Background Number */}
      <div aria-hidden="true" className="bg-number top-0 -left-10">03</div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="heading-section"
          >
            {t('projects.title')}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
          {items.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-swiss md:min-h-[250px] flex flex-col justify-between gap-8"
            >
              <span className="text-accent font-display text-sm font-bold tracking-widest block">
                P-{(index + 1).toString().padStart(3, '0')}
              </span>
              <div>
                <h3 className="text-2xl md:text-3xl font-display font-semibold text-primary mb-3">{project.name}</h3>
                <p className="text-muted font-sans text-lg">
                  {project.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 p-6 md:p-12 border border-border bg-surface text-center"
        >
          <p className="text-xl md:text-2xl font-display text-primary italic font-medium leading-relaxed">
            {t('projects.testimonial_placeholder')}
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default Projects;
