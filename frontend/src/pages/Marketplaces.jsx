import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveTab as reduxSetActiveTab } from '../store/slices/servicesSlice';
import { toggleShortlist as reduxToggleShortlist } from '../store/slices/propertiesSlice';
import { propertiesAPI, servicesAPI, requestsAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import PropertiesMap from '../components/PropertiesMap';
import ServiceCard from '../components/ServiceCard';
import StayDetailsModal from '../components/StayDetailsModal';
import BedSelectorModal from '../components/BedSelectorModal';
import EmailConfirmationModal from '../components/EmailConfirmationModal';
import { sendWeb3FormsMail } from '../utils/mailHelper';
import { normalizeImageUrl } from '../utils/imageHelper';
import { isProviderUser, getRoleDashboardLink } from '../utils/roleHelper';
import {
  Filter, Star, MapPin, Search, CheckCircle2, ArrowRight,
  Home, UtensilsCrossed, Sparkles, Building, DoorOpen,
  RotateCcw, SlidersHorizontal, X, AlertCircle, Clock,
  LayoutGrid, Map, ShieldCheck, Check
} from 'lucide-react';

const POPULAR_CITIES = [
  'Indore', 'Bhopal', 'Kota', 'Pune', 'Bangalore', 'Mumbai',
  'Delhi', 'Jaipur', 'Hyderabad', 'Ujjain', 'Gwalior', 'Jabalpur',
  'Ahmedabad', 'Chandigarh', 'Lucknow'
];

const Marketplaces = () => {
  const { user, roommateProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const shortlisted = useAppSelector((state) => state.properties.shortlisted);

  // Remove Marketplace access for Admin & Providers/Owners (Only accessible by Residents & Guests)
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        navigate('/admin-dashboard', { replace: true });
      } else if (isProviderUser(user)) {
        navigate(getRoleDashboardLink(user), { replace: true });
      }
    }
  }, [user, navigate]);

  // Active Tab: 'rooms' | 'tiffin' | 'cleaning'
  const rawTab = (searchParams.get('tab') || 'rooms').toLowerCase();
  const rawCategory = (searchParams.get('category') || '').toLowerCase();
  const activeTab = useMemo(() => {
    if (rawTab === 'cleaning' || rawCategory === 'cleaning') return 'cleaning';
    if (rawTab === 'tiffin' || rawTab === 'services' || rawCategory === 'tiffin') return 'tiffin';
    return 'rooms';
  }, [rawTab, rawCategory]);

  const switchTab = (tabName) => {
    dispatch(reduxSetActiveTab(tabName));
    setSearchParams({ tab: tabName });
  };

  useEffect(() => {
    dispatch(reduxSetActiveTab(activeTab));
  }, [activeTab, dispatch]);

  // View mode: 'grid' | 'map'
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Data States
  const [properties, setProperties] = useState([]);
  const [tiffinServices, setTiffinServices] = useState([]);
  const [cleaningServices, setCleaningServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Details Modal (Screen 3)
  const [detailsProperty, setDetailsProperty] = useState(null);
  const [bedSelectorProperty, setBedSelectorProperty] = useState(null);

  // Active Stay & Selected Providers
  const [selectedStay, setSelectedStay] = useState(null);
  const [showAllStays, setShowAllStays] = useState(false);
  const [stayBookingStatus, setStayBookingStatus] = useState('Accepted');
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [selectionBannerMsg, setSelectionBannerMsg] = useState('');
  const [emailModalData, setEmailModalData] = useState(null);

  // Filters State
  const [city, setCity] = useState(
    searchParams.get('city') || 
    user?.currentCity || 
    user?.preferredCity || 
    roommateProfile?.city || 
    'All'
  );

  const [areaSearch, setAreaSearch] = useState(
    searchParams.get('area') || searchParams.get('location') || searchParams.get('nlp') || searchParams.get('search') || ''
  );
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || searchParams.get('propertyType') || '');
  const [hostelCategory, setHostelCategory] = useState(searchParams.get('hostelCategory') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('budget') || searchParams.get('maxBudget') || '');
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || '');
  const [foodOnly, setFoodOnly] = useState(searchParams.get('foodOnly') === 'true');
  const [searchRadius, setSearchRadius] = useState(searchParams.get('radius') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevant');
  const [userCoords, setUserCoords] = useState(null);

  // Synchronize state when URL search parameters change
  useEffect(() => {
    const qCity = searchParams.get('city');
    if (qCity) setCity(qCity);
    const qArea = searchParams.get('area') || searchParams.get('location') || searchParams.get('nlp') || searchParams.get('search');
    if (qArea !== null && qArea !== undefined) setAreaSearch(qArea);
    const qType = searchParams.get('type') || searchParams.get('propertyType');
    if (qType) setPropertyType(qType);
  }, [searchParams]);

  // Auto-anchor to user's registered destination / preferred location
  useEffect(() => {
    if (userCoords) return;

    if (user?.destinationPreference?.coordinates && user.destinationPreference.coordinates.length === 2) {
      const [lng, lat] = user.destinationPreference.coordinates;
      if (lat && lng) {
        setUserCoords({ lat, lng });
        if (!searchRadius && user.destinationPreference.preferredRadius) {
          setSearchRadius(String(user.destinationPreference.preferredRadius));
        }
        if ((!city || city === 'All') && user.destinationPreference.city) {
          setCity(user.destinationPreference.city);
        }
        return;
      }
    }

    if (user?.preferredLocation?.coordinates && user.preferredLocation.coordinates.length === 2) {
      const [lng, lat] = user.preferredLocation.coordinates;
      if (lat && lng) {
        setUserCoords({ lat, lng });
        if ((!city || city === 'All') && user.preferredLocation.city) {
          setCity(user.preferredLocation.city);
        }
        return;
      }
    }

    // Fallback: check localStorage for saved guest or recent preference
    try {
      const savedPref = JSON.parse(localStorage.getItem('staysync_user_location_pref') || 'null');
      if (savedPref?.coordinates && savedPref.coordinates.length === 2) {
        const [lng, lat] = savedPref.coordinates;
        if (lat && lng) {
          setUserCoords({ lat, lng });
          if (!searchRadius && savedPref.radius) {
            setSearchRadius(String(savedPref.radius));
          }
          if ((!city || city === 'All') && savedPref.city) {
            setCity(savedPref.city);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [user]);

  // Dynamically discover all unique cities from loaded properties & services
  const allDiscoveredCities = useMemo(() => {
    const fromItems = [
      ...properties.map(p => p.city?.trim()),
      ...tiffinServices.map(s => s.city?.trim()),
      ...cleaningServices.map(s => s.city?.trim())
    ].filter(Boolean);
    return Array.from(new Set([...fromItems, ...POPULAR_CITIES]));
  }, [properties, tiffinServices, cleaningServices]);

  // Booking Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [submittingModal, setSubmittingModal] = useState(false);

  const currentUserId = (user?._id || user?.id)?.toString();

  // Sync selected stay and providers from local storage / backend requests
  useEffect(() => {
    if (currentUserId) {
      const localStay = JSON.parse(
        localStorage.getItem(`staysync_selected_stay_${currentUserId}`) || 'null'
      );
      if (roommateProfile?.selectedStay) {
        setSelectedStay(roommateProfile.selectedStay);
      } else if (localStay) {
        setSelectedStay(localStay);
      }

      requestsAPI.getMyRequests().then(reqRes => {
        const allRequests = reqRes.data || [];
        const acceptedReq = allRequests.find(r => 
          (r.itemType === 'Property' || r.itemType === 'Stay') && 
          r.status === 'Accepted' && 
          r.itemId
        );
        if (acceptedReq && acceptedReq.itemId) {
          const stayObj = typeof acceptedReq.itemId === 'object' ? acceptedReq.itemId : null;
          if (stayObj) {
            setSelectedStay(stayObj);
            setStayBookingStatus('Accepted');
          }
        }
      }).catch(e => console.error('Booking sync note:', e));

      const localProviders = JSON.parse(
        localStorage.getItem(`staysync_selected_providers_${currentUserId}`) || '[]'
      );
      if (roommateProfile?.selectedProviders?.length > 0) {
        setSelectedProviders(roommateProfile.selectedProviders);
      } else if (localProviders.length > 0) {
        setSelectedProviders(localProviders);
      }
    }
  }, [user, roommateProfile, currentUserId]);

  // Load Marketplace Data
  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'rooms') {
        const filters = {};
        if (city && city !== 'All' && city !== 'All Cities') filters.city = city;
        if (propertyType) filters.propertyType = propertyType;
        if (hostelCategory) filters.hostelCategory = hostelCategory;
        if (roomType) filters.roomType = roomType;
        if (maxBudget) filters.maxBudget = maxBudget;
        if (areaSearch.trim()) filters.location = areaSearch.trim();
        if (foodOnly) filters.foodAvailable = 'true';
        if (searchRadius) filters.radius = searchRadius;
        if (sortBy && sortBy !== 'relevant') filters.sortBy = sortBy;
        if (userCoords) {
          filters.userLat = userCoords.lat;
          filters.userLng = userCoords.lng;
        }

        const res = await propertiesAPI.getProperties(filters);
        if (res.success) setProperties(res.data || []);
      } else if (activeTab === 'tiffin') {
        const filters = { category: 'Tiffin' };
        if (city && city !== 'All' && city !== 'All Cities') filters.city = city;
        if (areaSearch.trim()) filters.location = areaSearch.trim();
        const res = await servicesAPI.getServices(filters);
        if (res.success) setTiffinServices(res.data || []);
      } else if (activeTab === 'cleaning') {
        const filters = { category: 'Cleaning' };
        if (city && city !== 'All' && city !== 'All Cities') filters.city = city;
        if (areaSearch.trim()) filters.location = areaSearch.trim();
        const res = await servicesAPI.getServices(filters);
        if (res.success) setCleaningServices(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, [activeTab, city, areaSearch, propertyType, hostelCategory, maxBudget, roomType, foodOnly, searchRadius, sortBy, userCoords]);

  // Pre-fetch count of services
  useEffect(() => {
    const filtersTiffin = { category: 'Tiffin' };
    const filtersCleaning = { category: 'Cleaning' };
    if (city && city !== 'All' && city !== 'All Cities') {
      filtersTiffin.city = city;
      filtersCleaning.city = city;
    }
    servicesAPI.getServices(filtersTiffin).then(r => r.success && setTiffinServices(r.data)).catch(() => {});
    servicesAPI.getServices(filtersCleaning).then(r => r.success && setCleaningServices(r.data)).catch(() => {});
  }, [city]);

  // Handle Select Stay / Book (Directly opens Bed & Room Selector)
  const handleSelectStay = async (property) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBedSelectorProperty(property);
  };

  // Handle Book Service
  const handleBookService = (service) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setModalTarget({ type: 'ServiceProvider', item: service });
    let price = service.tiffinDetails?.monthlyPrice || service.cleaningDetails?.priceMap?.['Regular Room'] || 350;
    setProposedPrice(price);
    setInquiryMessage(`Hello, I would like to subscribe to "${service.businessName}" (${service.category}).`);
    setInquirySuccess(false);
    setModalError(null);
    setShowInquiryModal(true);
  };

  // Submit Booking Modal
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setModalError('Please log in to continue.');
      return;
    }
    setSubmittingModal(true);
    setModalError(null);

    try {
      const payload = {
        itemType: modalTarget.type,
        itemId: modalTarget.item._id,
        message: inquiryMessage,
        proposedPrice: proposedPrice ? parseInt(proposedPrice) : undefined
      };

      const res = await requestsAPI.createRequest(payload);
      if (res.success) {
        const cat = modalTarget.type === 'Property' ? (modalTarget.item.propertyType || 'Hostel') : (modalTarget.item.category || 'Service');
        const bookingId = `SS-${cat.toUpperCase().slice(0, 4)}-${res.data?._id?.slice(-5)?.toUpperCase() || Date.now().toString().slice(-5)}`;

        sendWeb3FormsMail({
          subject: `StaySync Booking: ${user?.name || 'Resident'} - ${modalTarget.item.title || modalTarget.item.businessName} [${bookingId}]`,
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          category: cat,
          title: modalTarget.item.title || modalTarget.item.businessName,
          price: proposedPrice,
          city: modalTarget.item.city || city,
          address: modalTarget.item.address,
          message: inquiryMessage,
          bookingId
        }).catch(err => console.warn('Web3Forms mail warning:', err));

        if (modalTarget.type === 'Property') {
          setSelectedStay(modalTarget.item);
          if (currentUserId) {
            localStorage.setItem(`staysync_selected_stay_${currentUserId}`, JSON.stringify(modalTarget.item));
          }
          setSelectionBannerMsg(`Booking confirmed for "${modalTarget.item.title}"! Receipt generated.`);
        }

        setEmailModalData({
          category: cat,
          title: modalTarget.item.title || modalTarget.item.businessName,
          businessName: modalTarget.item.businessName || modalTarget.item.title,
          address: modalTarget.item.address || `${city} Center`,
          city: modalTarget.item.city || city,
          monthlyRent: modalTarget.type === 'Property' ? proposedPrice : null,
          tiffinPrice: cat === 'Tiffin' ? proposedPrice : null,
          cleaningPrice: cat === 'Cleaning' ? proposedPrice : null,
          ownerName: modalTarget.item.owner?.name || modalTarget.item.user?.name || 'Partner Host',
          ownerPhone: modalTarget.item.contactPhone || '+91 98765 43210',
          bookingId
        });

        setInquirySuccess(true);
        setTimeout(() => {
          setShowInquiryModal(false);
        }, 1200);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to submit booking request.');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleResetFilters = () => {
    setAreaSearch('');
    setPropertyType('');
    setHostelCategory('');
    setMaxBudget('');
    setRoomType('');
    setFoodOnly(false);
  };

  const hasActiveFilters = Boolean(areaSearch || propertyType || hostelCategory || maxBudget || roomType || foodOnly);

  // Prevent flash of marketplace content for Admin and Providers before navigation completes
  if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || isProviderUser(user))) {
    return null;
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">

      {/* 1. TOP HERO BANNER (Matches Screen 2, 4, 5) */}
      <div className={`text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-all duration-500 ${
        activeTab === 'rooms' ? 'bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22]' :
        activeTab === 'tiffin' ? 'bg-gradient-to-r from-[#064e3b] via-[#854d0e] to-[#022c22]' :
        'bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#022c22]'
      }`}>
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
              {activeTab === 'rooms' && 'Verified Living Spaces • Available for all cities'}
              {activeTab === 'tiffin' && 'Daily Hygienic Meal Subscriptions'}
              {activeTab === 'cleaning' && 'Professional Upkeep & Laundry'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {activeTab === 'rooms' && 'Find Your Ideal Stay'}
              {activeTab === 'tiffin' && 'Healthy & Homestyle Tiffin Services'}
              {activeTab === 'cleaning' && 'Professional Cleaning & Living Services'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              {activeTab === 'rooms' && 'Explore verified hostels, PGs, and shared rooms — Available for all cities.'}
              {activeTab === 'tiffin' && 'Fresh, hygienic, and pocket-friendly meals delivered daily to your doorstep.'}
              {activeTab === 'cleaning' && 'Trained staff, verified cleaners, and flexible room upkeep schedules.'}
            </p>
          </div>

          {/* Embedded Search Card */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-emerald-900/30 max-w-4xl mx-auto text-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              
              {/* Location Input */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'rooms' ? (city && city !== 'All' ? `Search area or college in ${city}...` : 'Available for all cities (Search area, city or college)...') :
                    activeTab === 'tiffin' ? (city && city !== 'All' ? `Search tiffin kitchen or area in ${city}...` : 'Search tiffin kitchen or city...') :
                    (city && city !== 'All' ? `Search cleaning service in ${city}...` : 'Search cleaning service or city...')
                  }
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium bg-slate-50 hover:bg-white"
                />
              </div>

              {/* City Selector */}
              <div className="sm:col-span-3">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium bg-slate-50 cursor-pointer"
                >
                  <option value="All">🌐 Available for all cities (Pan-India)</option>
                  {allDiscoveredCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Type / Category Selector */}
              <div className="sm:col-span-2">
                {activeTab === 'rooms' ? (
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium bg-slate-50 cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="Hostel">Hostel</option>
                    <option value="PG">PG</option>
                    <option value="Room">Room</option>
                    <option value="Flat">Flat</option>
                  </select>
                ) : (
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium bg-slate-50 cursor-pointer"
                  >
                    <option value="">Any Budget</option>
                    <option value="5000">Under ₹5k</option>
                    <option value="8000">Under ₹8k</option>
                    <option value="12000">Under ₹12k</option>
                  </select>
                )}
              </div>

              {/* Search & Map Toggle Buttons */}
              <div className="sm:col-span-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadMarketplaceData}
                  className="flex-1 py-2.5 px-3 bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    viewMode === 'map'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200 hover:border-emerald-500'
                  }`}
                  title={viewMode === 'map' ? 'Switch to List View' : 'Switch to Map View'}
                >
                  <Map className={`w-4 h-4 ${viewMode === 'map' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{viewMode === 'map' ? 'List' : 'Map'}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. CATEGORY TABS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20">
        <div className="bg-white p-2 rounded-2xl shadow-md border border-slate-200 flex items-center gap-2 overflow-x-auto w-fit">
          <button
            type="button"
            onClick={() => switchTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Find Stays</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'rooms' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {properties.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('tiffin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tiffin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/60'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-300" />
            <span>Tiffin Services</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'tiffin' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {tiffinServices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('cleaning')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cleaning'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Housekeeping &amp; Laundry</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'cleaning' ? 'bg-teal-900 text-white' : 'bg-teal-100 text-teal-800'
            }`}>
              {cleaningServices.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* Selected Stay Banner (if active) */}
        {selectedStay && showAllStays && activeTab === 'rooms' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#064e3b] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-emerald-200">
                  Currently Booked Stay
                </span>
                <h3 className="font-bold text-sm text-white mt-0.5">
                  {selectedStay.title} ({selectedStay.city}) &bull; ₹{(selectedStay.monthlyRent || selectedStay.rentPerPerson || 0).toLocaleString('en-IN')}/mo
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllStays(false)}
                className="px-3.5 py-1.5 bg-white text-emerald-900 text-xs font-bold rounded-xl cursor-pointer"
              >
                Back to My Stay
              </button>
              <Link
                to="/dashboard"
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {selectionBannerMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <span>{selectionBannerMsg}</span>
            <button onClick={() => setSelectionBannerMsg('')} className="text-emerald-700 font-bold ml-2 cursor-pointer">✕</button>
          </div>
        )}

        {/* 3. TWO-COLUMN LAYOUT FOR FIND STAYS (Screen 2) */}
        {activeTab === 'rooms' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT FILTER SIDEBAR (HIDDEN ON MOBILE, VISIBLE ON LG) */}
            <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filters</span>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* City Selection */}
              <div className="space-y-1.5 pb-3 border-b border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  City / Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-bold bg-slate-50 cursor-pointer"
                >
                  <option value="All">🌐 All Cities (Pan-India)</option>
                  {allDiscoveredCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Property Type
                </label>
                <div className="space-y-1.5 text-xs font-medium text-slate-600">
                  {[
                    { label: 'All Stays', value: '' },
                    { label: 'Hostels', value: 'Hostel' },
                    { label: 'Paying Guest (PG)', value: 'PG' },
                    { label: 'Private Rooms', value: 'Room' },
                    { label: 'Flats & Apartments', value: 'Flat' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="sidebarPropertyType"
                        checked={propertyType === opt.value}
                        onChange={() => setPropertyType(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hostel / Gender Category */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Hostel Category
                </label>
                <div className="space-y-1.5 text-xs font-medium text-slate-600">
                  {[
                    { label: 'All Genders', value: '' },
                    { label: 'Boys Hostel', value: 'Boys Hostel' },
                    { label: 'Girls Hostel', value: 'Girls Hostel' },
                    { label: 'Co-ed / Coliving', value: 'Girls & Boys Hostel' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="sidebarHostelCategory"
                        checked={hostelCategory === opt.value}
                        onChange={() => setHostelCategory(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Max Budget
                </label>
                <div className="space-y-1.5 text-xs font-medium text-slate-600">
                  {[
                    { label: 'Any Budget', value: '' },
                    { label: 'Under ₹5,000 / mo', value: '5000' },
                    { label: 'Under ₹8,000 / mo', value: '8000' },
                    { label: 'Under ₹12,000 / mo', value: '12000' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="sidebarBudget"
                        checked={maxBudget === opt.value}
                        onChange={() => setMaxBudget(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sharing Style */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Room Sharing
                </label>
                <div className="space-y-1.5 text-xs font-medium text-slate-600">
                  {[
                    { label: 'All Room Sharing', value: '' },
                    { label: '1-Seater (Private)', value: '1-Seater Room' },
                    { label: '2-Seater (Double)', value: '2-Seater Room' },
                    { label: '3-Seater (Triple)', value: '3-Seater Room' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="sidebarRoomType"
                        checked={roomType === opt.value}
                        onChange={() => setRoomType(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Food Included Toggle */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodOnly}
                    onChange={(e) => setFoodOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Food / Mess Included Only</span>
                </label>
              </div>

            </aside>

            {/* RIGHT COLUMN: LISTINGS GRID */}
            <main className="lg:col-span-9 space-y-4">
              
              {/* Mobile Filter Trigger Button Bar */}
              <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-[#064e3b] font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer active:scale-95 transition-all shadow-2xs"
                >
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filter Stays</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  )}
                </button>
                <span className="text-xs text-slate-500 font-semibold">
                  {properties.length} Stays Available
                </span>
              </div>

              {/* Header Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    Showing <strong className="text-slate-900 font-bold">{properties.length}</strong> stays in{' '}
                    <strong className="text-emerald-800 font-bold">{city && city !== 'All' ? city : 'All Cities'}{areaSearch ? ` · ${areaSearch}` : ''}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  {/* Radius Filter */}
                  <select
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                    title="Search Radius"
                  >
                    <option value="">Radius: Any</option>
                    <option value="1">Within 1 km</option>
                    <option value="2">Within 2 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                    title="Sort Properties"
                  >
                    <option value="relevant">Sort: Relevant</option>
                    <option value="nearest">Nearest First</option>
                    <option value="lowest_rent">Lowest Rent</option>
                    <option value="highest_rated">Highest Rated</option>
                    <option value="recent">Recently Added</option>
                  </select>

                  {/* List / Map View Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>List View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'map' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Map View</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="py-20 text-center text-slate-400">
                  <span className="text-3xl animate-spin inline-block text-emerald-600 mb-2">↻</span>
                  <p className="text-xs font-bold text-slate-500">Finding verified stays...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <Home className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No properties found matching your criteria {city && city !== 'All' ? `in ${city}` : 'across cities'}.</p>
                  <p className="text-xs text-slate-500">Try adjusting your filters or search a nearby locality.</p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : viewMode === 'map' ? (
                <PropertiesMap
                  properties={properties}
                  activeTab="rooms"
                  selectedCity={city}
                  onInquire={handleSelectStay}
                  onSelectStay={handleSelectStay}
                  onViewDetails={(prop) => setDetailsProperty(prop)}
                  selectedStayId={selectedStay?._id}
                  searchRadius={searchRadius ? parseFloat(searchRadius) : null}
                  userCoords={userCoords ? [userCoords.lat, userCoords.lng] : null}
                  onUserCoordsChange={(c) => setUserCoords(c)}
                  onSearchArea={({ lat, lng }) => setUserCoords({ lat, lng })}
                  loading={loading}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map(p => (
                    <PropertyCard
                      key={p._id}
                      property={p}
                      onViewDetails={(prop) => setDetailsProperty(prop)}
                      onSelectStay={handleSelectStay}
                      onInquire={handleSelectStay}
                      isSelected={selectedStay?._id === p._id}
                      isShortlisted={!!shortlisted[p._id]}
                      onShortlist={() => dispatch(reduxToggleShortlist(p._id))}
                    />
                  ))}
                </div>
              )}

            </main>

            {/* Mobile Filter Drawer Modal */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
                <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
                  
                  {/* Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                      <Filter className="w-4 h-4 text-emerald-600" />
                      <span>Filter Stays</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-xs font-bold text-emerald-700 underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(false)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Filter Body */}
                  <div className="p-5 overflow-y-auto space-y-5 text-left">
                    {/* City Selection */}
                    <div className="space-y-1.5 pb-3 border-b border-slate-100">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        City / Location
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-bold bg-slate-50 cursor-pointer"
                      >
                        <option value="All">🌐 All Cities (Pan-India)</option>
                        {allDiscoveredCities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Property Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Property Type
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                        {[
                          { label: 'All Stays', value: '' },
                          { label: 'Hostels', value: 'Hostel' },
                          { label: 'Paying Guest (PG)', value: 'PG' },
                          { label: 'Private Rooms', value: 'Room' },
                          { label: 'Flats & Apartments', value: 'Flat' }
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                            propertyType === opt.value ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'border-slate-200'
                          }`}>
                            <input
                              type="radio"
                              name="mobilePropertyType"
                              checked={propertyType === opt.value}
                              onChange={() => setPropertyType(opt.value)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hostel / Gender Category */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Hostel Category
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                        {[
                          { label: 'All Genders', value: '' },
                          { label: 'Boys Hostel', value: 'Boys Hostel' },
                          { label: 'Girls Hostel', value: 'Girls Hostel' },
                          { label: 'Co-ed / Coliving', value: 'Girls & Boys Hostel' }
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                            hostelCategory === opt.value ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'border-slate-200'
                          }`}>
                            <input
                              type="radio"
                              name="mobileHostelCategory"
                              checked={hostelCategory === opt.value}
                              onChange={() => setHostelCategory(opt.value)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Max Budget
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                        {[
                          { label: 'Any Budget', value: '' },
                          { label: '< ₹5,000 / mo', value: '5000' },
                          { label: '< ₹8,000 / mo', value: '8000' },
                          { label: '< ₹12,000 / mo', value: '12000' }
                        ].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                            maxBudget === opt.value ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'border-slate-200'
                          }`}>
                            <input
                              type="radio"
                              name="mobileBudget"
                              checked={maxBudget === opt.value}
                              onChange={() => setMaxBudget(opt.value)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Food Included Toggle */}
                    <div className="pt-3 border-t border-slate-100">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={foodOnly}
                          onChange={(e) => setFoodOnly(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span>Food / Mess Included Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-md cursor-pointer"
                    >
                      Apply Filters ({properties.length} Stays)
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : activeTab === 'tiffin' ? (
          /* ======================================================== */
          /* 4. TIFFIN & MESS SERVICES (Matches Screen 4)              */
          /* ======================================================== */
          <div className="space-y-6">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700">
                Showing <strong className="text-slate-900 font-bold">{tiffinServices.length}</strong> tiffin &amp; mess kitchens in <strong className="text-emerald-800 font-bold">{city && city !== 'All' ? city : 'All Cities'}</strong>
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <span className="text-3xl animate-spin inline-block text-emerald-600 mb-2">↻</span>
                <p className="text-xs font-bold text-slate-500">Loading tiffin kitchens...</p>
              </div>
            ) : tiffinServices.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-2">
                <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No tiffin providers found {city && city !== 'All' ? `in ${city}` : 'across cities'}.</p>
                <p className="text-xs text-slate-500">Try switching cities or search another locality.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiffinServices.map(s => (
                  <ServiceCard
                    key={s._id}
                    service={s}
                    onBook={handleBookService}
                    onInquire={handleBookService}
                    onSelectService={handleBookService}
                    isSelected={selectedProviders.some(pr => (pr?._id || pr) === s._id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* 5. HOUSEKEEPING & CLEANING SERVICES (Matches Screen 5)   */
          /* ======================================================== */
          <div className="space-y-6">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700">
                Showing <strong className="text-slate-900 font-bold">{cleaningServices.length}</strong> room cleaning &amp; laundry providers in <strong className="text-emerald-800 font-bold">{city && city !== 'All' ? city : 'All Cities'}</strong>
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <span className="text-3xl animate-spin inline-block text-emerald-600 mb-2">↻</span>
                <p className="text-xs font-bold text-slate-500">Loading housekeeping agencies...</p>
              </div>
            ) : cleaningServices.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-2">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No cleaning agencies found {city && city !== 'All' ? `in ${city}` : 'across cities'}.</p>
                <p className="text-xs text-slate-500">Try switching cities or search another locality.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cleaningServices.map(s => (
                  <ServiceCard
                    key={s._id}
                    service={s}
                    onBook={handleBookService}
                    onInquire={handleBookService}
                    onSelectService={handleBookService}
                    isSelected={selectedProviders.some(pr => (pr?._id || pr) === s._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* STAY DETAILS MODAL (Matches Screen 3) */}
      {detailsProperty && (
        <StayDetailsModal
          property={detailsProperty}
          onClose={() => setDetailsProperty(null)}
          onBook={(prop) => {
            setDetailsProperty(null);
            handleSelectStay(prop);
          }}
        />
      )}

      {/* BED SELECTOR & 15-MINUTE HOLD MODAL */}
      {bedSelectorProperty && (
        <BedSelectorModal
          property={bedSelectorProperty}
          onClose={() => setBedSelectorProperty(null)}
          onBookingSuccess={(bookingData) => {
            setBedSelectorProperty(null);
            navigate('/dashboard?tab=requests');
          }}
        />
      )}

      {/* OFFICIAL BOOKING / INQUIRY MODAL */}
      {showInquiryModal && modalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Confirm Booking Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInquiryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {modalError}
              </div>
            )}

            {inquirySuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-900 text-sm">Request Submitted Successfully!</h4>
                <p className="text-xs text-slate-500">Host / Partner and Admin have been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selected Item
                  </label>
                  <input
                    type="text"
                    disabled
                    value={modalTarget.item.title || modalTarget.item.businessName}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proposed Monthly Price (₹)
                  </label>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message to Host / Partner
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="w-1/2 py-2.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingModal}
                    className="w-1/2 py-2.5 text-xs font-bold rounded-xl bg-[#059669] hover:bg-[#047857] text-white shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingModal ? 'Submitting...' : 'Send Booking Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EMAIL CONFIRMATION RECEIPT MODAL */}
      {emailModalData && (
        <EmailConfirmationModal
          isOpen={!!emailModalData}
          onClose={() => setEmailModalData(null)}
          bookingData={emailModalData}
          user={user}
          onGoToDashboard={() => {
            setEmailModalData(null);
            navigate('/dashboard');
          }}
        />
      )}

    </div>
  );
};

export default Marketplaces;
