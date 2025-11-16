'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { User, interestApi, shortlistApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import LazyImage from './LazyImage';
import { getProfileUrl, getProfileImageUrl } from '@/lib/profileUtils';
import { useNotifications } from '@/contexts/NotificationContext';
import QuickMessageModal from './QuickMessageModal';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import LoadingSpinner from './LoadingSpinner';
import { Badge } from './ui';

interface ProfileCardProps {
  user: User;
}

function ProfileCard({ user }: ProfileCardProps) {
  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];
  const profileImageUrl = getProfileImageUrl(user);
  const { showSuccess, showError } = useNotifications();
  const [actionLoading, setActionLoading] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const { ref: scrollRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
    if (auth.isAuthenticated()) {
      checkShortlistStatus();
    }
  }, []);

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

  const handleSendInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth.isAuthenticated()) {
      showError('Please login to send interest');
      return;
    }

    setActionLoading(true);
    try {
      const response = await interestApi.send(user._id);
      if (response.status) {
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

  const handleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth.isAuthenticated()) {
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
  
  return (
    <div 
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[var(--border-light)] ${isVisible ? 'scroll-animate-fade-up animate' : 'scroll-animate-fade-up'}`}
    >
      {/* Photo Section */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-[#f5e6b3] to-[#D4AF37]/20 overflow-hidden">
        <LazyImage
          src={profileImageUrl}
          alt={`${user.name}'s profile photo`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          placeholder="👤"
          onError={() => {
            // Fallback handled by LazyImage component
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className={`absolute top-3 right-3 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full font-bold shadow-lg z-10 transition-all duration-300 ${
          user.isProfileComplete 
            ? 'bg-green-500/90 text-white' 
            : 'bg-blue-500/90 text-white'
        }`}>
          {user.isProfileComplete ? '✓ Verified' : '✨ New'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
          <div className="flex items-center justify-between">
            {user.photos && user.photos.length > 1 && (
              <span className="text-white text-xs font-semibold flex items-center gap-1">
                <span>📷</span>
                <span>{user.photos.length} Photos</span>
              </span>
            )}
            {user.age && (
              <span className="text-white text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {user.age} Years
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 sm:p-6">
        {/* Name and Gender */}
        <div className="mb-5">
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 line-clamp-1 group-hover:text-[#800020] transition-colors">{user.name}</h3>
          <div className="flex items-center gap-3">
            {user.gender && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-tertiary)] rounded-full text-secondary text-sm font-medium capitalize border border-[var(--border-light)]">
                {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '👤'}
                <span>{user.gender}</span>
              </span>
            )}
            {user.gahoiId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#D4AF37]/10 text-[#800020] rounded-full text-xs font-semibold border border-[#D4AF37]/20">
                ID: {user.gahoiId}
              </span>
            )}
          </div>
        </div>

        {/* Key Details Grid - Improved Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {user.education && (
            <div className="flex items-center gap-2.5 text-sm bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 border border-[var(--border-light)]">
              <span className="text-[#800020] text-base">🎓</span>
              <span className="text-secondary truncate font-medium" title={user.education}>{user.education}</span>
            </div>
          )}
          {user.occupation && (
            <div className="flex items-center gap-2.5 text-sm bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 border border-[var(--border-light)]">
              <span className="text-[#800020] text-base">💼</span>
              <span className="text-secondary truncate font-medium" title={user.occupation}>{user.occupation}</span>
            </div>
          )}
          {(user.city || user.state) && (
            <div className={`flex items-center gap-2.5 text-sm bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 border border-[var(--border-light)] ${(user.city || user.state) && !user.education && !user.occupation ? 'sm:col-span-2' : ''}`}>
              <span className="text-[#800020] text-base">📍</span>
              <span className="text-secondary truncate font-medium" title={`${user.city || ''}${user.state ? `, ${user.state}` : ''}${user.country ? `, ${user.country}` : ''}`}>
                {user.city}{user.state && `, ${user.state}`}{user.country && `, ${user.country}`}
              </span>
            </div>
          )}
          {user.diet && (
            <div className="flex items-center gap-2.5 text-sm bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 border border-[var(--border-light)]">
              <span className="text-[#800020] text-base">🥗</span>
              <span className="text-secondary truncate font-medium capitalize" title={user.diet}>{user.diet === 'non-vegetarian' ? 'Non-Veg' : user.diet}</span>
            </div>
          )}
        </div>

        {/* Interests/Hobbies - Show first 2 */}
        {user.hobbies && user.hobbies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {user.hobbies.slice(0, 2).map((hobby, index) => (
              <Badge key={index} variant="accent" size="md">
                {hobby}
              </Badge>
            ))}
          </div>
        )}

        {/* Bio Preview */}
        {user.bio && (
          <div className="mb-5 border-t border-gray-100 pt-4">
            <p className="text-sm text-secondary line-clamp-2 leading-relaxed">
              {user.bio}
            </p>
          </div>
        )}

        {/* Action Buttons - Improved Layout */}
        <div className="space-y-3 pt-2">
          {/* Primary Actions Row */}
          <div className="flex gap-2.5">
            <Link
              href={getProfileUrl(user)}
              className="flex-1 text-center px-4 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-[var(--primary-hover)] transition-all shadow-md hover:shadow-lg"
            >
              View Profile
            </Link>
            {isAuthenticated && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMessageModal(true);
                }}
                className="px-4 py-3 bg-[var(--accent)] text-[var(--text-primary)] font-bold rounded-lg hover:bg-[var(--accent-hover)] transition-all text-sm shadow-md hover:shadow-lg touch-manipulation min-w-[56px] flex items-center justify-center"
                title="Send Message"
                aria-label="Send Message"
              >
                💬
              </button>
            )}
          </div>
          {/* Secondary Actions Row */}
          <div className="flex gap-2.5">
            <button
              onClick={handleSendInterest}
              disabled={actionLoading || !isAuthenticated}
              className="flex-1 px-4 py-3 bg-[var(--accent-light)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[#D4AF37]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-[var(--accent)]/20"
              title={isAuthenticated ? 'Send Interest' : 'Login to send interest'}
              aria-label={isAuthenticated ? 'Send Interest' : 'Login to send interest'}
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" className="inline-block" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">💝</span>
                  <span className="hidden sm:inline">Send Interest</span>
                  <span className="sm:hidden">Interest</span>
                </span>
              )}
            </button>
            <button
              onClick={handleShortlist}
              disabled={actionLoading || !isAuthenticated}
              className={`px-4 py-3 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xl border-2 shadow-sm hover:shadow-md ${
                isShortlisted
                  ? 'bg-[var(--accent)] text-[var(--text-primary)] border-[var(--accent)] hover:bg-[var(--accent-hover)]'
                  : 'bg-[var(--bg-tertiary)] text-secondary border-[var(--border)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-dark)]'
              }`}
              title={isAuthenticated ? (isShortlisted ? 'Remove from shortlist' : 'Add to shortlist') : 'Login to shortlist'}
              aria-label={isAuthenticated ? (isShortlisted ? 'Remove from shortlist' : 'Add to shortlist') : 'Login to shortlist'}
            >
              ⭐
            </button>
          </div>
        </div>
      </div>

      {/* Quick Message Modal */}
      {isAuthenticated && (
        <QuickMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          userId={user._id}
          userName={user.name}
          userPhoto={profileImageUrl}
        />
      )}
    </div>
  );
}

export default memo(ProfileCard);
