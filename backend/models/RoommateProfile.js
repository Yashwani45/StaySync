const mongoose = require('mongoose');

const RoommateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    age: {
      type: Number,
      required: [true, 'Please add age']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please specify gender']
    },
    occupation: {
      type: String,
      required: [true, 'Please add occupation (e.g. Student, Software Engineer)']
    },
    collegeOrOffice: {
      type: String,
      default: ''
    },
    monthlyBudget: {
      type: Number,
      required: [true, 'Please add monthly budget']
    },
    foodPreference: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Any'],
      default: 'Any'
    },
    sleepSchedule: {
      type: String,
      enum: ['Early Bird', 'Night Owl', 'Flexible'],
      default: 'Flexible'
    },
    wakeupTime: {
      type: String,
      default: '08:00 AM'
    },
    cleanliness: {
      type: String,
      enum: ['High', 'Moderate', 'Low'],
      default: 'Moderate'
    },
    noiseTolerance: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      default: 'Moderate'
    },
    smoking: {
      type: String,
      enum: ['No', 'Yes', 'Outside Only'],
      default: 'No'
    },
    drinking: {
      type: String,
      enum: ['No', 'Yes', 'Socially'],
      default: 'No'
    },
    acPreference: {
      type: String,
      enum: ['AC', 'Non-AC', 'No Preference'],
      default: 'No Preference'
    },
    preferredGender: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any'
    },
    hobbies: {
      type: [String],
      default: []
    },
    selectedServices: {
      type: [String],
      enum: ['room', 'roommate', 'tiffin', 'laundry', 'cleaning', 'maintenance', 'movers'],
      default: ['room']
    },
    selectedStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null
    },
    selectedProviders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider'
    }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RoommateProfile', RoommateProfileSchema);
