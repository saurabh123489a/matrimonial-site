import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    errorType: {
      type: String,
      enum: ['api', 'database', 'validation', 'authentication', 'authorization', 'external', 'unknown'],
      default: 'unknown',
      index: true,
    },
    statusCode: {
      type: Number,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    request: {
      method: String,
      url: String,
      body: mongoose.Schema.Types.Mixed,
      query: mongoose.Schema.Types.Mixed,
      params: mongoose.Schema.Types.Mixed,
      headers: mongoose.Schema.Types.Mixed,
    },
    device: {
      userAgent: String,
      ipAddress: String,
      platform: String,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for error tracking
errorLogSchema.index({ errorType: 1, createdAt: -1 });
errorLogSchema.index({ resolved: 1, createdAt: -1 });
errorLogSchema.index({ createdAt: -1 });

export default mongoose.model('ErrorLog', errorLogSchema);

