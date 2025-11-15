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

