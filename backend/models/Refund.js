const mongoose = require('mongoose');

const RefundSchema = new mongoose.Schema(
  {
    refundNumber: {
      type: String,
      default: () => `RFND-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Refund amount is required']
    },
    originalAmount: {
      type: Number,
      required: true
    },
    refundType: {
      type: String,
      enum: ['Full', 'Partial'],
      default: 'Full'
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for refund']
    },
    cancellationRuleApplied: {
      type: String,
      default: 'Standard Cancellation Policy'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Processed', 'Rejected', 'Failed'],
      default: 'Pending'
    },
    razorpayRefundId: {
      type: String,
      default: ''
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

RefundSchema.index({ payer: 1, createdAt: -1 });
RefundSchema.index({ payee: 1, createdAt: -1 });
RefundSchema.index({ status: 1 });

module.exports = mongoose.model('Refund', RefundSchema);
