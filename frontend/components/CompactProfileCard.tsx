'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/api';
import { auth } from '@/lib/auth';
import LazyImage from './LazyImage';
import { getProfileUrl, getProfileImageUrl } from '@/lib/profileUtils';
import QuickMessageModal from './QuickMessageModal';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Badge } from './ui';

interface CompactProfileCardProps {
  user: User;
  showOnlineStatus?: boolean;
}

export default function CompactProfileCard({ user, showOnlineStatus = false }: CompactProfileCardProps) {
  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];
  const profileImageUrl = getProfileImageUrl(user);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const isAuthenticated = auth.isAuthenticated();
  const { ref: scrollRef, isVisible } = useScrollAnimation({ threshold: 0.1 });
  
  // Generate a random background color for variety (like in the image)
  const bgColors = [
    'bg-gray-200',
    'bg-gray-300',
    'bg-amber-100',
    'bg-teal-100',
    'bg-pink-100',
  ];
  const bgColor = bgColors[user._id.charCodeAt(0) % bgColors.length];
  
  return (
    <div 
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all ${isVisible ? 'scroll-animate-fade-up animate' : 'scroll-animate-fade-up'}`}
    >
      <Link href={getProfileUrl(user)} className="block">
        {/* Photo Section */}
        <div className={`relative h-64 sm:h-80 ${bgColor}`}>
          <LazyImage
            src={profileImageUrl}
            alt={user.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            placeholder="👤"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {/* Age badge */}
          {user.age && (
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-gray-200/50">
              {user.age} {user.age === 1 ? 'Year' : 'Years'}
            </div>
          )}
        </div>

        {/* Info Section - Improved Layout */}
        <div className="p-4 sm:p-5">
          {/* Name with Online Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              {user.name}
            </h3>
            {showOnlineStatus && (
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse flex-shrink-0 mt-1 shadow-lg shadow-green-500/50" title="Online"></span>
            )}
          </div>

          {/* Key Info Grid */}
          <div className="space-y-2">
            {/* Occupation */}
            {user.occupation && (
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <span className="text-pink-600 flex-shrink-0 text-sm">💼</span>
                <span className="truncate font-medium" title={user.occupation}>{user.occupation}</span>
              </div>
            )}

            {/* Location */}
            {(user.city || user.state) && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-pink-600 flex-shrink-0 text-sm">📍</span>
                <span className="truncate font-medium" title={`${user.city || ''}${user.state ? `, ${user.state}` : ''}`}>
                  {user.city}{user.state && `, ${user.state}`}
                </span>
              </div>
            )}

            {/* Education - if available */}
            {user.education && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-pink-600 flex-shrink-0 text-sm">🎓</span>
                <span className="truncate font-medium" title={user.education}>{user.education}</span>
              </div>
            )}
          </div>

          {/* Interests/Hobbies - Show first 2 */}
          {user.hobbies && user.hobbies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {user.hobbies.slice(0, 2).map((hobby, index) => (
                <Badge key={index} variant="accent" size="sm">
                  {hobby}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons - Outside Link - Improved Layout */}
      {isAuthenticated && (
        <div className="p-3 sm:p-4 pt-0 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMessageModal(true);
            }}
            className="w-full px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 btn-primary btn-scale transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[44px]"
            title="Send Message"
            aria-label="Send Message"
          >
            💬 <span className="hidden sm:inline">Message</span><span className="sm:hidden">Msg</span>
          </button>
        </div>
      )}

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

