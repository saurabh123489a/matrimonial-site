import mongoose from 'mongoose';

// Family information schema
const familySchema = new mongoose.Schema(
  {
    fathersName: String,
    fathersOccupation: String, // Keep for backward compatibility
    fathersOccupationType: { type: String, enum: ['job', 'private', 'govt', 'business'], default: null },
    fathersOccupationDesc: String, // Description field that appears when type is selected
    fathersContactNumber: String,
    mothersName: String,
    mothersOccupation: String, // Keep for backward compatibility
    mothersOccupationType: { type: String, enum: ['job', 'private', 'govt', 'business'], default: null },
    mothersOccupationDesc: String, // Description field that appears when type is selected
    numberOfBrothers: { type: Number, default: 0 },
    numberOfSisters: { type: Number, default: 0 },
    marriedBrothers: { type: Number, default: 0 },
    unmarriedBrothers: { type: Number, default: 0 },
    marriedSisters: { type: Number, default: 0 },
    unmarriedSisters: { type: Number, default: 0 },
    maternalUncleName: String,
    maternalUncleAakna: String,
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
    whatsappNumber: { type: String, trim: true }, // Separate WhatsApp number
    passwordHash: { type: String, required: false }, // Optional for OTP-based auth
    
    // Gahoi ID - 5 digit number starting with 1000 (even = male, odd = female)
    gahoiId: { 
      type: Number, 
      unique: true, 
      sparse: true,
      // Note: unique: true automatically creates an index, explicit index defined below
    },
    
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
    height: { type: Number }, // in inches
    weight: { type: Number }, // in kg
    complexion: { 
      type: String, 
      enum: ['very-fair', 'fair', 'wheatish', 'dark', 'not-specified'],
      default: 'not-specified'
    },
    bloodGroup: { 
      type: String, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
      default: null
    },
    disability: { 
      type: String, 
      enum: ['no', 'yes', 'not-specified'],
      default: 'no'
    },
    profileCreatedBy: {
      type: String,
      enum: ['self', 'family', 'relative', 'friend'],
      default: 'self'
    },
    
    // Location
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    town: { type: String }, // Town/Village name
    pincode: { type: String },
    presentAddress: { type: String },
    permanentAddress: { type: String },
    
    // Family & Background
    gotra: { type: String }, // Ancestral lineage
    motherTongue: { type: String },
    
    // Horoscope Details (OPTIONAL - not mandatory)
    // Users can skip this section if they don't have horoscope details
    horoscopeDetails: {
      starSign: String, // Optional
      rashi: String, // Optional
      nakshatra: String, // Optional
      aakna: String, // Optional - Aakna/Gotra from mother's side
      manglikStatus: { 
        type: String, 
        enum: ['manglik', 'angshik', 'non-manglik', null],
        default: null
      },
      timeOfBirth: String, // HH:MM:SS format
      placeOfBirth: String,
    },
    
    // Education & Career
    education: { type: String },
    educationalDetail: { type: String }, // Graduate, Post-graduate, etc.
    fieldOfStudy: { type: String }, // Specialization or major
    occupation: { type: String },
    profession: { type: String }, // Specific profession (e.g., "Computer Software Professional")
    employer: { type: String }, // Company or organization name
    occupationDetail: { type: String }, // Detailed occupation info
    annualIncome: { type: String }, // Changed to String to support ranges like "25-30 lakh"
    
    // Family Information
    family: familySchema,
    
    // Lifestyle
    diet: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan', 'jain'] },
    dietaryHabit: { type: String }, // Alternative field name for compatibility (e.g., "Veg / शाकाहारी")
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    hobbies: [{ type: String }], // Array of hobbies/interests
    partnerPreference: { type: String, maxlength: 500 }, // Text field for partner preference description
    
    // Property & Assets
    hasHouse: {
      type: String,
      enum: ['yes-personal', 'yes-rented', 'no', 'not-specified'],
      default: 'not-specified'
    },
    hasCar: {
      type: Boolean,
      default: false
    },
    
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
userSchema.index({ gahoiId: 1 }, { unique: true, sparse: true });
userSchema.index({ gender: 1, age: 1 });
userSchema.index({ city: 1, state: 1 });
userSchema.index({ maritalStatus: 1 });
userSchema.index({ education: 1 });
userSchema.index({ occupation: 1 });

export default mongoose.model('User', userSchema);
