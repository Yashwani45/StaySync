import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Building2, Utensils, Sparkles, ShieldCheck, Wallet } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    category: 'Accommodation & Living',
    icon: Building2,
    faqs: [
      {
        q: 'How does StaySync verify hostels and PGs?',
        a: 'Every property owner submits verification documents, real photos, and address proofs. Our admin operations team verifies room photos, amenity lists, and curfew rules before any listing is marked Verified.'
      },
      {
        q: 'Can I book accommodation without subscribing to food or laundry?',
        a: 'Yes! StaySync is completely unbundled. You have full freedom to book just a room or bed, or add independent tiffin and cleaning services whenever you want.'
      },
      {
        q: 'How is roommate matching conducted?',
        a: 'Roommate discovery is hostel-based and opt-in. You set your lifestyle preferences (sleep schedule, study habits, diet, and budget). The platform calculates compatibility scores and allows secure connection requests without exposing your private phone or email until both parties accept.'
      },
      {
        q: 'What is the security deposit policy?',
        a: 'The security deposit amount is clearly specified on each listing page. It is held under the property agreement terms and refundable upon completion of your notice period and move-out inspection.'
      }
    ]
  },
  {
    category: 'Tiffin & Meal Subscriptions',
    icon: Utensils,
    faqs: [
      {
        q: 'Can I order tiffin if I live in my own flat or another hostel?',
        a: 'Absolutely. All tiffin kitchens operate independently with their own delivery radius. You can subscribe to daily lunch, dinner, or 3-time meal plans delivered directly to your doorstep regardless of where you stay.'
      },
      {
        q: 'Can I pause or skip my tiffin subscription when traveling?',
        a: 'Yes, weekly and monthly subscribers can pause deliveries through their dashboard with 24 hours advance notice, and the subscription duration extends automatically.'
      },
      {
        q: 'What hygiene standards do kitchens follow?',
        a: 'StaySync partner kitchens must follow food safety protocols, use clean cooking water, and provide varied daily rotating menus to ensure balanced nutrition.'
      }
    ]
  },
  {
    category: 'Cleaning & Laundry Services',
    icon: Sparkles,
    faqs: [
      {
        q: 'How does doorstep laundry service work?',
        a: 'Select your preferred laundry partner, specify estimated weight or items, and choose a convenient pickup time slot. Clothes are washed, ironed, and returned within the promised turnaround time (usually 24 hours).'
      },
      {
        q: 'What does a regular room cleaning visit include?',
        a: 'A standard visit includes floor sweeping and mopping, dust clearing, trash disposal, and sanitization. Deep cleaning and bathroom sanitization can be added independently.'
      }
    ]
  },
  {
    category: 'Payments, Cancellations & Safety',
    icon: Wallet,
    faqs: [
      {
        q: 'What payment methods are supported?',
        a: 'We support UPI, debit/credit cards, and netbanking. In test/sandbox environments, simulated payments allow you to verify booking confirmations without incurring charges.'
      },
      {
        q: 'What happens if a property owner rejects my booking?',
        a: 'If a booking request is not accepted, zero charges are deducted, and any authorized transaction amount is immediately released back to your original payment method.'
      },
      {
        q: 'How do I cancel a confirmed booking?',
        a: 'You can initiate a cancellation from your Resident Dashboard under My Bookings according to the published cancellation policy of the property.'
      }
    ]
  }
];

const Faqs = () => {
  const [openItems, setOpenItems] = useState({ '0-0': true, '1-0': true });

  const toggleItem = (key) => {
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Everything You Need to Know About StaySync
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
            Quick answers about booking verified stays, meal deliveries, housekeeping appointments, and resident safety.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {FAQ_SECTIONS.map((sec, secIdx) => {
            const SectionIcon = sec.icon;
            return (
              <div key={sec.category} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-200">
                  <SectionIcon className="w-4 h-4 text-emerald-600" />
                  <span>{sec.category}</span>
                </div>

                <div className="space-y-2.5">
                  {sec.faqs.map((faq, faqIdx) => {
                    const key = `${secIdx}-${faqIdx}`;
                    const isOpen = Boolean(openItems[key]);

                    return (
                      <div
                        key={faq.q}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                        >
                          <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                            {faq.q}
                          </span>
                          <span className="p-1 rounded-lg bg-gray-100 text-gray-600 shrink-0">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-xs text-gray-600 font-medium leading-relaxed border-t border-gray-100 mt-1">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Faqs;
