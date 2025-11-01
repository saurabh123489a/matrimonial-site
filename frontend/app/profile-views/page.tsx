'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileViewApi, messageApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import ProfileCard from '@/components/ProfileCard';

export default function ProfileViewsPage() {
  const router = useRouter();
  const [views, setViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState<Record<string, string>>({});
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.getToken()) {
      router.push('/login');
      return;
    }
    loadViews();
  }, []);

  const loadViews = async () => {
    try {
      const response = await profileViewApi.getMyViews();
      if (response.status) {
        setViews(response.data);
      }
    } catch (error) {
      console.error('Failed to load views:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (viewerId: string) => {
    const content = messageText[viewerId];
    if (!content || !content.trim()) {
      alert('Please enter a message');
      return;
    }

    setSendingMessage(viewerId);
    try {
      await messageApi.send(viewerId, content);
      setMessageText((prev) => ({ ...prev, [viewerId]: '' }));
      alert('Message sent successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Who Viewed Your Profile</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading views...</p>
          </div>
        ) : views.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No one has viewed your profile yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {views.map((view) => {
              const viewer = view.viewerId;
              return (
                <div key={view._id} className="bg-white rounded-lg shadow-sm p-6">
                  <ProfileCard user={viewer} />
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-3">
                      Viewed {new Date(view.viewedAt).toLocaleString()}
                    </p>
                    <div className="space-y-2">
                      <textarea
                        placeholder="Send a message..."
                        value={messageText[viewer._id] || ''}
                        onChange={(e) =>
                          setMessageText((prev) => ({
                            ...prev,
                            [viewer._id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendMessage(viewer._id)}
                          disabled={sendingMessage === viewer._id}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
                        >
                          {sendingMessage === viewer._id ? 'Sending...' : 'Send Message'}
                        </button>
                        <Link
                          href={`/profiles/${viewer._id}`}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

