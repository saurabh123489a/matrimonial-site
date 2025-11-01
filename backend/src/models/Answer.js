import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    content: { 
      type: String, 
      required: true,
      maxlength: 5000
    },
    question: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Question', 
      required: true
    },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    isAccepted: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

// Indexes
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ upvotes: -1 });

export default mongoose.model('Answer', answerSchema);

