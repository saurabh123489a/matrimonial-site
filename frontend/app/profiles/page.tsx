'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userApi, User, Pagination, metaDataApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import ProfileCard from '@/components/ProfileCard';
import CompactProfileCard from '@/components/CompactProfileCard';
import LocationSelect from '@/components/LocationSelect';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';

interface SearchFilters {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  minHeight?: number;
  maxHeight?: number;
  gahoiId?: string;
}

function SearchProfilesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { showError } = useNotifications();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [sortBy, setSortBy] = useState<'newest' | 'age' | 'name'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [filters, setFilters] = useState<SearchFilters>({
    gender: '',
    minAge: undefined,
    maxAge: undefined,
    city: '',
    state: '',
    country: '',
    education: '',
    occupation: '',
    maritalStatus: '',
    minHeight: undefined,
    maxHeight: undefined,
    gahoiId: '',
  });
  
  // Options for dropdowns
  const [educationOptions, setEducationOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [occupationOptions, setOccupationOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingEducation, setLoadingEducation] = useState(false);
  const [loadingOccupation, setLoadingOccupation] = useState(false);
  
  // Current user for gender-based filtering
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check authentication
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Load current user to determine default gender filter
    loadCurrentUser();
    
    // Load options
    loadEducationOptions();
    
    // Load filters from URL params
    const urlFilters: SearchFilters = {};
    if (searchParams.get('gender')) urlFilters.gender = searchParams.get('gender') || '';
    if (searchParams.get('minAge')) urlFilters.minAge = parseInt(searchParams.get('minAge') || '');
    if (searchParams.get('maxAge')) urlFilters.maxAge = parseInt(searchParams.get('maxAge') || '');
    if (searchParams.get('city')) urlFilters.city = searchParams.get('city') || '';
    if (searchParams.get('state')) urlFilters.state = searchParams.get('state') || '';
    if (searchParams.get('country')) urlFilters.country = searchParams.get('country') || '';
    if (searchParams.get('education')) urlFilters.education = searchParams.get('education') || '';
    if (searchParams.get('occupation')) urlFilters.occupation = searchParams.get('occupation') || '';
    if (searchParams.get('maritalStatus')) urlFilters.maritalStatus = searchParams.get('maritalStatus') || '';
    if (searchParams.get('minHeight')) urlFilters.minHeight = parseInt(searchParams.get('minHeight') || '');
    if (searchParams.get('maxHeight')) urlFilters.maxHeight = parseInt(searchParams.get('maxHeight') || '');
    if (searchParams.get('gahoiId')) urlFilters.gahoiId = searchParams.get('gahoiId') || '';
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
  }, []);

  useEffect(() => {
    if (currentUser?.gender) {
      loadOccupationOptions();
      // Set default gender filter to opposite gender only if not set from URL
      setFilters(prev => {
        if (!prev.gender && !searchParams.get('gender')) {
          const oppositeGender = currentUser.gender === 'male' ? 'female' : currentUser.gender === 'female' ? 'male' : '';
          return { ...prev, gender: oppositeGender };
        }
        return prev;
      });
    }
  }, [currentUser?.gender]);

  useEffect(() => {
    if (mounted && auth.isAuthenticated() && currentUser) {
      // Initial search with filters (will use default gender if not set)
      // Use a small delay to ensure filters are set
      const timeoutId = setTimeout(() => {
        const page = parseInt(searchParams.get('page') || '1');
        performSearch(page);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mounted, currentUser]);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  const loadCurrentUser = async () => {
    try {
      const response = await userApi.getMe();
      if (response.status && response.data) {
        setCurrentUser(response.data);
      }
    } catch (err) {
      console.error('Failed to load current user:', err);
    }
  };

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
    if (!currentUser?.gender) return;
    
    setLoadingOccupation(true);
    try {
      const response = await metaDataApi.getOccupation(currentUser.gender);
      if (response.status && response.data) {
        setOccupationOptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load occupation options:', error);
    } finally {
      setLoadingOccupation(false);
    }
  };

  const performSearch = async (page: number = 1) => {
    setLoading(true);
    setError('');

    try {
      // Build search params
      const searchParams: any = {
        page,
        limit: 20,
      };

      // Add filters (only non-empty values)
      if (filters.gender) searchParams.gender = filters.gender;
      if (filters.minAge) searchParams.minAge = filters.minAge;
      if (filters.maxAge) searchParams.maxAge = filters.maxAge;
      if (filters.city) searchParams.city = filters.city;
      if (filters.state) searchParams.state = filters.state;
      if (filters.country) searchParams.country = filters.country;
      if (filters.education) searchParams.education = filters.education;
      if (filters.occupation) searchParams.occupation = filters.occupation;
      if (filters.maritalStatus) searchParams.maritalStatus = filters.maritalStatus;
      if (filters.minHeight) searchParams.minHeight = filters.minHeight;
      if (filters.maxHeight) searchParams.maxHeight = filters.maxHeight;
      if (filters.gahoiId) searchParams.gahoiId = filters.gahoiId;

      const response = await userApi.search(searchParams);
      
      if (response.status && response.data) {
        setUsers(response.data);
        setPagination(response.pagination || null);
        
        // Update URL with current filters
        updateURL(searchParams);
      } else {
        setError(response.message || 'Failed to search profiles');
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to search profiles';
      setError(errorMsg);
      showError(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (params: any) => {
    const url = new URL(window.location.href);
    Object.keys(params).forEach(key => {
      if (params[key] && key !== 'page' && key !== 'limit') {
        url.searchParams.set(key, String(params[key]));
      } else if (key === 'page' && params[key] === 1) {
        url.searchParams.delete(key);
      } else if (key === 'page') {
        url.searchParams.set(key, String(params[key]));
      }
    });
    window.history.replaceState({}, '', url.toString());
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    performSearch(1);
  };

  const handleClearFilters = () => {
    const defaultGender = currentUser?.gender === 'male' ? 'female' : currentUser?.gender === 'female' ? 'male' : '';
    setFilters({
      gender: defaultGender,
      minAge: undefined,
      maxAge: undefined,
      city: '',
      state: '',
      country: '',
      education: '',
      occupation: '',
      maritalStatus: '',
      minHeight: undefined,
      maxHeight: undefined,
      gahoiId: '',
    });
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handlePageChange = (page: number) => {
    performSearch(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCountryChange = useCallback((country: string) => {
    handleFilterChange('country', country);
    handleFilterChange('state', '');
    handleFilterChange('city', '');
  }, []);

  const handleStateChange = useCallback((state: string) => {
    handleFilterChange('state', state);
    handleFilterChange('city', '');
  }, []);

  const handleCityChange = useCallback((city: string) => {
    handleFilterChange('city', city);
  }, []);

  const convertHeightToInches = (feet: number, inches: number): number => {
    return feet * 12 + inches;
  };

  const convertInchesToFeetInches = (inches: number): { feet: number; inches: number } => {
    return {
      feet: Math.floor(inches / 12),
      inches: inches % 12,
    };
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const maritalStatusOptions = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case 'age':
        return (a.age || 0) - (b.age || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] pb-24 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-[#181b23] border-b border-gray-200 dark:border-[#303341] sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-700 dark:text-pink-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-pink-100">
            Discover
          </h1>
          <button
            onClick={() => router.push('/notifications')}
            className="p-2 -mr-2 text-gray-700 dark:text-pink-100 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter/Sort/View Bar */}
      <div className="bg-white dark:bg-[#181b23] border-b border-gray-200 dark:border-[#303341] px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              showFilters
                ? 'bg-pink-600 text-white dark:bg-pink-600'
                : 'bg-gray-100 dark:bg-[#1f212a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252730]'
            }`}
          >
            Filter
          </button>
          <div className="relative flex-1" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                showSortMenu
                  ? 'bg-pink-600 text-white dark:bg-pink-600'
                  : 'bg-gray-100 dark:bg-[#1f212a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252730]'
              }`}
            >
              Sort
            </button>
            {showSortMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#181b23] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40">
                <button
                  onClick={() => {
                    setSortBy('newest');
                    setShowSortMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-[#1f212a] first:rounded-t-lg ${
                    sortBy === 'newest' ? 'text-pink-600 dark:text-pink-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => {
                    setSortBy('age');
                    setShowSortMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-[#1f212a] ${
                    sortBy === 'age' ? 'text-pink-600 dark:text-pink-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Age: Low to High
                </button>
                <button
                  onClick={() => {
                    setSortBy('name');
                    setShowSortMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-[#1f212a] last:rounded-b-lg ${
                    sortBy === 'name' ? 'text-pink-600 dark:text-pink-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Name: A to Z
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              viewMode === 'compact'
                ? 'bg-gray-100 dark:bg-[#1f212a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252730]'
                : 'bg-pink-600 text-white dark:bg-pink-600'
            }`}
          >
            View
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-[#181b23] border-b border-gray-200 dark:border-[#303341] p-4 space-y-4">
          {/* Gahoi ID Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
              Search by Gahoi ID
            </label>
            <input
              type="text"
              value={filters.gahoiId || ''}
              onChange={(e) => handleFilterChange('gahoiId', sanitizeFormInput(e.target.value, 'text'))}
              placeholder="e.g., 10001"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
              Gender
            </label>
            <select
              value={filters.gender || ''}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                Min Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={filters.minAge || ''}
                onChange={(e) => handleFilterChange('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
                Max Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={filters.maxAge || ''}
                onChange={(e) => handleFilterChange('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Location */}
          <LocationSelect
            selectedCountry={filters.country}
            selectedState={filters.state}
            selectedCity={filters.city}
            onCountryChange={handleCountryChange}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
          />

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
              Education
            </label>
            <select
              value={filters.education || ''}
              onChange={(e) => handleFilterChange('education', e.target.value)}
              disabled={loadingEducation}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
            >
              <option value="">All</option>
              {educationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
              Occupation
            </label>
            <select
              value={filters.occupation || ''}
              onChange={(e) => handleFilterChange('occupation', e.target.value)}
              disabled={loadingOccupation}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
            >
              <option value="">All</option>
              {occupationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">
              Marital Status
            </label>
            <select
              value={filters.maritalStatus || ''}
              onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All</option>
              {maritalStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Height Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-2">
              Height Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Height</label>
                <input
                  type="text"
                  value={filters.minHeight ? `${convertInchesToFeetInches(filters.minHeight).feet}'${convertInchesToFeetInches(filters.minHeight).inches}"` : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const match = value.match(/(\d+)'(\d+)"/);
                    if (match) {
                      const feet = parseInt(match[1]);
                      const inches = parseInt(match[2]);
                      handleFilterChange('minHeight', convertHeightToInches(feet, inches));
                    } else if (value === '') {
                      handleFilterChange('minHeight', undefined);
                    }
                  }}
                  placeholder="5'0&quot;"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Height</label>
                <input
                  type="text"
                  value={filters.maxHeight ? `${convertInchesToFeetInches(filters.maxHeight).feet}'${convertInchesToFeetInches(filters.maxHeight).inches}"` : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const match = value.match(/(\d+)'(\d+)"/);
                    if (match) {
                      const feet = parseInt(match[1]);
                      const inches = parseInt(match[2]);
                      handleFilterChange('maxHeight', convertHeightToInches(feet, inches));
                    } else if (value === '') {
                      handleFilterChange('maxHeight', undefined);
                    }
                  }}
                  placeholder="6'6&quot;"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1f212a] dark:text-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="px-4 py-4">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <EmptyState
            title="No profiles found"
            description="Try adjusting your search filters to find more profiles."
            icon="🔍"
          />
        )}

        {/* Results Grid */}
        {!loading && users.length > 0 && (
          <>
            <div className={`grid gap-3 ${
              viewMode === 'compact' 
                ? 'grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
            }`}>
              {sortedUsers.map((user) => (
                viewMode === 'compact' ? (
                  <CompactProfileCard key={user._id} user={user} showOnlineStatus={true} />
                ) : (
                  <ProfileCard key={user._id} user={user} />
                )
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white dark:bg-[#181b23] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-pink-100 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1f212a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-pink-600 text-white'
                            : 'bg-white dark:bg-[#181b23] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-pink-100 hover:bg-gray-50 dark:hover:bg-[#1f212a]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-white dark:bg-[#181b23] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-pink-100 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1f212a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Scroll to Top Button */}
        {users.length > 6 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-4 w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function SearchProfilesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <SearchProfilesPageContent />
    </Suspense>
  );
}

