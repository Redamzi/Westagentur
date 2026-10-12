export type Lang = 'de' | 'en';

export const SITE_URL = 'https://westagentur.de';
export const SITE_NAME = 'Westagentur';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const CONTACT = {
  email: 'mail@westagentur.de',
  phone: '+49 152 27506958',
  phoneHref: 'tel:+4915227506958',
  street: 'Kielstraße 28',
  postalCode: '44145',
  city: 'Dortmund',
  country: 'DE',
};

export const HOME_PATH: Record<Lang, string> = { de: '/', en: '/en' };

export const langFromPath = (pathname: string): Lang =>
  pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'de';

export const normalizePath = (pathname: string): string =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
