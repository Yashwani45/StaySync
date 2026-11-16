const mongoose = require('mongoose');

const MaintenanceTicketSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true
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
    category: {
      type: String,
      enum: ['Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'Appliance', 'Internet', 'Other'],
      required: [true, 'Please select a complaint category']
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium'
    },
    title: {
      type: String,
      required: [true, 'Please provide complaint title']
    },
    description: {
      type: String,
      required: [true, 'Please describe the issue']
    },
    photos: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Reopened'],
      default: 'Submitted',
      index: true
    },
    assignedTo: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      assignedAt: { type: Date }
    },
    statusHistory: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    resolutionNotes: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

MaintenanceTicketSchema.index({ property: 1, status: 1 });
MaintenanceTicketSchema.index({ tenant: 1, createdAt: -1 });

module.exports = mongoose.model('MaintenanceTicket', MaintenanceTicketSchema);
