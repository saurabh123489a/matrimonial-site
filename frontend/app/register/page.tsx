'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';
import { getErrorMessage, getFieldError } from '@/lib/utils/errorMessages';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';
import Logo from '@/components/Logo';
import { validateEmail, validatePhone, validateRequired, validateMinLength } from '@/lib/utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '',
    age: '',
    communityPosition: '' as string | null,
  });

  
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'name':
        // Check if required
        if (!value || value.trim() === '') {
          return 'Full name is required';
        }
        const trimmedName = value.trim();
        // Check minimum length
        if (trimmedName.length < 2) {
          return 'Name must be at least 2 characters long';
        }
        // Check maximum length
        if (trimmedName.length > 50) {
          return 'Name must not exceed 50 characters';
        }
        // Check for valid characters (letters, spaces, and common name characters)
        const nameRegex = /^[a-zA-Z\s.'-]+$/;
        if (!nameRegex.test(trimmedName)) {
          return 'Name can only contain letters, spaces, and common punctuation (. \' -)';
        }
        // Check for consecutive spaces
        if (trimmedName.includes('  ')) {
          return 'Name cannot contain consecutive spaces';
        }
        break;

      case 'email':
        if (value && value.trim()) {
          const trimmedEmail = value.trim();
          // Check email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmedEmail)) {
            return 'Please enter a valid email address (e.g., name@example.com)';
          }
          // Check email length
          if (trimmedEmail.length > 100) {
            return 'Email address is too long (maximum 100 characters)';
          }
          // Check for common email issues
          if (trimmedEmail.startsWith('@') || trimmedEmail.endsWith('@')) {
            return 'Email address format is invalid';
          }
          if (trimmedEmail.includes('..')) {
            return 'Email address cannot contain consecutive dots';
          }
        }
        break;

      case 'phone':
        if (!value || value.trim() === '') {
          return 'Phone number is required';
        }
        const cleanedPhone = value.replace(/[\s-()]/g, '');
        // Check if empty after cleaning
        if (cleanedPhone === '') {
          return 'Phone number is required';
        }
        // Check if it's all digits
        if (!/^\d+$/.test(cleanedPhone.replace('+91', ''))) {
          return 'Phone number can only contain digits';
        }
        // Check length (should be 10 digits, optionally with +91)
        const phoneWithoutCountryCode = cleanedPhone.replace(/^\+91/, '');
        if (phoneWithoutCountryCode.length !== 10) {
          return 'Phone number must be exactly 10 digits';
        }
        // Check if starts with valid Indian mobile prefix (6-9)
        if (!/^[6-9]/.test(phoneWithoutCountryCode)) {
          return 'Phone number must start with 6, 7, 8, or 9';
        }
        break;

      case 'password':
        if (!value || value.trim() === '') {
          return 'Password is required';
        }
        // Check minimum length
        if (value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        // Check maximum length
        if (value.length > 128) {
          return 'Password must not exceed 128 characters';
        }
        // Check for spaces
        if (value.includes(' ')) {
          return 'Password cannot contain spaces';
        }
        break;

      case 'dateOfBirth':
        if (!value || value.trim() === '') {
          return 'Date of birth is required';
        }
        const birthDate = new Date(value);
        const today = new Date();
        // Check if date is valid
        if (isNaN(birthDate.getTime())) {
          return 'Please enter a valid date';
        }
        // Check if date is in the future
        if (birthDate > today) {
          return 'Date of birth cannot be in the future';
        }
        // Check if age is at least 18
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          return 'You must be at least 18 years old to register';
        }
        // Check if age is reasonable (not more than 100)
        if (age > 100) {
          return 'Please enter a valid date of birth';
        }
        // Check if date is too old (more than 100 years ago)
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(today.getFullYear() - 100);
        if (birthDate < hundredYearsAgo) {
          return 'Date of birth cannot be more than 100 years ago';
        }
        break;

      case 'age':
        if (value) {
          const ageNum = parseInt(value);
          if (isNaN(ageNum)) {
            return 'Age must be a valid number';
          }
          if (ageNum < 18) {
            return 'You must be at least 18 years old to register';
          }
          if (ageNum > 100) {
            return 'Please enter a valid age (maximum 100 years)';
          }
        }
        break;

      case 'gender':
        if (!value || value.trim() === '') {
          return 'Gender is required';
        }
        const validGenders = ['male', 'female', 'other'];
        if (!validGenders.includes(value)) {
          return 'Please select a valid gender';
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

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) return null;
    
    // Check if date is in the future
    if (birthDate > today) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Return age only if it's valid (18-100)
    return age >= 18 && age <= 100 ? age : null;
  };

  const handleChange = (fieldName: string, value: any) => {
    const updatedFormData = { ...formData, [fieldName]: value };
    
    // Auto-calculate age when date of birth changes
    if (fieldName === 'dateOfBirth' && value) {
      const calculatedAge = calculateAge(value);
      if (calculatedAge !== null) {
        updatedFormData.age = calculatedAge.toString();
        // Clear age and dateOfBirth errors if age is valid
        const newErrors = { ...fieldErrors };
        delete newErrors.age;
        delete newErrors.dateOfBirth;
        setFieldErrors(newErrors);
      } else {
        // If calculated age is invalid, clear age field and validate DOB
        updatedFormData.age = '';
        // Validate DOB to show appropriate error
        const dobError = validateField('dateOfBirth', value);
        if (dobError) {
          setFieldErrors({ ...fieldErrors, dateOfBirth: dobError });
        } else {
          const newErrors = { ...fieldErrors };
          delete newErrors.dateOfBirth;
          setFieldErrors(newErrors);
        }
      }
    }
    
    setFormData(updatedFormData);
    
    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[fieldName];
      setFieldErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate name (required)
    const nameError = validateField('name', formData.name);
    if (nameError) errors.name = nameError;
    
    // Validate phone (required)
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    // Validate password (required)
    const passwordError = validateField('password', formData.password);
    if (passwordError) errors.password = passwordError;
    
    // Validate gender (required)
    const genderError = validateField('gender', formData.gender);
    if (genderError) errors.gender = genderError;
    
    // Validate date of birth (required)
    const dateOfBirthError = validateField('dateOfBirth', formData.dateOfBirth);
    if (dateOfBirthError) errors.dateOfBirth = dateOfBirthError;
    
    // Validate email (optional, but if provided must be valid)
    if (formData.email && formData.email.trim()) {
      const emailError = validateField('email', formData.email);
      if (emailError) errors.email = emailError;
    }
    
    // Validate age (should be auto-calculated, but validate if present)
    if (formData.age) {
      const ageError = validateField('age', formData.age);
      if (ageError) errors.age = ageError;
    }
    
    // If date of birth is provided but age is not calculated, show error
    if (formData.dateOfBirth && !formData.age) {
      errors.dateOfBirth = errors.dateOfBirth || 'Please select a valid date of birth';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    
    const allFields = ['name', 'email', 'phone', 'password', 'dateOfBirth', 'age'];
    const touched: Record<string, boolean> = {};
    allFields.forEach(field => touched[field] = true);
    setTouchedFields(touched);
    
    
    if (!validateForm()) {
      setError(t('auth.validationErrors') || 'Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        // Convert empty string to null for communityPosition (required by validation schema)
        communityPosition: formData.communityPosition && formData.communityPosition.trim() !== '' 
          ? formData.communityPosition 
          : null,
      };
      
      
      if (!data.email || !data.email.trim()) data.email = undefined;
      if (!data.phone || !data.phone.trim()) data.phone = undefined;

      const response = await userApi.create(data);
      
      if (response.status && response.data) {
        
        if ((response.data as any).token) {
          auth.setToken((response.data as any).token);
        }
        router.push('/login?registered=true');
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
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone Number',
            password: 'Password',
            gender: 'Gender',
            age: 'Age',
            dateOfBirth: 'Date of Birth',
            communityPosition: 'Community Position',
          };
          return labels[fieldName] || fieldName;
        };
        
        // Helper function to convert error messages to user-friendly format
        const getUserFriendlyError = (error: any, fieldName: string): string => {
          const fieldLabel = getFieldLabel(fieldName);
          
          // Handle Zod validation errors
          if (error.code === 'invalid_enum_value') {
            if (fieldName === 'communityPosition') {
              return 'Please select a valid community position or leave it blank';
            }
            if (fieldName === 'gender') {
              return 'Please select a valid gender';
            }
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
              if (fieldName === 'phone') {
                return 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9';
              }
              return `${fieldLabel} format is invalid`;
            }
          }
          
          // Use the error message if available, otherwise create a generic one
          if (error.message) {
            // Replace technical terms with user-friendly ones
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
              const fieldName = error.path[error.path.length - 1];
              validationErrors[fieldName] = getUserFriendlyError(error, fieldName);
            }
          });
        } else if (typeof errors === 'object') {
          Object.keys(errors).forEach((key) => {
            const errorValue = errors[key];
            if (typeof errorValue === 'string') {
              validationErrors[key] = errorValue;
            } else if (Array.isArray(errorValue) && errorValue.length > 0) {
              // Handle array of error objects (Zod format)
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
          // Set a general error message
          const errorFields = Object.keys(validationErrors);
          if (errorFields.length === 1) {
            setError(`Please fix the error in ${getFieldLabel(errorFields[0])}`);
          } else {
            setError(`Please fix the errors in the form fields`);
          }
        } else {
          setError(getErrorMessage(err, t));
        }
      } else {
        // Handle non-validation errors
        const errorMsg = getErrorMessage(err, t);
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl relative z-10">
        <div className="bg-white/80 dark:bg-[#12121a] backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 sm:space-y-6 md:space-y-8 border border-white/20 dark:border-[#2a2a3a]">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            {/* Logo */}
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent px-2">
              {t('auth.createAccountTitle')}
            </h2>
            <p className="text-secondary text-xs sm:text-sm px-2">
              {t('auth.signInToAccount').split('Or')[0]}Or{' '}
              <Link href="/login" className="font-semibold text-pink-600 hover:text-pink-700 dark:text-[#00FFFF] dark:hover:text-[#00E6E6] transition-colors">
                {t('auth.signInToAccount').includes('sign in') ? 'sign in to your account' : 'अपने खाते में साइन इन करें'}
              </Link>
            </p>
          </div>

          <form className="space-y-4 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 border-l-4 border-red-500 shadow-sm animate-fadeIn">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs sm:text-sm text-red-800 font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5 sm:mb-2">
                  {t('auth.fullName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={`block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-[#00FFFF] focus:border-pink-500 dark:focus:border-[#00FFFF] text-sm sm:text-base touch-target ${
                      touchedFields.name && fieldErrors.name
                        ? 'border-red-400 bg-red-50 dark:border-[#F25D5D] dark:bg-[#F25D5D]/10'
                        : 'border-gray-200 dark:border-[#2a2a3a] bg-gray-50 dark:bg-[#151520] focus:bg-white dark:focus:bg-[#1F1417] text-primary'
                    }`}
                    placeholder={t('auth.fullName')}
                    value={formData.name}
                    onChange={(e) => handleChange('name', sanitizeFormInput(e.target.value, 'text'))}
                    onBlur={() => handleBlur('name')}
                  />
                </div>
                {touchedFields.name && fieldErrors.name && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-start">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="leading-relaxed">{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5 sm:mb-2">
                  {t('auth.emailOptional')} <span className="text-muted dark:text-muted text-xs font-normal">({t('auth.emailOrPhoneRequired') || 'Email or Phone required'})</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-[#00FFFF] focus:border-pink-500 dark:focus:border-[#00FFFF] text-sm sm:text-base touch-target ${
                      touchedFields.email && fieldErrors.email
                        ? 'border-red-400 bg-red-50 dark:border-[#F25D5D] dark:bg-[#F25D5D]/10'
                        : 'border-gray-200 dark:border-[#2a2a3a] bg-gray-50 dark:bg-[#151520] focus:bg-white dark:focus:bg-[#1F1417] text-primary'
                    }`}
                    placeholder={t('auth.emailOptional')}
                    value={formData.email}
                    onChange={(e) => handleChange('email', sanitizeFormInput(e.target.value, 'email'))}
                    onBlur={() => handleBlur('email')}
                  />
                </div>
                {touchedFields.email && fieldErrors.email && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-start">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="leading-relaxed">{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5 sm:mb-2">
                  {t('auth.phone') || 'Phone Number'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className={`block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-[#00FFFF] focus:border-pink-500 dark:focus:border-[#00FFFF] text-sm sm:text-base touch-target ${
                      touchedFields.phone && fieldErrors.phone
                        ? 'border-red-400 bg-red-50 dark:border-[#F25D5D] dark:bg-[#F25D5D]/10'
                        : 'border-gray-200 dark:border-[#2a2a3a] bg-gray-50 dark:bg-[#151520] focus:bg-white dark:focus:bg-[#1F1417] text-primary'
                    }`}
                    placeholder={t('auth.phone') || 'Enter phone number'}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', sanitizeFormInput(e.target.value, 'phone'))}
                    onBlur={() => handleBlur('phone')}
                  />
                </div>
                {touchedFields.phone && fieldErrors.phone && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-start">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="leading-relaxed">{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5 sm:mb-2">
                  {t('auth.password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-red-500 focus:border-pink-500 dark:focus:border-red-500 text-sm sm:text-base touch-target ${
                      touchedFields.password && fieldErrors.password
                        ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1f212a] focus:bg-white dark:focus:bg-[#1f212a] text-gray-900 dark:text-gray-50'
                    }`}
                    placeholder={t('auth.password')}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-muted hover:text-gray-600 transition-colors touch-target"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L3 3" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touchedFields.password && fieldErrors.password ? (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-start">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="leading-relaxed">{fieldErrors.password}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 sm:mt-2 text-xs text-muted flex items-center">
                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {t('auth.passwordMinLength') || 'Password must be at least 6 characters'}
                  </p>
                )}
              </div>

              {/* Gender and Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <CustomSelect
                  id="gender"
                  name="gender"
                  label={t('auth.gender')}
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  options={[
                    { value: 'male', label: t('auth.male') },
                    { value: 'female', label: t('auth.female') },
                    { value: 'other', label: t('auth.other') },
                  ]}
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <CustomDatePicker
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of Birth"
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  error={touchedFields.dateOfBirth ? fieldErrors.dateOfBirth : undefined}
                />
              </div>

              {/* Age (Auto-filled, read-only) */}
              {formData.age && (
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-muted text-xs font-normal">(Auto-calculated)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      readOnly
                      className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-[#2a2a3a] bg-gray-100 dark:bg-[#151520] text-gray-700 dark:text-[#D5D3D7] rounded-xl sm:text-sm cursor-not-allowed"
                      value={formData.age}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Community Position */}
            <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5 border-2 border-gray-200">
              <label htmlFor="communityPosition" className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5 sm:mb-2">
                {t('auth.communityPosition')}
              </label>
              <p className="text-xs text-secondary mb-2 sm:mb-3 leading-relaxed">
                {t('auth.communityPositionDesc')}
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <select
                  id="communityPosition"
                  name="communityPosition"
                  className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1f212a] text-gray-900 dark:text-gray-50 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-red-500 focus:border-pink-500 dark:focus:border-red-500 text-sm sm:text-base transition-all duration-200 touch-target"
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
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 dark:from-[#E04F5F] dark:via-[#E04F5F] dark:to-[#C43A4E] hover:from-pink-700 hover:via-pink-600 hover:to-purple-700 dark:hover:from-[#C43A4E] dark:hover:via-[#C43A4E] dark:hover:to-[#C43A4E] focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-[#00FFFF]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 touch-target btn-primary btn-scale"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="whitespace-nowrap">{t('auth.creatingAccount')}</span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">{t('auth.signUp')}</span>
                    <svg className="ml-2 -mr-1 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
