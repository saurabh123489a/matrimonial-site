'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      className="inline-flex items-center bg-gray-100"
      role="tablist"
      aria-label="Language selector"
    >
      <button
        onClick={() => setLanguage('en')}
        role="tab"
        aria-selected={language === 'en'}
        aria-label="Switch to English"
        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
          language === 'en'
            ? 'bg-pink-600 text-white shadow-sm'
            : 'text-gray-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        role="tab"
        aria-selected={language === 'hi'}
        aria-label="Switch to Hindi"
        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
          language === 'hi'
            ? 'bg-pink-600 text-white shadow-sm'
            : 'text-gray-700'
        }`}
      >
        हिं
      </button>
    </div>
  );
}

