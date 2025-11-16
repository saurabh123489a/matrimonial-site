'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userApi, User, Pagination, metaDataApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import ProfileCard from '@/components/ProfileCard';
import CompactProfileCard from '@/components/CompactProfileCard';
import LazyProfileCard from '@/components/LazyProfileCard';
import DetailedProfileTile from '@/components/DetailedProfileTile';
import LocationSelect from '@/components/LocationSelect';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ProfileShareModal from '@/components/ProfileShareModal';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';
import { getProfileUrl } from '@/lib/profileUtils';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  
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

    // Load filters from URL params first (synchronous)
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

    // Load current user and education options in parallel for faster loading
    Promise.all([
      loadCurrentUser(),
      loadEducationOptions()
    ]).catch(err => {
      console.error('Failed to load initial data:', err);
    });
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
    if (mounted && auth.isAuthenticated() && currentUser && !hasSearched) {
      // Trigger search immediately - filters are set synchronously from URL or will be set by the gender effect
      // The performSearch function reads filters from state, so it will use the latest values
      setHasSearched(true);
      // Use requestAnimationFrame to ensure state updates are flushed
      requestAnimationFrame(() => {
        performSearch(1, false);
      });
    }
  }, [mounted, currentUser, hasSearched]);

  const loadCurrentUser = async () => {
    try {
      const response = await userApi.getMe();
      if (response.status && response.data) {
        setCurrentUser(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to load current user:', err);
      throw err;
    }
  };

  const loadEducationOptions = async () => {
    // Check cache first (sessionStorage for this session)
    const cacheKey = 'educationOptions';
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setEducationOptions(JSON.parse(cached));
        return;
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }

    setLoadingEducation(true);
    try {
      const response = await metaDataApi.getEducation();
      if (response.status && response.data) {
        setEducationOptions(response.data);
        // Cache for this session
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to load education options:', error);
    } finally {
      setLoadingEducation(false);
    }
  };

  const loadOccupationOptions = async () => {
    if (!currentUser?.gender) return;
    
    // Check cache first (sessionStorage for this session)
    const cacheKey = `occupationOptions_${currentUser.gender}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setOccupationOptions(JSON.parse(cached));
        return;
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }
    
    setLoadingOccupation(true);
    try {
      const response = await metaDataApi.getOccupation(currentUser.gender);
      if (response.status && response.data) {
        setOccupationOptions(response.data);
        // Cache for this session
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to load occupation options:', error);
    } finally {
      setLoadingOccupation(false);
    }
  };

  const performSearch = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentPage(1);
    }
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
        if (append) {
          setUsers(prev => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }
        setPagination(response.pagination || null);
        setCurrentPage(page);
        
        // Update URL with current filters (only for first page)
        if (!append) {
          updateURL(searchParams);
        }
      } else {
        setError(response.message || 'Failed to search profiles');
        if (!append) {
          setUsers([]);
        }
      }
    } catch (err: any) {
      console.error('Search error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to search profiles';
      setError(errorMsg);
      if (!append) {
        showError(errorMsg);
        setUsers([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (pagination && currentPage < pagination.pages && !loading && !loadingMore) {
      performSearch(currentPage + 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, currentPage, loading, loadingMore]);

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
    setHasSearched(true);
    performSearch(1, false);
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

  // Infinite scroll hook
  const loadMoreRef = useInfiniteScroll({
    hasMore: pagination ? currentPage < pagination.pages : false,
    loading: loadingMore,
    onLoadMore: loadMore,
  });

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
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const maritalStatusOptions = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter/View Bar */}
      <div className="bg-white">
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500
              showFilters
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100'
            }`}
          >
            Filter
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
            aria-label={`Switch to ${viewMode === 'detailed' ? 'compact' : 'detailed'} view`}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500
              viewMode === 'detailed'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100'
            }`}
          >
            {viewMode === 'detailed' ? 'Detailed' : 'Compact'}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div id="filters-panel" className="bg-white">
          {/* Gahoi ID Search */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Search by Gahoi ID
            </label>
            <input
              type="text"
              value={filters.gahoiId || ''}
              onChange={(e) => handleFilterChange('gahoiId', sanitizeFormInput(e.target.value, 'text'))}
              placeholder="e.g., 10001"
              className="w-full px-3 py-2 border border-gray-300"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Gender
            </label>
            <select
              value={filters.gender || ''}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Min Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={filters.minAge || ''}
                onChange={(e) => handleFilterChange('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Max Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={filters.maxAge || ''}
                onChange={(e) => handleFilterChange('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300"
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
            <label className="block text-sm font-medium text-gray-700 text-secondary mb-2">
              Education
            </label>
            <select
              value={filters.education || ''}
              onChange={(e) => handleFilterChange('education', e.target.value)}
              disabled={loadingEducation}
              className="w-full px-3 py-2 border border-gray-300"
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
            <label className="block text-sm font-medium text-gray-700 text-secondary mb-2">
              Occupation
            </label>
            <select
              value={filters.occupation || ''}
              onChange={(e) => handleFilterChange('occupation', e.target.value)}
              disabled={loadingOccupation}
              className="w-full px-3 py-2 border border-gray-300"
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
            <label className="block text-sm font-medium text-gray-700 text-secondary mb-2">
              Marital Status
            </label>
            <select
              value={filters.maritalStatus || ''}
              onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300"
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
            <label className="block text-sm font-medium text-gray-700 text-secondary mb-2">
              Height Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Min Height</label>
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
                  className="w-full px-3 py-2 border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Max Height</label>
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
                  className="w-full px-3 py-2 border border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              aria-label={loading ? 'Searching profiles' : 'Search profiles'}
              className="flex-1 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleClearFilters}
              aria-label="Clear all filters"
              className="px-4 py-3 bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50">
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
            <div className={`grid ${
              viewMode === 'compact' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
            }`}>
              {users.map((user) => (
                viewMode === 'detailed' ? (
                  <DetailedProfileTile key={user._id} user={user} />
                ) : (
                  <LazyProfileCard 
                    key={user._id} 
                    user={user} 
                    viewMode={viewMode}
                    showOnlineStatus={viewMode === 'compact'}
                  />
                )
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {pagination && currentPage < pagination.pages && (
              <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
                {loadingMore && <LoadingSpinner />}
              </div>
            )}

            {/* End of Results Message */}
            {pagination && currentPage >= pagination.pages && users.length > 0 && (
              <div className="mt-8 text-center py-4 text-muted text-sm">
                No more profiles to load
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

      {/* Profile Share Modal */}
      {currentUser && (
        <ProfileShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          profileId={currentUser.gahoiId ? String(currentUser.gahoiId) : currentUser._id}
          profileName={currentUser.name}
          profileUrl={getProfileUrl(currentUser)}
          user={currentUser}
        />
      )}
    </div>
  );
}

export default function SearchProfilesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    }>
      <SearchProfilesPageContent />
    </Suspense>
  );
}

