import React, { useEffect, useRef } from 'react';
import { MotionConfig } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CTA from './sections/CTA';
import Home from './pages/Home';
import ServicePage from './pages/ServicePage';
import LegalPage from './pages/LegalPage';
import NotFound from './pages/NotFound';
import { findPage, notFoundPage, type PageDef } from './seo/pages';
import { applyHeadTags } from './seo/head';
import { langFromPath } from './seo/site';

export const resolvePage = (pathname: string): PageDef =>
  findPage(pathname) ?? notFoundPage(pathname, langFromPath(pathname));

const PageContent = ({ page }: { page: PageDef }) => {
  switch (page.kind) {
    case 'home':
      return <Home />;
    case 'service':
      return <ServicePage serviceKey={page.serviceKey!} lang={page.lang} />;
    case 'legal':
      return <LegalPage legalKey={page.legalKey!} />;
    default:
      return <NotFound lang={page.lang} />;
  }
};

function App() {
  const { pathname, hash } = useLocation();
  const { i18n } = useTranslation();
  const page = resolvePage(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (i18n.language !== page.lang) i18n.changeLanguage(page.lang);
    applyHeadTags(page);
  }, [page.path, page.lang]);

  // Scroll to the anchor after navigation, or to the top on a new page.
  // Deferred two frames: framer-motion restores the old scroll position after measuring.
  useEffect(() => {
    const firstRender = isFirstRender.current;
    isFirstRender.current = false;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
        if (target) {
          target.scrollIntoView();
        } else if (!firstRender) {
          window.scrollTo(0, 0);
        }
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-primary">
        <Navbar page={page} />
        <main>
          <PageContent page={page} />
        </main>
        <CTA />
        <Footer lang={page.lang} />
      </div>
    </MotionConfig>
  );
}

export default App;
