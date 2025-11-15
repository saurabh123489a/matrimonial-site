'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/api';
import { auth } from '@/lib/auth';
import LazyImage from './LazyImage';
import { getProfileUrl } from '@/lib/profileUtils';
import QuickMessageModal from './QuickMessageModal';

interface CompactProfileCardProps {
  user: User;
  showOnlineStatus?: boolean;
}

export default function CompactProfileCard({ user, showOnlineStatus = false }: CompactProfileCardProps) {
  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];
  const [showMessageModal, setShowMessageModal] = useState(false);
  const isAuthenticated = auth.isAuthenticated();
  
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
    <div className="bg-white dark:bg-[#181b23] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group relative">
      <Link href={getProfileUrl(user)} className="block">
        {/* Photo Section */}
        <div className={`relative h-56 ${bgColor} dark:bg-gray-800 overflow-hidden`}>
          {primaryPhoto ? (
            <>
              <LazyImage
                src={primaryPhoto.url}
                alt={user.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                placeholder="👤"
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
              👤
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-3 dark:bg-[#181b23] space-y-1">
          {/* Name and Age with Online Status */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-pink-100 truncate flex-1">
              {user.name}
            </h3>
            {user.age && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {showOnlineStatus && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {user.age}
                </span>
              </div>
            )}
          </div>

          {/* Occupation */}
          {user.occupation && (
            <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">
              {user.occupation}
            </p>
          )}

          {/* Location */}
          {(user.city || user.state) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.city}{user.state && `, ${user.state}`}
            </p>
          )}
        </div>
      </Link>

      {/* Action Buttons - Outside Link */}
      {isAuthenticated && (
        <div className="p-2 sm:p-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMessageModal(true);
            }}
            className="w-full px-3 py-2 sm:py-1.5 bg-blue-600 text-white text-xs sm:text-xs font-semibold rounded-md hover:bg-blue-700 active:bg-blue-800 transition-all touch-manipulation min-h-[44px]"
            title="Send Message"
            aria-label="Send Message"
          >
            💬 Message
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
          userPhoto={primaryPhoto?.url}
        />
      )}
    </div>
  );
}

