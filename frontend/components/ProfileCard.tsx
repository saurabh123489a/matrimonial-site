import Link from 'next/link';
import { User } from '@/lib/api';

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden profile-card border border-gray-200">
      {/* Photo Section */}
      <div className="relative h-72 bg-gradient-to-br from-pink-100 to-red-100">
        {primaryPhoto ? (
          <>
            <img
              src={primaryPhoto.url}
              alt={user.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute top-2 right-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
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
      <div className="p-5">
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
          {user.religion && (
            <div className="flex items-center text-gray-700">
              <span className="text-pink-600 mr-2">🕌</span>
              <span className="truncate">{user.religion}</span>
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
        <div className="flex gap-2">
          <Link
            href={`/profiles/${user._id}`}
            className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all text-sm shadow-sm"
          >
            View Profile
          </Link>
          <button className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition-all text-sm">
            💝
          </button>
        </div>
      </div>
    </div>
  );
}
