'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSelector from '@/components/ThemeSelector';
import PushNotificationButton from '@/components/PushNotificationButton';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === 'en' || langCode === 'hi') {
      setLanguage(langCode as Language);
      if (typeof window !== 'undefined') {
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

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-pink-300 mb-2">
            {t('settings.title') || 'Settings'}
          </h1>
          <p className="text-gray-600 dark:text-pink-400">
            {t('settings.subtitle') || 'Manage your account settings and preferences'}
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile */}
          <Link
            href="/profile"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">👤</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-200 mb-1">
                  {t('common.profile') || 'Profile'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-pink-400 mb-2">
                  {t('settings.profileDescription') || 'Manage your profile information and preferences'}
                </p>
                <span className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                  {t('common.view') || 'View'} →
                </span>
              </div>
            </div>
          </Link>

          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌐</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-200 mb-1">
                  {t('settings.language') || 'Language Settings'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-pink-400 mb-4">
                  {t('settings.languageDescription') || 'Choose your preferred language'}
                </p>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        language === lang.code
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{resolvedTheme === 'dark' ? '🌙' : '☀️'}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-200 mb-1">
                  {t('settings.theme') || 'Theme'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-pink-400 mb-4">
                  {t('settings.themeDescription') || 'Switch between light and dark mode'}
                </p>
                <button
                  onClick={toggleTheme}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors shadow-md mb-4"
                >
                  {resolvedTheme === 'dark' 
                    ? (t('settings.switchToLight') || 'Switch to Light Mode') 
                    : (t('settings.switchToDark') || 'Switch to Dark Mode')}
                </button>
                
                {/* Color Theme Selector */}
                {resolvedTheme === 'dark' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-pink-200 mb-3">
                      Color Theme
                    </h4>
                    <ThemeSelector />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <Link
            href="/settings/privacy"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔒</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-200 mb-1">
                  {t('settings.privacy') || 'Privacy Settings'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-pink-400 mb-2">
                  {t('settings.privacyDescription') || 'Control your privacy and visibility settings'}
                </p>
                <span className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                  {t('common.view') || 'View'} →
                </span>
              </div>
            </div>
          </Link>

          {/* Push Notifications */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-3xl sm:text-4xl flex-shrink-0">🔔</div>
              <div className="flex-1 min-w-0">
                <PushNotificationButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

