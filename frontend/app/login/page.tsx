'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOTP, setSentOTP] = useState<string | null>(null); 

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.sendOTP(phone);
      if (response.status) {
        setSuccess(t('auth.otpSent'));
        setStep('otp');
        
        
        if (response.data.otp) {
          setSentOTP(response.data.otp);
        }
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      if ((err as any).isCorsError || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Unable to connect to server. Please ensure the backend is running on port 5050.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.verifyOTP(phone, otp);
      if (response.status && response.data.token) {
        auth.setToken(response.data.token);
        router.push('/profile');
        return;
      }
      setError('Invalid OTP. Please try again.');
    } catch (err: any) {
      if ((err as any).isCorsError || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Unable to connect to server. Please ensure the backend is running on port 5050.');
      } else {
        setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setSuccess('');
    setSentOTP(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? t('auth.login') : t('auth.enterOTP')}
          </h2>
            <p className="text-sm text-gray-600">
            {step === 'phone' ? (
              <>
                {t('auth.or')}{' '}
                <Link href="/register" className="font-medium text-pink-600 hover:text-pink-500">
                  {t('auth.createAccount')}
                </Link>
              </>
            ) : (
              <>
                {t('auth.otpSentTo')}{' '}
                <span className="font-medium">{phone}</span>
              </>
            )}
          </p>
        </div>

        {step === 'phone' ? (
            <form className="space-y-5" onSubmit={handleSendOTP}>
            {error && (
              <div className="rounded-lg p-3 bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-lg p-3 bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.phoneNumber')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={t('auth.enterPhone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {loading ? t('auth.sendingOTP') : 'Continue with phone'}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleVerifyOTP}>
            {error && (
              <div className="rounded-lg p-3 bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {sentOTP && (
              <div className="rounded-lg p-3 bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  {t('auth.developmentMode')}: OTP is <span className="font-bold text-lg">{sentOTP}</span>
                </p>
              </div>
            )}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.otpCode')}
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-center text-2xl tracking-[0.5em] font-semibold"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Enter the 6-digit code sent to your phone
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {loading ? t('auth.verifying') : t('auth.verifyOTP')}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="w-full flex justify-center py-2.5 px-4 border-2 border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
              >
                {t('auth.changePhoneNumber')}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
