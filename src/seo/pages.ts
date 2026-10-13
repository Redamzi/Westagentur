import de from '../i18n/locales/de.json';
import en from '../i18n/locales/en.json';
import { SERVICES, SERVICE_KEYS, SERVICE_UI, type ServiceKey } from '../content/services';
import { LEGAL_CONTENT, type LegalKey } from '../content/legal';
import { BOOKING_PATHS, BOOKING_TEXT } from '../content/booking';
import { CONTACT, HOME_PATH, OG_IMAGE, SITE_NAME, SITE_URL, normalizePath, type Lang } from './site';

export type PageKind = 'home' | 'service' | 'legal' | 'booking' | 'manage' | 'admin' | 'notfound';

export interface PageDef {
  path: string;
  lang: Lang;
  kind: PageKind;
  title: string;
  description: string;
  serviceKey?: ServiceKey;
  legalKey?: LegalKey;
  /** Paths of this page in all available languages (for hreflang). */
  alternates?: Partial<Record<Lang, string>>;
  noindex?: boolean;
  jsonLd: object[];
}

const ORG_ID = `${SITE_URL}/#organization`;
const abs = (path: string) => SITE_URL + (path === '/' ? '/' : path);

const organization = {
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: SITE_URL + '/',
  logo: `${SITE_URL}/logo.png`,
  image: OG_IMAGE,
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT.street,
    postalCode: CONTACT.postalCode,
    addressLocality: CONTACT.city,
    addressCountry: CONTACT.country,
  },
  areaServed: { '@type': 'Country', name: 'Deutschland' },
};

const website = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL + '/',
  name: SITE_NAME,
  inLanguage: ['de', 'en'],
  publisher: { '@id': ORG_ID },
};

const faqPage = (items: { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

const breadcrumb = (lang: Lang, name: string, path: string) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: SERVICE_UI[lang].home, item: abs(HOME_PATH[lang]) },
    { '@type': 'ListItem', position: 2, name, item: abs(path) },
  ],
});

const HOME_META: Record<Lang, { title: string; description: string }> = {
  de: {
    title: 'Webdesign & KI-Automatisierung für den Mittelstand | Westagentur',
    description:
      'Websites, die Anfragen bringen – und KI, die sie automatisch bearbeitet. Webdesign, KI-Telefonie und Prozessautomatisierung aus Dortmund. Jetzt kostenlos beraten lassen.',
  },
  en: {
    title: 'Web Design & AI Automation for SMEs | Westagentur',
    description:
      'Websites that generate enquiries – and AI that handles them automatically. Web design, AI telephony and process automation from Dortmund, Germany.',
  },
};

const homePage = (lang: Lang): PageDef => ({
  path: HOME_PATH[lang],
  lang,
  kind: 'home',
  ...HOME_META[lang],
  alternates: HOME_PATH,
  jsonLd: [organization, website, faqPage((lang === 'de' ? de : en).faq.items)],
});

const servicePage = (lang: Lang, key: ServiceKey): PageDef => {
  const s = SERVICES[lang][key];
  return {
    path: s.path,
    lang,
    kind: 'service',
    serviceKey: key,
    title: s.title,
    description: s.description,
    alternates: { de: SERVICES.de[key].path, en: SERVICES.en[key].path },
    jsonLd: [
      organization,
      {
        '@type': 'Service',
        name: s.h1,
        description: s.description,
        url: abs(s.path),
        provider: { '@id': ORG_ID },
        areaServed: { '@type': 'Country', name: 'Deutschland' },
        ...(s.packages && {
          offers: s.packages.map((p) => ({
            '@type': 'Offer',
            name: p.name,
            description: p.desc,
            priceSpecification: { '@type': 'PriceSpecification', minPrice: p.minPrice, priceCurrency: 'EUR' },
          })),
        }),
      },
      breadcrumb(lang, s.navLabel, s.path),
      faqPage(s.faq),
    ],
  };
};

const LEGAL_PATHS: Record<LegalKey, string> = { imprint: '/impressum', privacy: '/datenschutz', tos: '/agb' };

const legalPage = (key: LegalKey): PageDef => ({
  path: LEGAL_PATHS[key],
  lang: 'de',
  kind: 'legal',
  legalKey: key,
  title: `${LEGAL_CONTENT[key].title} | Westagentur`,
  description: `${LEGAL_CONTENT[key].title} der Westagentur – Webdesign & KI-Automatisierung für den Mittelstand.`,
  jsonLd: [organization, breadcrumb('de', LEGAL_CONTENT[key].title, LEGAL_PATHS[key])],
});

const bookingPage = (lang: Lang): PageDef => ({
  path: BOOKING_PATHS[lang].book,
  lang,
  kind: 'booking',
  title: BOOKING_TEXT[lang].title,
  description: BOOKING_TEXT[lang].description,
  alternates: { de: BOOKING_PATHS.de.book, en: BOOKING_PATHS.en.book },
  jsonLd: [organization, breadcrumb(lang, BOOKING_TEXT[lang].navLabel, BOOKING_PATHS[lang].book)],
});

const managePage = (lang: Lang): PageDef => ({
  path: BOOKING_PATHS[lang].manage,
  lang,
  kind: 'manage',
  title: `${BOOKING_TEXT[lang].manageTitle} | Westagentur`,
  description: BOOKING_TEXT[lang].manageDescription,
  alternates: { de: BOOKING_PATHS.de.manage, en: BOOKING_PATHS.en.manage },
  noindex: true,
  jsonLd: [],
});

export const PAGES: PageDef[] = [
  homePage('de'),
  homePage('en'),
  ...SERVICE_KEYS.flatMap((key) => [servicePage('de', key), servicePage('en', key)]),
  bookingPage('de'),
  bookingPage('en'),
  managePage('de'),
  managePage('en'),
  ...(Object.keys(LEGAL_PATHS) as LegalKey[]).map(legalPage),
  {
    path: '/admin',
    lang: 'de',
    kind: 'admin',
    title: 'Admin | Westagentur',
    description: '',
    noindex: true,
    jsonLd: [],
  },
];

export const legalPath = (key: LegalKey) => LEGAL_PATHS[key];

export const notFoundPage = (path: string, lang: Lang): PageDef => ({
  path,
  lang,
  kind: 'notfound',
  title: lang === 'de' ? 'Seite nicht gefunden | Westagentur' : 'Page not found | Westagentur',
  description: '',
  noindex: true,
  jsonLd: [],
});

export const findPage = (pathname: string): PageDef | undefined => {
  const path = normalizePath(pathname);
  return PAGES.find((p) => p.path === path);
};
