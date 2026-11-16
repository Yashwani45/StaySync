const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetType: {
      type: String,
      required: true,
      enum: ['Property', 'User', 'ServiceProvider', 'Review']
    },
    targetId: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Fake Listing', 'Scam / Fraud', 'Inappropriate Content', 'Suspicious Behavior', 'Harassment', 'Other']
    },
    description: {
      type: String,
      required: [true, 'Please provide description of the report']
    },
    evidenceUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);
