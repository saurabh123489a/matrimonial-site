'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { notificationApi, userApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Close side menu when pressing Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (showUserMenu || showAuthModal)) {
        if (showUserMenu) setShowUserMenu(false);
        if (showAuthModal) {
          setShowAuthModal(false);
          router.push('/');
        }
      }
    };

    if (showUserMenu || showAuthModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu/modal is open
      document.body.style.overflow = 'hidden';
      // Prevent scrolling on iOS
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [showUserMenu, showAuthModal, router]);

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

  // Main navigation links for bottom bar - 5 items (Interests combined)
  const mainNavLinks = [
    { 
      href: '/profile', 
      label: 'Profile', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ), 
      tourId: 'profile' 
    },
    { 
      href: '/profiles', 
      label: 'Search', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ), 
      tourId: 'search' 
    },
    { 
      href: '/messages', 
      label: 'Message', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ), 
      tourId: 'messages' 
    },
    { 
      href: '/interests', 
      label: 'Interest', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ), 
      tourId: 'interests' 
    },
    { 
      href: '/community', 
      label: 'Community', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ), 
      tourId: 'community' 
    },
  ];

  // Additional links for dropdown menu - Common links (visible to all)
  const commonLinks = [
    { href: '/donation', label: t('common.donation') },
    { href: '/about', label: t('common.contact') },
  ];

  // Authenticated user links (all menu items NOT in bottom navigation)
  const authenticatedLinks = isAuthenticated ? [
    { href: '/notifications', label: t('common.notifications') },
    { href: '/profile-views', label: t('common.profileViews') },
    { href: '/settings/language', label: 'Language Settings' },
    { href: '/settings/privacy', label: 'Privacy Settings' },
  ] : [];

  // Admin links (only for admins)
  const adminLinks = (isAuthenticated && isAdmin) ? [
    { href: '/admin', label: 'Admin Portal' },
    { href: '/admin/reports', label: 'Admin Board' },
    { href: '/admin/db-status', label: 'DB Status' }
  ] : [];

  // Combine all links
  const additionalLinks = mounted ? [
    ...commonLinks,
    ...authenticatedLinks,
    ...adminLinks,
  ] : [];

  return (
    <>
      {/* Top Bar - Hamburger Menu (Left) | Logo (Center) | Icons (Right) */}
      <nav className="bg-white dark:bg-[#0f1117] border-b border-gray-200 dark:border-[#262932] sticky top-0 z-30 transition-colors safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 sm:min-h-20 py-2 sm:py-3 relative">
            {/* Left: Hamburger Menu Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="min-w-[44px] min-h-[44px] p-2.5 sm:p-2 text-gray-700 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-300 active:bg-gray-200 dark:active:bg-slate-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation"
              title="Menu"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Center: Logo */}
            <Link 
              href="/" 
              className="absolute left-1/2 transform -translate-x-1/2 text-lg sm:text-xl md:text-2xl font-light text-gray-900 dark:text-white tracking-tight px-2 truncate max-w-[60vw] sm:max-w-none"
            >
              💍 {t('common.appName')}
            </Link>
            
            {/* Right: Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {/* Search Icon - Show auth modal if not authenticated */}
              {mounted && !isAuthenticated ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="min-w-[44px] min-h-[44px] p-2 text-gray-700 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-300 active:bg-gray-200 dark:active:bg-slate-600 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation"
                  title="Search"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              ) : (
                <Link
                  href="/profiles"
                  className="min-w-[44px] min-h-[44px] p-2 text-gray-700 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-300 active:bg-gray-200 dark:active:bg-slate-600 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation flex items-center justify-center"
                  title="Search"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
              )}
              
              {/* Language Switcher - Always visible */}
              {mounted && <LanguageSwitcher />}
              
              {mounted && isAuthenticated && (
                <>
                  <Link
                    href="/notifications"
                    className="relative min-w-[44px] min-h-[44px] p-2 text-gray-700 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-300 active:bg-gray-200 dark:active:bg-slate-600 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation flex items-center justify-center"
                    title={t('common.notifications')}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] sm:text-xs font-bold text-white bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* User Profile Icon */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="min-w-[44px] min-h-[44px] p-2 text-gray-700 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-300 active:bg-gray-200 dark:active:bg-slate-600 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation"
                    title="User Menu"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  
                  {/* Side Menu Drawer */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop - Dims and blurs the background */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-30 backdrop-blur-[1px] z-40 transition-opacity duration-300 ease-in-out animate-fade-in"
                        onClick={() => setShowUserMenu(false)}
                        aria-hidden="true"
                      />
                      
                      {/* Side Drawer */}
                      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] sm:max-w-[90vw] bg-white dark:bg-[#181b23] shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
                        showUserMenu ? 'translate-x-0' : 'translate-x-full'
                      }`}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-[#181b23] border-b border-gray-200 dark:border-[#303341] px-4 py-4 flex items-center justify-between z-10">
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">
                            {t('common.menu') || 'Menu'}
                          </h2>
                          <button
                            onClick={() => setShowUserMenu(false)}
                            className="p-2 text-gray-500 dark:text-pink-300 hover:text-gray-700 dark:hover:text-pink-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
                            aria-label="Close menu"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Menu Content */}
                        <div className="px-4 py-4 space-y-1">
                          {/* Profile Link */}
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/profile'
                                ? 'bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-200'
                                : 'text-gray-700 dark:text-pink-100 hover:bg-gray-50 dark:hover:bg-[#1f212a]'
                            }`}
                            style={{ animationDelay: '0.05s' }}
                          >
                            <span className="text-xl">👤</span>
                            <span>{t('common.profile') || 'Profile'}</span>
                          </Link>
                          
                          {/* Theme Toggle */}
                          <button
                            onClick={() => {
                              toggleTheme();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-pink-100 hover:bg-gray-50 dark:hover:bg-[#1f212a] transition-all duration-200 rounded-lg transform active:scale-95"
                          >
                            {resolvedTheme === 'dark' ? (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>Light Mode</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                                <span>Dark Mode</span>
                              </>
                            )}
                          </button>
                          
                          {/* Language Switcher in Side Menu */}
                          <div className="px-4 py-3 border-t border-gray-200 dark:border-[#303341] mt-2">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg">🌐</span>
                              <span className="text-sm font-medium text-gray-700 dark:text-pink-100">
                                {t('common.language') || 'Language'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setLanguage('en')}
                                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                                  language === 'en'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                              >
                                English
                              </button>
                              <button
                                onClick={() => setLanguage('hi')}
                                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                                  language === 'hi'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                              >
                                हिंदी
                              </button>
                            </div>
                          </div>
                          
                          {/* Divider */}
                          <div className="border-t border-gray-200 dark:border-[#303341] my-2"></div>
                          
                          {/* Additional Links */}
                          {additionalLinks.map((link, index) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                                pathname === link.href
                                  ? 'bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-200'
                                  : 'text-gray-700 dark:text-pink-100 hover:bg-gray-50 dark:hover:bg-[#1f212a]'
                              }`}
                              style={{ animationDelay: `${(index + 2) * 0.05}s` }}
                            >
                              <span className="text-xl">
                                {link.href === '/donation' ? '💝' : 
                                 link.href === '/about' ? '📧' :
                                 link.href === '/notifications' ? '🔔' :
                                 link.href === '/profile-views' ? '👁️' :
                                 link.href === '/settings/language' ? '🌐' :
                                 link.href === '/settings/privacy' ? '🔒' :
                                 link.href === '/admin' ? '⚙️' :
                                 link.href === '/admin/reports' ? '📊' :
                                 link.href === '/admin/db-status' ? '🗄️' : '📄'}
                              </span>
                              <span>{link.label}</span>
                            </Link>
                          ))}
                          
                          {/* Divider before logout */}
                          <div className="border-t border-gray-200 dark:border-[#303341] my-2"></div>
                          
                          {/* Logout */}
                          <button
                            onClick={() => {
                              auth.logout();
                              setShowUserMenu(false);
                              router.push('/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 dark:text-pink-200 hover:bg-red-50 dark:hover:bg-pink-900/10 transition-all duration-200 rounded-lg transform active:scale-95"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{t('common.logout')}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              {mounted && !isAuthenticated && (
                <>
                  {/* Login Button */}
                  <Link
                    href="/login"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 min-h-[36px] sm:min-h-[40px] flex items-center justify-center touch-manipulation whitespace-nowrap"
                    title="Login"
                  >
                    {t('auth.login') || 'Login'}
                  </Link>
                  
                  {/* Side Menu Drawer for Non-Authenticated Users */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop - Dims and blurs the background */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-30 backdrop-blur-[1px] z-40 transition-opacity duration-300 ease-in-out animate-fade-in"
                        onClick={() => setShowUserMenu(false)}
                        aria-hidden="true"
                      />
                      
                      {/* Side Drawer */}
                      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] sm:max-w-[90vw] bg-white dark:bg-[#181b23] shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
                        showUserMenu ? 'translate-x-0' : 'translate-x-full'
                      }`}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-[#181b23] border-b border-gray-200 dark:border-[#303341] px-4 py-4 flex items-center justify-between z-10">
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">
                            {t('common.menu') || 'Menu'}
                          </h2>
                          <button
                            onClick={() => setShowUserMenu(false)}
                            className="p-2 text-gray-500 dark:text-pink-300 hover:text-gray-700 dark:hover:text-pink-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
                            aria-label="Close menu"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Menu Content */}
                        <div className="px-4 py-4 space-y-1">
                          {/* Contact Us */}
                          <Link
                            href="/about"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/about'
                                ? 'bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-200'
                                : 'text-gray-700 dark:text-pink-100 hover:bg-gray-50 dark:hover:bg-[#1f212a]'
                            }`}
                            style={{ animationDelay: '0.05s' }}
                          >
                            <span className="text-xl">📧</span>
                            <span>{t('common.contact') || 'Contact Us'}</span>
                          </Link>
                          
                          {/* Login */}
                          <Link
                            href="/login"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/login'
                                ? 'bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-200'
                                : 'text-gray-700 dark:text-pink-100 hover:bg-gray-50 dark:hover:bg-[#1f212a]'
                            }`}
                            style={{ animationDelay: '0.1s' }}
                          >
                            <span className="text-xl">🔐</span>
                            <span>{t('auth.login') || 'Login'}</span>
                          </Link>
                          
                          {/* Sign Up */}
                          <Link
                            href="/register"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/register'
                                ? 'bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-200'
                                : 'text-gray-700 dark:text-pink-100 hover:bg-gray-50 dark:hover:bg-[#1f212a]'
                            }`}
                            style={{ animationDelay: '0.15s' }}
                          >
                            <span className="text-xl">✨</span>
                            <span>{t('auth.signUp') || 'Sign Up'}</span>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal for Non-Authenticated Users */}
      {mounted && showAuthModal && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-black bg-opacity-50 absolute inset-0 transition-opacity duration-300 ease-in-out" 
            onClick={() => {
              setShowAuthModal(false);
              router.push('/');
            }}
          ></div>
          <div className="bg-white dark:bg-[#181b23] rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full relative z-10 animate-scale-in transform transition-all duration-300 ease-out">
            <div className="p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/');
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 dark:text-pink-300 hover:text-gray-600 dark:hover:text-pink-100 text-2xl sm:text-3xl font-bold transition-all duration-200 hover:scale-110 active:scale-95 rounded-full hover:bg-gray-100 dark:hover:bg-[#1f212a]"
                aria-label="Close"
              >
                ×
              </button>

              {/* Modal Content */}
              <div className="text-center mb-6 animate-slide-up">
                <div className="text-5xl sm:text-6xl mb-4 transform transition-transform duration-300 hover:scale-110">🔒</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-pink-100 mb-2">
                  Login Required
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-pink-200 mb-6 px-2">
                  Please login or sign up to search profiles, send interests, and connect with matches.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Link
                  href="/login"
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full px-6 py-3.5 sm:py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all duration-200 shadow-lg text-center transform active:scale-95 hover:shadow-xl min-h-[48px] flex items-center justify-center"
                >
                  {t('auth.login') || 'Login'}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full px-6 py-3.5 sm:py-3 bg-white dark:bg-[#1f212a] border-2 border-pink-600 text-pink-600 dark:text-pink-300 font-semibold rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all duration-200 shadow-md text-center transform active:scale-95 hover:shadow-lg min-h-[48px] flex items-center justify-center"
                >
                  {t('auth.signUp') || 'Sign Up'}
                </Link>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/');
                  }}
                  className="block w-full px-6 py-2.5 sm:py-2 text-gray-600 dark:text-pink-300 hover:text-gray-800 dark:hover:text-pink-100 font-medium text-sm transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Only show when authenticated - Mobile & Web */}
      {mounted && isAuthenticated ? (
        <>
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f1117] border-t-2 border-pink-200 dark:border-pink-700 z-40 shadow-2xl safe-area-inset-bottom transition-colors backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-around items-center h-20 sm:h-16 px-2">
                {mainNavLinks.map((link) => {
                  // Check if current path matches (including sub-routes)
                  const isActive = pathname === link.href || 
                    (link.href !== '/' && pathname.startsWith(link.href));
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      data-tour={link.tourId}
                      className={`relative flex flex-col items-center justify-center flex-1 py-2 px-2 transition-all duration-300 min-w-0 group ${
                        isActive
                          ? 'text-pink-600 dark:text-pink-200'
                          : 'text-gray-500 dark:text-pink-100 hover:text-pink-500 dark:hover:text-pink-200'
                      }`}
                    >
                      {/* Icon with improved styling */}
                      <div className={`relative transition-all duration-300 ${
                        isActive 
                          ? 'scale-110' 
                          : 'group-hover:scale-110 active:scale-95'
                      }`}>
                        {link.icon}
                      </div>
                      {/* Label text */}
                      <span className={`text-[10px] sm:text-xs font-medium mt-1 transition-all duration-300 ${
                        isActive 
                          ? 'opacity-100' 
                          : 'opacity-70 group-hover:opacity-100'
                      }`}>
                        {link.label}
                      </span>
                      {/* Active state indicator (pink line at top) */}
                      {isActive && (
                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-400 dark:to-pink-500 rounded-full shadow-lg"></span>
                      )}
                      {/* Hover effect background */}
                      <div className="absolute inset-0 rounded-lg bg-pink-50 dark:bg-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Spacer to prevent content from being hidden behind bottom nav */}
          <div className="h-20 sm:h-16"></div>
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
