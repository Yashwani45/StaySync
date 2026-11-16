import React, { useState, useEffect } from 'react';
import { residentAPI, paymentsAPI } from '../services/api';
import { Calendar, DollarSign, CheckCircle2, Clock, AlertCircle, FileText, Loader2, ArrowRight } from 'lucide-react';
import InvoiceModal from './InvoiceModal';

const RentManagerModal = ({ isOpen, onClose }) => {
  const [rentData, setRentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadRent = async () => {
    try {
      setLoading(true);
      const res = await residentAPI.getRentSchedule();
      setRentData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRent();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayRent = async (rentItem) => {
    setPayingId(rentItem._id);
    try {
      await residentAPI.payRent(rentItem._id, {
        paymentMethod: 'UPI'
      });
      loadRent();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const handleViewInvoice = async (paymentId) => {
    if (!paymentId) return;
    try {
      const res = await paymentsAPI.getInvoice(paymentId);
      setSelectedInvoice(res.invoice);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight">Monthly Rent & Utility Ledger</h3>
                <p className="text-xs text-slate-400">Track payment due dates, overdue notices & tax receipts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-slate-800">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading rent schedule...</div>
            ) : rentData.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                No active rent schedules found. Schedules are generated automatically upon stay confirmation.
              </div>
            ) : (
              <div className="space-y-3">
                {rentData.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.month}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            item.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'Due'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.property?.title} • Due: {new Date(item.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Receipt: {item.receiptNumber || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Total Due</span>
                        <p className="font-bold text-slate-900 text-base">₹{item.totalDue?.toLocaleString('en-IN')}</p>
                      </div>

                      {item.status === 'Paid' ? (
                        item.payment && (
                          <button
                            onClick={() => handleViewInvoice(item.payment)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Invoice
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handlePayRent(item)}
                          disabled={payingId === item._id}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
                        >
                          {payingId === item._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          Pay Rent
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
};

export default RentManagerModal;
