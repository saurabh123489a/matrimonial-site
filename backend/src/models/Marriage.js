import mongoose from 'mongoose';

/**
 * Marriage Schema - Track successful marriages through the platform
 * Displayed on dashboard
 */
const marriageSchema = new mongoose.Schema(
  {
    // Couple Information
    groomUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brideUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Marriage Details
    marriageDate: {
      type: Date,
      required: true,
      index: true,
    },
    marriageLocation: {
      city: String,
      district: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    
    // Contact/Registration Details (who registered this marriage)
    registeredBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: String,
      phone: String,
      email: String,
    },
    
    // Additional Information
    ceremonyType: {
      type: String,
      enum: ['traditional', 'modern', 'both'],
      default: 'traditional',
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    
    // Photos
    photos: [{
      url: { type: String, required: true },
      caption: String,
      order: { type: Number, default: 0 },
    }],
    
    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Stats (for dashboard)
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
marriageSchema.index({ marriageDate: -1 });
marriageSchema.index({ 'marriageLocation.district': 1 });
marriageSchema.index({ isVerified: 1, isActive: 1 });
marriageSchema.index({ groomUserId: 1, brideUserId: 1 });

export default mongoose.model('Marriage', marriageSchema);

