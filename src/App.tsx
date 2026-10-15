import React, { Suspense, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CTA from './sections/CTA';
import Home from './pages/Home';
import { LazyPage } from './pages/lazyPages';
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
      return <LazyPage kind="service" serviceKey={page.serviceKey!} lang={page.lang} />;
    case 'legal':
      return <LazyPage kind="legal" legalKey={page.legalKey!} />;
    case 'booking':
      return <LazyPage kind="booking" lang={page.lang} />;
    case 'case':
      return <LazyPage kind="case" slug={page.caseSlug!} />;
    case 'manage':
      return <LazyPage kind="manage" lang={page.lang} />;
    default:
      return <LazyPage kind="notfound" lang={page.lang} />;
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
    // Cookieless page view count (see server/src/app.js)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => undefined);
  }, [page.path, page.lang]);

  // Scroll to the anchor after navigation, or to the top on a new page.
  // Deferred two frames so the new page has rendered and laid out.
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

  if (page.kind === 'admin') {
    return (
      <main className="bg-background text-primary">
        <Suspense fallback={null}>
          <LazyPage kind="admin" />
        </Suspense>
      </main>
    );
  }

  const showCta = page.kind !== 'booking' && page.kind !== 'manage';

  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar page={page} />
      <main>
        <Suspense fallback={<div className="min-h-screen" />}>
          <PageContent page={page} />
        </Suspense>
      </main>
      {showCta && <CTA page={page} />}
      <Footer lang={page.lang} />
    </div>
  );
}

export default App;
