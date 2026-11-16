import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Printer, AlertCircle, Loader2 } from 'lucide-react';
import { residentAPI } from '../services/api';

const RentalAgreementModal = ({ agreement, onClose, onAcknowledged }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!agreement) return null;

  const handleAcknowledge = async () => {
    setLoading(true);
    setError(null);
    try {
      await residentAPI.acknowledgeAgreement(agreement._id);
      if (onAcknowledged) onAcknowledged();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to acknowledge agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
              Digital Lease Document
            </span>
            <span className="text-sm text-slate-300 font-mono">{agreement.agreementNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-8 space-y-6 text-sm text-slate-800 font-sans print:p-0">
          <div className="text-center border-b border-slate-100 pb-5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">RESIDENTIAL STAY & TENANCY AGREEMENT</h2>
            <p className="text-xs text-slate-500 mt-1">Generated via StaySync Resident Living Platform</p>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Resident (Tenant)</span>
              <p className="font-bold text-slate-900 text-sm">{agreement.tenant?.name}</p>
              <p className="text-slate-600">{agreement.tenant?.email}</p>
              <p className="text-slate-600">{agreement.tenant?.phone || 'Verified'}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Property Manager / Landlord</span>
              <p className="font-bold text-slate-900 text-sm">{agreement.owner?.name}</p>
              <p className="text-slate-600">{agreement.property?.title}</p>
              <p className="text-slate-600">{agreement.property?.address}, {agreement.property?.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-center">
            <div>
              <span className="text-slate-400 font-medium">Monthly Rent</span>
              <p className="font-bold text-indigo-700 text-sm mt-0.5">₹{agreement.monthlyRent?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Security Deposit</span>
              <p className="font-bold text-indigo-700 text-sm mt-0.5">₹{agreement.securityDeposit?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Agreement Term</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">
                {new Date(agreement.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} – {new Date(agreement.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Terms */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Terms, Rules & Obligations</h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {agreement.termsAndConditions?.map((term, idx) => (
                <li key={idx}>{term}</li>
              ))}
            </ol>
          </div>

          {/* Signatures Status */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-semibold text-slate-500 text-[11px]">Tenant Digital Acknowledgment:</span>
              <p className="mt-1 font-medium flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                {agreement.tenantAcknowledged ? 'Acknowledged Electronically' : 'Pending Resident Review'}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-right">
              <span className="font-semibold text-slate-500 text-[11px]">Landlord Verification:</span>
              <p className="mt-1 font-medium flex items-center justify-end gap-1.5 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                {agreement.ownerAcknowledged ? 'Signed by Landlord' : 'Authorized Platform Record'}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          {!agreement.tenantAcknowledged && (
            <div className="pt-2 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAcknowledge}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Sign & Acknowledge Agreement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalAgreementModal;
