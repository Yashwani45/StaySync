const mongoose = require('mongoose');

const MonthlyBillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: false
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: false
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: false
    },
    category: {
      type: String,
      enum: ['Accommodation', 'Tiffin', 'Laundry', 'Cleaning', 'Repair', 'Movers', 'Other'],
      default: 'Accommodation',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    billingMonth: {
      type: Number, // 1 to 12
      required: true
    },
    billingYear: {
      type: Number, // e.g. 2026
      required: true
    },
    generationDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    baseAmount: {
      type: Number,
      required: true,
      default: 0
    },
    utilityCharges: {
      type: Number,
      default: 0
    },
    additionalCharges: {
      type: Number,
      default: 0
    },
    lateFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled', 'Refunded'],
      default: 'Pending',
      index: true
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
      }
    ],
    invoiceNumber: {
      type: String,
      default: ''
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

MonthlyBillSchema.index({ customer: 1, billingYear: 1, billingMonth: 1 });
MonthlyBillSchema.index({ provider: 1, billingYear: 1, billingMonth: 1 });
MonthlyBillSchema.index({ customer: 1, status: 1 });
MonthlyBillSchema.index({ provider: 1, status: 1 });

module.exports = mongoose.model('MonthlyBill', MonthlyBillSchema);
