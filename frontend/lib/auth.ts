/**
 * Authentication utilities
 */

export const auth = {
  // Store token
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  // Get token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Remove token
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!auth.getToken();
  },

  // Logout
  logout: () => {
    auth.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};

