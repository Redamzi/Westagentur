import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import App, { resolvePage } from './App';
import { loadPage } from './pages/lazyPages';
import i18n from './i18n';
import { langFromPath } from './seo/site';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Match the language of the prerendered HTML before hydrating.
i18n.changeLanguage(langFromPath(window.location.pathname));

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Load the code of the current page first, so hydration can reuse the prerendered HTML directly.
loadPage(resolvePage(window.location.pathname).kind).finally(() => {
  if (rootElement.firstElementChild) {
    ReactDOM.hydrateRoot(rootElement, app);
  } else {
    ReactDOM.createRoot(rootElement).render(app);
  }
});

// Fetch the code of a page as soon as a link to it is touched or hovered.
const prefetch = (event: Event) => {
  const link = (event.target as Element | null)?.closest?.('a[href^="/"]');
  if (link) loadPage(resolvePage(new URL((link as HTMLAnchorElement).href).pathname).kind);
};
document.addEventListener('pointerover', prefetch, { passive: true });
document.addEventListener('touchstart', prefetch, { passive: true });
document.addEventListener('focusin', prefetch);
