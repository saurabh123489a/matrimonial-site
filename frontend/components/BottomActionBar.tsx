'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { interestApi, shortlistApi } from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProfileAction } from '@/contexts/ProfileActionContext';
import QuickMessageModal from './QuickMessageModal';

export default function BottomActionBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();
  const { selectedProfile } = useProfileAction();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [hasInterest, setHasInterest] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userId = selectedProfile?.userId;
  const userName = selectedProfile?.userName;
  const userPhoto = selectedProfile?.userPhoto;

  // Hide on certain pages
  const hideOnPages = ['/login', '/register', '/admin'];
  const shouldHide = hideOnPages.some(page => pathname.startsWith(page));

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(auth.isAuthenticated());
  }, [pathname]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      checkShortlistStatus();
      checkInterestStatus();
    }
  }, [userId, isAuthenticated]);

  const checkShortlistStatus = async () => {
    if (!userId) return;
    try {
      const response = await shortlistApi.check(userId);
      if (response.status && response.data) {
        setIsShortlisted(response.data.isShortlisted || false);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const checkInterestStatus = async () => {
    if (!userId) return;
    try {
      const response = await interestApi.getOutgoing();
      if (response.status && response.data) {
        const hasSentInterest = response.data.some(
          (interest: any) => interest.toUserId?._id === userId || interest.toUserId === userId
        );
        setHasInterest(hasSentInterest);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleSendInterest = async () => {
    if (!hasSelectedProfile) {
      router.push('/profiles');
      return;
    }

    setActionLoading(true);
    try {
      const response = await interestApi.send(userId!);
      if (response.status) {
        setHasInterest(true);
        showSuccess('Interest sent successfully!');
      } else {
        showError(response.message || 'Failed to send interest');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuperInterest = async () => {
    if (!hasSelectedProfile) {
      router.push('/profiles');
      return;
    }

    // For now, treat super interest same as regular interest
    handleSendInterest();
  };

  const handleShortlist = async () => {
    if (!hasSelectedProfile) {
      router.push('/profiles');
      return;
    }

    setActionLoading(true);
    try {
      const response = isShortlisted 
        ? await shortlistApi.remove(userId!)
        : await shortlistApi.add(userId!);
      
      if (response.status) {
        setIsShortlisted(!isShortlisted);
        showSuccess(isShortlisted ? 'Removed from shortlist' : 'Added to shortlist');
      } else {
        showError(response.message || 'Failed to update shortlist');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update shortlist');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChat = () => {
    if (!hasSelectedProfile) {
      router.push('/messages');
      return;
    }

    setShowMessageModal(true);
  };

  // Show bar if authenticated, even without selected profile (for general actions)
  if (!mounted || !isAuthenticated || shouldHide) {
    return null;
  }

  // If no profile selected, show general actions (navigate to profiles)
  const hasSelectedProfile = !!userId && !!userName;

  return (
    <>
      {/* Floating Bottom Action Bar - Positioned above bottom nav */}
      <div className="fixed bottom-20 sm:bottom-24 left-0 right-0 z-30 px-2 sm:px-4 pb-2 pointer-events-none">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#181b23] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 pointer-events-auto">
            <div className="grid grid-cols-4 gap-2">
              {/* Interest */}
              <button
                onClick={handleSendInterest}
                disabled={actionLoading || hasInterest}
                className="flex flex-col items-center gap-1 px-2 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px] sm:min-h-[70px]"
                title={hasInterest ? 'Interest Already Sent' : 'Send Interest'}
                aria-label="Send Interest"
              >
                <span className="text-xl sm:text-2xl">✉️</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Interest</span>
              </button>

              {/* Super Interest */}
              <button
                onClick={handleSuperInterest}
                disabled={actionLoading}
                className="flex flex-col items-center gap-1 px-2 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-pink-300 dark:border-pink-600 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 active:bg-pink-100 dark:active:bg-pink-900/30 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px] sm:min-h-[70px]"
                title="Send Super Interest"
                aria-label="Send Super Interest"
              >
                <span className="text-xl sm:text-2xl">💕</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Super</span>
              </button>

              {/* Shortlist */}
              <button
                onClick={handleShortlist}
                disabled={actionLoading}
                className={`flex flex-col items-center gap-1 px-2 py-2 sm:py-3 border rounded-lg transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px] sm:min-h-[70px] ${
                  isShortlisted
                    ? 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                }`}
                title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                aria-label={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
              >
                <span className="text-xl sm:text-2xl">⭐</span>
                <span className="text-xs font-medium">{isShortlisted ? 'Saved' : 'Save'}</span>
              </button>

              {/* Chat */}
              <button
                onClick={handleChat}
                className="flex flex-col items-center gap-1 px-2 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation min-h-[60px] sm:min-h-[70px]"
                title="Send Message"
                aria-label="Send Message"
              >
                <span className="text-xl sm:text-2xl">💬</span>
                <span className="text-xs font-medium">Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Message Modal */}
      {hasSelectedProfile && (
        <QuickMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          userId={userId!}
          userName={userName!}
          userPhoto={userPhoto}
        />
      )}
    </>
  );
}

