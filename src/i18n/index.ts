import { useSyncExternalStore } from 'react';
import deTranslation from './locales/de.json';
import enTranslation from './locales/en.json';

// Minimal translation helper (replaces i18next): nested keys like "hero.h1", optional objects/arrays,
// fallback to English, then the key itself. Synchronous, so prerendering works out of the box.

type Lang = 'de' | 'en';
type Options = { returnObjects?: boolean };

const resources: Record<Lang, unknown> = { de: deTranslation, en: enTranslation };
const listeners = new Set<() => void>();
let current: Lang = 'de';

const lookup = (lang: Lang, key: string): unknown =>
  key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], resources[lang]);

const translate = (key: string, options?: Options): any => {
  const value = lookup(current, key) ?? lookup('en', key);
  if (value === undefined) return key;
  return typeof value === 'string' || options?.returnObjects ? value : key;
};

const i18n = {
  get language(): Lang {
    return current;
  },
  changeLanguage(lang: string) {
    const next: Lang = lang === 'en' ? 'en' : 'de';
    if (next !== current) {
      current = next;
      listeners.forEach((listener) => listener());
    }
    return Promise.resolve();
  },
  t: translate,
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
const getLanguage = () => current;

/** Same shape as react-i18next's hook; re-renders when the language changes. */
export const useTranslation = () => {
  useSyncExternalStore(subscribe, getLanguage, getLanguage);
  return { t: translate, i18n };
};

export default i18n;
