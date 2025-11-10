'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { interestApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';

type TabType = 'received' | 'sent';
type InterestStatus = 'pending' | 'accepted' | 'rejected';

export default function InterestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [receivedInterests, setReceivedInterests] = useState<any[]>([]);
  const [sentInterests, setSentInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<InterestStatus | 'all'>('all');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadAllInterests();
  }, []);

  const loadAllInterests = async () => {
    try {
      setLoading(true);
      const [receivedResponse, sentResponse] = await Promise.all([
        interestApi.getIncoming().catch(() => ({ status: false, data: [] })),
        interestApi.getOutgoing().catch(() => ({ status: false, data: [] }))
      ]);

      if (receivedResponse.status) {
        setReceivedInterests(receivedResponse.data || []);
      }
      if (sentResponse.status) {
        setSentInterests(sentResponse.data || []);
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
        loadAllInterests();
      }
    } catch (error) {
      console.error('Error responding to interest:', error);
    }
  };

  const getFilteredInterests = (interests: any[]) => {
    if (filterStatus === 'all') return interests;
    return interests.filter(interest => interest.status === filterStatus);
  };

  const getStatusBadge = (status: InterestStatus) => {
    const badges = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      accepted: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return badges[status] || badges.pending;
  };

  const getStatusLabel = (status: InterestStatus) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Declined'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <SkeletonLoader type="text" count={5} className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  const currentInterests = activeTab === 'received' ? receivedInterests : sentInterests;
  const filteredInterests = getFilteredInterests(currentInterests);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900 rounded-lg">
              <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-red-600">Interests</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-red-900">
            <button
              onClick={() => {
                setActiveTab('received');
                setFilterStatus('all');
              }}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'received'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Received ({receivedInterests.length})
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('sent');
                setFilterStatus('all');
              }}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'sent'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Sent ({sentInterests.length})
              </div>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              All ({currentInterests.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              Pending ({currentInterests.filter(i => i.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'accepted'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              Accepted ({currentInterests.filter(i => i.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'rejected'
                  ? 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              Declined ({currentInterests.filter(i => i.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Content */}
        {filteredInterests.length === 0 ? (
          <EmptyState
            icon={activeTab === 'received' ? '💌' : '📤'}
            title={activeTab === 'received' ? 'No interests received yet' : 'You haven\'t sent any interests yet'}
            description={activeTab === 'received' 
              ? 'When someone shows interest in your profile, it will appear here'
              : 'Browse profiles and send interest to connect with potential matches'}
            action={{
              label: 'Browse Profiles',
              href: '/profiles'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredInterests.map((interest: any) => {
              const user = activeTab === 'received' ? interest.fromUser : interest.toUser;
              const userId = activeTab === 'received' ? (interest.fromUser?._id || interest.fromUserId) : (interest.toUser?._id || interest.toUserId);

              return (
                <div
                  key={interest._id || interest.id}
                  className="bg-white dark:bg-black border border-gray-200 dark:border-red-900 p-6 hover:shadow-md transition-all rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/profiles/${userId}`}
                        className="block"
                      >
                        <h3 className="text-lg font-medium text-gray-900 dark:text-red-600 mb-2">
                          {user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-red-500 mb-4">
                          {user?.age && `${user.age} years`}
                          {user?.city && ` • ${user.city}`}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-red-500 mb-4">
                        {activeTab === 'received' ? 'Received' : 'Sent'} on {new Date(interest.createdAt || interest.sentAt).toLocaleDateString()}
                      </p>
                      
                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider border ${getStatusBadge(interest.status)}`}>
                          {getStatusLabel(interest.status)}
                        </span>
                      </div>

                      {/* Action Buttons for Received */}
                      {activeTab === 'received' && interest.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRespond(userId, 'accept')}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium hover:from-pink-700 hover:to-red-700 transition-all text-sm rounded-lg shadow-md"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(userId, 'reject')}
                            className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 dark:border-red-900 text-gray-700 dark:text-red-500 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm rounded-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                    {user?.photos?.[0] && (
                      <div className="ml-4 flex-shrink-0">
                        <img
                          src={user.photos[0].url}
                          alt={user.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
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

