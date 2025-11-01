import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    content: { 
      type: String, 
      required: true,
      maxlength: 5000
    },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    category: { 
      type: String,
      enum: ['relationship', 'wedding', 'family', 'dowry', 'traditions', 'lifestyle', 'career', 'general'],
      default: 'general',
      index: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    answersCount: {
      type: Number,
      default: 0
    },
    isSolved: {
      type: Boolean,
      default: false
    },
    solvedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index({ category: 1, createdAt: -1 });
questionSchema.index({ upvotes: -1 });
questionSchema.index({ tags: 1 });

export default mongoose.model('Question', questionSchema);

