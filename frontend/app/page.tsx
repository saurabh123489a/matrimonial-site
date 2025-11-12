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
    // Welcome message stays visible until user closes it manually
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
    <div className="min-h-screen bg-white dark:bg-[#0f1117] transition-colors">
      {/* Running Welcome Message - Temporary */}
      {showWelcomeMessage && (
        <div className="bg-gradient-to-r from-pink-600 via-red-600 to-pink-700 dark:from-pink-700 dark:via-pink-600 dark:to-pink-800 text-white py-3 overflow-hidden relative z-20">
          <button
            onClick={() => setShowWelcomeMessage(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 text-white hover:text-pink-200 transition-colors bg-black/20 rounded-full p-1"
            aria-label="Close welcome message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="marquee-container pr-16 sm:pr-20">
            <div className="marquee-text text-base sm:text-lg font-medium whitespace-nowrap">
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

      {/* Hero Banner Section - With Indian Couple Wedding Images */}
      <div className="relative overflow-hidden text-white">
        {/* Animated Sliding Background Images - Indian Couples */}
        <div className="absolute inset-0">
          {/* Indian Couple 1 - Traditional Wedding Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 20s linear infinite',
            }}
          />
          {/* Indian Couple 2 - Mandap Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 20s linear infinite',
              animationDelay: '5s',
            }}
          />
          {/* Indian Couple 3 - Wedding Reception */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 25s linear infinite',
              animationDelay: '10s',
            }}
          />
          {/* Indian Couple 4 - Traditional Pose */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 22s linear infinite',
              animationDelay: '15s',
            }}
          />
          {/* Indian Couple 5 - Red & Gold Traditional Attire */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga-1.jpg), url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 28s linear infinite',
              animationDelay: '18s',
            }}
          />
          {/* Indian Couple 6 - Wedding Portrait */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga-2.jpg), url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 30s linear infinite',
              animationDelay: '22s',
            }}
          />
          {/* Indian Couple 7 - Traditional Couple Photo */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga-3.jpg), url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 32s linear infinite',
              animationDelay: '26s',
            }}
          />
          {/* Gradient Overlay - very minimal for text readability only */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-red-600/10 to-pink-700/10 dark:from-pink-600/20 dark:via-pink-700/20 dark:to-pink-800/20"></div>
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
      <div className="bg-gray-50 dark:bg-[#0f1117] border-b border-gray-200 dark:border-[#262932] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-pink-300 mb-2">Find Your Perfect Match</h2>
            <p className="text-gray-600 dark:text-pink-200 text-sm">Search from thousands of verified profiles</p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#181b23] p-6 sm:p-8 shadow-sm transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-pink-200 mb-2 uppercase tracking-wider">Looking For</label>
                <select
                  value={quickSearch.gender}
                  onChange={(e) => setQuickSearch({...quickSearch, gender: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-[#303341] text-gray-900 dark:text-pink-50 focus:outline-none focus:border-pink-500 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-500 dark:focus:ring-pink-400 transition-colors text-sm bg-white dark:bg-[#181b23]"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-pink-200 mb-2 uppercase tracking-wider">Age Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={quickSearch.ageFrom}
                    onChange={(e) => setQuickSearch({...quickSearch, ageFrom: e.target.value})}
                    className="w-1/2 px-4 py-3 border border-gray-300 dark:border-[#303341] text-gray-900 dark:text-pink-50 bg-white dark:bg-[#181b23] focus:outline-none focus:border-pink-500 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-500 dark:focus:ring-pink-400 transition-colors text-sm"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={quickSearch.ageTo}
                    onChange={(e) => setQuickSearch({...quickSearch, ageTo: e.target.value})}
                    className="w-1/2 px-4 py-3 border border-gray-300 dark:border-[#303341] text-gray-900 dark:text-pink-50 bg-white dark:bg-[#181b23] focus:outline-none focus:border-pink-500 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-500 dark:focus:ring-pink-400 transition-colors text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-pink-200 mb-2 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={quickSearch.city}
                  onChange={(e) => setQuickSearch({...quickSearch, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-[#303341] text-gray-900 dark:text-pink-50 bg-white dark:bg-[#181b23] focus:outline-none focus:border-pink-500 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-500 dark:focus:ring-pink-400 transition-colors text-sm"
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
      <div className="bg-gradient-to-br from-pink-50 via-red-50 to-pink-100 dark:from-[#161821] dark:via-[#151720] dark:to-[#12141b] border-t border-b border-pink-100 dark:border-[#262932] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-pink-200 mb-4">
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

      {/* CTA Section - With Indian Couple Images */}
      <div className="relative overflow-hidden text-white">
        {/* Sliding Indian Couple Images */}
        <div className="absolute inset-0">
          {/* Indian Couple 1 - Traditional Wedding Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 25s linear infinite',
            }}
          />
          {/* Indian Couple 2 - Wedding Reception */}
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
          {/* Indian Couple 3 - Traditional Pose */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 28s linear infinite',
              animationDelay: '16s',
            }}
          />
          {/* Indian Couple 4 - Red & Gold Traditional Attire */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga-1.jpg), url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 30s linear infinite',
              animationDelay: '12s',
            }}
          />
          {/* Indian Couple 5 - Wedding Portrait */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga-2.jpg), url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 32s linear infinite',
              animationDelay: '20s',
            }}
          />
          {/* Indian Couple 6 - Traditional Couple Photo */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/bridal-lehenga-3.jpg), url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontalReverse 34s linear infinite',
              animationDelay: '24s',
            }}
          />
          {/* Indian Couple 7 - Mandap Ceremony */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606800057522-569310b3cbf8?w=1920&h=1080&fit=crop&q=90)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'slideHorizontal 36s linear infinite',
              animationDelay: '28s',
            }}
          />
        </div>
        {/* Gradient Overlay - very minimal for text readability only */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-red-600/10 to-pink-700/10 dark:from-pink-500/10 dark:via-pink-600/10 dark:to-pink-700/10"></div>
        
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
