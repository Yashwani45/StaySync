import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, servicesAPI, requestsAPI, paymentsAPI, reviewsAPI } from '../services/api';
import {
  Building2, Home, Hotel, BedDouble, Users, CheckCircle2, AlertCircle,
  ShieldCheck, DollarSign, Wallet, Star, Settings, LogOut, Edit3, Plus,
  Trash2, Eye, X, ChevronRight, ChevronDown, ChevronLeft, Calendar, Clock,
  Phone, Mail, MapPin, Utensils, Shirt, Sparkles, Filter, ArrowRight,
  RotateCcw, FileText, Check, Search, LayoutDashboard, ShieldAlert, Award,
  DoorClosed, Tag, CreditCard, TrendingUp, RefreshCw, UserCheck, Salad,
  Coffee, Truck, CheckSquare, ChefHat, Flame, Package, MoreVertical,
  Minus, SlidersHorizontal, CheckCircle
} from 'lucide-react';
import { getRoleBadgeLabel } from '../utils/roleHelper';

const POPULAR_CITIES = [
  'Indore', 'Bhopal', 'Kota', 'Pune', 'Bangalore', 'Mumbai',
  'Delhi', 'Jaipur', 'Hyderabad', 'Ujjain', 'Gwalior', 'Jabalpur',
  'Ahmedabad', 'Chandigarh', 'Lucknow'
];

const ProviderBusinessDashboard = ({ user }) => {
  const { logout, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Loading & Toast Notification States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Data States
  const [properties, setProperties] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settlementSummary, setSettlementSummary] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Modals States
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [selectedPropertyForEdit, setSelectedPropertyForEdit] = useState(null);
  const [showPropertyDetailsModal, setShowPropertyDetailsModal] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [deletePropertyConfirm, setDeletePropertyConfirm] = useState(null);

  // Dropdown menus states
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isBannerActionsOpen, setIsBannerActionsOpen] = useState(false);
  const navDropdownRef = useRef(null);
  const headerMenuRef = useRef(null);
  const bannerActionsRef = useRef(null);

  // Navigation Tab State (defaults to 'overview')
  const [activeTab, setActiveTab] = useState('overview');

  // Business Profile Edit Form State
  const [businessForm, setBusinessForm] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    phone: user?.phone || '',
    businessAddress: user?.businessAddress || '',
    city: user?.currentCity || 'Indore',
    state: user?.state || 'Madhya Pradesh',
    businessType: user?.businessType || '',
    profileImage: user?.profileImage || ''
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Menu Edit Form State for Tiffin Providers
  const [menuForm, setMenuForm] = useState({
    monthlyPrice: 2600,
    vegPrice: 90,
    isPureVeg: true,
    breakfast: 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
    lunch: 'Dal Tadka, Shahi Paneer, 4 Phulkas, Steamed Rice & Fresh Salad',
    dinner: 'Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis, Jeera Rice & Sweet Gulab Jamun',
    sundaySpecial: 'Special Royal Thali: Paneer Butter Masala, Chole Bhature, Pulao & Sweet Kheer'
  });

  // New Property Form State (for property owners)
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    propertyType: 'Hostel',
    hostelCategory: 'Boys Hostel',
    address: '',
    city: user?.currentCity || 'Indore',
    monthlyRent: 6500,
    securityDeposit: 6500,
    roomType: '2-Seater Room',
    totalBeds: 20,
    availableBeds: 8,
    amenities: ['Wifi', 'CCTV Security', 'RO Water', 'Power Backup'],
    photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']
  });

  // Filters State
  const [propertyFilter, setPropertyFilter] = useState('All');
  const [bookingFilter, setBookingFilter] = useState('All');

  const currentUserId = (user?._id || user?.id)?.toString();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target)) {
        setIsNavDropdownOpen(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setIsHeaderMenuOpen(false);
      }
      if (bannerActionsRef.current && !bannerActionsRef.current.contains(event.target)) {
        setIsBannerActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine provider business archetype accurately
  const isTiffinOnly = useMemo(() => {
    const role = (user?.role || '').toUpperCase();
    const pType = (user?.providerType || '').toLowerCase();
    const email = (user?.email || '').toLowerCase();
    if (role === 'TIFFIN_PROVIDER') return true;
    if (pType === 'tiffin') return true;
    if (email.includes('tiffin')) return true;
    if (services.length > 0 && services.every(s => s.category === 'Tiffin') && properties.length === 0) return true;
    if (role === 'PROVIDER' && pType !== 'cleaning' && properties.length === 0) return true;
    return false;
  }, [user, services, properties]);

  const isCleaningOnly = useMemo(() => {
    const role = (user?.role || '').toUpperCase();
    const pType = (user?.providerType || '').toLowerCase();
    if (role === 'CLEANING_LAUNDRY_PROVIDER') return true;
    if (pType === 'cleaning' || pType === 'laundry') return true;
    if (services.length > 0 && services.every(s => s.category === 'Cleaning' || s.category === 'Laundry') && properties.length === 0) return true;
    return false;
  }, [user, services, properties]);

  const isPropertyOwner = useMemo(() => {
    if (properties.length > 0) return true;
    const role = (user?.role || '').toUpperCase();
    return role === 'PROPERTY_OWNER' || role === 'HOSTEL_OWNER' || role === 'PG_OWNER' || role === 'ROOM_OWNER';
  }, [properties, user]);

  // Primary business name with fallback to ServiceProvider record
  const primaryBusinessName = useMemo(() => {
    if (user?.businessName && user.businessName.trim() !== '') return user.businessName;
    if (services[0]?.businessName) return services[0].businessName;
    if (user?.email?.toLowerCase().includes('tiffin') || user?.role === 'TIFFIN_PROVIDER') {
      return 'Shree Ganesh Pure Desi Tiffin Services';
    }
    if (isTiffinOnly) return `${user?.name || 'Tiffin'}'s Kitchen & Catering`;
    if (isCleaningOnly) return `${user?.name || 'Cleaning'}'s Housekeeping & Laundry`;
    return `${user?.name || 'Partner'}'s Business Workspace`;
  }, [user, services, isTiffinOnly, isCleaningOnly]);

  const primaryBusinessAddress = useMemo(() => {
    if (user?.businessAddress && user.businessAddress.trim() !== '') return user.businessAddress;
    if (services[0]?.address) return services[0].address;
    if (user?.email?.toLowerCase().includes('tiffin') || user?.role === 'TIFFIN_PROVIDER') {
      return '18, Sarwate Bus Stand Road, Near Railway Station';
    }
    return `Prime Commercial Area, ${user?.currentCity || 'Indore'}`;
  }, [user, services]);

  const primaryTiffinService = useMemo(() => {
    return services.find(s => s.category === 'Tiffin') || services[0];
  }, [services]);

  // Sync menu form with loaded tiffin service
  useEffect(() => {
    if (primaryTiffinService?.tiffinDetails) {
      const td = primaryTiffinService.tiffinDetails;
      setMenuForm({
        monthlyPrice: td.monthlyPrice || primaryTiffinService.monthlyPrice || 2600,
        vegPrice: td.vegPrice || 90,
        isPureVeg: td.isPureVeg !== false,
        breakfast: td.breakfast || 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
        lunch: td.lunch || 'Dal Tadka, Shahi Paneer, 4 Phulkas, Steamed Rice & Fresh Salad',
        dinner: td.dinner || 'Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis, Jeera Rice & Sweet Gulab Jamun',
        sundaySpecial: td.sundaySpecial || 'Special Royal Thali: Paneer Butter Masala, Chole Bhature, Pulao & Sweet Kheer'
      });
    }
  }, [primaryTiffinService]);

  // Sync business form when user or services change
  useEffect(() => {
    if (user) {
      setBusinessForm({
        name: user.name || '',
        businessName: primaryBusinessName,
        phone: user.phone || '',
        businessAddress: primaryBusinessAddress,
        city: user.currentCity || services[0]?.city || 'Indore',
        state: user.state || 'Madhya Pradesh',
        businessType: user.businessType || (isTiffinOnly ? 'Tiffin & Meal Catering' : isCleaningOnly ? 'Cleaning & Laundry' : 'Hostel & PG Operator'),
        profileImage: user.profileImage || services[0]?.photoUrl || services[0]?.photos?.[0] || ''
      });
    }
  }, [user, primaryBusinessName, primaryBusinessAddress, isTiffinOnly, isCleaningOnly, services]);

  // Load Provider Data
  const loadProviderData = async () => {
    if (!currentUserId) return;
    try {
      setRefreshing(true);

      // 1. Fetch Properties (if any)
      const propRes = await propertiesAPI.getProperties({ owner: currentUserId });
      const userProperties = (propRes.success && Array.isArray(propRes.data))
        ? propRes.data.filter(p => (p.owner?._id || p.owner)?.toString() === currentUserId)
        : [];
      setProperties(userProperties);

      // 2. Fetch Services offered by this provider
      let userServices = [];
      try {
        const servRes = await servicesAPI.getServices({ user: currentUserId });
        userServices = (servRes.success && Array.isArray(servRes.data))
          ? servRes.data.filter(s => (s.user?._id || s.user)?.toString() === currentUserId)
          : [];
        setServices(userServices);
      } catch (e) {
        console.warn('Error loading services:', e.message);
      }

      // 3. Fetch Bookings / Inquiries
      try {
        const reqRes = await requestsAPI.getRequests();
        const incomingBookings = (reqRes.success && Array.isArray(reqRes.data)) ? reqRes.data : [];
        setBookings(incomingBookings);
      } catch (e) {
        console.warn('Error loading bookings:', e.message);
      }

      // 4. Fetch Settlements & Payments
      try {
        const settRes = await paymentsAPI.getOwnerSettlements();
        if (settRes.success && settRes.summary) {
          setSettlementSummary(settRes.summary);
        }
      } catch (e) {
        console.warn('Settlements API notice:', e.message);
      }

      try {
        const payRes = await paymentsAPI.getHistory();
        if (payRes.success && Array.isArray(payRes.data)) {
          setPaymentHistory(payRes.data);
        }
      } catch (e) {
        console.warn('Payment history notice:', e.message);
      }

      // 5. Fetch Genuine Reviews (for properties OR services)
      const targetIds = [
        ...userProperties.map(p => p._id),
        ...userServices.map(s => s._id)
      ].join(',');

      if (targetIds) {
        try {
          const revRes = await reviewsAPI.getReviews(targetIds);
          if (revRes.success && Array.isArray(revRes.data)) {
            setReviews(revRes.data);
          }
        } catch (e) {
          console.warn('Reviews notice:', e.message);
        }
      }

    } catch (err) {
      console.error('Error loading provider business dashboard:', err);
      showToast('Failed to load some dashboard records.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, [currentUserId]);

  // Derived Business Statistics
  const stats = useMemo(() => {
    const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;
    const acceptedSubscribersCount = bookings.filter(b => b.status === 'Accepted' || b.status === 'Completed').length;
    
    const recordedCaptured = paymentHistory
      .filter(p => p.status === 'Captured')
      .reduce((sum, p) => sum + p.amount, 0);

    const subscriptionOrderVolume = bookings
      .filter(b => b.status === 'Accepted' || b.status === 'Completed' || b.status === 'Pending')
      .reduce((sum, b) => sum + (b.proposedPrice || b.pricingDetails?.totalAmount || 0), 0);

    const totalRevenue = recordedCaptured > 0 ? recordedCaptured : subscriptionOrderVolume;
    const netRevenue = Math.round(totalRevenue * 0.95);

    const tiffinServicesCount = services.filter(s => s.category === 'Tiffin').length || (isTiffinOnly ? 1 : 0);
    const serviceRadius = primaryTiffinService?.serviceRadius || 8;
    const mealsOfferedCount = primaryTiffinService?.tiffinDetails?.meals?.length || 4;

    const totalProperties = properties.length;
    const totalRooms = properties.reduce((acc, p) => acc + (p.roomTiers?.length || 1), 0);
    const totalBeds = properties.reduce((acc, p) => acc + (p.totalBeds || 1), 0);
    const availableBeds = properties.reduce((acc, p) => acc + (p.availableBeds !== undefined ? p.availableBeds : 0), 0);
    const occupiedBeds = Math.max(0, totalBeds - availableBeds);
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      pendingBookingsCount,
      acceptedSubscribersCount,
      totalRevenue,
      netRevenue,
      totalOrdersCount: bookings.length,
      tiffinServicesCount,
      serviceRadius,
      mealsOfferedCount,
      totalProperties,
      totalRooms,
      totalBeds,
      availableBeds,
      occupiedBeds,
      occupancyRate
    };
  }, [properties, bookings, services, paymentHistory, isTiffinOnly, primaryTiffinService]);

  // Handlers for Business Profile Update
  const handleSaveBusinessProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: businessForm.name,
        businessName: businessForm.businessName,
        phone: businessForm.phone,
        businessAddress: businessForm.businessAddress,
        currentCity: businessForm.city,
        state: businessForm.state,
        businessType: businessForm.businessType,
        profileImage: businessForm.profileImage
      });
      if (refreshProfile) await refreshProfile();
      setShowEditBusinessModal(false);
      showToast('Business Profile updated successfully!');
      loadProviderData();
    } catch (err) {
      showToast(err.message || 'Failed to update business profile', 'error');
    }
  };

  // Handlers for Tiffin Menu Update
  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!primaryTiffinService) {
      showToast('No active tiffin service listing found to update', 'error');
      return;
    }

    try {
      await servicesAPI.updateService(primaryTiffinService._id, {
        monthlyPrice: Number(menuForm.monthlyPrice),
        tiffinDetails: {
          ...primaryTiffinService.tiffinDetails,
          monthlyPrice: Number(menuForm.monthlyPrice),
          vegPrice: Number(menuForm.vegPrice),
          isPureVeg: menuForm.isPureVeg,
          breakfast: menuForm.breakfast,
          lunch: menuForm.lunch,
          dinner: menuForm.dinner,
          sundaySpecial: menuForm.sundaySpecial
        }
      });
      showToast('Daily Tiffin Menu & Pricing updated successfully!');
      setShowEditMenuModal(false);
      loadProviderData();
    } catch (err) {
      showToast(err.message || 'Failed to update menu', 'error');
    }
  };

  // Handlers for Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      await updateProfile({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handlers for Bookings Status Management
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const res = await requestsAPI.updateRequestStatus(bookingId, { status });
      if (res.success) {
        showToast(`Subscription marked as ${status}!`);
        loadProviderData();
      }
    } catch (err) {
      showToast(err.message || `Failed to update status to ${status}`, 'error');
    }
  };

  // Handlers for Services Availability Toggle
  const handleToggleServiceAvailability = async (service) => {
    try {
      const nextStatus = !service.isAvailable;
      await servicesAPI.updateService(service._id, { isAvailable: nextStatus });
      showToast(`${service.businessName} is now ${nextStatus ? 'Open for Orders' : 'Paused'}`);
      setServices(prev => prev.map(s => s._id === service._id ? { ...s, isAvailable: nextStatus } : s));
    } catch (err) {
      showToast(err.message || 'Failed to update service availability', 'error');
    }
  };

  // Property Handlers (for Property Owners)
  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const res = await propertiesAPI.createProperty(newProperty);
      if (res.success) {
        showToast('New Property listed successfully!');
        setShowAddPropertyModal(false);
        loadProviderData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create property', 'error');
    }
  };

  const handleUpdateVacancy = async (propertyId, newAvailableBeds) => {
    try {
      const targetBeds = Math.max(0, newAvailableBeds);
      await propertiesAPI.updateProperty(propertyId, { availableBeds: targetBeds });
      setProperties(prev => prev.map(p => p._id === propertyId ? { ...p, availableBeds: targetBeds } : p));
      showToast('Vacancy updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update vacancy', 'error');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await propertiesAPI.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p._id !== propertyId));
      setDeletePropertyConfirm(null);
      showToast('Property deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete property', 'error');
    }
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'All') return bookings;
    return bookings.filter(b => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  // Determine navigation tabs based on business archetype
  const navigationTabs = useMemo(() => {
    if (isTiffinOnly) {
      return [
        { id: 'overview', label: 'Tiffin Hub Overview', icon: LayoutDashboard },
        { id: 'profile', label: 'Kitchen & Commercial Info', icon: Building2 },
        { id: 'tiffin-menu', label: 'Tiffin Menus & Plans', icon: Utensils, count: services.length },
        { id: 'bookings', label: 'Meal Subscriptions', icon: Calendar, count: stats.pendingBookingsCount, countColor: 'bg-amber-500 text-white' },
        { id: 'kitchen-shift', label: 'Daily Delivery Shift', icon: Clock },
        { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet },
        { id: 'reviews', label: 'Customer Reviews', icon: Star, count: reviews.length },
        { id: 'settings', label: 'Kitchen Settings', icon: Settings }
      ];
    }

    if (isCleaningOnly) {
      return [
        { id: 'overview', label: 'Cleaning Hub Overview', icon: LayoutDashboard },
        { id: 'profile', label: 'Business Profile', icon: Building2 },
        { id: 'services', label: 'Service Packages', icon: Sparkles, count: services.length },
        { id: 'bookings', label: 'Service Orders', icon: Calendar, count: stats.pendingBookingsCount, countColor: 'bg-amber-500 text-white' },
        { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet },
        { id: 'reviews', label: 'Customer Reviews', icon: Star, count: reviews.length },
        { id: 'settings', label: 'Business Settings', icon: Settings }
      ];
    }

    // Default: Accommodation & Property Owners
    return [
      { id: 'overview', label: 'Business Overview', icon: LayoutDashboard },
      { id: 'profile', label: 'Business Profile', icon: Building2 },
      { id: 'properties', label: 'My Properties', icon: Home, count: properties.length },
      { id: 'vacancies', label: 'Vacancies', icon: BedDouble, badge: `${stats.occupancyRate}%` },
      { id: 'bookings', label: 'Bookings', icon: Calendar, count: stats.pendingBookingsCount, countColor: 'bg-amber-500 text-white' },
      { id: 'services', label: 'Services Offered', icon: Sparkles, count: services.length },
      { id: 'earnings', label: 'Earnings', icon: Wallet },
      { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
      { id: 'settings', label: 'Business Settings', icon: Settings }
    ];
  }, [isTiffinOnly, isCleaningOnly, services.length, properties.length, stats.pendingBookingsCount, stats.occupancyRate, reviews.length]);

  // Tab index helpers for dropdown & stepper
  const currentTabIndex = navigationTabs.findIndex(t => t.id === activeTab);
  const currentTabObject = navigationTabs[currentTabIndex >= 0 ? currentTabIndex : 0];
  const CurrentIcon = currentTabObject?.icon || LayoutDashboard;

  const goToPrevTab = () => {
    const prevIndex = currentTabIndex > 0 ? currentTabIndex - 1 : navigationTabs.length - 1;
    setActiveTab(navigationTabs[prevIndex].id);
  };

  const goToNextTab = () => {
    const nextIndex = currentTabIndex < navigationTabs.length - 1 ? currentTabIndex + 1 : 0;
    setActiveTab(navigationTabs[nextIndex].id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#064e3b] animate-spin flex items-center justify-center text-white">
          <ChefHat className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700">Loading StaySync Business Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans pb-16">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs sm:text-sm font-bold ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-100'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-100'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOP COMMAND BAR: BUSINESS IDENTITY & DROPDOWN ACTIONS     */}
      {/* ======================================================== */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Business Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#064e3b] to-emerald-700 p-0.5 shadow-md shadow-emerald-900/10 shrink-0">
              <img
                src={user?.profileImage || services[0]?.photoUrl || services[0]?.photos?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200'}
                alt={primaryBusinessName}
                className="w-full h-full rounded-[14px] object-cover bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  {primaryBusinessName}
                </h1>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isTiffinOnly ? 'Verified Tiffin Partner' : isCleaningOnly ? 'Verified Cleaning Partner' : 'Verified Provider'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{getRoleBadgeLabel(user)}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {user?.currentCity || services[0]?.city || 'Indore'}, {user?.state || 'MP'}
                </span>
                {isTiffinOnly && (
                  <>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <Truck className="w-3 h-3" />
                      {stats.serviceRadius} km Delivery Reach
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Header Actions Menu (Dropdown instead of multiple buttons) */}
          <div className="relative flex items-center gap-2.5 self-end sm:self-auto" ref={headerMenuRef}>
            
            {/* Quick Refresh Button */}
            <button
              onClick={loadProviderData}
              disabled={refreshing}
              title="Refresh Dashboard Data"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-emerald-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Workspace Actions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHeaderMenuOpen(prev => !prev)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                aria-haspopup="true"
                aria-expanded={isHeaderMenuOpen}
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Workspace Options</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isHeaderMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isHeaderMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Account Session</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      loadProviderData();
                      setIsHeaderMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sync &amp; Refresh Data</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowEditBusinessModal(true);
                      setIsHeaderMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Commercial Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsHeaderMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Security &amp; Password</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setIsHeaderMenuOpen(false);
                      setShowConfirmLogout(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* DROPDOWN NAVIGATION SELECTOR (No multiple buttons strip)  */}
        {/* ======================================================== */}
        <div className="bg-slate-50/80 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            
            {/* Main Section Dropdown Menu */}
            <div className="relative inline-block text-left w-full sm:w-auto" ref={navDropdownRef}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline shrink-0">
                  Dashboard Section:
                </span>

                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsNavDropdownOpen(prev => !prev)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-black text-slate-900 transition-all shadow-xs cursor-pointer min-w-[240px] sm:min-w-[290px]"
                  aria-haspopup="true"
                  aria-expanded={isNavDropdownOpen}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded-lg bg-[#064e3b] text-white flex items-center justify-center shrink-0">
                      <CurrentIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{currentTabObject?.label}</span>
                    {currentTabObject?.count !== undefined && currentTabObject.count > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${currentTabObject.countColor || 'bg-emerald-100 text-emerald-800'}`}>
                        {currentTabObject.count}
                      </span>
                    )}
                    {currentTabObject?.badge && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {currentTabObject.badge}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isNavDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Quick Prev / Next Step Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={goToPrevTab}
                    title="Previous Section"
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={goToNextTab}
                    title="Next Section"
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dropdown Options Panel */}
              {isNavDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-40 animate-fadeIn">
                  <div className="px-3.5 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Select Dashboard View
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1 scrollbar-thin">
                    {navigationTabs.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsNavDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left text-xs font-bold flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-900 font-black'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-[#064e3b] text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{tab.label}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {tab.count !== undefined && tab.count > 0 && (
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                tab.countColor || 'bg-slate-200 text-slate-700'
                              }`}>
                                {tab.count}
                              </span>
                            )}
                            {tab.badge && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {tab.badge}
                              </span>
                            )}
                            {isActive && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Active Section Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isTiffinOnly ? 'Tiffin Service Live' : 'Provider Active'}</span>
              <span>&bull;</span>
              <span className="text-slate-800 font-extrabold">{currentTabObject?.label}</span>
            </div>

          </div>
        </div>

      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ======================================================== */}
        {/* TAB 1: BUSINESS OVERVIEW (Role Adaptive)                 */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* KPI METRIC CARDS FOR TIFFIN PROVIDER */}
            {isTiffinOnly ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {/* Active Tiffin Center */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Kitchens</span>
                    <ChefHat className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.tiffinServicesCount}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Active Kitchen</span>
                </div>

                {/* Active Meal Subscribers */}
                <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Subscribers</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-800">{stats.acceptedSubscribersCount}</div>
                  <span className="text-[11px] text-emerald-700 font-medium">Daily Meal Plans</span>
                </div>

                {/* Daily Meal Slots */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Meal Slots</span>
                    <Utensils className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.mealsOfferedCount} Shifts</div>
                  <span className="text-[11px] text-slate-500 font-medium">Breakfast, Lunch, Dinner</span>
                </div>

                {/* Delivery Radius */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Doorstep Reach</span>
                    <Truck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.serviceRadius} km</div>
                  <span className="text-[11px] text-slate-500 font-medium">Hostels &amp; IT Hubs</span>
                </div>

                {/* Inquiries */}
                <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Orders</span>
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-800">{stats.totalOrdersCount}</div>
                  <span className="text-[11px] text-amber-700 font-medium">Total Inquiries</span>
                </div>

                {/* Monthly Volume */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Volume</span>
                    <DollarSign className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Active Bookings</span>
                </div>

              </div>
            ) : (
              /* KPI METRIC CARDS FOR PROPERTY OWNERS */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Properties</span>
                    <Building2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalProperties}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Active Listings</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Beds</span>
                    <DoorClosed className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalBeds}</div>
                  <span className="text-[11px] text-slate-500 font-medium">{stats.totalRooms} Room Units</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Available Beds</span>
                    <BedDouble className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-800">{stats.availableBeds}</div>
                  <span className="text-[11px] text-emerald-700 font-medium">Ready for check-in</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Occupancy</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.occupancyRate}%</div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all" 
                      style={{ width: `${stats.occupancyRate}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Inquiries</span>
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-800">{stats.pendingBookingsCount}</div>
                  <span className="text-[11px] text-amber-700 font-medium">Action Required</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Revenue</span>
                    <DollarSign className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Gross Bookings</span>
                </div>
              </div>
            )}

            {/* ACTION BANNER (Role Adaptive with Dropdown Actions) */}
            <div className="bg-gradient-to-r from-[#064e3b] via-emerald-800 to-teal-800 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                  {isTiffinOnly ? 'Tiffin & Meal Hub' : 'StaySync Command Hub'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isTiffinOnly 
                    ? `Welcome to ${primaryBusinessName}`
                    : 'Welcome to Your Business Workspace'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                  {isTiffinOnly
                    ? 'Manage daily lunch & dinner meal preparation, update weekly menus, track active student subscriptions, and manage doorstep delivery schedules.'
                    : 'Easily update room vacancy, review tenant booking requests, manage meal & tiffin services, and track your settlements in real time.'}
                </p>
              </div>

              {/* Action Dropdown Menu in Banner (Replaces multiple scattered buttons) */}
              <div className="relative" ref={bannerActionsRef}>
                <button
                  type="button"
                  onClick={() => setIsBannerActionsOpen(prev => !prev)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-emerald-950 hover:bg-emerald-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  aria-haspopup="true"
                  aria-expanded={isBannerActionsOpen}
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Quick Actions</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${isBannerActionsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isBannerActionsOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-1.5 z-40 text-slate-800 animate-fadeIn">
                    {isTiffinOnly ? (
                      <>
                        <button
                          onClick={() => {
                            setShowEditMenuModal(true);
                            setIsBannerActionsOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-slate-700"
                        >
                          <Utensils className="w-4 h-4 text-emerald-700" />
                          <span>Update Daily Menu</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('bookings');
                            setIsBannerActionsOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-slate-700"
                        >
                          <Package className="w-4 h-4 text-indigo-600" />
                          <span>View Subscriptions ({bookings.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('kitchen-shift');
                            setIsBannerActionsOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-slate-700"
                        >
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span>Check Delivery Shifts</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowEditBusinessModal(true);
                            setIsBannerActionsOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-slate-700"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                          <span>Edit Kitchen Address</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowAddPropertyModal(true);
                            setIsBannerActionsOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-slate-700"
                        >
                          <Plus className="w-4 h-4 text-emerald-700" />
                          <span>Add New Property</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('vacancies');
                            setIsBannerActionsOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-slate-700"
                        >
                          <BedDouble className="w-4 h-4 text-indigo-600" />
                          <span>Manage Vacancies</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('bookings');
                            setIsBannerActionsOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-slate-700"
                        >
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span>Review Inquiries ({bookings.length})</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* TWO COLUMN GRID: ORDERS & ROLE-SPECIFIC RIGHT WIDGET */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Recent Customer Orders / Subscriptions (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      {isTiffinOnly ? 'Active Subscriptions & Meal Orders' : 'Recent Customer Inquiries & Bookings'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {isTiffinOnly ? 'Verified student & resident subscriptions with delivery addresses' : 'Direct requests from verified residents across StaySync'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({bookings.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      {isTiffinOnly ? 'No meal subscriptions received yet.' : 'No booking requests received yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 4).map(b => (
                      <div
                        key={b._id}
                        className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={b.sender?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={b.sender?.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{b.sender?.name || 'Verified Resident'}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                b.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                b.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              Plan: <strong className="text-slate-800">{b.itemId?.title || b.itemId?.businessName || 'Tiffin Plan'}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                              &ldquo;{b.message || 'Doorstep delivery meal subscription'}&rdquo;
                            </p>
                            <span className="text-[11px] text-slate-400 block pt-0.5">
                              ₹{b.proposedPrice || b.pricingDetails?.totalAmount || 0} &bull; {new Date(b.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {b.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'Accepted')}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'Rejected')}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedBookingDetails(b); setShowBookingDetailsModal(true); }}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: ROLE-ADAPTIVE RIGHT WIDGET (5 cols) */}
              {isTiffinOnly ? (
                /* TIFFIN MENU & KITCHEN SCHEDULE SNAPSHOT */
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-emerald-700" />
                        Today's Tiffin &amp; Meal Menu
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Active meals served from your kitchen</p>
                    </div>
                    <button
                      onClick={() => setShowEditMenuModal(true)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Menu</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Breakfast */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs font-black text-amber-800">
                        <span className="flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5" /> Breakfast (07:30 - 09:30 AM)
                        </span>
                        <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">Morning</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{menuForm.breakfast}</p>
                    </div>

                    {/* Lunch */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <ChefHat className="w-3.5 h-3.5" /> Lunch (12:30 - 02:30 PM)
                        </span>
                        <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">Afternoon</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{menuForm.lunch}</p>
                    </div>

                    {/* Dinner */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs font-black text-indigo-800">
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" /> Dinner (07:30 - 09:30 PM)
                        </span>
                        <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded-full">Evening</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{menuForm.dinner}</p>
                    </div>

                    {/* Sunday Special */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs font-black text-purple-800">
                        <span className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> Sunday Special Thali
                        </span>
                        <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded-full">Weekly Feast</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{menuForm.sundaySpecial}</p>
                    </div>

                    {/* Price and Veg status summary */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {menuForm.isPureVeg ? '100% Pure Vegetarian' : 'Veg & Non-Veg'}
                      </span>
                      <span className="text-slate-900 font-black">
                        ₹{menuForm.monthlyPrice} / Month
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ACCOMMODATION PROPERTY SNAPSHOT */
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Home className="w-4 h-4 text-emerald-700" />
                        Property Vacancy Snapshot
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Live status across your accommodations</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('properties')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {properties.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500">No properties listed yet.</p>
                      <button
                        onClick={() => setShowAddPropertyModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#064e3b] text-white cursor-pointer"
                      >
                        + Add First Property
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {properties.slice(0, 3).map(p => (
                        <div key={p._id} className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate max-w-[200px]">{p.title}</h4>
                            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ₹{p.rentPerPerson || p.monthlyRent}/mo
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{p.propertyType} &bull; {p.city}</span>
                            <span className="font-bold text-slate-700">
                              {p.availableBeds} / {p.totalBeds} Beds Open
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${Math.round(((p.totalBeds - p.availableBeds) / (p.totalBeds || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BUSINESS PROFILE (Commercial Credentials)         */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isTiffinOnly ? 'Kitchen & Commercial Profile' : 'Business Profile'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isTiffinOnly ? 'Verified food catering, kitchen location, and delivery credentials' : 'Public commercial and verified enterprise credentials'}
                </p>
              </div>
              <button
                onClick={() => setShowEditBusinessModal(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#064e3b] hover:bg-[#043d2e] text-white transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Business Information</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-4 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-slate-150 pb-6 md:pb-0 md:pr-6">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 p-1 border-2 border-emerald-500 shadow-md shadow-emerald-900/10">
                  <img
                    src={user?.profileImage || services[0]?.photoUrl || services[0]?.photos?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300'}
                    alt={primaryBusinessName}
                    className="w-full h-full rounded-[20px] object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {primaryBusinessName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Owner: <strong className="text-slate-800">{user?.name}</strong>
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isTiffinOnly ? 'Certified Food Partner' : 'Verified Commercial Partner'}</span>
                </div>
              </div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Registered Email</span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user?.email}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Authorized Partner Email</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contact Number</span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user?.phone || 'Not provided'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Direct Customer Helpline</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {isTiffinOnly ? 'Kitchen Address' : 'Business Address'}
                  </span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{primaryBusinessAddress}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block">{user?.currentCity || 'Indore'}, {user?.state || 'Madhya Pradesh'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Commercial Category</span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isTiffinOnly ? 'Tiffin & Daily Meal Catering' : getRoleBadgeLabel(user)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Active &amp; Operational</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Delivery Radius</span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{stats.serviceRadius} km doorstep delivery</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Hostel / PG &amp; Office drop-offs</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Registration Date</span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified Founding Partner'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block">StaySync Certified Partner</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TIFFIN MENUS & PLANS (For Tiffin Providers)      */}
        {/* ======================================================== */}
        {activeTab === 'tiffin-menu' && isTiffinOnly && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Tiffin Menus &amp; Subscription Plans</h2>
                <p className="text-xs text-slate-500 font-medium">Daily breakfast, lunch, dinner dishes and pricing plans for students &amp; professionals</p>
              </div>

              <button
                onClick={() => setShowEditMenuModal(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#064e3b] hover:bg-[#043d2e] text-white transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Dishes &amp; Pricing</span>
              </button>
            </div>

            {/* Price Plans Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Double Meal Plan</span>
                <div className="text-2xl font-black text-emerald-800">₹{menuForm.monthlyPrice} <span className="text-xs text-slate-400 font-medium">/ month</span></div>
                <p className="text-xs text-slate-500">Includes Lunch + Dinner (30 days delivery)</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Single Meal Token</span>
                <div className="text-2xl font-black text-slate-900">₹{menuForm.vegPrice} <span className="text-xs text-slate-400 font-medium">/ thali</span></div>
                <p className="text-xs text-slate-500">Pay-as-you-go single meal order</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Diet Category</span>
                <div className="text-2xl font-black text-emerald-700">{menuForm.isPureVeg ? 'Pure Veg' : 'Veg / Non-Veg'}</div>
                <p className="text-xs text-slate-500">Cooked in pure groundnut / mustard oil &amp; desi ghee</p>
              </div>
            </div>

            {/* Menu Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    Morning Breakfast Menu
                  </h3>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    07:30 - 09:30 AM
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{menuForm.breakfast}</p>
                <div className="pt-2 text-[11px] text-slate-400">Delivered hot in thermal foil packs with cutlery.</div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-emerald-700" />
                    Afternoon Lunch Menu
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    12:30 - 02:30 PM
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{menuForm.lunch}</p>
                <div className="pt-2 text-[11px] text-slate-400">Standard 4-tier steel or sealed leakproof boxes.</div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-indigo-700" />
                    Evening Dinner Menu
                  </h3>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    07:30 - 09:30 PM
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{menuForm.dinner}</p>
                <div className="pt-2 text-[11px] text-slate-400">Freshly cooked evening meals before 07:00 PM.</div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-700" />
                    Sunday Special Royal Feast
                  </h3>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    Sunday Special
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{menuForm.sundaySpecial}</p>
                <div className="pt-2 text-[11px] text-slate-400">Includes sweet dessert and special festive curry.</div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DAILY KITCHEN SHIFT & DELIVERY (Tiffin)           */}
        {/* ======================================================== */}
        {activeTab === 'kitchen-shift' && isTiffinOnly && (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Daily Kitchen Shift &amp; Delivery Schedule</h2>
              <p className="text-xs text-slate-500 font-medium">Real-time dispatch status for breakfast, lunch, and dinner batches</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" /> Morning Shift
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Completed
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Window:</strong> 07:30 AM – 09:30 AM</div>
                  <div><strong>Focus:</strong> College &amp; Early Office Students</div>
                  <div><strong>Route:</strong> Sarwate &bull; Bhawarkua &bull; Geeta Bhawan</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-emerald-600" /> Lunch Shift
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                    Active Delivery
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Window:</strong> 12:30 PM – 02:30 PM</div>
                  <div><strong>Focus:</strong> Hostel Mess &amp; Direct Drop-offs</div>
                  <div><strong>Route:</strong> Vijay Nagar &bull; Knowledge Park &bull; Scheme 54</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-indigo-600" /> Dinner Shift
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Prep at 05:30 PM
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Window:</strong> 07:30 PM – 09:30 PM</div>
                  <div><strong>Focus:</strong> Resident Rooms &amp; PGs</div>
                  <div><strong>Route:</strong> All Registered Hostel Points</div>
                </div>
              </div>

            </div>

            {/* Delivery Points Summary */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">Registered Delivery Hubs in {user?.currentCity || 'Indore'}</h3>
              <p className="text-xs text-slate-500">Delivery riders dispatch daily to student hubs within your 8 km radius.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {['Chouksey Boys Hostel', 'Sunrise PG Vijay Nagar', 'Sarwate Hub', 'Bhawarkua Coaching Hub'].map(pt => (
                  <div key={pt} className="p-3 rounded-2xl bg-slate-50 border border-slate-150 text-xs font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PROPERTIES & ACCOMMODATION LISTINGS               */}
        {/* ======================================================== */}
        {activeTab === 'properties' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">My Properties &amp; Listings</h2>
                <p className="text-xs text-slate-500 font-medium">Manage student hostels, PGs, and rental room accommodations</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Property Types</option>
                  <option value="Hostel">Hostels</option>
                  <option value="PG">PGs</option>
                  <option value="Room">Rooms / Flats</option>
                </select>

                <button
                  onClick={() => setShowAddPropertyModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#064e3b] hover:bg-[#043d2e] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Property</span>
                </button>
              </div>
            </div>

            {properties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900">No properties listed under this account</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    List your first hostel, PG, or student flat to receive verified tenant booking inquiries.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPropertyModal(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#064e3b] text-white hover:bg-[#043d2e] cursor-pointer"
                >
                  + Add New Property Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties
                  .filter(p => propertyFilter === 'All' || p.propertyType === propertyFilter)
                  .map(prop => (
                    <div key={prop._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div>
                        <div className="relative h-44 bg-slate-100">
                          <img
                            src={prop.photos?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                              {prop.propertyType}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
                              {prop.hostelCategory || 'Student Stay'}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-xs font-black px-2.5 py-1 rounded-lg">
                            ₹{prop.rentPerPerson || prop.monthlyRent}/mo
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="font-black text-base text-slate-900 line-clamp-1">{prop.title}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{prop.address}, {prop.city}</span>
                            </p>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-700">
                              <span>Bed Vacancy:</span>
                              <span className="text-emerald-700 font-black">{prop.availableBeds} / {prop.totalBeds} Available</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full"
                                style={{ width: `${Math.round(((prop.totalBeds - prop.availableBeds) / (prop.totalBeds || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateVacancy(prop._id, (prop.availableBeds || 0) - 1)}
                            title="Decrease Available Bed"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-800 px-1">{prop.availableBeds}</span>
                          <button
                            onClick={() => handleUpdateVacancy(prop._id, (prop.availableBeds || 0) + 1)}
                            title="Increase Available Bed"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedPropertyDetails(prop);
                              setShowPropertyDetailsModal(true);
                            }}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                            title="View Property"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPropertyForEdit(prop);
                              setShowEditPropertyModal(true);
                            }}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                            title="Edit Property"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletePropertyConfirm(prop)}
                            className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600"
                            title="Delete Property"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: VACANCY & BED OCCUPANCY MANAGEMENT                */}
        {/* ======================================================== */}
        {activeTab === 'vacancies' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Vacancy &amp; Occupancy Overview</h2>
              <p className="text-xs text-slate-500 font-medium">Real-time room inventory, bed reservations, and occupancy rates</p>
            </div>

            {/* Occupancy Summary KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Beds</span>
                <div className="text-3xl font-black text-slate-900">{stats.totalBeds}</div>
                <span className="text-xs text-slate-500 font-medium">{stats.totalRooms} Room units</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Available Beds</span>
                <div className="text-3xl font-black text-emerald-800">{stats.availableBeds}</div>
                <span className="text-xs text-emerald-700 font-medium">Instant check-in</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Occupied Beds</span>
                <div className="text-3xl font-black text-indigo-700">{stats.occupiedBeds}</div>
                <span className="text-xs text-slate-500 font-medium">Active residents</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Overall Occupancy</span>
                <div className="text-3xl font-black text-purple-700">{stats.occupancyRate}%</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${stats.occupancyRate}%` }} />
                </div>
              </div>
            </div>

            {/* Property Bed Vacancy Management Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                <h3 className="font-extrabold text-base text-slate-900">Bed Vacancy by Accommodation</h3>
                <span className="text-xs text-slate-500 font-semibold">{properties.length} Properties</span>
              </div>

              {properties.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No properties found. Add a property to start tracking bed vacancies.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                        <th className="py-3 px-3">Property</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Total Beds</th>
                        <th className="py-3 px-3">Occupied</th>
                        <th className="py-3 px-3">Available Beds</th>
                        <th className="py-3 px-3">Quick Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {properties.map(p => {
                        const occupied = Math.max(0, (p.totalBeds || 0) - (p.availableBeds || 0));
                        return (
                          <tr key={p._id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">{p.title}</td>
                            <td className="py-3 px-3 text-slate-600">{p.propertyType}</td>
                            <td className="py-3 px-3 font-bold text-slate-800">{p.totalBeds || 0}</td>
                            <td className="py-3 px-3 text-indigo-700 font-bold">{occupied}</td>
                            <td className="py-3 px-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                                {p.availableBeds || 0} Open
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleUpdateVacancy(p._id, (p.availableBeds || 0) - 1)}
                                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                                  title="Decrease available bed"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateVacancy(p._id, (p.availableBeds || 0) + 1)}
                                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                                  title="Increase available bed"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: SERVICES OFFERED                                  */}
        {/* ======================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Services Offered</h2>
                <p className="text-xs text-slate-500 font-medium">Commercial meal, laundry, and housekeeping services provided to tenants</p>
              </div>
            </div>

            {services.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">No standalone service listings yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Offer daily tiffin catering, room cleaning, or laundry services to resident students.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map(srv => (
                  <div key={srv._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {srv.category}
                        </span>
                        <h3 className="font-black text-lg text-slate-900">{srv.businessName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{srv.address}, {srv.city}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleServiceAvailability(srv)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          srv.isAvailable !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {srv.isAvailable !== false ? 'Active & Open' : 'Paused'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Service Coverage: <strong>{srv.serviceRadius || 8} km</strong></span>
                      <span className="text-emerald-800 font-black">Rating: {srv.rating || 4.8} ★</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: BOOKINGS & CUSTOMER REQUESTS                      */}
        {/* ======================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isTiffinOnly ? 'Meal Subscriptions & Customer Orders' : 'Bookings & Customer Requests'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isTiffinOnly ? 'Tenant meal subscriptions and daily lunch/dinner orders' : 'Incoming tenant inquiries, bed reservations and stay requests'}
                </p>
              </div>

              {/* Status Filter Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Filter:</span>
                <select
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="All">All Inquiries ({bookings.length})</option>
                  <option value="Pending">Pending ({bookings.filter(b => b.status === 'Pending').length})</option>
                  <option value="Accepted">Accepted ({bookings.filter(b => b.status === 'Accepted').length})</option>
                  <option value="Completed">Completed ({bookings.filter(b => b.status === 'Completed').length})</option>
                  <option value="Rejected">Rejected ({bookings.filter(b => b.status === 'Rejected').length})</option>
                </select>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">No {bookingFilter !== 'All' ? bookingFilter : ''} orders found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isTiffinOnly 
                    ? 'Student meal subscriptions will appear here as soon as tenants subscribe to your daily tiffin plan.'
                    : 'Tenant inquiries and bed locks will appear here as soon as users book your properties.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map(b => (
                  <div
                    key={b._id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={b.sender?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={b.sender?.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{b.sender?.name || 'Verified Tenant'}</h4>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            b.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            b.status === 'Completed' ? 'bg-indigo-100 text-indigo-800' :
                            b.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-semibold">
                          Item: <strong className="text-slate-800">{b.itemId?.title || b.itemId?.businessName || 'Tiffin Meal Plan'}</strong>
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" /> {b.sender?.phone || 'Not set'}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" /> {b.sender?.email}
                          </span>
                          <span>&bull;</span>
                          <span>Subscribed on {new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>

                        {b.message && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-600 mt-2 italic max-w-lg">
                            &ldquo;{b.message}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscription Fee</span>
                        <span className="text-xl font-black text-slate-900">₹{b.proposedPrice || b.pricingDetails?.totalAmount || 0}</span>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          Status: <span className={b.status === 'Accepted' ? 'text-emerald-700' : 'text-amber-700'}>{b.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'Accepted')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#064e3b] hover:bg-[#043d2e] text-white transition-colors cursor-pointer"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'Rejected')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {b.status === 'Accepted' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b._id, 'Completed')}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedBookingDetails(b); setShowBookingDetailsModal(true); }}
                          className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 9: EARNINGS & SETTLEMENTS                            */}
        {/* ======================================================== */}
        {activeTab === 'earnings' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Earnings &amp; Payouts</h2>
              <p className="text-xs text-slate-500 font-medium">Financial breakdown from meal subscriptions, service payments, and bank payouts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Subscription Volume</span>
                <div className="text-3xl font-black text-slate-900">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-slate-500 font-medium block">All-time order intake</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Net Take-Home Earnings</span>
                <div className="text-3xl font-black text-emerald-800">
                  ₹{stats.netRevenue.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-slate-500 font-medium block">After platform processing fee (5%)</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Platform Commission</span>
                <div className="text-3xl font-black text-purple-700">
                  {settlementSummary?.commissionRate || 5}%
                </div>
                <span className="text-xs text-slate-500 font-medium block">Flat transparent tier</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Queued for Settlement</span>
                <div className="text-3xl font-black text-emerald-900">
                  ₹{stats.netRevenue.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-emerald-700 font-medium block">Scheduled direct bank transfer</span>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                <h3 className="font-extrabold text-base text-slate-900">Recorded Customer Subscriptions</h3>
                <span className="text-xs text-slate-400 font-bold">{bookings.length} Orders</span>
              </div>

              {bookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No subscriptions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Subscriber</th>
                        <th className="py-3 px-3">Plan Description</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {bookings.map(b => (
                        <tr key={b._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            #SS-{b._id.toString().slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {b.sender?.name || 'Verified Tenant'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 truncate max-w-xs">
                            {b.itemId?.title || b.itemId?.businessName || b.message || 'Tiffin Subscription'}
                          </td>
                          <td className="py-3 px-3 font-black text-slate-900">
                            ₹{b.proposedPrice || b.pricingDetails?.totalAmount || 0}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              b.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 10: REVIEWS & CUSTOMER FEEDBACK                      */}
        {/* ======================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer Reviews &amp; Ratings</h2>
              <p className="text-xs text-slate-500 font-medium">Genuine feedback from verified residents on food quality, hygiene and delivery</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-8">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Customer Satisfaction</span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-slate-900">
                    {reviews.length > 0 
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                      : (primaryTiffinService?.rating || 4.8)}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Based on verified student reviews in {user?.currentCity || 'Indore'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Star className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">High Customer Rating (4.8 / 5.0)</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {primaryBusinessName} is verified by StaySync for hygiene, authentic taste, and reliable doorstep food delivery.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map(r => (
                  <div key={r._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.author?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={r.author?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{r.author?.name || 'Verified Resident'}</h4>
                          <span className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">&ldquo;{r.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 11: KITCHEN / BUSINESS SETTINGS                      */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {isTiffinOnly ? 'Kitchen & Security Settings' : 'Business Settings'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Commercial preferences, security and operational controls</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500">Ensure your enterprise dashboard is secure with a strong password</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#064e3b] hover:bg-[#043d2e] text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingPassword ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-6 space-y-6">
                
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900">Operational Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {isTiffinOnly ? 'New Meal Subscriptions' : 'New Inquiries'}
                        </h4>
                        <p className="text-[11px] text-slate-500">Instant notification when a student books food delivery</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Daily Dispatch Alerts</h4>
                        <p className="text-[11px] text-slate-500">Alert riders 30 mins before lunch &amp; dinner departures</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-rose-200/80 bg-rose-50/20 p-6 sm:p-8 shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm text-rose-900">Sign Out of Business Session</h3>
                    <p className="text-xs text-rose-700">Safely terminate active business session</p>
                  </div>
                  <button
                    onClick={() => setShowConfirmLogout(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0"
                  >
                    Logout Now
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL: EDIT TIFFIN MENU & PRICING                        */}
      {/* ======================================================== */}
      {showEditMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Update Tiffin Dishes &amp; Pricing</h3>
                <p className="text-xs text-slate-500 font-medium">Changes will instantly reflect on student marketplaces and menus</p>
              </div>
              <button onClick={() => setShowEditMenuModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Monthly Plan (₹/mo)</label>
                  <input
                    type="number"
                    required
                    value={menuForm.monthlyPrice}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, monthlyPrice: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Single Thali Token (₹)</label>
                  <input
                    type="number"
                    required
                    value={menuForm.vegPrice}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, vegPrice: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Breakfast (Morning)</label>
                <input
                  type="text"
                  required
                  value={menuForm.breakfast}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, breakfast: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lunch (Afternoon)</label>
                <input
                  type="text"
                  required
                  value={menuForm.lunch}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, lunch: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Dinner (Evening)</label>
                <input
                  type="text"
                  required
                  value={menuForm.dinner}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, dinner: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Sunday Special Royal Feast</label>
                <input
                  type="text"
                  required
                  value={menuForm.sundaySpecial}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, sundaySpecial: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowEditMenuModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#064e3b] hover:bg-[#043d2e] text-white cursor-pointer"
                >
                  Save Daily Menu
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT BUSINESS INFORMATION                         */}
      {/* ======================================================== */}
      {showEditBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Business Information</h3>
                <p className="text-xs text-slate-500 font-medium">Update commercial credentials on StaySync</p>
              </div>
              <button onClick={() => setShowEditBusinessModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBusinessProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Business / Kitchen Name</label>
                <input
                  type="text"
                  required
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="e.g. Shree Ganesh Pure Desi Tiffin Services"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Owner / Authorized Name</label>
                  <input
                    type="text"
                    required
                    value={businessForm.name}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Direct Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Operating Address</label>
                <input
                  type="text"
                  required
                  value={businessForm.businessAddress}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, businessAddress: e.target.value }))}
                  placeholder="e.g. 18, Sarwate Bus Stand Road, Indore"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Operating City</label>
                  <select
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  >
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={businessForm.state}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g. Madhya Pradesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowEditBusinessModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#064e3b] hover:bg-[#043d2e] text-white cursor-pointer"
                >
                  Save Business Details
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW PROPERTY                                  */}
      {/* ======================================================== */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="text-lg font-black text-slate-900">List New Accommodation</h3>
              <button onClick={() => setShowAddPropertyModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Property Title</label>
                <input
                  type="text"
                  required
                  value={newProperty.title}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Greenfield Luxury Hostel &amp; PG"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Property Type</label>
                  <select
                    value={newProperty.propertyType}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, propertyType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  >
                    <option value="Hostel">Hostel</option>
                    <option value="PG">PG</option>
                    <option value="Room">Flat / Room</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hostel Category</label>
                  <select
                    value={newProperty.hostelCategory}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, hostelCategory: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  >
                    <option value="Boys Hostel">Boys Hostel</option>
                    <option value="Girls Hostel">Girls Hostel</option>
                    <option value="Co-ed Hostel">Co-ed Hostel</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Address</label>
                <input
                  type="text"
                  required
                  value={newProperty.address}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. 14, Bhawarkua Main Road, Near IT Park"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Total Beds</label>
                  <input
                    type="number"
                    required
                    value={newProperty.totalBeds}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, totalBeds: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Available Beds</label>
                  <input
                    type="number"
                    required
                    value={newProperty.availableBeds}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, availableBeds: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Monthly Rent (₹/bed)</label>
                  <input
                    type="number"
                    required
                    value={newProperty.monthlyRent}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, monthlyRent: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <select
                    value={newProperty.city}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  >
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#064e3b] hover:bg-[#043d2e] text-white cursor-pointer"
                >
                  Publish Accommodation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PROPERTY DETAILS                                  */}
      {/* ======================================================== */}
      {showPropertyDetailsModal && selectedPropertyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="text-base font-black text-slate-900">{selectedPropertyDetails.title}</h3>
              <button onClick={() => setShowPropertyDetailsModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={selectedPropertyDetails.photos?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'}
                  alt={selectedPropertyDetails.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div><strong>Type:</strong> {selectedPropertyDetails.propertyType} ({selectedPropertyDetails.hostelCategory || 'Standard'})</div>
                <div><strong>Address:</strong> {selectedPropertyDetails.address}, {selectedPropertyDetails.city}</div>
                <div><strong>Rent:</strong> ₹{selectedPropertyDetails.rentPerPerson || selectedPropertyDetails.monthlyRent} / month</div>
                <div><strong>Available Beds:</strong> {selectedPropertyDetails.availableBeds} of {selectedPropertyDetails.totalBeds} Total</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPropertyDetailsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BOOKING / SUBSCRIPTION DETAILS                    */}
      {/* ======================================================== */}
      {showBookingDetailsModal && selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isTiffinOnly ? 'Meal Subscription Details' : 'Booking Request Details'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-400 block">
                  #SS-{selectedBookingDetails._id.toString().slice(-6).toUpperCase()}
                </span>
              </div>
              <button onClick={() => setShowBookingDetailsModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <div><strong>Subscriber (Resident):</strong> {selectedBookingDetails.sender?.name}</div>
                <div><strong>Phone:</strong> {selectedBookingDetails.sender?.phone || 'Not provided'}</div>
                <div><strong>Email:</strong> {selectedBookingDetails.sender?.email}</div>
                <div><strong>Status:</strong> {selectedBookingDetails.status}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <div><strong>Item / Service:</strong> {selectedBookingDetails.itemId?.title || selectedBookingDetails.itemId?.businessName || selectedBookingDetails.itemType}</div>
                <div><strong>Amount:</strong> ₹{selectedBookingDetails.proposedPrice || selectedBookingDetails.pricingDetails?.totalAmount}</div>
                <div><strong>Payment:</strong> {selectedBookingDetails.paymentStatus || 'Verified on delivery / advance'}</div>
              </div>

              {selectedBookingDetails.message && (
                <div className="p-3.5 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200">
                  <strong className="block text-emerald-900 font-bold mb-1">Subscriber Delivery Note:</strong>
                  <p className="italic leading-relaxed">&ldquo;{selectedBookingDetails.message}&rdquo;</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBookingDetailsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION DIALOG: DELETE PROPERTY                     */}
      {/* ======================================================== */}
      {deletePropertyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Delete Property?</h3>
              <p className="text-xs text-slate-500">Are you sure you want to permanently remove "{deletePropertyConfirm.title}" from StaySync?</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletePropertyConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProperty(deletePropertyConfirm._id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION DIALOG: LOGOUT                              */}
      {/* ======================================================== */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Sign Out?</h3>
              <p className="text-xs text-slate-500">Are you sure you want to log out of your provider business dashboard?</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#064e3b] text-white hover:bg-[#043d2e] cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProviderBusinessDashboard;
