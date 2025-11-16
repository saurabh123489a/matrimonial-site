'use client';

import { useRef, useEffect, useState } from 'react';
import ProfileCard from './ProfileCard';
import CompactProfileCard from './CompactProfileCard';
import { User } from '@/lib/api';

interface LazyProfileCardProps {
  user: User;
  viewMode?: 'compact' | 'detailed';
  showOnlineStatus?: boolean;
}

export default function LazyProfileCard({ 
  user, 
  viewMode = 'detailed',
  showOnlineStatus = false 
}: LazyProfileCardProps) {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Disconnect observer once card is in view
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '200px', // Start loading 200px before card enters viewport
      }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={cardRef} className="min-h-[400px]">
      {isInView ? (
        viewMode === 'compact' ? (
          <CompactProfileCard user={user} showOnlineStatus={showOnlineStatus} />
        ) : (
          <ProfileCard user={user} />
        )
      ) : (
        // Placeholder skeleton while not in view
        <div className="bg-white">
          <div className="h-56 sm:h-72 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          <div className="p-4 sm:p-5 space-y-3">
            <div className="h-6 bg-gray-200"></div>
            <div className="h-4 bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200"></div>
              <div className="h-4 bg-gray-200"></div>
            </div>
            <div className="h-10 bg-gray-200"></div>
          </div>
        </div>
      )}
    </div>
  );
}

