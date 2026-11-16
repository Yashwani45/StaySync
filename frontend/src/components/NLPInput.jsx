import React, { useState } from 'react';
import { Search, Sparkles, X, ArrowRight, Zap, Utensils, Wind, ShieldCheck, Users } from 'lucide-react';

const NLPInput = ({ onSearch, placeholder = "Mujhe college ke 3 km ke andar ₹8k ke under clean shared room chahiye..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setQuery(suggestionText);
    if (onSearch) {
      onSearch(suggestionText);
    }
  };

  const suggestions = [
    { label: "Under ₹8k near college with food", query: "₹8k room near college with food", icon: Utensils, color: "text-emerald-600" },
    { label: "Single AC room in Vijay Nagar", query: "Single AC room in Vijay Nagar under 12000", icon: Wind, color: "text-teal-600" },
    { label: "Girls hostel with veg meals", query: "Girls hostel in Geeta Bhawan under 7k with veg food", icon: ShieldCheck, color: "text-emerald-700" },
    { label: "Clean shared room under ₹6k", query: "Shared room under 6000 clean", icon: Users, color: "text-slate-600" }
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </span>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">AI Smart Match Search</h3>
            <p className="text-[11px] text-slate-500 font-medium">Type naturally in Hindi or English (e.g. budget, area, food, single room)</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Smart NLP
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
        <div className="relative flex-1 flex items-center">
          <div className="pl-3 pr-2 text-emerald-600 shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            className="w-full py-2.5 pr-8 bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#059669] hover:bg-[#047857] active:bg-[#064e3b] text-white font-bold px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>Analyze &amp; Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick:</span>
        </span>
        {suggestions.map((item, i) => {
          const IconComponent = item.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSuggestionClick(item.query)}
              className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 px-3 py-1.5 rounded-full transition-all border border-slate-200 hover:border-emerald-300 shadow-2xs flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <IconComponent className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NLPInput;
