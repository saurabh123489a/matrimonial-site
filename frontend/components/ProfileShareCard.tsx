'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { trackShare } from '@/lib/analytics';
import { getProfileUrl } from '@/lib/profileUtils';
import { interestApi, shortlistApi } from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';

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
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();
  const [generating, setGenerating] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];

  useEffect(() => {
    checkShortlistStatus();
  }, [user._id]);

  const checkShortlistStatus = async () => {
    try {
      const response = await shortlistApi.check(user._id);
      if (response.status && response.data) {
        setIsShortlisted(response.data.isShortlisted || false);
      }
    } catch (error) {
      // Silently fail
    }
  };

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

  const handleSendInterest = async () => {
    setActionLoading(true);
    try {
      const response = await interestApi.send(user._id);
      if (response.status) {
        showSuccess('Interest sent successfully!');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShortlist = async () => {
    setActionLoading(true);
    try {
      const checkResponse = await shortlistApi.check(user._id);
      const currentlyShortlisted = checkResponse.status && checkResponse.data?.isShortlisted;
      
      const response = currentlyShortlisted 
        ? await shortlistApi.remove(user._id)
        : await shortlistApi.add(user._id);
      
      if (response.status) {
        setIsShortlisted(!currentlyShortlisted);
        showSuccess(currentlyShortlisted ? 'Removed from shortlist' : 'Added to shortlist');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update shortlist');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Share Profile Card</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Hidden card for image generation */}
          <div ref={cardRef} className="hidden">
            <div 
              style={{ 
                width: '600px',
                height: '800px',
                padding: '32px',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(to bottom right, #DB2777, #DC2626, #BE185D)'
              }}
            >
              {/* Background Pattern */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '256px', height: '256px', backgroundColor: '#ffffff', borderRadius: '50%', transform: 'translate(-50%, -50%)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '384px', height: '384px', backgroundColor: '#ffffff', borderRadius: '50%', transform: 'translate(50%, 50%)' }}></div>
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Logo/Header */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>💍 ekGahoi</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Your Trusted Matrimonial Platform</div>
                </div>

                {/* Profile Photo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <div style={{ position: 'relative' }}>
                    {primaryPhoto?.url ? (
                      <img
                        src={primaryPhoto.url}
                        alt={user.name}
                        style={{
                          width: '192px',
                          height: '192px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '4px solid #ffffff',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div style={{
                        width: '192px',
                        height: '192px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: '4px solid #ffffff',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '60px'
                      }}>
                        👤
                      </div>
                    )}
                    {user.gahoiId && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#ffffff',
                        color: '#DB2777',
                        padding: '4px 16px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}>
                        ID: {user.gahoiId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{user.name}</h2>
                  {user.age && (
                    <p style={{ fontSize: '20px', opacity: 0.9 }}>{user.age} years</p>
                  )}
                </div>

                {/* Details */}
                <div 
                  style={{
                    flex: 1,
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {user.city && user.state && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>📍</span>
                      <div>
                        <div style={{ fontSize: '14px', opacity: 0.8 }}>Location</div>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>{user.city}, {user.state}</div>
                      </div>
                    </div>
                  )}

                  {user.education && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>🎓</span>
                      <div>
                        <div style={{ fontSize: '14px', opacity: 0.8 }}>Education</div>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>{user.education}</div>
                      </div>
                    </div>
                  )}

                  {user.occupation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>💼</span>
                      <div>
                        <div style={{ fontSize: '14px', opacity: 0.8 }}>Occupation</div>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>{user.occupation}</div>
                      </div>
                    </div>
                  )}

                  {user.bio && (
                    <div 
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}>About</div>
                      <div style={{ fontSize: '16px', lineHeight: '1.625' }}>{user.bio}</div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
                  <div>Visit ekGahoi to connect</div>
                  <div style={{ fontWeight: '600' }}>ekgahoi.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {generating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Generating your profile card...</p>
              </div>
            </div>
          ) : cardImageUrl ? (
            <div className="space-y-6">
              {/* Card Preview */}
              <div className="border-2 border-gray-200">
                <img
                  src={cardImageUrl}
                  alt="Profile Card"
                  className="w-full h-auto"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Link
                    href={getProfileUrl(user)}
                    onClick={onClose}
                    className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-lg"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/messages/${user._id}`}
                    onClick={onClose}
                    className="flex-1 text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg"
                  >
                    💬 Message
                  </Link>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSendInterest}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    {actionLoading ? 'Sending...' : '💝 Send Interest'}
                  </button>
                  <button
                    onClick={handleShortlist}
                    disabled={actionLoading}
                    className={`px-6 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg ${
                      isShortlisted
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    ⭐
                  </button>
                </div>

                {/* Share Options */}
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={shareViaWhatsApp}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                  >
                    <span className="text-2xl">💬</span>
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    onClick={shareViaInstagram}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    style={{ background: 'linear-gradient(to right, #9333EA, #DB2777, #F97316)' }}
                  >
                    <span className="text-2xl">📷</span>
                    <span>Share on Instagram</span>
                  </button>

                  <button
                    onClick={downloadCard}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-lg"
                  >
                    <span className="text-2xl">⬇️</span>
                    <span>Download Card</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Preparing your profile card...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

