'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, photoApi, User, UpdateUserDto, metaDataApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import LocationSelect from '@/components/LocationSelect';
import ProfileCompletenessMeter from '@/components/ProfileCompletenessMeter';
import ProfileBadges from '@/components/ProfileBadges';
import PhotoUpload from '@/components/PhotoUpload';
import ProfileShareModal from '@/components/ProfileShareModal';
import LazyImage from '@/components/LazyImage';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';
import { getProfileUrl } from '@/lib/profileUtils';

export default function MyProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<UpdateUserDto>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [educationOptions, setEducationOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [occupationOptions, setOccupationOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [professionOptions, setProfessionOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingEducation, setLoadingEducation] = useState(false);
  const [loadingOccupation, setLoadingOccupation] = useState(false);
  const [loadingProfession, setLoadingProfession] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingHoroscope, setEditingHoroscope] = useState(false);
  const [savingHoroscope, setSavingHoroscope] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    aboutMe: true,
    contact: false,
    location: false,
    education: false,
    lifestyle: false,
    family: false,
    horoscope: false,
    partnerPreferences: false,
  });

  useEffect(() => {
    
    setMounted(true);
    
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadProfile();
    loadEducationOptions();
    
  }, []);

  
  useEffect(() => {
    if (user?.gender) {
      loadOccupationOptions();
    }
    
  }, [user?.gender]);

  const loadEducationOptions = async () => {
    setLoadingEducation(true);
    try {
      const response = await metaDataApi.getEducation();
      if (response.status && response.data) {
        setEducationOptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load education options:', error);
    } finally {
      setLoadingEducation(false);
    }
  };

  const loadOccupationOptions = async () => {
    setLoadingOccupation(true);
    try {
      
      const gender = user?.gender || '';
      const response = await metaDataApi.getOccupation(gender);
      if (response.status && response.data) {
        setOccupationOptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load occupation options:', error);
    } finally {
      setLoadingOccupation(false);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userApi.getMe();
      if (response.status && response.data) {
        setUser(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          whatsappNumber: response.data.whatsappNumber || '',
          city: response.data.city || '',
          state: response.data.state || '',
          country: response.data.country || '',
          town: response.data.town || '',
          presentAddress: response.data.presentAddress || '',
          permanentAddress: response.data.permanentAddress || '',
          education: response.data.education || '',
          educationalDetail: response.data.educationalDetail || '',
          occupation: response.data.occupation || '',
          profession: response.data.profession || '',
          employer: response.data.employer || '',
          annualIncome: response.data.annualIncome || '',
          bio: response.data.bio || '',
          height: response.data.height || undefined,
          diet: (response.data.diet as 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | undefined) || undefined,
          hobbies: response.data.hobbies || [],
          preferences: {
            minAge: response.data.preferences?.minAge || undefined,
            maxAge: response.data.preferences?.maxAge || undefined,
            minHeight: response.data.preferences?.minHeight || undefined,
            maxHeight: response.data.preferences?.maxHeight || undefined,
          },
          dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : '',
          family: {
            fathersName: response.data.family?.fathersName || '',
            fathersOccupationType: response.data.family?.fathersOccupationType || undefined,
            fathersOccupationDesc: response.data.family?.fathersOccupationDesc || '',
            fathersContactNumber: response.data.family?.fathersContactNumber || '',
            mothersName: response.data.family?.mothersName || '',
            mothersOccupationType: response.data.family?.mothersOccupationType || undefined,
            mothersOccupationDesc: response.data.family?.mothersOccupationDesc || '',
            numberOfBrothers: response.data.family?.numberOfBrothers || 0,
            numberOfSisters: response.data.family?.numberOfSisters || 0,
            marriedBrothers: response.data.family?.marriedBrothers || 0,
            unmarriedBrothers: response.data.family?.unmarriedBrothers || 0,
            marriedSisters: response.data.family?.marriedSisters || 0,
            unmarriedSisters: response.data.family?.unmarriedSisters || 0,
            familyType: response.data.family?.familyType || 'nuclear',
            familyStatus: response.data.family?.familyStatus || 'middle-class',
            familyValues: response.data.family?.familyValues || 'moderate',
          },
          horoscopeDetails: {
            rashi: response.data.horoscopeDetails?.rashi || '',
            nakshatra: response.data.horoscopeDetails?.nakshatra || '',
            starSign: response.data.horoscopeDetails?.starSign || '',
            timeOfBirth: response.data.horoscopeDetails?.timeOfBirth || '',
          },
        });
      } else {
        setError(response.message || 'Failed to load profile');
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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setFieldErrors({});

    try {
      const response = await userApi.updateMe(formData);
      if (response.status) {
        
        await loadProfile();
        setEditing(false);
        setEditingHoroscope(false);
        setFieldErrors({});
        showSuccess(t('profile.profileUpdated'));
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || 'Failed to update profile';
      setError(errorMsg);
      showError(errorMsg);

      
      if (errorData?.errors || errorData?.validationErrors) {
        const validationErrors: Record<string, string> = {};
        const errors = errorData.errors || errorData.validationErrors || {};
        
        
        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            if (error.path && error.message) {
              validationErrors[error.path.join('.')] = error.message;
            }
          });
        } else if (typeof errors === 'object') {
          
          Object.keys(errors).forEach((key) => {
            const errorValue = errors[key];
            if (typeof errorValue === 'string') {
              validationErrors[key] = errorValue;
            } else if (Array.isArray(errorValue) && errorValue.length > 0) {
              validationErrors[key] = errorValue[0];
            }
          });
        }
        
        if (Object.keys(validationErrors).length > 0) {
          setFieldErrors(validationErrors);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  
  const handleSaveHoroscope = async () => {
    setSavingHoroscope(true);
    setError('');

    try {
      const response = await userApi.updateMe({
        horoscopeDetails: formData.horoscopeDetails,
      });
      if (response.status) {
        
        await loadProfile();
        setEditingHoroscope(false);
        showSuccess(t('profile.horoscopeUpdated') || 'Horoscope details updated successfully');
      } else {
        setError(response.message || 'Failed to update horoscope details');
        showError(response.message || 'Failed to update horoscope details');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update horoscope details';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSavingHoroscope(false);
    }
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    
    const currentPhotoCount = user?.photos?.length || 0;
    if (currentPhotoCount + files.length > 3) {
      const errorMsg = t('profile.maxPhotos') + `. ${t('profile.youHave')} ${currentPhotoCount} ${t('profile.photos')}.`;
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setUploadingPhotos(true);
    setError('');

    try {
      const response = await photoApi.upload(files);
      if (response.status) {
        setUser(response.data);
        showSuccess(t('profile.photosUploaded'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to upload photos';
      setError(errorMsg);
      showError(errorMsg);
      throw err; 
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoIndex: number) => {
    if (!confirm(t('profile.confirmDeletePhoto'))) return;

    setError('');

    try {
      const response = await photoApi.delete(photoIndex);
      if (response.status) {
        setUser(response.data);
        showSuccess(t('profile.photoDeleted'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete photo';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleSetPrimaryPhoto = async (photoIndex: number) => {
    setError('');

    try {
      const response = await photoApi.setPrimary(photoIndex);
      if (response.status) {
        setUser(response.data);
        showSuccess(t('profile.primaryPhotoUpdated'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to set primary photo';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    
    setTogglingActive(true);
    setError('');

    try {
      const response = await userApi.updateMe({ isActive: !user.isActive });
      if (response.status) {
        setUser(response.data);
        showSuccess(response.data.isActive ? t('profile.profileActivated') : t('profile.profileDeactivated'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile status';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setTogglingActive(false);
    }
  };

  const handleCountryChange = useCallback((country: string) => {
    setFormData((prev) => ({ ...prev, country, state: '', city: '' }));
  }, []);

  const handleStateChange = useCallback((state: string) => {
    setFormData((prev) => ({ ...prev, state, city: '' }));
  }, []);

  const handleCityChange = useCallback((city: string) => {
    setFormData((prev) => ({ ...prev, city }));
  }, []);

  if (!mounted || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error || t('profile.failedToLoad')}
        </div>
      </div>
    );
  }

  const commonHobbies = ['Reading', 'Traveling', 'Dancing', 'Yoga', 'Cooking', 'Music', 'Sports', 'Photography', 'Art', 'Writing', 'Gaming', 'Movies'];
  const dietaryOptions = ['vegetarian', 'non-vegetarian', 'vegan', 'jain'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] pb-24 transition-colors">
      {/* Header - Mobile First Design */}
      <div className="bg-white dark:bg-[#181b23] border-b border-gray-200 dark:border-[#303341] sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
                <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-700 dark:text-pink-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
                >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
                </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-pink-100">
            {editing ? 'Edit Profile' : t('profile.myProfile')}
          </h1>
                  <button
            onClick={() => {
              if (!editing) {
                setEditing(true);
              } else {
                setShowShareModal(true);
              }
            }}
            className="p-2 -mr-2 text-gray-700 dark:text-pink-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
                  </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Photos Section - Matching Image Design */}
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
                {editing && (
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = false;
                      input.onchange = async (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        if (files.length > 0) {
                          await handlePhotoUpload(files);
                        }
                      };
                      input.click();
                    }}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-pink-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
              )}
            </div>
            ) : (
              <div className="w-32 h-40 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
            {editing && (user.photos?.length || 0) < 3 && (
                          <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = async (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    if (files.length > 0) {
                      await handlePhotoUpload(files);
                    }
                  };
                  input.click();
                }}
                className="w-full h-19 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-pink-500 dark:hover:border-pink-500 transition-colors"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Add Photo</span>
                          </button>
                        )}
                      </div>
                    </div>

        {/* Profile Completion */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-pink-200">Profile Completion</span>
            <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
              {user.isProfileComplete ? '100%' : '80%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: user.isProfileComplete ? '100%' : '80%' }}
            />
          </div>
          </div>

        {/* About Me Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, aboutMe: !expandedSections.aboutMe })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">About Me</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.aboutMe ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.aboutMe && (
            <div className="px-4 pb-4 space-y-4">
              {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: sanitizeFormInput(e.target.value, 'text') })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.name}</p>
              )}
            </div>

              {/* Age */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Age</label>
              {editing ? (
                  <input
                    type="number"
                    value={user.age || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg bg-gray-50 dark:bg-gray-800"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.age || 'Not provided'}</p>
              )}
            </div>

              {/* Height */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Height</label>
              {editing ? (
                <input
                    type="text"
                    value={formData.height ? `${Math.floor(formData.height / 12)}'${formData.height % 12}"` : ''}
                  onChange={(e) => {
                      const value = e.target.value;
                      const match = value.match(/(\d+)'(\d+)"/);
                      if (match) {
                        const feet = parseInt(match[1]);
                        const inches = parseInt(match[2]);
                        setFormData({ ...formData, height: feet * 12 + inches });
                      } else if (value === '') {
                        setFormData({ ...formData, height: undefined });
                      }
                    }}
                    placeholder="5'6&quot;"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">
                    {user.height ? `${Math.floor(user.height / 12)}'${user.height % 12}"` : 'Not provided'}
                </p>
              )}
            </div>

              {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Bio</label>
              {editing ? (
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: sanitizeFormInput(e.target.value, 'textarea') })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="A software engineer with a passion for travel and classical dance. Looking for a partner who values family, honesty, and a good sense of humor."
                />
              ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.bio || 'No bio provided'}</p>
              )}
            </div>
                </div>
          )}
                  </div>

        {/* Contact Information Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, contact: !expandedSections.contact })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">Contact Information</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.contact ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.contact && (
            <div className="px-4 pb-4 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-[#1f212a] dark:text-pink-100 ${
                      fieldErrors.email ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.email || 'Not provided'}</p>
                )}
                {fieldErrors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: sanitizeFormInput(e.target.value, 'phone') })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.phone || 'Not provided'}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">WhatsApp Number</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: sanitizeFormInput(e.target.value, 'phone') })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter WhatsApp number"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.whatsappNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Location Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, location: !expandedSections.location })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">Location</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.location && (
            <div className="px-4 pb-4 space-y-4">
              {editing ? (
                <LocationSelect
                  selectedCountry={formData.country || user?.country || ''}
                  selectedState={formData.state || user?.state || ''}
                  selectedCity={formData.city || user?.city || ''}
                  onCountryChange={handleCountryChange}
                  onStateChange={handleStateChange}
                  onCityChange={handleCityChange}
                />
              ) : (
                <div className="space-y-2 text-gray-900 dark:text-pink-100">
                  {user.country && <p><span className="font-medium dark:text-pink-200">Country:</span> {user.country}</p>}
                  {user.state && <p><span className="font-medium dark:text-pink-200">State:</span> {user.state}</p>}
                  {user.city && <p><span className="font-medium dark:text-pink-200">City:</span> {user.city}</p>}
                  {user.town && <p><span className="font-medium dark:text-pink-200">Town:</span> {user.town}</p>}
                  {!user.country && !user.state && !user.city && <p>Not provided</p>}
                </div>
              )}
              
              {editing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Town/Village</label>
                    <input
                      type="text"
                      value={formData.town || ''}
                      onChange={(e) => setFormData({ ...formData, town: sanitizeFormInput(e.target.value, 'text') })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter town or village name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Present Address</label>
                    <textarea
                      value={formData.presentAddress || ''}
                      onChange={(e) => setFormData({ ...formData, presentAddress: sanitizeFormInput(e.target.value, 'textarea') })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter present address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Permanent Address</label>
                    <textarea
                      value={formData.permanentAddress || ''}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: sanitizeFormInput(e.target.value, 'textarea') })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter permanent address"
                    />
                  </div>
                </>
              )}
              
              {!editing && (
                <>
                  {user.presentAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Present Address</label>
                      <p className="text-gray-900 dark:text-pink-100">{user.presentAddress}</p>
                    </div>
                  )}
                  {user.permanentAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Permanent Address</label>
                      <p className="text-gray-900 dark:text-pink-100">{user.permanentAddress}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Education & Career Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, education: !expandedSections.education })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">Education & Career</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.education ? 'rotate-180' : ''}`}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                  Education
                  {loadingEducation && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-pink-400">(Loading...)</span>
                  )}
                </label>
                {editing ? (
                  <select
                    value={formData.education || ''}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    disabled={loadingEducation}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                  >
                    <option value="">Select Education</option>
                    {educationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">
                    {user.education 
                      ? educationOptions.find(opt => opt.value === user.education)?.label || user.education
                      : 'Not provided'}
                  </p>
                )}
              </div>

              {/* Educational Detail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Educational Detail</label>
                {editing ? (
                  <select
                    value={formData.educationalDetail || ''}
                    onChange={(e) => setFormData({ ...formData, educationalDetail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Professional">Professional</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.educationalDetail || 'Not provided'}</p>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                  Occupation
                  {loadingOccupation && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-pink-400">(Loading...)</span>
                  )}
                </label>
                {editing ? (
                  <select
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    disabled={loadingOccupation}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                  >
                    <option value="">Select Occupation</option>
                    {occupationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">
                    {user.occupation 
                      ? occupationOptions.find(opt => opt.value === user.occupation)?.label || user.occupation
                      : 'Not provided'}
                  </p>
                )}
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Profession</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.profession || ''}
                    onChange={(e) => setFormData({ ...formData, profession: sanitizeFormInput(e.target.value, 'text') })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., Computer Software Professional"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.profession || 'Not provided'}</p>
                )}
              </div>

              {/* Employer/Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Employer/Company</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.employer || ''}
                    onChange={(e) => setFormData({ ...formData, employer: sanitizeFormInput(e.target.value, 'text') })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Company name"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.employer || 'Not provided'}</p>
                )}
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Annual Income</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.annualIncome || ''}
                    onChange={(e) => setFormData({ ...formData, annualIncome: sanitizeFormInput(e.target.value, 'text') })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., 25-30 lakh"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">{user.annualIncome || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lifestyle & Interests Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, lifestyle: !expandedSections.lifestyle })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">Lifestyle & Interests</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.lifestyle ? 'rotate-180' : ''}`}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-3">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => {
                    const isSelected = formData.diet === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => editing && setFormData({ ...formData, diet: option as any })}
                        disabled={!editing}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        } ${!editing ? 'cursor-default' : 'cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-900/20'}`}
                      >
                        {option === 'non-vegetarian' ? 'Non-Veg' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    );
                  })}
            </div>
                {!editing && user.diet && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-pink-600 text-white">
                      {user.diet === 'non-vegetarian' ? 'Non-Veg' : user.diet.charAt(0).toUpperCase() + user.diet.slice(1)}
                    </span>
            </div>
              )}
            </div>

              {/* Hobbies & Interests */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-3">Hobbies & Interests</label>
                <div className="flex flex-wrap gap-2">
                  {commonHobbies.map((hobby) => {
                    const isSelected = (formData.hobbies || []).includes(hobby);
                    return (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => {
                          if (editing) {
                            const currentHobbies = formData.hobbies || [];
                            if (isSelected) {
                              setFormData({ ...formData, hobbies: currentHobbies.filter(h => h !== hobby) });
                            } else {
                              setFormData({ ...formData, hobbies: [...currentHobbies, hobby] });
                            }
                          }
                        }}
                        disabled={!editing}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        } ${!editing ? 'cursor-default' : 'cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-900/20'}`}
                      >
                        {hobby}
                      </button>
                    );
                  })}
                  {editing && (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-pink-500 dark:hover:border-pink-500 transition-colors"
                    >
                      + Add
                    </button>
              )}
            </div>
                {!editing && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(user.hobbies || []).map((hobby) => (
                      <span
                        key={hobby}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-pink-600 text-white"
                      >
                        {hobby}
                      </span>
                    ))}
                    {(!user.hobbies || user.hobbies.length === 0) && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No hobbies listed</span>
              )}
            </div>
              )}
            </div>
              </div>
                  )}
                </div>

        {/* Family Information Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, family: !expandedSections.family })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">👨‍👩‍👧‍👦 Family Information</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.family ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.family && (
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Father's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.family?.fathersName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          fathersName: sanitizeFormInput(e.target.value, 'text'),
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter father's name"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">{user.family?.fathersName || 'Not provided'}</p>
                  )}
                </div>

                {/* Father's Occupation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Father's Occupation Type</label>
                  {editing ? (
                    <select
                      value={formData.family?.fathersOccupationType || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          fathersOccupationType: e.target.value as 'job' | 'private' | 'govt' | 'business' | undefined,
                          fathersOccupationDesc: e.target.value ? formData.family?.fathersOccupationDesc : '', 
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Select Type</option>
                      <option value="job">Job</option>
                      <option value="private">Private</option>
                      <option value="govt">Government</option>
                      <option value="business">Business</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">
                      {user.family?.fathersOccupationType 
                        ? user.family.fathersOccupationType.charAt(0).toUpperCase() + user.family.fathersOccupationType.slice(1)
                        : 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Father's Occupation Description */}
                {editing && formData.family?.fathersOccupationType && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Father's Occupation Description</label>
                    <input
                      type="text"
                      value={formData.family?.fathersOccupationDesc || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          fathersOccupationDesc: sanitizeFormInput(e.target.value, 'text'),
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder={`Enter ${formData.family.fathersOccupationType} details`}
                    />
                  </div>
                )}

                {!editing && user.family?.fathersOccupationDesc && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Father's Occupation Description</label>
                    <p className="text-gray-900 dark:text-pink-100">{user.family.fathersOccupationDesc}</p>
                  </div>
                )}

                {/* Father's Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Father's Contact Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.family?.fathersContactNumber || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          fathersContactNumber: sanitizeFormInput(e.target.value, 'phone'),
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter contact number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">{user.family?.fathersContactNumber || 'Not provided'}</p>
                  )}
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Mother's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.family?.mothersName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          mothersName: sanitizeFormInput(e.target.value, 'text'),
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter mother's name"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">{user.family?.mothersName || 'Not provided'}</p>
                  )}
                </div>

                {/* Mother's Occupation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Mother's Occupation Type</label>
                  {editing ? (
                    <select
                      value={formData.family?.mothersOccupationType || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          mothersOccupationType: e.target.value as 'job' | 'private' | 'govt' | 'business' | undefined,
                          mothersOccupationDesc: e.target.value ? formData.family?.mothersOccupationDesc : '', 
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Select Type</option>
                      <option value="job">Job</option>
                      <option value="private">Private</option>
                      <option value="govt">Government</option>
                      <option value="business">Business</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">
                      {user.family?.mothersOccupationType 
                        ? user.family.mothersOccupationType.charAt(0).toUpperCase() + user.family.mothersOccupationType.slice(1)
                        : 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Mother's Occupation Description */}
                {editing && formData.family?.mothersOccupationType && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Mother's Occupation Description</label>
                    <input
                      type="text"
                      value={formData.family?.mothersOccupationDesc || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          mothersOccupationDesc: sanitizeFormInput(e.target.value, 'text'),
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder={`Enter ${formData.family.mothersOccupationType} details`}
                    />
                  </div>
                )}

                {!editing && user.family?.mothersOccupationDesc && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Mother's Occupation Description</label>
                    <p className="text-gray-900 dark:text-pink-100">{user.family.mothersOccupationDesc}</p>
                  </div>
                )}

                {/* Siblings Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Number of Brothers</label>
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      value={formData.family?.numberOfBrothers || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          numberOfBrothers: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">{user.family?.numberOfBrothers || 0}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Number of Sisters</label>
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      value={formData.family?.numberOfSisters || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        family: {
                          ...formData.family,
                          numberOfSisters: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">{user.family?.numberOfSisters || 0}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Horoscope Details Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, horoscope: !expandedSections.horoscope })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">🔮 Horoscope Details</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.horoscope ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.horoscope && (
            <div className="px-4 pb-4 space-y-4">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    value={typeof formData.dateOfBirth === 'string' ? formData.dateOfBirth : (formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString().split('T')[0] : '')}
                    onChange={(e) => {
                      setFormData({ ...formData, dateOfBirth: e.target.value });
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                )}
              </div>

              {/* Time of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Time of Birth (HH:MM:SS)</label>
                {editing ? (
                  <input
                    type="time"
                    step="1"
                    value={formData.horoscopeDetails?.timeOfBirth ? formData.horoscopeDetails.timeOfBirth.substring(0, 5) : ''}
                    onChange={(e) => {
                      const timeValue = e.target.value ? e.target.value + ':00' : ''; 
                      setFormData({
                        ...formData,
                        horoscopeDetails: {
                          ...formData.horoscopeDetails,
                          timeOfBirth: timeValue,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="HH:MM:SS"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">
                    {user.horoscopeDetails?.timeOfBirth || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Rashi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Rashi (Moon Sign)</label>
                {(editing || editingHoroscope) ? (
                  <select
                    value={formData.horoscopeDetails?.rashi || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      horoscopeDetails: {
                        ...formData.horoscopeDetails,
                        rashi: e.target.value,
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select Rashi</option>
                    <option value="Aries">Aries (Mesha)</option>
                    <option value="Taurus">Taurus (Vrishabha)</option>
                    <option value="Gemini">Gemini (Mithuna)</option>
                    <option value="Cancer">Cancer (Karka)</option>
                    <option value="Leo">Leo (Simha)</option>
                    <option value="Virgo">Virgo (Kanya)</option>
                    <option value="Libra">Libra (Tula)</option>
                    <option value="Scorpio">Scorpio (Vrishchika)</option>
                    <option value="Sagittarius">Sagittarius (Dhanu)</option>
                    <option value="Capricorn">Capricorn (Makara)</option>
                    <option value="Aquarius">Aquarius (Kumbha)</option>
                    <option value="Pisces">Pisces (Meena)</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">
                    {user.horoscopeDetails?.rashi || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Nakshatra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Nakshatra</label>
                {(editing || editingHoroscope) ? (
                  <select
                    value={formData.horoscopeDetails?.nakshatra || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      horoscopeDetails: {
                        ...formData.horoscopeDetails,
                        nakshatra: e.target.value,
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select Nakshatra</option>
                    <option value="Ashwini">Ashwini</option>
                    <option value="Bharani">Bharani</option>
                    <option value="Krittika">Krittika</option>
                    <option value="Rohini">Rohini</option>
                    <option value="Mrigashira">Mrigashira</option>
                    <option value="Ardra">Ardra</option>
                    <option value="Punarvasu">Punarvasu</option>
                    <option value="Pushya">Pushya</option>
                    <option value="Ashlesha">Ashlesha</option>
                    <option value="Magha">Magha</option>
                    <option value="Purva Phalguni">Purva Phalguni</option>
                    <option value="Uttara Phalguni">Uttara Phalguni</option>
                    <option value="Hasta">Hasta</option>
                    <option value="Chitra">Chitra</option>
                    <option value="Swati">Swati</option>
                    <option value="Vishakha">Vishakha</option>
                    <option value="Anuradha">Anuradha</option>
                    <option value="Jyeshtha">Jyeshtha</option>
                    <option value="Mula">Mula</option>
                    <option value="Purva Ashadha">Purva Ashadha</option>
                    <option value="Uttara Ashadha">Uttara Ashadha</option>
                    <option value="Shravana">Shravana</option>
                    <option value="Dhanishta">Dhanishta</option>
                    <option value="Shatabhisha">Shatabhisha</option>
                    <option value="Purva Bhadrapada">Purva Bhadrapada</option>
                    <option value="Uttara Bhadrapada">Uttara Bhadrapada</option>
                    <option value="Revati">Revati</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">
                    {user.horoscopeDetails?.nakshatra || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Star Sign */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Star Sign</label>
                {(editing || editingHoroscope) ? (
                  <input
                    type="text"
                    value={formData.horoscopeDetails?.starSign || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      horoscopeDetails: {
                        ...formData.horoscopeDetails,
                        starSign: e.target.value,
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-pink-100">
                    {user.horoscopeDetails?.starSign || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Partner Preferences Section - Collapsible */}
        <div className="bg-white dark:bg-[#181b23] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, partnerPreferences: !expandedSections.partnerPreferences })}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-pink-100">Partner Preferences</h2>
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedSections.partnerPreferences ? 'rotate-180' : ''}`}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-3">
                  Age Range
                  <span className="ml-2 text-pink-600 dark:text-pink-400 font-semibold">
                    {formData.preferences?.minAge || user.preferences?.minAge || 28} - {formData.preferences?.maxAge || user.preferences?.maxAge || 34}
                  </span>
                </label>
                  {editing ? (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Age</label>
                    <input
                          type="number"
                          min="18"
                          max="100"
                          value={formData.preferences?.minAge || user.preferences?.minAge || 28}
                      onChange={(e) => setFormData({
                        ...formData,
                            preferences: {
                              ...formData.preferences,
                              minAge: parseInt(e.target.value) || undefined,
                        },
                      })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Age</label>
                    <input
                          type="number"
                          min="18"
                          max="100"
                          value={formData.preferences?.maxAge || user.preferences?.maxAge || 34}
                      onChange={(e) => setFormData({
                        ...formData,
                            preferences: {
                              ...formData.preferences,
                              maxAge: parseInt(e.target.value) || undefined,
                        },
                      })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>
                </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                      <div 
                        className="absolute h-2 bg-pink-600 rounded-full"
                        style={{ 
                          left: `${((user.preferences?.minAge || 28) - 18) / (100 - 18) * 100}%`,
                          width: `${((user.preferences?.maxAge || 34) - (user.preferences?.minAge || 28)) / (100 - 18) * 100}%`
                        }}
                    />
                  </div>
                    <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm whitespace-nowrap">
                      {user.preferences?.minAge || 28} - {user.preferences?.maxAge || 34}
                    </span>
                  </div>
                )}
            </div>

              {/* Height Range */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-3">
                  Height Range
                  <span className="ml-2 text-pink-600 dark:text-pink-400 font-semibold">
                    {(() => {
                      const minH = formData.preferences?.minHeight || user.preferences?.minHeight || 68;
                      const maxH = formData.preferences?.maxHeight || user.preferences?.maxHeight || 74;
                      const minFeet = Math.floor(minH / 12);
                      const minInches = minH % 12;
                      const maxFeet = Math.floor(maxH / 12);
                      const maxInches = maxH % 12;
                      return minFeet + "'" + minInches + '" - ' + maxFeet + "'" + maxInches + '"';
                    })()}
                  </span>
                  </label>
                  {editing ? (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Height</label>
                    <input
                          type="text"
                          value={(() => {
                            if (formData.preferences?.minHeight) {
                              const feet = Math.floor(formData.preferences.minHeight / 12);
                              const inches = formData.preferences.minHeight % 12;
                              return feet + "'" + inches + '"';
                            }
                            if (user.preferences?.minHeight) {
                              const feet = Math.floor(user.preferences.minHeight / 12);
                              const inches = user.preferences.minHeight % 12;
                              return feet + "'" + inches + '"';
                            }
                            return "5'8\"";
                          })()}
                      onChange={(e) => {
                            const value = e.target.value;
                            const match = value.match(/(\d+)'(\d+)"/);
                            if (match) {
                              const feet = parseInt(match[1]);
                              const inches = parseInt(match[2]);
                        setFormData({
                          ...formData,
                                preferences: {
                                  ...formData.preferences,
                                  minHeight: feet * 12 + inches,
                          },
                        });
                            }
                      }}
                          placeholder="5'8&quot;"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Height</label>
                    <input
                          type="text"
                          value={(() => {
                            if (formData.preferences?.maxHeight) {
                              const feet = Math.floor(formData.preferences.maxHeight / 12);
                              const inches = formData.preferences.maxHeight % 12;
                              return feet + "'" + inches + '"';
                            }
                            if (user.preferences?.maxHeight) {
                              const feet = Math.floor(user.preferences.maxHeight / 12);
                              const inches = user.preferences.maxHeight % 12;
                              return feet + "'" + inches + '"';
                            }
                            return "6'2\"";
                          })()}
                      onChange={(e) => {
                            const value = e.target.value;
                            const match = value.match(/(\d+)'(\d+)"/);
                            if (match) {
                              const feet = parseInt(match[1]);
                              const inches = parseInt(match[2]);
                        setFormData({
                          ...formData,
                                preferences: {
                                  ...formData.preferences,
                                  maxHeight: feet * 12 + inches,
                          },
                        });
                            }
                      }}
                          placeholder="6'2&quot;"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>
              </div>
                </div>
                ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                    <div 
                      className="absolute h-2 bg-pink-600 rounded-full"
                      style={{ 
                        left: String(((user.preferences?.minHeight || 68) - 48) / (84 - 48) * 100) + '%',
                        width: String(((user.preferences?.maxHeight || 74) - (user.preferences?.minHeight || 68)) / (84 - 48) * 100) + '%'
                      }}
                    />
                </div>
                    <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm whitespace-nowrap">
                      {user.preferences?.minHeight 
                        ? (Math.floor(user.preferences.minHeight / 12) + "'" + (user.preferences.minHeight % 12) + '"')
                        : "5'8\""} - {user.preferences?.maxHeight 
                          ? (Math.floor(user.preferences.maxHeight / 12) + "'" + (user.preferences.maxHeight % 12) + '"')
                          : "6'2\""}
                    </span>
                </div>
                  )}
                </div>
                </div>
              )}
              </div>
              
        {/* Save Changes Button - Only show when editing */}
          {editing && (
              <button
                onClick={handleSave}
                disabled={saving}
            className="w-full py-4 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
            {saving ? 'Saving...' : 'Save Changes'}
              </button>
        )}

      </div>
      
      {/* Profile Share Modal */}
      {user && (
        <ProfileShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          profileId={user.gahoiId ? String(user.gahoiId) : user._id}
          profileName={user.name}
          profileUrl={getProfileUrl(user)}
          user={user}
        />
      )}
    </div>
  );
}
