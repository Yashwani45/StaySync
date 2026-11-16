import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 font-medium">Last Updated: October 2026</p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium">
          
          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including your name, email address, phone number, operating city, room preferences, and verification details. When using roommate discovery, lifestyle indicators (sleep patterns, diet, noise tolerance) are stored voluntarily to compute compatibility.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">2. How Your Data Is Protected</h2>
            <p>
              We implement industry-standard encryption, tokenized authentication, and strict ownership validation on every API endpoint. Passwords are never stored in plain text and are hashed using salted bcrypt cryptography.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">3. Contact Information Privacy in Roommate Discovery</h2>
            <p>
              To protect student and resident privacy, phone numbers and email addresses are NEVER displayed publicly on roommate discovery feeds. Contact information is only shared with an individual when both parties have explicitly agreed to a connection request.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">4. Third-Party Integrations</h2>
            <p>
              We do not sell your personal data to data brokers. We share data only with verified hosting providers or delivery kitchens relevant to your active orders, or with certified payment gateways for transaction settlement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">5. Your Rights & Account Controls</h2>
            <p>
              You have the right to access, edit, or delete your profile information, manage communication preferences, or download your booking history through your Profile page.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Privacy;
