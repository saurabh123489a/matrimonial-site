import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    targetType: {
      type: String,
      enum: ['question', 'answer'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true
    },
  },
  { timestamps: true }
);

// Prevent duplicate votes
voteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);

