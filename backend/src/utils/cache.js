/**
 * Cache Service
 * Provides caching functionality for frequently accessed data
 * Uses node-cache for in-memory caching
 */

import NodeCache from 'node-cache';

// Initialize cache with default TTL of 10 minutes
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Better performance - don't clone objects
  maxKeys: 1000, // Maximum number of keys to prevent memory issues
});

/**
 * Cache Service
 * Provides methods for caching and retrieving data
 */
export const cacheService = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found
   */
  get(key) {
    try {
      return cache.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl=600] - Time to live in seconds (default: 10 minutes)
   * @returns {boolean} True if successful
   */
  set(key, value, ttl = 600) {
    try {
      return cache.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {number} Number of deleted keys
   */
  del(key) {
    try {
      return cache.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return 0;
    }
  },

  /**
   * Clear all cache for a user
   * Used when user profile is updated
   * @param {string} userId - User ID
   */
  clearUserCache(userId) {
    const keys = [
      `user:${userId}`,
      `user:profile:${userId}`,
      `user:profile:${userId}:*`, // Wildcard pattern
    ];
    
    keys.forEach(key => {
      // Handle wildcard patterns
      if (key.includes('*')) {
        const pattern = key.replace('*', '');
        const allKeys = cache.keys();
        allKeys.forEach(k => {
          if (k.startsWith(pattern)) {
            cache.del(k);
          }
        });
      } else {
        cache.del(key);
      }
    });
  },

  /**
   * Clear conversation cache for a conversation between two users
   * Clears all pagination variations of the conversation
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   */
  clearConversationCache(userId1, userId2) {
    // Normalize user IDs for consistent key generation
    const ids = [String(userId1), String(userId2)].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;
    
    // Get all cache keys and clear conversation-related ones
    const allKeys = cache.keys();
    const pattern = `conversation:${conversationId}:`;
    
    allKeys.forEach(key => {
      // Clear all conversation cache entries (with different pagination options)
      if (key.startsWith(pattern)) {
        cache.del(key);
      }
    });
    
    // Also clear conversation list caches for both users
    const userId1Str = String(userId1);
    const userId2Str = String(userId2);
    allKeys.forEach(key => {
      if (key.startsWith(`conversations:${userId1Str}:`) || 
          key.startsWith(`conversations:${userId2Str}:`)) {
        cache.del(key);
      }
    });
  },

  /**
   * Clear all conversation caches for a user
   * Clears all pagination variations of the conversation list
   * Used when user sends/receives messages
   * @param {string} userId - User ID
   */
  clearUserConversationsCache(userId) {
    const userIdStr = String(userId);
    const pattern = `conversations:${userIdStr}:`;
    const allKeys = cache.keys();
    
    // Clear all conversation list cache entries for this user (with different pagination options)
    allKeys.forEach(key => {
      if (key.startsWith(pattern)) {
        cache.del(key);
      }
    });
  },

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return cache.getStats();
  },

  /**
   * Flush all cache (use with caution)
   */
  flush() {
    cache.flushAll();
  },

  /**
   * Check if cache has a key
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return cache.has(key);
  },

  /**
   * Get value from cache or fetch and cache it
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @param {number} [ttl=600] - Time to live in seconds
   * @returns {Promise<any>} Cached or fetched data
   */
  async getOrSet(key, fetchFn, ttl = 600) {
    const cached = this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  },

  /**
   * Clear all cache entries matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'user:*' or 'conversation:123:*')
   */
  clearPattern(pattern) {
    const keys = cache.keys();
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let cleared = 0;
    
    keys.forEach(key => {
      if (regex.test(key)) {
        cache.del(key);
        cleared++;
      }
    });
    
    return cleared;
  },
};

// Log cache statistics periodically (optional, for monitoring)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = cache.getStats();
    if (stats.keys > 0) {
      console.log(`📦 Cache stats: ${stats.keys} keys, ${stats.hits} hits, ${stats.misses} misses`);
    }
  }, 60000); // Every minute
}

export default cacheService;

