import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deTranslation from './locales/de.json';
import enTranslation from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: deTranslation },
      en: { translation: enTranslation }
    },
    lng: 'de', // Standard-Sprache
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
