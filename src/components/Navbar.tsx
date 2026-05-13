import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'de' ? 'en' : 'de');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.leistungen'), href: '#leistungen' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.referenzen'), href: '#projekte' },
    { name: t('nav.faq'), href: '#faq' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#" className="text-2xl font-display font-bold tracking-tight text-primary flex items-center gap-2">
          WEST<span className="text-accent italic font-normal">AGENTUR</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted hover:text-accent transition-colors"
            >
              {link.name}
            </a>
          ))}
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors"
          >
            <Globe className="w-4 h-4" />
            {i18n.language.toUpperCase()}
          </button>

          <a
            href="#kontakt"
            className="btn-primary py-2.5 px-6 text-sm"
          >
            {t('nav.contact')} <ArrowRight className="w-4 h-4" />
          </a>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-6 md:hidden">
          <button 
            onClick={toggleLanguage}
            className="text-primary flex items-center gap-1 text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            {i18n.language.toUpperCase()}
          </button>
          <button
            className="text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-display font-medium text-muted hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#kontakt"
              className="btn-primary w-full mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.contact')} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
