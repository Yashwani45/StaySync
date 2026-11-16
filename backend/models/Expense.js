const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Rent', 'Food', 'Laundry', 'Electricity', 'Internet', 'Maintenance', 'Transport', 'Other'],
      required: [true, 'Please select a category']
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the amount']
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      default: 'Expense'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
