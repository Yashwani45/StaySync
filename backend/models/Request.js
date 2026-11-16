const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemType: {
      type: String,
      enum: ['Property', 'ServiceProvider', 'Roommate'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemType' // dynamic references
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Owner Approved',
        'Accepted',
        'Payment Pending',
        'Confirmed',
        'Checked In',
        'Completed',
        'Rejected',
        'Cancelled',
        'Expired',
        'Refund Pending',
        'Partially Refunded',
        'Refunded'
      ],
      default: 'Pending',
      index: true
    },
    message: {
      type: String,
      required: [true, 'Please add a message']
    },
    proposedPrice: {
      type: Number
    },
    // Specific Room & Bed Assignment
    assignedBed: {
      roomNumber: { type: String, default: '' },
      bedNumber: { type: String, default: '' }
    },
    checkInCompletedAt: { type: Date, default: null },
    checkOutCompletedAt: { type: Date, default: null },
    cancellationDetails: {
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      cancelledAt: { type: Date },
      reason: { type: String, default: '' },
      refundAmount: { type: Number, default: 0 },
      refundStatus: {
        type: String,
        enum: ['None', 'Initiated', 'Completed', 'Failed'],
        default: 'None'
      }
    },
    // Detailed Accommodation Booking Metadata
    bookingDetails: {
      checkInDate: Date,
      checkOutDate: Date,
      durationMonths: { type: Number, default: 1 },
      occupants: { type: Number, default: 1 },
      roomType: String,
      tierId: String
    },
    // Independent Tiffin / Laundry / Cleaning Details
    serviceDetails: {
      serviceCategory: {
        type: String,
        enum: ['Tiffin', 'Laundry', 'Cleaning', 'Maintenance', 'Movers', '']
      },
      planType: String, // e.g., 'Daily', 'Weekly', 'Monthly'
      mealSlots: [String], // ['Breakfast', 'Lunch', 'Dinner']
      diet: { type: String, default: 'Veg' }, // 'Veg', 'Non-Veg'
      deliveryAddress: String,
      appointmentDate: Date,
      timeSlot: String,
      weightKg: Number,
      serviceItems: [String],
      specialInstructions: String
    },
    // Itemized Price Breakdown
    pricingDetails: {
      baseAmount: { type: Number, default: 0 },
      deposit: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 }
    },
    // Financial & Payment Workflow
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed', 'COD'],
      default: 'Pending'
    },
    paymentReference: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    },
    responseMessage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Request', RequestSchema);
