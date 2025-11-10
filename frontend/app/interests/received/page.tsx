'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { interestApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';

export default function InterestReceivedPage() {
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
      const response = await interestApi.getIncoming();
      if (response.status) {
        setInterests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (fromUserId: string, response: 'accept' | 'reject') => {
    try {
      const result = await interestApi.respond(fromUserId, response);
      if (result.status) {
        loadInterests();
      }
    } catch (error) {
      console.error('Error responding to interest:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <SkeletonLoader type="text" count={5} className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900 rounded-lg">
            <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-slate-100">Interest Received</h1>
        </div>

        {interests.length === 0 ? (
          <EmptyState
            icon="💌"
            title="No interests received yet"
            description="When someone shows interest in your profile, it will appear here"
            action={{
              label: "Browse Profiles",
              href: "/profiles"
            }}
          />
        ) : (
          <div className="space-y-4">
            {interests.map((interest: any) => (
              <div
                key={interest._id || interest.id}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-all rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/profiles/${interest.fromUser?._id || interest.fromUserId}`}
                      className="block"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {interest.fromUser?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {interest.fromUser?.age && `${interest.fromUser.age} years`}
                        {interest.fromUser?.city && ` • ${interest.fromUser.city}`}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-500 mb-4">
                      Received on {new Date(interest.createdAt || interest.sentAt).toLocaleDateString()}
                    </p>
                    {interest.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRespond(interest.fromUser?._id || interest.fromUserId, 'accept')}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium hover:from-pink-700 hover:to-red-700 transition-all text-sm rounded-lg shadow-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(interest.fromUser?._id || interest.fromUserId, 'reject')}
                          className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Decline
                        </button>
                      </div>
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
                  {interest.fromUser?.profileImage && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={interest.fromUser.profileImage}
                        alt={interest.fromUser.name}
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

