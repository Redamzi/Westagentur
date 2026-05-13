import React from 'react';
import { useTranslation } from 'react-i18next';
import { LEGAL_CONTENT } from '../constants';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-background py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <a href="#" className="text-3xl font-display font-bold tracking-tight text-primary mb-6 inline-block">
              WEST<span className="text-accent italic font-normal">AGENTUR</span>
            </a>
            <p className="text-muted font-sans text-lg max-w-sm mb-8">
              {t('hero.subheadline')}
            </p>
            {/* Trust signals */}
            <div className="flex flex-wrap gap-3 items-center">
               <span className="px-3 py-1 bg-surface border border-border text-xs font-display uppercase tracking-widest text-muted">SSL Secured</span>
               <span className="px-3 py-1 bg-surface border border-border text-xs font-display uppercase tracking-widest text-muted">{t('footer.made_in')}</span>
            </div>
          </div>
          <div>
            <h4 className="text-primary font-display font-bold uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-4">
              <li><a href="#leistungen" className="text-muted hover:text-accent font-sans transition-colors">{t('nav.leistungen')}</a></li>
              <li><a href="#about" className="text-muted hover:text-accent font-sans transition-colors">{t('nav.about')}</a></li>
              <li><a href="#projekte" className="text-muted hover:text-accent font-sans transition-colors">{t('nav.referenzen')}</a></li>
              <li><a href="#faq" className="text-muted hover:text-accent font-sans transition-colors">{t('nav.faq')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-primary font-display font-bold uppercase tracking-widest mb-6">Rechtliches</h4>
            <ul className="space-y-4">
              <li><a href="#impressum" onClick={() => alert(LEGAL_CONTENT.imprint.sections.map(s => s.heading + '\\n' + s.body).join('\\n\\n'))} className="text-muted hover:text-accent font-sans transition-colors">{t('footer.imprint')}</a></li>
              <li><a href="#datenschutz" onClick={() => alert(LEGAL_CONTENT.privacy.sections.map(s => s.heading + '\\n' + s.body).join('\\n\\n'))} className="text-muted hover:text-accent font-sans transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#agb" onClick={() => alert(LEGAL_CONTENT.tos.sections.map(s => s.heading + '\\n' + s.body).join('\\n\\n'))} className="text-muted hover:text-accent font-sans transition-colors">{t('footer.tos')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted font-display text-sm tracking-wide">
            © {new Date().getFullYear()} Westagentur. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
