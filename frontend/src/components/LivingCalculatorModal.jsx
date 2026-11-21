import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calculator, Check, AlertTriangle, ShieldCheck, ArrowRight, Home, DoorClosed, Utensils, Shirt } from 'lucide-react';

const LivingCalculatorModal = ({ isOpen, onClose, initialBudget = 10000, initialRoomType = 'Shared', onApplyPlan }) => {
  const [budget, setBudget] = useState(initialBudget);
  const [roomType, setRoomType] = useState(initialRoomType);
  const [includeFood, setIncludeFood] = useState(true);
  const [includeLaundry, setIncludeLaundry] = useState(true);
  const [includeCleaning, setIncludeCleaning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialBudget) setBudget(initialBudget);
      if (initialRoomType) setRoomType(initialRoomType);
    }
  }, [isOpen, initialBudget, initialRoomType]);

  if (!isOpen) return null;

  // Calculate live breakdown
  const roomCost = roomType === 'Shared' ? 7500 : 10500;
  const foodCost = includeFood ? 2400 : 0;
  const laundryCost = includeLaundry ? 400 : 0;
  const cleaningCost = includeCleaning ? 500 : 0;
  const totalEstimatedCost = roomCost + foodCost + laundryCost + cleaningCost;
  const remainingBudget = budget - totalEstimatedCost;
  const isOverBudget = remainingBudget < 0;
  const usagePct = Math.min(Math.round((totalEstimatedCost / budget) * 100), 100);

  const handleApply = () => {
    if (onApplyPlan) {
      onApplyPlan({
        budget,
        roomType,
        includeFood,
        includeLaundry,
        includeCleaning,
        totalEstimatedCost,
        roomCost,
        foodCost,
        laundryCost,
        cleaningCost
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center shadow-md shadow-emerald-900/20 shrink-0">
            <Calculator className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Customize Your Living Plan</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Live AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Configure your monthly target budget and services to simulate living costs in real-time.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Controls Panel */}
          <div className="space-y-5">
            
            {/* Target Budget Slider */}
            <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">Monthly Budget Target</label>
                <span className="text-sm font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                  ₹{budget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="6000"
                max="25000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
                <span>₹6,000</span>
                <span>₹15,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Room Style */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-2">Accommodation Style</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoomType('Shared')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                    roomType === 'Shared'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Home className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-black text-xs leading-none">Shared Room</div>
                    <span className="text-[10px] text-slate-400 font-medium">₹7,500/mo avg</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomType('Single')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                    roomType === 'Single'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <DoorClosed className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <div className="font-black text-xs leading-none">Single Room</div>
                    <span className="text-[10px] text-slate-400 font-medium">₹10,500/mo avg</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Services Checklist */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-2">Add-On Living Services</label>
              <div className="space-y-2">
                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  includeFood ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Daily Veg Tiffin (2 Meals)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={includeFood}
                    onChange={(e) => setIncludeFood(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md accent-emerald-600 cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  includeLaundry ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Monthly Laundry &amp; Ironing</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={includeLaundry}
                    onChange={(e) => setIncludeLaundry(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md accent-emerald-600 cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  includeCleaning ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Bi-Weekly Room Deep Cleaning</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={includeCleaning}
                    onChange={(e) => setIncludeCleaning(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md accent-emerald-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Live Cost Summary Card */}
          <div className="bg-[#064e3b] p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-emerald-800 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  Live Breakdown
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isOverBudget 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isOverBudget ? 'Exceeds Budget' : 'Within Budget'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-emerald-100/90">
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Room ({roomType})</span>
                  </span>
                  <strong className="text-white font-black">₹{roomCost.toLocaleString('en-IN')}</strong>
                </div>
                {includeFood && (
                  <div className="flex justify-between items-center text-emerald-100/90">
                    <span className="flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span>Daily Tiffin Plan</span>
                    </span>
                    <strong className="text-white font-black">₹{foodCost.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {includeLaundry && (
                  <div className="flex justify-between items-center text-emerald-100/90">
                    <span className="flex items-center gap-2">
                      <Shirt className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                      <span>Laundry Service</span>
                    </span>
                    <strong className="text-white font-black">₹{laundryCost.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {includeCleaning && (
                  <div className="flex justify-between items-center text-emerald-100/90">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                      <span>Cleaning Plan</span>
                    </span>
                    <strong className="text-white font-black">₹{cleaningCost.toLocaleString('en-IN')}</strong>
                  </div>
                )}
              </div>

              {/* Progress & Totals */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-emerald-100 font-bold">Total Estimated:</span>
                  <span className="text-xl font-black text-white">
                    ₹{totalEstimatedCost.toLocaleString('en-IN')}<span className="text-xs text-emerald-200 font-medium">/mo</span>
                  </span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isOverBudget ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(usagePct, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] pt-0.5 font-bold">
                  <span className="text-emerald-200/80">Budget Usage: {usagePct}%</span>
                  <span className={isOverBudget ? 'text-rose-300' : 'text-emerald-300'}>
                    {isOverBudget 
                      ? `Over by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}` 
                      : `₹${remainingBudget.toLocaleString('en-IN')} left`}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-6 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/20 text-emerald-100 font-extrabold text-xs hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Save Living Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default LivingCalculatorModal;
