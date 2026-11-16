const mongoose = require('mongoose');

const RentalAgreementSchema = new mongoose.Schema(
  {
    agreementNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
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
    bedNumber: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    monthlyRent: {
      type: Number,
      required: true
    },
    securityDeposit: {
      type: Number,
      required: true
    },
    noticePeriodDays: {
      type: Number,
      default: 30
    },
    termsAndConditions: [
      {
        type: String
      }
    ],
    documentUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Acknowledgment', 'Active', 'Expired', 'Terminated'],
      default: 'Pending Acknowledgment',
      index: true
    },
    tenantAcknowledged: {
      type: Boolean,
      default: false
    },
    tenantAcknowledgedAt: {
      type: Date
    },
    ownerAcknowledged: {
      type: Boolean,
      default: false
    },
    ownerAcknowledgedAt: {
      type: Date
    },
    renewalReminderSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

RentalAgreementSchema.index({ tenant: 1, status: 1 });
RentalAgreementSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('RentalAgreement', RentalAgreementSchema);
