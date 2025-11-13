/**
 * User Data Sanitization Utility
 * Removes sensitive information from user objects before sending to client
 * Prevents data scraping and protects user privacy
 */

/**
 * Sanitize user data for public API responses
 * Removes sensitive fields that shouldn't be exposed
 * @param {Object} user - User object from database
 * @param {Object} options - Sanitization options
 * @param {string} options.viewerId - ID of user viewing the profile (for privacy checks)
 * @param {boolean} options.isOwnProfile - Whether the viewer is viewing their own profile
 * @returns {Object} Sanitized user object
 */
export function sanitizeUserForPublic(user, options = {}) {
  if (!user || typeof user !== 'object') {
    return user;
  }

  const { viewerId = null, isOwnProfile = false } = options;
  const isViewingOwnProfile = isOwnProfile || (viewerId && String(user._id) === String(viewerId));

  // Convert Mongoose document to plain object if needed
  let userObj = user;
  if (user.toObject && typeof user.toObject === 'function') {
    userObj = user.toObject();
  } else if (user.toJSON && typeof user.toJSON === 'function') {
    userObj = user.toJSON();
  }
  
  // Create a deep copy to avoid mutating the original
  const sanitized = JSON.parse(JSON.stringify(userObj));

  // Always hide these sensitive fields from public API
  const alwaysHiddenFields = [
    'passwordHash',
    'email', // Hide email from public API
    'phone', // Hide phone from public API (except for own profile)
    'whatsappNumber', // Hide WhatsApp number
    'family.fathersContactNumber', // Hide family contact numbers
    'family.mothersContactNumber',
    'permanentAddress', // Hide permanent address
    'presentAddress', // Hide present address
    'pincode', // Hide pincode
  ];

  // Remove always hidden fields
  alwaysHiddenFields.forEach(field => {
    if (field.includes('.')) {
      // Handle nested fields
      const [parent, child] = field.split('.');
      if (sanitized[parent] && sanitized[parent][child]) {
        delete sanitized[parent][child];
      }
    } else {
      delete sanitized[field];
    }
  });

  // Hide email and phone even if viewing own profile in public search results
  // (They can see it in their own profile page, but not in search results)
  if (!isViewingOwnProfile) {
    delete sanitized.email;
    delete sanitized.phone;
    delete sanitized.whatsappNumber;
    
    // Hide family details
    if (sanitized.family) {
      delete sanitized.family.fathersContactNumber;
      delete sanitized.family.mothersContactNumber;
      // Keep family names but hide contact info
      sanitized.family = {
        fathersName: sanitized.family.fathersName,
        mothersName: sanitized.family.mothersName,
        fathersOccupationType: sanitized.family.fathersOccupationType,
        fathersOccupationDesc: sanitized.family.fathersOccupationDesc,
        mothersOccupationType: sanitized.family.mothersOccupationType,
        mothersOccupationDesc: sanitized.family.mothersOccupationDesc,
        familyType: sanitized.family.familyType,
        familyStatus: sanitized.family.familyStatus,
      };
    }

    // Hide addresses
    delete sanitized.permanentAddress;
    delete sanitized.presentAddress;
    delete sanitized.pincode;

    // For female users, hide phone number (already handled above, but ensure)
    if (sanitized.gender === 'female') {
      delete sanitized.phone;
      delete sanitized.whatsappNumber;
    }
  }

  // Convert to plain object to remove Mongoose metadata
  if (sanitized.toObject) {
    return sanitized.toObject();
  }

  return sanitized;
}

/**
 * Sanitize an array of users for public API responses
 * @param {Array} users - Array of user objects
 * @param {Object} options - Sanitization options
 * @returns {Array} Array of sanitized user objects
 */
export function sanitizeUsersForPublic(users, options = {}) {
  if (!Array.isArray(users)) {
    return users;
  }

  return users.map(user => sanitizeUserForPublic(user, options));
}

/**
 * Get minimal user data for search results (only essential fields)
 * Returns only: _id, gahoiId, name, age, gender, height, occupation, city, state, country, photos
 * @param {Object} user - User object from database
 * @returns {Object} Minimal user object with only essential fields
 */
export function getMinimalUserData(user) {
  if (!user || typeof user !== 'object') {
    return user;
  }

  // Convert Mongoose document to plain object if needed
  let userObj = user;
  if (user.toObject && typeof user.toObject === 'function') {
    userObj = user.toObject();
  } else if (user.toJSON && typeof user.toJSON === 'function') {
    userObj = user.toJSON();
  }

  // Only include minimal essential fields for search results
  // Location: city, state, country
  // Basic: age, height, occupation, gender
  const minimalFields = [
    '_id',           // Required for navigation
    'gahoiId',       // Required for profile URL
    'name',          // Required for display
    'age',           // Essential info
    'gender',        // Essential info (male/female)
    'height',        // Essential info
    'occupation',    // Essential info
    'city',          // Location
    'state',         // Location
    'country',       // Location
    'photos',        // Required for profile card display
  ];

  const minimal = {};
  minimalFields.forEach(field => {
    if (userObj[field] !== undefined && userObj[field] !== null) {
      // Handle arrays (like photos)
      if (Array.isArray(userObj[field])) {
        minimal[field] = userObj[field];
      } else {
        minimal[field] = userObj[field];
      }
    }
  });

  return minimal;
}

/**
 * Get minimal user data for an array of users (for search results)
 * @param {Array} users - Array of user objects
 * @returns {Array} Array of minimal user objects
 */
export function getMinimalUsersData(users) {
  if (!Array.isArray(users)) {
    return users;
  }

  return users.map(user => getMinimalUserData(user));
}

