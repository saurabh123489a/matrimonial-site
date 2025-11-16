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
      <div className="min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-secondary">{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">{t('messages.title')}</h1>
          <p className="text-secondary">
            {unreadCount > 0 ? t('messages.unreadCount', { count: unreadCount, plural: unreadCount > 1 ? 's' : '' }) : t('messages.allCaughtUp')}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50">
            {error}
          </div>
        )}

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-secondary text-lg mb-2">{t('messages.noConversations')}</p>
            <p className="text-muted text-sm mb-4">
              {t('messages.noConversationsDesc')}
            </p>
            <Link
              href="/profiles"
              className="inline-block px-6 py-2 bg-pink-600"
            >
              {t('messages.browseProfiles')}
            </Link>
          </div>
        ) : (
          <div className="bg-white">
            {conversations.map((conv) => (
              <Link
                key={conv.conversationId}
                href={`/messages/${conv.otherUser._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getPrimaryPhoto(conv.otherUser.photos || [])}
                      alt={conv.otherUser.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
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
                      <h3 className="text-lg font-semibold text-primary truncate">
                        {conv.otherUser.name}
                      </h3>
                      <span className="text-xs text-muted flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        conv.unreadCount > 0 ? 'font-semibold text-primary' : 'text-secondary'
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
                        <div className="w-2 h-2 bg-pink-600"></div>
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

