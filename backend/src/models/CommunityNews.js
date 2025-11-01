import mongoose from 'mongoose';

/**
 * Community News Schema - Location-based news/articles
 * Show news based on user's district, nearby districts, or global
 */
const communityNewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    
    // Author/Publisher
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorName: {
      type: String,
      trim: true,
    },
    
    // Location Targeting
    targetLocation: {
      type: {
        type: String,
        enum: ['district', 'state', 'country', 'global'],
        default: 'global',
        index: true,
      },
      districts: [{
        type: String,
        trim: true,
      }],
      states: [{
        type: String,
        trim: true,
      }],
      countries: [{
        type: String,
        trim: true,
      }],
    },
    
    // News Category
    category: {
      type: String,
      enum: [
        'marriage',
        'festival',
        'community-event',
        'achievement',
        'announcement',
        'news',
        'general'
      ],
      default: 'general',
      index: true,
    },
    
    // Media
    featuredImage: {
      type: String,
    },
    images: [{
      url: String,
      caption: String,
    }],
    
    // Engagement
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    
    // Status
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Admin/Moderation
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
communityNewsSchema.index({ 'targetLocation.type': 1, isPublished: 1, createdAt: -1 });
communityNewsSchema.index({ 'targetLocation.districts': 1, isPublished: 1 });
communityNewsSchema.index({ category: 1, createdAt: -1 });
communityNewsSchema.index({ isFeatured: 1, createdAt: -1 });
communityNewsSchema.index({ isActive: 1, isPublished: 1, createdAt: -1 });

export default mongoose.model('CommunityNews', communityNewsSchema);

