/**
 * Conversation Utility Functions
 * Centralized functions for conversation-related operations
 */

/**
 * Generate conversation ID from two user IDs
 * Sorts IDs to ensure consistent conversation ID regardless of order
 * @param {string|ObjectId} userId1 - First user ID
 * @param {string|ObjectId} userId2 - Second user ID
 * @returns {string} Conversation ID in format "userId1_userId2" (sorted)
 */
export function generateConversationId(userId1, userId2) {
  if (!userId1 || !userId2) {
    throw new Error('Both userId1 and userId2 are required');
  }

  // Convert to strings and sort to ensure consistency
  const ids = [String(userId1), String(userId2)].sort();
  return `${ids[0]}_${ids[1]}`;
}

/**
 * Parse conversation ID to get user IDs
 * @param {string} conversationId - Conversation ID in format "userId1_userId2"
 * @returns {Array<string>} Array of two user IDs [userId1, userId2]
 */
export function parseConversationId(conversationId) {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Invalid conversation ID');
  }

  const parts = conversationId.split('_');
  if (parts.length !== 2) {
    throw new Error('Invalid conversation ID format');
  }

  return parts;
}

/**
 * Check if a user is part of a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string|ObjectId} userId - User ID to check
 * @returns {boolean} True if user is part of the conversation
 */
export function isUserInConversation(conversationId, userId) {
  try {
    const [userId1, userId2] = parseConversationId(conversationId);
    const userIdStr = String(userId);
    return userIdStr === userId1 || userIdStr === userId2;
  } catch {
    return false;
  }
}

/**
 * Get the other user ID from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string|ObjectId} currentUserId - Current user ID
 * @returns {string|null} Other user ID or null if not found
 */
export function getOtherUserId(conversationId, currentUserId) {
  try {
    const [userId1, userId2] = parseConversationId(conversationId);
    const currentUserIdStr = String(currentUserId);

    if (currentUserIdStr === userId1) {
      return userId2;
    } else if (currentUserIdStr === userId2) {
      return userId1;
    }

    return null;
  } catch {
    return null;
  }
}

