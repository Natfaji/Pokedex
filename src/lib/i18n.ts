import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en';
import nl from '@/locales/nl';

export const supportedLanguages = ['en', 'nl'] as const;
export type Language = (typeof supportedLanguages)[number];

const deviceLanguage = getLocales()[0]?.languageCode;
const initialLanguage: Language = deviceLanguage === 'nl' ? 'nl' : 'en';
const i18nextInstance = i18n;

void i18nextInstance.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: 'en',
  lng: initialLanguage,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: en },
    nl: { translation: nl },
  },
});

export default i18n;
