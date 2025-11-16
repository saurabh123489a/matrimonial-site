'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/Logo';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {step === 'phone' && (
            <div className="text-center mb-6">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <Logo size="lg" />
              </div>
              
              {/* Welcoming Text */}
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Welcome Back!
              </h2>
              <p className="text-base text-gray-600 mb-1">
                Continue your journey to find your perfect match
              </p>
              <p className="text-sm text-gray-500">
                {t('auth.or')}{' '}
                <Link href="/register" className="font-medium text-pink-600 hover:text-pink-500 transition-colors">
                  {t('auth.createAccount')}
                </Link>
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t('auth.enterOTP')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('auth.otpSentTo')}{' '}
                <span className="font-medium">{phone}</span>
              </p>
            </div>
          )}

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
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 hover:from-pink-700 hover:via-pink-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 btn-primary btn-scale"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.sendingOTP')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Continue with phone
                  </>
                )}
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
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 hover:from-pink-700 hover:via-pink-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 btn-primary btn-scale"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.verifying')}
                  </>
                ) : (
                  t('auth.verifyOTP')
                )}
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
