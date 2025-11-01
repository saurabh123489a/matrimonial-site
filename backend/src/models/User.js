import mongoose from 'mongoose';

// Family information schema
const familySchema = new mongoose.Schema(
  {
    fathersName: String,
    fathersOccupation: String,
    mothersName: String,
    mothersOccupation: String,
    numberOfBrothers: { type: Number, default: 0 },
    numberOfSisters: { type: Number, default: 0 },
    familyType: { type: String, enum: ['joint', 'nuclear'], default: 'nuclear' },
    familyStatus: { type: String, enum: ['middle-class', 'upper-middle-class', 'upper-class', 'lower-middle-class'], default: 'middle-class' },
    familyValues: { type: String, enum: ['traditional', 'moderate', 'liberal'], default: 'moderate' },
  },
  { _id: false }
);

// Preferences schema for partner search criteria
const preferenceSchema = new mongoose.Schema(
  {
    minAge: { type: Number, min: 18, max: 100 },
    maxAge: { type: Number, min: 18, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    minHeight: { type: Number },
    maxHeight: { type: Number },
    religion: String,
    caste: String,
    subCaste: String,
    location: String,
    education: String,
    occupation: String,
    maritalStatus: String,
  },
  { _id: false }
);

// Photo schema for user photos
const photoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// User schema with all profile fields (Gahoi Sathi style)
const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: false, // Explicitly disable auto-index, we create it manually below
    },
    phone: {
      type: String,
      trim: true,
      index: false, // Explicitly disable auto-index, we create it manually below
    },
    passwordHash: { type: String, required: false }, // Optional for OTP-based auth
    
    // Basic Info
    name: { type: String, required: true, trim: true },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'], 
      required: true 
    },
    dateOfBirth: { type: Date },
    age: { type: Number, min: 18, max: 100 },
    maritalStatus: { 
      type: String, 
      enum: ['unmarried', 'divorced', 'widowed', 'separated'],
      default: 'unmarried'
    },
    
    // Physical Attributes
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    complexion: { 
      type: String, 
      enum: ['very-fair', 'fair', 'wheatish', 'dark', 'not-specified'],
      default: 'not-specified'
    },
    
    // Location
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    pincode: { type: String },
    
    // Family & Background
    religion: { type: String },
    caste: { type: String },
    subCaste: { type: String },
    gotra: { type: String }, // Ancestral lineage
    motherTongue: { type: String },
    
    // Horoscope Details (OPTIONAL - not mandatory)
    // Users can skip this section if they don't have horoscope details
    horoscopeDetails: {
      starSign: String, // Optional
      rashi: String, // Optional
      nakshatra: String, // Optional
    },
    
    // Education & Career
    education: { type: String },
    fieldOfStudy: { type: String }, // Specialization or major
    occupation: { type: String },
    employer: { type: String }, // Company or organization name
    annualIncome: { type: Number },
    
    // Family Information
    family: familySchema,
    
    // Lifestyle
    diet: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan', 'jain'] },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    hobbies: [{ type: String }], // Array of hobbies/interests
    
    // Profile Content
    bio: { type: String, maxlength: 2000 }, // Increased from 1000
    photos: [photoSchema],
    
    // Preferences for matching
    preferences: preferenceSchema,
    
    // Community Position - allows user to report/flag profiles
    communityPosition: {
      type: String,
      enum: [
        'community-leader',
        'community-member',
        'family-head',
        'elder',
        'volunteer',
        null
      ],
      default: null,
      index: true,
    },
    
    // Profile Status
    isProfileComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false }, // Admin flag for admin board access
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ gender: 1, age: 1 });
userSchema.index({ city: 1, state: 1 });
userSchema.index({ religion: 1 });
userSchema.index({ caste: 1 });
userSchema.index({ maritalStatus: 1 });
userSchema.index({ education: 1 });
userSchema.index({ occupation: 1 });

export default mongoose.model('User', userSchema);
