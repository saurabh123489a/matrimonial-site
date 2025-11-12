import axios from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable CORS credentials
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle CORS and network errors
    if (!error.response && (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED')) {
      const corsError = new Error('CORS Error: Unable to connect to the server. Please check if the backend is running on port 5050.');
      (corsError as any).isCorsError = true;
      return Promise.reject(corsError);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  city?: string;
  state?: string;
  country?: string;
  religion?: string;
  education?: string;
  occupation?: string;
  bio?: string;
  photos?: Array<{ url: string; isPrimary: boolean; order: number }>;
  preferences?: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
    religion?: string;
    location?: string;
  };
  horoscopeDetails?: {
    starSign?: string;
    rashi?: string;
    nakshatra?: string;
    aakna?: string;
    manglikStatus?: 'manglik' | 'angshik' | 'non-manglik' | null;
    timeOfBirth?: string;
    placeOfBirth?: string;
  };
  communityPosition?: string | null;
  height?: number;
  weight?: number;
  maritalStatus?: string;
  complexion?: string;
  bloodGroup?: string | null;
  disability?: 'no' | 'yes' | 'not-specified';
  profileCreatedBy?: 'self' | 'family' | 'relative' | 'friend';
  town?: string;
  presentAddress?: string;
  permanentAddress?: string;
  whatsappNumber?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  motherTongue?: string;
  fieldOfStudy?: string;
  educationalDetail?: string;
  profession?: string;
  occupationDetail?: string;
  employer?: string;
  annualIncome?: string;
  diet?: string;
  dietaryHabit?: string;
  partnerPreference?: string;
  smoking?: boolean;
  drinking?: boolean;
  hobbies?: string[];
  mobileCountryCode?: number;
  family?: {
    fathersName?: string;
    fathersOccupation?: string;
    fathersContactNumber?: string;
    mothersName?: string;
    mothersOccupation?: string;
    numberOfBrothers?: number;
    numberOfSisters?: number;
    marriedBrothers?: number;
    unmarriedBrothers?: number;
    marriedSisters?: number;
    unmarriedSisters?: number;
    maternalUncleName?: string;
    maternalUncleAakna?: string;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
  };
  hasHouse?: 'yes-personal' | 'yes-rented' | 'no' | 'not-specified';
  hasCar?: boolean;
  gahoiId?: number;
  isActive?: boolean;
  isAdmin?: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  age?: number;
  dateOfBirth?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  city?: string;
  state?: string;
  country?: string;
  town?: string;
  presentAddress?: string;
  permanentAddress?: string;
  religion?: string;
  education?: string;
  educationalDetail?: string;
  occupation?: string;
  profession?: string;
  occupationDetail?: string;
  employer?: string;
  annualIncome?: string;
  bloodGroup?: string | null;
  disability?: 'no' | 'yes' | 'not-specified';
  profileCreatedBy?: 'self' | 'family' | 'relative' | 'friend';
  bio?: string;
  photos?: Array<{ url: string; isPrimary?: boolean; order?: number }>;
  preferences?: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
    religion?: string;
    location?: string;
  };
  horoscopeDetails?: {
    starSign?: string;
    rashi?: string;
    nakshatra?: string;
    aakna?: string;
    manglikStatus?: 'manglik' | 'angshik' | 'non-manglik' | null;
    timeOfBirth?: string;
    placeOfBirth?: string;
  };
  family?: {
    fathersName?: string;
    fathersOccupation?: string;
    fathersContactNumber?: string;
    mothersName?: string;
    mothersOccupation?: string;
    numberOfBrothers?: number;
    numberOfSisters?: number;
    marriedBrothers?: number;
    unmarriedBrothers?: number;
    marriedSisters?: number;
    unmarriedSisters?: number;
    maternalUncleName?: string;
    maternalUncleAakna?: string;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
  };
  hasHouse?: 'yes-personal' | 'yes-rented' | 'no' | 'not-specified';
  hasCar?: boolean;
  isActive?: boolean;
}

// API functions
export const userApi = {
  // Create user
  create: async (data: CreateUserDto): Promise<ApiResponse<User>> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Get current user profile
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user profile
  update: async (id: string, data: UpdateUserDto): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Update current user profile
  updateMe: async (data: UpdateUserDto): Promise<ApiResponse<User>> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Search users
  search: async (filters: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    city?: string;
    state?: string;
    religion?: string;
    education?: string;
    gahoiId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<User[]> & { pagination?: Pagination }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },
};

// Interest API
export const interestApi = {
  send: async (toUserId: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/interests/send', { toUserId });
    return response.data;
  },
  respond: async (fromUserId: string, response: 'accept' | 'reject'): Promise<ApiResponse<any>> => {
    const responseData = await api.post('/interests/respond', { fromUserId, response });
    return responseData.data;
  },
  getIncoming: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/interests/incoming');
    return response.data;
  },
  getOutgoing: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/interests/outgoing');
    return response.data;
  },
};

// Shortlist API
export const shortlistApi = {
  add: async (shortlistedUserId: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/shortlist/add', { shortlistedUserId });
    return response.data;
  },
  remove: async (shortlistedUserId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/shortlist/remove/${shortlistedUserId}`);
    return response.data;
  },
  get: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/shortlist');
    return response.data;
  },
  check: async (shortlistedUserId: string): Promise<ApiResponse<{ isShortlisted: boolean }>> => {
    const response = await api.get(`/shortlist/check/${shortlistedUserId}`);
    return response.data;
  },
};

// Location API
export const locationApi = {
  getCountries: async (): Promise<ApiResponse<Array<{ name: string; iso2: string; iso3: string }>>> => {
    const response = await api.get('/locations/countries');
    return response.data;
  },
  getStates: async (country: string): Promise<ApiResponse<Array<{ name: string }>>> => {
    const response = await api.get(`/locations/states?country=${encodeURIComponent(country)}`);
    return response.data;
  },
  getDistricts: async (state: string, country: string = 'India'): Promise<ApiResponse<Array<{ name: string }>>> => {
    const response = await api.get(`/locations/districts?state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`);
    return response.data;
  },
  getCities: async (country: string, state?: string): Promise<ApiResponse<Array<{ name: string }>>> => {
    const params = new URLSearchParams({ country });
    if (state) params.append('state', state);
    const response = await api.get(`/locations/cities?${params.toString()}`);
    return response.data;
  },
};

// Meta Data API - Education, Occupation, Religion, Salary
export const metaDataApi = {
  getEducation: async (): Promise<ApiResponse<Array<{ value: string; label: string }>>> => {
    const response = await api.get('/meta/education');
    return response.data;
  },
  getOccupation: async (): Promise<ApiResponse<Array<{ value: string; label: string }>>> => {
    const response = await api.get('/meta/occupation');
    return response.data;
  },
  getReligion: async (): Promise<ApiResponse<Array<{ value: string; label: string }>>> => {
    const response = await api.get('/meta/religion');
    return response.data;
  },
  getSalary: async (): Promise<ApiResponse<Array<{ value: number; label: string; min: number; max: number | null }>>> => {
    const response = await api.get('/meta/salary');
    return response.data;
  },
};

// Report API - Profile reporting/flagging
export const reportApi = {
  reportProfile: async (data: {
    reportedUserId: string;
    reason: 'inappropriate-content' | 'fake-profile' | 'misleading-information' | 'harassment' | 'spam' | 'other';
    description?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  getAllReports: async (filters?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  },
  getReport: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  updateReportStatus: async (id: string, data: { status: string; adminNotes?: string }): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/reports/${id}`, data);
    return response.data;
  },
  getUserReports: async (userId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/reports/user/${userId}`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  sendGlobalNotification: async (data: { title: string; message: string; metadata?: any }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/notifications/global', data);
    return response.data;
  },
  sendPersonalNotification: async (data: { userId: string; title: string; message: string; metadata?: any }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/notifications/personal', data);
    return response.data;
  },
  getAllUsers: async (filters?: { page?: number; limit?: number; search?: string; isActive?: boolean; gender?: string; status?: string }): Promise<ApiResponse<any[]> & { pagination?: Pagination }> => {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.append(key, String(value));
    });
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },
  updateUser: async (userId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },
  deleteUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  createAdminUser: async (data: { name: string; email?: string; phone?: string; password: string; gender: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/users/create-admin', data);
    return response.data;
  },
  getAllMessages: async (filters?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    senderId?: string; 
    receiverId?: string; 
    conversationId?: string; 
    isRead?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]> & { pagination?: Pagination }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/admin/messages?${params.toString()}`);
    return response.data;
  },
  getLoginLogs: async (filters?: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: 'success' | 'failed' | 'blocked';
    source?: 'browser' | 'mobile' | 'apk';
    loginMethod?: 'password' | 'otp' | 'token';
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<ApiResponse<any[]> & { pagination?: Pagination }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/admin/login-logs?${params.toString()}`);
    return response.data;
  },
};

// Community API - Questions
export const questionApi = {
  create: async (data: { title: string; content: string; category?: string; tags?: string[] }): Promise<ApiResponse<any>> => {
    const response = await api.post('/questions', data);
    return response.data;
  },
  getAll: async (filters?: { page?: number; limit?: number; category?: string; search?: string; sortBy?: string }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    const response = await api.get(`/questions?${params.toString()}`);
    return response.data;
  },
  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },
  update: async (id: string, data: { title?: string; content?: string; category?: string; tags?: string[] }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
  vote: async (id: string, voteType: 'upvote' | 'downvote'): Promise<ApiResponse<any>> => {
    const response = await api.post(`/questions/${id}/vote`, { voteType });
    return response.data;
  },
};

// Community API - Answers
export const answerApi = {
  create: async (questionId: string, content: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/answers/question/${questionId}`, { content });
    return response.data;
  },
  getByQuestion: async (questionId: string, options?: { page?: number; limit?: number; sortBy?: string }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await api.get(`/answers/question/${questionId}?${params.toString()}`);
    return response.data;
  },
  update: async (id: string, content: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/answers/${id}`, { content });
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/answers/${id}`);
    return response.data;
  },
  accept: async (id: string, questionId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/answers/${id}/accept/${questionId}`);
    return response.data;
  },
  vote: async (id: string, voteType: 'upvote' | 'downvote'): Promise<ApiResponse<any>> => {
    const response = await api.post(`/answers/${id}/vote`, { voteType });
    return response.data;
  },
};

export default api;

// Auth API
export const authApi = {
  login: async (identifier: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },
  sendOTP: async (phone: string): Promise<ApiResponse<{ otp?: string; message: string }>> => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },
  verifyOTP: async (phone: string, otp: string, options?: { name?: string; gender?: 'male' | 'female' | 'other' }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/verify-otp', { 
      phone, 
      otp,
      ...(options?.name && { name: options.name }),
      ...(options?.gender && { gender: options.gender }),
    });
    return response.data;
  },
};

// Profile Views API
export const profileViewApi = {
  trackView: async (viewedUserId: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/profile-views/track', { viewedUserId });
    return response.data;
  },
  getMyViews: async (options?: { page?: number; limit?: number }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await api.get(`/profile-views/my-views?${params.toString()}`);
    return response.data;
  },
};

// Messages API
export const messageApi = {
  send: async (receiverId: string, content: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/messages/send', { receiverId, content });
    return response.data;
  },
  getConversations: async (options?: { page?: number; limit?: number }): Promise<ApiResponse<any[]> & { unreadCount?: number }> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await api.get(`/messages/conversations?${params.toString()}`);
    return response.data;
  },
  getConversation: async (userId: string, options?: { page?: number; limit?: number }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await api.get(`/messages/conversation/${userId}?${params.toString()}`);
    return response.data;
  },
  markAsRead: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/messages/conversation/${userId}/read`);
    return response.data;
  },
};

// Notifications API
export const notificationApi = {
  getAll: async (options?: { page?: number; limit?: number; isRead?: boolean; type?: string }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, String(value));
      });
    }
    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// Photo API
export const photoApi = {
  upload: async (files: File[]): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    const response = await api.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (photoIndex: number): Promise<ApiResponse<User>> => {
    const response = await api.delete(`/photos/delete/${photoIndex}`);
    return response.data;
  },
  setPrimary: async (photoIndex: number): Promise<ApiResponse<User>> => {
    const response = await api.put(`/photos/primary/${photoIndex}`);
    return response.data;
  },
};

// Horoscope API
export interface HoroscopeMatch {
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'moderate' | 'average' | 'low' | 'insufficient_data';
  message: string;
  doshas: string[];
  details: Array<{
    name: string;
    score: number;
    max: number;
    matched: boolean;
    detail: string;
  }>;
  horoscope1: {
    rashi?: string;
    nakshatra?: string;
    starSign?: string;
  };
  horoscope2: {
    rashi?: string;
    nakshatra?: string;
    starSign?: string;
  };
}

export const horoscopeApi = {
  getMatch: async (userId: string): Promise<ApiResponse<HoroscopeMatch>> => {
    const response = await api.get(`/horoscope/match/${userId}`);
    return response.data;
  },
};

// Events API
export interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string; // ISO date string
  eventTime: string; // HH:MM format
  endDate?: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  organizer: string | { _id: string; name: string; email?: string; phone?: string };
  organizerName: string;
  category: 'gathering' | 'meeting' | 'celebration' | 'workshop' | 'seminar' | 'other';
  maxAttendees?: number;
  isPublic: boolean;
  imageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RSVP {
  _id: string;
  event: string | Event;
  user: string | User;
  status: 'going' | 'maybe' | 'notGoing';
  createdAt?: string;
}

export const eventApi = {
  getAll: async (options?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Event[]>> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, String(value));
      });
    }
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },
  getById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  create: async (data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await api.post('/events', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  rsvp: async (eventId: string, status: 'going' | 'maybe' | 'notGoing'): Promise<ApiResponse<RSVP>> => {
    const response = await api.post(`/events/${eventId}/rsvp`, { status });
    return response.data;
  },
  cancelRSVP: async (eventId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/events/${eventId}/rsvp`);
    return response.data;
  },
  getMyRSVPs: async (): Promise<ApiResponse<RSVP[]>> => {
    const response = await api.get('/events/my/rsvps');
    return response.data;
  },
};

// Health API
export interface DatabaseStatus {
  status: boolean;
  message: string;
  connectionState: string;
  stateCode: number;
  database: string;
  host: string;
  port: string | number;
  collections: number;
  collectionNames: string[];
  mongoUri: string;
  timestamp: string;
}

// Polls API
export interface PollOption {
  _id: string;
  text: string;
  votes: number;
}

export interface Poll {
  _id: string;
  title: string;
  description?: string;
  createdBy: string | { _id: string; name: string; email?: string };
  options: PollOption[];
  category: 'general' | 'community' | 'platform' | 'feature' | 'other';
  isActive: boolean;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: string;
  totalVotes: number;
  hasVoted?: boolean; // Whether current user has voted
  userVote?: string; // Option ID that user voted for
  createdAt?: string;
  updatedAt?: string;
}

export const pollApi = {
  getAll: async (options?: {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Poll[]>> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, String(value));
      });
    }
    const response = await api.get(`/polls?${params.toString()}`);
    return response.data;
  },
  getActive: async (): Promise<ApiResponse<Poll[]>> => {
    const response = await api.get('/polls/active');
    return response.data;
  },
  getById: async (id: string): Promise<ApiResponse<Poll>> => {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },
  create: async (data: Partial<Poll>): Promise<ApiResponse<Poll>> => {
    const response = await api.post('/polls', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Poll>): Promise<ApiResponse<Poll>> => {
    const response = await api.patch(`/polls/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/polls/${id}`);
    return response.data;
  },
  vote: async (pollId: string, optionId: string): Promise<ApiResponse<Poll>> => {
    const response = await api.post(`/polls/${pollId}/vote`, { optionId });
    return response.data;
  },
};

// Health API
export interface DatabaseStatus {
  status: boolean;
  message: string;
  connectionState: string;
  stateCode: number;
  database: string;
  host: string;
  port: string | number;
  collections: number;
  collectionNames: string[];
  mongoUri: string;
  timestamp: string;
}

export const healthApi = {
  checkDatabase: async (): Promise<ApiResponse<DatabaseStatus>> => {
    const response = await api.get('/health/db');
    return response.data;
  },
};

