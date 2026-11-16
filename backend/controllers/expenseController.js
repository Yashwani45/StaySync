const Expense = require('../models/Expense');
const RoommateProfile = require('../models/RoommateProfile');

// @desc    Get user expenses & summary breakdown
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

    // Fetch user roommate profile to read their budget limit
    const profile = await RoommateProfile.findOne({ user: req.user.id });
    const monthlyIncome = profile ? profile.monthlyBudget : 20000; // fallback default income limit

    let totalExpense = 0;
    let totalIncome = 0;

    const breakdown = {
      Rent: 0,
      Food: 0,
      Laundry: 0,
      Electricity: 0,
      Internet: 0,
      Maintenance: 0,
      Transport: 0,
      Other: 0
    };

    expenses.forEach(item => {
      if (item.type === 'Expense') {
        totalExpense += item.amount;
        if (breakdown[item.category] !== undefined) {
          breakdown[item.category] += item.amount;
        } else {
          breakdown.Other += item.amount;
        }
      } else {
        totalIncome += item.amount;
      }
    });

    const netIncome = totalIncome > 0 ? totalIncome : monthlyIncome;
    const remainingBudget = netIncome - totalExpense;

    res.json({
      success: true,
      summary: {
        monthlyIncome: netIncome,
        totalExpenses: totalExpense,
        remainingBudget,
        breakdown
      },
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a new expense log
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete an expense log
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense log not found' });
    }

    if (expense.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense log removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
