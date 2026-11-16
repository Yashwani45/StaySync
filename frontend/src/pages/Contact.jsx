import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, Clock, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';

const FAQS = [
  {
    q: 'How do I book a property on StaySync?',
    a: 'Browse verified listings, select your preferred room style, and click Inquire or Book Now to connect directly with the owner without broker fees.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We support UPI, Net Banking, Debit/Credit cards, and direct secure bank transfers for rent and meal subscriptions.'
  },
  {
    q: 'Can I cancel or pause my tiffin subscription?',
    a: 'Yes, you can pause your daily meals with 1 tap from your dashboard whenever you travel, and unused credits are saved.'
  },
  {
    q: 'Are properties physically audited?',
    a: 'Yes, every listing with the green verified badge has been audited by our verification team.'
  }
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 pb-16 text-slate-800 bg-white">
      
      {/* Top Banner */}
      <section className="relative min-h-[260px] sm:min-h-[300px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&auto=format&fit=crop&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-[#064e3b]/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 font-medium">
            We're here to help. Reach out to us anytime.
          </p>
        </div>
      </section>

      {/* Main Form & Info Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Get in Touch
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Have questions about verified stays, tiffin subscriptions, or housekeeping? Our support team is ready to help.
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-emerald-950 block">Phone Support</span>
                  <span className="text-emerald-800 font-semibold">+91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-sky-50/80 rounded-2xl border border-sky-200">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sky-950 block">Email Inquiry</span>
                  <span className="text-sky-800 font-semibold">support@staysync.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50/80 rounded-2xl border border-amber-200">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-950 block">National Support Desk</span>
                  <span className="text-amber-800 font-medium">Serving Students &amp; Working Professionals Nationwide</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50/80 rounded-2xl border border-purple-200">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-purple-950 block">Working Hours</span>
                  <span className="text-purple-800 font-medium">Mon - Sat: 9:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Send Us a Message Form */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              Send us a message
            </h3>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been sent. Our team will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-800 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-200/50 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Contact;
