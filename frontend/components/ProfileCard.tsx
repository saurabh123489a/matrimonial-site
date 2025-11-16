'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, interestApi, shortlistApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import LazyImage from './LazyImage';
import { getProfileUrl } from '@/lib/profileUtils';
import { useNotifications } from '@/contexts/NotificationContext';
import QuickMessageModal from './QuickMessageModal';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];
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
      className={`bg-white rounded-2xl shadow-lg overflow-hidden profile-card card-lift card-image-zoom border border-gray-200 group ${isVisible ? 'scroll-animate-fade-up animate' : 'scroll-animate-fade-up'}`}
    >
      {/* Photo Section */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-pink-100 to-red-100 overflow-hidden">
        {primaryPhoto ? (
          <>
            <LazyImage
              src={primaryPhoto.url}
              alt={user.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              placeholder="👤"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className={`absolute top-3 right-3 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full font-bold shadow-lg z-10 transition-all duration-300 ${
              user.isProfileComplete 
                ? 'bg-green-500/90 text-white' 
                : 'bg-blue-500/90 text-white'
            }`}>
              {user.isProfileComplete ? '✓ Verified' : '✨ New'}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl text-gray-300 bg-gray-100">
            👤
          </div>
        )}
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
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-pink-600 transition-colors duration-300">{user.name}</h3>
          <div className="flex items-center gap-3">
            {user.gender && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-gray-700 text-sm font-medium capitalize">
                {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '👤'}
                <span>{user.gender}</span>
              </span>
            )}
            {user.gahoiId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-semibold">
                ID: {user.gahoiId}
              </span>
            )}
          </div>
        </div>

        {/* Key Details Grid - Improved Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {user.education && (
            <div className="flex items-center gap-2.5 text-sm bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl px-3.5 py-2.5 hover:from-pink-50 hover:to-pink-50/50 transition-all duration-300 border border-gray-100 hover:border-pink-200">
              <span className="text-pink-600 text-lg flex-shrink-0">🎓</span>
              <span className="text-gray-700 truncate font-medium" title={user.education}>{user.education}</span>
            </div>
          )}
          {user.occupation && (
            <div className="flex items-center gap-2.5 text-sm bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl px-3.5 py-2.5 hover:from-pink-50 hover:to-pink-50/50 transition-all duration-300 border border-gray-100 hover:border-pink-200">
              <span className="text-pink-600 text-lg flex-shrink-0">💼</span>
              <span className="text-gray-700 truncate font-medium" title={user.occupation}>{user.occupation}</span>
            </div>
          )}
          {(user.city || user.state) && (
            <div className={`flex items-center gap-2.5 text-sm bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl px-3.5 py-2.5 hover:from-pink-50 hover:to-pink-50/50 transition-all duration-300 border border-gray-100 hover:border-pink-200 ${user.education && user.occupation ? 'sm:col-span-2' : ''}`}>
              <span className="text-pink-600 text-lg flex-shrink-0">📍</span>
              <span className="text-gray-700 truncate font-medium" title={`${user.city || ''}${user.state ? `, ${user.state}` : ''}${user.country ? `, ${user.country}` : ''}`}>
                {user.city}{user.state && `, ${user.state}`}{user.country && `, ${user.country}`}
              </span>
            </div>
          )}
        </div>

        {/* Bio Preview */}
        {user.bio && (
          <div className="mb-5 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
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
              className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-pink-600 via-pink-500 to-red-600 text-white font-bold rounded-xl hover:from-pink-700 hover:via-pink-600 hover:to-red-700 btn-primary btn-scale transition-all text-sm shadow-lg hover:shadow-xl touch-manipulation"
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
                className="px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 btn-secondary btn-scale transition-all text-sm shadow-lg hover:shadow-xl touch-manipulation min-w-[56px] flex items-center justify-center"
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 font-bold rounded-xl hover:from-pink-100 hover:to-pink-200 disabled:opacity-50 disabled:cursor-not-allowed btn-secondary btn-scale transition-all text-sm border-2 border-pink-200 hover:border-pink-300 shadow-sm hover:shadow-md"
              title={isAuthenticated ? 'Send Interest' : 'Login to send interest'}
            >
              {actionLoading ? (
                <span className="inline-block animate-spin text-lg">⏳</span>
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
              className={`px-4 py-3 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed btn-scale transition-all text-xl border-2 shadow-sm hover:shadow-md ${
                isShortlisted
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-500 hover:from-yellow-500 hover:to-yellow-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
              title={isAuthenticated ? (isShortlisted ? 'Remove from shortlist' : 'Add to shortlist') : 'Login to shortlist'}
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
          userPhoto={primaryPhoto?.url}
        />
      )}
    </div>
  );
}
