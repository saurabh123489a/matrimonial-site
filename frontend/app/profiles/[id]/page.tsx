'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userApi, interestApi, shortlistApi, reportApi, User } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('inappropriate-content');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const [profileResponse, shortlistResponse, myProfileResponse] = await Promise.all([
          userApi.getById(id),
          shortlistApi.check(id).catch(() => ({ status: true, data: { isShortlisted: false } })),
          userApi.getMe().catch(() => ({ status: false, data: null }))
        ]);
        
        if (profileResponse.status) {
          setUser(profileResponse.data);
        }
        
        if (shortlistResponse.status) {
          setIsShortlisted(shortlistResponse.data.isShortlisted);
        }

        if (myProfileResponse.status && myProfileResponse.data) {
          setCurrentUser(myProfileResponse.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }
  }, [id, router]);

  const handleSendInterest = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await interestApi.send(id);
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

  const handleReport = async () => {
    if (!user) return;
    setReportLoading(true);
    try {
      const response = await reportApi.reportProfile({
        reportedUserId: id,
        reason: reportReason as any,
        description: reportDescription || undefined,
      });
      if (response.status) {
        alert('Profile reported successfully. Admin will review it.');
        setShowReportModal(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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

  // Sort photos to ensure primary is first
  const photos = (user.photos || []).sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return (a.order || 0) - (b.order || 0);
  });
  const selectedPhoto = photos[selectedPhotoIndex] || photos[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
                  {user.isProfileComplete && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                      ✓ Verified
                    </div>
                  )}
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
                  {/* Report Button - Only show if user has community position */}
                  {currentUser?.communityPosition && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full px-6 py-3 bg-red-50 border-2 border-red-300 text-red-700 font-semibold rounded-md hover:bg-red-100 transition-all shadow-md"
                    >
                      🚩 Report Profile
                    </button>
                  )}
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
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('profile.religion')}</h3>
                  <p className="text-gray-900 font-medium">{user.religion || 'Not specified'}</p>
                </div>
                {user.caste && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Caste</h3>
                    <p className="text-gray-900 font-medium">{user.caste}</p>
                  </div>
                )}
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
                    <p className="text-gray-900 font-medium">{user.height} cm</p>
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

              {/* Report Modal */}
              {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Profile</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        >
                          <option value="inappropriate-content">Inappropriate Content</option>
                          <option value="fake-profile">Fake Profile</option>
                          <option value="misleading-information">Misleading Information</option>
                          <option value="harassment">Harassment</option>
                          <option value="spam">Spam</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                        <textarea
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          rows={3}
                          maxLength={500}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Provide additional details about the issue..."
                        />
                        <p className="text-xs text-gray-500 mt-1">{reportDescription.length}/500</p>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            setShowReportModal(false);
                            setReportDescription('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReport}
                          disabled={reportLoading}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          {reportLoading ? 'Submitting...' : 'Submit Report'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
