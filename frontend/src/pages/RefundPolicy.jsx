import React from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancellations &amp; Settlements</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-xs text-gray-500 font-medium">Last Updated: October 2026</p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium">
          
          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">1. Accommodation Booking Cancellations</h2>
            <p>
              - <strong>Before Host Acceptance:</strong> You may cancel any pending booking request at zero penalty. Any pre-authorized charges are immediately released.<br />
              - <strong>After Confirmation (Prior to Check-in):</strong> If cancelled at least 48 hours before the agreed move-in date, 100% of your advance booking amount (excluding platform processing charges) is refunded.<br />
              - <strong>Post Check-in:</strong> Once checked in, tenancy is governed by the property's published notice period (typically 30 days) and security deposit clauses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">2. Tiffin Meal Subscription Cancellations</h2>
            <p>
              - You can cancel or pause meal subscriptions with 24 hours advance notice via your dashboard.<br />
              - Unconsumed days on prepaid monthly plans are refunded on a pro-rata basis if service is discontinued due to relocation or verified quality issues.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">3. Housekeeping &amp; Laundry Services</h2>
            <p>
              - Appointment cancellations made at least 2 hours prior to scheduled pickup or visit slot receive a 100% refund.<br />
              - In the event of provider no-show, StaySync automatically rebooks the appointment at your convenience or initiates an instant full refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">4. Refund Processing Timelines</h2>
            <p>
              Approved refunds are credited back to your original source of payment (UPI, card, or bank account) within 3 to 5 business days, depending on bank clearing cycles.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default RefundPolicy;
