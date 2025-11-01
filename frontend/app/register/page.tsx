'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.createAccountTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.signInToAccount').split('Or')[0]}Or{' '}
            <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
              {t('auth.signInToAccount').includes('sign in') ? 'sign in to your account' : 'अपने खाते में साइन इन करें'}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                {t('auth.fullName')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.fullName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.emailOptional')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.emailOptional')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                {t('auth.phoneOptional')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.phoneOptional')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="gender" className="sr-only">
                  {t('auth.gender')}
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="male">{t('auth.male')}</option>
                  <option value="female">{t('auth.female')}</option>
                  <option value="other">{t('auth.other')}</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="age" className="sr-only">
                  {t('auth.age')}
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.age')}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md shadow-sm bg-white p-4 border border-gray-200">
            <label htmlFor="communityPosition" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.communityPosition')}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {t('auth.communityPositionDesc')}
            </p>
            <select
              id="communityPosition"
              name="communityPosition"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {loading ? t('auth.creatingAccount') : t('auth.signUp')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

