import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,

    supportedLngs: [
      'en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'ru', 'uk',
      'ja', 'zh', 'ko', 'ar', 'hi', 'tr', 'id', 'vi', 'th', 'sw',
      'am', 'yo', 'ig', 'ha', 'ibb', 'no'
    ],

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'reload',
        mode: 'cors',
      },
      crossDomain: false,
      allowMultiLoading: false,
    },

    detection: {
      order: ['localStorage', 'querystring', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
      checkWhitelist: true,
    },

    defaultNS: 'translation',
    ns: ['translation'],

    react: {
      useSuspense: false,
    },

    load: 'languageOnly',

    saveMissing: false,
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      console.warn(`Missing translation key: ${key} for languages: ${lngs.join(', ')}`);
    },
  });

i18n.on('languageChanged', (lng) => {
  const isRTL = RTL_LANGUAGES.includes(lng);
  const dir = isRTL ? 'rtl' : 'ltr';

  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);

  if (isRTL) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }

  console.log(`Language changed to: ${lng} (${dir})`);
});

const currentLang = i18n.language || 'en';
const isRTL = RTL_LANGUAGES.includes(currentLang);
document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', currentLang);

export default i18n;