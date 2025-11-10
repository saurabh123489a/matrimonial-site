'use client';

interface ProfileBadgesProps {
  user: any;
  showOnlineStatus?: boolean;
  showLastSeen?: boolean;
  className?: string;
}

export default function ProfileBadges({ 
  user, 
  showOnlineStatus = true, 
  showLastSeen = true,
  className = '' 
}: ProfileBadgesProps) {
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

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Verification Badge */}
      {isVerified && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      )}

      {/* Online Status */}
      {showOnlineStatus && (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
          isOnline 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}

      {/* Last Seen */}
      {showLastSeen && !isOnline && lastSeen && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Last seen {getLastSeenText()}
        </span>
      )}
    </div>
  );
}

