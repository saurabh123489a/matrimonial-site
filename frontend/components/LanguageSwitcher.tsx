'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md whitespace-nowrap ${
          language === 'en'
            ? 'bg-pink-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md whitespace-nowrap ${
          language === 'hi'
            ? 'bg-pink-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="हिंदी"
      >
        हिं
      </button>
    </div>
  );
}

