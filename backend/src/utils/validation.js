import { z } from 'zod';

/**
 * Validation schemas using Zod
 * Centralized validation for request data
 */

// User registration schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().min(18).max(100).optional(),
  dateOfBirth: z.string().optional(),
  communityPosition: z.enum([
    'community-leader',
    'community-member',
    'family-head',
    'elder',
    'volunteer',
    null
  ]).optional().nullable(),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

// Report schema
export const reportSchema = z.object({
  reportedUserId: z.string().min(1, 'Reported user ID is required'),
  reason: z.enum([
    'inappropriate-content',
    'fake-profile',
    'misleading-information',
    'harassment',
    'spam',
    'other'
  ]),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// User profile update schema (Gahoi Sathi comprehensive fields)
export const updateProfileSchema = z.object({
  // Basic Info
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().min(18).max(100).optional(),
  dateOfBirth: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  complexion: z.enum(['very-fair', 'fair', 'wheatish', 'dark', 'not-specified']).optional(),
  maritalStatus: z.enum(['unmarried', 'divorced', 'widowed', 'separated']).optional(),
  
  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  
  // Family & Background
  gotra: z.string().optional(),
  motherTongue: z.string().optional(),
  
  // Horoscope
  horoscopeDetails: z.object({
    starSign: z.string().optional(),
    rashi: z.string().optional(),
    nakshatra: z.string().optional(),
  }).optional(),
  
  // Education & Career
  education: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  annualIncome: z.number().positive().optional(),
  
  // Family Information
  family: z.object({
    fathersName: z.string().optional(),
    fathersOccupation: z.string().optional(), // Keep for backward compatibility
    fathersOccupationType: z.enum(['job', 'private', 'govt', 'business']).optional(),
    fathersOccupationDesc: z.string().optional(),
    fathersContactNumber: z.string().optional(),
    mothersName: z.string().optional(),
    mothersOccupation: z.string().optional(), // Keep for backward compatibility
    mothersOccupationType: z.enum(['job', 'private', 'govt', 'business']).optional(),
    mothersOccupationDesc: z.string().optional(),
    numberOfBrothers: z.number().min(0).optional(),
    numberOfSisters: z.number().min(0).optional(),
    familyType: z.enum(['joint', 'nuclear']).optional(),
    familyStatus: z.enum(['middle-class', 'upper-middle-class', 'upper-class', 'lower-middle-class']).optional(),
    familyValues: z.enum(['traditional', 'moderate', 'liberal']).optional(),
  }).optional(),
  
  // Lifestyle
  diet: z.enum(['vegetarian', 'non-vegetarian', 'vegan', 'jain']).optional(),
  smoking: z.boolean().optional(),
  drinking: z.boolean().optional(),
  hobbies: z.array(z.string()).optional(),
  
  // Profile Content
  bio: z.string().max(2000).optional(),
  photos: z.array(z.object({
    url: z.string().url(),
    isPrimary: z.boolean().optional(),
    order: z.number().optional(),
  })).optional(),
  
  // Preferences
  preferences: z.object({
    minAge: z.number().min(18).max(100).optional(),
    maxAge: z.number().min(18).max(100).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    minHeight: z.number().positive().optional(),
    maxHeight: z.number().positive().optional(),
    location: z.string().optional(),
    education: z.string().optional(),
    occupation: z.string().optional(),
    maritalStatus: z.string().optional(),
  }).optional(),

  // Community Position
  communityPosition: z.enum([
    'community-leader',
    'community-member',
    'family-head',
    'elder',
    'volunteer',
    null
  ]).optional().nullable(),
});

export const sendOTPSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
});

export const verifyOTPSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
});

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({
          status: false,
          message: 'Validation error',
          errors: error.errors
        });
      }
      next(error);
    }
  };
};
