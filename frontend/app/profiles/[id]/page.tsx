'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userApi, interestApi, shortlistApi, reportApi, User } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import BlockReportModal from '@/components/BlockReportModal';
import ProfileBadges from '@/components/ProfileBadges';
import ProfileShareModal from '@/components/ProfileShareModal';
import StructuredData from '@/components/StructuredData';
import LoadingSpinner from '@/components/LoadingSpinner';
import { trackProfileView, trackInterestSent } from '@/lib/analytics';
import { sortPhotos } from '@/lib/utils/photoUtils';

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showBlockReportModal, setShowBlockReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('inappropriate-content');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const loadProfile = async () => {
      try {
        setLoading(true);
        const [profileResponse, shortlistResponse, myProfileResponse] = await Promise.all([
          userApi.getById(id),
          shortlistApi.check(id).catch(() => ({ status: true, data: { isShortlisted: false } })),
          userApi.getMe().catch(() => ({ status: false, data: null }))
        ]);
        
        
        if (!isMounted) return;
        
        if (profileResponse.status) {
          setUser(profileResponse.data);
          
          trackProfileView(id, profileResponse.data.name);
        }
        
        if (shortlistResponse.status) {
          setIsShortlisted(shortlistResponse.data.isShortlisted);
        }

        if (myProfileResponse.status && myProfileResponse.data) {
          setCurrentUser(myProfileResponse.data);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProfile();
    }

    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [id, router]);

  const handleSendInterest = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await interestApi.send(id);
      trackInterestSent(id);
      alert(t('interests.interestSent'));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShortlist = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (isShortlisted) {
        await shortlistApi.remove(id);
        setIsShortlisted(false);
      } else {
        await shortlistApi.add(id);
        setIsShortlisted(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (userId: string) => {
    
    
    const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
    if (!blockedUsers.includes(userId)) {
      blockedUsers.push(userId);
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
      alert('User blocked successfully');
      router.push('/profiles');
    }
  };

  const handleReport = async (userId: string, reason: string) => {
    if (!user) return;
    setReportLoading(true);
    try {
      const response = await reportApi.reportProfile({
        reportedUserId: userId,
        reason: reportReason as any,
        description: reason || undefined,
      });
      if (response.status) {
        alert('Profile reported successfully. Admin will review it.');
        setShowBlockReportModal(false);
        setReportDescription('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to report profile');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" showWelcomeMessage={true} />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 rounded mb-4 max-w-md">
            {error || 'Profile not found'}
          </div>
          <Link href="/profiles" className="text-pink-600 hover:text-pink-700 font-medium">
            ← {t('common.browseProfiles')}
          </Link>
        </div>
      </div>
    );
  }

  
  const photos = sortPhotos(user.photos || []);
  const selectedPhoto = photos[selectedPhotoIndex] || photos[0];

  
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ekgahoi.com';
  const profileStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    ...(user.age && { age: user.age }),
    ...(user.city && { address: { '@type': 'PostalAddress', addressLocality: user.city, addressRegion: user.state } }),
    ...(user.bio && { description: user.bio }),
    url: `${siteUrl}/profiles/${id}`,
    ...(user.photos?.[0] && {
      image: user.photos.find((p: any) => p.isPrimary)?.url || user.photos[0].url,
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <StructuredData data={profileStructuredData} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/profiles" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6 font-medium">
          <span>←</span> {t('common.browseProfiles')}
        </Link>

        {/* Main Profile Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Left Column - Photos */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                {/* Main Photo */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/5' }}>
                  {selectedPhoto ? (
                    <img
                      src={selectedPhoto.url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl text-gray-300">
                      👤
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    <ProfileBadges user={user} showOnlineStatus={true} showLastSeen={true} />
                  </div>
                </div>

                {/* Photo Thumbnails */}
                {photos.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                          selectedPhotoIndex === index ? 'border-pink-600' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                )}

                       {/* Action Buttons */}
                       <div className="mt-6 space-y-3">
                         <Link
                           href={`/messages/${id}`}
                           className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-md hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg text-center"
                         >
                           💬 Send Message
                         </Link>
                         <button
                           onClick={handleSendInterest}
                           disabled={actionLoading}
                           className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all shadow-lg disabled:opacity-50"
                         >
                           {actionLoading ? t('common.loading') : '💝 ' + t('interests.sendInterest')}
                         </button>
                         <button
                           onClick={handleShortlist}
                           disabled={actionLoading}
                           className={`w-full px-6 py-3 font-semibold rounded-md transition-all shadow-md disabled:opacity-50 ${
                             isShortlisted
                               ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                               : 'bg-white border-2 border-pink-600 text-pink-600 hover:bg-pink-50'
                           }`}
                         >
                           {isShortlisted ? '✓ ' + t('shortlist.shortlisted') : '⭐ ' + t('shortlist.addToShortlist')}
                         </button>
                  {/* Share Profile Button */}
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all shadow-lg"
                  >
                    📤 Share Profile
                  </button>
                  {/* Block/Report Button */}
                  <button
                    onClick={() => setShowBlockReportModal(true)}
                    className="w-full px-6 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-all shadow-md"
                  >
                    ⚙️ Block / Report
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      {user.age && <span className="font-medium">{user.age} Years</span>}
                      {user.gender && <span className="capitalize">• {user.gender}</span>}
                      {(user.city || user.state) && (
                        <span className="flex items-center">
                          📍 {user.city}{user.state && `, ${user.state}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('profile.education')}</h3>
                  <p className="text-gray-900 font-medium">{user.education || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('profile.occupation')}</h3>
                  <p className="text-gray-900 font-medium">{user.occupation || 'Not specified'}</p>
                </div>
                {user.motherTongue && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Mother Tongue</h3>
                    <p className="text-gray-900 font-medium">{user.motherTongue}</p>
                  </div>
                )}
                {user.annualIncome && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Annual Income</h3>
                    <p className="text-gray-900 font-medium">₹{user.annualIncome.toLocaleString()}</p>
                  </div>
                )}
                {user.height && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Height</h3>
                    <p className="text-gray-900 font-medium">{user.height}" ({Math.round(user.height * 2.54)} cm)</p>
                  </div>
                )}
                {user.diet && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Diet</h3>
                    <p className="text-gray-900 font-medium capitalize">{user.diet}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              {(user.city || user.state || user.country) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Location</h3>
                  <p className="text-gray-900 font-medium">
                    {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Bio */}
              {user.bio && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{user.bio}</p>
                </div>
              )}

              {/* Block/Report Modal */}
              <BlockReportModal
                userId={id}
                userName={user.name}
                isOpen={showBlockReportModal}
                onClose={() => setShowBlockReportModal(false)}
                onBlock={handleBlock}
                onReport={handleReport}
              />

              {/* Profile Share Modal */}
              {user && (
                <ProfileShareModal
                  isOpen={showShareModal}
                  onClose={() => setShowShareModal(false)}
                  profileId={id}
                  profileName={user.name}
                  profileUrl={`/profiles/${id}`}
                  user={user}
                />
              )}
              
              {/* Lifestyle */}
              {(user.smoking !== undefined || user.drinking !== undefined) && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Lifestyle</h3>
                  <div className="flex gap-4">
                    {user.smoking !== undefined && (
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        user.smoking ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {user.smoking ? '🚭 Smoking' : '✓ Non-Smoker'}
                      </span>
                    )}
                    {user.drinking !== undefined && (
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        user.drinking ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.drinking ? '🍷 Drinks' : '✓ Non-Drinker'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
