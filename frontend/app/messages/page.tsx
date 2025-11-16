'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { messageApi, userApi, User } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';

interface Conversation {
  conversationId: string;
  otherUser: User;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    
    const token = auth.getToken();
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.sub || decoded.userId || null);
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }

    loadConversations();
    
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const loadConversations = async () => {
    try {
      const response = await messageApi.getConversations();
      if (response.status) {
        setConversations(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('messages.justNow');
    if (diffMins < 60) return t('messages.minutesAgo', { mins: diffMins });
    if (diffHours < 24) return t('messages.hoursAgo', { hours: diffHours });
    if (diffDays < 7) return t('messages.daysAgo', { days: diffDays });
    return date.toLocaleDateString();
  };

  const getPrimaryPhoto = (photos: any[]) => {
    if (!photos || photos.length === 0) return '/default-avatar.png';
    const primary = photos.find(p => p.isPrimary);
    return primary?.url || photos[0]?.url || '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A0C11] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A0C11]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('messages.title')}</h1>
          <p className="text-gray-600 dark:text-[#D5D3D7]">
            {unreadCount > 0 ? t('messages.unreadCount', { count: unreadCount, plural: unreadCount > 1 ? 's' : '' }) : t('messages.allCaughtUp')}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-[#F25D5D]/10 border border-red-200 dark:border-[#F25D5D] text-red-800 dark:text-[#F25D5D] px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white dark:bg-[#2B0F17] rounded-lg shadow-md p-12 text-center border dark:border-[#2F2327]">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600 dark:text-[#D5D3D7] text-lg mb-2">{t('messages.noConversations')}</p>
            <p className="text-gray-500 dark:text-[#A29CA3] text-sm mb-4">
              {t('messages.noConversationsDesc')}
            </p>
            <Link
              href="/profiles"
              className="inline-block px-6 py-2 bg-pink-600 dark:bg-[#E04F5F] text-white rounded-md hover:bg-pink-700 dark:hover:bg-[#C43A4E]"
            >
              {t('messages.browseProfiles')}
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#2B0F17] rounded-lg shadow-md divide-y divide-gray-200 dark:divide-[#2F2327] border dark:border-[#2F2327]">
            {conversations.map((conv) => (
              <Link
                key={conv.conversationId}
                href={`/messages/${conv.otherUser._id}`}
                className="block hover:bg-gray-50 dark:hover:bg-[#241317] transition-colors"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getPrimaryPhoto(conv.otherUser.photos || [])}
                      alt={conv.otherUser.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-[#2F2327]"
                      loading="lazy"
                      decoding="async"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {conv.otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-[#A29CA3] flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-[#D5D3D7]'
                      }`} dir="auto" lang={language}>
                        {(() => {
                          
                          const senderId = typeof conv.lastMessage.senderId === 'string' 
                            ? conv.lastMessage.senderId 
                            : (conv.lastMessage.senderId as any)?._id;
                          const isMyMessage = currentUserId && senderId === currentUserId;
                          return isMyMessage ? `${t('messages.you')}: ` : '';
                        })()}
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <div className="w-2 h-2 bg-pink-600 dark:bg-[#E04F5F] rounded-full flex-shrink-0 ml-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

