import React, { useState } from 'react';
import { Sparkles, Calculator, CheckCircle, AlertTriangle, ShieldCheck, Utensils, Shirt, Users, User } from 'lucide-react';

const LivingCalculator = () => {
  const [budget, setBudget] = useState(12000);
  const [roomType, setRoomType] = useState('Shared');
  const [includeFood, setIncludeFood] = useState(true);
  const [includeLaundry, setIncludeLaundry] = useState(true);
  const [includeCleaning, setIncludeCleaning] = useState(false);

  // Calculations for simulated budget packages
  const getCalculatedBundles = () => {
    // Option A (Economy Bundle)
    const optAPG = roomType === 'Shared' ? 5500 : 8500;
    const optATiffin = includeFood ? 2400 : 0;
    const optALaundry = includeLaundry ? 480 : 0;
    const optACleaning = includeCleaning ? 300 : 0;
    const optATotal = optAPG + optATiffin + optALaundry + optACleaning;

    // Option B (Comfort Bundle)
    const optBPG = roomType === 'Shared' ? 6800 : 10500;
    const optBTiffin = includeFood ? 3200 : 0;
    const optBLaundry = includeLaundry ? 600 : 0;
    const optBCleaning = includeCleaning ? 450 : 0;
    const optBTotal = optBPG + optBTiffin + optBLaundry + optBCleaning;

    const optABudgetMatch = optATotal <= budget ? 100 : Math.max(0, Math.round(100 - ((optATotal - budget) / budget) * 100));
    const optAMatchScore = Math.round((optABudgetMatch * 0.6) + (roomType === 'Shared' ? 40 : 30));

    const optBBudgetMatch = optBTotal <= budget ? 100 : Math.max(0, Math.round(100 - ((optBTotal - budget) / budget) * 100));
    const optBMatchScore = Math.round((optBBudgetMatch * 0.6) + (roomType === 'Shared' ? 38 : 32) + (includeFood ? 8 : 0));

    return [
      {
        name: 'Economy Bundle',
        pg: optAPG,
        tiffin: optATiffin,
        laundry: optALaundry,
        cleaning: optACleaning,
        total: optATotal,
        matchScore: Math.min(optAMatchScore, 100)
      },
      {
        name: 'Comfort Bundle',
        pg: optBPG,
        tiffin: optBTiffin,
        laundry: optBLaundry,
        cleaning: optBCleaning,
        total: optBTotal,
        matchScore: Math.min(optBMatchScore, 100)
      }
    ];
  };

  const bundles = getCalculatedBundles();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Compact Header */}
      <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-sm text-white">
            Living Cost Estimator
          </h3>
          <span className="text-slate-400 text-xs hidden sm:inline">• Room + Food + Services in 1 Click</span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
          Zero Brokerage
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Controls Column (Compact) */}
          <div className="lg:col-span-5 space-y-3.5 pr-0 lg:pr-4 lg:border-r border-slate-100 text-left">
            
            {/* Target Budget Slider */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Budget Target</span>
                <span className="text-emerald-700 font-extrabold">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Room Style */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoomType('Shared')}
                className={`py-1.5 px-2.5 text-xs font-bold rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  roomType === 'Shared'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shared Room</span>
              </button>
              <button
                type="button"
                onClick={() => setRoomType('Single')}
                className={`py-1.5 px-2.5 text-xs font-bold rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  roomType === 'Single'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Single Room</span>
              </button>
            </div>

            {/* Quick Add-ons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setIncludeFood(!includeFood)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  includeFood ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Utensils className="w-3 h-3 text-amber-600" />
                <span>+ Tiffin (₹2,400)</span>
              </button>
              <button
                type="button"
                onClick={() => setIncludeLaundry(!includeLaundry)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  includeLaundry ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Shirt className="w-3 h-3 text-sky-600" />
                <span>+ Laundry (₹480)</span>
              </button>
              <button
                type="button"
                onClick={() => setIncludeCleaning(!includeCleaning)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  includeCleaning ? 'bg-teal-50 border-teal-300 text-teal-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>+ Cleaning (₹300)</span>
              </button>
            </div>

          </div>

          {/* Results Column (Compact) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {bundles.map((bundle, index) => {
              const isOverBudget = bundle.total > budget;
              return (
                <div key={index} className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{bundle.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      bundle.matchScore >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {bundle.matchScore}% Match
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2 rounded-lg border border-slate-150">
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span className="font-bold text-slate-800">₹{bundle.pg}</span>
                    </div>
                    {bundle.tiffin > 0 && (
                      <div className="flex justify-between">
                        <span>Meals:</span>
                        <span>₹{bundle.tiffin}</span>
                      </div>
                    )}
                    {bundle.laundry > 0 && (
                      <div className="flex justify-between">
                        <span>Laundry:</span>
                        <span>₹{bundle.laundry}</span>
                      </div>
                    )}
                    {bundle.cleaning > 0 && (
                      <div className="flex justify-between">
                        <span>Cleaning:</span>
                        <span>₹{bundle.cleaning}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-1 flex justify-between font-black text-slate-900">
                      <span>Total:</span>
                      <span className="text-emerald-700">₹{bundle.total.toLocaleString('en-IN')}/mo</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-bold">
                    {isOverBudget ? (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Over budget by ₹{(bundle.total - budget).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Within ₹{budget.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
};

export default LivingCalculator;
