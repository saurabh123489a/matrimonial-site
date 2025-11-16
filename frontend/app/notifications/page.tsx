'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notificationApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { getProfileUrl } from '@/lib/profileUtils';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!auth.getToken()) {
      router.push('/login');
      return;
    }
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const response = await notificationApi.getAll({
        isRead: filter === 'unread' ? false : undefined,
      });
      if (response.status) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.status) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shortlist':
        return '⭐';
      case 'profile_view':
        return '👁️';
      case 'interest_received':
        return '💝';
      case 'interest_accepted':
        return '✅';
      case 'message_received':
        return '💬';
      case 'admin':
        return '📢';
      default:
        return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Notifications</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className="px-4 py-2 text-sm font-medium text-secondary bg-white dark:bg-[#12121a] border border-gray-300 dark:border-[#2a2a3a] rounded-md hover:bg-gray-50 dark:hover:bg-[#1a1a24]"
            >
              {filter === 'all' ? 'Unread Only' : 'All'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 dark:bg-[#00FFFF] rounded-md hover:bg-pink-700 dark:hover:bg-[#00E6E6]"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              You have <span className="font-bold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 bg-white dark:bg-[#12121a] rounded-lg shadow-sm border transition-colors ${
                  !notification.isRead ? 'border-pink-300 bg-pink-50 dark:bg-[#1a1a24] dark:border-[#00FFFF]' : 'border-gray-200 dark:border-[#2a2a3a]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{notification.title}</h3>
                      <p className="text-secondary text-sm mt-1">{notification.message}</p>
                      <p className="text-xs text-muted mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {notification.relatedUserId && (
                        <Link
                          href={getProfileUrl(notification.relatedUserId._id ? { _id: notification.relatedUserId._id, gahoiId: notification.relatedUserId.gahoiId } : { _id: String(notification.relatedUserId), gahoiId: undefined })}
                          className="text-pink-600 dark:text-[#00FFFF] hover:text-pink-700 dark:hover:text-[#C43A4E] text-sm mt-2 inline-block"
                        >
                          View Profile →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="px-3 py-1 text-xs font-medium text-pink-600 dark:text-[#00FFFF] bg-pink-50 dark:bg-[#1a1a24] rounded hover:bg-pink-100 dark:hover:bg-[#151520]"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await notificationApi.delete(notification._id);
                          loadNotifications();
                          loadUnreadCount();
                        } catch (error) {
                          console.error('Failed to delete:', error);
                        }
                      }}
                      className="text-muted hover:text-red-600 dark:hover:text-[#F25D5D]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

