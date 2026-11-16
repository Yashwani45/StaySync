const mongoose = require('mongoose');

const PlatformSettingsSchema = new mongoose.Schema(
  {
    supportedCities: {
      type: [String],
      default: [
        'Indore', 'Bhopal', 'Bangalore', 'Pune', 'Mumbai', 
        'Delhi', 'Jaipur', 'Hyderabad', 'Kota', 'Ujjain'
      ]
    },
    platformFeePercent: {
      type: Number,
      default: 5
    },
    supportEmail: {
      type: String,
      default: 'support@staysync.com'
    },
    supportPhone: {
      type: String,
      default: '+91 (0731) 492-SYNC'
    },
    emergencyHelpline: {
      type: String,
      default: '+91 98765 43210'
    },
    headquartersAddress: {
      type: String,
      default: 'AB Road, Vijay Nagar, Indore, Madhya Pradesh 452010'
    },
    requirePhysicalAuditForVerification: {
      type: Boolean,
      default: true
    },
    allowDirectTiffinBooking: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    termsUrl: {
      type: String,
      default: '/terms'
    },
    privacyUrl: {
      type: String,
      default: '/privacy'
    },
    refundPolicyUrl: {
      type: String,
      default: '/refund-policy'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PlatformSettings', PlatformSettingsSchema);
