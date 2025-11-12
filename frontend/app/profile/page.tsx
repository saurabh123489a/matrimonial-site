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
  const [loadingEducation, setLoadingEducation] = useState(false);
  const [loadingOccupation, setLoadingOccupation] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Only run on client side
    setMounted(true);
    
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadProfile();
    loadEducationOptions();
    loadOccupationOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const response = await metaDataApi.getOccupation();
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
          city: response.data.city || '',
          state: response.data.state || '',
          country: response.data.country || '',
          religion: response.data.religion || '',
          education: response.data.education || '',
          occupation: response.data.occupation || '',
          bio: response.data.bio || '',
          horoscopeDetails: {
            rashi: response.data.horoscopeDetails?.rashi || '',
            nakshatra: response.data.horoscopeDetails?.nakshatra || '',
            starSign: response.data.horoscopeDetails?.starSign || '',
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
        setUser(response.data);
        setEditing(false);
        setFieldErrors({});
        showSuccess(t('profile.profileUpdated'));
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || 'Failed to update profile';
      setError(errorMsg);
      showError(errorMsg);

      // Parse validation errors from backend
      if (errorData?.errors || errorData?.validationErrors) {
        const validationErrors: Record<string, string> = {};
        const errors = errorData.errors || errorData.validationErrors || {};
        
        // Handle Zod validation errors (array format)
        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            if (error.path && error.message) {
              validationErrors[error.path.join('.')] = error.message;
            }
          });
        } else if (typeof errors === 'object') {
          // Handle object format errors
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

  const handlePhotoUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    // Check max photos limit (3)
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
      throw err; // Re-throw to let PhotoUpload component handle it
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t('profile.myProfile')}</h1>
            <div className="flex items-center gap-3">
              {/* One-click Activate button at top - only show if inactive */}
              {!user.isActive && (
                <button
                  onClick={handleToggleActive}
                  disabled={togglingActive}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {togglingActive ? t('common.loading') : t('profile.activateProfile')}
                </button>
              )}
              {!editing && (
                <>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-4 py-2 bg-white text-pink-600 rounded-md hover:bg-gray-100 font-medium transition-colors"
                    title="Share Profile"
                  >
                    📤 Share
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-white text-pink-600 rounded-md hover:bg-gray-100"
                  >
                    {t('profile.editProfile')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 dark:bg-gray-800 dark:text-gray-100 transition-colors">

          {/* Profile Badges */}
          <div className="mb-6">
            <ProfileBadges user={user} showOnlineStatus={true} showLastSeen={true} />
          </div>

          {/* Profile Completeness Meter */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <ProfileCompletenessMeter user={user} />
          </div>

          {/* Profile Status Display */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-pink-200">{t('profile.profileStatus')}</p>
                <p className="text-sm text-gray-600 dark:text-pink-300" dir="auto">
                  {user.isActive 
                    ? t('profile.activeStatusDesc')
                    : t('profile.inactiveStatusDesc')}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isActive 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
              }`}>
                {user.isActive ? t('profile.active') : t('profile.inactive')}
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="mb-6 bg-white dark:bg-black p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-300 mb-4">
              {t('profile.photos')} ({t('profile.maxPhotos')})
            </h3>
            
            {/* Existing Photos Grid */}
            {(user.photos || []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {(user.photos || []).map((photo, index) => (
                  <div key={index} className="relative group">
                    <LazyImage
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 dark:border-pink-800"
                      placeholder="📷"
                    />
                    {photo.isPrimary && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        ⭐ {t('profile.primaryPhoto')}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                        {!photo.isPrimary && (
                          <button
                            onClick={() => handleSetPrimaryPhoto(index)}
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors shadow-lg"
                            title="Set as primary photo"
                          >
                            ⭐ Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePhoto(index)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-lg"
                          title="Delete photo"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Upload Component with Drag & Drop */}
            <PhotoUpload
              onUpload={handlePhotoUpload}
              maxPhotos={3}
              currentPhotoCount={user.photos?.length || 0}
              uploading={uploadingPhotos}
              disabled={editing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">{t('profile.name')}</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">{t('profile.email')}</label>
              {editing ? (
                <>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400 dark:bg-gray-900 dark:text-pink-100 ${
                      fieldErrors.email ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-pink-800'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.email || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">{t('profile.phone')}</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.phone || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">{t('profile.age')}</label>
              <p className="text-gray-900 dark:text-pink-100">{user.age || t('profile.notProvided')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Blood Group</label>
              {editing ? (
                <select
                  value={formData.bloodGroup || ''}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.bloodGroup || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Disability</label>
              {editing ? (
                <select
                  value={formData.disability || 'no'}
                  onChange={(e) => setFormData({ ...formData, disability: e.target.value as 'no' | 'yes' | 'not-specified' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                  <option value="not-specified">Not Specified</option>
                </select>
              ) : (
                <p className="text-gray-900 dark:text-pink-100 capitalize">{user.disability === 'no' ? 'No' : user.disability === 'yes' ? 'Yes' : 'Not Specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Profile Created By</label>
              {editing ? (
                <select
                  value={formData.profileCreatedBy || 'self'}
                  onChange={(e) => setFormData({ ...formData, profileCreatedBy: e.target.value as 'self' | 'family' | 'relative' | 'friend' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                >
                  <option value="self">Self</option>
                  <option value="family">Family</option>
                  <option value="relative">Relative</option>
                  <option value="friend">Friend</option>
                </select>
              ) : (
                <p className="text-gray-900 dark:text-pink-100 capitalize">{user.profileCreatedBy || 'Self'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-2">{t('profile.location')}</label>
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
                <div className="space-y-1 text-gray-900 dark:text-pink-100">
                  {user.country && <p><span className="font-medium dark:text-pink-200">{t('profile.country')}:</span> {user.country}</p>}
                  {user.state && <p><span className="font-medium dark:text-pink-200">{t('profile.state')}:</span> {user.state}</p>}
                  {user.city && <p><span className="font-medium dark:text-pink-200">{t('profile.city')}:</span> {user.city}</p>}
                  {user.town && <p><span className="font-medium dark:text-pink-200">Town:</span> {user.town}</p>}
                  {!user.country && !user.state && !user.city && <p>{t('profile.notProvided')}</p>}
                </div>
              )}
            </div>

            {editing && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Town/Village</label>
                  <input
                    type="text"
                    value={formData.town || ''}
                    onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                    placeholder="Enter town or village name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Present Address</label>
                  <textarea
                    value={formData.presentAddress || ''}
                    onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                    placeholder="Enter present address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Permanent Address</label>
                  <textarea
                    value={formData.permanentAddress || ''}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                    placeholder="Enter permanent address"
                  />
                </div>
              </>
            )}

            {!editing && (
              <>
                {user.presentAddress && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Present Address</label>
                    <p className="text-gray-900 dark:text-pink-100">{user.presentAddress}</p>
                  </div>
                )}
                {user.permanentAddress && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Permanent Address</label>
                    <p className="text-gray-900 dark:text-pink-100">{user.permanentAddress}</p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">WhatsApp Number</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                  placeholder="Enter WhatsApp number"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.whatsappNumber || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">{t('profile.religion')}</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.religion || ''}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.religion || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                {t('profile.education')}
                {loadingEducation && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-pink-400">(Loading...)</span>
                )}
              </label>
              {editing ? (
                <select
                  value={formData.education || ''}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  disabled={loadingEducation}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400 disabled:opacity-50"
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
                    : t('profile.notProvided')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Educational Detail</label>
              {editing ? (
                <select
                  value={formData.educationalDetail || ''}
                  onChange={(e) => setFormData({ ...formData, educationalDetail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                >
                  <option value="">Select</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Professional">Professional</option>
                </select>
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.educationalDetail || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                {t('profile.occupation')}
                {loadingOccupation && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-pink-400">(Loading...)</span>
                )}
              </label>
              {editing ? (
                <select
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  disabled={loadingOccupation}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400 disabled:opacity-50"
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
                    : t('profile.notProvided')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Profession</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.profession || ''}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                  placeholder="e.g., Computer Software Professional"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.profession || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Employer/Company</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.employer || ''}
                  onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                  placeholder="Company name"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.employer || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Occupation Detail</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.occupationDetail || ''}
                  onChange={(e) => setFormData({ ...formData, occupationDetail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                  placeholder="Detailed occupation information"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.occupationDetail || t('profile.notProvided')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Annual Income</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.annualIncome || ''}
                  onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                  placeholder="e.g., 25-30 lakh"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100">{user.annualIncome || t('profile.notProvided')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">{t('profile.bio')}</label>
              {editing ? (
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                  dir="auto"
                />
              ) : (
                <p className="text-gray-900 dark:text-pink-100" dir="auto">{user.bio || t('profile.noBio')}</p>
              )}
            </div>

            {/* Horoscope Details Section */}
            <div className="md:col-span-2 border-t border-gray-200 dark:border-pink-800 pt-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-300 mb-4">🔮 {t('profile.horoscopeDetails') || 'Horoscope Details'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                    {t('profile.rashi') || 'Rashi (Moon Sign)'}
                  </label>
                  {editing ? (
                    <select
                      value={formData.horoscopeDetails?.rashi || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        horoscopeDetails: {
                          ...formData.horoscopeDetails,
                          rashi: e.target.value,
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
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
                      {user.horoscopeDetails?.rashi || t('profile.notProvided')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                    {t('profile.nakshatra') || 'Nakshatra'}
                  </label>
                  {editing ? (
                    <select
                      value={formData.horoscopeDetails?.nakshatra || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        horoscopeDetails: {
                          ...formData.horoscopeDetails,
                          nakshatra: e.target.value,
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
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
                      {user.horoscopeDetails?.nakshatra || t('profile.notProvided')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                    {t('profile.starSign') || 'Star Sign'}
                  </label>
                  {editing ? (
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-pink-800 dark:bg-gray-900 dark:text-pink-100 rounded-md focus:outline-none focus:ring-pink-500 dark:focus:ring-pink-400"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-pink-100">
                      {user.horoscopeDetails?.starSign || t('profile.notProvided')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? t('profile.saving') : t('common.save')}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    city: user.city || '',
                    state: user.state || '',
                    country: user.country || '',
                    religion: user.religion || '',
                    education: user.education || '',
                    occupation: user.occupation || '',
                    bio: user.bio || '',
                    horoscopeDetails: {
                      rashi: user.horoscopeDetails?.rashi || '',
                      nakshatra: user.horoscopeDetails?.nakshatra || '',
                      starSign: user.horoscopeDetails?.starSign || '',
                    },
                  });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}

          {!editing && (
            <div className="mt-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300" dir="auto">
                  <strong>{t('profile.profileStatus')}:</strong> {user.isProfileComplete ? t('profile.complete') : t('profile.incomplete')}
                </p>
              </div>
            </div>
          )}

          {/* Deactivate Button at Bottom - Only show if active */}
          {!editing && user.isActive && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-pink-800">
              <button
                onClick={handleToggleActive}
                disabled={togglingActive}
                className="w-full px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50 font-semibold transition-colors"
              >
                {togglingActive ? t('common.loading') : t('profile.deactivateProfile')}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile Share Modal */}
      {user && (
        <ProfileShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          profileId={user._id}
          profileName={user.name}
          profileUrl={`/profiles/${user._id}`}
          user={user}
        />
      )}
    </div>
  );
}

