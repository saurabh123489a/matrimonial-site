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
import CustomDatePicker from '@/components/CustomDatePicker';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';
import { getProfileUrl, getProfileImageUrl } from '@/lib/profileUtils';

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
  const [salaryOptions, setSalaryOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingEducation, setLoadingEducation] = useState(false);
  const [loadingOccupation, setLoadingOccupation] = useState(false);
  const [loadingProfession, setLoadingProfession] = useState(false);
  const [loadingSalary, setLoadingSalary] = useState(false);
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
    loadSalaryOptions();
    
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

  const loadSalaryOptions = async () => {
    setLoadingSalary(true);
    try {
      const response = await metaDataApi.getSalary();
      if (response.status && response.data) {
        setSalaryOptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load salary options:', error);
    } finally {
      setLoadingSalary(false);
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
          horoscopeMatchMandatory: response.data.horoscopeMatchMandatory || false,
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

  // Client-side validation function
  const validateFormData = (data: UpdateUserDto): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Helper function to get field label
    const getFieldLabel = (fieldName: string): string => {
      const labels: Record<string, string> = {
        bio: 'Bio',
        height: 'Height',
        education: 'Education',
        occupation: 'Occupation',
        profession: 'Profession',
        annualIncome: 'Annual Income',
        city: 'City',
        state: 'State',
        country: 'Country',
        dateOfBirth: 'Date of Birth',
        age: 'Age',
      };
      return labels[fieldName] || fieldName;
    };
    
    // Validate bio length
    if (data.bio !== undefined && data.bio.length > 2000) {
      errors.bio = 'Bio must not exceed 2000 characters';
    }
    
    // Validate height (in inches, reasonable range: 36-96 inches / 3-8 feet)
    if (data.height !== undefined) {
      if (data.height < 36 || data.height > 96) {
        errors.height = 'Height must be between 3 feet (36 inches) and 8 feet (96 inches)';
      }
    }
    
    
    // Validate age (if provided)
    if (data.age !== undefined) {
      if (data.age < 18 || data.age > 100) {
        errors.age = 'Age must be between 18 and 100 years';
      }
    }
    
    // Validate date of birth
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        errors.dateOfBirth = 'Please enter a valid date';
      } else if (birthDate > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          errors.dateOfBirth = 'You must be at least 18 years old';
        }
        if (age > 100) {
          errors.dateOfBirth = 'Please enter a valid date of birth';
        }
      }
    }
    
    
    // Validate preferences age range
    if (data.preferences) {
      if (data.preferences.minAge !== undefined && (data.preferences.minAge < 18 || data.preferences.minAge > 100)) {
        errors['preferences.minAge'] = 'Minimum age must be between 18 and 100';
      }
      if (data.preferences.maxAge !== undefined && (data.preferences.maxAge < 18 || data.preferences.maxAge > 100)) {
        errors['preferences.maxAge'] = 'Maximum age must be between 18 and 100';
      }
      if (data.preferences.minAge !== undefined && data.preferences.maxAge !== undefined) {
        if (data.preferences.minAge > data.preferences.maxAge) {
          errors['preferences.minAge'] = 'Minimum age cannot be greater than maximum age';
          errors['preferences.maxAge'] = 'Maximum age cannot be less than minimum age';
        }
      }
      if (data.preferences.minHeight !== undefined && (data.preferences.minHeight < 36 || data.preferences.minHeight > 96)) {
        errors['preferences.minHeight'] = 'Minimum height must be between 36 and 96 inches';
      }
      if (data.preferences.maxHeight !== undefined && (data.preferences.maxHeight < 36 || data.preferences.maxHeight > 96)) {
        errors['preferences.maxHeight'] = 'Maximum height must be between 36 and 96 inches';
      }
      if (data.preferences.minHeight !== undefined && data.preferences.maxHeight !== undefined) {
        if (data.preferences.minHeight > data.preferences.maxHeight) {
          errors['preferences.minHeight'] = 'Minimum height cannot be greater than maximum height';
          errors['preferences.maxHeight'] = 'Maximum height cannot be less than minimum height';
        }
      }
    }
    
    return errors;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setFieldErrors({});

    try {
      // Exclude name, phone, and email from updates (non-editable fields)
      const { name, phone, email, ...updateData } = formData;
      
      // Client-side validation
      const validationErrors = validateFormData(updateData);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setError('Please fix the errors in the form before saving');
        showError('Please fix the errors in the form before saving');
        setSaving(false);
        return;
      }
      
      const response = await userApi.updateMe(updateData);
      if (response.status) {
        
        await loadProfile();
        setEditing(false);
        setEditingHoroscope(false);
        setFieldErrors({});
        showSuccess(t('profile.profileUpdated'));
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      
      // Handle validation errors with user-friendly messages
      if (errorData?.errors || errorData?.validationErrors) {
        const validationErrors: Record<string, string> = {};
        const errors = errorData.errors || errorData.validationErrors || {};
        
        // Helper function to convert field names to user-friendly labels
        const getFieldLabel = (fieldName: string): string => {
          const labels: Record<string, string> = {
            bio: 'Bio',
            height: 'Height',
            education: 'Education',
            occupation: 'Occupation',
            profession: 'Profession',
            annualIncome: 'Annual Income',
            city: 'City',
            state: 'State',
            country: 'Country',
            dateOfBirth: 'Date of Birth',
            age: 'Age',
            partnerPreference: 'Partner Preference',
            'preferences.minAge': 'Minimum Age',
            'preferences.maxAge': 'Maximum Age',
            'preferences.minHeight': 'Minimum Height',
            'preferences.maxHeight': 'Maximum Height',
          };
          return labels[fieldName] || fieldName;
        };
        
        // Helper function to convert error messages to user-friendly format
        const getUserFriendlyError = (error: any, fieldName: string): string => {
          const fieldLabel = getFieldLabel(fieldName);
          
          // Handle Zod validation errors
          if (error.code === 'invalid_enum_value') {
            return `${fieldLabel} must be one of the allowed values`;
          }
          
          if (error.code === 'invalid_type') {
            if (error.expected === 'string' && error.received === 'undefined') {
              return `${fieldLabel} is required`;
            }
            return `${fieldLabel} has an invalid format`;
          }
          
          if (error.code === 'too_small') {
            if (error.type === 'string' && error.minimum) {
              return `${fieldLabel} must be at least ${error.minimum} characters`;
            }
            if (error.type === 'number' && error.minimum) {
              return `${fieldLabel} must be at least ${error.minimum}`;
            }
          }
          
          if (error.code === 'too_big') {
            if (error.type === 'string' && error.maximum) {
              return `${fieldLabel} must not exceed ${error.maximum} characters`;
            }
            if (error.type === 'number' && error.maximum) {
              return `${fieldLabel} must not exceed ${error.maximum}`;
            }
          }
          
          if (error.code === 'invalid_string') {
            if (error.validation === 'email') {
              return 'Please enter a valid email address';
            }
            if (error.validation === 'regex') {
              return `${fieldLabel} format is invalid`;
            }
          }
          
          // Use the error message if available
          if (error.message) {
            let message = error.message
              .replace(/Invalid enum value\. Expected/, 'Please select')
              .replace(/received/, 'you entered')
              .replace(/Expected/, 'Expected')
              .replace(/Invalid/, 'Invalid');
            return message;
          }
          
          return `${fieldLabel} is invalid`;
        };
        
        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              const fieldName = error.path.join('.');
              validationErrors[fieldName] = getUserFriendlyError(error, fieldName);
            }
          });
        } else if (typeof errors === 'object') {
          Object.keys(errors).forEach((key) => {
            const errorValue = errors[key];
            if (typeof errorValue === 'string') {
              validationErrors[key] = errorValue;
            } else if (Array.isArray(errorValue) && errorValue.length > 0) {
              const firstError = errorValue[0];
              if (typeof firstError === 'object' && firstError.message) {
                validationErrors[key] = getUserFriendlyError(firstError, key);
              } else {
                validationErrors[key] = firstError;
              }
            } else if (typeof errorValue === 'object' && errorValue.message) {
              validationErrors[key] = getUserFriendlyError(errorValue, key);
            }
          });
        }
        
        if (Object.keys(validationErrors).length > 0) {
          setFieldErrors(validationErrors);
          const errorFields = Object.keys(validationErrors);
          if (errorFields.length === 1) {
            setError(`Please fix the error in ${getFieldLabel(errorFields[0])}`);
            showError(`Please fix the error in ${getFieldLabel(errorFields[0])}`);
          } else {
            setError('Please fix the errors in the form fields');
            showError('Please fix the errors in the form fields');
          }
        } else {
          const errorMsg = errorData?.message || 'Failed to update profile';
          setError(errorMsg);
          showError(errorMsg);
        }
      } else {
        // Handle non-validation errors
        const errorMsg = errorData?.message || 'Failed to update profile';
        setError(errorMsg);
        showError(errorMsg);
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#800020]"></div>
          <p className="mt-4 text-[#800020]">{t('common.loading')}</p>
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
    <div className="min-h-screen bg-white">
      {/* Header - Mobile First Design */}
      <div className="bg-[]">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <button
            onClick={() => {
              if (editing) {
                setEditing(false);
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  city: user?.city || '',
                  state: user?.state || '',
                  country: user?.country || '',
                  education: user?.education || '',
                  occupation: user?.occupation || '',
                  bio: user?.bio || '',
                  height: user?.height || undefined,
                  diet: (user?.diet as 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | undefined) || undefined,
                  hobbies: user?.hobbies || [],
                  preferences: {
                    minAge: user?.preferences?.minAge || undefined,
                    maxAge: user?.preferences?.maxAge || undefined,
                    minHeight: user?.preferences?.minHeight || undefined,
                    maxHeight: user?.preferences?.maxHeight || undefined,
                  },
                  horoscopeMatchMandatory: user?.horoscopeMatchMandatory || false,
                  dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                  family: {
                    fathersName: user?.family?.fathersName || '',
                    fathersOccupationType: user?.family?.fathersOccupationType || undefined,
                    fathersOccupationDesc: user?.family?.fathersOccupationDesc || '',
                    fathersContactNumber: user?.family?.fathersContactNumber || '',
                    mothersName: user?.family?.mothersName || '',
                    mothersOccupationType: user?.family?.mothersOccupationType || undefined,
                    mothersOccupationDesc: user?.family?.mothersOccupationDesc || '',
                    numberOfBrothers: user?.family?.numberOfBrothers || 0,
                    numberOfSisters: user?.family?.numberOfSisters || 0,
                    marriedBrothers: user?.family?.marriedBrothers || 0,
                    unmarriedBrothers: user?.family?.unmarriedBrothers || 0,
                    marriedSisters: user?.family?.marriedSisters || 0,
                    unmarriedSisters: user?.family?.unmarriedSisters || 0,
                    familyType: user?.family?.familyType || 'nuclear',
                    familyStatus: user?.family?.familyStatus || 'middle-class',
                    familyValues: user?.family?.familyValues || 'moderate',
                  },
                  horoscopeDetails: {
                    rashi: user?.horoscopeDetails?.rashi || '',
                    nakshatra: user?.horoscopeDetails?.nakshatra || '',
                    starSign: user?.horoscopeDetails?.starSign || '',
                    timeOfBirth: user?.horoscopeDetails?.timeOfBirth || '',
                  },
                });
              } else {
                router.back();
              }
            }}
            aria-label={editing ? 'Cancel editing and discard changes' : 'Go back'}
            className="p-2 -ml-2 text-white hover:bg-[#800020]/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-white">
            {editing ? 'Edit Profile' : t('profile.myProfile')}
          </h1>
          <div className="flex items-center gap-1">
            {/* Share Button - Always visible */}
            <button
              onClick={() => setShowShareModal(true)}
              aria-label="Share profile"
              className="p-2 sm:p-2 min-w-[44px] min-h-[44px] text-white hover:bg-[#800020]/20 active:bg-[#800020]/30 rounded-lg transition-colors touch-manipulation"
              title="Share profile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {/* Active Status Toggle - Always visible */}
            <button
              onClick={handleToggleActive}
              disabled={togglingActive}
              aria-label={user.isActive ? 'Deactivate profile' : 'Activate profile'}
              className={`p-2 sm:p-2 min-w-[44px] min-h-[44px] text-white hover:bg-[#800020]/20 active:bg-[#800020]/30 rounded-lg transition-colors relative touch-manipulation ${
                togglingActive ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={user.isActive ? 'Profile is active - Click to deactivate' : 'Profile is inactive - Click to activate'}
            >
              {togglingActive ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </button>

            {/* Edit Button - Always visible */}
            {!editing ? (
              <button
                onClick={() => {
                  // Ensure user data is loaded before entering edit mode
                  if (!user) {
                    showError('Profile data not loaded. Please refresh the page.');
                    return;
                  }
                  // Sync formData with current user data before entering edit mode
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    whatsappNumber: user.whatsappNumber || '',
                    city: user.city || '',
                    state: user.state || '',
                    country: user.country || '',
                    town: user.town || '',
                    presentAddress: user.presentAddress || '',
                    permanentAddress: user.permanentAddress || '',
                    education: user.education || '',
                    educationalDetail: user.educationalDetail || '',
                    occupation: user.occupation || '',
                    profession: user.profession || '',
                    employer: user.employer || '',
                    annualIncome: user.annualIncome || '',
                    bio: user.bio || '',
                    height: user.height || undefined,
                    diet: (user.diet as 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | undefined) || undefined,
                    hobbies: user.hobbies || [],
                    preferences: {
                      minAge: user.preferences?.minAge || undefined,
                      maxAge: user.preferences?.maxAge || undefined,
                      minHeight: user.preferences?.minHeight || undefined,
                      maxHeight: user.preferences?.maxHeight || undefined,
                    },
                    horoscopeMatchMandatory: user.horoscopeMatchMandatory || false,
                    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                    family: {
                      fathersName: user.family?.fathersName || '',
                      fathersOccupationType: user.family?.fathersOccupationType || undefined,
                      fathersOccupationDesc: user.family?.fathersOccupationDesc || '',
                      fathersContactNumber: user.family?.fathersContactNumber || '',
                      mothersName: user.family?.mothersName || '',
                      mothersOccupationType: user.family?.mothersOccupationType || undefined,
                      mothersOccupationDesc: user.family?.mothersOccupationDesc || '',
                      numberOfBrothers: user.family?.numberOfBrothers || 0,
                      numberOfSisters: user.family?.numberOfSisters || 0,
                      marriedBrothers: user.family?.marriedBrothers || 0,
                      unmarriedBrothers: user.family?.unmarriedBrothers || 0,
                      marriedSisters: user.family?.marriedSisters || 0,
                      unmarriedSisters: user.family?.unmarriedSisters || 0,
                      familyType: user.family?.familyType || 'nuclear',
                      familyStatus: user.family?.familyStatus || 'middle-class',
                      familyValues: user.family?.familyValues || 'moderate',
                    },
                    horoscopeDetails: {
                      rashi: user.horoscopeDetails?.rashi || '',
                      nakshatra: user.horoscopeDetails?.nakshatra || '',
                      starSign: user.horoscopeDetails?.starSign || '',
                      timeOfBirth: user.horoscopeDetails?.timeOfBirth || '',
                    },
                  });
                  setEditing(true);
                  setFieldErrors({});
                  setError('');
                  // Auto-expand sections when entering edit mode
                  setExpandedSections({
                    aboutMe: true,
                    contact: true,
                    location: true,
                    education: true,
                    lifestyle: true,
                    family: true,
                    horoscope: false,
                    partnerPreferences: true,
                  });
                }}
                aria-label="Edit profile"
                className="p-2 sm:p-2 min-w-[44px] min-h-[44px] text-white hover:bg-[#800020]/20 active:bg-[#800020]/30 rounded-lg transition-colors flex items-center justify-center touch-manipulation"
                title="Edit profile"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    city: user?.city || '',
                    state: user?.state || '',
                    country: user?.country || '',
                    education: user?.education || '',
                    occupation: user?.occupation || '',
                    bio: user?.bio || '',
                    height: user?.height || undefined,
                    diet: (user?.diet as 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | undefined) || undefined,
                    hobbies: user?.hobbies || [],
                    preferences: {
                      minAge: user?.preferences?.minAge || undefined,
                      maxAge: user?.preferences?.maxAge || undefined,
                      minHeight: user?.preferences?.minHeight || undefined,
                      maxHeight: user?.preferences?.maxHeight || undefined,
                    },
                    horoscopeMatchMandatory: user?.horoscopeMatchMandatory || false,
                    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                    family: {
                      fathersName: user?.family?.fathersName || '',
                      fathersOccupationType: user?.family?.fathersOccupationType || undefined,
                      fathersOccupationDesc: user?.family?.fathersOccupationDesc || '',
                      fathersContactNumber: user?.family?.fathersContactNumber || '',
                      mothersName: user?.family?.mothersName || '',
                      mothersOccupationType: user?.family?.mothersOccupationType || undefined,
                      mothersOccupationDesc: user?.family?.mothersOccupationDesc || '',
                      numberOfBrothers: user?.family?.numberOfBrothers || 0,
                      numberOfSisters: user?.family?.numberOfSisters || 0,
                      marriedBrothers: user?.family?.marriedBrothers || 0,
                      unmarriedBrothers: user?.family?.unmarriedBrothers || 0,
                      marriedSisters: user?.family?.marriedSisters || 0,
                      unmarriedSisters: user?.family?.unmarriedSisters || 0,
                      familyType: user?.family?.familyType || 'nuclear',
                      familyStatus: user?.family?.familyStatus || 'middle-class',
                      familyValues: user?.family?.familyValues || 'moderate',
                    },
                    horoscopeDetails: {
                      rashi: user?.horoscopeDetails?.rashi || '',
                      nakshatra: user?.horoscopeDetails?.nakshatra || '',
                      starSign: user?.horoscopeDetails?.starSign || '',
                      timeOfBirth: user?.horoscopeDetails?.timeOfBirth || '',
                    },
                  });
                }}
                aria-label="Cancel editing"
                className="p-2 sm:p-2 min-w-[44px] min-h-[44px] text-white hover:bg-[#800020]/20 active:bg-[#800020]/30 rounded-lg transition-colors touch-manipulation"
                title="Cancel editing"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Error Display */}
        {error && (
          <div className="rounded-xl bg-red-50">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                {Object.keys(fieldErrors).length > 0 && (
                  <p className="text-xs text-red-600">
                    Please check the fields marked in red below
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Photos Section - Matching Image Design */}
        <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Main Profile Photo */}
          <div className="relative flex-shrink-0">
            <div className="relative w-32 h-40 rounded-xl overflow-hidden">
              <LazyImage
                src={getProfileImageUrl(user)}
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
                  aria-label="Upload profile photo"
                  className="absolute bottom-2 right-2 w-8 h-8 bg-[#800020]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
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
                className="w-full h-19 rounded-lg border-2 border-dashed border-gray-300"
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
        <div className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#800020]">Profile Completion</span>
            <span className="text-sm font-semibold text-[#800020]">
              {user.isProfileComplete ? '100%' : '80%'}
            </span>
          </div>
          <div className="w-full bg-gray-200">
            <div 
              className="bg-[#800020]"
              style={{ width: user.isProfileComplete ? '100%' : '80%' }}
            />
          </div>
          </div>

        {/* About Me Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, aboutMe: !expandedSections.aboutMe })}
            aria-expanded={expandedSections.aboutMe}
            aria-controls="about-me-section"
            aria-label={`${expandedSections.aboutMe ? 'Collapse' : 'Expand'} About Me section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">About Me</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.aboutMe ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.aboutMe && (
            <div id="about-me-section" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-[#800020]">Full Name <span className="text-red-500">*</span></label>
              {editing ? (
                <input
                  type="text"
                  value={user.name || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300"
                />
              ) : (
                <p className="text-[#800020]">{user.name}</p>
              )}
            </div>

              {/* Age */}
            <div>
                <label className="block text-sm font-medium text-[#800020]">Age <span className="text-red-500">*</span></label>
              {editing ? (
                  <input
                    type="number"
                    value={user.age || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300"
                  />
                ) : (
                  <p className="text-[#800020]">{user.age || 'Not provided'}</p>
              )}
            </div>

              {/* Height */}
            <div>
                <label className="block text-sm font-medium text-[#800020]">Height</label>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={formData.height ? `${Math.floor(formData.height / 12)}'${formData.height % 12}"` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Try multiple formats: 5'6", 5'6, 5 6, 66 (inches only)
                      let heightInInches: number | undefined = undefined;
                      
                      // Format: 5'6" or 5'6
                      const match1 = value.match(/(\d+)'(\d+)/);
                      if (match1) {
                        const feet = parseInt(match1[1]);
                        const inches = parseInt(match1[2]);
                        if (feet >= 0 && feet <= 8 && inches >= 0 && inches < 12) {
                          heightInInches = feet * 12 + inches;
                        }
                      }
                      // Format: 5 6 (space separated)
                      else if (value.match(/^\d+\s+\d+$/)) {
                        const parts = value.split(/\s+/);
                        const feet = parseInt(parts[0]);
                        const inches = parseInt(parts[1]);
                        if (feet >= 0 && feet <= 8 && inches >= 0 && inches < 12) {
                          heightInInches = feet * 12 + inches;
                        }
                      }
                      // Format: just inches (e.g., 66)
                      else if (value.match(/^\d+$/)) {
                        const totalInches = parseInt(value);
                        if (totalInches >= 0 && totalInches <= 96) {
                          heightInInches = totalInches;
                        }
                      }
                      // Empty value
                      else if (value === '') {
                        heightInInches = undefined;
                      }
                      
                      if (heightInInches !== undefined || value === '') {
                        setFormData({ ...formData, height: heightInInches });
                        if (fieldErrors.height) {
                          const newErrors = { ...fieldErrors };
                          delete newErrors.height;
                          setFieldErrors(newErrors);
                        }
                      }
                    }}
                    placeholder="5'6&quot; or 5 6 or 66"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 touch-manipulation ${
                      fieldErrors.height 
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-[#800020] focus:border-[#800020]'
                    }`}
                  />
                  {fieldErrors.height && (
                    <p className="mt-1 text-sm text-red-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {fieldErrors.height}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[#800020]">
                    {user.height ? `${Math.floor(user.height / 12)}'${user.height % 12}"` : 'Not provided'}
                </p>
              )}
            </div>

              {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-[#800020]">Bio</label>
              {editing ? (
                  <>
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, bio: sanitizeFormInput(e.target.value, 'textarea') });
                        if (fieldErrors.bio) {
                          const newErrors = { ...fieldErrors };
                          delete newErrors.bio;
                          setFieldErrors(newErrors);
                        }
                      }}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 touch-manipulation ${
                        fieldErrors.bio 
                          ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-[#800020] focus:border-[#800020]'
                      }`}
                      placeholder="A software engineer with a passion for travel and classical dance. Looking for a partner who values family, honesty, and a good sense of humor."
                    />
                    {fieldErrors.bio && (
                      <p className="mt-1 text-sm text-red-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.bio}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      {(formData.bio || '').length}/2000 characters
                    </p>
                  </>
              ) : (
                  <p className="text-[#800020]">{user.bio || 'No bio provided'}</p>
              )}
            </div>
                </div>
          )}
                  </div>

        {/* Contact Information Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, contact: !expandedSections.contact })}
            aria-expanded={expandedSections.contact}
            aria-controls="contact-section"
            aria-label={`${expandedSections.contact ? 'Collapse' : 'Expand'} Contact Information section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">Contact Information</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.contact ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.contact && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#800020]">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={user.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300"
                  />
                ) : (
                  <p className="text-[#800020]">{user.email || 'Not provided'}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#800020]">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={user.phone || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300"
                  />
                ) : (
                  <p className="text-[#800020]">{user.phone || 'Not provided'}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-[#800020]">WhatsApp Number</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: sanitizeFormInput(e.target.value, 'phone') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-[#800020] touch-manipulation"
                    placeholder="Enter WhatsApp number"
                  />
                ) : (
                  <p className="text-[#800020]">{user.whatsappNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Location Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, location: !expandedSections.location })}
            aria-expanded={expandedSections.location}
            aria-controls="location-section"
            aria-label={`${expandedSections.location ? 'Collapse' : 'Expand'} Location section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">Location</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.location ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.location && (
            <div id="location-section" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
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
                <div className="space-y-2 text-[#800020]">
                  {user.country && <p><span className="font-medium text-[#800020]">Country:</span> <span className="text-[#800020]">{user.country}</span></p>}
                  {user.state && <p><span className="font-medium text-[#800020]">State:</span> <span className="text-[#800020]">{user.state}</span></p>}
                  {user.city && <p><span className="font-medium text-[#800020]">City:</span> <span className="text-[#800020]">{user.city}</span></p>}
                  {user.town && <p><span className="font-medium text-[#800020]">Town:</span> <span className="text-[#800020]">{user.town}</span></p>}
                  {!user.country && !user.state && !user.city && <p className="text-muted">Not provided</p>}
                </div>
              )}
              
              {editing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Town/Village</label>
                    <input
                      type="text"
                      value={formData.town || ''}
                      onChange={(e) => setFormData({ ...formData, town: sanitizeFormInput(e.target.value, 'text') })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] touch-manipulation"
                      placeholder="Enter town or village name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Present Address</label>
                    <textarea
                      value={formData.presentAddress || ''}
                      onChange={(e) => setFormData({ ...formData, presentAddress: sanitizeFormInput(e.target.value, 'textarea') })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300"
                      placeholder="Enter present address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Permanent Address</label>
                    <textarea
                      value={formData.permanentAddress || ''}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: sanitizeFormInput(e.target.value, 'textarea') })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300"
                      placeholder="Enter permanent address"
                    />
                  </div>
                </>
              )}
              
              {!editing && (
                <>
                  {user.presentAddress && (
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Present Address</label>
                      <p className="text-[#800020]">{user.presentAddress}</p>
                    </div>
                  )}
                  {user.permanentAddress && (
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Permanent Address</label>
                      <p className="text-[#800020]">{user.permanentAddress}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Education & Career Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, education: !expandedSections.education })}
            aria-expanded={expandedSections.education}
            aria-controls="education-section"
            aria-label={`${expandedSections.education ? 'Collapse' : 'Expand'} Education & Career section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">Education & Career</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.education ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.education && (
            <div id="education-section" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Education <span className="text-red-500">*</span>
                  {loadingEducation && (
                    <span className="ml-2 text-xs text-muted">(Loading...)</span>
                  )}
                </label>
                {editing ? (
                  <select
                    value={formData.education || ''}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    disabled={loadingEducation}
                    className="w-full px-3 py-2 border border-gray-300"
                  >
                    <option value="">Select Education</option>
                    {educationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[#800020]">
                    {user.education 
                      ? educationOptions.find(opt => opt.value === user.education)?.label || user.education
                      : 'Not provided'}
                  </p>
                )}
              </div>

              {/* Educational Detail */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Educational Detail</label>
                {editing ? (
                  <select
                    value={formData.educationalDetail || ''}
                    onChange={(e) => setFormData({ ...formData, educationalDetail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300"
                  >
                    <option value="">Select</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Professional">Professional</option>
                  </select>
                ) : (
                  <p className="text-[#800020]">{user.educationalDetail || 'Not provided'}</p>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Occupation <span className="text-red-500">*</span>
                  {loadingOccupation && (
                    <span className="ml-2 text-xs text-muted">(Loading...)</span>
                  )}
                </label>
                {editing ? (
                  <select
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    disabled={loadingOccupation}
                    className="w-full px-3 py-2 border border-gray-300"
                  >
                    <option value="">Select Occupation</option>
                    {occupationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[#800020]">
                    {user.occupation 
                      ? occupationOptions.find(opt => opt.value === user.occupation)?.label || user.occupation
                      : 'Not provided'}
                  </p>
                )}
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Profession</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.profession || ''}
                    onChange={(e) => setFormData({ ...formData, profession: sanitizeFormInput(e.target.value, 'text') })}
                    className="w-full px-3 py-2 border border-gray-300"
                    placeholder="e.g., Computer Software Professional"
                  />
                ) : (
                  <p className="text-[#800020]">{user.profession || 'Not provided'}</p>
                )}
              </div>

              {/* Employer/Company */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Employer/Company</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.employer || ''}
                    onChange={(e) => setFormData({ ...formData, employer: sanitizeFormInput(e.target.value, 'text') })}
                    className="w-full px-3 py-2 border border-gray-300"
                    placeholder="Company name"
                  />
                ) : (
                  <p className="text-[#800020]">{user.employer || 'Not provided'}</p>
                )}
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Annual Income</label>
                {editing ? (
                  <select
                    value={formData.annualIncome || ''}
                    onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                    disabled={loadingSalary}
                    className="w-full px-3 py-2 border border-gray-300"
                  >
                    <option value="">Select Annual Income</option>
                    {salaryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[#800020]">{user.annualIncome || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lifestyle & Interests Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, lifestyle: !expandedSections.lifestyle })}
            aria-expanded={expandedSections.lifestyle}
            aria-controls="lifestyle-section"
            aria-label={`${expandedSections.lifestyle ? 'Collapse' : 'Expand'} Lifestyle & Interests section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">Lifestyle & Interests</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.lifestyle ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.lifestyle && (
            <div id="lifestyle-section" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              {/* Dietary Preferences */}
            <div>
                <label className="block text-sm font-medium text-secondary mb-3">Dietary Preferences</label>
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
                            ? 'bg-[#800020]'
                            : 'bg-gray-200'
                        } ${!editing ? 'cursor-default' : 'cursor-pointer hover:bg-[#800020]/10'}`}
                      >
                        {option === 'non-vegetarian' ? 'Non-Veg' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    );
                  })}
            </div>
                {!editing && user.diet && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#800020]">
                      {user.diet === 'non-vegetarian' ? 'Non-Veg' : user.diet.charAt(0).toUpperCase() + user.diet.slice(1)}
                    </span>
            </div>
              )}
            </div>

              {/* Hobbies & Interests */}
            <div>
                <label className="block text-sm font-medium text-secondary mb-3">Hobbies & Interests</label>
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
                            ? 'bg-[#800020]'
                            : 'bg-gray-200'
                        } ${!editing ? 'cursor-default' : 'cursor-pointer hover:bg-[#800020]/10'}`}
                      >
                        {hobby}
                      </button>
                    );
                  })}
                  {editing && (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-gray-300"
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
                        className="px-4 py-2 rounded-full text-sm font-medium bg-[#800020]"
                      >
                        {hobby}
                      </span>
                    ))}
                    {(!user.hobbies || user.hobbies.length === 0) && (
                      <span className="text-muted text-sm">No hobbies listed</span>
              )}
            </div>
              )}
            </div>
              </div>
                  )}
                </div>

        {/* Family Information Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, family: !expandedSections.family })}
            aria-expanded={expandedSections.family}
            aria-controls="family-section"
            aria-label={`${expandedSections.family ? 'Collapse' : 'Expand'} Family Information section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">👨‍👩‍👧‍👦 Family Information</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.family ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.family && (
            <div id="family-section" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Father's Name</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                      placeholder="Enter father's name"
                    />
                  ) : (
                    <p className="text-[#800020]">{user.family?.fathersName || 'Not provided'}</p>
                  )}
                </div>

                {/* Father's Occupation Type */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Father's Occupation Type</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                    >
                      <option value="">Select Type</option>
                      <option value="job">Job</option>
                      <option value="private">Private</option>
                      <option value="govt">Government</option>
                      <option value="business">Business</option>
                    </select>
                  ) : (
                    <p className="text-[#800020]">
                      {user.family?.fathersOccupationType 
                        ? user.family.fathersOccupationType.charAt(0).toUpperCase() + user.family.fathersOccupationType.slice(1)
                        : 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Father's Occupation Description */}
                {editing && formData.family?.fathersOccupationType && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">Father's Occupation Description</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                      placeholder={`Enter ${formData.family.fathersOccupationType} details`}
                    />
                  </div>
                )}

                {!editing && user.family?.fathersOccupationDesc && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">Father's Occupation Description</label>
                    <p className="text-[#800020]">{user.family.fathersOccupationDesc}</p>
                  </div>
                )}

                {/* Father's Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Father's Contact Number</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                      placeholder="Enter contact number"
                    />
                  ) : (
                    <p className="text-[#800020]">{user.family?.fathersContactNumber || 'Not provided'}</p>
                  )}
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Mother's Name</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                      placeholder="Enter mother's name"
                    />
                  ) : (
                    <p className="text-[#800020]">{user.family?.mothersName || 'Not provided'}</p>
                  )}
                </div>

                {/* Mother's Occupation Type */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Mother's Occupation Type</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                    >
                      <option value="">Select Type</option>
                      <option value="job">Job</option>
                      <option value="private">Private</option>
                      <option value="govt">Government</option>
                      <option value="business">Business</option>
                    </select>
                  ) : (
                    <p className="text-[#800020]">
                      {user.family?.mothersOccupationType 
                        ? user.family.mothersOccupationType.charAt(0).toUpperCase() + user.family.mothersOccupationType.slice(1)
                        : 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Mother's Occupation Description */}
                {editing && formData.family?.mothersOccupationType && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">Mother's Occupation Description</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                      placeholder={`Enter ${formData.family.mothersOccupationType} details`}
                    />
                  </div>
                )}

                {!editing && user.family?.mothersOccupationDesc && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">Mother's Occupation Description</label>
                    <p className="text-[#800020]">{user.family.mothersOccupationDesc}</p>
                  </div>
                )}

                {/* Siblings Information */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Number of Brothers</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                    />
                  ) : (
                    <p className="text-[#800020]">{user.family?.numberOfBrothers || 0}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Number of Sisters</label>
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
                      className="w-full px-3 py-2 border border-gray-300"
                    />
                  ) : (
                    <p className="text-[#800020]">{user.family?.numberOfSisters || 0}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Horoscope Details Section - Collapsible */}
        <div className="bg-white">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, horoscope: !expandedSections.horoscope })}
            aria-expanded={expandedSections.horoscope}
            aria-controls="horoscope-section"
            aria-label={`${expandedSections.horoscope ? 'Collapse' : 'Expand'} Horoscope Details section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">🔮 Horoscope Details</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.horoscope ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.horoscope && (
            <div id="horoscope-section" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              {/* Date of Birth */}
              {editing ? (
                <CustomDatePicker
                  label="Date of Birth"
                  value={typeof formData.dateOfBirth === 'string' ? formData.dateOfBirth : (formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString().split('T')[0] : '')}
                  onChange={(e) => {
                    setFormData({ ...formData, dateOfBirth: e.target.value });
                    if (fieldErrors.dateOfBirth) {
                      const newErrors = { ...fieldErrors };
                      delete newErrors.dateOfBirth;
                      setFieldErrors(newErrors);
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  error={fieldErrors.dateOfBirth}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Date of Birth</label>
                  <p className="text-[#800020]">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              )}

              {/* Time of Birth */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Time of Birth (HH:MM:SS)</label>
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
                    className="w-full px-3 py-2 border border-gray-300"
                    placeholder="HH:MM:SS"
                  />
                ) : (
                  <p className="text-[#800020]">
                    {user.horoscopeDetails?.timeOfBirth || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Rashi */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Rashi (Moon Sign)</label>
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
                    className="w-full px-3 py-2 border border-gray-300"
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
                  <p className="text-[#800020]">
                    {user.horoscopeDetails?.rashi || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Nakshatra */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Nakshatra</label>
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
                    className="w-full px-3 py-2 border border-gray-300"
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
                  <p className="text-[#800020]">
                    {user.horoscopeDetails?.nakshatra || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Star Sign */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Star Sign</label>
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
                    className="w-full px-3 py-2 border border-gray-300"
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-[#800020]">
                    {user.horoscopeDetails?.starSign || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Partner Preferences Section - Collapsible */}
        <div className="bg-white">
          <button
            onClick={() => setExpandedSections({ ...expandedSections, partnerPreferences: !expandedSections.partnerPreferences })}
            aria-expanded={expandedSections.partnerPreferences}
            aria-controls="partner-preferences-section"
            aria-label={`${expandedSections.partnerPreferences ? 'Collapse' : 'Expand'} Partner Preferences section`}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#800020]">Partner Preferences</h2>
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${expandedSections.partnerPreferences ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.partnerPreferences && (
            <div id="partner-preferences-section" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              {/* Age Range */}
                <div>
                <label className="block text-sm font-medium text-secondary mb-3">
                  Age Range
                  <span className="ml-2 text-pink-600">
                    {formData.preferences?.minAge || user.preferences?.minAge || 28} - {formData.preferences?.maxAge || user.preferences?.maxAge || 34}
                  </span>
                </label>
                  {editing ? (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-muted mb-1">Min Age</label>
                    <input
                          type="number"
                          min="18"
                          max="100"
                          value={formData.preferences?.minAge || user.preferences?.minAge || 28}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                            preferences: {
                              ...formData.preferences,
                              minAge: parseInt(e.target.value) || undefined,
                        },
                      });
                        if (fieldErrors['preferences.minAge']) {
                          const newErrors = { ...fieldErrors };
                          delete newErrors['preferences.minAge'];
                          setFieldErrors(newErrors);
                        }
                      }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            fieldErrors['preferences.minAge'] 
                              ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300'
                          }`}
                    />
                    {fieldErrors['preferences.minAge'] && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors['preferences.minAge']}
                      </p>
                    )}
                </div>
                      <div className="flex-1">
                        <label className="block text-xs text-muted mb-1">Max Age</label>
                    <input
                          type="number"
                          min="18"
                          max="100"
                          value={formData.preferences?.maxAge || user.preferences?.maxAge || 34}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                            preferences: {
                              ...formData.preferences,
                              maxAge: parseInt(e.target.value) || undefined,
                        },
                      });
                        if (fieldErrors['preferences.maxAge']) {
                          const newErrors = { ...fieldErrors };
                          delete newErrors['preferences.maxAge'];
                          setFieldErrors(newErrors);
                        }
                      }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            fieldErrors['preferences.maxAge'] 
                              ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300'
                          }`}
                    />
                    {fieldErrors['preferences.maxAge'] && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors['preferences.maxAge']}
                      </p>
                    )}
                </div>
                </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200">
                      <div 
                        className="absolute h-2 bg-[#800020]"
                        style={{ 
                          left: `${((user.preferences?.minAge || 28) - 18) / (100 - 18) * 100}%`,
                          width: `${((user.preferences?.maxAge || 34) - (user.preferences?.minAge || 28)) / (100 - 18) * 100}%`
                        }}
                    />
                  </div>
                    <span className="text-[#800020]">
                      {user.preferences?.minAge || 28} - {user.preferences?.maxAge || 34}
                    </span>
                  </div>
                )}
            </div>

              {/* Height Range */}
                <div>
                <label className="block text-sm font-medium text-secondary mb-3">
                  Height Range
                  <span className="ml-2 text-pink-600">
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
                        <label className="block text-xs text-muted mb-1">Min Height</label>
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
                            if (fieldErrors['preferences.minHeight']) {
                              const newErrors = { ...fieldErrors };
                              delete newErrors['preferences.minHeight'];
                              setFieldErrors(newErrors);
                            }
                      }}
                          placeholder="5'8&quot;"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            fieldErrors['preferences.minHeight'] 
                              ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300'
                          }`}
                    />
                    {fieldErrors['preferences.minHeight'] && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors['preferences.minHeight']}
                      </p>
                    )}
                </div>
                      <div className="flex-1">
                        <label className="block text-xs text-muted mb-1">Max Height</label>
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
                            if (fieldErrors['preferences.maxHeight']) {
                              const newErrors = { ...fieldErrors };
                              delete newErrors['preferences.maxHeight'];
                              setFieldErrors(newErrors);
                            }
                      }}
                          placeholder="6'2&quot;"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            fieldErrors['preferences.maxHeight'] 
                              ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300'
                          }`}
                    />
                    {fieldErrors['preferences.maxHeight'] && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors['preferences.maxHeight']}
                      </p>
                    )}
                </div>
                    </div>
                </div>
                ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200">
                    <div 
                      className="absolute h-2 bg-[#800020]"
                      style={{ 
                        left: String(((user.preferences?.minHeight || 68) - 48) / (84 - 48) * 100) + '%',
                        width: String(((user.preferences?.maxHeight || 74) - (user.preferences?.minHeight || 68)) / (84 - 48) * 100) + '%'
                      }}
                    />
                </div>
                    <span className="text-[#800020]">
                      {user.preferences?.minHeight 
                        ? (Math.floor(user.preferences.minHeight / 12) + "'" + (user.preferences.minHeight % 12) + '"')
                        : "5'8\""} - {user.preferences?.maxHeight 
                          ? (Math.floor(user.preferences.maxHeight / 12) + "'" + (user.preferences.maxHeight % 12) + '"')
                          : "6'2\""}
                    </span>
                </div>
                  )}
                </div>

              {/* Horoscope Match Mandatory */}
              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing ? (formData.horoscopeMatchMandatory ?? user.horoscopeMatchMandatory ?? false) : (user.horoscopeMatchMandatory ?? false)}
                    onChange={(e) => setFormData({ ...formData, horoscopeMatchMandatory: e.target.checked })}
                    disabled={!editing}
                    aria-label="Require horoscope match for partner preferences"
                    className="w-5 h-5 text-[#800020]"
                  />
                  <span className="text-sm font-medium text-secondary">
                    Require Horoscope Match <span className="text-muted text-xs">(Mandatory for matches)</span>
                  </span>
                </label>
                {!editing && (
                  <p className="mt-2 text-sm text-[#800020]">
                    {user.horoscopeMatchMandatory 
                      ? 'Horoscope compatibility is required for matches' 
                      : 'Horoscope compatibility is optional for matches'}
                  </p>
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
                aria-label={saving ? 'Saving profile changes' : 'Save profile changes'}
                className="w-full py-4 bg-[#800020]"
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
