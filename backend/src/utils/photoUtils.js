/**
 * Photo Utility Functions
 * Centralized functions for photo-related operations
 */

/**
 * Sort photos array: primary photo first, then by order
 * @param {Array} photos - Array of photo objects with isPrimary and order properties
 * @returns {Array} Sorted photos array (mutates original array)
 */
export function sortPhotos(photos) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return photos;
  }

  return photos.sort((a, b) => {
    // Primary photo always comes first
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    // Then sort by order (ascending)
    return (a.order || 0) - (b.order || 0);
  });
}

/**
 * Get primary photo from photos array
 * @param {Array} photos - Array of photo objects
 * @returns {Object|null} Primary photo object or null if not found
 */
export function getPrimaryPhoto(photos) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }

  const sorted = sortPhotos([...photos]); // Don't mutate original
  return sorted[0] || null;
}

/**
 * Validate photo object structure
 * @param {Object} photo - Photo object to validate
 * @returns {boolean} True if photo is valid
 */
export function isValidPhoto(photo) {
  return (
    photo &&
    typeof photo === 'object' &&
    typeof photo.url === 'string' &&
    photo.url.length > 0
  );
}

/**
 * Validate photos array
 * @param {Array} photos - Array of photo objects
 * @returns {boolean} True if all photos are valid
 */
export function isValidPhotosArray(photos) {
  if (!Array.isArray(photos)) {
    return false;
  }

  return photos.every(photo => isValidPhoto(photo));
}

