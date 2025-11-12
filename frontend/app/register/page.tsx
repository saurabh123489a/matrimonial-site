'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male' as 'male' | 'female' | 'other',
    age: '',
    communityPosition: '' as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data: any = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      };
      
      // Remove empty fields by setting to undefined
      if (!data.email) data.email = undefined;
      if (!data.phone) data.phone = undefined;

      const response = await userApi.create(data);
      
      if (response.status && response.data) {
        // Store token if provided (for future auth endpoints)
        if ((response.data as any).token) {
          auth.setToken((response.data as any).token);
        }
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t('auth.createAccountTitle')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('auth.signInToAccount').split('Or')[0]}Or{' '}
              <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
                {t('auth.signInToAccount').includes('sign in') ? 'sign in to your account' : 'अपने खाते में साइन इन करें'}
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.fullName')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={t('auth.fullName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: sanitizeFormInput(e.target.value, 'text') })}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.emailOptional')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={t('auth.emailOptional')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: sanitizeFormInput(e.target.value, 'email') })}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.phoneOptional')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={t('auth.phoneOptional')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: sanitizeFormInput(e.target.value, 'phone') })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.gender')}
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="male">{t('auth.male')}</option>
                  <option value="female">{t('auth.female')}</option>
                  <option value="other">{t('auth.other')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.age')}
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder={t('auth.age')}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 border-2 border-gray-200">
            <label htmlFor="communityPosition" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.communityPosition')}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {t('auth.communityPositionDesc')}
            </p>
            <select
              id="communityPosition"
              name="communityPosition"
              className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              value={formData.communityPosition || ''}
              onChange={(e) => setFormData({ ...formData, communityPosition: e.target.value || null })}
            >
              <option value="">{t('auth.noPosition')}</option>
              <option value="community-leader">{t('auth.communityLeader')}</option>
              <option value="community-member">{t('auth.communityMember')}</option>
              <option value="family-head">{t('auth.familyHead')}</option>
              <option value="elder">{t('auth.elder')}</option>
              <option value="volunteer">{t('auth.volunteer')}</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? t('auth.creatingAccount') : t('auth.signUp')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

