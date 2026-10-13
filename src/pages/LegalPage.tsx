import React from 'react';
import ProtectedContact from '../components/ProtectedContact';
import { LEGAL_CONTENT, type LegalKey } from '../content/legal';

// {{email}} / {{phone}} become click-to-reveal links.
const renderBody = (body: string) =>
  body.split(/(\{\{email\}\}|\{\{phone\}\})/).map((part, i) =>
    part === '{{email}}' ? (
      <ProtectedContact key={i} kind="email" lang="de" className="text-accent" />
    ) : part === '{{phone}}' ? (
      <ProtectedContact key={i} kind="phone" lang="de" className="text-accent" />
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

const LegalPage: React.FC<{ legalKey: LegalKey }> = ({ legalKey }) => {
  const content = LEGAL_CONTENT[legalKey];

  return (
    <section className="pt-28 md:pt-40 pb-20 md:pb-32 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="heading-section mb-4">{content.title}</h1>
        {content.updated && <p className="text-sm text-muted mb-12">{content.updated}</p>}
        <div className={`space-y-10 ${content.updated ? '' : 'mt-12'}`}>
          {content.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-display font-semibold text-primary mb-3">{section.heading}</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{renderBody(section.body)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LegalPage;
