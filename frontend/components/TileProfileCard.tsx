'use client';

import Link from 'next/link';
import { User } from '@/lib/api';
import LazyImage from './LazyImage';
import { getProfileUrl } from '@/lib/profileUtils';

interface TileProfileCardProps {
  user: User;
}

export default function TileProfileCard({ user }: TileProfileCardProps) {
  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];

  const bgColors = [
    'bg-gray-200',
    'bg-gray-300',
    'bg-amber-100',
    'bg-teal-100',
    'bg-pink-100',
  ];
  const bgColor = bgColors[user._id.charCodeAt(0) % bgColors.length];
  
  return (
    <Link href={getProfileUrl(user)}>
      <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group aspect-square">
        <div className={`relative h-full ${bgColor} dark:bg-gray-800 overflow-hidden`}>
          {primaryPhoto ? (
            <>
              <LazyImage
                src={primaryPhoto.url}
                alt={user.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                placeholder="👤"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
              👤
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <h3 className="text-xs font-semibold text-white truncate drop-shadow-lg">
              {user.name}
            </h3>
            {user.age && (
              <p className="text-xs text-white/90 truncate">
                {user.age} Years
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

