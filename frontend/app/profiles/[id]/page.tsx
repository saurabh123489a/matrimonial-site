'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userApi, interestApi, shortlistApi, User } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProfileAction } from '@/contexts/ProfileActionContext';
import LazyImage from '@/components/LazyImage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfileCompletenessMeter from '@/components/ProfileCompletenessMeter';

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const { setSelectedProfile, clearSelectedProfile } = useProfileAction();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    aboutMe: true,
    education: false,
    location: false,
    lifestyle: false,
    family: false,
    partnerPreferences: false,
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadProfile();
    
    // Cleanup: clear selected profile when component unmounts
    return () => {
      clearSelectedProfile();
    };
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userApi.getById(id);
      if (response.status && response.data) {
        const profileData = response.data;
        setUser(profileData);
        // Set selected profile for bottom action bar
        const primaryPhoto = profileData.photos?.find(p => p.isPrimary) || profileData.photos?.[0];
        setSelectedProfile({
          userId: profileData._id,
          userName: profileData.name,
          userPhoto: primaryPhoto?.url,
        });
      } else {
        setError(response.message || 'Profile not found');
        clearSelectedProfile();
      }
    } catch (err: any) {
      console.error('Profile load error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        auth.logout();
        router.push('/login');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load profile';
        setError(errorMsg);
        showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const response = await interestApi.send(user._id);
      if (response.status) {
        showSuccess('Interest sent successfully!');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShortlist = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const checkResponse = await shortlistApi.check(user._id);
      const isShortlisted = checkResponse.status && checkResponse.data?.isShortlisted;
      
      const response = isShortlisted 
        ? await shortlistApi.remove(user._id)
        : await shortlistApi.add(user._id);
      
      if (response.status) {
        showSuccess(isShortlisted ? 'Removed from shortlist' : 'Added to shortlist');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update shortlist');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A0C11] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A0C11] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-[#F25D5D]/10 border border-red-400 dark:border-[#F25D5D] text-red-800 dark:text-[#F25D5D] px-4 py-3 rounded mb-4 max-w-md">
            {error || 'Profile not found'}
          </div>
          <button
            onClick={() => router.back()}
            className="text-pink-600 dark:text-[#E04F5F] hover:text-pink-700 dark:hover:text-[#C43A4E] font-medium"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const commonHobbies = ['Reading', 'Traveling', 'Dancing', 'Yoga', 'Cooking', 'Music', 'Sports', 'Photography', 'Art', 'Writing', 'Gaming', 'Movies'];
  const dietaryOptions = ['vegetarian', 'non-vegetarian', 'vegan', 'jain'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A0C11] pb-24 transition-colors">
      {/* Header - Mobile First Design */}
      <div className="bg-white dark:bg-[#2B0F17] border-b border-gray-200 dark:border-[#2F2327] sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#241317] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile
          </h1>
          <button
            onClick={() => router.push(`/messages/${user._id}`)}
            className="p-2 -mr-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#241317] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Photos Section */}
        <div className="flex gap-4 mb-6">
          {/* Main Profile Photo */}
          <div className="relative flex-shrink-0">
            {user.photos?.[0] ? (
              <div className="relative w-32 h-40 rounded-xl overflow-hidden">
                <LazyImage
                  src={user.photos[0].url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  placeholder="👤"
                />
              </div>
            ) : (
              <div className="w-32 h-40 rounded-xl bg-gray-200 dark:bg-[#241317] flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>

          {/* Additional Photos */}
          <div className="flex-1 flex flex-col gap-2">
            {user.photos && user.photos.length > 1 && user.photos.slice(1, 3).map((photo, index) => (
              <div key={index} className="relative w-full h-19 rounded-lg overflow-hidden">
                <LazyImage
                  src={photo.url}
                  alt={`Photo ${index + 2}`}
                  className="w-full h-full object-cover"
                  placeholder="📷"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white dark:bg-[#2B0F17] rounded-lg p-4 mb-6 border dark:border-[#2F2327]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-[#D5D3D7]">Profile Completion</span>
            <span className="text-sm font-semibold text-pink-600 dark:text-[#E04F5F]">
              {user.isProfileComplete ? '100%' : '80%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#241317] rounded-full h-2">
            <div 
              className="bg-pink-600 dark:bg-[#E04F5F] h-2 rounded-full transition-all duration-300"
              style={{ width: user.isProfileComplete ? '100%' : '80%' }}
            />
          </div>
        </div>

        {/* About Me Section - Collapsible */}
        <div className="bg-white dark:bg-[#2B0F17] rounded-lg overflow-hidden border dark:border-[#2F2327]">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, aboutMe: !expandedSections.aboutMe })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About Me</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-[#A29CA3] transition-transform ${expandedSections.aboutMe ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.aboutMe && (
            <div className="px-4 pb-4 space-y-4">
              {/* Gahoi ID */}
              {user.gahoiId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Gahoi ID</label>
                  <p className="text-gray-900 dark:text-white font-semibold text-pink-600 dark:text-[#E04F5F]">{user.gahoiId}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Full Name</label>
                <p className="text-gray-900 dark:text-white">{user.name}</p>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Age</label>
                <p className="text-gray-900 dark:text-white">{user.age || 'Not provided'}</p>
              </div>

              {/* Gender */}
              {user.gender && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Gender</label>
                  <p className="text-gray-900 dark:text-white capitalize">{user.gender}</p>
                </div>
              )}

              {/* Marital Status */}
              {user.maritalStatus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Marital Status</label>
                  <p className="text-gray-900 dark:text-white">{user.maritalStatus}</p>
                </div>
              )}

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Height</label>
                <p className="text-gray-900 dark:text-white">
                  {user.height ? `${Math.floor(user.height / 12)}'${user.height % 12}"` : 'Not provided'}
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Bio</label>
                <p className="text-gray-900 dark:text-[#D5D3D7] whitespace-pre-wrap">{user.bio || 'No bio provided'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Education & Career Section - Collapsible */}
        <div className="bg-white dark:bg-[#2B0F17] rounded-lg overflow-hidden border dark:border-[#2F2327]">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, education: !expandedSections.education })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Education & Career</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-[#A29CA3] transition-transform ${expandedSections.education ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.education && (
            <div className="px-4 pb-4 space-y-4">
              {/* Education */}
              {user.education && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Education</label>
                  <p className="text-gray-900 dark:text-white">{user.education}</p>
                </div>
              )}

              {/* Educational Detail */}
              {user.educationalDetail && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Educational Details</label>
                  <p className="text-gray-900 dark:text-white">{user.educationalDetail}</p>
                </div>
              )}

              {/* Occupation */}
              {user.occupation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Occupation</label>
                  <p className="text-gray-900 dark:text-white">{user.occupation}</p>
                </div>
              )}

              {/* Profession */}
              {user.profession && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Profession</label>
                  <p className="text-gray-900 dark:text-white">{user.profession}</p>
                </div>
              )}

              {/* Employer */}
              {user.employer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Employer</label>
                  <p className="text-gray-900 dark:text-white">{user.employer}</p>
                </div>
              )}

              {/* Annual Income */}
              {user.annualIncome && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Annual Income</label>
                  <p className="text-gray-900 dark:text-white">{user.annualIncome}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location Section - Collapsible */}
        <div className="bg-white dark:bg-[#2B0F17] rounded-lg overflow-hidden border dark:border-[#2F2327]">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, location: !expandedSections.location })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-[#A29CA3] transition-transform ${expandedSections.location ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.location && (
            <div className="px-4 pb-4 space-y-4">
              {/* City */}
              {user.city && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">City</label>
                  <p className="text-gray-900 dark:text-white">{user.city}</p>
                </div>
              )}

              {/* State */}
              {user.state && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">State</label>
                  <p className="text-gray-900 dark:text-white">{user.state}</p>
                </div>
              )}

              {/* Country */}
              {user.country && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Country</label>
                  <p className="text-gray-900 dark:text-white">{user.country}</p>
                </div>
              )}

              {/* Town */}
              {user.town && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Town</label>
                  <p className="text-gray-900 dark:text-white">{user.town}</p>
                </div>
              )}

              {/* Present Address */}
              {user.presentAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Present Address</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{user.presentAddress}</p>
                </div>
              )}

              {/* Permanent Address */}
              {user.permanentAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Permanent Address</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{user.permanentAddress}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lifestyle & Interests Section - Collapsible */}
        <div className="bg-white dark:bg-[#2B0F17] rounded-lg overflow-hidden border dark:border-[#2F2327]">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, lifestyle: !expandedSections.lifestyle })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lifestyle & Interests</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-[#A29CA3] transition-transform ${expandedSections.lifestyle ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.lifestyle && (
            <div className="px-4 pb-4 space-y-6">
              {/* Dietary Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-3">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => {
                    const isSelected = user.diet === option;
                    return (
                      <span
                        key={option}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          isSelected
                            ? 'bg-pink-600 dark:bg-[#E04F5F] text-white'
                            : 'bg-gray-200 dark:bg-[#241317] text-gray-700 dark:text-[#D5D3D7]'
                        }`}
                      >
                        {option === 'non-vegetarian' ? 'Non-Veg' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Hobbies & Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-3">Hobbies & Interests</label>
                <div className="flex flex-wrap gap-2">
                  {(user.hobbies || []).map((hobby) => (
                    <span
                      key={hobby}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-pink-600 dark:bg-[#E04F5F] text-white"
                    >
                      {hobby}
                    </span>
                  ))}
                  {(!user.hobbies || user.hobbies.length === 0) && (
                    <span className="text-gray-500 dark:text-[#A29CA3] text-sm">No hobbies listed</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Family Section - Collapsible */}
        {(user.family?.fathersName || user.family?.mothersName || user.family?.fathersContactNumber) && (
          <div className="bg-white dark:bg-[#2B0F17] rounded-lg overflow-hidden border dark:border-[#2F2327]">
            <button
              onClick={() => setExpandedSections({ ...expandedSections, family: !expandedSections.family })}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Family Details</h2>
              <svg 
                className={`w-5 h-5 text-gray-500 dark:text-[#A29CA3] transition-transform ${expandedSections.family ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.family && (
              <div className="px-4 pb-4 space-y-4">
                {/* Father's Name */}
                {user.family?.fathersName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Father's Name</label>
                    <p className="text-gray-900 dark:text-white">{user.family.fathersName}</p>
                  </div>
                )}

                {/* Mother's Name */}
                {user.family?.mothersName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Mother's Name</label>
                    <p className="text-gray-900 dark:text-white">{user.family.mothersName}</p>
                  </div>
                )}

                {/* Father's Contact */}
                {user.family?.fathersContactNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-1">Father's Contact</label>
                    <p className="text-gray-900 dark:text-white">{user.family.fathersContactNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Partner Preferences Section - Collapsible */}
        <div className="bg-white dark:bg-[#2B0F17] rounded-lg overflow-hidden border dark:border-[#2F2327]">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, partnerPreferences: !expandedSections.partnerPreferences })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Preferences</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-[#A29CA3] transition-transform ${expandedSections.partnerPreferences ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.partnerPreferences && (
            <div className="px-4 pb-4 space-y-6">
              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-3">
                  Age Range
                  <span className="ml-2 text-pink-600 dark:text-[#E04F5F] font-semibold">
                    {user.preferences?.minAge || 28} - {user.preferences?.maxAge || 34}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-[#241317] rounded-full relative">
                    <div 
                      className="absolute h-2 bg-pink-600 dark:bg-[#E04F5F] rounded-full"
                      style={{ 
                        left: `${((user.preferences?.minAge || 28) - 18) / (100 - 18) * 100}%`,
                        width: `${((user.preferences?.maxAge || 34) - (user.preferences?.minAge || 28)) / (100 - 18) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Height Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#D5D3D7] mb-3">
                  Height Range
                  <span className="ml-2 text-pink-600 dark:text-[#E04F5F] font-semibold">
                    {user.preferences?.minHeight ? `${Math.floor(user.preferences.minHeight / 12)}'${user.preferences.minHeight % 12}"` : "5'8\""} - {user.preferences?.maxHeight ? `${Math.floor(user.preferences.maxHeight / 12)}'${user.preferences.maxHeight % 12}"` : "6'2\""}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-[#241317] rounded-full relative">
                    <div 
                      className="absolute h-2 bg-pink-600 dark:bg-[#E04F5F] rounded-full"
                      style={{ 
                        left: `${((user.preferences?.minHeight || 68) - 48) / (84 - 48) * 100}%`,
                        width: `${((user.preferences?.maxHeight || 74) - (user.preferences?.minHeight || 68)) / (84 - 48) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSendInterest}
            disabled={actionLoading}
            className="flex-1 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {actionLoading ? 'Sending...' : '💝 Send Interest'}
          </button>
          <button
            onClick={handleShortlist}
            disabled={actionLoading}
            className="px-6 py-3 bg-gray-200 dark:bg-[#241317] text-gray-700 dark:text-[#D5D3D7] font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-[#1F1417] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ⭐
          </button>
        </div>
      </div>
    </div>
  );
}

