// Renders every page to static HTML after `vite build` and writes sitemap.xml.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE_URL = 'https://westagentur.de';

const { render, PAGES } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href);
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const write = (url, file) => {
  const { html, head, lang } = render(url);
  const out = template
    .replace('<html lang="de">', `<html lang="${lang}">`)
    .replace('<!--seo-head-->', head)
    .replace('<!--app-html-->', html);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  console.log(`prerendered ${url} -> ${path.relative(root, file)}`);
};

for (const page of PAGES) {
  const file = page.path === '/' ? path.join(dist, 'index.html') : path.join(dist, page.path.slice(1), 'index.html');
  write(page.path, file);
}
write('/404', path.join(dist, '404.html'));

const abs = (p) => SITE_URL + (p === '/' ? '/' : p);
const today = new Date().toISOString().slice(0, 10);
const urls = PAGES.filter((p) => !p.noindex).map((p) => {
  const alternates = Object.entries(p.alternates ?? {})
    .map(([lang, href]) => `\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${abs(href)}"/>`)
    .join('');
  return `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${today}</lastmod>${alternates}\n  </url>`;
});
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
);
console.log(`sitemap.xml with ${urls.length} URLs`);

// llms.txt: compact overview for AI search engines (https://llmstxt.org). No email or phone on purpose.
const indexed = PAGES.filter((p) => !p.noindex && p.kind !== 'notfound');
const list = (filter) =>
  indexed
    .filter(filter)
    .map((p) => `- [${p.title.replace(/ \| Westagentur$/, '')}](${abs(p.path)}): ${p.description}`)
    .join('\n');
const llms = `# Westagentur

> Westagentur aus Hamm (NRW) entwickelt Websites, KI-Automatisierungen und KI-Telefonassistenten für kleine und mittlere Unternehmen in Deutschland. Inhaber: Argjend Krasniqi. Alle Lösungen werden selbst entwickelt, ohne Baukasten.

## Leistungen und Preise

- Webdesign Starter: ab 1.500 € (professioneller Onepager oder kompakte Website)
- Webdesign Pro: ab 3.200 € (mehrseitige Website mit individuellem Design, SEO-Struktur und Anbindung von Formularen oder Automatisierungen)
- KI-Automatisierung: individueller Preis nach kostenlosem Prozess-Check
- KI-Telefonie: KI-Assistent, der Anrufe annimmt, Fragen beantwortet und Termine bucht; Preis individuell
- Erstgespräch: kostenlos, 30 Minuten per Telefon, online buchbar

## Kontakt

- Anfragen über das Kontaktformular auf ${SITE_URL}/ oder per Online-Terminbuchung: ${abs('/termin')}
- Standort: Hamm, Nordrhein-Westfalen, Deutschland

## Seiten (Deutsch)

${list((p) => p.lang === 'de' && p.kind !== 'legal')}

## Pages (English)

${list((p) => p.lang === 'en' && p.kind !== 'legal')}

## Rechtliches

${list((p) => p.kind === 'legal')}
`;
fs.writeFileSync(path.join(dist, 'llms.txt'), llms);
console.log('llms.txt written');

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
