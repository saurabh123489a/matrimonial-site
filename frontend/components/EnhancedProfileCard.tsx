'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, horoscopeApi, HoroscopeMatch } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import { auth } from '@/lib/auth';
import ProfileBadges from './ProfileBadges';
import LazyImage from './LazyImage';
import { getProfileUrl } from '@/lib/profileUtils';
import { sortPhotos } from '@/lib/utils/photoUtils';
import QuickMessageModal from './QuickMessageModal';

interface EnhancedProfileCardProps {
  user: User;
  showActions?: boolean;
}

export default function EnhancedProfileCard({ user, showActions = true }: EnhancedProfileCardProps) {
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const [showHoroscopeModal, setShowHoroscopeModal] = useState(false);
  const [horoscopeMatch, setHoroscopeMatch] = useState<HoroscopeMatch | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  // Always show first photo (which should be primary after sorting)
  // Sort photos to ensure primary is first
  const sortedPhotos = user.photos ? sortPhotos(user.photos) : [];
  const primaryPhoto = sortedPhotos[0];
  const photoCount = sortedPhotos.length;

  const handleHoroscopeMatch = async () => {
    if (!auth.isAuthenticated()) {
      showError(t('horoscope.loginRequired'));
      return;
    }

    setLoadingMatch(true);
    setMatchError('');
    setHoroscopeMatch(null);
    setShowHoroscopeModal(true);

    try {
      const response = await horoscopeApi.getMatch(user._id);
      if (response.status && response.data) {
        setHoroscopeMatch(response.data);
        // Clear any previous errors
        setMatchError('');
      } else {
        // API returned error status
        const errorMessage = response.message || t('horoscope.failed');
        setMatchError(errorMessage);
        console.error('Horoscope API error:', response);
      }
    } catch (err: any) {
      console.error('Horoscope match error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('horoscope.failed');
      setMatchError(errorMessage);
      // If it's a network error, provide more helpful message
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setMatchError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoadingMatch(false);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden profile-card border border-gray-100 group"
      onClick={(e) => {
        // Prevent any accidental navigation when clicking on the card
        // Only allow navigation through explicit buttons
        e.stopPropagation();
      }}
    >
      {/* Photo Section with Overlay */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-pink-50 to-purple-50">
        {primaryPhoto ? (
          <>
            <LazyImage
              src={primaryPhoto.url}
              alt={user.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              placeholder="👤"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
            <div className="text-8xl text-gray-300">👤</div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <ProfileBadges user={user} showOnlineStatus={false} showLastSeen={false} />
        </div>

        {/* Photo Count & Age */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          {photoCount > 1 && (
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
              📷 {photoCount} Photos
            </span>
          )}
          {user.age && (
            <span className="bg-white/90 text-gray-900 text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              {user.age} Years
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5">
        {/* Name & Location Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{user.name}</h3>
          <div className="flex items-center text-gray-600 text-sm">
            {user.city && (
              <span className="flex items-center">
                <span className="mr-1">📍</span>
                {user.city}{user.state && `, ${user.state}`}
              </span>
            )}
          </div>
        </div>

        {/* Key Details Grid - Minimal Data Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Gender */}
          {user.gender && (
            <div className="flex items-start gap-2">
              <span className="text-pink-600 text-lg">{user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '👤'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-semibold">Gender</p>
                <p className="text-sm text-gray-800 font-medium capitalize">{user.gender}</p>
              </div>
            </div>
          )}
          {/* Age */}
          {user.age && (
            <div className="flex items-start gap-2">
              <span className="text-pink-600 text-lg">🎂</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-semibold">Age</p>
                <p className="text-sm text-gray-800 font-medium">{user.age} Years</p>
              </div>
            </div>
          )}
          {/* Height */}
          {user.height && (
            <div className="flex items-start gap-2">
              <span className="text-pink-600 text-lg">📏</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-semibold">Height</p>
                <p className="text-sm text-gray-800 font-medium">{user.height}" ({Math.round(user.height * 2.54)} cm)</p>
              </div>
            </div>
          )}
          {/* Occupation */}
          {user.occupation && (
            <div className="flex items-start gap-2">
              <span className="text-pink-600 text-lg">💼</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-semibold">Occupation</p>
                <p className="text-sm text-gray-800 font-medium truncate">{user.occupation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bio Preview - Only show if available (not in minimal data) */}
        {user.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed border-t border-gray-100 pt-3">
            {user.bio}
          </p>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-1.5 sm:gap-2 pt-3 border-t border-gray-100 flex-wrap">
            <Link
              href={getProfileUrl(user)}
              onClick={(e) => {
                if (!auth.isAuthenticated()) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className="flex-1 text-center px-2 sm:px-3 py-2 bg-gradient-to-r from-pink-600 via-red-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]"
            >
              View Profile
            </Link>
            {auth.isAuthenticated() && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMessageModal(true);
                }}
                className="flex-1 text-center px-2 sm:px-3 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]"
              >
                💬 Message
              </button>
            )}
            <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-pink-50 text-pink-600 font-bold rounded-lg hover:bg-pink-100 transition-all text-base sm:text-lg border border-pink-200">
              💝
            </button>
            <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-all text-base sm:text-lg border border-gray-200">
              ⭐
            </button>
            {/* Horoscope button - Only show if horoscope data is available (not in minimal data) */}
            {user.horoscopeDetails && (user.horoscopeDetails?.rashi || user.horoscopeDetails?.nakshatra) && (
              <button
                onClick={handleHoroscopeMatch}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-50 text-purple-600 font-bold rounded-lg hover:bg-purple-100 transition-all text-base sm:text-lg border border-purple-200"
                title={t('horoscope.buttonTitle')}
              >
                🔮
              </button>
            )}
          </div>
        )}
      </div>

      {/* Horoscope Match Modal */}
      {showHoroscopeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold">🔮 {t('horoscope.title')}</h2>
                <button
                  onClick={() => {
                    setShowHoroscopeModal(false);
                    setHoroscopeMatch(null);
                    setMatchError('');
                  }}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {loadingMatch ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-purple-600 border-t-transparent"></div>
                  <p className="mt-4 text-sm sm:text-base text-gray-600">{t('horoscope.calculating')}</p>
                </div>
              ) : matchError ? (
                <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 sm:px-6 py-4 sm:py-5 rounded-lg text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h3 className="font-bold mb-1">Error</h3>
                      <p>{matchError}</p>
                      {matchError.includes('insufficient') && (
                        <p className="mt-2 text-sm text-red-700">
                          Please ensure both you and {user.name} have horoscope details (Rashi or Nakshatra) in your profiles.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : horoscopeMatch ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Insufficient Data Warning */}
                  {horoscopeMatch.status === 'insufficient_data' ? (
                    <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-800 px-4 sm:px-6 py-4 sm:py-5 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">ℹ️</span>
                        <div>
                          <h3 className="font-bold mb-1">Insufficient Horoscope Data</h3>
                          <p>{horoscopeMatch.message || t('horoscope.insufficientInfo')}</p>
                          <p className="mt-2 text-sm text-yellow-700">
                            Both you and {user.name} need to have horoscope details (Rashi or Nakshatra) in your profiles to calculate matching.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Overall Score */}
                      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-lg border-2 border-purple-200">
                        <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">
                          {horoscopeMatch.totalScore}/{horoscopeMatch.maxScore}
                        </div>
                        <div className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
                          {horoscopeMatch.percentage}% Match
                        </div>
                        <div className={`text-base sm:text-lg font-medium ${
                          horoscopeMatch.status === 'excellent' ? 'text-green-600' :
                          horoscopeMatch.status === 'good' ? 'text-blue-600' :
                          horoscopeMatch.status === 'moderate' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {t(`horoscope.status.${horoscopeMatch.status}`)}
                        </div>
                      </div>

                  {/* Doshas Warning */}
                  {horoscopeMatch.doshas && horoscopeMatch.doshas.length > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                      <h3 className="font-bold text-red-800 mb-2">⚠️ {t('horoscope.doshas.title')}</h3>
                      <ul className="list-disc list-inside text-red-700 space-y-1">
                        {horoscopeMatch.doshas.map((dosha, idx) => (
                          <li key={idx}>{dosha}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detailed Breakdown - Only show if we have details */}
                  {horoscopeMatch.details && horoscopeMatch.details.length > 0 && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('horoscope.breakdown.title')}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {horoscopeMatch.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 ${
                            detail.matched
                              ? detail.score === detail.max
                                ? 'border-green-300 bg-green-50'
                                : 'border-blue-300 bg-blue-50'
                              : 'border-red-300 bg-red-50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-900">{detail.name}</span>
                            <span className={`font-bold ${
                              detail.matched
                                ? detail.score === detail.max
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                                : 'text-red-600'
                            }`}>
                              {detail.score}/{detail.max}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{detail.detail}</p>
                        </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Horoscope Info */}
                  {horoscopeMatch.horoscope1 && horoscopeMatch.horoscope2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t('horoscope.info.yourHoroscope')}</h4>
                        {horoscopeMatch.horoscope1.rashi && (
                          <p className="text-sm text-gray-700">{t('horoscope.info.rashi')}: <span className="font-medium">{horoscopeMatch.horoscope1.rashi}</span></p>
                        )}
                        {horoscopeMatch.horoscope1.nakshatra && (
                          <p className="text-sm text-gray-700">{t('horoscope.info.nakshatra')}: <span className="font-medium">{horoscopeMatch.horoscope1.nakshatra}</span></p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t('horoscope.info.theirHoroscope', { name: user.name })}</h4>
                        {horoscopeMatch.horoscope2.rashi && (
                          <p className="text-sm text-gray-700">{t('horoscope.info.rashi')}: <span className="font-medium">{horoscopeMatch.horoscope2.rashi}</span></p>
                        )}
                        {horoscopeMatch.horoscope2.nakshatra && (
                          <p className="text-sm text-gray-700">{t('horoscope.info.nakshatra')}: <span className="font-medium">{horoscopeMatch.horoscope2.nakshatra}</span></p>
                        )}
                      </div>
                    </div>
                  )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  {t('horoscope.insufficientData')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Message Modal */}
      {auth.isAuthenticated() && (
        <QuickMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          userId={user._id}
          userName={user.name}
          userPhoto={primaryPhoto?.url}
        />
      )}
    </div>
  );
}

