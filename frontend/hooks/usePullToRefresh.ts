'use client';

import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  enabled = true,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current || window;
    let touchStartY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || window.scrollY > 0) {
        isDragging = false;
        return;
      }

      const touchY = e.touches[0].clientY;
      const distance = Math.max(0, touchY - touchStartY);

      if (distance > 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(distance / resistance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging) return;

      isDragging = false;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setIsPulling(false);
        setPullDistance(0);

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    if (element === window) {
      window.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
      window.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
      window.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    } else {
      element.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
      element.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
      element.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    }

    return () => {
      if (element === window) {
        window.removeEventListener('touchstart', handleTouchStart as EventListener);
        window.removeEventListener('touchmove', handleTouchMove as EventListener);
        window.removeEventListener('touchend', handleTouchEnd as EventListener);
      } else {
        element.removeEventListener('touchstart', handleTouchStart as EventListener);
        element.removeEventListener('touchmove', handleTouchMove as EventListener);
        element.removeEventListener('touchend', handleTouchEnd as EventListener);
      }
    };
  }, [enabled, onRefresh, threshold, resistance, pullDistance, isRefreshing]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    elementRef,
  };
}

