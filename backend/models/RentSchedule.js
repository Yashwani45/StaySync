const mongoose = require('mongoose');

const RentScheduleSchema = new mongoose.Schema(
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
    month: {
      type: String, // e.g. "November 2026"
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    baseRent: {
      type: Number,
      required: true
    },
    utilityCharges: {
      type: Number,
      default: 0
    },
    lateFee: {
      type: Number,
      default: 0
    },
    totalDue: {
      type: Number,
      required: true
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Due', 'Overdue', 'Paid', 'Partially Paid'],
      default: 'Upcoming',
      index: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    paidAt: {
      type: Date
    },
    receiptNumber: {
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

RentScheduleSchema.index({ tenant: 1, dueDate: 1 });
RentScheduleSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('RentSchedule', RentScheduleSchema);
