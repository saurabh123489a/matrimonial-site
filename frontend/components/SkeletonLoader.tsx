'use client';

interface SkeletonLoaderProps {
  type?: 'profile-card' | 'profile-list' | 'text' | 'image' | 'button';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type = 'text', count = 1, className = '' }: SkeletonLoaderProps) {
  if (type === 'profile-card') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="h-64 sm:h-80 bg-gray-200 animate-pulse rounded-t-lg"></div>
        <div className="p-4 sm:p-5 space-y-3">
          <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'profile-list') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonLoader key={i} type="profile-card" />
        ))}
      </>
    );
  }

  if (type === 'image') {
    return (
      <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
    );
  }

  if (type === 'button') {
    return (
      <div className={`h-10 bg-gray-200 animate-pulse rounded ${className}`} />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 animate-pulse rounded ${className}`}
          style={{ width: i === count - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </>
  );
}

