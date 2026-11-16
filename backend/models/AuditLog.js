const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actorName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'PROPERTY_APPROVED',
        'PROPERTY_REJECTED',
        'PROVIDER_VERIFIED',
        'PROVIDER_REJECTED',
        'USER_SUSPENDED',
        'USER_REACTIVATED',
        'LISTING_DELETED',
        'REPORT_RESOLVED',
        'SYSTEM_CONFIG_UPDATED'
      ]
    },
    targetType: {
      type: String,
      required: true,
      enum: ['Property', 'User', 'ServiceProvider', 'Report', 'Review']
    },
    targetId: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: 'N/A'
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

// Audit logs must be indexed by action & target for fast search
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
