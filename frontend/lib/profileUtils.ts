/**
 * Profile URL utilities
 * Uses Gahoi ID as primary identifier for profile URLs
 */

import { User } from './api';

/**
 * Get profile URL using Gahoi ID if available, otherwise fallback to MongoDB _id
 */
export function getProfileUrl(user: User | { _id: string; gahoiId?: number }): string {
  if (user.gahoiId) {
    return `/profiles/${user.gahoiId}`;
  }
  return `/profiles/${user._id}`;
}

/**
 * Get profile ID for API calls (prefer Gahoi ID, fallback to _id)
 */
export function getProfileId(user: User | { _id: string; gahoiId?: number }): string {
  if (user.gahoiId) {
    return String(user.gahoiId);
  }
  return String(user._id);
}

/**
 * Get default profile image URL based on gender
 * Returns path to default male or female image
 */
export function getDefaultProfileImage(gender?: 'male' | 'female' | 'other' | string): string {
  if (gender === 'male') {
    return '/images/default-male.svg';
  } else if (gender === 'female') {
    return '/images/default-female.svg';
  }
  // Default to male for 'other' or undefined
  return '/images/default-male.svg';
}

/**
 * Get profile image URL - returns primary photo or default image based on gender
 */
export function getProfileImageUrl(
  user: User | { photos?: Array<{ url: string; isPrimary?: boolean }>; gender?: 'male' | 'female' | 'other' | string }
): string {
  const primaryPhoto = user.photos?.find(p => p.isPrimary) || user.photos?.[0];
  if (primaryPhoto?.url) {
    return primaryPhoto.url;
  }
  return getDefaultProfileImage(user.gender);
}

