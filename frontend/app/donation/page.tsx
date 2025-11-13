'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';

export default function DonationPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [donationMethod, setDonationMethod] = useState<'upi' | 'bank' | 'qr'>('upi');
  const [amount, setAmount] = useState<string>('500');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    upiId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const presetAmounts = ['100', '500', '1000', '2500', '5000', '10000'];

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    if (parseInt(value) >= 100) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseInt(amount) < 100) {
      showError(t('donation.amount.minAmount'));
      return;
    }
    
    setSubmitting(true);

    
    setTimeout(() => {
      setSubmitting(false);
      setShowThankYou(true);
      showSuccess(t('donation.thankYou.message'));
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(t('donation.donationMethods.bank.copy') + ' ' + text);
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('donation.thankYou.title')}</h1>
          <p className="text-lg text-gray-700 mb-6" dir="auto">
            {t('donation.thankYou.message')}
          </p>
          <p className="text-sm text-gray-600 mb-8" dir="auto">
            {t('donation.thankYou.receipt')}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all"
          >
            {t('donation.thankYou.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('donation.title')}</h1>
          <p className="text-xl text-pink-100">{t('donation.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Why Donate */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('donation.whyDonate.title')}</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">💚</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t('donation.whyDonate.reason1.title')}</h3>
                      <p className="text-sm text-gray-600" dir="auto">{t('donation.whyDonate.reason1.desc')}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">🔧</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t('donation.whyDonate.reason2.title')}</h3>
                      <p className="text-sm text-gray-600" dir="auto">{t('donation.whyDonate.reason2.desc')}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">⚡</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t('donation.whyDonate.reason3.title')}</h3>
                      <p className="text-sm text-gray-600" dir="auto">{t('donation.whyDonate.reason3.desc')}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">🎧</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t('donation.whyDonate.reason4.title')}</h3>
                      <p className="text-sm text-gray-600" dir="auto">{t('donation.whyDonate.reason4.desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">{t('donation.info.title')}</h3>
              <ul className="text-sm text-gray-700 space-y-2" dir="auto">
                <li>• {t('donation.info.tax')}</li>
                <li>• {t('donation.info.transparency')}</li>
                <li>• {t('donation.info.usage')}</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-700 mb-6" dir="auto">{t('donation.description')}</p>

              {/* Amount Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('donation.amount.title')}</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountChange(amt)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        amount === amt && !customAmount
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('donation.amount.custom')}
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    placeholder={t('donation.amount.enterAmount')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('donation.amount.minAmount')}</p>
                </div>
              </div>

              {/* Donation Method Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('donation.donationMethods.title')}</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setDonationMethod('upi')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      donationMethod === 'upi'
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-semibold">{t('donation.donationMethods.upi.title')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationMethod('bank')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      donationMethod === 'bank'
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏦</div>
                    <div className="font-semibold">{t('donation.donationMethods.bank.title')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationMethod('qr')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      donationMethod === 'qr'
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📷</div>
                    <div className="font-semibold">{t('donation.donationMethods.qr.title')}</div>
                  </button>
                </div>

                {/* UPI Method */}
                {donationMethod === 'upi' && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('donation.donationMethods.upi.title')}
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder={t('donation.donationMethods.upi.placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-3"
                    />
                    <p className="text-sm text-gray-600">
                      UPI ID: <span className="font-mono font-semibold">ekgahoi@upi</span>
                    </p>
                  </div>
                )}

                {/* Bank Transfer Method */}
                {donationMethod === 'bank' && (
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('donation.donationMethods.bank.accountName')}
                      </label>
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
                        <span className="font-mono">ekGahoi Community</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('ekGahoi Community')}
                          className="text-pink-600 hover:text-pink-700 text-sm font-semibold"
                        >
                          {t('donation.donationMethods.bank.copy')}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('donation.donationMethods.bank.accountNumber')}
                      </label>
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
                        <span className="font-mono">1234567890123</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('1234567890123')}
                          className="text-pink-600 hover:text-pink-700 text-sm font-semibold"
                        >
                          {t('donation.donationMethods.bank.copy')}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('donation.donationMethods.bank.ifsc')}
                      </label>
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
                        <span className="font-mono">ABCD0123456</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('ABCD0123456')}
                          className="text-pink-600 hover:text-pink-700 text-sm font-semibold"
                        >
                          {t('donation.donationMethods.bank.copy')}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('donation.donationMethods.bank.bankName')}
                      </label>
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
                        <span>Sample Bank</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('Sample Bank')}
                          className="text-pink-600 hover:text-pink-700 text-sm font-semibold"
                        >
                          {t('donation.donationMethods.bank.copy')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code Method */}
                {donationMethod === 'qr' && (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-700 mb-4" dir="auto">{t('donation.donationMethods.qr.desc')}</p>
                    <div className="bg-white p-6 rounded-lg inline-block">
                      <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📱</div>
                          <p className="text-sm text-gray-600">QR Code Placeholder</p>
                          <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Donation Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('donation.form.name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('donation.form.namePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    dir="auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('donation.form.phone')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('donation.form.phonePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('donation.form.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('donation.form.emailPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('donation.form.message')}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('donation.form.messagePlaceholder')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    dir="auto"
                  />
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{t('donation.amount.title')}:</span>
                    <span className="text-2xl font-bold text-pink-600">₹{amount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || parseInt(amount) < 100}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t('donation.form.submitting') : t('donation.form.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

