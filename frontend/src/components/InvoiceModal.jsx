import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, Building, ShieldCheck, CreditCard } from 'lucide-react';

const InvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Action Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
              Official Tax Invoice
            </span>
            <span className="text-sm text-slate-300 font-mono">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 space-y-8 text-slate-800 font-sans print:p-0">
          {/* Brand & Invoice Details */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-base">
                  SS
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">StaySync Living Marketplace</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Verified Personal Living & Resident Management Platform</p>
              <p className="text-xs text-slate-400">GSTIN: 23AABCS1429P1Z8 • support@staysync.com</p>
            </div>
            <div className="sm:text-right space-y-1 text-xs">
              <div className="font-semibold text-slate-900 text-sm">INVOICE #{invoice.invoiceNumber}</div>
              <div className="text-slate-500">Date: {new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div className="text-slate-500">Payment Status: <span className="font-semibold text-emerald-600 uppercase">{invoice.status}</span></div>
              <div className="text-slate-500">Method: {invoice.paymentMethod}</div>
            </div>
          </div>

          {/* Parties: Billed To & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Resident (Billed To)</span>
              <p className="font-bold text-slate-900 text-sm mt-1">{invoice.customer?.name}</p>
              <p className="text-slate-600">{invoice.customer?.email}</p>
              <p className="text-slate-600">Phone: {invoice.customer?.phone}</p>
              <p className="text-slate-600">City: {invoice.customer?.city}</p>
            </div>
            <div className="sm:text-right">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Host / Property Owner</span>
              <p className="font-bold text-slate-900 text-sm mt-1">{invoice.merchant?.name}</p>
              <p className="text-slate-600">{invoice.merchant?.email}</p>
              <p className="text-slate-600">Phone: {invoice.merchant?.phone}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">
                    <div className="font-semibold text-slate-800 text-sm">{invoice.item?.title}</div>
                    {invoice.bookingDetails && (
                      <p className="text-xs text-slate-500">
                        {invoice.bookingDetails.roomNumber} • {invoice.bookingDetails.bedNumber}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">{invoice.item?.notes || 'Accommodation booking installment'}</p>
                  </td>
                  <td className="py-3 text-slate-600">{invoice.item?.type || 'Property'}</td>
                  <td className="py-3 text-right font-medium text-slate-800">
                    ₹{invoice.financials?.baseAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span>₹{invoice.financials?.baseAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span>₹{invoice.financials?.cgst?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span>₹{invoice.financials?.sgst?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Paid:</span>
                <span className="text-indigo-600">₹{invoice.financials?.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer & Gateway Reference */}
          <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Electronic Transaction • Ref: {invoice.transactionId}
            </p>
            <p>This is a computer-generated invoice issued under StaySync Platform Operations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
