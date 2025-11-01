'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm rounded-md ${
          language === 'en'
            ? 'bg-pink-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="English"
      >
        English
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 text-sm rounded-md ${
          language === 'hi'
            ? 'bg-pink-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="हिंदी"
      >
        हिंदी
      </button>
    </div>
  );
}

