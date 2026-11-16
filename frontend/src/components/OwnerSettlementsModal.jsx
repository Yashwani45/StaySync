import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import { DollarSign, CheckCircle2, Clock, ShieldCheck, ArrowRight, X, FileText } from 'lucide-react';

const OwnerSettlementsModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      paymentsAPI.getOwnerSettlements()
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Owner Earnings & Settlements</h3>
              <p className="text-xs text-slate-400">Platform commissions, net payouts & UTR transfer logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-800">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading settlement ledger...</div>
          ) : !data ? (
            <div className="p-8 text-center text-slate-500 text-xs">No settlement history available yet.</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Booking Collections</span>
                  <strong className="text-xl font-black text-slate-900 block mt-1">₹{data.summary?.totalGross?.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-slate-400">Platform Fee: {data.summary?.commissionRate}% (₹{data.summary?.totalCommission?.toLocaleString('en-IN')})</span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Cleared Payouts</span>
                  <strong className="text-xl font-black text-emerald-800 block mt-1">₹{data.summary?.settledAmount?.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-emerald-600">Dispatched via Bank IMPS/NEFT</span>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending Payable Balance</span>
                  <strong className="text-xl font-black text-amber-800 block mt-1">₹{data.summary?.pendingPayout?.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-amber-600">Scheduled in next payout batch</span>
                </div>
              </div>

              {/* Settlement History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Dispatched Settlements</h4>
                {data.settlements?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No formal settlements released yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.settlements?.map(s => (
                      <div
                        key={s._id}
                        className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">₹{s.netPayoutAmount?.toLocaleString('en-IN')}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              {s.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Period: {new Date(s.periodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(s.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">UTR / Ref: {s.transactionReference}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">{new Date(s.settledAt || s.createdAt).toLocaleDateString('en-IN')}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">Cleared</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerSettlementsModal;
