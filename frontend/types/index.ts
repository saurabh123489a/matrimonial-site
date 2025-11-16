/**
 * Centralized TypeScript type definitions
 */

// API Response Types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  hasMore?: boolean;
  nextCursor?: string | null;
}

// User Types
export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  dateOfBirth?: string | Date;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  occupation?: string;
  bio?: string;
  photos?: Photo[];
  preferences?: UserPreferences;
  horoscopeDetails?: HoroscopeDetails;
  communityPosition?: string | null;
  gahoiId?: number;
  isActive?: boolean;
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Photo {
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface UserPreferences {
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  gender?: string;
  location?: string;
}

export interface HoroscopeDetails {
  starSign?: string;
  rashi?: string;
  nakshatra?: string;
  aakna?: string;
  manglikStatus?: 'manglik' | 'angshik' | 'non-manglik' | null;
  timeOfBirth?: string;
  placeOfBirth?: string;
}

// Message Types
export interface Message {
  _id: string;
  senderId: string | User;
  receiverId: string | User;
  content: string;
  conversationId?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  _id: string;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// Interest Types
export interface Interest {
  _id: string;
  fromUser: User;
  toUser: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: 'shortlist' | 'profile_view' | 'interest_received' | 'interest_accepted' | 'message_received' | 'admin';
  title: string;
  message: string;
  relatedUserId?: string;
  relatedId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Profile View Types
export interface ProfileView {
  _id: string;
  viewerId: string | User;
  viewedUserId: string | User;
  viewedAt: string;
  hasMessaged: boolean;
  createdAt: string;
}

// Form Types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

// Socket Types
export interface SocketMessage {
  type: 'new-message' | 'typing' | 'notification';
  data: any;
}

// Search/Filter Types
export interface SearchFilters {
  gender?: 'male' | 'female' | 'other';
  minAge?: number;
  maxAge?: number;
  city?: string;
  state?: string;
  education?: string;
  occupation?: string;
  minHeight?: number;
  maxHeight?: number;
  religion?: string;
  communityPosition?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  before?: string;
  skip?: number;
}

// API Error Types
export interface ApiError {
  status: false;
  message: string;
  code?: string;
  field?: string;
  errors?: FormFieldError[];
}

