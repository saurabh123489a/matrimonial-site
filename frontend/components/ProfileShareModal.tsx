'use client';

import { useState, useEffect } from 'react';
import ProfileShareCard from './ProfileShareCard';
import { trackShare } from '@/lib/analytics';

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
  profileUrl: string;
  user?: {
    _id: string;
    name: string;
    age?: number;
    city?: string;
    state?: string;
    photos?: Array<{ url: string; isPrimary: boolean }>;
    gahoiId?: number;
    bio?: string;
    education?: string;
    occupation?: string;
  };
}

export default function ProfileShareModal({
  isOpen,
  onClose,
  profileId,
  profileName,
  profileUrl,
  user
}: ProfileShareModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}${profileUrl}` : profileUrl;

  useEffect(() => {
    if (isOpen && profileUrl) {
      generateQRCode();
    }
  }, [isOpen, profileUrl]);

  const generateQRCode = async () => {
    try {
      // Dynamic import for client-side only
      const QRCode = (await import('qrcode')).default;
      const qr = await QRCode.toDataURL(shareLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    trackShare('whatsapp', profileId);
    const message = `Check out ${profileName}'s profile on ekGahoi: ${shareLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    trackShare('email', profileId);
    const subject = `${profileName}'s Profile on ekGahoi`;
    const body = `Check out ${profileName}'s profile:\n\n${shareLink}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  if (!isOpen) return null;

  // Show card modal if user data is available and card option is selected
  if (showCard && user) {
    return <ProfileShareCard user={user} onClose={() => setShowCard(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Share Profile</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Share Options */}
          <div className="space-y-3 mb-6">
            {/* Share as Card - Only show if user data is available */}
            {user && (
              <button
                onClick={() => setShowCard(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-50 to-red-50"
              >
                <span className="text-2xl">🖼️</span>
                <span className="flex-1 text-left font-medium text-gray-900">Share as Profile Card</span>
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {/* WhatsApp */}
            <button
              onClick={shareViaWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-50"
            >
              <span className="text-2xl">💬</span>
              <span className="flex-1 text-left font-medium text-gray-900">Share via WhatsApp</span>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Email */}
            <button
              onClick={shareViaEmail}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50"
            >
              <span className="text-2xl">📧</span>
              <span className="flex-1 text-left font-medium text-gray-900">Share via Email</span>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Copy Link */}
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-200"
              />
              <button
                onClick={copyToClipboard}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700">Scan QR Code</p>
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

