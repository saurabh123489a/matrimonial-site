'use client';

interface ProfileCompletenessMeterProps {
  user: any;
  className?: string;
}

export default function ProfileCompletenessMeter({ user, className = '' }: ProfileCompletenessMeterProps) {
  const calculateCompleteness = () => {
    if (!user) return 0;

    const fields = [
      user.name,
      user.email || user.phone,
      user.age,
      user.gender,
      user.city,
      user.state,
      user.country,
      user.education,
      user.occupation,
      user.photos && user.photos.length > 0,
      user.bio,
      user.horoscopeDetails?.rashi,
    ];

    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = calculateCompleteness();
  const getColor = () => {
    if (completeness >= 80) return 'bg-green-500';
    if (completeness >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Profile Completeness
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {completeness}%
        </span>
      </div>
      <div className="w-full bg-gray-200">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${completeness}%` }}
        />
      </div>
      {completeness < 100 && (
        <p className="text-xs text-gray-500">
          Complete your profile to get more matches
        </p>
      )}
    </div>
  );
}

