const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema(
  {
    settlementNumber: {
      type: String,
      default: () => `SETTLE-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    periodStart: {
      type: Date,
      required: true
    },
    periodEnd: {
      type: Date,
      required: true
    },
    totalBookingsAmount: {
      type: Number,
      required: true,
      default: 0
    },
    platformCommissionRate: {
      type: Number,
      required: true,
      default: 5 // 5%
    },
    commissionAmount: {
      type: Number,
      required: true,
      default: 0
    },
    refundDeductions: {
      type: Number,
      default: 0
    },
    taxDeductions: {
      type: Number,
      default: 0
    },
    netPayoutAmount: {
      type: Number,
      required: true,
      default: 0
    },
    bookingIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request'
      }
    ],
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
      }
    ],
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Settled', 'Completed', 'Failed', 'On Hold'],
      default: 'Pending'
    },
    payoutMethod: {
      type: String,
      default: 'IMPS / NEFT Direct Bank Transfer'
    },
    bankDetails: {
      accountHolder: { type: String, default: '' },
      accountNumberMasked: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' }
    },
    transactionReference: {
      type: String,
      default: ''
    },
    settledAt: {
      type: Date
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

SettlementSchema.index({ owner: 1, createdAt: -1 });
SettlementSchema.index({ status: 1 });

module.exports = mongoose.model('Settlement', SettlementSchema);
