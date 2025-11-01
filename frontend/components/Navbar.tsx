'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { notificationApi, userApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check authentication on client side only
  useEffect(() => {
    setMounted(true);
    const authenticated = auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      loadUnreadCount();
      checkAdminStatus();
      const interval = setInterval(loadUnreadCount, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  // Update authentication status when it changes
  useEffect(() => {
    if (mounted) {
      const authenticated = auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        checkAdminStatus();
      } else {
        setIsAdmin(false);
      }
    }
  }, [mounted, pathname]); // Re-check on route change

  const checkAdminStatus = async () => {
    try {
      const response = await userApi.getMe();
      if (response.status && response.data) {
        setIsAdmin(response.data.isAdmin || false);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.status) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      // Silently fail
    }
  };

  // Only compute navLinks after component has mounted to avoid hydration mismatch
  const navLinks = mounted ? [
    { href: '/', label: t('common.home') },
    { href: '/profiles', label: t('common.browseProfiles') },
    { href: '/community', label: t('common.community') },
    { href: '/about', label: t('common.aboutUs') },
    { href: '/donation', label: t('common.donation') },
    ...(isAuthenticated ? [
      { href: '/messages', label: 'Messages' },
      { href: '/profile-views', label: t('common.profileViews') },
      { href: '/profile', label: t('common.myProfile') },
      ...(isAdmin ? [
        { href: '/admin', label: 'Admin Portal' },
        { href: '/admin/reports', label: 'Admin Board' },
        { href: '/admin/db-status', label: 'DB Status' }
      ] : []),
    ] : []),
  ] : [
    { href: '/', label: t('common.home') },
    { href: '/profiles', label: t('common.browseProfiles') },
    { href: '/community', label: t('common.community') },
    { href: '/about', label: t('common.aboutUs') },
    { href: '/donation', label: t('common.donation') },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                💍 {t('common.appName')}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {mounted && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === link.href
                      ? 'text-pink-600 border-b-2 border-pink-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {mounted && (
              <>
                {isAuthenticated && (
                  <Link
                    href="/notifications"
                    className="relative px-3 py-2 text-gray-700 hover:text-pink-600"
                    title={t('common.notifications')}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={() => auth.logout()}
                    className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-md hover:from-red-700 hover:to-red-800 transition-all shadow-md"
                  >
                    {t('common.logout')}
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <Link
                      href="/login"
                      className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      href="/register"
                      className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-red-600 rounded-md hover:from-pink-700 hover:to-red-700 transition-all shadow-md"
                    >
                      {t('common.signUp')}
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

