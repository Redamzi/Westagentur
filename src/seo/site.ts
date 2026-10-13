export type Lang = 'de' | 'en';

export const SITE_URL = 'https://westagentur.de';
export const SITE_NAME = 'Westagentur';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

// E-Mail and phone are only stored encoded (base64 of the reversed string) and are
// revealed on click (see ProtectedContact), so crawlers and AI scrapers cannot read them.
export const PROTECTED_CONTACT = {
  email: 'ZWQucnV0bmVnYXRzZXdAbGlhbQ==',
  phone: 'ODU5NjA1NyAyMjUxIDk0Kw==',
};

export const revealContact = (kind: keyof typeof PROTECTED_CONTACT) =>
  [...atob(PROTECTED_CONTACT[kind])].reverse().join('');

export const CONTACT = {
  street: 'Schildkamp 1',
  postalCode: '59063',
  city: 'Hamm',
  country: 'DE',
};

export const HOME_PATH: Record<Lang, string> = { de: '/', en: '/en' };

export const langFromPath = (pathname: string): Lang =>
  pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'de';

export const normalizePath = (pathname: string): string =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
