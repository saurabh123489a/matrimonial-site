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

