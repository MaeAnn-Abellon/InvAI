import defaultAvatar from '@/assets/avatar.png';

let API_BASE_URL = '';
try {
  (async()=>{
    try {
      const { getApiOrigin } = await import('../services/apiClient.js');
      API_BASE_URL = getApiOrigin();
    } catch { /* fallback remains */ }
  })();
} catch { /* ignore */ }

/**
 * Get the full avatar URL for a user
 * @param {Object} user - User object with avatarUrl property
 * @returns {string} - Full avatar URL or default avatar
 */
export function getAvatarUrl(user) {
  if (!user?.avatarUrl) {
    return defaultAvatar;
  }
  
  // If avatarUrl already contains the full URL, return it as is
  if (user.avatarUrl.startsWith('http')) {
    return user.avatarUrl;
  }
  
  // Otherwise, prepend the API base URL
  return `${API_BASE_URL}${user.avatarUrl}`;
}

/**
 * Check if user has a custom avatar (not using default)
 * @param {Object} user - User object with avatarUrl property
 * @returns {boolean} - True if user has custom avatar
 */
export function hasCustomAvatar(user) {
  return Boolean(user?.avatarUrl);
}