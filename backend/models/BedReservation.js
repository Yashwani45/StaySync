const mongoose = require('mongoose');

const BedReservationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    bedNumber: {
      type: String,
      required: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bookingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      default: null
    },
    checkInDate: {
      type: Date,
      required: true
    },
    checkOutDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['HELD', 'CONFIRMED', 'RELEASED', 'EXPIRED'],
      default: 'HELD',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Automatic MongoDB TTL expiry
    }
  },
  {
    timestamps: true
  }
);

BedReservationSchema.index({
  property: 1,
  roomNumber: 1,
  bedNumber: 1,
  checkInDate: 1,
  checkOutDate: 1
});

module.exports = mongoose.model('BedReservation', BedReservationSchema);
