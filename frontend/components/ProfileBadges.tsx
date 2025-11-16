'use client';

import { useState, useEffect } from 'react';
import { badgeApi, UserBadge, Badge } from '@/lib/api';

interface ProfileBadgesProps {
  user: any;
  showOnlineStatus?: boolean;
  showLastSeen?: boolean;
  showUserBadges?: boolean; // Show badges from backend
  className?: string;
}

export default function ProfileBadges({ 
  user, 
  showOnlineStatus = true, 
  showLastSeen = true,
  showUserBadges = true,
  className = '' 
}: ProfileBadgesProps) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?._id && showUserBadges) {
      loadUserBadges();
    }
  }, [user?._id, showUserBadges]);

  const loadUserBadges = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await badgeApi.getUserBadges(user._id);
      if (response.status && response.data) {
        // Filter only visible badges
        const visibleBadges = response.data.filter((ub: UserBadge) => ub.isVisible);
        setUserBadges(visibleBadges);
      }
    } catch (error) {
      // Silently fail - badges are optional
      console.error('Failed to load user badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isVerified = user.isVerified || user.emailVerified || user.phoneVerified;
  const isOnline = user.isOnline || false;
  const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;

  const getLastSeenText = () => {
    if (!lastSeen) return null;
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return lastSeen.toLocaleDateString();
  };

  // Extract badge data from UserBadge
  const getBadgeData = (userBadge: UserBadge): Badge | null => {
    if (typeof userBadge.badgeId === 'object' && userBadge.badgeId !== null) {
      return userBadge.badgeId as Badge;
    }
    return null;
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Verification Badge */}
      {isVerified && (
        <span 
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100"
          title="Verified Profile"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      )}

      {/* Online Status */}
      {showOnlineStatus && (
        <span 
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
            isOnline 
              ? 'bg-green-100' 
              : 'bg-gray-100'
          }`}
          title={isOnline ? 'Currently Online' : 'Offline'}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}

      {/* User Badges from Backend */}
      {showUserBadges && userBadges.length > 0 && (
        <>
          {userBadges.map((userBadge) => {
            const badge = getBadgeData(userBadge);
            if (!badge) return null;

            return (
              <span
                key={userBadge._id}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full transition-all hover:scale-105 cursor-help"
                style={{
                  backgroundColor: `${badge.color}20`,
                  color: badge.color,
                  border: `1px solid ${badge.color}40`,
                }}
                title={badge.description || badge.displayName}
              >
                <span className="text-sm">{badge.icon}</span>
                <span>{badge.displayName}</span>
              </span>
            );
          })}
        </>
      )}

      {/* Last Seen */}
      {showLastSeen && !isOnline && lastSeen && (
        <span className="text-xs text-gray-500">
          Last seen {getLastSeenText()}
        </span>
      )}
    </div>
  );
}

