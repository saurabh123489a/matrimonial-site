'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState({
    gender: '',
    ageFrom: '',
    ageTo: '',
    city: '',
  });

  const handleQuickSearch = () => {
    const params = new URLSearchParams();
    if (quickSearch.gender) params.append('gender', quickSearch.gender);
    if (quickSearch.ageFrom) params.append('minAge', quickSearch.ageFrom);
    if (quickSearch.ageTo) params.append('maxAge', quickSearch.ageTo);
    if (quickSearch.city) params.append('city', quickSearch.city);
    
    router.push(`/profiles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 via-red-600 to-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              {t('home.subtitle')}
            </p>
            
            {/* Quick Search Box - Marriage Matching */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6 mt-8">
              <h3 className="text-gray-800 font-semibold text-lg mb-2 text-center">
                Marriage Matching - Start Your Search
              </h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Find your perfect life partner from the Gahoi community
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Looking For</label>
                  <select
                    value={quickSearch.gender}
                    onChange={(e) => setQuickSearch({...quickSearch, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="From"
                      value={quickSearch.ageFrom}
                      onChange={(e) => setQuickSearch({...quickSearch, ageFrom: e.target.value})}
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="number"
                      placeholder="To"
                      value={quickSearch.ageTo}
                      onChange={(e) => setQuickSearch({...quickSearch, ageTo: e.target.value})}
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={quickSearch.city}
                    onChange={(e) => setQuickSearch({...quickSearch, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleQuickSearch}
                    className="w-full px-6 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-md hover:from-pink-700 hover:to-red-700 transition-all shadow-lg"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-pink-600 font-semibold rounded-md hover:bg-gray-100 transition-all shadow-lg"
              >
                {t('home.getStarted')}
              </Link>
              <Link
                href="/profiles"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-pink-600 transition-all"
              >
                {t('home.browseProfiles')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Complete Community Platform */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Community Platform</h2>
          <p className="text-gray-600 text-lg">{t('home.trustedPlatform')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Marriage Matching */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">💍</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.marriage')}</h3>
            <p className="text-gray-600 text-sm">{t('home.features.marriageDesc')}</p>
          </div>
          
          {/* Census */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.census')}</h3>
            <p className="text-gray-600 text-sm">{t('home.features.censusDesc')}</p>
          </div>
          
          {/* Family Data */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.family')}</h3>
            <p className="text-gray-600 text-sm">{t('home.features.familyDesc')}</p>
          </div>
          
          {/* Community News */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.news')}</h3>
            <p className="text-gray-600 text-sm">{t('home.features.newsDesc')}</p>
          </div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="bg-gradient-to-r from-pink-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Impact</h2>
            <p className="text-xl text-gray-700">Serving the Gahoi community with comprehensive solutions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-pink-600 mb-2">1000+</div>
              <div className="text-gray-700 font-medium">Happy Marriages</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-pink-600 mb-2">5000+</div>
              <div className="text-gray-700 font-medium">Families Registered</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-pink-600 mb-2">10K+</div>
              <div className="text-gray-700 font-medium">Census Records</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-pink-600 mb-2">Active</div>
              <div className="text-gray-700 font-medium">Community News</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
