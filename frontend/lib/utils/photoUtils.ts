/**
 * Photo Utility Functions (Frontend)
 * Centralized functions for photo-related operations
 */

export interface Photo {
  url: string;
  isPrimary?: boolean;
  order?: number;
}

/**
 * Sort photos array: primary photo first, then by order
 * @param photos - Array of photo objects with isPrimary and order properties
 * @returns Sorted photos array (does not mutate original)
 */
export function sortPhotos(photos: Photo[]): Photo[] {
  if (!Array.isArray(photos) || photos.length === 0) {
    return photos;
  }

  // Create a copy to avoid mutating the original array
  return [...photos].sort((a, b) => {
    // Primary photo always comes first
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    // Then sort by order (ascending)
    return (a.order || 0) - (b.order || 0);
  });
}

/**
 * Get primary photo from photos array
 * @param photos - Array of photo objects
 * @returns Primary photo object or null if not found
 */
export function getPrimaryPhoto(photos: Photo[]): Photo | null {
  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }

  const sorted = sortPhotos(photos);
  return sorted[0] || null;
}

/**
 * Validate photo object structure
 * @param photo - Photo object to validate
 * @returns True if photo is valid
 */
export function isValidPhoto(photo: Photo | null | undefined): photo is Photo {
  return (
    photo !== null &&
    photo !== undefined &&
    typeof photo === 'object' &&
    typeof photo.url === 'string' &&
    photo.url.length > 0
  );
}

/**
 * Validate photos array
 * @param photos - Array of photo objects
 * @returns True if all photos are valid
 */
export function isValidPhotosArray(photos: Photo[] | null | undefined): photos is Photo[] {
  if (!Array.isArray(photos)) {
    return false;
  }

  return photos.every(photo => isValidPhoto(photo));
}

