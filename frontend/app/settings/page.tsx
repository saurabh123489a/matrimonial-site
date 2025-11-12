'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const settingsItems = [
    {
      href: '/profile',
      icon: '👤',
      title: t('common.profile') || 'Profile',
      description: t('settings.profileDescription') || 'Manage your profile information and preferences',
    },
    {
      href: '/settings/language',
      icon: '🌐',
      title: t('settings.language') || 'Language Settings',
      description: t('settings.languageDescription') || 'Choose your preferred language',
    },
    {
      href: '/settings/theme',
      icon: resolvedTheme === 'dark' ? '🌙' : '☀️',
      title: t('settings.theme') || 'Theme',
      description: t('settings.themeDescription') || 'Switch between light and dark mode',
      action: toggleTheme,
      actionLabel: resolvedTheme === 'dark' ? t('settings.switchToLight') || 'Switch to Light' : t('settings.switchToDark') || 'Switch to Dark',
    },
    {
      href: '/settings/privacy',
      icon: '🔒',
      title: t('settings.privacy') || 'Privacy Settings',
      description: t('settings.privacyDescription') || 'Control your privacy and visibility settings',
    },
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
          {settingsItems.map((item) => (
            <div
              key={item.href}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{item.icon}</div>
                  <div className="flex-1">
                    {item.action ? (
                      <button
                        onClick={item.action}
                        className="text-left w-full"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-200 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-pink-400 mb-2">
                          {item.description}
                        </p>
                        <span className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                          {item.actionLabel} →
                        </span>
                      </button>
                    ) : (
                      <Link href={item.href} className="block">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-200 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-pink-400 mb-2">
                          {item.description}
                        </p>
                        <span className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                          {t('common.view') || 'View'} →
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

