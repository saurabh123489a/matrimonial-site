'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'profile',
    target: '[data-tour="profile"]',
    title: 'Your Profile',
    content: 'Complete your profile to get better matches. Add photos, details, and preferences.',
    position: 'bottom',
  },
  {
    id: 'search',
    target: '[data-tour="search"]',
    title: 'Search Profiles',
    content: 'Browse and search for potential matches using our advanced filters.',
    position: 'bottom',
  },
  {
    id: 'community',
    target: '[data-tour="community"]',
    title: 'Community',
    content: 'Connect with the Gahoi community, ask questions, and stay updated.',
    position: 'bottom',
  },
  {
    id: 'interests',
    target: '[data-tour="interests"]',
    title: 'Interests',
    content: 'View interests you\'ve received and sent. Manage your connections here.',
    position: 'bottom',
  },
];

export default function WelcomeTour() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has completed tour
    if (typeof window !== 'undefined' && auth.isAuthenticated()) {
      const tourCompleted = localStorage.getItem('welcomeTourCompleted');
      if (!tourCompleted) {
        // Show tour after a short delay
        setTimeout(() => {
          setIsOpen(true);
        }, 1000);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('welcomeTourCompleted', 'true');
    }
  };

  if (!mounted || !isOpen || currentStep >= tourSteps.length) return null;
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const step = tourSteps[currentStep];
  const targetElement = document.querySelector(step.target);

  if (!targetElement) {
    // If target not found, skip to next step
    if (currentStep < tourSteps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 100);
    } else {
      handleComplete();
    }
    return null;
  }

  const rect = targetElement.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  const getTooltipPosition = () => {
    const spacing = 20;
    switch (step.position) {
      case 'top':
        return {
          top: rect.top + scrollY - spacing,
          left: rect.left + scrollX + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + scrollY + spacing,
          left: rect.left + scrollX + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: rect.top + scrollY + rect.height / 2,
          left: rect.left + scrollX - spacing,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + scrollY + rect.height / 2,
          left: rect.right + scrollX + spacing,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: rect.bottom + scrollY + spacing,
          left: rect.left + scrollX + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity" />
      
      {/* Highlight */}
      <div
        className="fixed z-[61] border-4 border-pink-500 rounded-lg pointer-events-none transition-all"
        style={{
          top: rect.top + scrollY - 4,
          left: rect.left + scrollX - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[62] bg-white"
        style={getTooltipPosition()}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
          <p className="text-sm text-gray-600">{step.content}</p>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500"
          >
            Skip Tour
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {currentStep + 1} / {tourSteps.length}
            </span>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
            >
              {currentStep < tourSteps.length - 1 ? 'Next' : 'Got it!'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

