const mongoose = require('mongoose');

const TransactionAuditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actorName: {
      type: String,
      default: ''
    },
    actorRole: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      required: true,
      enum: [
        'PAYMENT_ORDER_CREATED',
        'PAYMENT_CAPTURED',
        'PAYMENT_FAILED',
        'BILL_GENERATED',
        'BILL_PAID',
        'BILL_PARTIALLY_PAID',
        'REFUND_REQUESTED',
        'REFUND_APPROVED',
        'REFUND_REJECTED',
        'SETTLEMENT_INITIATED',
        'SETTLEMENT_COMPLETED',
        'SETTLEMENT_FAILED'
      ]
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Payment', 'MonthlyBill', 'Refund', 'Settlement']
    },
    entityId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      default: 0
    },
    statusBefore: {
      type: String,
      default: ''
    },
    statusAfter: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

TransactionAuditLogSchema.index({ actor: 1, createdAt: -1 });
TransactionAuditLogSchema.index({ entityType: 1, entityId: 1 });
TransactionAuditLogSchema.index({ action: 1 });

module.exports = mongoose.model('TransactionAuditLog', TransactionAuditLogSchema);
