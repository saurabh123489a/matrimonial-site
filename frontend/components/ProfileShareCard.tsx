'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { trackShare } from '@/lib/analytics';
import { getProfileUrl } from '@/lib/profileUtils';

interface ProfileShareCardProps {
  user: {
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
  onClose: () => void;
}

export default function ProfileShareCard({ user, onClose }: ProfileShareCardProps) {
  const [generating, setGenerating] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];

  useEffect(() => {
    generateCardImage();
  }, []);

  const generateCardImage = async () => {
    if (!cardRef.current) return;
    
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      } as any);
      
      const imageUrl = canvas.toDataURL('image/png');
      setCardImageUrl(imageUrl);
    } catch (error) {
      console.error('Error generating card image:', error);
    } finally {
      setGenerating(false);
    }
  };

  const shareViaWhatsApp = async () => {
    if (!cardImageUrl) {
      alert('Please wait for the card to generate');
      return;
    }
    
    try {
      // Convert data URL to blob
      const response = await fetch(cardImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${user.name}-ekgahoi-profile.png`, { type: 'image/png' });
      
      // Try using Web Share API with file (works on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${user.name}'s Profile - ekGahoi`,
          text: `Check out ${user.name}'s profile on ekGahoi!`,
          files: [file]
        });
      } else {
        // Fallback: Download card and open WhatsApp with message
        trackShare('whatsapp_card', user._id);
        downloadCard();
        const profileUrl = getProfileUrl({ _id: user._id, gahoiId: user.gahoiId });
        const message = `Check out ${user.name}'s profile on ekGahoi!\n\nDownload the profile card image and share it on WhatsApp.\n\n${window.location.origin}${profileUrl}`;
        setTimeout(() => {
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }, 500);
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      // Fallback: just download
      downloadCard();
      alert('Card downloaded! You can now share it manually on WhatsApp.');
    }
  };

  const shareViaInstagram = async () => {
    if (!cardImageUrl) {
      alert('Please wait for the card to generate');
      return;
    }
    
    try {
      // Convert data URL to blob
      const response = await fetch(cardImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${user.name}-ekgahoi-profile.png`, { type: 'image/png' });
      
      // Try using Web Share API (works on mobile Instagram app)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${user.name}'s Profile - ekGahoi`,
            files: [file]
          });
          return;
        } catch (error) {
          // If share fails, fall through to download
        }
      }
      
      // Fallback: Download card for manual upload
      trackShare('instagram_card', user._id);
      downloadCard();
      alert('Card downloaded! Open Instagram and upload it to your Story or Post.');
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      downloadCard();
      alert('Card downloaded! Open Instagram and upload it to your Story or Post.');
    }
  };

  const downloadCard = () => {
    if (!cardImageUrl) return;
    
    const link = document.createElement('a');
    link.download = `${user.name}-ekgahoi-profile-card.png`;
    link.href = cardImageUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-pink-300">Share Profile Card</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-red-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Hidden card for image generation */}
          <div ref={cardRef} className="hidden">
            <div 
              className="w-[600px] h-[800px] p-8 text-white relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(to bottom right, #DB2777, #DC2626, #BE185D)',
                color: 'white'
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0" style={{ opacity: 0.1 }}>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Logo/Header */}
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-2">💍 ekGahoi</div>
                  <div className="text-sm" style={{ opacity: 0.9 }}>Your Trusted Matrimonial Platform</div>
                </div>

                {/* Profile Photo */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {primaryPhoto?.url ? (
                      <img
                        src={primaryPhoto.url}
                        alt={user.name}
                        className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-2xl"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-white/20 border-4 border-white shadow-2xl flex items-center justify-center text-6xl">
                        👤
                      </div>
                    )}
                    {user.gahoiId && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-pink-600 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        ID: {user.gahoiId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="text-center mb-4">
                  <h2 className="text-4xl font-bold mb-2">{user.name}</h2>
                  {user.age && (
                    <p className="text-xl" style={{ opacity: 0.9 }}>{user.age} years</p>
                  )}
                </div>

                {/* Details */}
                <div 
                  className="flex-1 rounded-2xl p-6 space-y-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {user.city && user.state && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="text-sm" style={{ opacity: 0.8 }}>Location</div>
                        <div className="text-lg font-semibold">{user.city}, {user.state}</div>
                      </div>
                    </div>
                  )}

                  {user.education && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎓</span>
                      <div>
                        <div className="text-sm" style={{ opacity: 0.8 }}>Education</div>
                        <div className="text-lg font-semibold">{user.education}</div>
                      </div>
                    </div>
                  )}

                  {user.occupation && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💼</span>
                      <div>
                        <div className="text-sm" style={{ opacity: 0.8 }}>Occupation</div>
                        <div className="text-lg font-semibold">{user.occupation}</div>
                      </div>
                    </div>
                  )}

                  {user.bio && (
                    <div 
                      className="mt-4 pt-4"
                      style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
                    >
                      <div className="text-sm mb-2" style={{ opacity: 0.8 }}>About</div>
                      <div className="text-base leading-relaxed">{user.bio}</div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm" style={{ opacity: 0.8 }}>
                  <div>Visit ekGahoi to connect</div>
                  <div className="font-semibold">ekgahoi.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {generating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600 dark:text-pink-200">Generating your profile card...</p>
              </div>
            </div>
          ) : cardImageUrl ? (
            <div className="space-y-6">
              {/* Card Preview */}
              <div className="border-2 border-gray-200 dark:border-pink-700 rounded-lg overflow-hidden">
                <img
                  src={cardImageUrl}
                  alt="Profile Card"
                  className="w-full h-auto"
                />
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                >
                  <span className="text-2xl">💬</span>
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={shareViaInstagram}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                  style={{ background: 'linear-gradient(to right, #9333EA, #DB2777, #F97316)' }}
                >
                  <span className="text-2xl">📷</span>
                  <span>Share on Instagram</span>
                </button>

                <button
                  onClick={downloadCard}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-lg"
                >
                  <span className="text-2xl">⬇️</span>
                  <span>Download Card</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-pink-200">Preparing your profile card...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

