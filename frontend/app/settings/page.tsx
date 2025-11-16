'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PushNotificationButton from '@/components/PushNotificationButton';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

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

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] dark:bg-[#2A000A] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#800020] dark:border-[#D4AF37] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  ];

  const SettingItem = ({ 
    icon, 
    label, 
    href, 
    onClick, 
    showChevron = true,
    children 
  }: { 
    icon: string; 
    label: string; 
    href?: string; 
    onClick?: () => void;
    showChevron?: boolean;
    children?: React.ReactNode;
  }) => {
    const content = (
      <div className="flex min-h-14 items-center justify-between gap-4 rounded-lg bg-[#800020]/5 dark:bg-[#D4AF37]/5 px-4 transition-colors hover:bg-[#800020]/10 dark:hover:bg-[#D4AF37]/10">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
            <span className="text-xl">{icon}</span>
          </div>
          <p className="flex-1 truncate text-base font-medium text-[#800020] dark:text-[#F5F5DC]">
            {label}
          </p>
        </div>
        {showChevron && !children && (
          <div className="shrink-0">
            <svg className="w-5 h-5 text-[#800020]/40 dark:text-[#F5F5DC]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
        {children && <div className="shrink-0">{children}</div>}
      </div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }
    if (onClick) {
      return <div onClick={onClick} className="cursor-pointer">{content}</div>;
    }
    return content;
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    id 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    id: string;
  }) => {
    return (
      <div className="shrink-0">
        <input
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          id={id}
          type="checkbox"
        />
        <label
          htmlFor={id}
          className="relative block h-7 w-12 cursor-pointer rounded-full bg-[#800020]/20 transition-colors peer-checked:bg-[#D4AF37] dark:bg-[#F5F5DC]/20 dark:peer-checked:bg-[#D4AF37]"
        >
          <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white dark:bg-[#2A000A] transition-transform peer-checked:translate-x-5"></div>
        </label>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#F5F5DC] dark:bg-[#2A000A]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[#800020]/10 dark:border-[#D4AF37]/10 bg-[#F5F5DC]/80 dark:bg-[#2A000A]/80 backdrop-blur-sm px-4">
        <button
          onClick={() => router.back()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#800020] dark:text-[#F5F5DC] hover:bg-[#800020]/10 dark:hover:bg-[#D4AF37]/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight text-[#800020] dark:text-[#F5F5DC]">
          {t('settings.title') || 'Settings'}
        </h1>
        <div className="size-10 shrink-0"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-8">
          {/* Account Management */}
          <section>
            <h2 className="px-4 pb-2 text-sm font-bold uppercase tracking-wider text-[#800020]/60 dark:text-[#F5F5DC]/60">
              {t('settings.accountManagement') || 'ACCOUNT MANAGEMENT'}
            </h2>
            <div className="space-y-2">
              <SettingItem
                icon="👤"
                label={t('settings.editProfile') || 'Edit Profile'}
                href="/profile"
              />
              <SettingItem
                icon="🔒"
                label={t('settings.changePassword') || 'Change Password'}
                href="/settings/password"
              />
              <SettingItem
                icon="🔗"
                label={t('settings.linkedAccounts') || 'Linked Social Accounts'}
                href="/settings/social"
              />
            </div>
          </section>

          {/* Privacy & Visibility */}
          <section>
            <h2 className="px-4 pb-2 text-sm font-bold uppercase tracking-wider text-[#800020]/60 dark:text-[#F5F5DC]/60">
              {t('settings.privacyVisibility') || 'PRIVACY & VISIBILITY'}
            </h2>
            <div className="space-y-2">
              <SettingItem
                icon="👁️"
                label={t('settings.whoCanSeeProfile') || 'Who can see my profile'}
                href="/settings/privacy"
              />
              <SettingItem
                icon="🟢"
                label={t('settings.showOnlineStatus') || 'Show my online status'}
                showChevron={false}
              >
                <ToggleSwitch
                  checked={onlineStatus}
                  onChange={setOnlineStatus}
                  id="online-status"
                />
              </SettingItem>
              <SettingItem
                icon="🚫"
                label={t('settings.blockList') || 'Block List Management'}
                href="/settings/blocked"
              />
            </div>
          </section>

          {/* Notification Preferences */}
          <section>
            <h2 className="px-4 pb-2 text-sm font-bold uppercase tracking-wider text-[#800020]/60 dark:text-[#F5F5DC]/60">
              {t('settings.notificationPreferences') || 'NOTIFICATION PREFERENCES'}
            </h2>
            <div className="space-y-2">
              <SettingItem
                icon="🔔"
                label={t('settings.pushNotifications') || 'Push Notifications'}
                showChevron={false}
              >
                <ToggleSwitch
                  checked={pushNotifications}
                  onChange={setPushNotifications}
                  id="push-notifications"
                />
              </SettingItem>
              <SettingItem
                icon="📧"
                label={t('settings.emailNotifications') || 'Email Notifications'}
                showChevron={false}
              >
                <ToggleSwitch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  id="email-notifications"
                />
              </SettingItem>
            </div>
          </section>

          {/* App Preferences */}
          <section>
            <h2 className="px-4 pb-2 text-sm font-bold uppercase tracking-wider text-[#800020]/60 dark:text-[#F5F5DC]/60">
              {t('settings.appPreferences') || 'APP PREFERENCES'}
            </h2>
            <div className="space-y-2">
              <SettingItem
                icon={resolvedTheme === 'dark' ? '🌙' : '☀️'}
                label={t('settings.darkMode') || 'Dark Mode'}
                showChevron={false}
              >
                <ToggleSwitch
                  checked={resolvedTheme === 'dark'}
                  onChange={(checked) => {
                    if (checked && resolvedTheme !== 'dark') {
                      toggleTheme();
                    } else if (!checked && resolvedTheme === 'dark') {
                      toggleTheme();
                    }
                  }}
                  id="dark-mode"
                />
              </SettingItem>
              <SettingItem
                icon="🌐"
                label={t('settings.language') || 'Language'}
                onClick={() => {
                  // Toggle language
                  handleLanguageChange(language === 'en' ? 'hi' : 'en');
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#800020]/60 dark:text-[#F5F5DC]/60">
                    {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.nativeName}
                  </span>
                  <svg className="w-5 h-5 text-[#800020]/40 dark:text-[#F5F5DC]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </SettingItem>
            </div>
          </section>

          {/* Legal & Support */}
          <section>
            <h2 className="px-4 pb-2 text-sm font-bold uppercase tracking-wider text-[#800020]/60 dark:text-[#F5F5DC]/60">
              {t('settings.legalSupport') || 'LEGAL & SUPPORT'}
            </h2>
            <div className="space-y-2">
              <SettingItem
                icon="❓"
                label={t('settings.helpSupport') || 'Help & Support'}
                href="/help"
              />
              <SettingItem
                icon="📜"
                label={t('settings.termsOfService') || 'Terms of Service'}
                href="/terms"
              />
              <SettingItem
                icon="🔐"
                label={t('settings.privacyPolicy') || 'Privacy Policy'}
                href="/privacy"
              />
            </div>
          </section>

          {/* Actions */}
          <section className="pt-4">
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full rounded-lg bg-[#800020] py-3.5 text-base font-bold text-[#F5F5DC] transition-opacity hover:opacity-90 dark:bg-[#D4AF37] dark:text-[#2A000A]"
              >
                {t('settings.logOut') || 'Log Out'}
              </button>
              <button className="w-full text-center text-sm font-medium text-red-700 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                {t('settings.deleteAccount') || 'Delete Account'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
