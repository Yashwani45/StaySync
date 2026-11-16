const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: false
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonthlyBill',
      required: false
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: false
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: false
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
      required: [true, 'Please specify payment amount']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    gateway: {
      type: String,
      default: 'Razorpay'
    },
    gatewayOrderId: {
      type: String,
      default: ''
    },
    gatewayPaymentId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Created', 'Pending', 'Processing', 'Authorized', 'Captured', 'Partially Paid', 'Refunded', 'Partially Refunded', 'Failed', 'Cancelled'],
      default: 'Created'
    },
    paymentMethod: {
      type: String,
      default: 'UPI' // UPI, NetBanking, Card, Wallet
    },
    itemType: {
      type: String,
      enum: ['Property', 'ServiceProvider', 'MonthlyBill', 'Other'],
      default: 'Property'
    },
    serviceCategory: {
      type: String,
      enum: ['Accommodation', 'Tiffin', 'Laundry', 'Cleaning', 'Repair', 'Movers', 'Other'],
      default: 'Accommodation'
    },
    itemTitle: {
      type: String,
      default: ''
    },
    billingMonth: {
      type: Number, // 1 to 12
      default: () => new Date().getMonth() + 1
    },
    billingYear: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    platformCommissionRate: {
      type: Number,
      default: 5 // 5%
    },
    platformCommissionAmount: {
      type: Number,
      default: 0
    },
    netProviderAmount: {
      type: Number,
      default: 0
    },
    receiptNumber: {
      type: String,
      default: ''
    },
    invoiceNumber: {
      type: String,
      default: ''
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String
      }
    ],
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

PaymentSchema.index({ payer: 1, createdAt: -1 });
PaymentSchema.index({ payee: 1, createdAt: -1 });
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ billId: 1 });
PaymentSchema.index({ billingYear: 1, billingMonth: 1 });
PaymentSchema.index({ serviceCategory: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
