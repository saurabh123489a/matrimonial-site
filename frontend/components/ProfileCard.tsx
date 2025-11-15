'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, interestApi, shortlistApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import LazyImage from './LazyImage';
import { getProfileUrl } from '@/lib/profileUtils';
import { useNotifications } from '@/contexts/NotificationContext';
import QuickMessageModal from './QuickMessageModal';

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden profile-card border border-gray-200">
      {/* Photo Section */}
      <div className="relative h-56 sm:h-72 bg-gradient-to-br from-pink-100 to-red-100">
        {primaryPhoto ? (
          <>
            <LazyImage
              src={primaryPhoto.url}
              alt={user.name}
              className="w-full h-full object-cover"
              placeholder="👤"
            />
            <div className="absolute top-2 right-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
              {user.isProfileComplete ? '✓ Verified' : 'New'}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl text-gray-300 bg-gray-100">
            👤
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          {user.photos && user.photos.length > 1 && (
            <span className="text-white text-xs font-medium">
              📷 {user.photos.length} Photos
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5">
        {/* Name and Age */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
            {user.age && (
              <p className="text-gray-600 text-sm">
                {user.age} Years {user.gender === 'male' ? '• Male' : user.gender === 'female' ? '• Female' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Key Details */}
        <div className="space-y-2 mb-4 text-sm">
          {user.education && (
            <div className="flex items-center text-gray-700">
              <span className="text-pink-600 mr-2">🎓</span>
              <span className="truncate">{user.education}</span>
            </div>
          )}
          {user.occupation && (
            <div className="flex items-center text-gray-700">
              <span className="text-pink-600 mr-2">💼</span>
              <span className="truncate">{user.occupation}</span>
            </div>
          )}
          {(user.city || user.state) && (
            <div className="flex items-center text-gray-700">
              <span className="text-pink-600 mr-2">📍</span>
              <span className="truncate">
                {user.city}{user.state && `, ${user.state}`}{user.country && `, ${user.country}`}
              </span>
            </div>
          )}
        </div>

        {/* Bio Preview */}
        {user.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Link
              href={getProfileUrl(user)}
              className="flex-1 text-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all text-xs sm:text-sm shadow-sm"
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
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all text-xs sm:text-sm shadow-sm"
                title="Send Message"
              >
                💬
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSendInterest}
              disabled={actionLoading || !isAuthenticated}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-pink-50 text-pink-600 font-semibold rounded-md hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm border border-pink-200"
              title={isAuthenticated ? 'Send Interest' : 'Login to send interest'}
            >
              {actionLoading ? '...' : '💝 Send Interest'}
            </button>
            <button
              onClick={handleShortlist}
              disabled={actionLoading || !isAuthenticated}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm ${
                isShortlisted
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
