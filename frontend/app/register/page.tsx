'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';
import { getErrorMessage, getFieldError } from '@/lib/utils/errorMessages';
import { validateEmail, validatePhone, validateRequired, validateMinLength } from '@/lib/utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male' as 'male' | 'female' | 'other',
    age: '',
    communityPosition: '' as string | null,
  });

  // Client-side validation
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'name':
        const nameValidation = validateRequired(value, t('auth.fullName'));
        if (!nameValidation.isValid) return nameValidation.error || '';
        if (value.length < 2) return t('auth.nameMinLength') || 'Name must be at least 2 characters';
        break;
      case 'email':
        if (value && value.trim()) {
          const emailValidation = validateEmail(value);
          if (!emailValidation.isValid) return emailValidation.error || '';
        }
        break;
      case 'phone':
        if (value && value.trim()) {
          const phoneValidation = validatePhone(value);
          if (!phoneValidation.isValid) return phoneValidation.error || '';
        }
        break;
      case 'password':
        const passwordValidation = validateRequired(value, t('auth.password'));
        if (!passwordValidation.isValid) return passwordValidation.error || '';
        const minLengthValidation = validateMinLength(value, 6, t('auth.password'));
        if (!minLengthValidation.isValid) return minLengthValidation.error || '';
        break;
      case 'age':
        if (value) {
          const ageNum = parseInt(value);
          if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
            return t('auth.ageRange') || 'Age must be between 18 and 100';
          }
        }
        break;
    }
    return null;
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields({ ...touchedFields, [fieldName]: true });
    const value = formData[fieldName as keyof typeof formData];
    const error = validateField(fieldName, value);
    if (error) {
      setFieldErrors({ ...fieldErrors, [fieldName]: error });
    } else {
      const newErrors = { ...fieldErrors };
      delete newErrors[fieldName];
      setFieldErrors(newErrors);
    }
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
    
    // Clear error when user starts typing
    if (fieldErrors[fieldName]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[fieldName];
      setFieldErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    const nameError = validateField('name', formData.name);
    if (nameError) errors.name = nameError;
    
    const passwordError = validateField('password', formData.password);
    if (passwordError) errors.password = passwordError;
    
    // Validate optional fields if provided
    if (formData.email) {
      const emailError = validateField('email', formData.email);
      if (emailError) errors.email = emailError;
    }
    
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) errors.phone = phoneError;
    }
    
    if (formData.age) {
      const ageError = validateField('age', formData.age);
      if (ageError) errors.age = ageError;
    }
    
    // Check if at least email or phone is provided
    if (!formData.email && !formData.phone) {
      errors.email = t('auth.emailOrPhoneRequired') || 'Either email or phone number is required';
      errors.phone = t('auth.emailOrPhoneRequired') || 'Either email or phone number is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Mark all fields as touched
    const allFields = ['name', 'email', 'phone', 'password', 'age'];
    const touched: Record<string, boolean> = {};
    allFields.forEach(field => touched[field] = true);
    setTouchedFields(touched);
    
    // Client-side validation
    if (!validateForm()) {
      setError(t('auth.validationErrors') || 'Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      };
      
      // Remove empty fields by setting to undefined
      if (!data.email || !data.email.trim()) data.email = undefined;
      if (!data.phone || !data.phone.trim()) data.phone = undefined;

      const response = await userApi.create(data);
      
      if (response.status && response.data) {
        // Store token if provided (for future auth endpoints)
        if ((response.data as any).token) {
          auth.setToken((response.data as any).token);
        }
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMsg = getErrorMessage(err, t);
      setError(errorMsg);
      
      // Parse validation errors from backend
      if (errorData?.errors || errorData?.validationErrors) {
        const validationErrors: Record<string, string> = {};
        const errors = errorData.errors || errorData.validationErrors || {};
        
        // Handle Zod validation errors (array format)
        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            if (error.path && error.message) {
              const fieldName = error.path[error.path.length - 1];
              validationErrors[fieldName] = error.message;
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t('auth.createAccountTitle')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('auth.signInToAccount').split('Or')[0]}Or{' '}
              <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
                {t('auth.signInToAccount').includes('sign in') ? 'sign in to your account' : 'अपने खाते में साइन इन करें'}
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                  touchedFields.name && fieldErrors.name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder={t('auth.fullName')}
                value={formData.name}
                onChange={(e) => handleChange('name', sanitizeFormInput(e.target.value, 'text'))}
                onBlur={() => handleBlur('name')}
              />
              {touchedFields.name && fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.emailOptional')} <span className="text-gray-400 text-xs">({t('auth.emailOrPhoneRequired') || 'Email or Phone required'})</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`appearance-none relative block w-full px-4 py-3 border-2 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                  touchedFields.email && fieldErrors.email
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder={t('auth.emailOptional')}
                value={formData.email}
                onChange={(e) => handleChange('email', sanitizeFormInput(e.target.value, 'email'))}
                onBlur={() => handleBlur('email')}
              />
              {touchedFields.email && fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.phoneOptional')} <span className="text-gray-400 text-xs">({t('auth.emailOrPhoneRequired') || 'Email or Phone required'})</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`appearance-none relative block w-full px-4 py-3 border-2 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                  touchedFields.phone && fieldErrors.phone
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder={t('auth.phoneOptional')}
                value={formData.phone}
                onChange={(e) => handleChange('phone', sanitizeFormInput(e.target.value, 'phone'))}
                onBlur={() => handleBlur('phone')}
              />
              {touchedFields.phone && fieldErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.password')} <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                  touchedFields.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
              />
              {touchedFields.password && fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
              {!fieldErrors.password && (
                <p className="mt-1 text-xs text-gray-500">{t('auth.passwordMinLength') || 'Password must be at least 6 characters'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.gender')}
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="male">{t('auth.male')}</option>
                  <option value="female">{t('auth.female')}</option>
                  <option value="other">{t('auth.other')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.age')}
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  className={`appearance-none relative block w-full px-4 py-3 border-2 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                    touchedFields.age && fieldErrors.age
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder={t('auth.age')}
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  onBlur={() => handleBlur('age')}
                />
                {touchedFields.age && fieldErrors.age && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.age}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 border-2 border-gray-200">
            <label htmlFor="communityPosition" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.communityPosition')}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {t('auth.communityPositionDesc')}
            </p>
            <select
              id="communityPosition"
              name="communityPosition"
              className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              value={formData.communityPosition || ''}
              onChange={(e) => setFormData({ ...formData, communityPosition: e.target.value || null })}
            >
              <option value="">{t('auth.noPosition')}</option>
              <option value="community-leader">{t('auth.communityLeader')}</option>
              <option value="community-member">{t('auth.communityMember')}</option>
              <option value="family-head">{t('auth.familyHead')}</option>
              <option value="elder">{t('auth.elder')}</option>
              <option value="volunteer">{t('auth.volunteer')}</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? t('auth.creatingAccount') : t('auth.signUp')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

