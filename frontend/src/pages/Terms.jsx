import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Documentation</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500 font-medium">Last Updated: October 2026</p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium">
          
          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or using the StaySync marketplace platform, website, or associated services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue platform use immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">2. Marketplace Role & Scope</h2>
            <p>
              StaySync operates as an unbundled technology marketplace connecting tenants with independent property owners (Hostels, PGs, Flat/Room owners) and independent local service providers (Tiffins, Housekeeping, Laundry). StaySync is not a real estate owner, direct landlord, or food preparer unless explicitly stated under certified operations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">3. User Accounts & Verification</h2>
            <p>
              Users must provide accurate, verifiable identity details upon registration. Property owners and service providers must submit valid KYC documents and address proofs. Accounts found submitting fraudulent photos, misleading pricing, or misrepresenting vacancies are subject to immediate suspension with audit logs maintained.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">4. Bookings, Payments & Rent roll</h2>
            <p>
              Booking requests are subject to host or provider acceptance. Once a booking is confirmed, inventory is locked to prevent double-booking. Residents must adhere to property rules, gate timings, and notice periods specified in their rental agreement copy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">5. Roommate Discovery Conduct</h2>
            <p>
              Roommate matching features are strictly intended for prospective co-residents to assess mutual compatibility (sleep schedules, hygiene, and study habits). Harassment, sharing unsolicited spam, or scraping contact details is strictly prohibited and results in permanent ban.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">6. Limitation of Liability</h2>
            <p>
              StaySync facilitates transparent connections and dispute moderation. While we verify provider documentation and provide resolution workflows, agreements between residents and property hosts remain governed by local tenancy guidelines.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Terms;
