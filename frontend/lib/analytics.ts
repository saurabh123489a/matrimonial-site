/**
 * Analytics Integration
 * Supports Google Analytics 4 (GA4)
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    if (window.dataLayer) {
      window.dataLayer.push(arguments);
    }
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track profile views
export const trackProfileView = (profileId: string, profileName: string) => {
  event({
    action: 'view_profile',
    category: 'engagement',
    label: profileName,
  });
};

// Track interest sent
export const trackInterestSent = (profileId: string) => {
  event({
    action: 'send_interest',
    category: 'engagement',
    label: profileId,
  });
};

// Track search
export const trackSearch = (filters: Record<string, any>) => {
  event({
    action: 'search',
    category: 'engagement',
    label: JSON.stringify(filters),
  });
};

// Track share
export const trackShare = (platform: string, profileId: string) => {
  event({
    action: 'share',
    category: 'social',
    label: `${platform}_${profileId}`,
  });
};

