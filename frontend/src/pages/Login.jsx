import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardLink } from '../utils/roleHelper';
import { 
  Lock, Mail, AlertCircle, Eye, EyeOff, 
  ArrowRight, ShieldCheck, CheckCircle2, 
  Sparkles, Building2, User
} from 'lucide-react';

const Login = () => {
  const { user, login, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(getRoleDashboardLink(user), { replace: true });
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const loggedUser = await login(email, password);
      navigate(getRoleDashboardLink(loggedUser), { replace: true });
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: BRAND PANEL & HIGHLIGHTS                   */}
        {/* ======================================================== */}
        <div className="md:col-span-5 bg-[#064e3b] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          
          <div className="space-y-6 relative z-10">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-400/30 flex items-center justify-center p-1.5 shadow-inner group-hover:scale-105 transition-transform">
                <img src="/logo-white.svg" alt="StaySync" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Stay<span className="text-emerald-300">Sync</span>
              </span>
            </Link>

            {/* Secure Portal Pill Badge */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Secure Living Command Center</span>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                StaySync Command Center
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                Seamlessly manage student accommodation, verified hostels/PGs, live bed locks, and resident services in one centralized portal.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-3">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Verified Stays &amp; Bed Occupancy</h4>
                  <p className="text-[11px] text-emerald-200/80">Real-time room availability, bed locks, and instant confirmations.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Resident &amp; Owner Workspace</h4>
                  <p className="text-[11px] text-emerald-200/80">Tailored workspace for students, property owners, and service providers.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Meal, Cleaning &amp; Expense Hub</h4>
                  <p className="text-[11px] text-emerald-200/80">Manage daily tiffin subscriptions, housekeeping, and split living costs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-emerald-800/60 text-[11px] text-emerald-200/70">
            Trusted by 10,000+ residents &amp; property owners nationwide
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LOGIN FORM                                 */}
        {/* ======================================================== */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          
          {/* Form Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center p-2 shadow-xs shrink-0">
              <img src="/logo.svg" alt="StaySync Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Welcome</span>
                <span className="text-emerald-800">Back!</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sign in to continue to your dashboard.
              </p>
            </div>
          </div>

          {/* Error Notification */}
          {(localError || error) && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span className="font-medium leading-relaxed">{localError || error}</span>
            </div>
          )}

          {/* Forgot Password Notice */}
          {forgotNotice && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
              <span>Please contact your property administrator or support at <strong>support@staysync.com</strong> to reset your credentials.</span>
              <button 
                type="button" 
                onClick={() => setForgotNotice(false)} 
                className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotNotice(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Brand Forest Green / Emerald Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#064e3b] hover:bg-[#043d2e] transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-4 text-center text-xs text-slate-500 border-t border-slate-100">
            New to StaySync?{' '}
            <Link to="/register" className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline">
              Create an account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;