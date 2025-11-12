'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { messageApi, userApi, User } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { getProfileUrl } from '@/lib/profileUtils';

interface Message {
  _id: string;
  senderId: User;
  receiverId: User;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useTranslation();
  const userId = params.userId as string;
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      await Promise.all([
        loadUserProfile(),
        loadConversation()
      ]);
      
      // Get current user ID
      userApi.getMe().then(res => {
        if (isMounted && res.status && res.data) {
          setCurrentUserId(res.data._id);
        }
      });
    };

    loadData();

    // Auto-refresh messages every 5 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        loadConversation(false); // Silent refresh
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserProfile = async () => {
    try {
      const response = await userApi.getById(userId);
      if (response.status && response.data) {
        setOtherUser(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user profile');
    }
  };

  const loadConversation = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await messageApi.getConversation(userId, { limit: 50 });
      if (response.status) {
        // Reverse to show oldest first (easier for chat UI)
        const reversedMessages = [...(response.data || [])].reverse();
        setMessages(reversedMessages);
        
        // Mark conversation as read
        if (response.data && response.data.length > 0) {
          await messageApi.markAsRead(userId).catch(() => {});
        }
      }
    } catch (err: any) {
      if (showLoading) {
        setError(err.response?.data?.message || t('messages.failedToLoad'));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await messageApi.send(userId, newMessage.trim());
      if (response.status) {
        setNewMessage('');
        // Reload conversation to show new message
        await loadConversation(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('messages.failedToSend'));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('messages.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('messages.yesterday');
    } else {
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getPrimaryPhoto = (photos: any[]) => {
    if (!photos || photos.length === 0) return '/default-avatar.png';
    const primary = photos.find(p => p.isPrimary);
    return primary?.url || photos[0]?.url || '/default-avatar.png';
  };

  const isMyMessage = (message: Message) => {
    const senderId = typeof message.senderId === 'object' && message.senderId 
      ? (message.senderId as any)._id 
      : message.senderId;
    return currentUserId && String(senderId) === String(currentUserId);
  };

  if (loading && !otherUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t('messages.loadingConversation')}</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('messages.userNotFound')}</p>
          <Link href="/messages" className="text-pink-600 hover:text-pink-700">
            {t('messages.goBack')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link href="/messages" className="text-gray-600 hover:text-gray-900">
              ← {t('messages.back')}
            </Link>
            <img
              src={getPrimaryPhoto(otherUser.photos || [])}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              loading="lazy"
              decoding="async"
            />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{otherUser.name}</h1>
              <p className="text-sm text-gray-500">
                {otherUser.age ? `${otherUser.age} years` : 'Age not specified'}
                {otherUser.city && ` • ${otherUser.city}`}
              </p>
            </div>
            <Link
              href={otherUser ? getProfileUrl(otherUser) : `/profiles/${userId}`}
              className="px-4 py-2 text-sm bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100"
            >
              {t('messages.viewProfile')}
            </Link>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-600">{t('messages.noMessages')}</p>
              <p className="text-sm text-gray-500 mt-2">{t('messages.noMessagesDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const myMessage = isMyMessage(message);
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                const showTime = index === messages.length - 1 ||
                  formatTime(messages[index + 1].createdAt) !== formatTime(message.createdAt) ||
                  Math.abs(new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime()) > 300000; // 5 minutes

                // Get sender info for display
                const senderInfo = typeof message.senderId === 'object' && message.senderId
                  ? message.senderId
                  : { _id: message.senderId, name: 'Unknown', photos: [] };

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-4">
                        {formatDate(message.createdAt)}
                      </div>
                    )}
                    <div className={`flex gap-3 ${myMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!myMessage && (
                        <img
                          src={getPrimaryPhoto((senderInfo as any).photos || [])}
                          alt={(senderInfo as any).name || 'User'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className={`flex flex-col ${myMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            myMessage
                              ? 'bg-pink-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words" dir="auto" lang={language}>
                            {message.content}
                          </p>
                        </div>
                        {showTime && (
                          <span className="text-xs text-gray-500 mt-1 px-2" dir="ltr">
                            {formatTime(message.createdAt)}
                            {myMessage && message.isRead && (
                              <span className="ml-1">✓✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('messages.typeMessage')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={5000}
              disabled={sending}
              dir="auto"
              lang={language}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {sending ? t('messages.sending') : t('messages.send')}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-right">
            {t('messages.messageLength', { length: newMessage.length })}
          </p>
        </div>
      </div>
    </div>
  );
}

