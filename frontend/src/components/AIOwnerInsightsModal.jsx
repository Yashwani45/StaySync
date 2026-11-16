import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { Sparkles, TrendingUp, Users, DollarSign, AlertCircle, Lightbulb, CheckCircle2, X } from 'lucide-react';

const AIOwnerInsightsModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      aiAPI.getOwnerInsights()
        .then(res => setData(res.insights))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">AI Owner Intelligence & Revenue Insights</h3>
              <p className="text-xs text-indigo-100">Automated occupancy forecasting, cancellation trends & pricing tips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-800">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Synthesizing property & booking analytics...</div>
          ) : !data ? (
            <div className="p-8 text-center text-slate-500 text-xs">No property data available to analyze yet.</div>
          ) : (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Occupancy Rate</span>
                  <strong className="text-2xl font-black text-purple-900 block mt-0.5">{data.occupancyRate}</strong>
                  <span className="text-[10px] text-purple-700 font-medium">{data.occupiedBeds} / {data.totalBeds} Beds Occupied</span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Gross Revenue</span>
                  <strong className="text-2xl font-black text-emerald-900 block mt-0.5">₹{data.totalRevenue?.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-emerald-700 font-medium">Verified Collections</span>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Confirmed Stays</span>
                  <strong className="text-2xl font-black text-indigo-900 block mt-0.5">{data.bookingStats?.confirmed}</strong>
                  <span className="text-[10px] text-indigo-700 font-medium">{data.bookingStats?.total} Total Inquiries</span>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pending Leads</span>
                  <strong className="text-2xl font-black text-amber-900 block mt-0.5">{data.bookingStats?.pending}</strong>
                  <span className="text-[10px] text-amber-700 font-medium">Action Required</span>
                </div>
              </div>

              {/* Actionable AI Suggestions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Strategic Business Suggestions
                </h4>
                <div className="space-y-2.5">
                  {data.actionableSuggestions?.map((sug, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {sIdx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{sug.type}</span>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{sug.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIOwnerInsightsModal;
