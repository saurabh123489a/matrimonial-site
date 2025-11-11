'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StructuredData from '@/components/StructuredData';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState({
    gender: '',
    ageFrom: '',
    ageTo: '',
    city: '',
  });
  const [mounted, setMounted] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Hide welcome message after 10 seconds
    const timer = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleQuickSearch = () => {
    const params = new URLSearchParams();
    if (quickSearch.gender) params.append('gender', quickSearch.gender);
    if (quickSearch.ageFrom) params.append('minAge', quickSearch.ageFrom);
    if (quickSearch.ageTo) params.append('maxAge', quickSearch.ageTo);
    if (quickSearch.city) params.append('city', quickSearch.city);
    
    router.push(`/profiles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Running Welcome Message - Temporary */}
      {showWelcomeMessage && (
        <div className="bg-gradient-to-r from-pink-600 via-red-600 to-pink-700 dark:from-pink-700 dark:via-red-700 dark:to-pink-800 text-white py-3 overflow-hidden relative animate-slide-up">
          <button
            onClick={() => setShowWelcomeMessage(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-pink-200 transition-colors"
            aria-label="Close welcome message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="marquee-container">
            <div className="marquee-text text-lg sm:text-xl font-medium whitespace-nowrap">
              🎉 Saurabh Gupta welcomes you to ekGahoi - Your trusted matrimonial platform 🎉
              <span className="mx-8">💍</span>
              🎉 Saurabh Gupta welcomes you to ekGahoi - Your trusted matrimonial platform 🎉
              <span className="mx-8">💍</span>
              🎉 Saurabh Gupta welcomes you to ekGahoi - Your trusted matrimonial platform 🎉
              <span className="mx-8">💍</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section - With Indian Wedding Ceremony Images (Mandap, Reception, Mehndi, Haldi) */}
      <div className="relative overflow-hidden text-white">
        {/* Animated Sliding Background Images - Indian Wedding Ceremonies */}
        <div className="absolute inset-0">
          {/* Mandap (Wedding Ceremony) - Sliding Left - Landscape Indian Traditional */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 20s linear infinite',
            }}
          />
          {/* Reception - Sliding Right - Landscape Indian Wedding Reception */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 20s linear infinite',
              animationDelay: '5s',
            }}
          />
          {/* Mehndi (Henna Ceremony) - Sliding Left - Landscape Bridal Mehndi */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 25s linear infinite',
              animationDelay: '10s',
            }}
          />
          {/* Haldi (Turmeric Ceremony) - Sliding Right - Landscape Haldi Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 22s linear infinite',
              animationDelay: '15s',
            }}
          />
          {/* Bridal Photography - Landscape Red & Gold Lehenga */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 28s linear infinite',
              animationDelay: '18s',
            }}
          />
          {/* Additional Bridal Image - Landscape Traditional Indian Bride */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 30s linear infinite',
              animationDelay: '22s',
            }}
          />
          {/* Gradient Overlay - very minimal for text readability only */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-red-600/10 to-pink-700/10 dark:from-pink-700/10 dark:via-red-700/10 dark:to-pink-800/10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light mb-6 tracking-tight leading-none drop-shadow-lg">
              {t('home.title')}
            </h1>
            <p className="text-lg sm:text-xl text-pink-100 mb-8 font-light max-w-xl drop-shadow-md">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-medium hover:bg-gray-100 transition-colors text-sm uppercase tracking-wider shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/profiles"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-medium hover:bg-white hover:text-pink-600 transition-colors text-sm uppercase tracking-wider shadow-lg backdrop-blur-sm"
              >
                Browse Profiles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search Section - Clean & Minimal */}
      <div className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-red-900 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-red-600 mb-2">Find Your Perfect Match</h2>
            <p className="text-gray-600 dark:text-red-500 text-sm">Search from thousands of verified profiles</p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white dark:bg-black p-6 sm:p-8 shadow-sm transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Looking For</label>
                <select
                  value={quickSearch.gender}
                  onChange={(e) => setQuickSearch({...quickSearch, gender: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors text-sm bg-white"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Age Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={quickSearch.ageFrom}
                    onChange={(e) => setQuickSearch({...quickSearch, ageFrom: e.target.value})}
                    className="w-1/2 px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors text-sm"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={quickSearch.ageTo}
                    onChange={(e) => setQuickSearch({...quickSearch, ageTo: e.target.value})}
                    className="w-1/2 px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={quickSearch.city}
                  onChange={(e) => setQuickSearch({...quickSearch, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleQuickSearch}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium hover:from-pink-700 hover:to-red-700 transition-colors text-sm uppercase tracking-wider"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Clean Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 animate-fade-in">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-red-600">
              Complete Community Platform
            </span>
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">{t('home.trustedPlatform')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Marriage Matching */}
          <div className="text-center group animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">💍</div>
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white uppercase tracking-wide">{t('home.features.marriage')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.marriageDesc')}</p>
            <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
          </div>
          
          {/* Census */}
          <div className="text-center group animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">📊</div>
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white uppercase tracking-wide">{t('home.features.census')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.censusDesc')}</p>
            <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
          </div>
          
          {/* Family Data */}
          <div className="text-center group animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">👨‍👩‍👧‍👦</div>
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white uppercase tracking-wide">{t('home.features.family')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.familyDesc')}</p>
            <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
          </div>
          
          {/* Community News */}
          <div className="text-center group animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">📰</div>
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white uppercase tracking-wide">{t('home.features.news')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.features.newsDesc')}</p>
            <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Stats Section - Minimal Design */}
      <div className="bg-gradient-to-br from-pink-50 via-red-50 to-pink-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border-t border-b border-pink-100 dark:border-red-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-red-600 mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-red-600">
                Community Impact
              </span>
            </h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Serving the Gahoi community with comprehensive solutions
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-light bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">1000+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Happy Marriages</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-light bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">5000+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Families Registered</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-light bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">10K+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Census Records</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-light bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">Active</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">Community News</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - With Indian Wedding Ceremony Images */}
      <div className="relative overflow-hidden text-white">
        {/* Sliding Indian Wedding Ceremony Images - Bridal Photography Style */}
        <div className="absolute inset-0">
          {/* Mandap - Landscape Indian Wedding Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 25s linear infinite',
            }}
          />
          {/* Reception - Landscape Wedding Reception */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 25s linear infinite',
              animationDelay: '8s',
            }}
          />
          {/* Mehndi - Landscape Henna Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 28s linear infinite',
              animationDelay: '16s',
            }}
          />
          {/* Haldi - Landscape Turmeric Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 30s linear infinite',
              animationDelay: '12s',
            }}
          />
          {/* Bridal Photography - Landscape Red & Gold Lehenga Bride */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 32s linear infinite',
              animationDelay: '20s',
            }}
          />
        </div>
        {/* Gradient Overlay - very minimal for text readability only */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-red-600/10 to-pink-700/10 dark:from-pink-700/10 dark:via-red-700/10 dark:to-pink-800/10"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6 drop-shadow-lg">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-lg sm:text-xl text-pink-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Join thousands of happy couples who found their life partners through ekGahoi
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-medium hover:bg-gray-100 transition-colors text-sm uppercase tracking-wider shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/profiles"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-medium hover:bg-white hover:text-pink-600 transition-colors text-sm uppercase tracking-wider shadow-lg backdrop-blur-sm"
            >
              Browse Profiles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
