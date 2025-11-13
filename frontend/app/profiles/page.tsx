'use client';

import { useState, useEffect, Suspense, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { userApi, User } from '@/lib/api';
import EnhancedProfileCard from '@/components/EnhancedProfileCard';
import { useTranslation } from '@/hooks/useTranslation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import { trackSearch } from '@/lib/analytics';
import LoadingSpinner from '@/components/LoadingSpinner';
import { debounce } from '@/lib/utils/debounce';
import { metaDataApi } from '@/lib/api';

function ProfilesContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserLoaded, setCurrentUserLoaded] = useState(false);
  const [occupationOptions, setOccupationOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingOccupation, setLoadingOccupation] = useState(false);

  
  const loadOccupationOptions = useCallback(async (gender?: string) => {
    setLoadingOccupation(true);
    try {
      const response = await metaDataApi.getOccupation(gender);
      if (response.status && response.data) {
        setOccupationOptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load occupation options:', error);
    } finally {
      setLoadingOccupation(false);
    }
  }, []);

  
  useEffect(() => {
    setMounted(true);
    const authenticated = auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    
    const timeoutId = setTimeout(() => {
      if (!currentUserLoaded) {
        console.warn('Timeout: Setting currentUserLoaded to true after timeout');
        setCurrentUserLoaded(true);
        loadOccupationOptions();
      }
    }, 5000); 
    
    
    if (authenticated) {
      userApi.getMe().then(response => {
        clearTimeout(timeoutId);
        if (response.status) {
          setCurrentUser(response.data);
          
          loadOccupationOptions(response.data.gender);
        } else {
          loadOccupationOptions();
        }
        setCurrentUserLoaded(true);
      }).catch((error) => {
        clearTimeout(timeoutId);
        console.error('Failed to load current user:', error);
        
        loadOccupationOptions();
        setCurrentUserLoaded(true);
      });
    } else {
      clearTimeout(timeoutId);
      
      loadOccupationOptions();
      setCurrentUserLoaded(true);
    }
    
    
    if (!authenticated) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 500); 
      return () => {
        clearTimeout(timer);
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadOccupationOptions]);
  
  
  const [gahoiIdInput, setGahoiIdInput] = useState(searchParams.get('gahoiId') || '');
  const [gahoiId, setGahoiId] = useState(searchParams.get('gahoiId') || '');
  
  
  const [filters, setFilters] = useState({
    gender: searchParams.get('gender') || '',
    minAge: searchParams.get('minAge') || '',
    maxAge: searchParams.get('maxAge') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    education: searchParams.get('education') || '',
    occupation: searchParams.get('occupation') || '',
    maritalStatus: searchParams.get('maritalStatus') || '',
    minHeight: searchParams.get('minHeight') || '',
    maxHeight: searchParams.get('maxHeight') || '',
  });
  
  
  const [searchFilters, setSearchFilters] = useState(filters);
  
  
  useEffect(() => {
    setSearchFilters(filters);
  }, []); 
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10); 
  const [loadingMore, setLoadingMore] = useState(false);

  
  const { isRefreshing, isPulling, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await loadProfiles();
    },
    enabled: true,
  });

  
  const handleLoadMore = useCallback(() => {
    if (displayLimit < users.length && !loadingMore) {
      setLoadingMore(true);
      
      setTimeout(() => {
        setDisplayLimit(prev => Math.min(prev + 10, users.length));
        setLoadingMore(false);
      }, 300);
    }
  }, [displayLimit, users.length, loadingMore]);

  
  const loadMoreRef = useInfiniteScroll({
    hasMore: displayLimit < users.length,
    loading: loadingMore,
    onLoadMore: handleLoadMore,
  });

  
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);

  const loadProfiles = async () => {
    
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    setError('');
    
    
    let timeoutId: NodeJS.Timeout | null = null;
    timeoutId = setTimeout(() => {
      if (loadingRef.current && isMountedRef.current) {
        console.error('Profile loading timeout - API may be unreachable');
        setError('Unable to connect to server. Please check your internet connection or try again later.');
        setLoading(false);
        loadingRef.current = false;
      }
    }, 10000); 
    
    try {
      
      if (gahoiId && gahoiId.trim()) {
        const id = gahoiId.trim();
        
        if (!/^100[0-9]{2}$/.test(id)) {
          setError('Gahoi ID must be a 5-digit number starting with 1000 (e.g., 10000-10099)');
          setLoading(false);
          return;
        }
        
        try {
          
          const searchResponse = await userApi.search({ gahoiId: id, page, limit: 16 });
          if (searchResponse.status && searchResponse.data) {
            setUsers(searchResponse.data);
            setPagination(searchResponse.pagination || { total: searchResponse.data.length, pages: 1 });
          } else {
            setError('No profile found with this Gahoi ID');
            setUsers([]);
          }
        } catch (err: any) {
          if (err.response?.status === 404 || err.response?.status === 400) {
            setError(err.response?.data?.message || 'No profile found with this Gahoi ID');
          } else {
            setError(err.response?.data?.message || 'Failed to search by Gahoi ID');
          }
          setUsers([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      
      const filterParams: any = { page: 1, limit: 50 }; 
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (key === 'minAge' || key === 'maxAge') {
            filterParams[key] = parseInt(value);
          } else if (key === 'minHeight' || key === 'maxHeight') {
            filterParams[key] = parseFloat(value); 
          } else {
            filterParams[key] = value;
          }
        }
      });

      
      if (isAuthenticated && currentUser && !filterParams.gender) {
        
        if (currentUser.gender === 'female') {
          filterParams.gender = 'male';
        } else if (currentUser.gender === 'male') {
          filterParams.gender = 'female';
        }
      }

      console.log('Loading profiles with filters:', filterParams);
      const response = await userApi.search(filterParams);
      console.log('API Response:', response);
      console.log('Response status:', response.status);
      console.log('Response data type:', Array.isArray(response.data) ? 'array' : typeof response.data);
      console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'not an array');
      
      if (response.status) {
        const allUsers = Array.isArray(response.data) ? response.data : [];
        console.log('Profiles loaded:', allUsers.length);
        console.log('First user sample:', allUsers.length > 0 ? { _id: allUsers[0]?._id, name: allUsers[0]?.name, gahoiId: allUsers[0]?.gahoiId } : 'no users');
        console.log('Setting users state with', allUsers.length, 'profiles');
        
        
        if (isMountedRef.current) {
          setUsers(allUsers);
          if (response.pagination) {
            setPagination(response.pagination);
          } else {
            setPagination({ total: allUsers.length, pages: 1 });
          }
          
          setDisplayLimit(10);
          setLoading(false);
          
          
          if (allUsers.length === 0) {
            setError('No profiles found matching your criteria. Try adjusting your filters.');
          } else {
            
            setError('');
          }
          
          
          trackSearch(filterParams);
          
          console.log('State updated - users:', allUsers.length, 'loading:', false);
        }
      } else {
        
        console.error('API returned error:', response.message);
        if (isMountedRef.current) {
          setError(response.message || 'Failed to load profiles');
          setUsers([]);
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Error loading profiles:', err);
      if (isMountedRef.current) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load profiles. Please try again.';
        setError(errorMessage);
        setUsers([]);
        setLoading(false);
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      loadingRef.current = false;
    }
  };

  
  const searchFiltersKey = useMemo(() => JSON.stringify(searchFilters), [searchFilters]);
  
  
  useEffect(() => {
    
    if (currentUserLoaded) {
      console.log('useEffect triggered - loading profiles. currentUserLoaded:', currentUserLoaded);
      loadProfiles();
    }
    
    
    return () => {
      isMountedRef.current = false;
    };
    
  }, [page, gahoiId, searchFiltersKey, currentUser, currentUserLoaded]);
  
  
  useEffect(() => {
    console.log('Users state changed:', users.length, 'Loading:', loading, 'DisplayLimit:', displayLimit);
  }, [users, loading, displayLimit]);

  
  const debouncedUpdateSearchFilters = useMemo(
    () => debounce((newFilters: typeof filters) => {
      setSearchFilters(newFilters);
      setPage(1);
    }, 500),
    []
  );

  
  const debouncedGahoiIdSearch = useMemo(
    () => debounce((id: string) => {
      setGahoiId(id);
      setPage(1);
    }, 500),
    []
  );

  
  const handleFilterChange = (key: string, value: string, isTextInput: boolean = false) => {
    
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (isTextInput) {
      
      debouncedUpdateSearchFilters(newFilters);
    } else {
      
      setSearchFilters(newFilters);
      setPage(1);
    }
  };

  const handleSearch = () => {
    
    setSearchFilters(filters);
    setPage(1);
    
  };

  const clearFilters = () => {
    const emptyFilters = {
      gender: '',
      minAge: '',
      maxAge: '',
      city: '',
      state: '',
      education: '',
      occupation: '',
      maritalStatus: '',
      minHeight: '',
      maxHeight: '',
    };
    setGahoiIdInput('');
    setGahoiId('');
    setFilters(emptyFilters);
    setSearchFilters(emptyFilters);
    setPage(1);
  };

  
  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setShowAuthModal(true);
    }
  };

  
  useEffect(() => {
    const handleStorageChange = () => {
      const authenticated = auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setShowAuthModal(false);
      }
    };

    
    window.addEventListener('storage', handleStorageChange);
    
    
    const interval = setInterval(() => {
      const authenticated = auth.isAuthenticated();
      if (authenticated !== isAuthenticated) {
        setIsAuthenticated(authenticated);
        if (authenticated) {
          setShowAuthModal(false);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative transition-colors">
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#111111] px-6 py-3 rounded-b-lg shadow-lg flex items-center gap-3 animate-slide-up">
          {isRefreshing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-pink-300">Refreshing...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">⬇️</span>
              <span className="text-sm font-medium text-gray-700 dark:text-pink-300">Pull to refresh</span>
            </>
          )}
        </div>
      )}

      {/* Blur overlay for non-authenticated users - only show after mount to prevent hydration mismatch */}
      {mounted && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 pointer-events-none"></div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${mounted && !isAuthenticated ? 'filter blur-sm pointer-events-none' : ''}`}>
        {/* Message Banner - Encouraging users to explore */}
        <div className="mb-4 bg-gradient-to-r from-pink-100 via-red-100 to-pink-100 border-l-4 border-pink-600 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-bounce">👆</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                Discover your perfect match! Scroll down to explore profiles from the Gahoi community.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Use the filters on the left to refine your search and find compatible profiles
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('common.browseProfiles')}</h1>
          <p className="text-gray-600">
            Showing {pagination.total || users.length} profiles
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-4 py-3 bg-white rounded-lg shadow-md flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-all"
            >
              <span className="font-semibold">🔍 Refine Search</span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Sidebar Filters - Gahoi Sathi Style */}
          <aside className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white dark:bg-[#111111] rounded-lg shadow-md p-4 sm:p-6 filter-section lg:sticky lg:top-4 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-pink-300">Refine Search</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-5">
                {/* Gahoi ID Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-pink-300 mb-2">
                    Search by Gahoi ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gahoiIdInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        
                        if (value === '' || /^1000[0-9]$/.test(value) || /^100[0-9]{2}$/.test(value)) {
                          
                          setGahoiIdInput(value);
                          
                          debouncedGahoiIdSearch(value);
                        }
                      }}
                      placeholder="10000"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-pink-800 rounded-md focus:outline-none focus:border-pink-500 text-gray-800 dark:text-pink-200 dark:bg-black"
                      maxLength={5}
                    />
                    {gahoiIdInput && (
                      <button
                        onClick={() => {
                          setGahoiIdInput('');
                          setGahoiId('');
                          setPage(1);
                        }}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-pink-200 dark:hover:text-pink-100"
                        aria-label="Clear Gahoi ID"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-pink-200 mt-1">
                    5-digit ID (10000-10099). Even = Male, Odd = Female
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-pink-800 pt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-pink-200 mb-3">OR use filters below</p>
                </div>

                {/* Gender - "I'm looking for a" */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    I'm looking for a <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age From <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={filters.minAge}
                      onChange={(e) => handleFilterChange('minAge', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                      placeholder="From"
                    />
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={filters.maxAge}
                      onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                      placeholder="To"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value, true)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800 mb-2"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value, true)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                    placeholder="State"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    value={filters.education}
                    onChange={(e) => handleFilterChange('education', e.target.value, true)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                    placeholder="Education"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-pink-300 mb-2">
                    Occupation
                    {loadingOccupation && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-pink-400">(Loading...)</span>
                    )}
                  </label>
                  <select
                    value={filters.occupation}
                    onChange={(e) => handleFilterChange('occupation', e.target.value)}
                    disabled={loadingOccupation}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-pink-800 rounded-md focus:outline-none focus:border-pink-500 text-gray-800 dark:text-pink-200 dark:bg-black disabled:opacity-50"
                  >
                    <option value="">Select Occupation</option>
                    {occupationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    value={filters.maritalStatus}
                    onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                  >
                    <option value="">All</option>
                    <option value="unmarried">Unmarried</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>

                {/* Height Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (inches)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="40"
                      max="100"
                      step="0.5"
                      value={filters.minHeight}
                      onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="40"
                      max="100"
                      step="0.5"
                      value={filters.maxHeight}
                      onChange={(e) => handleFilterChange('maxHeight', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Find Matches Button */}
                <button
                  onClick={handleSearch}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🔍</span>
                  {t('common.search')} / Find Matches
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" showWelcomeMessage={true} className="mb-4" />
                <SkeletonLoader type="profile-list" count={8} />
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No profiles found"
                description="Try adjusting your search filters or clear them to see more results"
                action={{
                  label: "Clear Filters",
                  onClick: clearFilters
                }}
              />
            ) : (
              <>
                {/* Sort Options */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-pink-200">
                    Showing {Math.min(displayLimit, users.length)} of {users.length} profiles
                    {pagination.total > users.length && ` (${pagination.total} total)`}
                  </p>
                  <select className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option>Newest First</option>
                    <option>Most Relevant</option>
                    <option>Age: Low to High</option>
                    <option>Age: High to Low</option>
                  </select>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {users && users.length > 0 ? (
                    users.slice(0, displayLimit).map((user) => {
                      if (!user || !user._id) {
                        console.warn('Invalid user object:', user);
                        return null;
                      }
                      return (
                        <div 
                          key={user._id} 
                          className="relative"
                          onClick={(e) => {
                            
                            e.stopPropagation();
                            if (!isAuthenticated && mounted) {
                              setShowAuthModal(true);
                            }
                          }}
                        >
                          <EnhancedProfileCard user={user} />
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No profiles to display
                    </div>
                  )}
                </div>

                {/* Infinite Scroll Trigger */}
                {displayLimit < users.length && (
                  <div ref={loadMoreRef} className="mt-8 text-center">
                    {loadingMore ? (
                      <LoadingSpinner size="md" text="Loading more profiles..." />
                    ) : (
                      <div className="py-4">
                        <p className="text-gray-600 dark:text-pink-300 text-sm">
                          Scroll down to load more ({users.length - displayLimit} remaining)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Load More Button (Fallback for manual loading) */}
                {displayLimit < users.length && !loadingMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      Load More ({users.length - displayLimit} remaining)
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-500 hover:text-pink-600 transition-all font-medium text-sm"
                    >
                      ← Previous
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-all text-sm ${
                              page === pageNum
                                ? 'bg-pink-600 text-white'
                                : 'border-2 border-gray-300 hover:border-pink-500 hover:text-pink-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-gray-600 text-xs sm:text-sm">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-500 hover:text-pink-600 transition-all font-medium text-sm"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Authentication Modal - only render after mount */}
      {mounted && showAuthModal && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-black bg-opacity-50 absolute inset-0" onClick={() => setShowAuthModal(false)}></div>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full relative z-10 animate-scale-in">
            <div className="p-8">
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>

              {/* Modal Content */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Login Required
                </h2>
                <p className="text-gray-600 mb-6">
                  Please login or sign up to view full profiles, send interests, and shortlist matches.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all shadow-lg text-center"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full px-6 py-3 bg-white border-2 border-pink-600 text-pink-600 font-semibold rounded-md hover:bg-pink-50 transition-all shadow-md text-center"
                >
                  Sign Up
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full px-6 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  Continue Browsing
                </button>
              </div>

              {/* Benefits List */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">What you'll get:</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    View complete profiles with all details
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Send interests to matches you like
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Shortlist your favorite profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Get horoscope matching scores
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Message potential matches
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProfilesContent />
    </Suspense>
  );
}
