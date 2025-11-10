'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { userApi, User } from '@/lib/api';
import EnhancedProfileCard from '@/components/EnhancedProfileCard';
import { useTranslation } from '@/hooks/useTranslation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';

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

  // Check authentication on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    const authenticated = auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    // Load current user for gender-based filtering
    if (authenticated) {
      userApi.getMe().then(response => {
        if (response.status) {
          setCurrentUser(response.data);
        }
      }).catch(() => {
        // Silently fail
      });
    }
    
    // Show modal if not authenticated (after a brief delay for better UX)
    if (!authenticated) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 500); // Small delay to let page render
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Gahoi ID search
  const [gahoiId, setGahoiId] = useState(searchParams.get('gahoiId') || '');
  
  // Gahoi Sathi style comprehensive filters
  const [filters, setFilters] = useState({
    gender: searchParams.get('gender') || '',
    minAge: searchParams.get('minAge') || '',
    maxAge: searchParams.get('maxAge') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    religion: searchParams.get('religion') || '',
    caste: searchParams.get('caste') || '',
    education: searchParams.get('education') || '',
    occupation: searchParams.get('occupation') || '',
    maritalStatus: '',
    minHeight: '',
    maxHeight: '',
    subCaste: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10); // Show only 10 initially

  // Pull-to-refresh hook
  const { isRefreshing, isPulling, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await loadProfiles();
    },
    enabled: true,
  });

  const loadProfiles = async () => {
    setLoading(true);
    setError('');
    
    try {
      // If Gahoi ID is provided, search by ID via search API
      if (gahoiId && gahoiId.trim()) {
        const id = gahoiId.trim();
        // Validate: must be exactly 5 digits starting with 1000
        if (!/^100[0-9]{2}$/.test(id)) {
          setError('Gahoi ID must be a 5-digit number starting with 1000 (e.g., 10000-10099)');
          setLoading(false);
          return;
        }
        
        try {
          // Use search API with gahoiId parameter (backend handles the ID lookup)
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

      // Otherwise, use filters
      const filterParams: any = { page: 1, limit: 100 }; // Fetch more, but display only 10 initially
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'minAge' || key === 'maxAge' || key === 'minHeight' || key === 'maxHeight') {
            filterParams[key] = parseInt(value);
          } else {
            filterParams[key] = value;
          }
        }
      });

      // Auto-filter by opposite gender if user is authenticated and no gender filter is set
      if (isAuthenticated && currentUser && !filterParams.gender) {
        // Females see males, Males see females
        if (currentUser.gender === 'female') {
          filterParams.gender = 'male';
        } else if (currentUser.gender === 'male') {
          filterParams.gender = 'female';
        }
      }

      const response = await userApi.search(filterParams);
      
      if (response.status) {
        const allUsers = response.data || [];
        setUsers(allUsers);
        if (response.pagination) {
          setPagination(response.pagination);
        }
        // Reset display limit when new search is performed
        setDisplayLimit(10);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load profiles when filters change or when currentUser is loaded (for gender filtering)
    // If authenticated, wait for currentUser to load; if not authenticated, load immediately
    if (!isAuthenticated || currentUser !== null) {
      loadProfiles();
    }
  }, [page, gahoiId, currentUser, isAuthenticated]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    loadProfiles();
  };

  const clearFilters = () => {
    setGahoiId('');
    setFilters({
      gender: '',
      minAge: '',
      maxAge: '',
      city: '',
      state: '',
      religion: '',
      caste: '',
      education: '',
      occupation: '',
      maritalStatus: '',
      minHeight: '',
      maxHeight: '',
      subCaste: '',
    });
    setPage(1);
  };

  // Handle profile card click for non-authenticated users
  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setShowAuthModal(true);
    }
  };

  // Update authentication status when user logs in (listen to storage changes)
  useEffect(() => {
    const handleStorageChange = () => {
      const authenticated = auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setShowAuthModal(false);
      }
    };

    // Listen for storage changes (when user logs in)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case user logged in another tab
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 relative transition-colors">
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 px-6 py-3 rounded-b-lg shadow-lg flex items-center gap-3 animate-slide-up">
          {isRefreshing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">Refreshing...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">⬇️</span>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">Pull to refresh</span>
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
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 filter-section lg:sticky lg:top-4 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Refine Search</h2>
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Search by Gahoi ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gahoiId}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow 5-digit numbers starting with 1000
                        if (value === '' || /^1000[0-9]$/.test(value) || /^100[0-9]{2}$/.test(value)) {
                          setGahoiId(value);
                          setPage(1);
                        }
                      }}
                      placeholder="10000"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-slate-600 rounded-md focus:outline-none focus:border-pink-500 text-gray-800 dark:text-slate-100 dark:bg-slate-700"
                      maxLength={5}
                    />
                    {gahoiId && (
                      <button
                        onClick={() => {
                          setGahoiId('');
                          setPage(1);
                        }}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                        aria-label="Clear Gahoi ID"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    5-digit ID (10000-10099). Even = Male, Odd = Female
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">OR use filters below</p>
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
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800 mb-2"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                    placeholder="State"
                  />
                </div>

                {/* Religion */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Religion
                  </label>
                  <input
                    type="text"
                    value={filters.religion}
                    onChange={(e) => handleFilterChange('religion', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                    placeholder="Religion"
                  />
                </div>

                {/* Caste */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caste
                  </label>
                  <input
                    type="text"
                    value={filters.caste}
                    onChange={(e) => handleFilterChange('caste', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800 mb-2"
                    placeholder="Caste"
                  />
                  <input
                    type="text"
                    value={filters.subCaste}
                    onChange={(e) => handleFilterChange('subCaste', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                    placeholder="Sub-Caste"
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
                    onChange={(e) => handleFilterChange('education', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                    placeholder="Education"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={filters.occupation}
                    onChange={(e) => handleFilterChange('occupation', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                    placeholder="Occupation"
                  />
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
                    Height (cm)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={filters.minHeight}
                      onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-pink-500 text-gray-800"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="100"
                      max="250"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
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
                  {users.slice(0, displayLimit).map((user) => (
                    <div 
                      key={user._id} 
                      className={mounted && !isAuthenticated ? 'cursor-pointer relative' : ''}
                    >
                      {mounted && !isAuthenticated && (
                        <div 
                          className="absolute inset-0 z-10" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAuthModal(true);
                          }}
                        ></div>
                      )}
                      <EnhancedProfileCard user={user} />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {displayLimit < users.length && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setDisplayLimit(prev => Math.min(prev + 10, users.length))}
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
