import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Hide footer on all dashboard workspaces & consoles, auth pages (login/register), or whenever user is logged in
  const isDashboardRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/bookings') ||
    location.pathname.startsWith('/provider-dashboard') ||
    location.pathname.startsWith('/owner') ||
    location.pathname.startsWith('/provider') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/expenses') ||
    location.pathname.startsWith('/shift-planner') ||
    location.pathname.startsWith('/chat');

  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/register';

  if (user || isDashboardRoute || isAuthRoute) {
    return null;
  }

  return (
    <footer className="mt-12 sm:mt-16 bg-[#0B0F19] text-slate-300 font-sans border-t border-slate-800 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-400/40 flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform">
                <img
                  src="/logo-white.svg"
                  alt="StaySync Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Stay<span className="text-indigo-400">Sync</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              Find your place, feel at home. Commercial living platform for verified student hostels, PGs &amp; daily services across India.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Indore, Bhopal, Ujjain &amp; Pan-India</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3.5">
            <h4 className="text-white font-black text-sm uppercase tracking-wider">Explore Stays</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors block">Home</Link>
              </li>
              <li>
                <Link to="/marketplace?tab=rooms" className="hover:text-white transition-colors block">Find Stays (Hostels &amp; PGs)</Link>
              </li>
              <li>
                <Link to="/marketplace?tab=services&category=Tiffin" className="hover:text-white transition-colors block">Tiffin &amp; Meal Subscriptions</Link>
              </li>
              <li>
                <Link to="/marketplace?tab=services&category=Cleaning" className="hover:text-white transition-colors block">Laundry &amp; Housekeeping</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors block">About StaySync</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support Column */}
          <div className="space-y-3.5">
            <h4 className="text-white font-black text-sm uppercase tracking-wider">Legal &amp; Trust</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-400">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors block">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors block">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors block">Cancellation &amp; Refund Policy</Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-white transition-colors block">FAQs &amp; Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors block">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us Column */}
          <div className="space-y-3.5">
            <h4 className="text-white font-black text-sm uppercase tracking-wider">Connect &amp; Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Have questions or need assistance? Our student concierge team is available 24/7.
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-white font-bold">support@staysync.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-white font-bold">+91 731-400-STAY</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-500 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} StaySync Technologies Private Limited. All rights reserved.</p>
          <p className="text-slate-400">Engineered with ❤️ for Students &amp; Working Professionals Nationwide • Made by <span className="text-slate-200 font-bold">Yashwani Kushwaha</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
