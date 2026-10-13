import React from 'react';

/** Small eyebrow label above section headings (replaces the large background numbers). */
const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`flex items-center gap-3 mb-4 text-xs md:text-sm font-display font-bold uppercase tracking-[0.2em] text-accent ${className}`}>
    <span aria-hidden="true" className="h-px w-8 bg-accent" />
    {children}
  </p>
);

export default SectionLabel;
