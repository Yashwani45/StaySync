import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';
import { Wallet, Plus, Trash2, ShieldCheck, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    monthlyIncome: 20000,
    totalExpenses: 0,
    remainingBudget: 20000,
    breakdown: {}
  });
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState('Rent');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadExpensesData = async () => {
    setLoading(true);
    try {
      const res = await expensesAPI.getExpenses();
      if (res.success) {
        setExpenses(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpensesData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const payload = {
        category,
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        date
      };

      const res = await expensesAPI.createExpense(payload);
      if (res.success) {
        setAmount('');
        setDescription('');
        loadExpensesData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this transaction log?')) {
      try {
        const res = await expensesAPI.deleteExpense(id);
        if (res.success) {
          loadExpensesData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete transaction');
      }
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Rent': return 'bg-blue-500';
      case 'Food': return 'bg-emerald-600';
      case 'Laundry': return 'bg-indigo-500';
      case 'Electricity': return 'bg-amber-500';
      case 'Internet': return 'bg-teal-500';
      case 'Maintenance': return 'bg-cyan-500';
      case 'Transport': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const isNearingLimit = summary.remainingBudget <= summary.monthlyIncome * 0.15;
  const isOverBudget = summary.remainingBudget < 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-green-600" />
          My Living Expenses
        </h1>
        <p className="text-xs text-gray-500 mt-1">Track rent payments, subscription utility costs and budget balances.</p>
      </div>

      {/* Financial Indicators Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Income Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Monthly Income / Cap</span>
            <strong className="text-lg font-bold text-gray-800">₹{summary.monthlyIncome.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Expenditures</span>
            <strong className="text-lg font-bold text-gray-800">₹{summary.totalExpenses.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Remaining Card */}
        <div className={`p-5 rounded-xl border shadow-sm flex items-center gap-4 ${isOverBudget ? 'bg-red-50 border-red-200 text-red-900' : (isNearingLimit ? 'bg-yellow-50 border-yellow-200 text-yellow-900' : 'bg-white border-gray-200')}`}>
          <div className={`p-3 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-600' : (isNearingLimit ? 'bg-yellow-100 text-yellow-600' : 'bg-green-50 text-green-600')}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Remaining Balance</span>
            <strong className={`text-lg font-extrabold ${isOverBudget ? 'text-red-700' : 'text-gray-800'}`}>
              ₹{summary.remainingBudget.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

      </div>

      {/* Warnings alerts */}
      {isOverBudget && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>Warning: You have exceeded your target monthly budget! Consider canceling unnecessary service subscriptions.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Add Transaction Form (Column 1) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit space-y-4">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b">Log Transaction</h2>
          
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('Expense')}
                  className={`py-1.5 rounded-lg text-xs font-semibold border text-center transition-colors ${type === 'Expense' ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('Income')}
                  className={`py-1.5 rounded-lg text-xs font-semibold border text-center transition-colors ${type === 'Income' ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Income
                </button>
              </div>
            </div>

            {type === 'Expense' && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Category</label>
                <select
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Rent">Rent Payment</option>
                  <option value="Food">Food / Tiffin</option>
                  <option value="Laundry">Laundry Wash</option>
                  <option value="Electricity">Electricity Utility</option>
                  <option value="Internet">Internet / Wi-Fi</option>
                  <option value="Maintenance">Maintenance Repair</option>
                  <option value="Transport">Transport / Movers</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none font-bold"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Description</label>
              <input
                type="text"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="e.g. Wi-Fi recharge"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none font-semibold text-gray-600"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1 mt-2"
            >
              <Plus className="w-4 h-4" /> Save Record
            </button>
          </form>
        </div>

        {/* Expenses List & Breakdown Chart (Columns 2 & 3) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Categorized Bar Gauges */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b">Expenditures Category Breakdown</h2>
            
            <div className="space-y-3">
              {Object.keys(summary.breakdown).map((cat) => {
                const amt = summary.breakdown[cat] || 0;
                if (amt === 0) return null;
                
                const percent = summary.totalExpenses > 0 ? Math.round((amt / summary.totalExpenses) * 100) : 0;
                
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700">{cat}</span>
                      <span className="text-gray-500 font-bold">₹{amt.toLocaleString('en-IN')} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getCategoryColor(cat)} rounded-full`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {Object.values(summary.breakdown).every(v => v === 0) && (
                <p className="text-xs text-gray-400 text-center py-2">No expenditures logged yet.</p>
              )}
            </div>
          </div>

          {/* Transactions Log List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Transaction Logs</h2>
            </div>
            
            <div className="divide-y divide-gray-150 max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="text-xs text-gray-400 text-center py-6">Loading transaction logs...</p>
              ) : expenses.length > 0 ? (
                expenses.map(item => (
                  <div key={item._id} className="p-4 flex justify-between items-center group">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.type === 'Income' ? 'bg-green-500' : getCategoryColor(item.category)}`}></span>
                        <p className="text-xs font-bold text-gray-800 capitalize">
                          {item.type === 'Expense' ? item.category : 'Monthly Income'}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {item.description || 'Logged living item'} · {new Date(item.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <strong className={`text-xs font-bold ${item.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'Income' ? '+' : '-'} ₹{item.amount.toLocaleString('en-IN')}
                      </strong>
                      <button
                        onClick={() => handleDeleteExpense(item._id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-xs font-semibold">No transactions logged yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ExpenseManager;
