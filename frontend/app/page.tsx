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
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Running Welcome Message - Traditional Style */}
      {showWelcomeMessage && (
        <div className="relative overflow-hidden animate-slide-up" style={{ background: 'linear-gradient(to right, #8B0000, #A00000, #8B0000)' }}>
          <div className="absolute inset-0 paisley-pattern opacity-20"></div>
          <button
            onClick={() => setShowWelcomeMessage(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:opacity-80 transition-opacity"
            aria-label="Close welcome message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="marquee-container py-3 relative z-10">
            <div className="marquee-text text-lg sm:text-xl font-medium text-white">
              🎉 Saurabh Gupta welcomes you to ekGahoi - Your trusted matrimonial platform 🎉
              <span className="mx-8">💍</span>
              🎉 Saurabh Gupta welcomes you to ekGahoi - Your trusted matrimonial platform 🎉
              <span className="mx-8">💍</span>
              🎉 Saurabh Gupta welcomes you to ekGahoi - Your trusted matrimonial platform 🎉
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section - Traditional Elegance with Warm Gradient */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #A00000 30%, #F59E0B 70%, #D97706 100%)' }}>
        {/* Cultural Pattern Overlay */}
        <div className="absolute inset-0 mandala-pattern opacity-10"></div>
        <div className="absolute inset-0 paisley-pattern opacity-5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-6 tracking-tight leading-none" style={{ fontFamily: 'Playfair Display, Cormorant, serif', fontWeight: 600 }}>
              {t('home.title')}
            </h1>
            <p className="text-lg sm:text-xl mb-8 max-w-xl" style={{ color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1.6 }}>
              {t('home.subtitle')}
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xl">✓</span>
                <span className="text-sm font-medium">Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xl">🔒</span>
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xl">⭐</span>
                <span className="text-sm font-medium">1000+ Success Stories</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white font-semibold transition-all text-sm uppercase tracking-wider rounded-md hover:scale-105 active:scale-95"
                style={{ color: '#8B0000' }}
              >
                Get Started
              </Link>
              <Link
                href="/profiles"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white font-semibold transition-all text-sm uppercase tracking-wider rounded-md hover:bg-white/10 active:scale-95"
                style={{ color: 'white' }}
              >
                Browse Profiles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search Section - Traditional Styling */}
      <div className="section-divider"></div>
      <div style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: 'Playfair Display, Cormorant, serif', color: '#8B0000' }}>Find Your Perfect Match</h2>
            <p style={{ color: '#6B7280' }}>Search from thousands of verified profiles</p>
          </div>
          
          <div className="max-w-4xl mx-auto traditional-border p-6 sm:p-8" style={{ backgroundColor: 'white' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#374151' }}>Looking For</label>
                <select
                  value={quickSearch.gender}
                  onChange={(e) => setQuickSearch({...quickSearch, gender: e.target.value})}
                  className="traditional-select w-full text-sm"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#374151' }}>Age Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={quickSearch.ageFrom}
                    onChange={(e) => setQuickSearch({...quickSearch, ageFrom: e.target.value})}
                    className="search-input w-1/2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={quickSearch.ageTo}
                    onChange={(e) => setQuickSearch({...quickSearch, ageTo: e.target.value})}
                    className="search-input w-1/2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#374151' }}>City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={quickSearch.city}
                  onChange={(e) => setQuickSearch({...quickSearch, city: e.target.value})}
                  className="search-input w-full text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleQuickSearch}
                  className="btn-primary w-full text-sm uppercase tracking-wider"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Traditional Grid */}
      <div className="section-divider"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 animate-fade-in" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'Playfair Display, Cormorant, serif', color: '#8B0000' }}>
            Complete Community Platform
          </h2>
          <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>{t('home.trustedPlatform')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Marriage Matching */}
          <div className="text-center group animate-slide-up success-card" style={{ animationDelay: '0.1s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">💍</div>
            <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: '#8B0000' }}>{t('home.features.marriage')}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{t('home.features.marriageDesc')}</p>
            <div className="mt-4 w-12 h-0.5 mx-auto" style={{ background: 'linear-gradient(to right, #8B0000, #F59E0B)' }}></div>
          </div>
          
          {/* Census */}
          <div className="text-center group animate-slide-up success-card" style={{ animationDelay: '0.2s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">📊</div>
            <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: '#8B0000' }}>{t('home.features.census')}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{t('home.features.censusDesc')}</p>
            <div className="mt-4 w-12 h-0.5 mx-auto" style={{ background: 'linear-gradient(to right, #8B0000, #F59E0B)' }}></div>
          </div>
          
          {/* Family Data */}
          <div className="text-center group animate-slide-up success-card" style={{ animationDelay: '0.3s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">👨‍👩‍👧‍👦</div>
            <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: '#8B0000' }}>{t('home.features.family')}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{t('home.features.familyDesc')}</p>
            <div className="mt-4 w-12 h-0.5 mx-auto" style={{ background: 'linear-gradient(to right, #8B0000, #F59E0B)' }}></div>
          </div>
          
          {/* Community News */}
          <div className="text-center group animate-slide-up success-card" style={{ animationDelay: '0.4s' }}>
            <div className="text-5xl mb-6 group-hover:scale-105 transition-transform duration-300">📰</div>
            <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: '#8B0000' }}>{t('home.features.news')}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{t('home.features.newsDesc')}</p>
            <div className="mt-4 w-12 h-0.5 mx-auto" style={{ background: 'linear-gradient(to right, #8B0000, #F59E0B)' }}></div>
          </div>
        </div>
      </div>

      {/* Stats Section - Traditional Design */}
      <div className="section-divider"></div>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)' }}>
        <div className="absolute inset-0 paisley-pattern opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'Playfair Display, Cormorant, serif', color: '#8B0000' }}>
              Community Impact
            </h2>
            <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
              Serving the Gahoi community with comprehensive solutions
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-semibold mb-2" style={{ background: 'linear-gradient(135deg, #8B0000, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>1000+</div>
              <div style={{ color: '#6B7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Happy Marriages</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-semibold mb-2" style={{ background: 'linear-gradient(135deg, #8B0000, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>5000+</div>
              <div style={{ color: '#6B7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Families Registered</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-semibold mb-2" style={{ background: 'linear-gradient(135deg, #8B0000, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10K+</div>
              <div style={{ color: '#6B7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Census Records</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-semibold mb-2" style={{ background: 'linear-gradient(135deg, #8B0000, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Active</div>
              <div style={{ color: '#6B7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Community News</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Security Section */}
      <div className="section-divider"></div>
      <div style={{ backgroundColor: '#FFF8F0', padding: '4rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'Playfair Display, Cormorant, serif', color: '#8B0000' }}>
              Trust & Security
            </h2>
            <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
              Your privacy and security are our top priorities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 success-card">
              <div className="trust-icon text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#8B0000' }}>Verified Profiles</h3>
              <p style={{ color: '#6B7280' }}>All profiles are verified through email, phone, and ID verification</p>
            </div>
            <div className="text-center p-6 success-card">
              <div className="security-icon text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#8B0000' }}>Privacy Protected</h3>
              <p style={{ color: '#6B7280' }}>Your personal information is encrypted and never shared without consent</p>
            </div>
            <div className="text-center p-6 success-card">
              <div className="text-5xl mb-4" style={{ color: '#F59E0B' }}>⭐</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#8B0000' }}>Success Stories</h3>
              <p style={{ color: '#6B7280' }}>Join 1000+ happy couples who found their perfect match</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Traditional Style */}
      <div className="section-divider"></div>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #A00000 30%, #F59E0B 70%, #D97706 100%)' }}>
        <div className="absolute inset-0 mandala-pattern opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6" style={{ fontFamily: 'Playfair Display, Cormorant, serif', fontWeight: 600 }}>
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            Join thousands of happy couples who found their life partners through ekGahoi
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white font-semibold transition-all text-sm uppercase tracking-wider rounded-md hover:scale-105 active:scale-95"
              style={{ color: '#8B0000' }}
            >
              Create Free Account
            </Link>
            <Link
              href="/profiles"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white font-semibold transition-all text-sm uppercase tracking-wider rounded-md hover:bg-white/10 active:scale-95"
            >
              Browse Profiles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
