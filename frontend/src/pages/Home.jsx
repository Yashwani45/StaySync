import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, servicesAPI } from '../services/api';
import LivingCalculatorModal from '../components/LivingCalculatorModal';
import { getRoleDashboardLink } from '../utils/roleHelper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setSearchParam,
  setAllSearchParams,
  toggleShortlist as reduxToggleShortlist,
  setPropertiesList
} from '../store/slices/propertiesSlice';
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Headphones,
  Users,
  Search,
  Star,
  MapPin,
  Utensils,
  Shirt,
  Sparkles,
  Truck,
  Heart,
  CheckCircle2,
  Building2,
  Calendar,
  IndianRupee,
  Calculator,
  ChevronDown,
  Flame,
  Zap,
  Award,
  Quote,
  Check,
  Home as HomeIcon
} from 'lucide-react';

const FEATURED_PROPERTIES = [
  {
    _id: 'featured-1',
    title: 'Sunrise Boys Hostel',
    location: 'Knowledge Park, Greater Noida',
    city: 'Greater Noida',
    rent: 5500,
    rating: 4.6,
    reviewsCount: 28,
    amenities: ['WiFi', 'Food', 'AC'],
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
    type: 'Hostel'
  },
  {
    _id: 'featured-2',
    title: 'Green Valley PG',
    location: 'Koramangala, Bangalore',
    city: 'Bangalore',
    rent: 7500,
    rating: 4.8,
    reviewsCount: 42,
    amenities: ['WiFi', 'Food', 'AC', 'Cleaning'],
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
    type: 'PG'
  },
  {
    _id: 'featured-3',
    title: 'Royal Residency',
    location: 'Kothrud, Pune',
    city: 'Pune',
    rent: 6000,
    rating: 4.5,
    reviewsCount: 31,
    amenities: ['WiFi', 'Security', 'Parking'],
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80',
    type: 'Room'
  },
  {
    _id: 'featured-4',
    title: 'Comfort Living Hostel',
    location: 'Indraprastha, Kota',
    city: 'Kota',
    rent: 6500,
    rating: 4.7,
    reviewsCount: 35,
    amenities: ['WiFi', 'AC', 'Laundry'],
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&auto=format&fit=crop&q=80',
    type: 'Hostel'
  }
];

const DEFAULT_POPULAR_CITIES = [
  'All Cities',
  'Indore',
  'Bhopal',
  'Kota',
  'Pune',
  'Bangalore',
  'Delhi NCR',
  'Mumbai',
  'Jaipur',
  'Hyderabad',
  'Lucknow',
  'Ahmedabad'
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Authenticated users must stay inside their dedicated dashboard workspace (bina logout ke bahar na ho)
  useEffect(() => {
    if (user) {
      navigate(getRoleDashboardLink(user), { replace: true });
    }
  }, [user, navigate]);
  
  // Redux Global State
  const reduxSearchParams = useAppSelector((state) => state.properties.searchParams);
  const shortlisted = useAppSelector((state) => state.properties.shortlisted);
  const [properties, setProperties] = useState(FEATURED_PROPERTIES);
  const [tiffinProviders, setTiffinProviders] = useState([]);
  const [cleaningProviders, setCleaningProviders] = useState([]);
  const [availableCities, setAvailableCities] = useState(DEFAULT_POPULAR_CITIES);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState('hostels'); // 'hostels' | 'flats' | 'tiffin' | 'cleaning'

  const location = reduxSearchParams.location || 'All Cities';
  const propertyType = reduxSearchParams.propertyType || 'All Types';
  const budget = reduxSearchParams.budget || 'All Budgets';
  const moveInDate = reduxSearchParams.moveInDate || '';

  // Fetch properties and living services dynamically across all owner and provider locations
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      propertiesAPI.getProperties({}),
      servicesAPI.getServices({})
    ]).then(([propsRes, srvsRes]) => {
      if (!isMounted) return;

      // Extract unique cities created by both property owners and service providers
      const dynamicCities = [
        ...new Set([
          ...(propsRes.data || []).map(p => p.city?.trim()),
          ...(srvsRes.data || []).map(s => s.city?.trim())
        ])
      ].filter(Boolean);

      if (dynamicCities.length > 0) {
        setAvailableCities([
          'All Cities',
          ...Array.from(new Set([...dynamicCities, 'Indore', 'Bhopal', 'Kota', 'Pune', 'Bangalore', 'Delhi NCR', 'Mumbai']))
        ]);
      }

      // Format properties created by owners
      if (propsRes.success && Array.isArray(propsRes.data) && propsRes.data.length > 0) {
        const formatted = propsRes.data.map((p) => ({
          _id: p._id,
          title: p.title,
          location: [p.address, p.city].filter(Boolean).join(', ') || 'Prime Location',
          city: p.city || 'Available Hub',
          rent: p.monthlyRent || p.rentPerPerson || 6000,
          rating: p.rating || 4.6,
          reviewsCount: p.reviewsCount || 24,
          amenities: p.amenities?.slice(0, 3) || ['WiFi', 'Food', 'AC'],
          image: p.photos?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
          type: p.propertyType || 'Hostel'
        }));

        // Limit to at most 4 featured properties so not every created property crowds this UI
        const limitedList = [];
        const seenTypes = new Set();
        // Try to pick diverse types (Hostel, PG, Room)
        for (const item of formatted) {
          if (!seenTypes.has(item.type) && limitedList.length < 4) {
            limitedList.push(item);
            seenTypes.add(item.type);
          }
        }
        // Fill remaining slots up to 4 from formatted
        for (const item of formatted) {
          if (limitedList.length < 4 && !limitedList.some(p => p._id === item._id)) {
            limitedList.push(item);
          }
        }
        // If still fewer than 4, fill remaining from default curated list
        for (const fallback of FEATURED_PROPERTIES) {
          if (limitedList.length < 4 && !limitedList.some(p => p._id === fallback._id)) {
            limitedList.push(fallback);
          }
        }

        setProperties(limitedList);
        dispatch(setPropertiesList(formatted));
      }

      // Separate services created by tiffin and cleaning providers
      if (srvsRes.success && Array.isArray(srvsRes.data) && srvsRes.data.length > 0) {
        const tiffins = srvsRes.data.filter(s => s.category === 'Tiffin');
        const cleanings = srvsRes.data.filter(s => s.category === 'Cleaning' || s.category === 'Laundry');
        setTiffinProviders(tiffins);
        setCleaningProviders(cleanings);
      }
    }).catch((err) => {
      console.error('Home dynamic fetch error:', err);
    });

    return () => { isMounted = false; };
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setAllSearchParams({ location, propertyType, budget, moveInDate }));
    
    let targetTab = 'rooms';
    if (activeHeroTab === 'tiffin') targetTab = 'tiffin';
    else if (activeHeroTab === 'cleaning') targetTab = 'cleaning';

    const params = new URLSearchParams({ tab: targetTab });
    const trimmedLoc = (location || '').trim();
    if (trimmedLoc && trimmedLoc !== 'All Cities') {
      params.append('nlp', trimmedLoc);
      params.append('city', trimmedLoc);
    }
    
    if (activeHeroTab === 'flats') {
      params.append('type', 'room');
    } else if (propertyType && propertyType !== 'All Types') {
      params.append('type', propertyType.toLowerCase());
    }

    if (budget && budget !== 'All Budgets') {
      if (budget === '5000') params.append('maxPrice', '5000');
      else if (budget === '8000') params.append('maxPrice', '8000');
      else if (budget === '12000') params.append('maxPrice', '12000');
      else if (budget === '20000') params.append('maxPrice', '20000');
    }
    navigate(`/marketplace?${params.toString()}`);
  };

  const toggleShortlist = (id) => {
    dispatch(reduxToggleShortlist(id));
  };

  // Prevent flash of landing page if authenticated
  if (user) {
    return null;
  }

  return (
    <div className="space-y-16 sm:space-y-20 pb-12 sm:pb-16 overflow-x-hidden text-slate-800 bg-[#F8FAFC]">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: PREMIUM INDIGO/DEEP BLUE AIRBNB-INSPIRED CANVAS          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0F172A] to-indigo-950/90 text-white shadow-2xl">
        
        {/* Animated Ambient Multi-mesh Gradient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] bg-gradient-to-b from-indigo-600/30 via-indigo-900/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-[520px] h-[420px] bg-teal-500/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[520px] h-[420px] bg-indigo-500/25 rounded-full blur-[110px] pointer-events-none" />

        {/* Subtle Tech Blueprint Dot Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.14] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Subtle photographic backdrop with elegant gradient masking */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600&auto=format&fit=crop&q=80')`
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 text-center">
          
          {/* Main Headline Block */}
          <div className="space-y-3.5 max-w-4xl mx-auto pb-5 sm:pb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-xs font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-white/90">Verified Resident Living</span>
              <span className="text-white/40">•</span>
              <span className="text-teal-300 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-300" /> Zero Brokerage
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] px-1">
              Find Your Stay.{' '}
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(45,212,191,0.25)]">
                Build Your Life.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 font-medium max-w-xl mx-auto px-1 leading-relaxed">
              Verified hostels, PGs &amp; rooms with direct host pricing and instant bed holds.
            </p>
          </div>

          {/* Category Switcher Tabs Docked Above Search Bar */}
          <div className="flex items-center justify-center mb-3">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-xl gap-1 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveHeroTab('hostels')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeHeroTab === 'hostels'
                    ? 'bg-white text-slate-900 shadow-md font-black scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${activeHeroTab === 'hostels' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Hostels &amp; PGs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveHeroTab('flats')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeHeroTab === 'flats'
                    ? 'bg-white text-slate-900 shadow-md font-black scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <HomeIcon className={`w-3.5 h-3.5 ${activeHeroTab === 'flats' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>Flats &amp; Apartments</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveHeroTab('tiffin')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeHeroTab === 'tiffin'
                    ? 'bg-white text-slate-900 shadow-md font-black scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Utensils className={`w-3.5 h-3.5 ${activeHeroTab === 'tiffin' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Tiffin &amp; Food Services</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveHeroTab('cleaning')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeHeroTab === 'cleaning'
                    ? 'bg-white text-slate-900 shadow-md font-black scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeHeroTab === 'cleaning' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>Cleaning &amp; Laundry</span>
              </button>
            </div>
          </div>

          {/* Elevated Luxury Search Bar Card (Airbnb / Linear Style) */}
          <div className="w-full bg-white rounded-3xl sm:rounded-[28px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.45),0_0_0_1px_rgba(255,255,255,0.2)] p-3 sm:p-4 text-left border border-slate-100 mb-6 text-slate-800 transition-all">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-3 items-center">
              
              {/* 1. City / Location */}
              <div className="lg:col-span-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors border-b sm:border-b-0 sm:border-r border-slate-200/80">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>City / Location</span>
                </span>
                <input
                  type="text"
                  value={location === 'All Cities' ? '' : location}
                  onChange={(e) => dispatch(setSearchParam({ key: 'location', value: e.target.value }))}
                  placeholder={activeHeroTab === 'tiffin' ? "Area or city for meal delivery..." : "Indore, Bhopal, Ujjain, Kota..."}
                  list="city-options-list"
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none mt-1 placeholder:text-slate-400 placeholder:font-normal"
                />
                <datalist id="city-options-list">
                  <option value="All Cities">Available for all cities (Pan-India)</option>
                  {availableCities.filter(c => c !== 'All Cities').map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* 2. Property Type / Service Category */}
              <div className="lg:col-span-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors border-b sm:border-b-0 sm:border-r border-slate-200/80 relative">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  {activeHeroTab === 'tiffin' ? (
                    <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : activeHeroTab === 'cleaning' ? (
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                  <span>
                    {activeHeroTab === 'tiffin' ? 'Diet / Meal Plan' :
                     activeHeroTab === 'cleaning' ? 'Service Required' :
                     activeHeroTab === 'flats' ? 'Room Configuration' :
                     'Property Type'}
                  </span>
                </span>

                <div className="relative flex items-center mt-1">
                  <select
                    value={propertyType}
                    onChange={(e) => dispatch(setSearchParam({ key: 'propertyType', value: e.target.value }))}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer pr-6 appearance-none"
                  >
                    {activeHeroTab === 'tiffin' ? (
                      <>
                        <option value="All Types">All Meal Options (Thali &amp; Monthly)</option>
                        <option value="Hostel">Pure Veg Tiffin Services</option>
                        <option value="PG">Veg &amp; Non-Veg Regular Meals</option>
                        <option value="Room">Student Budget Monthly Tiffin</option>
                      </>
                    ) : activeHeroTab === 'cleaning' ? (
                      <>
                        <option value="All Types">All Housekeeping &amp; Laundry</option>
                        <option value="Hostel">Room Deep Cleaning &amp; Sanitization</option>
                        <option value="PG">Doorstep Laundry (Per Kg)</option>
                        <option value="Room">Washroom &amp; Kitchen Sanitization</option>
                      </>
                    ) : activeHeroTab === 'flats' ? (
                      <>
                        <option value="Room">Private Flat / 1BHK / 2BHK</option>
                        <option value="All Types">Any Flat or Independent Room</option>
                        <option value="PG">Studio Apartment / Coliving</option>
                      </>
                    ) : (
                      <>
                        <option value="All Types">All Accommodation Types</option>
                        <option value="Hostel">Hostel (Boys / Girls / Co-ed)</option>
                        <option value="PG">PG / Coliving with Mess</option>
                        <option value="Room">Private Flat / Room</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 pointer-events-none" />
                </div>
              </div>

              {/* 3. Budget Filter */}
              <div className="lg:col-span-2 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors border-b sm:border-b-0 sm:border-r border-slate-200/80 relative">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{activeHeroTab === 'tiffin' ? 'Meal Budget' : activeHeroTab === 'cleaning' ? 'Budget' : 'Monthly Rent'}</span>
                </span>
                <div className="relative flex items-center mt-1">
                  <select
                    value={budget}
                    onChange={(e) => dispatch(setSearchParam({ key: 'budget', value: e.target.value }))}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer pr-6 appearance-none"
                  >
                    <option value="All Budgets">All Budgets</option>
                    <option value="5000">Under ₹5,000</option>
                    <option value="8000">Under ₹8,000</option>
                    <option value="12000">Under ₹12,000</option>
                    <option value="20000">Under ₹20,000</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 pointer-events-none" />
                </div>
              </div>

              {/* 4. Move-in Date / Schedule */}
              <div className="lg:col-span-2 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors border-b sm:border-b-0 lg:border-r border-slate-200/80">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{activeHeroTab === 'tiffin' ? 'Start Date' : activeHeroTab === 'cleaning' ? 'Service Date' : 'Target Move-in'}</span>
                </span>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => dispatch(setSearchParam({ key: 'moveInDate', value: e.target.value }))}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer mt-1"
                />
              </div>

              {/* 5. Search CTA */}
              <div className="lg:col-span-2 pt-1 sm:pt-0">
                <button
                  type="submit"
                  className={`w-full h-12 sm:h-13 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:scale-[1.02] group ${
                    activeHeroTab === 'tiffin'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                      : activeHeroTab === 'cleaning'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-teal-600/30'
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
                  }`}
                >
                  <Search className="w-4 h-4 stroke-[2.5] group-hover:rotate-12 transition-transform" />
                  <span>
                    {activeHeroTab === 'tiffin' ? 'Find Tiffins' :
                     activeHeroTab === 'cleaning' ? 'Find Services' :
                     activeHeroTab === 'flats' ? 'Search Flats' :
                     'Search Stays'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </form>
          </div>

          {/* Popular Cities Quick Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="font-bold text-slate-400 flex items-center gap-1.5 mr-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Cities:</span>
            </span>
            {['Indore', 'Bhopal', 'Kota', 'Pune', 'Bangalore', 'Ujjain'].map((cityName) => (
              <button
                key={cityName}
                type="button"
                onClick={() => {
                  dispatch(setSearchParam({ key: 'location', value: cityName }));
                  const tab = activeHeroTab === 'tiffin' ? 'tiffin' : activeHeroTab === 'cleaning' ? 'cleaning' : 'rooms';
                  navigate(`/marketplace?tab=${tab}&city=${encodeURIComponent(cityName)}&nlp=${encodeURIComponent(cityName)}`);
                }}
                className="px-3.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/10 hover:border-white/30 text-white font-bold transition-all text-xs cursor-pointer shadow-2xs hover:scale-105"
              >
                {cityName}
              </button>
            ))}
          </div>

          {/* 4 Trust Feature Cards with Glassmorphic Depth */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 pt-10">
            
            <div className="bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 hover:border-teal-400/40 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xl text-left hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-teal-500/30 transition-all">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-black text-xs sm:text-sm text-white leading-tight">100% Verified Stays</h4>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 hidden xl:inline">Audited</span>
                </div>
                <p className="text-[11px] text-teal-300/90 font-medium leading-tight mt-1">Physical Audit Passed</p>
              </div>
            </div>

            <div className="bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 hover:border-indigo-400/40 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xl text-left hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-black text-xs sm:text-sm text-white leading-tight">Zero Brokerage</h4>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden xl:inline">₹0 Fee</span>
                </div>
                <p className="text-[11px] text-indigo-300/90 font-medium leading-tight mt-1">Direct Host Pricing</p>
              </div>
            </div>

            <div className="bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 hover:border-purple-400/40 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xl text-left hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-purple-500/30 transition-all">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-black text-xs sm:text-sm text-white leading-tight">AI Roommate Match</h4>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden xl:inline">98% Match</span>
                </div>
                <p className="text-[11px] text-purple-300/90 font-medium leading-tight mt-1">Habit &amp; Sleep Compatibility</p>
              </div>
            </div>

            <div className="bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 hover:border-amber-400/40 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xl text-left hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-amber-500/30 transition-all">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-black text-xs sm:text-sm text-white leading-tight">Instant Bed Hold</h4>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden xl:inline">&lt; 60s</span>
                </div>
                <p className="text-[11px] text-amber-300/90 font-medium leading-tight mt-1">Atomic Lock Protection</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. EXPLORE CATEGORIES (AIRBNB-STYLE CATEGORY TILES)                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 pb-4 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full mb-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Curated Accommodations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Living Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Find the perfect accommodation tailored to your study schedule, office commute, or independent lifestyle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
          {[
            {
              title: 'Boys Hostel',
              tag: 'Biometric & Wardens',
              desc: 'Dedicated student & executive residences with nutritious daily meals and biometric security.',
              count: '45+ Verified Hubs',
              icon: Building2,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              link: '/marketplace?tab=rooms&type=hostel&hostelCategory=Boys%20Hostel'
            },
            {
              title: 'Girls Hostel',
              tag: 'High Security & CCTV',
              desc: 'Safe, verified hostels with 24/7 CCTV surveillance, warden supervision & pure-veg dining.',
              count: '35+ Verified Hubs',
              icon: ShieldCheck,
              color: 'text-rose-600 bg-rose-50 border-rose-200',
              link: '/marketplace?tab=rooms&type=hostel&hostelCategory=Girls%20Hostel'
            },
            {
              title: 'Independent Flats',
              tag: 'Zero Restrictions',
              desc: '1 BHK, 2 BHK and studio apartments with private kitchens, attached balconies & complete privacy.',
              count: '60+ Direct Flats',
              icon: HomeIcon,
              color: 'text-teal-600 bg-teal-50 border-teal-200',
              link: '/marketplace?tab=rooms&type=room'
            }
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.link}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-bl-full pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400">
                    {cat.count}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-600 group-hover:text-indigo-800">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED PROPERTIES: CLEAN MODERN SAAS PROPERTY CARDS                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 pb-4 gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Physically Audited Stays</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Indore, Bhopal, Kota, Pune &amp; Pan-India</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Verified Stays
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Handpicked accommodations with live bed availability, zero broker markup, and instant online bed hold.
            </p>
          </div>
          
          <Link
            to="/marketplace?tab=rooms"
            className="text-xs font-black text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 shrink-0 shadow-2xs self-start sm:self-auto hover:shadow-xs group"
          >
            <span>Explore All Stays</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-1">
          {properties.slice(0, 4).map((p) => {
            const isFav = !!shortlisted[p._id];
            return (
              <div
                key={p._id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Floating Tags */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[85%]">
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-md ${
                        p.type === 'Hostel' ? 'bg-indigo-600 text-white' :
                        p.type === 'PG' ? 'bg-purple-600 text-white' :
                        'bg-teal-700 text-white'
                      }`}>
                        {p.type}
                      </span>
                      {p.city && (
                        <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-md">
                          {p.city}
                        </span>
                      )}
                    </div>

                    {/* Shortlist heart */}
                    <button
                      type="button"
                      onClick={() => toggleShortlist(p._id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-600 flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer hover:shadow-lg"
                      title="Save property"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate" title={p.title}>
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-black text-slate-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{p.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </p>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.amenities?.map((am, i) => (
                        <span
                          key={i}
                          className="bg-slate-100/80 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Price & Action */}
                <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-indigo-700">₹{p.rent?.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 font-bold">/mo</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-600 block">✓ Zero Brokerage</span>
                  </div>
                  <Link
                    to={`/marketplace?tab=rooms&nlp=${encodeURIComponent(p.title)}`}
                    className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95"
                  >
                    Hold Bed →
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXPLORE OUR LIVING SERVICES: DEEP INDIGO & TEAL SHOWCASE CONTAINER     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 lg:p-12 rounded-[32px] border border-indigo-800/60 shadow-2xl space-y-8 text-white">
          
          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-500/20 border border-teal-400/30 px-3 py-1 rounded-full shadow-2xs">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>Independent Living Ecosystem</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mt-2">
                Daily Homely Meals &amp; Doorstep Housekeeping
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 font-medium mt-1 max-w-2xl leading-relaxed">
                Eat hygienic food every day and live in a spotless room. Order healthy home-cooked tiffins and schedule verified room cleaning without vendor hassles.
              </p>
            </div>
            <Link
              to="/marketplace?tab=services"
              className="text-xs font-black text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 px-5 py-2.5 rounded-2xl transition-all self-start sm:self-auto flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {/* Card 1: Tiffin Provider 1 */}
            <Link
              to="/marketplace?tab=services&category=Tiffin"
              className="bg-white rounded-3xl border border-slate-200/90 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group text-slate-800"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Pure Veg
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                  {tiffinProviders[0]?.businessName || 'Desi Homely Tiffin'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Dal Tadka, Shahi Paneer, 4 Phulkas, Rice &amp; Salad cooked in pure ghee.
                </p>
                <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-slate-600">
                  <span>Starts ₹85/thali</span>
                  <span>•</span>
                  <span>₹2,800/mo</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ★ {tiffinProviders[0]?.rating || 4.8} Rating
                </span>
                <span className="text-xs font-black text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
                  <span>Order Meal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Card 2: 3-Meal Student Mess */}
            <Link
              to="/marketplace?tab=services&category=Tiffin"
              className="bg-white rounded-3xl border border-slate-200/90 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group text-slate-800"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200">
                    2 &amp; 3 Meals
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-orange-700 transition-colors">
                  {tiffinProviders[1]?.businessName || 'Executive Monthly Mess'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Breakfast, lunch &amp; dinner with 7-day rotating nutritious student diet.
                </p>
                <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-slate-600">
                  <span>Free Doorstep Delivery</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  ★ {tiffinProviders[1]?.rating || 4.7} Rating
                </span>
                <span className="text-xs font-black text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
                  <span>View Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Card 3: Deep Cleaning & Sanitization */}
            <Link
              to="/marketplace?tab=services&category=Cleaning"
              className="bg-white rounded-3xl border border-slate-200/90 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group text-slate-800"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                    Eco-Safe
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                  {cleaningProviders[0]?.businessName || 'Deep Room Sanitization'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Full bedroom, washroom descaling &amp; antibacterial steam sanitization.
                </p>
                <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-slate-600">
                  <span>From ₹350 / visit</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  ★ {cleaningProviders[0]?.rating || 4.9} Rating
                </span>
                <span className="text-xs font-black text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
                  <span>Book Clean</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Card 4: Doorstep Laundry */}
            <Link
              to="/marketplace?tab=services&category=Cleaning"
              className="bg-white rounded-3xl border border-slate-200/90 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group text-slate-800"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                    24h Turnaround
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-700 transition-colors">
                  {cleaningProviders[1]?.businessName || 'Express Doorstep Laundry'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Wash, tumble dry &amp; steam iron per-kg pricing with doorstep pickup.
                </p>
                <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-slate-600">
                  <span>From ₹45 / kg</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  ★ {cleaningProviders[1]?.rating || 4.8} Rating
                </span>
                <span className="text-xs font-black text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
                  <span>Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS: 4 NUMBERED STEPS WITH CLEAN LINEAR-INSPIRED LAYOUT       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full mb-1.5 shadow-2xs">
            <Zap className="w-3 h-3 text-indigo-600" />
            <span>Seamless 4-Step Journey</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How StaySync Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Move from searching to settling in without agents, hidden commissions, or paper lease friction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 4 Connected Steps in Left 8-columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-3 shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  01
                </div>
                <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">Smart Discovery</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Search &amp; Filter Verified Stays</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Browse real audited room photos, filter by budget, food preferences, attached baths, and check live vacancies in your city.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-3 shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                  02
                </div>
                <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Atomic Lock</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Atomic Bed Hold &amp; Approval</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Lock your exact bed with our temporary atomic hold. Zero double booking risk while the verified property owner approves.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-3 shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                  03
                </div>
                <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">100% Digital</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Digital Agreement &amp; Move-In</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sign electronic lease agreements, upload digital KYC, complete initial room inspection, and download GST tax invoices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-3 shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                  04
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Unified Living</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">All-in-One Resident App</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Pay rent with 1-click UPI, log maintenance tickets with photo proof, subscribe to daily tiffins, and chat with housemates.
              </p>
            </div>

          </div>

          {/* Right Callout Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 shadow-2xl border border-indigo-800/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30">
                <Check className="w-3 h-3 text-teal-300" />
                <span>Zero Broker Commission</span>
              </span>
              <h3 className="font-black text-xl sm:text-2xl text-white tracking-tight leading-snug">
                Move into your ideal hostel or PG this week.
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed font-medium">
                Connect directly with certified property owners in Indore, Bhopal, Kota, Pune, and pan-India with guaranteed bed inventory.
              </p>
            </div>

            <div className="relative z-10 pt-2">
              <Link
                to="/marketplace?tab=rooms"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 hover:scale-[1.02]"
              >
                <span>Find Your Room Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. WHY CHOOSE STAYSYNC? GLOW-BORDERED STATS BANNER                        */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 sm:py-16 border-y border-indigo-900/60 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative z-10">
          
          <div className="space-y-1.5 max-w-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30">
              Trusted Across India
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Why Students &amp; Tenants Choose StaySync
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 font-medium">
              India's first verified living platform designed specifically for students, young professionals, and modern property hosts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white block">15,000+</span>
              <span className="text-xs text-indigo-200/80 font-bold mt-1 block">Happy Residents</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-teal-300 block">3,500+</span>
              <span className="text-xs text-indigo-200/80 font-bold mt-1 block">Audited Beds</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 block">₹0</span>
              <span className="text-xs text-indigo-200/80 font-bold mt-1 block">Brokerage Paid</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-300 block">4.9 ★</span>
              <span className="text-xs text-indigo-200/80 font-bold mt-1 block">Platform Rating</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. LIVING CALCULATOR CALLOUT BANNER                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-indigo-800/40">
          
          <div className="space-y-2 text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30">
              <Calculator className="w-3.5 h-3.5 text-teal-300" />
              <span>Smart Living Cost Calculator</span>
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Calculate Your Monthly Cost (Room + Food + Laundry)
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/80 font-medium max-w-xl leading-relaxed">
              Plan your student or professional budget in 30 seconds with real rates from verified hostels, PGs &amp; meal providers.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-teal-200">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-md">Hostel Bed: ₹6,500</span>
              <span>+</span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-md">Daily Meals: ₹2,800</span>
              <span>+</span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-md">Laundry: ₹500</span>
              <span>=</span>
              <span className="bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-400/30">₹9,800/mo Total</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowCalculator(true)}
            className="relative z-10 shrink-0 bg-white hover:bg-slate-50 text-indigo-950 font-black text-xs sm:text-sm px-7 py-4 rounded-2xl transition-all shadow-xl flex items-center gap-2 cursor-pointer active:scale-95 hover:scale-105"
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Open Living Calculator</span>
          </button>
        </div>
      </section>

      {/* Living Calculator Modal */}
      {showCalculator && (
        <LivingCalculatorModal
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
          onApplyPlan={(plan) => {
            setShowCalculator(false);
            navigate(`/marketplace?tab=rooms&budget=${plan.budget}`);
          }}
        />
      )}

    </div>
  );
};

export default Home;
