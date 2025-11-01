import mongoose from 'mongoose';

/**
 * Family Schema - For family details registration
 * Allows families to register and be listed by district
 */
const familySchema = new mongoose.Schema(
  {
    // Family Head/Contact Person
    familyHeadName: {
      type: String,
      required: true,
      trim: true,
    },
    familyHeadPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    familyHeadEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    
    // Location (for district-based filtering)
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    
    // Family Details
    familyType: {
      type: String,
      enum: ['joint', 'nuclear'],
      default: 'nuclear',
    },
    familyStatus: {
      type: String,
      enum: ['middle-class', 'upper-middle-class', 'upper-class', 'lower-middle-class'],
      default: 'middle-class',
    },
    familyValues: {
      type: String,
      enum: ['traditional', 'moderate', 'liberal'],
      default: 'moderate',
    },
    
    // Additional Family Information
    totalMembers: {
      type: Number,
      default: 0,
    },
    aboutFamily: {
      type: String,
      maxlength: 1000,
    },
    
    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
familySchema.index({ district: 1, state: 1 });
familySchema.index({ district: 1, isActive: 1 });
familySchema.index({ familyHeadPhone: 1 });

export default mongoose.model('Family', familySchema);

