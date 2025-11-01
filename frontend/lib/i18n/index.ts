import en from './translations/en.json';
import hi from './translations/hi.json';

export type Language = 'en' | 'hi';
export type TranslationKey = string;

const translations = {
  en,
  hi,
} as const;

/**
 * Get translation by key path (e.g., "common.appName")
 */
export function t(key: TranslationKey, lang: Language = 'en', params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      if (lang !== 'en') {
        let enValue: any = translations.en;
        for (const k2 of keys) {
          if (enValue && typeof enValue === 'object' && k2 in enValue) {
            enValue = enValue[k2];
          } else {
            return key; // Return key if translation not found
          }
        }
        value = enValue;
      } else {
        return key; // Return key if translation not found
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters in the translation
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
}

/**
 * Get all translations for a namespace
 */
export function getTranslations(lang: Language = 'en') {
  return translations[lang] || translations.en;
}

export { translations };

