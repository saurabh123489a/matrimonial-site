'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { notificationApi, userApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Check authentication on client side only
  useEffect(() => {
    setMounted(true);
    const authenticated = auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      loadUnreadCount();
      checkAdminStatus();
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000); // Refresh every 30 seconds
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
      if (event.key === 'Escape') {
        if (showUserMenu) setShowUserMenu(false);
        if (showAuthModal) {
          setShowAuthModal(false);
          router.push('/');
        }
        if (showNotifications) setShowNotifications(false);
      }
    };

    if (showUserMenu || showAuthModal || showNotifications) {
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
  }, [showUserMenu, showAuthModal, showNotifications, router]);

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

  const loadRecentNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await notificationApi.getAll({ limit: 5, isRead: false });
      if (response.status) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    if (newState) {
      loadRecentNotifications();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      loadUnreadCount();
      loadRecentNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shortlist':
        return (
          <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'profile_view':
        return (
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'interest_received':
        return (
          <svg className="w-5 h-5 text-pink-500 dark:text-pink-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        );
      case 'interest_accepted':
        return (
          <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        );
      case 'message_received':
        return (
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'admin':
        return (
          <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const parseNotificationMessage = (message: string) => {
    // Parse message to extract user names and make them clickable
    // Example: "User 5554 accepted your interest" -> "User 5554" and "your interest" are links
    const parts = message.split(/(User \d+|your interest|their shortlist)/g);
    return parts.map((part, index) => {
      if (part.match(/User \d+/)) {
        return (
          <span key={index} className="underline text-pink-600 dark:text-[#E04F5F] cursor-pointer hover:text-pink-700 dark:hover:text-[#C43A4E]">
            {part}
          </span>
        );
      }
      if (part.match(/(your interest|their shortlist)/)) {
        return (
          <span key={index} className="underline text-pink-600 dark:text-[#E04F5F] cursor-pointer hover:text-pink-700 dark:hover:text-[#C43A4E]">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
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
      label: 'Browse', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ), 
      tourId: 'browse' 
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
    { href: '/settings', label: t('settings.title') || 'Settings' },
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
      <nav className="bg-white dark:bg-[#1A0C11] border-b border-gray-200 dark:border-[#2F2327] sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 relative">
            {/* Left: Hamburger Menu Button - Only show when NOT authenticated */}
            {mounted && !isAuthenticated && (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex-shrink-0 min-w-[44px] min-h-[44px] p-2 text-secondary hover:text-pink-600 dark:hover:text-red-400 active:bg-gray-200 dark:active:bg-slate-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation flex items-center justify-center"
                title="Menu"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            {/* Spacer when authenticated to keep logo centered */}
            {mounted && isAuthenticated && (
              <div className="flex-shrink-0 min-w-[44px] min-h-[44px]"></div>
            )}
            
            {/* Logo - Left on mobile (right after hamburger/spacer), Center on larger screens */}
            <div className="absolute left-[56px] sm:left-1/2 sm:transform sm:-translate-x-1/2 px-2 flex items-center justify-center">
              <Logo 
                size="md" 
                className="truncate max-w-[60vw] sm:max-w-none"
              />
            </div>
            
            {/* Right: Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
              {/* Search Icon - Show auth modal if not authenticated */}
              {mounted && !isAuthenticated && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="min-w-[44px] min-h-[44px] p-2 text-secondary hover:text-pink-600 dark:hover:text-red-400 active:bg-gray-200 dark:active:bg-slate-600 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation flex items-center justify-center"
                  title="Search"
                  aria-label="Search profiles"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              
              {/* Language Switcher - Always visible */}
              {mounted && <LanguageSwitcher />}
              
              {mounted && isAuthenticated && (
                <>
                  <div className="relative">
                    <button
                      onClick={handleNotificationClick}
                      className="relative min-w-[44px] min-h-[44px] p-2 text-gray-700 text-primary hover:text-pink-600 dark:hover:text-[#E04F5F] active:bg-gray-200 dark:active:bg-[#241317] transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B0F17] touch-manipulation flex items-center justify-center"
                      title={t('common.notifications')}
                      aria-label={`${t('common.notifications')}${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] sm:text-xs font-bold text-white bg-red-600 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 bg-black bg-opacity-10 dark:bg-opacity-15 backdrop-blur-[0.5px] z-40 transition-opacity duration-300 ease-in-out animate-fade-in"
                          onClick={() => setShowNotifications(false)}
                          aria-hidden="true"
                        />
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[90vw] bg-white dark:bg-[#2B0F17] shadow-2xl rounded-lg border border-gray-200 dark:border-[#2F2327] z-50 max-h-[70vh] overflow-hidden flex flex-col animate-slide-down">
                          <div className="sticky top-0 bg-white dark:bg-[#2B0F17] border-b border-gray-200 dark:border-[#2F2327] px-4 py-3 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-primary">
                              {t('common.notifications') || 'Notifications'}
                            </h3>
                            <button
                              onClick={() => setShowNotifications(false)}
                              className="p-1 text-muted hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#241317] rounded transition-colors"
                              aria-label="Close notifications"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="overflow-y-auto flex-1">
                            {loadingNotifications ? (
                              <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 dark:border-[#E04F5F] border-t-transparent"></div>
                                <p className="mt-4 text-sm text-secondary">Loading notifications...</p>
                              </div>
                            ) : notifications.length === 0 ? (
                              <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🔔</div>
                                <p className="text-sm text-secondary">No new notifications</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-200 dark:divide-[#2F2327]">
                                {notifications.map((notification) => (
                                  <Link
                                    key={notification._id}
                                    href="/notifications"
                                    onClick={() => {
                                      setShowNotifications(false);
                                      if (!notification.isRead) {
                                        handleMarkAsRead(notification._id);
                                      }
                                    }}
                                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-[#241317] transition-colors cursor-pointer ${
                                      !notification.isRead ? 'bg-pink-50/50 dark:bg-[#241317] dark:border-l-2 dark:border-l-[#E04F5F]' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-primary text-sm mb-1.5">
                                          {notification.title}
                                        </h4>
                                        <p className="text-secondary text-xs mb-2 leading-relaxed">
                                          {parseNotificationMessage(notification.message)}
                                        </p>
                                        <p className="text-xs text-muted mt-2">
                                          {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                      </div>
                                      {!notification.isRead && (
                                        <span className="w-2.5 h-2.5 bg-red-500 dark:bg-red-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                      )}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="sticky bottom-0 bg-white dark:bg-[#2B0F17] border-t border-gray-200 dark:border-[#2F2327] px-4 py-3">
                            <Link
                              href="/notifications"
                              onClick={() => setShowNotifications(false)}
                              className="block w-full text-center px-4 py-2 text-sm font-medium text-pink-600 dark:text-[#E04F5F] hover:text-pink-700 dark:hover:text-[#C43A4E] hover:bg-pink-50 dark:hover:bg-[#241317] rounded-md transition-colors"
                            >
                              View More <span className="inline-block ml-1">→</span>
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* User Profile Icon */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="min-w-[44px] min-h-[44px] p-2 text-secondary hover:text-pink-600 dark:hover:text-red-400 active:bg-gray-200 dark:active:bg-slate-600 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-manipulation flex items-center justify-center"
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
                          <h2 className="text-base font-semibold text-gray-900 text-primary">
                            {t('common.menu') || 'Menu'}
                          </h2>
                          <button
                            onClick={() => setShowUserMenu(false)}
                            className="p-2 text-gray-500 text-muted hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
                            aria-label="Close menu"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Menu Content */}
                        <div className="px-4 py-4 space-y-1">
                          {/* My Profile Link - First Item */}
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/profile'
                                ? 'bg-pink-50 dark:bg-[#241317] text-pink-600 dark:text-[#E04F5F]'
                                : 'text-gray-700 dark:text-[#D5D3D7] hover:bg-gray-50 dark:hover:bg-[#241317]'
                            }`}
                            style={{ animationDelay: '0.05s' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{t('profile.myProfile') || 'My Profile'}</span>
                          </Link>
                          
                          {/* Settings Link */}
                          <Link
                            href="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/settings' || pathname.startsWith('/settings/')
                                ? 'bg-pink-50 dark:bg-[#241317] text-pink-600 dark:text-[#E04F5F]'
                                : 'text-gray-700 dark:text-[#D5D3D7] hover:bg-gray-50 dark:hover:bg-[#241317]'
                            }`}
                            style={{ animationDelay: '0.1s' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{t('settings.title') || 'Settings'}</span>
                          </Link>
                          
                          {/* Divider */}
                          <div className="border-t border-gray-200 dark:border-[#2F2327] my-2"></div>
                          
                          {/* Additional Links */}
                          {additionalLinks.map((link, index) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                                pathname === link.href
                                  ? 'bg-pink-50 dark:bg-red-900/20 text-pink-600 dark:text-red-400'
                                  : 'text-secondary hover:bg-gray-50 dark:hover:bg-[#1f212a]'
                              }`}
                              style={{ animationDelay: `${(index + 2) * 0.05}s` }}
                            >
                              <span className="text-lg">
                                {link.href === '/donation' ? '💝' : 
                                 link.href === '/about' ? '📧' :
                                 link.href === '/notifications' ? '🔔' :
                                 link.href === '/profile-views' ? '👁️' :
                                 link.href === '/settings' ? '⚙️' :
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
                          <div className="border-t border-gray-200 dark:border-[#2F2327] my-2"></div>
                          
                          {/* Logout */}
                          <button
                            onClick={() => {
                              auth.logout();
                              setShowUserMenu(false);
                              router.push('/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-[#F25D5D] hover:bg-red-50 dark:hover:bg-[#241317] transition-all duration-200 rounded-lg transform active:scale-95"
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
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-pink-600 dark:bg-[#E04F5F] hover:bg-pink-700 dark:hover:bg-[#C43A4E] active:bg-pink-800 dark:active:bg-[#C43A4E] rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 min-h-[36px] sm:min-h-[40px] flex items-center justify-center touch-manipulation whitespace-nowrap"
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
                          <h2 className="text-base font-semibold text-gray-900 text-primary">
                            {t('common.menu') || 'Menu'}
                          </h2>
                          <button
                            onClick={() => setShowUserMenu(false)}
                            className="p-2 text-gray-500 text-muted hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
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
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/about'
                                ? 'bg-pink-50 dark:bg-[#241317] text-pink-600 dark:text-[#E04F5F]'
                                : 'text-gray-700 dark:text-[#D5D3D7] hover:bg-gray-50 dark:hover:bg-[#241317]'
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
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/login'
                                ? 'bg-pink-50 dark:bg-[#241317] text-pink-600 dark:text-[#E04F5F]'
                                : 'text-gray-700 dark:text-[#D5D3D7] hover:bg-gray-50 dark:hover:bg-[#241317]'
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
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg transform active:scale-95 ${
                              pathname === '/register'
                                ? 'bg-pink-50 dark:bg-[#241317] text-pink-600 dark:text-[#E04F5F]'
                                : 'text-gray-700 dark:text-[#D5D3D7] hover:bg-gray-50 dark:hover:bg-[#241317]'
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
          <div className="bg-white dark:bg-[#2B0F17] rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full relative z-10 animate-scale-in transform transition-all duration-300 ease-out border dark:border-[#2F2327]">
            <div className="p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/');
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-gray-600 dark:hover:text-white text-2xl sm:text-3xl font-bold transition-all duration-200 hover:scale-110 active:scale-95 rounded-full hover:bg-gray-100 dark:hover:bg-[#241317]"
                aria-label="Close"
              >
                ×
              </button>

              {/* Modal Content */}
              <div className="text-center mb-6 animate-slide-up">
                <div className="text-5xl sm:text-6xl mb-4 transform transition-transform duration-300 hover:scale-110">🔒</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                  Login Required
                </h2>
                <p className="text-sm sm:text-base text-secondary mb-6 px-2">
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
                  className="block w-full px-6 py-3.5 sm:py-3 bg-white dark:bg-[#1F1417] border-2 border-pink-600 dark:border-[#E04F5F] text-pink-600 dark:text-[#E04F5F] font-semibold rounded-md hover:bg-pink-50 dark:hover:bg-[#241317] transition-all duration-200 shadow-md text-center transform active:scale-95 hover:shadow-lg min-h-[48px] flex items-center justify-center"
                >
                  {t('auth.signUp') || 'Sign Up'}
                </Link>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/');
                  }}
                  className="block w-full px-6 py-2.5 sm:py-2 text-gray-600 dark:text-[#A29CA3] hover:text-gray-800 dark:hover:text-white font-medium text-sm transition-colors duration-200 min-h-[44px] flex items-center justify-center"
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
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A0C11] border-t-2 border-pink-200 dark:border-[#2F2327] z-40 shadow-2xl safe-area-inset-bottom transition-colors backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
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
                          ? 'text-pink-600 dark:text-[#E04F5F]'
                          : 'text-muted hover:text-pink-500 dark:hover:text-[#E04F5F]'
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
                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-pink-500 to-pink-600 dark:from-[#E04F5F] dark:to-[#C43A4E] rounded-full shadow-lg"></span>
                      )}
                      {/* Hover effect background */}
                      <div className="absolute inset-0 rounded-lg bg-pink-50 dark:bg-[#241317] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
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
  auth: typeof import('@/lib/auth').auth;
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
