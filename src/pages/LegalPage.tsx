import React from 'react';
import { LEGAL_CONTENT, type LegalKey } from '../content/legal';

const LegalPage: React.FC<{ legalKey: LegalKey }> = ({ legalKey }) => {
  const content = LEGAL_CONTENT[legalKey];

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="heading-section mb-12">{content.title}</h1>
        <div className="space-y-10">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-display font-semibold text-primary mb-3">{section.heading}</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LegalPage;
