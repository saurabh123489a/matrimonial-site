'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { interestApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function InterestSentPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const response = await interestApi.getOutgoing();
      if (response.status) {
        setInterests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-8">Interest Sent</h1>

        {interests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't sent any interests yet</p>
            <Link
              href="/profiles"
              className="inline-block px-6 py-3 bg-black text-white font-medium hover:bg-gray-900 transition-colors text-sm uppercase tracking-wider"
            >
              Browse Profiles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {interests.map((interest: any) => (
              <div
                key={interest._id || interest.id}
                className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/profiles/${interest.toUser?._id || interest.toUserId}`}
                      className="block"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {interest.toUser?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {interest.toUser?.age && `${interest.toUser.age} years`}
                        {interest.toUser?.city && ` • ${interest.toUser.city}`}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-500 mb-4">
                      Sent on {new Date(interest.createdAt || interest.sentAt).toLocaleDateString()}
                    </p>
                    {interest.status === 'pending' && (
                      <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                    {interest.status === 'accepted' && (
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-medium uppercase tracking-wider">
                        Accepted
                      </span>
                    )}
                    {interest.status === 'rejected' && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium uppercase tracking-wider">
                        Declined
                      </span>
                    )}
                  </div>
                  {interest.toUser?.profileImage && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={interest.toUser.profileImage}
                        alt={interest.toUser.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

