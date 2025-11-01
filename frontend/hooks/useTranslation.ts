'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { t as translate, TranslationKey } from '@/lib/i18n';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    return translate(key, language, params);
  };

  return { t, language };
}

