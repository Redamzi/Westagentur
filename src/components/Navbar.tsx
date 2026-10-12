import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SERVICES, SERVICE_KEYS } from '../content/services';
import { HOME_PATH } from '../seo/site';
import type { PageDef } from '../seo/pages';

const Navbar: React.FC<{ page: PageDef }> = ({ page }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const lang = page.lang;
  const otherLang = lang === 'de' ? 'en' : 'de';
  const switchPath = page.alternates?.[otherLang] ?? HOME_PATH[otherLang];
  const home = HOME_PATH[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [page.path]);

  // Pages without a dark hero always get the solid header.
  const hasDarkHero = page.kind === 'home' || page.kind === 'service';
  const solid = isScrolled || !hasDarkHero;

  const navLinks = [
    ...SERVICE_KEYS.map((key) => ({ name: SERVICES[lang][key].navLabel, to: SERVICES[lang][key].path })),
    { name: t('nav.referenzen'), to: `${home}#projekte` },
    { name: t('nav.faq'), to: `${home}#faq` },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid ? 'bg-background/90 backdrop-blur-md border-b border-border py-3' : 'section-dark bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to={home} className="text-2xl font-display font-bold tracking-tight text-primary flex items-center gap-2 min-h-[44px]">
          WEST<span className="text-accent italic font-normal">AGENTUR</span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label={lang === 'de' ? 'Hauptnavigation' : 'Main navigation'} className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={link.to === page.path ? 'page' : undefined}
              className="text-sm font-medium text-muted hover:text-accent aria-[current=page]:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}

          <Link
            to={switchPath}
            hrefLang={otherLang}
            aria-label={lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors min-h-[44px]"
          >
            <Globe className="w-4 h-4" />
            {otherLang.toUpperCase()}
          </Link>

          <a href="#kontakt" className="btn-primary py-2.5 px-6 text-sm">
            {t('nav.contact')} <ArrowRight className="w-4 h-4" />
          </a>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to={switchPath}
            hrefLang={otherLang}
            aria-label={lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
            className="text-primary flex items-center justify-center gap-1 text-sm font-medium min-h-[44px] min-w-[44px]"
          >
            <Globe className="w-4 h-4" />
            {otherLang.toUpperCase()}
          </Link>
          <button
            className="text-primary flex items-center justify-center min-h-[44px] min-w-[44px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? (lang === 'de' ? 'Menü schließen' : 'Close menu') : lang === 'de' ? 'Menü öffnen' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label={lang === 'de' ? 'Mobile Navigation' : 'Mobile navigation'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-2 lg:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-lg font-display font-medium text-muted hover:text-primary py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a href="#kontakt" className="btn-primary w-full mt-4" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.contact')} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
