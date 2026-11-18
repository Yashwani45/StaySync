import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardLink } from '../utils/roleHelper';
import RegistrationLocationStep from '../components/RegistrationLocationStep';
import {
  KeyRound, Mail, User, Phone, ShieldCheck, AlertCircle,
  Eye, EyeOff, UtensilsCrossed, Sparkles, Home as HomeIcon,
  CheckCircle2, Building, MapPin, ArrowRight
} from 'lucide-react';

const POPULAR_CITIES = [
  'Indore', 'Bhopal', 'Kota', 'Pune', 'Bangalore', 'Mumbai',
  'Delhi', 'Jaipur', 'Hyderabad', 'Ujjain', 'Gwalior', 'Jabalpur',
  'Ahmedabad', 'Chandigarh', 'Lucknow'
];

const Register = () => {
  const { user, register, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in (bina logout ke bahar na ho)
  useEffect(() => {
    if (user) {
      navigate(getRoleDashboardLink(user), { replace: true });
    }
  }, [user, navigate]);

  // Role selection: 'USER', 'PROPERTY_OWNER', 'TIFFIN', 'CLEANING'
  const initialRole = searchParams.get('role')?.toUpperCase();
  const validInitial = ['USER', 'TIFFIN', 'CLEANING', 'PROPERTY_OWNER'].includes(initialRole) ? initialRole : 'USER';
  const [accountType, setAccountType] = useState(validInitial);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(searchParams.get('city') || 'Indore');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Resident Specific
  const [tenantGender, setTenantGender] = useState('Male');
  const [tenantPreferredRoom, setTenantPreferredRoom] = useState('Hostel');
  const [tenantBudget, setTenantBudget] = useState('8000');

  // Provider / Owner Specific
  const [businessName, setBusinessName] = useState('');
  const [price, setPrice] = useState('3200');

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [regStep, setRegStep] = useState(1); // 1 = Basic Details, 2 = Map & Location Setup

  // Step 1 Validation -> Proceed to Map Setup
  const handleProceedToLocation = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setLocalError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLocalError(null);
    setRegStep(2);
  };

  // Step 2 Submission -> Final Registration with GeoJSON Location & Destination
  const handleFinalRegister = async (locationData) => {
    setLoading(true);
    setLocalError(null);

    let role = 'USER';
    let providerType = '';
    if (accountType === 'TIFFIN') {
      role = 'PROVIDER';
      providerType = 'Tiffin';
    } else if (accountType === 'CLEANING') {
      role = 'PROVIDER';
      providerType = 'Cleaning';
    } else if (accountType === 'PROPERTY_OWNER') {
      role = 'PROPERTY_OWNER';
    }

    const baseCity = (isCustomCity ? customCity.trim() : city.trim()) || 'Indore';
    const selectedCity = locationData?.location?.city || baseCity;

    try {
      let payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
        providerType,
        city: selectedCity,
        address: locationData?.location?.formattedAddress || locationData?.location?.address || `Prime Area, ${selectedCity}`
      };

      if (accountType === 'USER') {
        payload = {
          ...payload,
          gender: tenantGender,
          monthlyBudget: parseInt(tenantBudget) || 8000,
          propertyType: tenantPreferredRoom,
          preferredRoomType: tenantPreferredRoom,
          roomShare: 'Shared',
          foodPreference: 'Veg',
          preferredLocation: locationData?.location,
          destinationPreference: locationData?.destinationPreference
        };
      } else if (accountType === 'TIFFIN') {
        payload = {
          ...payload,
          businessName: businessName || `${name}'s Tiffin Services`,
          monthlyPrice: price || '3200',
          vegPrice: '90',
          cuisineSpeciality: 'Homestyle North Indian',
          meals: ['Breakfast', 'Lunch', 'Dinner'],
          businessLocation: locationData?.location
        };
      } else if (accountType === 'CLEANING') {
        payload = {
          ...payload,
          businessName: businessName || `${name}'s Cleaning Services`,
          cleaningPrice: price || '350',
          bathroomPrice: '200',
          pricePerKg: '50',
          cleaningServices: ['Regular Room', 'Bathroom Sanitization'],
          businessLocation: locationData?.location
        };
      } else if (accountType === 'PROPERTY_OWNER') {
        payload = {
          ...payload,
          propertyType: tenantPreferredRoom || 'Hostel',
          city: selectedCity,
          businessLocation: locationData?.location
        };
      }

      // Persist chosen anchor to localStorage so marketplace immediately loads nearby stays
      if (locationData?.destinationPreference) {
        localStorage.setItem('staysync_user_location_pref', JSON.stringify({
          coordinates: locationData.destinationPreference.coordinates,
          radius: locationData.destinationPreference.preferredRadius || 5,
          city: locationData.destinationPreference.city || selectedCity,
          destinationName: locationData.destinationPreference.destinationName
        }));
      } else if (locationData?.location) {
        localStorage.setItem('staysync_user_location_pref', JSON.stringify({
          coordinates: locationData.location.coordinates,
          radius: 5,
          city: locationData.location.city || selectedCity,
          destinationName: locationData.location.formattedAddress
        }));
      }

      const newUser = await register(payload);
      navigate(getRoleDashboardLink(newUser), { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className={`w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all duration-300 ${regStep === 2 ? 'max-w-5xl' : 'max-w-4xl'}`}>
        
        {/* Left Column: Forest Green Illustration Panel */}
        <div className={`${regStep === 2 ? 'md:col-span-4' : 'md:col-span-5'} bg-[#064e3b] p-8 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-300`}>
          {regStep === 1 ? (
            <div className="space-y-6 relative z-10">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-400/30 flex items-center justify-center p-1.5 shadow-inner">
                  <img src="/logo-white.svg" alt="StaySync" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  Stay<span className="text-emerald-300">Sync</span>
                </span>
              </Link>

              <div className="space-y-2 pt-4">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Join StaySync Today
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                  Find your ideal room, PG, and homestyle living services in minutes with zero brokerage.
                </p>
              </div>

              {/* Value Highlights */}
              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Verified Stays &amp; Real Photos</h4>
                    <p className="text-[11px] text-emerald-200/80">Every room &amp; hostel is physically inspected.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Zero Brokerage Guarantee</h4>
                    <p className="text-[11px] text-emerald-200/80">Connect directly with owners without middlemen fees.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Tiffin &amp; Housekeeping Bundles</h4>
                    <p className="text-[11px] text-emerald-200/80">Subscribe to hygienic daily meals &amp; cleaning easily.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-400/30 flex items-center justify-center p-1.5 shadow-inner">
                  <img src="/logo-white.svg" alt="StaySync" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  Stay<span className="text-emerald-300">Sync</span>
                </span>
              </Link>

              <div className="space-y-2 pt-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                  <span>Step 2 of 2</span>
                  <span>•</span>
                  <span>Interactive Map Setup</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {accountType === 'USER' ? 'Where are you looking for a stay?' : 'Where is your property located?'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                  {accountType === 'USER'
                    ? 'Detect your GPS location or search your college/workplace to automatically anchor nearby hostels and PGs.'
                    : 'Pin your property or service hub on OpenStreetMap with Geoapify autocomplete.'}
                </p>
              </div>

              {/* Step Checklist */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/30">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center text-xs font-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Basic Account Details</h4>
                    <p className="text-[11px] text-emerald-200/80">{name || email} ({accountType})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-300/40">
                  <div className="w-6 h-6 rounded-full bg-emerald-300 text-emerald-950 flex items-center justify-center text-xs font-black animate-pulse">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Leaflet &amp; Geoapify Map</h4>
                    <p className="text-[11px] text-emerald-200/80">Draggable Pin &amp; Commute Buffer</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative z-10 pt-6 border-t border-emerald-800/60 text-[11px] text-emerald-200/70">
            Trusted by 10,000+ residents across student &amp; tech hubs nationwide
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Column: Register Form or Map Step */}
        <div className={`${regStep === 2 ? 'md:col-span-8' : 'md:col-span-7'} p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300`}>
          <div className="space-y-5">
            {regStep === 1 ? (
              <>
                {/* Form Header with Brand Logo */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center p-2 shadow-xs shrink-0">
                    <img src="/logo.svg" alt="StaySync Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span>Join</span>
                      <span className="text-emerald-800">Stay<span className="text-emerald-600">Sync</span></span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Step 1 of 2: Choose your role and enter basic details.</p>
                  </div>
                </div>

                {/* Role Switcher Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'USER', label: 'Resident', icon: User },
                    { key: 'PROPERTY_OWNER', label: 'Owner', icon: Building },
                    { key: 'TIFFIN', label: 'Tiffin', icon: UtensilsCrossed },
                    { key: 'CLEANING', label: 'Cleaning', icon: Sparkles }
                  ].map((roleItem) => {
                    const IconComponent = roleItem.icon;
                    const isSelected = accountType === roleItem.key;
                    return (
                      <button
                        key={roleItem.key}
                        type="button"
                        onClick={() => { setAccountType(roleItem.key); setLocalError(null); }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{roleItem.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Error Message */}
                {(localError || error) && (
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{localError || error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleProceedToLocation} className="space-y-3.5">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* City Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">City</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCity(!isCustomCity)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                  >
                    {isCustomCity ? '← Select from list' : '+ Other City'}
                  </button>
                </div>
                {isCustomCity ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter your city name"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                ) : (
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                  >
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Role Specific Dynamic Inputs */}
              {accountType === 'USER' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={tenantGender}
                      onChange={(e) => setTenantGender(e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                    >
                      <option value="Male">Male (Boys)</option>
                      <option value="Female">Female (Girls)</option>
                      <option value="Other">Other / Any</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preferred Stay</label>
                    <select
                      value={tenantPreferredRoom}
                      onChange={(e) => setTenantPreferredRoom(e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                    >
                      <option value="Hostel">Hostel</option>
                      <option value="PG">Paying Guest (PG)</option>
                      <option value="Room">Private Room</option>
                      <option value="Flat">1/2 BHK Flat</option>
                    </select>
                  </div>
                </div>
              )}

              {accountType !== 'USER' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {accountType === 'PROPERTY_OWNER' ? 'Property Name' : 'Business / Kitchen Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        accountType === 'PROPERTY_OWNER' ? 'e.g. Royal Residency Hostel' :
                        accountType === 'TIFFIN' ? 'e.g. Annapurna Homestyle Kitchen' :
                        'e.g. SparkleClean Solutions'
                      }
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                    />
                  </div>
                  {accountType !== 'PROPERTY_OWNER' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {accountType === 'TIFFIN' ? 'Monthly Meal Price (₹)' : 'Starting Cleaning Rate (₹)'}
                      </label>
                      <input
                        type="number"
                        placeholder={accountType === 'TIFFIN' ? '3200' : '350'}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password (min 6 chars)"
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Agree Terms */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-600 cursor-pointer">
                  I agree to the <span className="font-bold text-emerald-800">Terms of Service</span> and <span className="font-bold text-emerald-800">Privacy Policy</span>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <span>Next: Set Location &amp; Campus Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div>
            {(localError || error) && (
              <div className="mb-4 bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}
            <RegistrationLocationStep
              accountType={accountType}
              initialCity={(isCustomCity ? customCity.trim() : city.trim()) || 'Indore'}
              onBack={() => setRegStep(1)}
              onComplete={handleFinalRegister}
              loading={loading}
            />
          </div>
        )}
      </div>

          {/* Footer Link to Login */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 underline">
              Log In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
