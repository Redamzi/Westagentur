import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App, { resolvePage } from './App';
import i18n from './i18n';
import { renderHeadTags } from './seo/head';

export { PAGES } from './seo/pages';

/** Renders one URL to HTML for the prerenderer (scripts/prerender.mjs). */
export function render(url: string) {
  const page = resolvePage(url);
  i18n.changeLanguage(page.lang);
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );
  return { html, head: renderHeadTags(page), lang: page.lang };
}
