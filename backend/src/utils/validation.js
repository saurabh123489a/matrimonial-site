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
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  mobileCountryCode: z.number().int().positive().optional(),
  whatsappNumber: z.string().regex(/^[0-9]{10}$/).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().min(18).max(100).optional(),
  dateOfBirth: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  complexion: z.enum(['very-fair', 'fair', 'wheatish', 'dark', 'not-specified']).optional(),
  maritalStatus: z.enum(['unmarried', 'divorced', 'widowed', 'separated']).optional(),
  disability: z.enum(['no', 'yes', 'not-specified']).optional(),
  profileCreatedBy: z.enum(['self', 'family', 'relative', 'friend']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  
  // Location
  city: z.string().optional(),
  cityId: z.number().int().positive().optional(),
  state: z.string().optional(),
  stateId: z.number().int().positive().optional(),
  country: z.string().optional(),
  countryId: z.number().int().positive().optional(),
  town: z.string().optional(),
  pincode: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  
  // Family & Background
  gotra: z.string().optional(),
  motherTongue: z.string().optional(),
  
  // Horoscope
  horoscopeDetails: z.object({
    starSign: z.string().optional(),
    zodiac: z.string().optional(),
    rashi: z.string().optional(),
    nakshatra: z.string().optional(),
    aakna: z.string().optional(),
    manglikStatus: z.enum(['manglik', 'angshik', 'non-manglik']).optional().nullable(),
    timeOfBirth: z.string().optional(),
    placeOfBirth: z.string().optional(),
  }).optional(),
  
  // Education & Career
  education: z.string().optional(),
  educationalDetail: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  occupation: z.string().optional(),
  profession: z.string().optional(),
  employer: z.string().optional(),
  occupationDetail: z.string().optional(),
  annualIncome: z.string().optional(), // Changed to string to support ranges like "25-30 lakh"
  
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
  dietaryHabit: z.string().optional(),
  smoking: z.boolean().optional(),
  drinking: z.boolean().optional(),
  hobbies: z.array(z.string()).optional(),
  partnerPreference: z.string().max(500).optional(),
  
  // Property & Assets
  hasHouse: z.enum(['yes-personal', 'yes-rented', 'no', 'not-specified']).optional(),
  hasCar: z.boolean().optional(),
  
  // Profile Content
  bio: z.string().max(2000).optional(),
  aboutMyself: z.string().max(2000).optional(),
  profilePictureName: z.string().optional(),
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

  // Horoscope matching requirement
  horoscopeMatchMandatory: z.boolean().optional(),

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
