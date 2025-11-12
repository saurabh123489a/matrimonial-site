'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import SEOStructuredData from '@/components/SEOStructuredData';

export default function AboutUsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEOStructuredData type="about" />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('aboutUs.title')}</h1>
          <p className="text-xl md:text-2xl text-pink-100">{t('aboutUs.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-pink-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('aboutUs.mission.title')}</h2>
            <p className="text-gray-700 leading-relaxed" dir="auto">
              {t('aboutUs.mission.content')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('aboutUs.vision.title')}</h2>
            <p className="text-gray-700 leading-relaxed" dir="auto">
              {t('aboutUs.vision.content')}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t('aboutUs.features.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💑</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('aboutUs.features.marriage.title')}</h3>
              <p className="text-gray-600" dir="auto">{t('aboutUs.features.marriage.desc')}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('aboutUs.features.census.title')}</h3>
              <p className="text-gray-600" dir="auto">{t('aboutUs.features.census.desc')}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('aboutUs.features.family.title')}</h3>
              <p className="text-gray-600" dir="auto">{t('aboutUs.features.family.desc')}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('aboutUs.features.news.title')}</h3>
              <p className="text-gray-600" dir="auto">{t('aboutUs.features.news.desc')}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('aboutUs.features.community.title')}</h3>
              <p className="text-gray-600" dir="auto">{t('aboutUs.features.community.desc')}</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t('aboutUs.values.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('aboutUs.values.trust')}</h3>
              <p className="text-sm text-gray-700" dir="auto">{t('aboutUs.values.trustDesc')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('aboutUs.values.unity')}</h3>
              <p className="text-sm text-gray-700" dir="auto">{t('aboutUs.values.unityDesc')}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('aboutUs.values.heritage')}</h3>
              <p className="text-sm text-gray-700" dir="auto">{t('aboutUs.values.heritageDesc')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('aboutUs.values.innovation')}</h3>
              <p className="text-sm text-gray-700" dir="auto">{t('aboutUs.values.innovationDesc')}</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('aboutUs.contact.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-semibold text-gray-700 mb-1">{t('aboutUs.contact.email')}</h3>
              <p className="text-gray-600">support@ekgahoi.com</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-700 mb-1">{t('aboutUs.contact.phone')}</h3>
              <p className="text-gray-600">+91-XXXXXXXXXX</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-semibold text-gray-700 mb-1">{t('aboutUs.contact.address')}</h3>
              <p className="text-gray-600" dir="auto">{t('aboutUs.contact.addressValue')}</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link
            href="/donation"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            {t('common.donation')} {t('donation.title')} 💝
          </Link>
        </div>
      </div>
    </div>
  );
}


