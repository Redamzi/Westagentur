import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SERVICES, SERVICE_KEYS } from '../content/services';
import { legalPath } from '../seo/pages';
import { CONTACT, HOME_PATH, type Lang } from '../seo/site';
import ProtectedContact from './ProtectedContact';
import LogoMark from './LogoMark';

const linkClass = 'inline-block py-2.5 text-muted hover:text-accent font-sans transition-colors';

const Footer: React.FC<{ lang: Lang }> = ({ lang }) => {
  const { t } = useTranslation();
  const home = HOME_PATH[lang];

  return (
    <footer className="bg-surface py-12 md:py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to={home} aria-label="Westagentur – Startseite" className="text-3xl font-display font-bold tracking-tight text-primary mb-6 inline-flex items-center gap-3 py-1">
              <LogoMark className="w-10 h-10" />
              <span>WEST<span className="text-accent italic font-normal">AGENTUR</span></span>
            </Link>
            <p className="text-muted font-sans text-lg max-w-sm mb-6">
              {t('hero.subheadline')}
            </p>
            <address className="not-italic text-muted leading-relaxed mb-8">
              {CONTACT.street}, {CONTACT.postalCode} {CONTACT.city}
              <br />
              <ProtectedContact kind="phone" lang={lang} className="text-muted hover:text-accent transition-colors" />
              <br />
              <ProtectedContact kind="email" lang={lang} className="text-muted hover:text-accent transition-colors" />
            </address>
            <div className="flex flex-wrap gap-3 items-center">
               <span className="px-3 py-1 bg-background border border-border text-xs font-display uppercase tracking-widest text-muted">SSL Secured</span>
               <span className="px-3 py-1 bg-background border border-border text-xs font-display uppercase tracking-widest text-muted">{t('footer.made_in')}</span>
            </div>
          </div>
          <div>
            <h2 className="text-base text-primary font-display font-bold uppercase tracking-widest mb-6">{t('nav.leistungen')}</h2>
            <ul className="space-y-1">
              {SERVICE_KEYS.map((key) => (
                <li key={key}>
                  <Link to={SERVICES[lang][key].path} className={linkClass}>{SERVICES[lang][key].navLabel}</Link>
                </li>
              ))}
              <li><Link to={`${home}#projekte`} className={linkClass}>{t('nav.referenzen')}</Link></li>
              <li><Link to={`${home}#faq`} className={linkClass}>{t('nav.faq')}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-base text-primary font-display font-bold uppercase tracking-widest mb-6">
              {lang === 'de' ? 'Rechtliches' : 'Legal'}
            </h2>
            <ul className="space-y-1">
              <li><Link to={legalPath('imprint')} className={linkClass}>{t('footer.imprint')}</Link></li>
              <li><Link to={legalPath('privacy')} className={linkClass}>{t('footer.privacy')}</Link></li>
              <li><Link to={legalPath('tos')} className={linkClass}>{t('footer.tos')}</Link></li>
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
