const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    roomNumber: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['MoveIn', 'MoveOut'],
      required: true
    },
    inspectionDate: {
      type: Date,
      default: Date.now
    },
    roomConditionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    checklist: [
      {
        item: { type: String, required: true },
        status: { type: String, enum: ['Good', 'Damaged', 'Missing', 'Needs Repair'], default: 'Good' },
        notes: { type: String, default: '' }
      }
    ],
    photos: [
      {
        type: String
      }
    ],
    depositAmount: {
      type: Number,
      default: 0
    },
    estimatedDamageDeduction: {
      type: Number,
      default: 0
    },
    deductionReason: {
      type: String,
      default: ''
    },
    finalRefundAmount: {
      type: Number,
      default: 0
    },
    settlementStatus: {
      type: String,
      enum: ['Pending', 'Agreed', 'Disputed', 'Settled'],
      default: 'Pending',
      index: true
    },
    tenantConfirmed: {
      type: Boolean,
      default: false
    },
    ownerConfirmed: {
      type: Boolean,
      default: false
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

InspectionSchema.index({ booking: 1, type: 1 });
InspectionSchema.index({ tenant: 1, createdAt: -1 });

module.exports = mongoose.model('Inspection', InspectionSchema);
