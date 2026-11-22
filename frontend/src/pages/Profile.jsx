import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, servicesAPI, requestsAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import ServiceCard from '../components/ServiceCard';
import {
  Save, UserCheck, ShieldCheck, Heart, User, Sparkles, AlertCircle,
  ArrowRight, LayoutDashboard, Home, Users, Salad, Shirt, Brush, Wrench,
  Container, CheckCircle2, Edit3, MapPin, Phone, Mail, DollarSign,
  Clock, Moon, Sun, Wind, Check, Calendar, Briefcase, Coffee, Cigarette, Wine, Shield, Eye, Settings, X
} from 'lucide-react';
import { isProviderUser, getRoleDashboardLink } from '../utils/roleHelper';
import ProviderBusinessDashboard from '../components/ProviderBusinessDashboard';

const Profile = () => {
  const { user, roommateProfile, updateProfile, refreshProfile } = useAuth();
  const isProvider = isProviderUser(user);

  // If user is a verified Provider, strictly render the Provider Business Dashboard
  if (isProvider) {
    return (
      <ProviderBusinessDashboard
        user={user}
      />
    );
  }
  
  // View mode vs Edit mode state (defaults to view mode if user exists)
  const [isEditing, setIsEditing] = useState(false);

  // State for user attributes
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [preferredCity, setPreferredCity] = useState('');
  
  // State for roommate profiles (lifestyle matching vector)
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState('Male');
  const [occupation, setOccupation] = useState('');
  const [collegeOrOffice, setCollegeOrOffice] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(10000);
  const [foodPreference, setFoodPreference] = useState('Any');
  const [sleepSchedule, setSleepSchedule] = useState('Flexible');
  const [cleanliness, setCleanliness] = useState('Moderate');
  const [noiseTolerance, setNoiseTolerance] = useState('Moderate');
  const [smoking, setSmoking] = useState('No');
  const [drinking, setDrinking] = useState('No');
  const [acPreference, setAcPreference] = useState('No Preference');
  const [preferredGender, setPreferredGender] = useState('Any');
  const [selectedServices, setSelectedServices] = useState(['room']);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Live preview states
  const [previewProperties, setPreviewProperties] = useState([]);
  const [previewServices, setPreviewServices] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Selected stay & providers state
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState([]);

  // Inquiry / Booking Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [modalTarget, setModalTarget] = useState(null); // { type, item }
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [submittingModal, setSubmittingModal] = useState(false);

  const currentUserId = (user?._id || user?.id)?.toString();

  // Sync state with Context values on load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCurrentCity(user.currentCity || '');
      setPreferredCity(user.preferredCity || '');

      const localStay = JSON.parse(
        localStorage.getItem(`staysync_selected_stay_${currentUserId}`) || 
        (user?.id ? localStorage.getItem(`staysync_selected_stay_${user.id}`) : null) || 
        'null'
      );
      const uG = (user?.gender || roommateProfile?.gender || '').toLowerCase();
      const isValidStayForUser = (stay) => {
        if (!stay) return false;
        const cat = (stay.hostelCategory || stay.title || '').toLowerCase();
        const isGirls = (cat.includes('girls') || cat.includes('female')) && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed');
        const isBoys = (cat.includes('boys') || cat.includes('male')) && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed');
        if ((uG === 'male' && isGirls) || (uG === 'female' && isBoys)) return false;
        return true;
      };

      if (roommateProfile?.selectedStay && isValidStayForUser(roommateProfile.selectedStay)) {
        setSelectedStay(roommateProfile.selectedStay);
      } else if (localStay && isValidStayForUser(localStay)) {
        setSelectedStay(localStay);
      } else {
        setSelectedStay(null);
        if (currentUserId) {
          localStorage.removeItem(`staysync_selected_stay_${currentUserId}`);
        }
      }

      const localProviders = JSON.parse(
        localStorage.getItem(`staysync_selected_providers_${currentUserId}`) || 
        (user?.id ? localStorage.getItem(`staysync_selected_providers_${user.id}`) : null) || 
        '[]'
      );
      if (roommateProfile?.selectedProviders && roommateProfile.selectedProviders.length > 0) {
        setSelectedProviders(roommateProfile.selectedProviders);
      } else if (localProviders.length > 0) {
        setSelectedProviders(localProviders);
      }
    }
    if (roommateProfile) {
      setAge(roommateProfile.age || 21);
      setGender(roommateProfile.gender || 'Male');
      setOccupation(roommateProfile.occupation || '');
      setCollegeOrOffice(roommateProfile.collegeOrOffice || '');
      setMonthlyBudget(roommateProfile.monthlyBudget || 10000);
      setFoodPreference(roommateProfile.foodPreference || 'Any');
      setSleepSchedule(roommateProfile.sleepSchedule || 'Flexible');
      setCleanliness(roommateProfile.cleanliness || 'Moderate');
      setNoiseTolerance(roommateProfile.noiseTolerance || 'Moderate');
      setSmoking(roommateProfile.smoking || 'No');
      setDrinking(roommateProfile.drinking || 'No');
      setAcPreference(roommateProfile.acPreference || 'No Preference');
      setPreferredGender(roommateProfile.preferredGender || 'Any');
      setSelectedServices(roommateProfile.selectedServices || ['room']);
    }
  }, [user, roommateProfile, currentUserId]);

  const handleSelectStay = async (property) => {
    const isCurrent = selectedStay?._id === property._id;
    const nextStay = isCurrent ? null : property;
    setSelectedStay(nextStay);
    if (currentUserId) {
      localStorage.setItem(`staysync_selected_stay_${currentUserId}`, JSON.stringify(nextStay));
    }
    try {
      await updateProfile({ selectedStay: nextStay ? nextStay._id : null });
      if (nextStay) {
        setMessage(`"${property.title}" has been selected as your active stay! Your dashboard is now updated.`);
      } else {
        setMessage('Stay unselected.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectService = async (service) => {
    const exists = selectedProviders.some(p => p._id === service._id);
    let updated;
    if (exists) {
      updated = selectedProviders.filter(p => p._id !== service._id);
    } else {
      updated = [...selectedProviders.filter(p => p.category !== service.category), service];
    }
    setSelectedProviders(updated);
    if (currentUserId) {
      localStorage.setItem(`staysync_selected_providers_${currentUserId}`, JSON.stringify(updated));
    }
    try {
      await updateProfile({ selectedProviders: updated.map(p => p._id) });
      if (!exists) {
        setMessage(`✓ "${service.businessName}" (${service.category}) added to your active living plan!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenInquire = (property) => {
    setModalTarget({ type: 'Property', item: property });
    setProposedPrice(property.monthlyRent);
    setInquiryMessage(`Hello, I am interested in viewing / reserving your room: "${property.title}". Please confirm availability.`);
    setInquirySuccess(false);
    setModalError(null);
    setShowInquiryModal(true);
  };

  const handleOpenBookService = (service) => {
    setModalTarget({ type: 'ServiceProvider', item: service });
    let price = 0;
    if (service.category === 'Tiffin') price = service.tiffinDetails?.monthlyPrice || 2400;
    if (service.category === 'Laundry') price = service.laundryDetails?.pricePerKg * 10 || 600;
    if (service.category === 'Cleaning') price = service.cleaningDetails?.priceMap?.['Regular Room'] || 150;
    if (service.category === 'Maintenance') price = service.maintenanceDetails?.calloutFee || 150;
    if (service.category === 'Movers') price = service.moversDetails?.baseFee || 2500;
    setProposedPrice(price);
    setInquiryMessage(`Hello, I want to book your ${service.category} service: "${service.businessName}". Please confirm booking.`);
    setInquirySuccess(false);
    setModalError(null);
    setShowInquiryModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
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
        if (modalTarget.type === 'Property') {
          handleSelectStay(modalTarget.item);
        } else if (modalTarget.type === 'ServiceProvider') {
          handleSelectService(modalTarget.item);
        }
        setInquirySuccess(true);
        setTimeout(() => {
          setShowInquiryModal(false);
        }, 1200);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmittingModal(false);
    }
  };

  // Load preview listings based on current preferred city
  const loadPreviewData = async () => {
    setPreviewLoading(true);
    const targetCity = preferredCity || currentCity || '';

    try {
      const q = { userId: user?.id };
      if (targetCity && targetCity !== 'All') q.city = targetCity;
      let propRes = await propertiesAPI.getProperties(q);
      if (propRes.success && propRes.data.length > 0) {
        setPreviewProperties(propRes.data.slice(0, 2));
      } else {
        let fallback = await propertiesAPI.getProperties({ userId: user?.id });
        if (fallback.success) setPreviewProperties(fallback.data.slice(0, 2));
      }
    } catch (e) {
      console.error(e);
    }


    try {
      let srvRes = await servicesAPI.getServices({ city: targetCity });
      if (srvRes.success && srvRes.data.length > 0) {
        setPreviewServices(srvRes.data);
      } else {
        let fallbackSrv = await servicesAPI.getServices({});
        if (fallbackSrv.success) setPreviewServices(fallbackSrv.data);
      }
    } catch (e) {
      console.error(e);
    }

    setPreviewLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadPreviewData();
    }
  }, [user, preferredCity]);

  const handleServiceToggle = (id) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter(x => x !== id));
      }
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    const payload = {
      name,
      phone,
      currentCity,
      preferredCity,
      age,
      gender,
      occupation,
      collegeOrOffice,
      monthlyBudget,
      foodPreference,
      sleepSchedule,
      cleanliness,
      noiseTolerance,
      smoking,
      drinking,
      acPreference,
      preferredGender,
      selectedServices
    };

    try {
      await updateProfile(payload);
      setMessage('Profile and preferences updated successfully!');
      setIsEditing(false); // Switch to View UI mode
      loadPreviewData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const servicesList = [
    { id: 'room', label: 'Find Room', icon: <Home className="w-4 h-4 text-emerald-600" />, desc: 'Hostels, PGs & Rooms' },
    { id: 'tiffin', label: 'Tiffin Service', icon: <Salad className="w-4 h-4 text-amber-600" />, desc: 'Healthy meal catering' },
    { id: 'laundry', label: 'Laundry Service', icon: <Shirt className="w-4 h-4 text-blue-600" />, desc: 'Wash, dry & steam-iron' },
    { id: 'cleaning', label: 'Deep Cleaning', icon: <Brush className="w-4 h-4 text-teal-600" />, desc: 'Room & bathroom wash' },
    { id: 'maintenance', label: 'Maintenance Repair', icon: <Wrench className="w-4 h-4 text-amber-600" />, desc: 'Electrician & plumbing' },
    { id: 'movers', label: 'Packers & Movers', icon: <Container className="w-4 h-4 text-purple-600" />, desc: 'Luggage transit' }
  ];

  const tiffinServices = previewServices.filter(s => s.category === 'Tiffin');
  const laundryServices = previewServices.filter(s => s.category === 'Laundry');
  const cleaningServices = previewServices.filter(s => s.category === 'Cleaning');
  const maintenanceServices = previewServices.filter(s => s.category === 'Maintenance');
  const moversServices = previewServices.filter(s => s.category === 'Movers');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {isEditing 
              ? (isProvider ? 'Edit Partner Profile & Settings' : 'Edit Living Profile & Settings') 
              : (isProvider ? 'Your Partner Business Profile' : 'Your Living Profile')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEditing 
              ? (isProvider ? 'Update your business information and contact settings.' : 'Update your personal details, matching vectors and active modules.') 
              : (isProvider ? 'Your verified business account, property management settings, and contact information.' : 'Your personalized migration profile, lifestyle vectors, and subscribed services.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => { setIsEditing(true); setMessage(null); }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isProvider ? 'Edit Business Info' : 'Edit Profile & Preferences'}</span>
            </button>
          ) : (
            <button
              onClick={() => { setIsEditing(false); setMessage(null); }}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>View Profile Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Success alert banner */}
      {message && (
        <div className="bg-green-50 p-5 rounded-2xl border border-green-200 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-600 text-white rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-green-900">{message}</h3>
              <p className="text-xs text-green-700 mt-0.5">
                {isProvider 
                  ? 'Your business profile has been updated and saved successfully.'
                  : (
                    <>
                      Your living profile is saved and your dashboard recommendations have been refreshed for{' '}
                      <strong className="capitalize">{preferredCity || currentCity || 'Indore'}</strong>.
                    </>
                  )}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedServices.map(s => (
                  <span key={s} className="bg-white border border-green-200 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                    {servicesList.find(x => x.id === s)?.label || s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-green-150">
            <Link
              to="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/shift-planner"
              className="bg-white hover:bg-green-50 border border-green-300 text-green-800 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Open Shift Planner
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW MODE UI (Rendered when isEditing === false) */}
      {/* ========================================================================= */}
      {!isEditing ? (
        <div className="space-y-8 animate-fadeIn">

          {/* Active Living Selection Quick Summary Panel (Residents only) */}
          {(!isProvider && (selectedStay || selectedProviders.length > 0)) && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Your Active Living Selection
                </span>
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  {selectedStay ? selectedStay.title : 'No Stay Selected Yet'}
                  {selectedProviders.length > 0 && ` + ${selectedProviders.map(p => p.businessName).join(', ')}`}
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  {selectedStay ? `Stay: ₹${selectedStay.monthlyRent?.toLocaleString('en-IN')}/mo in ${selectedStay.city}` : ''}
                  {selectedProviders.length > 0 ? ` • ${selectedProviders.length} active service provider(s)` : ''}
                </p>
              </div>

              <Link
                to="/dashboard"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to My Living Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          
          {/* Main User Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={name || user?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-500 shadow-sm shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-gray-900">{name || user?.name}</h2>
                  <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-green-600" />
                    Verified Tenant
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-gray-400" /> {phone || 'Not set'}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Mail className="w-3 h-3 text-gray-400" /> {user?.email}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold pt-1">
                  <span className="text-gray-500">Relocation Route:</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold capitalize">
                    {currentCity || 'Current City'}
                  </span>
                  <span className="text-green-600 font-bold">➔</span>
                  <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded font-bold capitalize">
                    {preferredCity || 'Target City'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/40 p-4 rounded-xl border border-green-200 shrink-0 text-right min-w-[180px] w-full md:w-auto">
              <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider block">Monthly Budget</span>
              <span className="text-2xl font-black text-green-700 block mt-0.5">₹{monthlyBudget?.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-green-600 font-medium block mt-1">Lifestyle vector active</span>
            </div>
          </div>


          {/* 2. Subscribed Services Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  Your Active Service Subscriptions ({selectedServices.length} Activated)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Services included in your dashboard recommendations and relocation checklists.</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Change
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {servicesList.map(s => {
                const isActive = selectedServices.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isActive 
                        ? 'bg-green-50/50 border-green-400 shadow-2xs' 
                        : 'bg-gray-50/40 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {s.icon}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isActive ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">{s.label.replace(/^.*? /, '')}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Lifestyle Vectors Summary */}
          {user?.role === 'USER' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-150">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-green-600" />
                    Resident Lifestyle & Living Habits
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Preferences used to personalize hostel, PG, room, and service recommendations.</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit Habits
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 pt-2">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Age & Gender</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{age} yrs · {gender}</strong>
                  <span className="text-[10px] text-gray-500">Pref: {preferredGender}</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Occupation</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{occupation || 'Not Specified'}</strong>
                  <span className="text-[10px] text-gray-500 line-clamp-1">{collegeOrOffice || 'No campus/office'}</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Food Preference</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{foodPreference === 'Veg' ? 'Vegetarian Only' : foodPreference}</strong>
                  <span className="text-[10px] text-gray-500">Diet vector</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Sleep Schedule</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{sleepSchedule}</strong>
                  <span className="text-[10px] text-gray-500">Sleep alignment</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Cleanliness</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{cleanliness}</strong>
                  <span className="text-[10px] text-gray-500">Hygiene standard</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Noise Tolerance</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{noiseTolerance}</strong>
                  <span className="text-[10px] text-gray-500">Sound environment</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Smoking Allowed</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{smoking}</strong>
                  <span className="text-[10px] text-gray-500">Habit vector</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Air Conditioning</span>
                  <strong className="text-xs text-gray-800 block mt-0.5">{acPreference}</strong>
                  <span className="text-[10px] text-gray-500">Room climate</span>
                </div>
              </div>
            </div>
          )}

          {isProvider ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Manage Your Properties & Vacancies</h3>
                <p className="text-xs text-gray-500 mt-0.5">Edit room types, bed vacancy availability, rules, and pricing on your provider dashboard.</p>
              </div>
              <Link
                to={getRoleDashboardLink(user)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Provider Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* 4. Live Sections Recommendations */
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Your Active Living Sections ({preferredCity || currentCity || 'Indore'})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Live previews based on your saved profile and lifestyle settings.</p>
                </div>
                <Link to="/dashboard" className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                  <span>View on Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            {/* Rooms */}
            {selectedServices.includes('room') && (
              <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-green-600" />
                    Matching Stay & Room Listings
                  </h4>
                  <Link to="/marketplace?tab=rooms" className="text-xs font-bold text-green-600 hover:text-green-700">Explore Rooms</Link>
                </div>
                {previewProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewProperties.map(p => (
                      <PropertyCard
                        key={p._id}
                        property={p}
                        onInquire={handleOpenInquire}
                        onShortlist={() => {}}
                        isShortlisted={false}
                        onSelectStay={handleSelectStay}
                        isSelected={selectedStay?._id === p._id}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center">Loading properties...</p>
                )}
              </div>
            )}


            {/* Tiffin */}
            {selectedServices.includes('tiffin') && (
              <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Salad className="w-4 h-4 text-green-600" />
                    Tiffin & Daily Food Catering
                  </h4>
                  <Link to="/marketplace?tab=services" className="text-xs font-bold text-green-600 hover:text-green-700">Explore Food Providers</Link>
                </div>
                {tiffinServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiffinServices.map(s => (
                      <ServiceCard
                        key={s._id}
                        service={s}
                        onBook={handleOpenBookService}
                        onInquire={handleOpenInquire}
                        onSelectService={handleSelectService}
                        isSelected={selectedProviders.some(pr => pr._id === s._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center">Loading tiffin services...</p>
                )}
              </div>
            )}

            {/* Laundry */}
            {selectedServices.includes('laundry') && (
              <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-green-600" />
                    Laundry & Dry Cleaning
                  </h4>
                  <Link to="/marketplace?tab=services" className="text-xs font-bold text-green-600 hover:text-green-700">Explore Laundry</Link>
                </div>
                {laundryServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {laundryServices.map(s => (
                      <ServiceCard
                        key={s._id}
                        service={s}
                        onBook={handleOpenBookService}
                        onInquire={handleOpenInquire}
                        onSelectService={handleSelectService}
                        isSelected={selectedProviders.some(pr => pr._id === s._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center">Loading laundry services...</p>
                )}
              </div>
            )}

            {/* Cleaning */}
            {selectedServices.includes('cleaning') && (
              <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Brush className="w-4 h-4 text-green-600" />
                    Deep Cleaning & Maid Services
                  </h4>
                  <Link to="/marketplace?tab=services" className="text-xs font-bold text-green-600 hover:text-green-700">Explore Cleaning</Link>
                </div>
                {cleaningServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cleaningServices.map(s => (
                      <ServiceCard
                        key={s._id}
                        service={s}
                        onBook={handleOpenBookService}
                        onInquire={handleOpenInquire}
                        onSelectService={handleSelectService}
                        isSelected={selectedProviders.some(pr => pr._id === s._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center">Loading cleaning services...</p>
                )}
              </div>
            )}

            {/* Maintenance */}
            {selectedServices.includes('maintenance') && (
              <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-green-600" />
                    Maintenance & Electrician/Plumbing Repairs
                  </h4>
                  <Link to="/marketplace?tab=services" className="text-xs font-bold text-green-600 hover:text-green-700">Explore Techs</Link>
                </div>
                {maintenanceServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {maintenanceServices.map(s => (
                      <ServiceCard
                        key={s._id}
                        service={s}
                        onBook={handleOpenBookService}
                        onInquire={handleOpenInquire}
                        onSelectService={handleSelectService}
                        isSelected={selectedProviders.some(pr => pr._id === s._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center">Loading repair technicians...</p>
                )}
              </div>
            )}

            {/* Movers */}
            {selectedServices.includes('movers') && (
              <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Container className="w-4 h-4 text-green-600" />
                    Packers & Movers Relocation
                  </h4>
                  <Link to="/marketplace?tab=services" className="text-xs font-bold text-green-600 hover:text-green-700">Explore Movers</Link>
                </div>
                {moversServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {moversServices.map(s => (
                      <ServiceCard
                        key={s._id}
                        service={s}
                        onBook={handleOpenBookService}
                        onInquire={handleOpenInquire}
                        onSelectService={handleSelectService}
                        isSelected={selectedProviders.some(pr => pr._id === s._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center">Loading packers and movers...</p>
                )}
              </div>
            )}

            </div>
          )}

          {/* Action Footer */}
          <div className="pt-6 pb-12 flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modify Settings</span>
            </button>
            <Link
              to={isProvider ? getRoleDashboardLink(user) : "/dashboard"}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isProvider ? 'Go to Provider Portal' : 'Go to Full Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 2. EDIT MODE UI (Rendered when isEditing === true) */
        /* ========================================================================= */
        <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
          
          {/* Card 1: Core Account */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              1. Core Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Current City</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="e.g. Bhopal"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Moving / Preferred City</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="e.g. Indore"
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Active services modules */}
          {user?.role === 'USER' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">
                2. Subscribed Services Modules
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Toggle services to include/exclude modules from your active recommendations checklist.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {servicesList.map(s => {
                  const isActive = selectedServices.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleServiceToggle(s.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isActive 
                          ? 'bg-green-50/70 border-green-500 shadow-2xs ring-1 ring-green-500/30' 
                          : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/60 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {s.icon}
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isActive ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-800">{s.label.replace(/^.*? /, '')}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{s.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card 3: Resident Lifestyle & Habits */}
          {user?.role === 'USER' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-green-600" />
                3. Resident Lifestyle &amp; Living Habits
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Age</label>
                  <input
                    type="number"
                    min="16"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 21)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Your Gender</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. SGSITS Student / Analyst"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">College/Office Location</label>
                  <input
                    type="text"
                    placeholder="e.g. SGSITS, Indore"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={collegeOrOffice}
                    onChange={(e) => setCollegeOrOffice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Monthly Budget Limit (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Food Preference</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value)}
                  >
                    <option value="Any">Any / No Preference</option>
                    <option value="Veg">Vegetarian Only</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sleep Schedule</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={sleepSchedule}
                    onChange={(e) => setSleepSchedule(e.target.value)}
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="Early Bird">Early Bird (Early Sleeper)</option>
                    <option value="Night Owl">Night Owl (Late Sleeper)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cleanliness Preference</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={cleanliness}
                    onChange={(e) => setCleanliness(e.target.value)}
                  >
                    <option value="Moderate">Moderate (Normal cleanup)</option>
                    <option value="High">High (Clean freak, neat and tidy)</option>
                    <option value="Low">Low (Chill/casual approach)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Noise Tolerance</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={noiseTolerance}
                    onChange={(e) => setNoiseTolerance(e.target.value)}
                  >
                    <option value="Moderate">Moderate (Medium noise OK)</option>
                    <option value="Low">Low (Quiet environment needed)</option>
                    <option value="High">High (Parties/loud music OK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Smoking Allowed?</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={smoking}
                    onChange={(e) => setSmoking(e.target.value)}
                  >
                    <option value="No">No (Strictly non-smoking)</option>
                    <option value="Yes">Yes (Allowed in room)</option>
                    <option value="Outside Only">Outside Only (Allowed in balcony)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Drinking Allowed?</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={drinking}
                    onChange={(e) => setDrinking(e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Socially">Socially / Occasionally</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Air Conditioning Preference</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={acPreference}
                    onChange={(e) => setAcPreference(e.target.value)}
                  >
                    <option value="No Preference">No Preference</option>
                    <option value="AC">AC Room Only</option>
                    <option value="Non-AC">Non-AC Room OK</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* Form action buttons */}
          <div className="flex justify-end gap-3 pb-12">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-8 rounded-lg text-sm shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>

        </form>
      )}

      {/* Inquiry & Booking Modal */}
      {showInquiryModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Inquiry Sent Successfully!</h3>
                <p className="text-xs text-gray-500">The recipient has been notified. You can track this request on your dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <h3 className="text-base font-black text-gray-900 border-b pb-2">
                  Send Inquiry for {modalTarget.type === 'ServiceProvider' ? modalTarget.item.category : modalTarget.type}
                </h3>

                {modalError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                <p className="text-xs text-gray-500 font-medium">
                  To: <strong className="text-gray-900">{modalTarget.item.title || modalTarget.item.businessName || modalTarget.item.user?.name}</strong>
                </p>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Offered / Proposed Price (₹)</label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-green-500 focus:outline-none font-bold"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                    />
                  </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Message</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingModal}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    {submittingModal ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
