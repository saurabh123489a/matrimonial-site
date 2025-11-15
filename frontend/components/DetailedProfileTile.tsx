'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, interestApi, shortlistApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProfileAction } from '@/contexts/ProfileActionContext';
import LazyImage from './LazyImage';
import { getProfileUrl } from '@/lib/profileUtils';
import QuickMessageModal from './QuickMessageModal';

interface DetailedProfileTileProps {
  user: User;
}

export default function DetailedProfileTile({ user }: DetailedProfileTileProps) {
  const { showSuccess, showError } = useNotifications();
  const { setSelectedProfile } = useProfileAction();
  const [actionLoading, setActionLoading] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [hasInterest, setHasInterest] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const isAuthenticated = auth.isAuthenticated();

  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];
  const photoCount = user.photos?.length || 0;

  useEffect(() => {
    if (isAuthenticated) {
      checkShortlistStatus();
      checkInterestStatus();
    }
  }, [isAuthenticated]);

  const checkShortlistStatus = async () => {
    try {
      const response = await shortlistApi.check(user._id);
      if (response.status && response.data) {
        setIsShortlisted(response.data.isShortlisted || false);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const checkInterestStatus = async () => {
    try {
      const response = await interestApi.getOutgoing();
      if (response.status && response.data) {
        const hasSentInterest = response.data.some(
          (interest: any) => interest.toUserId?._id === user._id || interest.toUserId === user._id
        );
        setHasInterest(hasSentInterest);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleSendInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showError('Please login to send interest');
      return;
    }

    setActionLoading(true);
    try {
      const response = await interestApi.send(user._id);
      if (response.status) {
        setHasInterest(true);
        showSuccess('Interest sent successfully!');
      } else {
        showError(response.message || 'Failed to send interest');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuperInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showError('Please login to send super interest');
      return;
    }

    // For now, treat super interest same as regular interest
    // You can add a separate API endpoint for super interest later
    handleSendInterest(e);
  };

  const handleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showError('Please login to shortlist profiles');
      return;
    }

    setActionLoading(true);
    try {
      const response = isShortlisted 
        ? await shortlistApi.remove(user._id)
        : await shortlistApi.add(user._id);
      
      if (response.status) {
        setIsShortlisted(!isShortlisted);
        showSuccess(isShortlisted ? 'Removed from shortlist' : 'Added to shortlist');
      } else {
        showError(response.message || 'Failed to update shortlist');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update shortlist');
    } finally {
      setActionLoading(false);
    }
  };

  // Format height from inches to feet and inches
  const formatHeight = (heightInInches?: number) => {
    if (!heightInInches) return null;
    const feet = Math.floor(heightInInches / 12);
    const inches = heightInInches % 12;
    return `${feet}ft ${inches}in`;
  };

  // Check if profile was created recently (within 7 days)
  const isJustJoined = () => {
    if (!user.createdAt) return false;
    const createdDate = new Date(user.createdAt);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 7;
  };

  // Check if user was active today
  const isActiveToday = () => {
    if (!user.updatedAt) return false;
    const updatedDate = new Date(user.updatedAt);
    const today = new Date();
    return updatedDate.toDateString() === today.toDateString();
  };

  // Format profile created by
  const getProfileManagedBy = () => {
    const createdBy = user.profileCreatedBy || 'self';
    const mapping: Record<string, string> = {
      'self': 'Self',
      'family': 'Family',
      'parent': 'Parent',
      'relative': 'Relative',
      'friend': 'Friend',
    };
    return mapping[createdBy] || 'Self';
  };

  // Get community name (Gahoi ID or gotra)
  const getCommunity = () => {
    if (user.gahoiId) {
      return `Gahoi-${user.gahoiId}`;
    }
    if (user.gotra) {
      return user.gotra;
    }
    return 'Gahoi';
  };

  const handleCardClick = () => {
    // Set selected profile when card is clicked
    setSelectedProfile({
      userId: user._id,
      userName: user.name,
      userPhoto: primaryPhoto?.url,
    });
  };

  return (
    <div className="bg-white dark:bg-[#181b23] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative">
      <Link href={getProfileUrl(user)} className="block" onClick={handleCardClick}>
        {/* Photo Section with Overlays */}
        <div className="relative h-72 sm:h-80 md:h-96 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          {primaryPhoto ? (
            <>
              <LazyImage
                src={primaryPhoto.url}
                alt={user.name}
                className="w-full h-full object-cover"
                placeholder="👤"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
              <div className="text-8xl text-gray-300 dark:text-gray-600">👤</div>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
            {isActiveToday() && (
              <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Active Today
              </span>
            )}
            <div className="flex gap-2">
              {photoCount > 0 && (
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                  <span>📷</span>
                  <span>{photoCount}</span>
                </div>
              )}
              {isJustJoined() && (
                <div className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  Just Joined
                </div>
              )}
            </div>
          </div>

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
            {/* Name and Age */}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
              {user.name}{user.age && `, ${user.age}`}
            </h3>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm mb-2 sm:mb-3">
              {formatHeight(user.height) && (
                <div className="flex items-center gap-1">
                  <span className="text-white/90 text-xs sm:text-sm">📏</span>
                  <span className="drop-shadow-md truncate">{formatHeight(user.height)}</span>
                </div>
              )}
              {(user.city || user.town) && (
                <div className="flex items-center gap-1">
                  <span className="text-white/90 text-xs sm:text-sm">📍</span>
                  <span className="drop-shadow-md truncate">{user.city || user.town}</span>
                </div>
              )}
              {getCommunity() && (
                <div className="flex items-center gap-1">
                  <span className="text-white/90 text-xs sm:text-sm">👥</span>
                  <span className="drop-shadow-md truncate">{getCommunity()}</span>
                </div>
              )}
              {user.occupation && (
                <div className="flex items-center gap-1">
                  <span className="text-white/90 text-xs sm:text-sm">💼</span>
                  <span className="drop-shadow-md truncate">{user.occupation === 'Not planning to work' ? 'Not planning to work' : user.occupation}</span>
                </div>
              )}
              {user.annualIncome && (
                <div className="flex items-center gap-1">
                  <span className="text-white/90 text-xs sm:text-sm">💰</span>
                  <span className="drop-shadow-md truncate">{user.annualIncome}</span>
                </div>
              )}
              {user.education && (
                <div className="flex items-center gap-1">
                  <span className="text-white/90 text-xs sm:text-sm">🎓</span>
                  <span className="drop-shadow-md truncate">{user.education}</span>
                </div>
              )}
            </div>

            {/* Horoscope Match and Profile Management */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {user.horoscopeDetails && (
                <span className="bg-yellow-500/90 backdrop-blur-sm px-2 py-0.5 sm:py-1 rounded font-medium text-xs">
                  Horoscope Available
                </span>
              )}
              <span className="text-white/80 text-xs">
                Profile managed by {getProfileManagedBy()}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      {isAuthenticated && (
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-[#1f212a] border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-2">
            {/* Interest */}
            <button
              onClick={handleSendInterest}
              disabled={actionLoading || hasInterest}
              className="flex flex-col items-center gap-1 px-2 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              title={hasInterest ? 'Interest Already Sent' : 'Send Interest'}
            >
              <span className="text-xl sm:text-2xl">✉️</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Interest</span>
            </button>

            {/* Super Interest */}
            <button
              onClick={handleSuperInterest}
              disabled={actionLoading}
              className="flex flex-col items-center gap-1 px-2 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-pink-300 dark:border-pink-600 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 active:bg-pink-100 dark:active:bg-pink-900/30 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send Super Interest"
            >
              <span className="text-xl sm:text-2xl">💕</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Super</span>
            </button>

            {/* Shortlist */}
            <button
              onClick={handleShortlist}
              disabled={actionLoading}
              className={`flex flex-col items-center gap-1 px-2 py-2 sm:py-3 border rounded-lg transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                isShortlisted
                  ? 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
              }`}
              title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
            >
              <span className="text-xl sm:text-2xl">⭐</span>
              <span className="text-xs font-medium">{isShortlisted ? 'Saved' : 'Save'}</span>
            </button>

            {/* Chat */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMessageModal(true);
              }}
              className="flex flex-col items-center gap-1 px-2 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              title="Send Message"
            >
              <span className="text-xl sm:text-2xl">💬</span>
              <span className="text-xs font-medium">Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Message Modal */}
      {isAuthenticated && (
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

