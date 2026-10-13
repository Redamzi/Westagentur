import type { PageDef } from './pages';
import { OG_IMAGE, SITE_NAME, SITE_URL } from './site';

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const abs = (path: string) => SITE_URL + (path === '/' ? '/' : path);

/** Head tags for a page. Shared by the prerenderer and the client-side navigation. */
export const renderHeadTags = (page: PageDef): string => {
  const tags: string[] = [`<title>${esc(page.title)}</title>`];
  const meta = (attr: 'name' | 'property', key: string, content: string) =>
    tags.push(`<meta ${attr}="${key}" content="${esc(content)}" data-seo>`);

  if (page.description) meta('name', 'description', page.description);

  if (page.noindex) {
    meta('name', 'robots', 'noindex');
  } else {
    tags.push(`<link rel="canonical" href="${abs(page.path)}" data-seo>`);
    const alternates = Object.entries(page.alternates ?? {});
    for (const [lang, path] of alternates) {
      tags.push(`<link rel="alternate" hreflang="${lang}" href="${abs(path)}" data-seo>`);
    }
    if (page.alternates?.de) {
      tags.push(`<link rel="alternate" hreflang="x-default" href="${abs(page.alternates.de)}" data-seo>`);
    }

    meta('property', 'og:type', 'website');
    meta('property', 'og:site_name', SITE_NAME);
    meta('property', 'og:locale', page.lang === 'de' ? 'de_DE' : 'en_US');
    meta('property', 'og:title', page.title);
    meta('property', 'og:description', page.description);
    meta('property', 'og:url', abs(page.path));
    meta('property', 'og:image', OG_IMAGE);
    meta('property', 'og:image:width', '1200');
    meta('property', 'og:image:height', '630');
    meta('name', 'twitter:card', 'summary_large_image');
  }

  if (page.jsonLd.length) {
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': page.jsonLd }).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json" data-seo>${json}</script>`);
  }

  return tags.join('\n    ');
};

/** Replaces the SEO head tags in the live document after client-side navigation. */
export const applyHeadTags = (page: PageDef) => {
  document.documentElement.lang = page.lang;
  document.head.querySelectorAll('[data-seo], title').forEach((el) => el.remove());
  const template = document.createElement('template');
  template.innerHTML = renderHeadTags(page);
  template.content.querySelectorAll('script').forEach((old) => {
    const script = document.createElement('script');
    script.type = old.type;
    script.setAttribute('data-seo', '');
    script.textContent = old.textContent;
    old.replaceWith(script);
  });
  document.head.append(template.content);
};
