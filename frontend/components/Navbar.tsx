'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { notificationApi, userApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

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
  }, [mounted, pathname]);

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

  // Main navigation links for bottom bar - Always show 5 items
  const mainNavLinks = [
    { href: '/profile', label: 'Profile', icon: '👤', tourId: 'profile' },
    { href: '/profiles', label: 'Search', icon: '🔍', tourId: 'search' },
    { href: '/community', label: 'Community', icon: '👨‍👩‍👧‍👦', tourId: 'community' },
    { href: '/interests/received', label: 'Received', icon: '💌', tourId: 'interests' },
    { href: '/interests/sent', label: 'Sent', icon: '📤', tourId: 'interests' },
  ];

  // Additional links for dropdown menu
  const additionalLinks = mounted ? [
    { href: '/donation', label: t('common.donation') },
    ...(isAuthenticated ? [
      { href: '/profile-views', label: t('common.profileViews') },
      ...(isAdmin ? [
        { href: '/admin', label: 'Admin Portal' },
        { href: '/admin/reports', label: 'Admin Board' },
        { href: '/admin/db-status', label: 'DB Status' }
      ] : []),
    ] : []),
  ] : [];

  return (
    <>
      {/* Top Bar - Minimal with Logo and Language Switcher */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-20 py-3">
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white tracking-tight"
            >
              💍 {t('common.appName')}
            </Link>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              {mounted && isAuthenticated && (
                <>
                  <Link
                    href="/notifications"
                    className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    title={t('common.notifications')}
                  >
                    <span className="text-lg">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => auth.logout()}
                    className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors whitespace-nowrap"
                  >
                    {t('common.logout')}
                  </button>
                  <LanguageSwitcher />
                  <ThemeToggle />
                </>
              )}
              {mounted && !isAuthenticated && (
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-base font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors rounded"
                  >
                    {t('common.signUp')}
                  </Link>
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar - Only show when authenticated - Mobile & Web */}
      {mounted && isAuthenticated ? (
        <>
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 z-40 shadow-lg safe-area-inset-bottom transition-colors">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-around items-center h-16 sm:h-14">
                {mainNavLinks.map((link) => {
                  // Check if current path matches (including sub-routes)
                  const isActive = pathname === link.href || 
                    (link.href !== '/' && pathname.startsWith(link.href));
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      data-tour={link.tourId}
                      className={`relative flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-300 min-w-0 group ${
                        isActive
                          ? 'text-pink-600 dark:text-pink-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                      }`}
                    >
                      {/* Mobile: larger icons (text-3xl), Desktop: bigger icons (text-2xl) with zoom on hover */}
                      <span className="text-3xl sm:text-2xl leading-none transition-transform duration-300 hover:scale-125 active:scale-110">{link.icon}</span>
                      {/* Active state indicator (pink line at top) */}
                      {isActive && (
                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-pink-600 rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Spacer to prevent content from being hidden behind bottom nav */}
          <div className="h-16"></div>
        </>
      ) : null}
    </>
  );
}

// Bottom Menu Dropdown Component
function BottomMenuDropdown({ 
  additionalLinks, 
  isAuthenticated, 
  isAdmin, 
  pathname, 
  t, 
  auth 
}: {
  additionalLinks: Array<{ href: string; label: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  pathname: string;
  t: (key: string) => string;
  auth: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col items-center justify-center w-full py-2 px-1 transition-colors ${
          isOpen ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
        }`}
      >
        <span className="text-xl mb-1">⋯</span>
        <span className="text-xs font-medium uppercase tracking-wider">More</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
            {additionalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-pink-50 text-pink-600 border-l-4 border-pink-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-pink-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => {
                  auth.logout();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600 transition-colors border-t border-gray-200"
              >
                {t('common.logout')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
