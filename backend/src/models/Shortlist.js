import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    shortlistedUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
  },
  { timestamps: true }
);

// Prevent duplicate shortlist entries
shortlistSchema.index({ userId: 1, shortlistedUserId: 1 }, { unique: true });

export default mongoose.model('Shortlist', shortlistSchema);

