'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function LanguageSettingsPage() {
  const { language } = useTranslation();
  const { setLanguage } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  ];

  const handleLanguageChange = (langCode: string) => {
    if (langCode === 'en' || langCode === 'hi') {
      setLanguage(langCode as Language);
      if (mounted && typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-red-900">
          <Link
            href="/settings/privacy"
            className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Privacy
          </Link>
          <Link
            href="/settings/language"
            className="px-4 py-2 font-medium border-b-2 border-pink-600 text-pink-600"
          >
            Language
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-red-600 mb-8">
          Language Preferences
        </h1>

        <div className="bg-white dark:bg-black rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-red-500 mb-6">
            Choose your preferred language for the application interface.
          </p>
          <div className="space-y-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  language === lang.code
                    ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-gray-200 dark:border-red-900 hover:border-pink-300 dark:hover:border-pink-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-red-600">{lang.name}</p>
                    <p className="text-sm text-gray-600 dark:text-red-500">{lang.nativeName}</p>
                  </div>
                </div>
                {language === lang.code && (
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

