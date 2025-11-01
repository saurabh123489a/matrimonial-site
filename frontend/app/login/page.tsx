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
  const [sentOTP, setSentOTP] = useState<string | null>(null); // For development mode

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
        
        // In development mode, show OTP in the response
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'phone' ? t('auth.login') : t('auth.enterOTP')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
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
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            {error && (
              <div className="rounded-md p-4 bg-red-50">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-md p-4 bg-green-50">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
            <div>
              <label htmlFor="phone" className="sr-only">
                {t('auth.phoneNumber')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.enterPhone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !phone}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {loading ? t('auth.sendingOTP') : t('auth.sendOTP')}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            {error && (
              <div className="rounded-md p-4 bg-red-50">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {sentOTP && (
              <div className="rounded-md p-4 bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  {t('auth.developmentMode')}: OTP is <span className="font-bold text-lg">{sentOTP}</span>
                </p>
              </div>
            )}
            <div>
              <label htmlFor="otp" className="sr-only">
                {t('auth.otpCode')}
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder={t('auth.enterOTPCode')}
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {loading ? t('auth.verifying') : t('auth.verifyOTP')}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                {t('auth.changePhoneNumber')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
