import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, requestsAPI, notificationsAPI, propertiesAPI, bookingsAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import ServiceCard from '../components/ServiceCard';
import LivingCalculatorModal from '../components/LivingCalculatorModal';
import EmailConfirmationModal from '../components/EmailConfirmationModal';
import BedSelectorModal from '../components/BedSelectorModal';
import AIAssistantWidget from '../components/AIAssistantWidget';
import RentManagerModal from '../components/RentManagerModal';
import MaintenanceModal from '../components/MaintenanceModal';
import RentalAgreementModal from '../components/RentalAgreementModal';
import UserLocationPreferences from '../components/UserLocationPreferences';
import CommunityBoardWidget from '../components/CommunityBoardWidget';
import { residentAPI } from '../services/api';
import { sendWeb3FormsMail } from '../utils/mailHelper';
import { normalizeImageUrl } from '../utils/imageHelper';
import {
  Sparkles,
  Search,
  Users,
  UtensilsCrossed,
  SlidersHorizontal,
  Compass,
  Navigation,
  Home,
  Heart,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Star,
  Shirt,
  Brush,
  Wrench,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  Plus,
  Send,
  Check,
  RefreshCw,
  TrendingUp,
  Award,
  Filter,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  CreditCard,
  Download,
  FileText,
  Wifi,
  HelpCircle,
  CheckCircle,
  ExternalLink,
  Coffee,
  Hotel,
  Building2,
  DoorClosed,
  Moon,
  Utensils,
  Calculator,
  BookMarked,
  LayoutDashboard
} from 'lucide-react';
import { isProviderUser, getRoleBadgeLabel, getRoleDashboardLink } from '../utils/roleHelper';

const DEFAULT_WEEKLY_MENU = {
  monday: {
    label: 'Monday',
    breakfast: 'Indori Poha with Sev, Crispy Jalebi & Hot Masala Chai',
    lunch: 'Dal Tadka, Sev Tamatar Sabzi, 4 Butter Phulka Rotis, Jeera Rice & Green Salad',
    dinner: 'Kadhi Pakoda, Aloo Jeera Dry, 4 Tawa Rotis, Steamed Basmati Rice & Pickle',
    special: 'Hot Gulab Jamun (1 pc)',
    highlight: 'Comfort Food Monday'
  },
  tuesday: {
    label: 'Tuesday',
    breakfast: 'South Indian Veg Upma, Coconut Chutney & Filter Coffee',
    lunch: 'Punjabi Rajma Masala, Aloo Gobi Dry, 4 Soft Rotis, Steamed Rice, Boondi Raita & Papad',
    dinner: 'Chana Dal Fry, Crispy Bhindi Masala, 4 Rotis & Jeera Rice',
    special: 'Sweet Boondi',
    highlight: 'North Indian Thali'
  },
  wednesday: {
    label: 'Wednesday',
    breakfast: 'Steamed Idli (3 pcs) with Hot Sambhar & Coconut Chutney',
    lunch: 'Paneer Butter Masala, Dhaba Dal Fry, 4 Butter Rotis, Matar Pulao & Onion Salad',
    dinner: 'Lauki Kofta Curry, Arhar Dal Tadka, 4 Tawa Rotis & Steamed Rice',
    special: 'Moong Dal Halwa',
    highlight: 'Paneer Special Wednesday'
  },
  thursday: {
    label: 'Thursday',
    breakfast: 'Crispy Stuffed Aloo Paratha (2 pcs) with Fresh Curd & Mango Pickle',
    lunch: 'Amritsari Chole Masala, Aloo Shimla Mirch, 4 Rotis, Jeera Rice & Sirka Onion',
    dinner: 'Mix Veg Kolhapuri, Moong Dal, 4 Tawa Rotis, Steamed Rice & Papad',
    special: 'Besan Ladoo',
    highlight: 'Homestyle Desi Feast'
  },
  friday: {
    label: 'Friday',
    breakfast: 'Crispy Masala Dosa with Potato Masala, Sambhar & Coconut Chutney',
    lunch: 'Shahi Paneer Korma, Dal Makhani, 4 Butter Rotis, Veg Dum Biryani & Mint Raita',
    dinner: 'Punjabi Baingan Bharta, Yellow Dal Tadka, 4 Rotis & Steamed Rice',
    special: 'Kaju Katli (2 pcs)',
    highlight: 'Biryani & Shahi Paneer Feast'
  },
  saturday: {
    label: 'Saturday',
    breakfast: 'Bedmi Puri (4 pcs) with Mathura Aloo Sabzi & Suji Halwa',
    lunch: 'Kashmiri Dum Aloo, Palak Dal, 4 Soft Rotis, Ghee Rice, Kachumber Salad & Papad',
    dinner: 'Matar Paneer Masala, Dal Fry, 4 Butter Rotis & Khichdi/Rice with Desi Ghee',
    special: 'Rasgulla (1 pc)',
    highlight: 'Weekend Kickoff Special'
  },
  sunday: {
    label: 'Sunday Special',
    breakfast: 'Fluffy Chole Bhature (2 pcs) with Pickled Green Chilli & Sweet Chilled Lassi',
    lunch: 'Royal Maharaja Thali: Kadhai Paneer, Dal Makhani, Dum Veg Pulao, 4 Butter Naan/Tawa Rotis, Boondi Raita, Papad & Kesar Kheer',
    dinner: 'Special Mumbai Pav Bhaji (4 Butter Pav) / Veg Fried Rice with Veg Manchurian Gravy',
    special: 'Kesar Pista Kheer & Ice Cream',
    highlight: 'Grand Sunday Maharaja Feast'
  }
};

const Dashboard = ({ initialTab }) => {
  const { user, roommateProfile, updateProfile, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isProvider = isProviderUser(user);

  const isPropertyOwner = useMemo(() => {
    const role = user?.role;
    return role === 'PROPERTY_OWNER' || role === 'HOSTEL_OWNER' || role === 'PG_OWNER' || role === 'ROOM_OWNER';
  }, [user?.role]);

  const isTiffinPartner = useMemo(() => {
    return user?.role === 'TIFFIN_PROVIDER' || (user?.role === 'PROVIDER' && user?.providerType?.toLowerCase() !== 'cleaning');
  }, [user?.role, user?.providerType]);

  const isCleaningPartner = useMemo(() => {
    return user?.role === 'CLEANING_LAUNDRY_PROVIDER' || (user?.role === 'PROVIDER' && user?.providerType?.toLowerCase() === 'cleaning');
  }, [user?.role, user?.providerType]);

  // Strict route protection: Unauthenticated visitors cannot open dashboard
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Raw requested navigation tab
  const rawTab = searchParams.get('tab') || initialTab || (isProvider ? 'requests' : 'overview');

  // Data States
  const [bundles, setBundles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [properties, setProperties] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected stay & providers state
  const [selectedStay, setSelectedStay] = useState(null);
  const [pendingStayRequest, setPendingStayRequest] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState([]);

  // Resident interactive states
  const [ticketNotice, setTicketNotice] = useState('');
  const [mealPaused, setMealPaused] = useState(false);
  const getTodayKey = () => {
    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return map[new Date().getDay()];
  };
  const [selectedTiffinDay, setSelectedTiffinDay] = useState(getTodayKey());
  const [showRentModal, setShowRentModal] = useState(false);
  const [showRentManagerModal, setShowRentManagerModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [agreementModalData, setAgreementModalData] = useState(null);
  const [rentPaidSuccess, setRentPaidSuccess] = useState(false);
  const [emailModalData, setEmailModalData] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleOpenAgreement = async () => {
    try {
      const res = await residentAPI.getAgreements();
      if (res.data && res.data.length > 0) {
        setAgreementModalData(res.data[0]);
      } else if (activeStayRequest) {
        const gen = await residentAPI.generateAgreement({ bookingId: activeStayRequest._id });
        setAgreementModalData(gen.data);
      } else {
        setTicketNotice('No active booking found to view agreement.');
      }
    } catch (err) {
      console.error(err);
      setTicketNotice('Unable to load digital agreement at this moment.');
    }
  };

  const currentUserId = (user?._id || user?.id)?.toString();
  const targetCity = user?.preferredCity || user?.currentCity || user?.city || roommateProfile?.preferredLocations?.[0] || roommateProfile?.city || '';
  const userName = user?.name ? user.name.split(' ')[0] : 'Resident';

  // Tenant account creation preferences
  const userStayPref = user?.propertyType || user?.preferredRoomType || roommateProfile?.roomType || '';
  const userGender = user?.gender || roommateProfile?.gender || '';
  const userBudget = user?.monthlyBudget || roommateProfile?.monthlyBudget || 10000;
  const userRoomShare = user?.roomShare || roommateProfile?.roomShare || '';

  // Budget & Living Plan State
  const [hasCustomLivingPlan, setHasCustomLivingPlan] = useState(() => {
    const uid = (user?._id || user?.id)?.toString();
    if (!uid) return false;
    try {
      const saved = localStorage.getItem(`staysync_living_plan_${uid}`);
      return Boolean(saved && JSON.parse(saved)?.isConfigured);
    } catch {
      return false;
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const uid = (user?._id || user?.id)?.toString();
    if (uid) {
      try {
        const saved = localStorage.getItem(`staysync_living_plan_${uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.budget) return parsed.budget;
        }
      } catch {}
    }
    return user?.monthlyBudget || roommateProfile?.monthlyBudget || 10000;
  });

  const [livingPlan, setLivingPlan] = useState(() => {
    const uid = (user?._id || user?.id)?.toString();
    if (uid) {
      try {
        const saved = localStorage.getItem(`staysync_living_plan_${uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.isConfigured) return parsed;
        }
      } catch {}
    }
    return {
      roomCost: 0,
      foodCost: 0,
      laundryCost: 0,
      cleaningCost: 0,
      roomType: user?.roomShare || 'Shared',
      isConfigured: false
    };
  });
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Shortlist State
  const [shortlisted, setShortlisted] = useState({});

  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [bedSelectorProperty, setBedSelectorProperty] = useState(null);

  useEffect(() => {
    const uid = (user?._id || user?.id)?.toString();
    if (!uid) return;
    try {
      const saved = localStorage.getItem(`staysync_living_plan_${uid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isConfigured) {
          setHasCustomLivingPlan(true);
          setLivingPlan(parsed);
          if (parsed.budget) setMonthlyBudget(parsed.budget);
          return;
        }
      }
    } catch {}
    const uBudget = user?.monthlyBudget || roommateProfile?.monthlyBudget;
    if (uBudget) {
      setMonthlyBudget(uBudget);
    }
  }, [user?._id, user?.id, user?.monthlyBudget, roommateProfile?.monthlyBudget]);

  const stayPrefLabel = useMemo(() => {
    if (userStayPref === 'Hostel') {
      return userGender?.toLowerCase() === 'female' ? 'Girls Hostels' : userGender?.toLowerCase() === 'male' ? 'Boys Hostels' : 'Student Hostels';
    }
    if (userStayPref === 'PG') {
      return userGender?.toLowerCase() === 'female' ? 'Girls PGs' : userGender?.toLowerCase() === 'male' ? 'Boys PGs' : 'Paying Guest (PG)';
    }
    if (userStayPref === 'Room' || userStayPref === 'Flat') return 'Flats & Apartments';
    return 'Rooms & Hostels';
  }, [userStayPref, userGender]);

  const StayPrefIconComponent = useMemo(() => {
    if (userStayPref === 'Hostel') return Hotel;
    if (userStayPref === 'PG') return Building2;
    if (userStayPref === 'Room') return DoorClosed;
    if (userStayPref === 'Flat') return Home;
    return Building2;
  }, [userStayPref]);

  // Dynamic Time of Day Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // User's selected services preference from onboarding/profile
  const userServices = useMemo(() => {
    return (roommateProfile?.selectedServices && roommateProfile.selectedServices.length > 0)
      ? roommateProfile.selectedServices
      : ['room'];
  }, [roommateProfile]);

  const hasStay = Boolean(selectedStay);
  const hasBookedStay = Boolean(selectedStay || pendingStayRequest);

  // Check if resident is in a PG, Flat or Room (where meals & housekeeping are not bundled like in a traditional hostel)
  const isPgOrFlat = useMemo(() => {
    const prop = selectedStay || (typeof pendingStayRequest?.itemId === 'object' ? pendingStayRequest?.itemId : null);
    if (prop) {
      const pType = (prop.propertyType || '').toLowerCase();
      const title = (prop.title || '').toLowerCase();
      if (pType === 'pg' || pType === 'flat' || pType === 'room') return true;
      if (title.includes('pg') || title.includes('flat') || title.includes('room') || title.includes('apartment') || title.includes('bhk')) return true;
      if (pType !== 'hostel' && !prop.foodAvailable && !prop.messMenu?.breakfast) return true;
      return false;
    }
    const pref = (userStayPref || user?.propertyType || '').toLowerCase();
    return pref === 'pg' || pref === 'flat' || pref === 'room';
  }, [selectedStay, pendingStayRequest, userStayPref, user?.propertyType]);

  const hasTiffin = Boolean(
    selectedProviders.some(p => p?.category === 'Tiffin') ||
    requests.some(r => r.itemType === 'ServiceProvider' && (r.serviceDetails?.serviceCategory === 'Tiffin' || r.itemId?.category === 'Tiffin'))
  );
  const hasLaundry = Boolean(
    selectedProviders.some(p => p?.category === 'Laundry' || p?.category === 'Cleaning') ||
    requests.some(r => r.itemType === 'ServiceProvider' && (r.serviceDetails?.serviceCategory === 'Cleaning' || r.serviceDetails?.serviceCategory === 'Laundry' || r.itemId?.category === 'Cleaning' || r.itemId?.category === 'Laundry'))
  );

  // Active navigation tab strictly sanitized based on role & active booked subscriptions
  const activeTab = useMemo(() => {
    if (isProvider) {
      if (isPropertyOwner) return 'requests';
      if (isTiffinPartner) return (rawTab === 'tiffin' || rawTab === 'requests') ? rawTab : 'requests';
      if (isCleaningPartner) return (rawTab === 'cleaning' || rawTab === 'requests') ? rawTab : 'requests';
      return rawTab === 'overview' ? 'requests' : rawTab;
    }

    if (rawTab === 'bookings' || rawTab === 'my-bookings' || rawTab === 'mybookings') {
      return 'requests';
    }
    if (rawTab === 'notifications') {
      return 'overview';
    }
    // Allow Tiffin tab if resident has actively booked/subscribed to an outside Tiffin service OR is living in a PG/Flat
    if (rawTab === 'tiffin' && !hasTiffin && !isPgOrFlat) {
      return 'overview';
    }
    // Allow Cleaning tab if resident has actively booked a cleaning/laundry service OR is living in a PG/Flat
    if (rawTab === 'cleaning' && !hasLaundry && !isPgOrFlat) {
      return 'overview';
    }
    return rawTab || 'overview';
  }, [rawTab, isProvider, isPropertyOwner, isTiffinPartner, isCleaningPartner, hasTiffin, hasLaundry, isPgOrFlat]);

  const wantsRoom = true;
  const wantsRoommate = false;
  const wantsTiffin = userServices.includes('tiffin') || hasTiffin;
  const wantsLaundry = userServices.includes('laundry') || hasLaundry;
  const wantsCleaning = userServices.includes('cleaning') || hasLaundry;
  const wantsMaintenance = userServices.includes('maintenance');
  const wantsMovers = userServices.includes('movers');

  // Calculate live monthly estimated expenses only if user configured a plan or booked a stay
  const totalEstimatedLivingCost = hasCustomLivingPlan
    ? (wantsRoom ? livingPlan.roomCost : 0) +
      (wantsTiffin ? livingPlan.foodCost : 0) +
      (wantsLaundry ? livingPlan.laundryCost : 0) +
      (wantsCleaning ? livingPlan.cleaningCost : 0)
    : 0;
  const remainingBudget = monthlyBudget - totalEstimatedLivingCost;
  const budgetUsagePercent = monthlyBudget > 0 ? Math.min(Math.round((totalEstimatedLivingCost / monthlyBudget) * 100), 100) : 0;

  // Fetch Dashboard Data
  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch AI bundle recommendations
      const bundleRes = await servicesAPI.getRecommendations().catch(() => ({ success: false }));
      if (bundleRes.success && bundleRes.data) {
        let bList = bundleRes.data || [];
        const activeGender = (user?.gender || roommateProfile?.gender || '').toLowerCase();
        if (activeGender === 'male') {
          bList = bList.filter(b => {
            const cat = (b.property?.hostelCategory || '').toLowerCase();
            return !(cat.includes('girls') && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed'));
          });
        } else if (activeGender === 'female') {
          bList = bList.filter(b => {
            const cat = (b.property?.hostelCategory || '').toLowerCase();
            return !(cat.includes('boys') && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed'));
          });
        }
        setBundles(bList);
      }

      // 2. Fetch User requests
      const reqRes = await requestsAPI.getRequests().catch(() => ({ success: false }));
      if (reqRes.success && reqRes.data) {
        setRequests(reqRes.data);
      }

      // 3. Fetch Notifications
      const notifRes = await notificationsAPI.getNotifications().catch(() => ({ success: false }));
      if (notifRes.success && notifRes.data) {
        setNotifications(notifRes.data);
      }

      // 4. Fetch Properties matching Tenant Account Info (Stay Type, Gender, Budget, Sharing)
      const stayPref = user?.propertyType || user?.preferredRoomType || roommateProfile?.roomType;
      const uGender = user?.gender || roommateProfile?.gender;
      const uBudget = user?.monthlyBudget || roommateProfile?.monthlyBudget;
      const uRoomShare = user?.roomShare || roommateProfile?.roomShare;

      const filterParams = { userId: currentUserId };
      if (targetCity && targetCity !== 'All' && targetCity !== 'All Cities') filterParams.city = targetCity;
      if (stayPref) filterParams.propertyType = stayPref;
      if (uGender && uGender !== 'Any') {
        filterParams.gender = uGender;
        if (uGender.toLowerCase() === 'female') filterParams.hostelCategory = 'Girls Hostel';
        else if (uGender.toLowerCase() === 'male') filterParams.hostelCategory = 'Boys Hostel';
      }
      if (uBudget) filterParams.maxBudget = uBudget;
      if (uRoomShare && uRoomShare !== 'Any') {
        filterParams.roomType = uRoomShare === 'Single' ? '1-Seater Room' : uRoomShare === 'Shared' ? '2-Seater Room' : uRoomShare;
      }

      let propRes = await propertiesAPI.getProperties(filterParams).catch(() => ({ success: false }));
      
      // Fallback: If strict budget/roomShare yielded 0, search with propertyType + gender
      if (!propRes.success || !propRes.data?.length) {
        const relaxedParams = {};
        if (targetCity && targetCity !== 'All' && targetCity !== 'All Cities') relaxedParams.city = targetCity;
        if (stayPref) relaxedParams.propertyType = stayPref;
        if (uGender && uGender !== 'Any') relaxedParams.gender = uGender;
        propRes = await propertiesAPI.getProperties(relaxedParams).catch(() => ({ success: false }));
      }

      // Final fallback if no properties in targetCity with that exact type
      if (!propRes.success || !propRes.data?.length) {
        const anyParams = {};
        if (targetCity && targetCity !== 'All' && targetCity !== 'All Cities') anyParams.city = targetCity;
        if (uGender && uGender !== 'Any') anyParams.gender = uGender;
        propRes = await propertiesAPI.getProperties(anyParams).catch(() => ({ success: false }));
      }

      if (propRes.success && propRes.data) {
        let pList = propRes.data;
        const ug = (uGender || '').toLowerCase();
        if (ug === 'male') {
          pList = pList.filter(p => {
            const cat = (p.hostelCategory || '').toLowerCase();
            return !(cat.includes('girls') && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed'));
          });
        } else if (ug === 'female') {
          pList = pList.filter(p => {
            const cat = (p.hostelCategory || '').toLowerCase();
            return !(cat.includes('boys') && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed'));
          });
        }
        setProperties(pList);
      }


      // 6. Fetch Services
      const srvFilter = {};
      if (targetCity && targetCity !== 'All' && targetCity !== 'All Cities') srvFilter.city = targetCity;
      let srvRes = await servicesAPI.getServices(srvFilter).catch(() => ({ success: false }));
      if (!srvRes.success || !srvRes.data?.length) {
        srvRes = await servicesAPI.getServices({}).catch(() => ({ success: false }));
      }
      if (srvRes.success && srvRes.data) {
        setServices(srvRes.data);
      }

      // 7. Check Booking Requests (Accepted vs Pending)
      const allRequests = reqRes.success ? (reqRes.data || []) : [];
      setRequests(allRequests);

      // Check for ACCEPTED Property booking
      const acceptedStayReq = allRequests.find(r => 
        (r.itemType === 'Property' || r.itemType === 'Stay') && 
        r.status === 'Accepted' && 
        r.itemId
      );

      // Check for PENDING Property booking
      const pendingStayReq = allRequests.find(r => 
        (r.itemType === 'Property' || r.itemType === 'Stay') && 
        r.status === 'Pending' && 
        r.itemId
      );

      if (pendingStayReq) {
        if (typeof pendingStayReq.itemId !== 'object' || pendingStayReq.itemId === null) {
          let matchedProp = (propRes.data || []).find(p => p._id === pendingStayReq.itemId);
          if (!matchedProp && pendingStayReq.itemId) {
            try {
              const singlePropRes = await propertiesAPI.getProperty(pendingStayReq.itemId);
              if (singlePropRes?.success && singlePropRes?.data) matchedProp = singlePropRes.data;
            } catch (e) {
              console.warn('Could not fetch pending stay by ID', e);
            }
          }
          if (matchedProp) pendingStayReq.itemId = matchedProp;
        }
        setPendingStayRequest(pendingStayReq);
        const reqRent = pendingStayReq.proposedPrice || pendingStayReq.itemId?.monthlyRent || pendingStayReq.itemId?.rentPerPerson;
        if (reqRent) {
          setLivingPlan(prev => ({
            ...prev,
            roomCost: reqRent,
            roomType: pendingStayReq.itemId?.roomType || prev.roomType
          }));
        }
      } else {
        setPendingStayRequest(null);
      }

      let activeStay = null;
      const localStay = JSON.parse(
        localStorage.getItem(`staysync_selected_stay_${currentUserId}`) || 
        (user?.id ? localStorage.getItem(`staysync_selected_stay_${user.id}`) : null) || 
        'null'
      );
      if (acceptedStayReq) {
        if (typeof acceptedStayReq.itemId === 'object' && acceptedStayReq.itemId !== null) {
          activeStay = acceptedStayReq.itemId;
        } else {
          activeStay = (propRes.data || []).find(p => p._id === acceptedStayReq.itemId);
          if (!activeStay && acceptedStayReq.itemId) {
            try {
              const singlePropRes = await propertiesAPI.getProperty(acceptedStayReq.itemId);
              if (singlePropRes?.success && singlePropRes?.data) activeStay = singlePropRes.data;
            } catch (e) {
              console.warn('Could not fetch accepted stay by ID', e);
            }
          }
        }
      } else if (!pendingStayReq && (roommateProfile?.selectedStay || localStay)) {
        const stayCandidate = roommateProfile?.selectedStay || localStay;
        if (typeof stayCandidate === 'object' && stayCandidate !== null) {
          activeStay = stayCandidate;
        } else {
          const cId = stayCandidate?._id || stayCandidate;
          activeStay = (propRes.data || []).find(p => p._id === cId);
          if (!activeStay && cId) {
            try {
              const singlePropRes = await propertiesAPI.getProperty(cId);
              if (singlePropRes?.success && singlePropRes?.data) activeStay = singlePropRes.data;
            } catch (e) {
              console.warn('Could not fetch stay candidate property', e);
            }
          }
        }
      }

      // Validate gender suitability for active stay (Strict gender hostel policy)
      const activeUserGender = (user?.gender || roommateProfile?.gender || '').toLowerCase();
      if (activeStay) {
        const cat = (activeStay.hostelCategory || activeStay.title || '').toLowerCase();
        const isGirls = (cat.includes('girls') || cat.includes('female')) && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed');
        const isBoys = (cat.includes('boys') || cat.includes('male')) && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed');
        if ((activeUserGender === 'male' && isGirls) || (activeUserGender === 'female' && isBoys)) {
          console.warn('Mismatched active stay detected by gender policy:', activeStay.title);
          activeStay = null;
          if (currentUserId) {
            localStorage.removeItem(`staysync_selected_stay_${currentUserId}`);
          }
          if (user?.id) {
            localStorage.removeItem(`staysync_selected_stay_${user.id}`);
          }
        }
      }

      if (activeStay) {
        setSelectedStay(activeStay);
        if (currentUserId) {
          localStorage.setItem(`staysync_selected_stay_${currentUserId}`, JSON.stringify(activeStay));
        }
        if (activeStay.monthlyRent || activeStay.rentPerPerson) {
          setLivingPlan(prev => ({ 
            ...prev, 
            roomCost: activeStay.monthlyRent || activeStay.rentPerPerson, 
            roomType: activeStay.roomType || prev.roomType 
          }));
        }
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
      let activeProviders = (roommateProfile?.selectedProviders && roommateProfile.selectedProviders.length > 0)
        ? roommateProfile.selectedProviders.map(p => typeof p === 'object' ? p : (srvRes.data || []).find(s => s._id === p) || p).filter(Boolean)
        : localProviders;

      if (reqRes.success && reqRes.data) {
        const serviceReqs = reqRes.data
          .filter(r => r.itemType === 'ServiceProvider' && (r.status === 'Accepted' || r.status === 'Pending') && r.itemId)
          .map(r => typeof r.itemId === 'object' ? r.itemId : (srvRes.data || []).find(s => s._id === r.itemId) || r.itemId)
          .filter(Boolean);

        if (serviceReqs.length > 0) {
          const existingIds = new Set((activeProviders || []).map(p => (p?._id || p)?.toString()));
          const additional = serviceReqs.filter(s => !existingIds.has((s?._id || s)?.toString()));
          activeProviders = [...(activeProviders || []), ...additional];
          if (currentUserId) {
            localStorage.setItem(`staysync_selected_providers_${currentUserId}`, JSON.stringify(activeProviders));
          }
        }
      }

      // Ensure activeProviders are fully populated with businessName and tiffinDetails
      activeProviders = await Promise.all((activeProviders || []).map(async (p) => {
        if (typeof p === 'object' && p !== null && p.businessName) return p;
        const pId = typeof p === 'object' ? (p?._id || p?.id) : p;
        if (!pId) return null;
        const found = (srvRes.data || []).find(s => s._id === pId);
        if (found) return found;
        try {
          const sRes = await servicesAPI.getService(pId);
          if (sRes?.success && sRes?.data) return sRes.data;
        } catch (e) {
          console.warn('Could not fetch service details', e);
        }
        return p;
      })).then(list => list.filter(Boolean));

      if (activeProviders && activeProviders.length > 0) {
        setSelectedProviders(activeProviders);
        const tiffin = activeProviders.find(p => p.category === 'Tiffin');
        if (tiffin?.tiffinDetails?.monthlyPrice || tiffin?.plans?.[0]?.price) {
          setLivingPlan(prev => ({ ...prev, foodCost: tiffin?.tiffinDetails?.monthlyPrice || tiffin?.plans?.[0]?.price }));
        }
        const clean = activeProviders.find(p => p.category === 'Cleaning' || p.category === 'Laundry');
        if (clean?.plans?.[0]?.price) {
          setLivingPlan(prev => ({ ...prev, laundryCost: clean.plans[0].price }));
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, targetCity, userStayPref, userGender]);

  // Reactive sync when roommateProfile or properties load (strictly enforcing gender)
  useEffect(() => {
    if (roommateProfile?.selectedStay && !pendingStayRequest) {
      const stayObj = typeof roommateProfile.selectedStay === 'object'
        ? roommateProfile.selectedStay
        : properties.find(p => p._id === roommateProfile.selectedStay);
      if (stayObj) {
        const uG = (user?.gender || roommateProfile?.gender || '').toLowerCase();
        const cat = (stayObj.hostelCategory || stayObj.title || '').toLowerCase();
        const isGirls = (cat.includes('girls') || cat.includes('female')) && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed');
        const isBoys = (cat.includes('boys') || cat.includes('male')) && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed');
        if ((uG === 'male' && isGirls) || (uG === 'female' && isBoys)) {
          console.warn('Blocked setting cross-gender stay in state from roommateProfile:', stayObj.title);
          setSelectedStay(null);
          return;
        }
        setSelectedStay(stayObj);
      }
    }
    if (roommateProfile?.selectedProviders && roommateProfile.selectedProviders.length > 0) {
      const provObjs = roommateProfile.selectedProviders.map(p => 
        typeof p === 'object' ? p : services.find(s => s._id === p) || p
      ).filter(Boolean);
      if (provObjs.length > 0) {
        setSelectedProviders(provObjs);
      }
    }
  }, [roommateProfile, properties, services, pendingStayRequest]);

  // Automatic purge safeguard: Ensure selectedStay never holds a cross-gender stay
  useEffect(() => {
    if (selectedStay) {
      const uG = (user?.gender || roommateProfile?.gender || '').toLowerCase();
      const cat = (selectedStay.hostelCategory || selectedStay.title || '').toLowerCase();
      const isGirls = (cat.includes('girls') || cat.includes('female')) && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed');
      const isBoys = (cat.includes('boys') || cat.includes('male')) && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed');
      if ((uG === 'male' && isGirls) || (uG === 'female' && isBoys)) {
        console.warn('Purged cross-gender stay from state & localStorage:', selectedStay.title);
        setSelectedStay(null);
        if (currentUserId) {
          localStorage.removeItem(`staysync_selected_stay_${currentUserId}`);
        }
        if (user?.id) {
          localStorage.removeItem(`staysync_selected_stay_${user.id}`);
        }
      }
    }
  }, [selectedStay, user?.gender, roommateProfile?.gender, currentUserId, user?.id]);

  // Tab switcher
  const switchTab = (tab) => {
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select Stay Handler (Directly opens Bed & Room Selector)
  const handleSelectStay = async (property) => {
    if (!property) return;
    const userGender = (user?.gender || roommateProfile?.gender || '').toLowerCase();
    const cat = (property?.hostelCategory || '').toLowerCase();
    const isGirlsOnly = cat.includes('girls') && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed');
    const isBoysOnly = cat.includes('boys') && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed');
    if ((userGender === 'male' && isGirlsOnly) || (userGender === 'female' && isBoysOnly)) {
      alert(`Cannot book: "${property.title}" is a ${isGirlsOnly ? 'Girls' : 'Boys'} Hostel. ${userGender === 'male' ? 'Male' : 'Female'} residents cannot book this property.`);
      return;
    }
    setBedSelectorProperty(property);
  };

  // Instant Mail Request & Booking Handler for Tiffin and Cleaning
  const handleInstantBookService = async (service, customPackageTitle, customPrice) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const cat = service.category || (customPackageTitle ? (customPackageTitle.toLowerCase().includes('laundry') ? 'Laundry' : 'Cleaning') : 'Tiffin');
    const price = customPrice || (cat === 'Tiffin' ? (service.tiffinDetails?.monthlyPrice || 2400) : (service.cleaningDetails?.priceMap?.['Regular Room'] || 350));
    const title = customPackageTitle || service.businessName;

    setBookingLoading(true);
    setTicketNotice(`Sending booking mail request for ${title}...`);

    try {
      const payload = {
        itemType: 'ServiceProvider',
        itemId: service._id,
        message: `Official booking inquiry for "${title}" (${cat}) by ${user.name || 'Resident'}. Email confirmation receipt generated.`,
        proposedPrice: Number(price)
      };

      const res = await requestsAPI.createRequest(payload);
      if (res.success) {
        handleSelectService(service);
        const bookingId = `SS-${cat.toUpperCase()}-${res.data?._id?.slice(-5)?.toUpperCase() || Date.now().toString().slice(-5)}`;

        // Web3Forms real email dispatch to admin/owner inbox
        sendWeb3FormsMail({
          subject: `StaySync Booking: ${user.name || 'Resident'} booked ${title} (${cat}) [${bookingId}]`,
          name: user.name,
          email: user.email,
          phone: user.phone,
          category: cat,
          title: title,
          price: price,
          city: service.city || targetCity,
          address: service.address,
          message: payload.message,
          bookingId
        }).catch(err => console.warn('[Web3Forms] Client dispatch warning:', err));

        setEmailModalData({
          category: cat,
          title: title,
          businessName: service.businessName || title,
          address: service.address || `${service.city || targetCity} Center`,
          city: service.city || targetCity,
          monthlyRent: null,
          tiffinPrice: cat === 'Tiffin' ? price : null,
          cleaningPrice: (cat === 'Cleaning' || cat === 'Laundry') ? price : null,
          ownerName: service.user?.name || service.businessName || 'Service Host',
          ownerPhone: service.contactPhone || service.user?.phone || '+91 98765 43210',
          bookingId
        });
        setTicketNotice(`Booking mail request sent for ${title}! Official confirmation dispatched.`);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to book service:', err);
      // Fallback: launch booking inquiry modal
      handleBookService(service);
    } finally {
      setBookingLoading(false);
    }
  };

  // Select Service Provider Handler
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
    const tiffin = updated.find(p => p.category === 'Tiffin');
    if (tiffin?.tiffinDetails?.monthlyPrice) {
      setLivingPlan(prev => ({ ...prev, foodCost: tiffin.tiffinDetails.monthlyPrice }));
    }
    try {
      if (updateProfile) {
        await updateProfile({ selectedProviders: updated.map(p => p._id) });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Shortlist toggle
  const handleToggleShortlist = (id) => {
    setShortlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Inquiry Modal open handlers
  const handleInquireProperty = (property) => {
    setModalTarget({ type: 'Property', item: property });
    setProposedPrice(property.monthlyRent || '');
    setInquiryMessage(`Hello, I am interested in viewing your room: "${property.title}". Please let me know when we can connect.`);
    setInquirySuccess(false);
    setModalError(null);
    setShowInquiryModal(true);
  };

  const handleBookService = (service) => {
    setModalTarget({ type: 'ServiceProvider', item: service });
    let price = 0;
    if (service.category === 'Tiffin') price = service.tiffinDetails?.monthlyPrice || 2400;
    if (service.category === 'Laundry') price = service.laundryDetails?.pricePerKg * 10 || 600;
    if (service.category === 'Cleaning') price = service.cleaningDetails?.priceMap?.['Regular Room'] || 500;
    if (service.category === 'Maintenance') price = service.maintenanceDetails?.calloutFee || 300;
    if (service.category === 'Movers') price = service.moversDetails?.baseFee || 2500;

    setProposedPrice(price);
    setInquiryMessage(`Hello, I would like to book your ${service.category} service: "${service.businessName}". Please confirm availability.`);
    setInquirySuccess(false);
    setModalError(null);
    setShowInquiryModal(true);
  };

  const handleInquireBundle = (bundle) => {
    setModalTarget({ type: 'Bundle', item: bundle });
    setProposedPrice(bundle.totalCost || 10300);
    setInquiryMessage(`Hello, I would like to reserve the combined "${bundle.property?.title || 'Stay'} + ${bundle.tiffin?.businessName || 'Tiffin'}" package.`);
    setInquirySuccess(false);
    setModalError(null);
    setShowInquiryModal(true);
  };

  // Inquiry submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingModal(true);
    setModalError(null);

    try {
      const payload = {
        itemType: modalTarget.type === 'Bundle' ? 'Property' : modalTarget.type,
        itemId: modalTarget.type === 'Bundle' ? modalTarget.item.property?._id : modalTarget.item._id,
        message: inquiryMessage,
        proposedPrice: proposedPrice ? parseInt(proposedPrice) : undefined
      };

      const res = await requestsAPI.createRequest(payload);
      if (res.success) {
        const cat = modalTarget.type === 'Property' ? (modalTarget.item.propertyType || 'Property') : (modalTarget.item.category || 'Tiffin');
        const bookingId = `SS-${cat.toUpperCase().slice(0, 4)}-${res.data?._id?.slice(-5)?.toUpperCase() || Date.now().toString().slice(-5)}`;

        // Web3Forms real email dispatch to admin/owner inbox
        sendWeb3FormsMail({
          subject: `StaySync Inquiry: ${user.name || 'Resident'} - ${modalTarget.item.title || modalTarget.item.businessName} (${cat}) [${bookingId}]`,
          name: user.name,
          email: user.email,
          phone: user.phone,
          category: cat,
          title: modalTarget.item.title || modalTarget.item.businessName,
          price: proposedPrice || modalTarget.item.monthlyRent || modalTarget.item.rentPerPerson || modalTarget.item.tiffinDetails?.monthlyPrice,
          city: modalTarget.item.city || targetCity,
          address: modalTarget.item.address,
          message: inquiryMessage,
          bookingId
        }).catch(err => console.warn('[Web3Forms] Client dispatch warning:', err));

        setEmailModalData({
          category: cat,
          title: modalTarget.item.title || modalTarget.item.businessName,
          businessName: modalTarget.item.businessName || modalTarget.item.title,
          propertyType: modalTarget.item.propertyType,
          roomType: modalTarget.item.roomType,
          address: modalTarget.item.address || `${modalTarget.item.city || targetCity} Center`,
          city: modalTarget.item.city || targetCity,
          monthlyRent: modalTarget.type === 'Property' ? (modalTarget.item.monthlyRent || proposedPrice) : null,
          tiffinPrice: cat === 'Tiffin' ? (modalTarget.item.tiffinDetails?.monthlyPrice || proposedPrice) : null,
          cleaningPrice: (cat === 'Cleaning' || cat === 'Laundry') ? (modalTarget.item.cleaningDetails?.priceMap?.['Regular Room'] || proposedPrice) : null,
          ownerName: modalTarget.item.owner?.name || modalTarget.item.user?.name || 'Host / Partner',
          ownerPhone: modalTarget.item.contactNumber || modalTarget.item.contactPhone || modalTarget.item.owner?.phone || '+91 98765 43210',
          bookingId
        });

        if (modalTarget.type === 'Property' || modalTarget.type === 'Bundle') {
          setTicketNotice(`Booking mail request sent for "${modalTarget.item.title}"! Owner & Admin notified.`);
        } else if (modalTarget.type === 'ServiceProvider') {
          handleSelectService(modalTarget.item);
          setTicketNotice(`Mail request sent to ${modalTarget.item.businessName}! Official receipt dispatched.`);
        }
        setInquirySuccess(true);
        setTimeout(() => {
          setShowInquiryModal(false);
          loadDashboardData();
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit inquiry.';
      setModalError(msg);
    } finally {
      setSubmittingModal(false);
    }
  };

  // Cancel Pending/Confirmed Booking Request with Cancellation Policy feedback
  const handleCancelRequest = async (id) => {
    const reason = window.prompt('Please enter a cancellation reason (optional):', 'Change of relocation plans');
    if (reason === null) return; // User pressed Cancel in prompt

    try {
      const res = await bookingsAPI.cancelBooking(id, { reason });
      if (res.success) {
        const refundNote = res.data?.refundAmount > 0
          ? ` Refund of ₹${res.data.refundAmount.toLocaleString('en-IN')} (${res.data.refundPercentage}%) has been queued under ${res.data.policy} Policy.`
          : ` No refund is applicable under ${res.data?.policy || 'Moderate'} Policy for current notice window.`;
        alert(`Booking cancelled.${refundNote}`);
        setTicketNotice('Booking cancelled successfully.');
        loadDashboardData();
      }
    } catch (err) {
      // Fallback to legacy request cancel if endpoint fails
      try {
        const fallbackRes = await requestsAPI.updateRequestStatus(id, { status: 'Cancelled' });
        if (fallbackRes.success) {
          setTicketNotice('Booking request cancelled.');
          loadDashboardData();
        }
      } catch (e) {
        alert(err.response?.data?.message || 'Failed to cancel request');
      }
    }
  };

  // Quick Accept as Admin / Owner (Allows instant testing & approval)
  const handleQuickAccept = async (requestId) => {
    try {
      const res = await requestsAPI.updateRequestStatus(requestId, {
        status: 'Accepted',
        asAdmin: true,
        responseMessage: 'Booking accepted by Hostel Owner & Admin. Welcome to your living space!'
      });
      if (res.success) {
        setTicketNotice('Booking Accepted! Unlocking your resident living dashboard...');
        setTimeout(() => {
          loadDashboardData();
        }, 600);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept booking');
    }
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await notificationsAPI.markAsRead();
      if (res.success) {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Apply custom living plan from modal
  const handleApplyLivingPlan = (newPlan) => {
    setMonthlyBudget(newPlan.budget);
    const planObj = {
      roomCost: newPlan.roomCost,
      foodCost: newPlan.foodCost,
      laundryCost: newPlan.laundryCost,
      cleaningCost: newPlan.cleaningCost,
      roomType: newPlan.roomType,
      isConfigured: true
    };
    setLivingPlan(planObj);
    setHasCustomLivingPlan(true);
    if (currentUserId) {
      try {
        localStorage.setItem(`staysync_living_plan_${currentUserId}`, JSON.stringify({
          budget: newPlan.budget,
          ...planObj
        }));
      } catch (e) {
        console.warn('Could not save living plan to localStorage', e);
      }
    }
  };

  // Filtered lists
  const tiffinServices = useMemo(() => services.filter(s => s.category === 'Tiffin'), [services]);
  const cleaningServices = useMemo(() => services.filter(s => s.category === 'Cleaning' || s.category === 'Laundry'), [services]);

  // Subscribed providers checking both state and active backend service requests
  const subscribedTiffin = useMemo(() => {
    const fromSelected = selectedProviders.find(p => p?.category === 'Tiffin');
    if (fromSelected) return fromSelected;
    const tReq = requests.find(r => 
      r.itemType === 'ServiceProvider' && 
      (r.serviceDetails?.serviceCategory === 'Tiffin' || r.itemId?.category === 'Tiffin' || (typeof r.itemId === 'string' && services.some(s => s._id === r.itemId && s.category === 'Tiffin')))
    );
    if (tReq) {
      const srv = typeof tReq.itemId === 'object' && tReq.itemId ? tReq.itemId : services.find(s => s._id === tReq.itemId);
      if (srv) return { ...srv, requestStatus: tReq.status };
    }
    return null;
  }, [selectedProviders, requests, services]);

  const subscribedLaundry = useMemo(() => {
    const fromSelected = selectedProviders.find(p => p?.category === 'Laundry' || p?.category === 'Cleaning');
    if (fromSelected) return fromSelected;
    const lReq = requests.find(r => 
      r.itemType === 'ServiceProvider' && 
      (r.serviceDetails?.serviceCategory === 'Cleaning' || r.serviceDetails?.serviceCategory === 'Laundry' || r.itemId?.category === 'Cleaning' || r.itemId?.category === 'Laundry' || (typeof r.itemId === 'string' && services.some(s => s._id === r.itemId && (s.category === 'Cleaning' || s.category === 'Laundry'))))
    );
    if (lReq) {
      const srv = typeof lReq.itemId === 'object' && lReq.itemId ? lReq.itemId : services.find(s => s._id === lReq.itemId);
      if (srv) return { ...srv, requestStatus: lReq.status };
    }
    return null;
  }, [selectedProviders, requests, services]);

  // Dynamically resolve day menu across booked Hostel mess or subscribed Tiffin kitchen
  const getActiveDayMenu = (dayKey) => {
    const key = (dayKey || '').toLowerCase();
    const dayFallback = DEFAULT_WEEKLY_MENU[key] || DEFAULT_WEEKLY_MENU.monday;

    // 1. Check booked Hostel messMenu for specific weekly overrides
    const stayMess = selectedStay?.messMenu || pendingStayRequest?.itemId?.messMenu;
    const stayWeekly = stayMess?.weeklyMenu;
    if (stayWeekly && stayWeekly[key] && (stayWeekly[key].breakfast || stayWeekly[key].lunch || stayWeekly[key].dinner)) {
      return {
        source: selectedStay?.title || pendingStayRequest?.itemId?.title || 'Hostel Mess',
        label: dayFallback.label || key,
        highlight: stayWeekly[key].highlight || dayFallback.highlight,
        breakfast: stayWeekly[key].breakfast || dayFallback.breakfast,
        lunch: stayWeekly[key].lunch || dayFallback.lunch,
        dinner: stayWeekly[key].dinner || dayFallback.dinner,
        special: stayWeekly[key].special || dayFallback.special
      };
    }

    // 2. Check subscribed Tiffin Provider weekly menu
    const tiffinWeekly = subscribedTiffin?.weeklyMenu || subscribedTiffin?.tiffinDetails?.weeklyMenu;
    if (tiffinWeekly && tiffinWeekly[key] && (tiffinWeekly[key].breakfast || tiffinWeekly[key].lunch || tiffinWeekly[key].dinner)) {
      return {
        source: subscribedTiffin?.businessName || 'Tiffin Partner',
        label: dayFallback.label || key,
        highlight: tiffinWeekly[key].highlight || dayFallback.highlight,
        breakfast: tiffinWeekly[key].breakfast || dayFallback.breakfast,
        lunch: tiffinWeekly[key].lunch || dayFallback.lunch,
        dinner: tiffinWeekly[key].dinner || dayFallback.dinner,
        special: tiffinWeekly[key].special || dayFallback.special
      };
    }

    // 3. Dynamic day-wise schedule: Each day (Monday to Sunday) has a unique, fresh menu!
    return {
      source: selectedStay?.title || subscribedTiffin?.businessName || 'Hostel Daily Mess',
      label: dayFallback.label || key,
      highlight: dayFallback.highlight || 'Daily Fresh Mess Menu',
      breakfast: dayFallback.breakfast,
      lunch: dayFallback.lunch,
      dinner: dayFallback.dinner,
      special: dayFallback.special
    };
  };

  const stayCategoryLabel = useMemo(() => {
    if (selectedStay) {
      const type = (selectedStay.propertyType || '').toLowerCase();
      const hostCat = (selectedStay.hostelCategory || '').toLowerCase();
      if (type === 'hostel' || hostCat.includes('hostel')) return 'My Hostel';
      if (type === 'pg' || hostCat.includes('pg')) return 'My PG';
      if (type === 'room') return 'My Room';
      if (type === 'flat' || hostCat.includes('flat')) return 'My Flat';
      return 'My Stay';
    }
    if (pendingStayRequest) {
      const itemType = (pendingStayRequest.itemId?.propertyType || '').toLowerCase();
      if (itemType === 'hostel') return 'Booked Hostel';
      if (itemType === 'pg') return 'Booked PG';
      if (itemType === 'room') return 'Booked Room';
      if (itemType === 'flat') return 'Booked Flat';
      return 'Booked Stay';
    }
    return userStayPref === 'Hostel' ? 'Hostels' : userStayPref === 'PG' ? 'PGs' : userStayPref === 'Flat' ? 'Flats' : userStayPref === 'Room' ? 'Rooms' : 'My Stay';
  }, [selectedStay, pendingStayRequest, userStayPref]);

  const dashboardTabs = useMemo(() => {
    if (isProvider) {
      if (isPropertyOwner) {
        return [
          { id: 'requests', label: 'Tenant Inquiries & Bookings', count: requests.length, icon: Send }
        ];
      }
      if (isTiffinPartner) {
        return [
          { id: 'requests', label: 'Meal Orders & Inquiries', count: requests.length, icon: Send },
          { id: 'tiffin', label: 'Tiffin Kitchen Portal', icon: UtensilsCrossed }
        ];
      }
      if (isCleaningPartner) {
        return [
          { id: 'requests', label: 'Cleaning Appointments', count: requests.length, icon: Send },
          { id: 'cleaning', label: 'Cleaning & Laundry Portal', icon: Sparkles }
        ];
      }
      return [
        { id: 'requests', label: 'My Bookings & Inquiries', count: requests.length, icon: Send }
      ];
    }

    const tabs = [
      { id: 'overview', label: stayCategoryLabel, icon: Home }
    ];

    // Show Tiffin tab if resident subscribed to tiffin OR is living in a PG/Flat (where meals are needed)
    if (hasTiffin || subscribedTiffin || isPgOrFlat) {
      tabs.push({ 
        id: 'tiffin', 
        label: 'Tiffin Plans', 
        icon: UtensilsCrossed, 
        badge: (hasTiffin || subscribedTiffin) ? '✓ Subscribed' : 'Recommended' 
      });
    }

    // Show Cleaning tab if resident subscribed to cleaning OR is living in a PG/Flat (where cleaning is needed)
    if (hasLaundry || subscribedLaundry || isPgOrFlat) {
      tabs.push({ 
        id: 'cleaning', 
        label: 'Cleaning & Laundry', 
        icon: Sparkles, 
        badge: (hasLaundry || subscribedLaundry) ? '✓ Subscribed' : 'Recommended' 
      });
    }

    tabs.push({ id: 'location_hub', label: 'My Location & Hub', icon: Compass });
    tabs.push({ id: 'community', label: 'Community Board', icon: Users });
    tabs.push({ id: 'requests', label: 'My Bookings & Inquiries', count: requests.length, icon: Send });

    return tabs;
  }, [isProvider, isPropertyOwner, isTiffinPartner, isCleaningPartner, stayCategoryLabel, hasTiffin, subscribedTiffin, hasLaundry, subscribedLaundry, isPgOrFlat, requests.length]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.readStatus).length, [notifications]);

  const activeStayRequest = useMemo(() => {
    return requests.find(r => 
      (r.itemType === 'Property' || r.itemType === 'Stay') && 
      ((r.itemId?._id && r.itemId._id === selectedStay?._id) || r.itemId === selectedStay?._id)
    );
  }, [requests, selectedStay]);

  const stayStatus = activeStayRequest?.status || (selectedStay ? 'Confirmed' : null);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">⏳ Pending Approval</span>;
      case 'Accepted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">✓ Accepted by Owner</span>;
      case 'Payment Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200/80">💳 Payment Due</span>;
      case 'Confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">🎉 Confirmed Stay</span>;
      case 'Checked In':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80">🏠 Checked In</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200/80">★ Stay Completed</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200/80">✕ Rejected</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">✕ Cancelled</span>;
      case 'Expired':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">⌛ Hold Expired</span>;
      case 'Refund Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">🔄 Refund Pending</span>;
      case 'Refunded':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">✓ Refunded</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying resident session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20">
      
      {/* ---------------------------------------------------- */}
      {/* 1. TOP HEADER / USER SUMMARY & STATS                 */}
      {/* ---------------------------------------------------- */}
      <section className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                {greeting}, {userName}
              </h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {isProvider ? (
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>{getRoleBadgeLabel(user)} Workspace • <strong className="text-gray-900">{user?.businessName || user?.name}</strong> {targetCity ? `(${targetCity})` : ''}</span>
                  </span>
                ) : hasStay ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resident of <strong className="text-gray-900">{selectedStay.title}</strong>, <span className="capitalize">{selectedStay.city || targetCity}</span></span>
                  </span>
                ) : pendingStayRequest ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-300 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Booking Requested: <strong className="text-gray-900">{typeof pendingStayRequest.itemId === 'object' ? pendingStayRequest.itemId.title : 'Stay'}</strong> (Awaiting Owner / Admin Approval)</span>
                  </span>
                ) : hasCustomLivingPlan ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Personalized living plan for <strong className="text-gray-900 capitalize">{targetCity || 'Indore'}</strong></span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Looking for Stays in <strong className="text-gray-900 capitalize">{targetCity || 'Indore'}</strong></span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Chips */}
            {isProvider ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={getRoleDashboardLink(user)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4 text-white" />
                  <span>Go to Provider Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    loadDashboardData();
                    setTicketNotice('Live bookings refreshed!');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-200/90 hover:border-purple-200 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-purple-600" />
                  <span>Refresh</span>
                </button>
              </div>
            ) : hasStay ? (
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    loadDashboardData();
                    setTicketNotice('Dashboard data updated from live database!');
                  }}
                  disabled={loading}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200/90 hover:border-emerald-300 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Sync and update latest dashboard data from database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
                  <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowRentModal(true);
                    setRentPaidSuccess(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Rent Online</span>
                </button>

                <button
                  onClick={() => {
                    setTicketNotice('Maintenance ticket logged! Host notified immediately.');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-800 border border-gray-200/90 hover:border-amber-300 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Report Issue</span>
                </button>

                <button
                  onClick={() => setTicketNotice('Rent Agreement copy generated and saved to your downloads!')}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200/90 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Agreement</span>
                </button>
              </div>
            ) : pendingStayRequest ? (
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    loadDashboardData();
                    setTicketNotice('Dashboard data updated from live database!');
                  }}
                  disabled={loading}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200/90 hover:border-emerald-300 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Sync and update latest dashboard data from database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
                  <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAccept(pendingStayRequest._id)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Accept booking as Property Owner / Admin"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept as Admin / Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelRequest(pendingStayRequest._id)}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-gray-200/90 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Booking</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    loadDashboardData();
                    setTicketNotice('Dashboard data updated from live database!');
                  }}
                  disabled={loading}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200/90 hover:border-indigo-300 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Sync and update latest dashboard data from database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
                  <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
                </button>
                {wantsRoom && (
                  <button
                    onClick={() => {
                      const el = document.getElementById('section-rooms');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else navigate('/marketplace?tab=rooms');
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/90 hover:border-indigo-200 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Find Room</span>
                  </button>
                )}

                {wantsTiffin && (
                  <button
                    onClick={() => {
                      const el = document.getElementById('section-food');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else navigate('/marketplace?tab=services');
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/90 hover:border-indigo-200 text-xs font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Find Tiffin</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{hasCustomLivingPlan ? 'Edit Preferences' : 'Calculate Living Plan'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 4 Compact Modern Summary Cards */}
          {isProvider ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Bookings & Inquiries */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Bookings &amp; Inquiries</span>
                  <span className="p-2 bg-purple-50 text-purple-700 rounded-xl shadow-2xs">
                    <BookMarked className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {requests.length}
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 mt-1 block">
                    Total submissions recorded
                  </span>
                </div>
              </div>

              {/* Card 2: Managed Units */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Managed Units</span>
                  <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {properties.length}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                    Properties active in {targetCity || 'Indore'}
                  </span>
                </div>
              </div>

              {/* Card 3: Confirmed Bookings */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Confirmed Bookings</span>
                  <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                    {requests.filter(r => r.status === 'Accepted' || r.status === 'Confirmed').length}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500 mt-1 block">
                    Approved bookings
                  </span>
                </div>
              </div>

              {/* Card 4: Pending Inquiries */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Pending Action</span>
                  <span className="p-2 bg-amber-50 text-amber-700 rounded-xl shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-800 tracking-tight">
                    {requests.filter(r => r.status === 'Pending').length}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 mt-1 block">
                    Awaiting response
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Monthly Cost */}
            <div 
              onClick={() => {
                if (!hasStay && !pendingStayRequest && !hasCustomLivingPlan) {
                  setIsCalculatorOpen(true);
                }
              }}
              className={`bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${!hasStay && !pendingStayRequest && !hasCustomLivingPlan ? 'cursor-pointer group' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                  {hasStay ? 'Stay Monthly Rent' : pendingStayRequest ? 'Proposed Rent' : 'Monthly Living Cost'}
                </span>
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shadow-2xs group-hover:bg-emerald-200 transition-colors">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div>
                {hasStay ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        ₹{(selectedStay.monthlyRent || selectedStay.rentPerPerson || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        / ₹{monthlyBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                      {Math.min(Math.round(((selectedStay.monthlyRent || selectedStay.rentPerPerson || 0) / monthlyBudget) * 100), 100)}% of budget used
                    </span>
                  </>
                ) : pendingStayRequest ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        ₹{(pendingStayRequest.proposedPrice || pendingStayRequest.itemId?.monthlyRent || pendingStayRequest.itemId?.rentPerPerson || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        / ₹{monthlyBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 mt-1 block">
                      ⏳ Proposed booking rent
                    </span>
                  </>
                ) : hasCustomLivingPlan ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        ₹{totalEstimatedLivingCost.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        / ₹{monthlyBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                      {Math.min(Math.round((totalEstimatedLivingCost / monthlyBudget) * 100), 100)}% of budget used
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        ₹0
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        / ₹{monthlyBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 mt-1 block group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                      <span>Plan not set • Click to calculate</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Card 2: Active Stay / Room Matches */}
            {hasStay ? (
              <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white p-5 rounded-3xl border border-emerald-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Active Stay</span>
                  <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shadow-2xs">
                    <Home className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-lg font-black text-gray-900 block truncate" title={selectedStay.title}>
                    {selectedStay.title}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 mt-1 block flex items-center gap-1">
                    ✓ Confirmed in {selectedStay.city || targetCity}
                  </span>
                </div>
              </div>
            ) : pendingStayRequest ? (
              <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white p-5 rounded-3xl border border-amber-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Booked Stay (Pending)</span>
                  <span className="p-2 bg-amber-100 text-amber-700 rounded-xl shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                  </span>
                </div>
                <div>
                  <span className="text-lg font-black text-gray-900 block truncate">
                    {typeof pendingStayRequest.itemId === 'object' ? pendingStayRequest.itemId.title : 'Stay Booking'}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 mt-1 block flex items-center gap-1">
                    ⏳ Awaiting Owner / Admin Approval
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Room Matches</span>
                  <span className="p-2 bg-gray-100 text-gray-700 rounded-xl shadow-2xs">
                    <Home className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {properties.length || 0}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 mt-1 block flex items-center gap-1">
                    ✓ Verified in {targetCity}
                  </span>
                </div>
              </div>
            )}

            {/* Card 3: Living Status / Setup */}
            {hasStay ? (
              <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Living Status</span>
                  <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-lg font-black text-emerald-700 block">
                    {stayStatus === 'Accepted' || stayStatus === 'Confirmed' ? 'Move-In Ready' : 'Request Pending'}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                    Verified Resident Space
                  </span>
                </div>
              </div>
            ) : pendingStayRequest ? (
              <div className="bg-white p-5 rounded-3xl border border-amber-200/90 shadow-xs flex flex-col justify-between hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Living Status</span>
                  <span className="p-2 bg-amber-50 text-amber-700 rounded-xl shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  </span>
                </div>
                <div>
                  <span className="text-lg font-black text-amber-800 block">
                    Approval Pending
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                    Owner review in progress
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Living Setup</span>
                  <span className="p-2 bg-gray-100 text-gray-700 rounded-xl shadow-2xs">
                    <SlidersHorizontal className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {userServices.length} Service{userServices.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500 mt-1 block capitalize truncate">
                    {userServices.join(', ')}
                  </span>
                </div>
              </div>
            )}

            {/* Card 4: Active Requests */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Active Requests</span>
                <span className="p-2 bg-gray-100 text-gray-700 rounded-xl shadow-2xs">
                  <Send className="w-4 h-4" />
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {requests.length}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                  {requests.filter(r => r.status === 'Accepted').length} confirmed bookings
                </span>
              </div>
            </div>

          </div>
        )}

        </div>

        {/* -------------------------------------------------- */}
        {/* 2. SUB-NAVIGATION SEGMENTED PILLS TABS             */}
        {/* -------------------------------------------------- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 w-fit overflow-x-auto hide-scrollbar">
            {dashboardTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-teal-100 text-teal-800">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">

        {/* ================================================== */}
        {/* TAB 1: OVERVIEW (Master Persona Dashboard Flow - Residents Only) */}
        {/* ================================================== */}
        {!isProvider && activeTab === 'overview' && (
          <>
            {/* ---------------------------------------------------- */}
            {/* 0. YOUR CONFIRMED LIVING SPACE & ACTIVE STAY PANEL   */}
            {/* ---------------------------------------------------- */}
            {/* Rent Online Payment Modal */}
            {showRentModal && selectedStay && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-black text-gray-900">Pay Monthly Stay Rent</h3>
                      <p className="text-xs text-gray-500">{selectedStay.title}</p>
                    </div>
                    <button
                      onClick={() => setShowRentModal(false)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {rentPaidSuccess ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-black text-gray-900">Payment Successful!</h4>
                      <p className="text-xs text-gray-600">Rent of ₹{(selectedStay.monthlyRent || 0).toLocaleString('en-IN')} received. Digital receipt generated.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Rent Amount Due</span>
                          <strong className="text-2xl font-black text-emerald-800 block">₹{(selectedStay.monthlyRent || 0).toLocaleString('en-IN')}</strong>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
                          Current Month
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 block">Select Payment Method</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500 bg-emerald-50/30 cursor-pointer">
                            <input type="radio" name="payMethod" defaultChecked className="text-emerald-600" />
                            <span className="text-xs font-bold text-gray-900">Instant UPI (GPay / PhonePe / Paytm)</span>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="payMethod" className="text-emerald-600" />
                            <span className="text-xs font-medium text-gray-700">Debit / Credit Card</span>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="payMethod" className="text-emerald-600" />
                            <span className="text-xs font-medium text-gray-700">Net Banking</span>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setRentPaidSuccess(true);
                          setTicketNotice(`Rent of ₹${(selectedStay.monthlyRent || 0).toLocaleString('en-IN')} paid successfully! Digital receipt generated.`);
                          setTimeout(() => {
                            setShowRentModal(false);
                          }, 1600);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Confirm & Pay ₹{(selectedStay.monthlyRent || 0).toLocaleString('en-IN')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedStay ? (
              /* ======================================================== */
              /* RESIDENT LIVING DASHBOARD (When Stay Is Booked/Selected) */
              /* ======================================================== */
              <div className="space-y-8 animate-fadeIn">
                {/* Feedback Notice */}
                {ticketNotice && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{ticketNotice}</span>
                    </div>
                    <button onClick={() => setTicketNotice('')} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer">✕</button>
                  </div>
                )}

                {/* 1. PRIMARY STAY DETAILS CARD */}
                <div className="bg-white rounded-3xl border border-emerald-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all overflow-hidden relative">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-gray-150">
                    
                    {/* Left: Image & Titles */}
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center flex-1">
                      <div className="relative w-full sm:w-56 h-40 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/90 shadow-2xs">
                        <img
                          src={normalizeImageUrl(selectedStay.photos?.[0])}
                          alt={selectedStay.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                          ✓ Active Resident Stay
                        </span>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            stayStatus === 'Accepted' || stayStatus === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {stayStatus === 'Accepted' || stayStatus === 'Confirmed'
                              ? '✓ Confirmed & Move-In Ready'
                              : '⏳ Booking Request Submitted (Pending Approval)'}
                          </span>
                          <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bold border border-emerald-200">
                            {selectedStay.hostelCategory || 'Girls & Boys Hostel'} • {selectedStay.roomType || '2-Seater Room'}
                          </span>
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Living Space
                          </span>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                          {selectedStay.title}
                        </h2>

                        <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{[selectedStay.address, selectedStay.city].filter(Boolean).join(', ').replace(/\s+,/g, ', ').replace(/,\s*,/g, ', ').trim()}</span>
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(selectedStay.amenities?.slice(0, 6) || ['WiFi', 'AC', 'Geyser', 'RO Water', 'Cleaning', 'Security']).map(am => (
                            <span key={am} className="text-[10px] font-semibold bg-gray-100/80 text-gray-700 px-2.5 py-0.5 rounded-lg border border-gray-200/60">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Rent, Payment & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 gap-4 shrink-0">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Rent Per Person</span>
                        <span className="text-3xl font-black text-emerald-600 tracking-tight">₹{(selectedStay.rentPerPerson || selectedStay.monthlyRent || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-gray-400 block font-medium">/person/month</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setShowRentManagerModal(true)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Rent Ledger & Pay</span>
                        </button>
                        <button
                          onClick={() => setShowMaintenanceModal(true)}
                          className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Maintenance</span>
                        </button>
                        {((selectedStay.location?.coordinates?.[1] || selectedStay.latitude) && (selectedStay.location?.coordinates?.[0] || selectedStay.longitude)) && (
                          <a
                            href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${selectedStay.location?.coordinates?.[1] || selectedStay.latitude}%2C${selectedStay.location?.coordinates?.[0] || selectedStay.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
                            title="Open Directions in OpenStreetMap"
                          >
                            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Directions</span>
                          </a>
                        )}
                        <button
                          onClick={handleOpenAgreement}
                          className="px-3.5 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Agreement</span>
                        </button>
                        <button
                          onClick={() => handleSelectStay(selectedStay)}
                          className="px-3.5 py-2.5 border border-gray-200/90 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl transition-colors cursor-pointer active:scale-95"
                        >
                          Change Stay
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Sub-grid: Landlord Info + House Rules + Move-in Docs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
                    
                    {/* Landlord Contact */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Host &amp; Caretaker</span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm shadow-2xs">
                          {selectedStay.owner?.name?.[0] || 'H'}
                        </div>
                        <div>
                          <strong className="text-gray-900 block font-extrabold">{selectedStay.owner?.name || 'Property Landlord / Caretaker'}</strong>
                          <span className="text-[11px] text-gray-500 font-medium">{selectedStay.contactNumber || selectedStay.owner?.phone || '+91 98260 12345'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${selectedStay.contactNumber || '9826012345'}`}
                          className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" /> Call
                        </a>
                        <Link
                          to="/chat"
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center font-black transition-all flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3" /> Chat
                        </Link>
                      </div>
                    </div>

                    {/* House Guidelines & Rules */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Living Guidelines &amp; Timings</span>
                      <div className="space-y-1.5 text-gray-700 font-medium">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gate Closes:</span>
                          <strong className="text-gray-900">10:30 PM (Biometric/Key)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Visitors Policy:</span>
                          <strong className="text-gray-900">Till 8:00 PM in lounge</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">WiFi SSID:</span>
                          <strong className="text-emerald-700 flex items-center gap-1"><Wifi className="w-3 h-3" /> StaySync_HighSpeed</strong>
                        </div>
                      </div>
                    </div>

                    {/* Move-In & Security Deposit */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Stay Financials &amp; Agreement</span>
                      <div className="space-y-1 text-gray-700 font-medium">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Security Deposit:</span>
                          <strong className="text-gray-900">₹{(selectedStay.deposit || (selectedStay.monthlyRent || 7000) * 2).toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Notice Period:</span>
                          <strong className="text-gray-900">30 Days</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => setTicketNotice('Rent Agreement copy generated and saved to your downloads!')}
                        className="w-full mt-2 py-2 bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-gray-500" /> Download Agreement
                      </button>
                    </div>

                  </div>
                </div>

                {/* 2. HOSTEL MESS & LIVE DINING SCHEDULE (Hostel Residents Only) */}
                {(!isPgOrFlat && (selectedStay.propertyType === 'Hostel' || selectedStay.foodAvailable || selectedStay.messMenu)) && (() => {
                  const uG = (user?.gender || roommateProfile?.gender || '').toLowerCase();
                  const cat = (selectedStay.hostelCategory || selectedStay.title || '').toLowerCase();
                  const isGirls = (cat.includes('girls') || cat.includes('female')) && !cat.includes('boys') && !cat.includes('&');
                  const isBoys = (cat.includes('boys') || cat.includes('male')) && !cat.includes('girls') && !cat.includes('&');
                  if ((uG === 'male' && isGirls) || (uG === 'female' && isBoys)) return null;

                  return (
                    <div className="bg-white rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-amber-100">
                        <div>
                          <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-amber-600" />
                            <span>{selectedStay.title} – Hostel Mess Menu</span>
                          </h3>
                          <p className="text-[11px] text-gray-500 font-medium">Daily breakfast, lunch &amp; dinner prepared fresh in the hostel mess.</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                          Hostel Mess Included
                        </span>
                      </div>

                      {/* Day Selector Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                        {[
                          { key: 'monday', short: 'Mon' },
                          { key: 'tuesday', short: 'Tue' },
                          { key: 'wednesday', short: 'Wed' },
                          { key: 'thursday', short: 'Thu' },
                          { key: 'friday', short: 'Fri' },
                          { key: 'saturday', short: 'Sat' },
                          { key: 'sunday', short: 'Sun' }
                        ].map((d) => {
                          const isSelected = selectedTiffinDay === d.key;
                          const isToday = getTodayKey() === d.key;
                          return (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => setSelectedTiffinDay(d.key)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#059669] text-white shadow-xs font-black'
                                  : 'bg-gray-50 text-gray-700 hover:bg-amber-50 hover:text-amber-800 border border-gray-200'
                              }`}
                            >
                              <span>{d.short}</span>
                              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Day Menu Grid */}
                      {(() => {
                        const dayMenu = getActiveDayMenu(selectedTiffinDay);
                        return (
                          <div key={selectedTiffinDay} className="space-y-3 pt-1 animate-fadeIn">
                            <div className="flex items-center justify-between text-xs px-1">
                              <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>{dayMenu.label} ({dayMenu.highlight})</span>
                              </span>
                              {selectedTiffinDay === getTodayKey() && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                                  ✓ Today's Active Schedule
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-1">
                                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Coffee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Breakfast (8:30 AM)</span>
                                </span>
                                <p className="text-xs font-bold text-gray-900 leading-relaxed">{dayMenu.breakfast}</p>
                              </div>
                              <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-1">
                                <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Lunch (1:00 PM)</span>
                                </span>
                                <p className="text-xs font-bold text-gray-900 leading-relaxed">{dayMenu.lunch}</p>
                              </div>
                              <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-1">
                                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Moon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Dinner (8:30 PM)</span>
                                </span>
                                <p className="text-xs font-bold text-gray-900 leading-relaxed">{dayMenu.dinner}</p>
                              </div>
                            </div>

                            {dayMenu.special && (
                              <div className="p-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs font-bold text-amber-900">
                                <span className="flex items-center gap-1.5">
                                  <span>🌟 Chef's Daily Special Sweet / Treat:</span>
                                  <strong className="text-amber-950 font-black">{dayMenu.special}</strong>
                                </span>
                                <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                                  Freshly Made
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                {/* 3. ESSENTIAL SERVICES & SMART SUGGESTIONS (PG & Flat Residents) */}
                {isPgOrFlat && (
                  <div className="space-y-6 pt-1">
                    {/* Notice & Context Banner */}
                    <div className="p-5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block border border-amber-200">
                              PG &amp; Flat Living Services
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              Smart Daily Living Add-ons
                            </span>
                          </div>
                          <h3 className="text-base font-black text-gray-900 mt-1">
                            Daily Meals, Housekeeping &amp; Laundry Add-ons
                          </h3>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            In PG and Flat living, meals and housekeeping are not bundled by default. Subscribe to verified neighborhood partners below:
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => switchTab('tiffin')}
                          className="px-3.5 py-2 bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{subscribedTiffin ? 'View Active Tiffin Plan' : 'Explore Tiffins'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => switchTab('cleaning')}
                          className="px-3.5 py-2 bg-white text-cyan-800 border border-cyan-300 hover:bg-cyan-50 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                          <span>{subscribedLaundry ? 'View Active Cleaning' : 'Explore Cleaning'}</span>
                        </button>
                      </div>
                    </div>

                    {/* A. TIFFIN SECTION: SUBSCRIBED PLAN OR SMART SUGGESTIONS */}
                    {subscribedTiffin ? (
                      <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 sm:p-7 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-gray-150">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <UtensilsCrossed className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  ✓ Aapka Active Subscribed Plan (Liya Hua Plan)
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  Doorstep Delivery to Your Room
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-gray-900 mt-1">
                                {subscribedTiffin.businessName}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                            <div className="text-right">
                              <span className="text-xl font-black text-emerald-700 block">
                                ₹{(subscribedTiffin.tiffinDetails?.monthlyPrice || 2400).toLocaleString('en-IN')}/mo
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lunch &amp; Dinner Included</span>
                            </div>
                            <a
                              href={`tel:${subscribedTiffin.contactPhone || '9826012345'}`}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call Kitchen
                            </a>
                            <Link
                              to="/chat"
                              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-2xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-gray-600" /> Chat
                            </Link>
                          </div>
                        </div>

                        {/* Day Selector Pills & Live Kitchen Menu Broadcast */}
                        <div className="space-y-3 pt-1">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Live Day-Wise Kitchen Menu Broadcast</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setMealPaused(!mealPaused);
                                  setTicketNotice(mealPaused ? 'Meal resumed for today!' : 'Today\'s meal paused. Daily discount adjusted in billing.');
                                }}
                                className={`px-3 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                                  mealPaused
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {mealPaused ? 'Resume Today\'s Meal' : 'Pause Today\'s Meal'}
                              </button>
                              <button
                                type="button"
                                onClick={() => switchTab('tiffin')}
                                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                              >
                                Manage on Tiffin Tab →
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            {[
                              { key: 'monday', short: 'Mon' },
                              { key: 'tuesday', short: 'Tue' },
                              { key: 'wednesday', short: 'Wed' },
                              { key: 'thursday', short: 'Thu' },
                              { key: 'friday', short: 'Fri' },
                              { key: 'saturday', short: 'Sat' },
                              { key: 'sunday', short: 'Sun' }
                            ].map((d) => {
                              const isSelected = selectedTiffinDay === d.key;
                              const isToday = getTodayKey() === d.key;
                              return (
                                <button
                                  key={d.key}
                                  type="button"
                                  onClick={() => setSelectedTiffinDay(d.key)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-[#059669] text-white shadow-xs font-black'
                                      : 'bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200'
                                  }`}
                                >
                                  <span>{d.short}</span>
                                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                                </button>
                              );
                            })}
                          </div>

                          {(() => {
                            const dayMenu = getActiveDayMenu(selectedTiffinDay);
                            return (
                              <div key={selectedTiffinDay} className="space-y-3 pt-1 animate-fadeIn">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-200/70 space-y-1">
                                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                      <Coffee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Breakfast (8:30 AM)</span>
                                    </span>
                                    <p className="text-xs font-bold text-gray-900 leading-relaxed">{dayMenu.breakfast}</p>
                                  </div>
                                  <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-1">
                                    <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                      <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span>Lunch (1:00 PM)</span>
                                    </span>
                                    <p className="text-xs font-bold text-gray-900 leading-relaxed">{dayMenu.lunch}</p>
                                  </div>
                                  <div className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-200/70 space-y-1">
                                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                      <Moon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Dinner (8:30 PM)</span>
                                    </span>
                                    <p className="text-xs font-bold text-gray-900 leading-relaxed">{dayMenu.dinner}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-amber-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Essential Add-On for PG &amp; Flat
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                ⚡ Hot Doorstep Meals
                              </span>
                            </div>
                            <h3 className="text-base font-black text-gray-900 mt-1 flex items-center gap-2">
                              <Utensils className="w-4 h-4 text-amber-600" />
                              <span>Recommended Daily Tiffin Kitchens in {targetCity}</span>
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium">
                              Select a verified kitchen to get fresh home-cooked lunch &amp; dinner. Subscribing sends an instant booking request to the provider.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => switchTab('tiffin')}
                            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                          >
                            <span>View All Tiffins</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Top 3 Tiffin Suggestions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tiffinServices.slice(0, 3).map(srv => {
                            const isSubscribed = selectedProviders.some(p => (p?._id || p) === srv._id);
                            return (
                              <div key={srv._id} className="bg-amber-50/20 rounded-2xl border border-amber-200/80 p-4 hover:border-amber-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="h-32 rounded-xl overflow-hidden relative bg-gray-100">
                                    <img
                                      src={normalizeImageUrl(srv.photos?.[0]) || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'}
                                      alt={srv.businessName}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-2 left-2 bg-amber-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                                      {srv.tiffinDetails?.mealType || 'Pure Veg'}
                                    </span>
                                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-xs font-black px-2 py-0.5 rounded-lg">
                                      ₹{(srv.tiffinDetails?.monthlyPrice || 2400).toLocaleString('en-IN')}/mo
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-black text-sm text-gray-900">{srv.businessName}</h4>
                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>{srv.address || srv.city}</span>
                                    </p>
                                  </div>

                                  <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 text-[11px] space-y-0.5">
                                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Daily Menu Highlights</span>
                                    <p className="text-gray-700 font-medium line-clamp-2">
                                      {srv.tiffinDetails?.description || 'Dal Tadka, Shahi Paneer, 4 Tawa Rotis, Jeera Rice, Salad & Sweet.'}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleInstantBookService(srv)}
                                  disabled={bookingLoading}
                                  className="w-full py-2.5 bg-[#059669] hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Subscribe Plan &amp; Send Request</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* B. CLEANING & LAUNDRY SECTION */}
                    {subscribedLaundry ? (
                      <div className="bg-white rounded-3xl border-2 border-cyan-400 p-6 sm:p-7 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-gray-150">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-200">
                                  ✓ Aapka Active Subscribed Plan (Liya Hua Plan)
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  Weekly Routine &amp; Laundry
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-gray-900 mt-1">
                                {subscribedLaundry.businessName}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => setTicketNotice('Doorstep cleaning pickup scheduled for tomorrow 10:00 AM!')}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                            >
                              Request Visit Today
                            </button>
                            <a
                              href={`tel:${subscribedLaundry.contactPhone || '9826012345'}`}
                              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-cyan-700" /> Call
                            </a>
                            <button
                              type="button"
                              onClick={() => switchTab('cleaning')}
                              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 underline ml-2"
                            >
                              Manage on Cleaning Tab →
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3.5 bg-cyan-50/50 rounded-2xl border border-cyan-100">
                            <span className="text-[10px] font-bold text-cyan-800 uppercase block">Weekly Routine</span>
                            <strong className="text-gray-900 font-extrabold block mt-0.5">Tuesday &amp; Friday Visits</strong>
                            <span className="text-[11px] text-gray-500 font-medium">Brooming, floor mopping with disinfectant, bathroom scrub</span>
                          </div>
                          <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <span className="text-[10px] font-bold text-blue-800 uppercase block">Laundry Pickup</span>
                            <strong className="text-gray-900 font-extrabold block mt-0.5">10kg Monthly Plan</strong>
                            <span className="text-[11px] text-gray-500 font-medium">Doorstep wash, dry and steam iron with 24-hr return</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl border border-cyan-200/90 p-6 sm:p-7 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-cyan-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded-full border border-cyan-200">
                                Essential Add-On for PG &amp; Flat
                              </span>
                              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                ✨ Sparkling Room Care
                              </span>
                            </div>
                            <h3 className="text-base font-black text-gray-900 mt-1 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-cyan-600" />
                              <span>Housekeeping &amp; Laundry Services for Your Room</span>
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium">
                              Keep your room spotless and clothes fresh. Choose an on-demand package to send an instant request:
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => switchTab('cleaning')}
                            className="text-xs font-bold text-cyan-800 hover:text-cyan-950 flex items-center gap-1 cursor-pointer"
                          >
                            <span>View All Packages</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 3 Instant Packages */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            {
                              title: 'Regular Floor Sweep & Mop',
                              price: '₹299/visit',
                              priceNum: 299,
                              desc: 'Brooming, phenyl floor mopping, dusting desk, and garbage disposal.',
                              icon: Brush,
                              tag: 'Weekly Need'
                            },
                            {
                              title: 'Bathroom Deep Clean & Scrub',
                              price: '₹449/visit',
                              priceNum: 449,
                              desc: 'Floor and wall tile scrubbing, toilet pot acid descaling & sanitization.',
                              icon: Sparkles,
                              tag: 'High Hygiene'
                            },
                            {
                              title: 'Doorstep Wash & Steam Iron',
                              price: '₹499/month',
                              priceNum: 499,
                              desc: 'Weekly 15 clothes wash, dry & crisp steam iron with 24-hr doorstep return.',
                              icon: Shirt,
                              tag: 'Laundry Care'
                            }
                          ].map((pkg, i) => {
                            const Icon = pkg.icon;
                            return (
                              <div key={i} className="bg-cyan-50/20 rounded-2xl border border-cyan-200/80 p-4 hover:border-cyan-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                                      {pkg.tag}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-sm text-gray-900">{pkg.title}</h4>
                                  <strong className="text-base font-black text-cyan-700 block">{pkg.price}</strong>
                                  <p className="text-[11px] text-gray-500 font-medium leading-snug">{pkg.desc}</p>
                                </div>

                                <button
                                  type="button"
                                  disabled={bookingLoading}
                                  onClick={() => {
                                    const partner = cleaningServices.find(s => pkg.title.toLowerCase().includes('laundry') ? s.category === 'Laundry' : s.category === 'Cleaning') || cleaningServices[0] || services.find(s => s.category === 'Cleaning') || { _id: services[0]?._id, businessName: 'StaySync Housekeeping Partner', category: 'Cleaning', city: targetCity };
                                    if (partner && partner._id) {
                                      handleInstantBookService(partner, pkg.title, pkg.priceNum);
                                    } else {
                                      setTicketNotice(`Request submitted for "${pkg.title}"!`);
                                    }
                                  }}
                                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Book Plan &amp; Send Request</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ======================================================== */
              /* DISCOVERY DASHBOARD (Before Choosing Any Stay)           */
              /* ======================================================== */
              <>
                {/* 1. If Booking Request is Pending Owner/Admin Approval */}
                {pendingStayRequest ? (
                  <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                          <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                              ⏳ Booking Request Awaiting Approval
                            </span>
                            <span className="text-xs text-gray-500 font-bold">
                              Submitted {new Date(pendingStayRequest.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                            {typeof pendingStayRequest.itemId === 'object' ? pendingStayRequest.itemId.title : 'Hostel / PG Booking'}
                          </h2>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              {typeof pendingStayRequest.itemId === 'object' 
                                ? [pendingStayRequest.itemId.address, pendingStayRequest.itemId.city].filter(Boolean).join(', ') 
                                : targetCity}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: Cancel or Accept as Owner/Admin */}
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCancelRequest(pendingStayRequest._id)}
                          className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Cancel Request
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAccept(pendingStayRequest._id)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                          title="Accept booking as Property Owner / Admin to unlock resident living dashboard"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept as Admin / Owner</span>
                        </button>
                      </div>
                    </div>

                    {/* Stay Summary Mini Grid */}
                    {typeof pendingStayRequest.itemId === 'object' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 block">Stay Category</span>
                          <strong className="text-gray-900 text-sm font-extrabold">{pendingStayRequest.itemId.hostelCategory || pendingStayRequest.itemId.propertyType || 'Student Stay'}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 block">Sharing / Room Type</span>
                          <strong className="text-gray-900 text-sm font-extrabold">{pendingStayRequest.itemId.roomType || '2-Seater Room'}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 block">Proposed Monthly Rent</span>
                          <strong className="text-emerald-700 text-sm font-black">₹{(pendingStayRequest.proposedPrice || pendingStayRequest.itemId.monthlyRent || 0).toLocaleString('en-IN')}/mo</strong>
                        </div>
                      </div>
                    )}

                    {/* Note for User */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Owner / Admin Verification in Progress</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                        Jaise hi hostel owner ya admin request accept karenge, yaha aapka <strong>Proper Living Dashboard</strong> (Room Key, Rent Payment Online, Daily Tiffin Menu Routine, Roommates list, aur Maintenance) automatically unlock ho jayega.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* No stay selected yet callout banner */
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 border border-emerald-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full shadow-2xs">
                        Step 2: Choose Your Stay
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                        You haven't requested your PG or Room yet!
                      </h3>
                      <p className="text-xs text-gray-600 font-medium max-w-2xl">
                        Pick from your matching recommended hostels and verified rooms below. Click "Book Stay" to submit your booking request for approval.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const el = document.getElementById('section-rooms');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <span>Browse Matching Stays</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Top Grid: Your Living Plan (Left) + Best AI Recommendation (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* 3. YOUR LIVING PLAN CARD */}
                  <div className={`${!pendingStayRequest ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-all`}>
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-150">
                        <div>
                          <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span>Your Living Plan</span>
                          </h2>
                          <p className="text-[11px] text-gray-400 font-medium">Monthly living budget forecast</p>
                        </div>
                        {hasCustomLivingPlan ? (
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                            ₹{totalEstimatedLivingCost.toLocaleString('en-IN')}/mo
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-xl">
                            Not Set
                          </span>
                        )}
                      </div>

                      {hasCustomLivingPlan ? (
                        <>
                          {/* High Level Stats */}
                          <div className="grid grid-cols-3 gap-2 py-4 text-center border-b border-gray-150">
                            <div className="bg-gray-50/80 p-2.5 rounded-2xl border border-gray-200/50">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Monthly Budget</span>
                              <strong className="text-xs sm:text-sm font-black text-gray-800 block mt-0.5">₹{monthlyBudget.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="bg-gray-50/80 p-2.5 rounded-2xl border border-gray-200/50">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Estimated Cost</span>
                              <strong className="text-xs sm:text-sm font-black text-emerald-600 block mt-0.5">₹{totalEstimatedLivingCost.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="bg-gray-50/80 p-2.5 rounded-2xl border border-gray-200/50">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Remaining</span>
                              <strong className="text-xs sm:text-sm font-black text-emerald-600 block mt-0.5">₹{remainingBudget.toLocaleString('en-IN')}</strong>
                            </div>
                          </div>

                          {/* Breakdown List with Progress Bars */}
                          <div className="py-4 space-y-3">
                            {/* Room */}
                            {wantsRoom && (
                              <div>
                                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                                  <span className="flex items-center gap-1.5">
                                    <Home className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Room ({livingPlan.roomType})</span>
                                  </span>
                                  <strong className="text-gray-900 font-black">₹{livingPlan.roomCost.toLocaleString('en-IN')}</strong>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden p-0.5">
                                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.round((livingPlan.roomCost / monthlyBudget) * 100)}%` }}></div>
                                </div>
                              </div>
                            )}

                            {/* Tiffin */}
                            {wantsTiffin && (
                              <div>
                                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                                  <span className="flex items-center gap-1.5">
                                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Tiffin &amp; Meals</span>
                                  </span>
                                  <strong className="text-gray-900 font-black">₹{livingPlan.foodCost.toLocaleString('en-IN')}</strong>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden p-0.5">
                                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.round((livingPlan.foodCost / monthlyBudget) * 100)}%` }}></div>
                                </div>
                              </div>
                            )}

                            {/* Laundry */}
                            {wantsLaundry && (
                              <div>
                                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                                  <span className="flex items-center gap-1.5">
                                    <Shirt className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Laundry</span>
                                  </span>
                                  <strong className="text-gray-900 font-black">₹{livingPlan.laundryCost.toLocaleString('en-IN')}</strong>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden p-0.5">
                                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.round((livingPlan.laundryCost / monthlyBudget) * 100)}%` }}></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="py-7 text-center space-y-3">
                          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-2xs">
                            <Calculator className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">No living plan configured yet</p>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 leading-relaxed">
                              Calculate your monthly living budget for room rent, tiffin, and laundry based on your ₹{monthlyBudget.toLocaleString('en-IN')} budget.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customize Plan Button */}
                    <button
                      onClick={() => setIsCalculatorOpen(true)}
                      className="w-full py-2.5 px-4 bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-700 font-bold text-xs rounded-xl border border-gray-200/90 hover:border-emerald-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{hasCustomLivingPlan ? 'Customize Plan' : 'Calculate Living Plan'}</span>
                    </button>
                  </div>

                  {/* 4. BEST AI RECOMMENDATION (Right 7 Cols) - Only shown until stay is booked */}
                  {!pendingStayRequest && (() => {
                    const topStay = properties[0] || bundles[0]?.property;
                    const topTiffin = tiffinServices[0] || bundles[0]?.tiffin;
                    if (!topStay) return null;

                    return (
                      <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-emerald-950 to-[#064e3b] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                              <span>Matched to Your Info: {stayPrefLabel}</span>
                            </span>

                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs">
                              96% Preference Match
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                              {topStay.title} {wantsTiffin && topTiffin ? `+ ${topTiffin.businessName}` : ''}
                            </h3>
                            <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{[topStay.address, topStay.city].filter(Boolean).join(', ')} • {topStay.hostelCategory || topStay.propertyType}</span>
                            </p>
                            <div className="flex items-baseline gap-2 mt-1.5">
                              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                                ₹{((topStay.monthlyRent || topStay.rentPerPerson || 6000) + (wantsTiffin && topTiffin ? (topTiffin.tiffinDetails?.monthlyPrice || 3000) : 0)).toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-gray-300 font-medium">/ month {wantsTiffin && topTiffin ? 'total living combo' : 'room rent'}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                              <StayPrefIconComponent className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                              <span>{topStay.roomType || 'Standard Room'}</span>
                            </span>
                            {topStay.hostelCategory && (
                              <span className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                <span>{topStay.hostelCategory}</span>
                              </span>
                            )}
                            {wantsTiffin && topTiffin && (
                              <span className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                <Utensils className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                <span>Fresh Daily Tiffin Plan</span>
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-gray-200 font-medium">
                            <div className="flex items-center gap-1.5 bg-black/30 p-2.5 rounded-xl border border-white/10">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Within your ₹{userBudget.toLocaleString('en-IN')} budget</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/30 p-2.5 rounded-xl border border-white/10">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Near {targetCity} area</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/30 p-2.5 rounded-xl border border-white/10">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Clean &amp; Verified</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 pt-5 mt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <span className="text-xs text-emerald-200/80 font-medium">Auto-matched with account registration preferences</span>
                          <button
                            onClick={() => handleSelectStay(topStay)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 group cursor-pointer active:scale-95"
                          >
                            <span>Book Recommended {userStayPref || 'Stay'}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                {/* 5. RECOMMENDED STAY LISTINGS (Strictly matched with account preferences - only shown until stay is booked) */}
                {wantsRoom && !hasStay && !pendingStayRequest && (
                <section id="section-rooms" className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 pb-2 border-b border-gray-200/80">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <StayPrefIconComponent className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Recommended {stayPrefLabel}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Account Match</span>
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Suggested based on your account info: <strong>{userStayPref || 'Stay'}</strong> in <strong>{targetCity}</strong>{userGender ? ` (${userGender})` : ''}{userBudget ? `, budget up to ₹${userBudget.toLocaleString('en-IN')}` : ''}.
                      </p>
                    </div>

                    <Link
                      to={`/marketplaces?tab=rooms&propertyType=${userStayPref || ''}&gender=${userGender || ''}&city=${encodeURIComponent(targetCity)}`}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    >
                      <span>View All {stayPrefLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {properties.slice(0, 6).map((property) => (
                        <PropertyCard
                          key={property._id}
                          property={property}
                          onInquire={handleInquireProperty}
                          onShortlist={handleToggleShortlist}
                          isShortlisted={!!shortlisted[property._id]}
                          onSelectStay={handleSelectStay}
                          isSelected={selectedStay?._id === property._id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/90 text-gray-400">
                      <p className="text-xs font-semibold">No {stayPrefLabel} currently found matching your exact filters in {targetCity}.</p>
                      <Link
                        to={`/marketplaces?tab=rooms&city=${encodeURIComponent(targetCity)}`}
                        className="inline-block mt-3 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200"
                      >
                        Explore All Stays in {targetCity}
                      </Link>
                    </div>
                  )}
                </section>
                )}

                {/* Notifications Section */}
                <div className="pt-2">
                  <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-7 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                            <span>Notifications &amp; Activity</span>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                {unreadCount} New
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkNotificationsRead}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer self-start sm:self-auto flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark all as read</span>
                        </button>
                      )}
                    </div>

                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {notifications.slice(0, 5).map(n => (
                          <div 
                            key={n._id} 
                            className={`py-3 px-3 rounded-2xl flex gap-3 items-start transition-colors ${
                              !n.readStatus ? 'bg-emerald-50/40 border border-emerald-100/60' : 'hover:bg-gray-50/80'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !n.readStatus ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-bold text-gray-900 truncate">{n.title}</h4>
                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-300" />
                                  <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 space-y-1.5">
                        <Bell className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-xs font-bold text-gray-700">Your notifications inbox is clear</p>
                        <p className="text-[11px] text-gray-400">All updates about your bookings and requests will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ================================================== */}
        {/* TAB 2: TIFFIN & DAILY MEALS                        */}
        {/* ================================================== */}
        {activeTab === 'tiffin' && (hasTiffin || subscribedTiffin || isTiffinPartner || isPgOrFlat) && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header banner */}
            <div className="bg-[#059669] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                  Doorstep Meal Routines
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1 flex items-center gap-2">
                  <Utensils className="w-6 h-6 text-amber-200" />
                  <span>Daily Tiffin &amp; Mess Services</span>
                </h2>
                <p className="text-xs text-amber-100 mt-0.5 font-medium">
                  Fresh, home-cooked lunch and dinner delivered directly to your room in {targetCity}.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => switchTab('overview')}
                  className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  ← {stayCategoryLabel}
                </button>
              </div>
            </div>

            {/* If Subscribed: Active Meal Schedule Card */}
            {subscribedTiffin ? (
              <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-gray-150">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block border border-emerald-300">
                        ✓ Aapka Active Subscribed Plan (Liya Hua Plan)
                      </span>
                      <h3 className="text-lg font-black text-gray-900 mt-0.5">
                        {subscribedTiffin.businessName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-lg font-black text-gray-900 block">
                        ₹{(subscribedTiffin.tiffinDetails?.monthlyPrice || 2400).toLocaleString('en-IN')}/mo
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">Daily Lunch &amp; Dinner</span>
                    </div>
                    <a
                      href={`tel:${subscribedTiffin.contactPhone || '9826012345'}`}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Kitchen
                    </a>
                  </div>
                </div>

                {/* 7-Day Interactive Menu Broadcast */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white rounded-3xl border border-amber-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-amber-100">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Weekly Live Kitchen Menu Broadcast</span>
                      </span>
                      <p className="text-[11px] text-gray-500 font-medium">Click any day below to view that day's complete breakfast, lunch &amp; dinner menu.</p>
                    </div>

                    {subscribedTiffin && (
                      <button
                        onClick={() => {
                          setMealPaused(!mealPaused);
                          setTicketNotice(mealPaused ? 'Meal resumed for today!' : 'Today\'s meal paused. Daily discount adjusted in billing.');
                        }}
                        className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                          mealPaused
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {mealPaused ? 'Resume Today\'s Meal' : 'Pause Today\'s Meal'}
                      </button>
                    )}
                  </div>

                  {/* Day Pills (Mon - Sun) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                    {[
                      { key: 'monday', short: 'Monday' },
                      { key: 'tuesday', short: 'Tuesday' },
                      { key: 'wednesday', short: 'Wednesday' },
                      { key: 'thursday', short: 'Thursday' },
                      { key: 'friday', short: 'Friday' },
                      { key: 'saturday', short: 'Saturday' },
                      { key: 'sunday', short: 'Sunday Special' }
                    ].map((d) => {
                      const isSelected = selectedTiffinDay === d.key;
                      const isToday = getTodayKey() === d.key;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setSelectedTiffinDay(d.key)}
                          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#059669] text-white shadow-md font-black scale-105'
                              : 'bg-white text-amber-900 border border-amber-200/90 hover:bg-amber-100/70 hover:border-amber-300 shadow-2xs'
                          }`}
                        >
                          <span>{d.short}</span>
                          {isToday && (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                              isSelected ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              Today
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Menu Items Container - Updates when day is clicked */}
                  {(() => {
                    const activeMenu = getActiveDayMenu(selectedTiffinDay);
                    const bf = activeMenu.breakfast;
                    const lu = activeMenu.lunch;
                    const di = activeMenu.dinner;
                    const sunSpecial = activeMenu.special;
                    const isSunday = selectedTiffinDay === 'sunday';

                    return (
                      <div key={selectedTiffinDay} className="space-y-3 pt-1 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="font-extrabold text-amber-950 flex items-center gap-2">
                            <span className="text-gray-500">Menu ({activeMenu.source}):</span>
                            <span className="px-3 py-0.5 rounded-full bg-amber-600 text-white font-black text-xs shadow-2xs">
                              {activeMenu.label}
                            </span>
                            {selectedTiffinDay === getTodayKey() && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                                Serving Today
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-200/60">
                            {activeMenu.highlight}
                          </span>
                        </div>

                        <div className={`grid grid-cols-1 ${isSunday ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3`}>
                          <div className="p-4 bg-white rounded-2xl border border-amber-200/80 space-y-2 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Coffee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Breakfast (8:30 AM)</span>
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">Hot &amp; Fresh</span>
                            </div>
                            <p className="text-xs font-bold text-gray-900 leading-relaxed">
                              {bf}
                            </p>
                          </div>

                          <div className="p-4 bg-white rounded-2xl border border-amber-200/80 space-y-2 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Lunch (1:00 PM)</span>
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">Thali Meal</span>
                            </div>
                            <p className="text-xs font-bold text-gray-900 leading-relaxed">
                              {lu}
                            </p>
                          </div>

                          <div className="p-4 bg-white rounded-2xl border border-amber-200/80 space-y-2 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Moon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Dinner (8:30 PM)</span>
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">Cooked Evening</span>
                            </div>
                            <p className="text-xs font-bold text-gray-900 leading-relaxed">
                              {di}
                            </p>
                          </div>

                          {isSunday && (
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-100/80 rounded-2xl border-2 border-amber-400 space-y-2 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>Sunday Feast Sweet</span>
                                </span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-600 text-white">Special</span>
                              </div>
                              <p className="text-xs font-black text-amber-950 leading-relaxed">
                                {sunSpecial}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* If not subscribed yet, still show the interactive 7-Day Live Kitchen Menu Schedule */
              <div className="bg-white rounded-3xl border border-amber-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-amber-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Weekly Kitchen Menu Schedule in {targetCity}</span>
                    </span>
                    <p className="text-[11px] text-gray-500 font-medium">Click any day below to preview breakfast, lunch and dinner menus across city messes.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                    Live Broadcast
                  </span>
                </div>

                {/* Day Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                  {[
                    { key: 'monday', short: 'Monday' },
                    { key: 'tuesday', short: 'Tuesday' },
                    { key: 'wednesday', short: 'Wednesday' },
                    { key: 'thursday', short: 'Thursday' },
                    { key: 'friday', short: 'Friday' },
                    { key: 'saturday', short: 'Saturday' },
                    { key: 'sunday', short: 'Sunday Special' }
                  ].map((d) => {
                    const isSelected = selectedTiffinDay === d.key;
                    const isToday = getTodayKey() === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedTiffinDay(d.key)}
                        className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#059669] text-white shadow-md font-black scale-105'
                            : 'bg-white text-amber-900 border border-amber-200/90 hover:bg-amber-100/70 hover:border-amber-300 shadow-2xs'
                        }`}
                      >
                        <span>{d.short}</span>
                        {isToday && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                            isSelected ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Today
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Menu items */}
                {(() => {
                  const activeMenu = getActiveDayMenu(selectedTiffinDay);
                  const isSunday = selectedTiffinDay === 'sunday';

                  return (
                    <div key={selectedTiffinDay} className="space-y-3 pt-1 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-extrabold text-amber-950 flex items-center gap-2">
                          <span className="text-gray-500">Menu ({activeMenu.source}):</span>
                          <span className="px-3 py-0.5 rounded-full bg-amber-600 text-white font-black text-xs shadow-2xs">
                            {activeMenu.label}
                          </span>
                        </span>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-200/60">
                          {activeMenu.highlight}
                        </span>
                      </div>

                      <div className={`grid grid-cols-1 ${isSunday ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3`}>
                        <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-1.5 shadow-2xs">
                          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Coffee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Breakfast (8:30 AM)</span>
                          </span>
                          <p className="text-xs font-bold text-gray-900 leading-relaxed">{activeMenu.breakfast}</p>
                        </div>
                        <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-1.5 shadow-2xs">
                          <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Lunch (1:00 PM)</span>
                          </span>
                          <p className="text-xs font-bold text-gray-900 leading-relaxed">{activeMenu.lunch}</p>
                        </div>
                        <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-1.5 shadow-2xs">
                          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Moon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Dinner (8:30 PM)</span>
                          </span>
                          <p className="text-xs font-bold text-gray-900 leading-relaxed">{activeMenu.dinner}</p>
                        </div>
                        {isSunday && (
                          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-100/80 rounded-2xl border-2 border-amber-400 space-y-1.5 shadow-xs">
                            <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>Sunday Special</span>
                            </span>
                            <p className="text-xs font-black text-amber-950 leading-relaxed">{activeMenu.special || 'Special Royal Thali & Sweet'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Available Tiffin Providers in City */}
            <div className="space-y-4">
              <div className="flex justify-between items-end pb-2 border-b border-gray-200">
                <div>
                  <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    <span>Verified Tiffin Kitchens &amp; Messes in {targetCity}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Choose a meal plan that matches your taste and daily routine.</p>
                </div>
              </div>

              {tiffinServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tiffinServices.map(srv => {
                    const isSubscribed = selectedProviders.some(p => (p?._id || p) === srv._id);
                    return (
                      <div key={srv._id} className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="h-40 rounded-2xl overflow-hidden relative bg-gray-100">
                            <img
                              src={normalizeImageUrl(srv.photos?.[0]) || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'}
                              alt={srv.businessName}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                              {srv.tiffinDetails?.mealType || 'Pure Veg'}
                            </span>
                            <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-xs font-black px-2.5 py-1 rounded-xl">
                              ₹{(srv.tiffinDetails?.monthlyPrice || 2400).toLocaleString('en-IN')}/mo
                            </div>
                          </div>

                          <div>
                            <h4 className="font-black text-base text-gray-900">{srv.businessName}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{srv.address || srv.city}</span>
                            </p>
                          </div>

                          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-amber-800 uppercase block">Daily Menu Highlights</span>
                            <p className="text-gray-700 font-medium text-[11px]">
                              {srv.tiffinDetails?.description || 'Dal, Seasonal Sabzi, 4 Tawa Rotis, Jeera Rice, Salad & Pickle. Special dessert on Sundays.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleInstantBookService(srv)}
                            disabled={bookingLoading}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSubscribed
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-[#059669] text-white shadow-xs hover:from-amber-600 hover:to-emerald-700 active:scale-95'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isSubscribed ? 'Subscribed ✓' : 'Subscribe to Plan'}</span>
                          </button>
                          <a
                            href={`tel:${srv.contactPhone || '9826012345'}`}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer"
                            title="Call Kitchen"
                          >
                            <Phone className="w-4 h-4 text-emerald-600" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-3xl border border-gray-200 text-gray-400">
                  <p className="text-xs font-semibold">No tiffin kitchens found in {targetCity}.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 3: ROOM CLEANING & LAUNDRY SERVICES            */}
        {/* ================================================== */}
        {activeTab === 'cleaning' && (hasLaundry || subscribedLaundry || isCleaningPartner || isPgOrFlat) && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                  Doorstep Living Care
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-200" />
                  <span>Room Cleaning &amp; Laundry Services</span>
                </h2>
                <p className="text-xs text-cyan-100 mt-0.5 font-medium">
                  Professional room sanitization, weekly laundry pickups, and doorstep washroom deep cleaning.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => switchTab('overview')}
                  className="px-4 py-2 bg-white text-cyan-900 hover:bg-cyan-50 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  ← {stayCategoryLabel}
                </button>
              </div>
            </div>

            {/* Subscribed Cleaning / Laundry status card (if active) */}
            {subscribedLaundry ? (
              <div className="bg-white rounded-3xl border-2 border-cyan-400 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-gray-150">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full inline-block border border-cyan-300">
                        ✓ Aapka Active Subscribed Plan (Liya Hua Plan)
                      </span>
                      <h3 className="text-lg font-black text-gray-900 mt-0.5">
                        {subscribedLaundry.businessName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTicketNotice('Doorstep cleaning pickup scheduled for tomorrow 10:00 AM!')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Request Visit Today
                    </button>
                    <a
                      href={`tel:${subscribedLaundry.contactPhone || '9826012345'}`}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-cyan-700" /> Call
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-cyan-50/50 rounded-2xl border border-cyan-100">
                    <span className="text-[10px] font-bold text-cyan-800 uppercase block">Weekly Routine</span>
                    <strong className="text-gray-900 font-extrabold block mt-0.5">Tuesday &amp; Friday Visits</strong>
                    <span className="text-[11px] text-gray-500 font-medium">Brooming, mopping with disinfectant, bathroom scrub</span>
                  </div>
                  <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Laundry Pickup</span>
                    <strong className="text-gray-900 font-extrabold block mt-0.5">10kg Monthly Plan</strong>
                    <span className="text-[11px] text-gray-500 font-medium">Doorstep wash, dry and steam iron with 24-hr return</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 4 Instant On-Demand Cleaning Packages */}
            <div className="space-y-4">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>1-Click Doorstep Cleaning &amp; Laundry Packages</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Regular Floor Sweep & Mop',
                    price: '₹299/visit',
                    sub: '₹999/month (Weekly)',
                    desc: 'Brooming, phenyl floor mopping, dusting desk, and garbage disposal.',
                    icon: Brush,
                    tag: 'Most Popular'
                  },
                  {
                    title: 'Washroom Deep Sanitization',
                    price: '₹449/visit',
                    sub: 'Full chemical sanitization',
                    desc: 'Toilet bowl, tiles stain scrubbing, tap descaling, and fresh deodorizer.',
                    icon: Sparkles,
                    tag: 'Hygienic Care'
                  },
                  {
                    title: 'Complete Room Deep Clean',
                    price: '₹699/visit',
                    sub: 'Complete revamp',
                    desc: 'Ceiling fan, window tracks, under-bed vacuum, mattress dusting & mirrors.',
                    icon: Home,
                    tag: 'Deep Clean'
                  },
                  {
                    title: 'Doorstep Laundry Wash & Fold',
                    price: '₹499/month',
                    sub: '10kg monthly allowance',
                    desc: 'Free room pickup, detergent wash, tumble dry, and steam pressing.',
                    icon: Shirt,
                    tag: 'Weekly Laundry'
                  }
                ].map((pkg) => {
                  const Icon = pkg.icon;
                  return (
                    <div key={pkg.title} className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-2xs">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                            {pkg.tag}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">{pkg.title}</h4>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <strong className="text-base font-black text-cyan-700">{pkg.price}</strong>
                            <span className="text-[10px] text-gray-400 font-medium">• {pkg.sub}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-snug font-medium">{pkg.desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={bookingLoading}
                        onClick={() => {
                          const partner = cleaningServices.find(s => pkg.title.toLowerCase().includes('laundry') ? s.category === 'Laundry' : s.category === 'Cleaning') || cleaningServices[0] || services.find(s => s.category === 'Cleaning') || { _id: services[0]?._id, businessName: 'StaySync Housekeeping Partner', category: 'Cleaning', city: targetCity };
                          if (partner && partner._id) {
                            handleInstantBookService(partner, pkg.title, pkg.priceNum || (pkg.title.includes('299') ? 299 : pkg.title.includes('449') ? 449 : pkg.title.includes('699') ? 699 : 499));
                          } else {
                            setTicketNotice(`Mail request submitted for "${pkg.title}"! Confirmation dispatched.`);
                          }
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Book Service</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Registered Cleaning Agencies in City */}
            {cleaningServices.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Housekeeping &amp; Laundry Partners in {targetCity}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cleaningServices.map(srv => {
                    const isSubscribed = selectedProviders.some(p => (p?._id || p) === srv._id);
                    return (
                      <div key={srv._id} className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full inline-block">
                                {srv.category || 'Cleaning & Laundry'}
                              </span>
                              <h4 className="font-black text-base text-gray-900 mt-1">{srv.businessName}</h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{srv.address || `${srv.city} Center`}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-black text-gray-900 block">
                                ₹{srv.cleaningDetails?.priceMap?.['Regular Room'] || 350}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">/visit</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">
                            {srv.description || 'Verified housekeeping partner providing regular floor mopping, bathroom descaling, and weekly laundry pickup.'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleInstantBookService(srv)}
                            disabled={bookingLoading}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSubscribed
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xs hover:from-cyan-700 hover:to-blue-800 active:scale-95'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isSubscribed ? 'Partner Active ✓' : 'Add to Living Space'}</span>
                          </button>
                          <a
                            href={`tel:${srv.contactPhone || '9826012345'}`}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer"
                            title="Call Partner"
                          >
                            <Phone className="w-4 h-4 text-cyan-700" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback Discover Tab (For existing links or exploration) */}
        {activeTab === 'discover' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Explore StaySync Marketplace</h2>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Browse verified stays, daily tiffin and cleaning services in {targetCity}.</p>
              </div>
              <Link
                to="/marketplaces?tab=rooms"
                className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-black text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <span>Open Full Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick links to Tiffin and Cleaning tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => switchTab('tiffin')}
                className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-left hover:bg-amber-100/60 transition cursor-pointer space-y-1"
              >
                <h4 className="font-black text-sm text-amber-900 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-amber-700" />
                  <span>View Tiffin &amp; Daily Meals Portal</span>
                </h4>
                <p className="text-xs text-amber-700 font-medium">Daily lunch &amp; dinner home menus from ₹2,400/month.</p>
              </button>

              <button
                type="button"
                onClick={() => switchTab('cleaning')}
                className="p-5 rounded-2xl bg-cyan-50/60 border border-cyan-200 text-left hover:bg-cyan-100/60 transition cursor-pointer space-y-1"
              >
                <h4 className="font-black text-sm text-cyan-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-700" />
                  <span>View Room Cleaning &amp; Laundry Portal</span>
                </h4>
                <p className="text-xs text-cyan-700 font-medium">Doorstep floor mopping, bathroom sanitization, and laundry.</p>
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB: COMMUNITY (Resident Board & Discussions)      */}
        {/* ================================================== */}
        {activeTab === 'community' && (
          <div className="animate-fadeIn">
            <CommunityBoardWidget city={targetCity || 'Indore'} />
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 3: REQUESTS (Full Tracking Table)              */}
        {/* ================================================== */}
        {activeTab === 'location_hub' && !isProvider && (
          <UserLocationPreferences properties={properties} />
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <div>
                <h2 className="text-base font-black text-gray-900">Your Booking &amp; Inquiry Submissions</h2>
                <p className="text-xs text-gray-500 font-medium">Live communication and acceptance tracking with landlords and providers.</p>
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200/60">
                {requests.length} Total Submissions
              </span>
            </div>

            {requests.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
                <table className="min-w-full text-xs text-left text-gray-500">
                  <thead className="bg-gray-50/90 text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-200/80">
                    <tr>
                      <th className="px-4 py-3 font-extrabold">Service / Room</th>
                      <th className="px-4 py-3 font-extrabold">Recipient</th>
                      <th className="px-4 py-3 font-extrabold">Proposed Price</th>
                      <th className="px-4 py-3 font-extrabold">Sent Date</th>
                      <th className="px-4 py-3 font-extrabold">Status</th>
                      <th className="px-4 py-3 font-extrabold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {requests.map(req => {
                      const resolvedItem = (typeof req.itemId === 'object' && req.itemId !== null)
                        ? req.itemId
                        : (properties.find(p => p._id === req.itemId) || services.find(s => s._id === req.itemId) || {});
                      const itemName = resolvedItem.title || resolvedItem.businessName || req.serviceDetails?.serviceCategory || (req.itemType === 'Property' ? 'Room / Stay' : 'Service');
                      const itemCat = resolvedItem.propertyType || resolvedItem.category || req.serviceDetails?.serviceCategory || req.itemType;
                      const itemCity = resolvedItem.city || req.serviceDetails?.deliveryAddress || targetCity;
                      const itemLat = resolvedItem.location?.coordinates?.[1] || resolvedItem.latitude;
                      const itemLng = resolvedItem.location?.coordinates?.[0] || resolvedItem.longitude;
                      const itemLocality = resolvedItem.location?.locality || resolvedItem.locality || '';
                      const itemAddress = resolvedItem.location?.address || resolvedItem.address || '';
                      const isBookingConfirmed = req.status === 'Accepted' || req.status === 'Confirmed';

                      return (
                        <tr key={req._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-gray-900 text-xs">
                                {itemName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase border border-gray-200/60">
                                  {itemCat}
                                </span>
                                {req.assignedBed?.roomNumber && (
                                  <span className="bg-purple-100 text-purple-800 font-black px-1.5 py-0.5 rounded text-[10px] border border-purple-200">
                                    {req.assignedBed.roomNumber} · {req.assignedBed.bedNumber}
                                  </span>
                                )}
                                {itemCity && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                                    <MapPin className="w-2.5 h-2.5 text-gray-400" />
                                    <span>{itemCity}</span>
                                  </span>
                                )}
                                {itemLocality && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                                    <MapPin className="w-2 h-2 text-emerald-600" />
                                    <span>{itemLocality}{isBookingConfirmed && itemAddress ? ` · ${itemAddress}` : ''}</span>
                                  </span>
                                )}
                              </div>
                              {req.bookingDetails?.checkInDate && (
                                <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">
                                  📅 {new Date(req.bookingDetails.checkInDate).toLocaleDateString('en-IN')} to {req.bookingDetails.checkOutDate ? new Date(req.bookingDetails.checkOutDate).toLocaleDateString('en-IN') : 'Ongoing'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={req.receiver?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                                alt="Receiver"
                                className="w-7 h-7 rounded-full object-cover border"
                              />
                              <div>
                                <p className="font-extrabold text-gray-900 text-xs">{req.receiver?.name || 'StaySync Partner'}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{req.receiver?.phone || req.receiver?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-black text-gray-900">
                            {req.proposedPrice ? `₹${req.proposedPrice.toLocaleString('en-IN')}` : (req.pricingDetails?.totalAmount ? `₹${req.pricingDetails.totalAmount.toLocaleString('en-IN')}` : '-')}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 font-medium">
                            {new Date(req.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3.5">
                            {getStatusBadge(req.status)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {req.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleQuickAccept(req._id)}
                                    className="text-[10px] bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors font-bold cursor-pointer"
                                    title="Quick accept booking"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleCancelRequest(req._id)}
                                    className="text-[10px] bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {(req.status === 'Accepted' || req.status === 'Payment Pending' || req.status === 'Confirmed') && (
                                <div className="flex items-center gap-1.5">
                                  {req.status === 'Confirmed' && (
                                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                                    </span>
                                  )}
                                  {(itemLat && itemLng) && (
                                  <a
                                    href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${itemLat}%2C${itemLng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-300 px-2 py-1 rounded-lg transition-colors font-bold inline-flex items-center gap-1 cursor-pointer"
                                    title="Open Directions in OpenStreetMap"
                                  >
                                    <Navigation className="w-3 h-3 text-emerald-600" />
                                    <span>Directions</span>
                                  </a>
                                )}
                                  <button
                                    onClick={() => handleCancelRequest(req._id)}
                                    className="text-[10px] bg-slate-50 hover:bg-rose-600 hover:text-white text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors font-bold cursor-pointer"
                                    title="Cancel booking under property policy"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Send className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-700">No inquiry submissions found.</p>
                <p className="text-[11px]">Explore rooms and services in the marketplace to send direct booking inquiries.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* LIVING CALCULATOR MODAL (Residents Only)           */}
      {/* ---------------------------------------------------- */}
      {!isProvider && (
        <LivingCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          initialBudget={monthlyBudget}
          initialRoomType={livingPlan.roomType}
          onApplyPlan={handleApplyLivingPlan}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* INQUIRY & BOOKING MODAL                              */}
      {/* ---------------------------------------------------- */}
      {showInquiryModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 focus:outline-none font-bold"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Message</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 focus:outline-none"
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingModal}
                    className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    {submittingModal ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official Email Booking Confirmation Modal for Stay, Tiffin, & Cleaning */}
      <EmailConfirmationModal
        isOpen={!!emailModalData}
        bookingData={emailModalData}
        user={user}
        onClose={() => setEmailModalData(null)}
        onGoToDashboard={() => switchTab('requests')}
      />

      {/* Bed & Room Selector with 15-Minute Lock Modal */}
      {bedSelectorProperty && (
        <BedSelectorModal
          property={bedSelectorProperty}
          onClose={() => setBedSelectorProperty(null)}
          onBookingSuccess={() => {
            setBedSelectorProperty(null);
            switchTab('requests');
            loadDashboardData();
          }}
        />
      )}

      {/* Floating AI Living Assistant Widget */}
      <AIAssistantWidget />

      {/* Rent Manager & Online Payment Modal */}
      <RentManagerModal
        isOpen={showRentManagerModal}
        onClose={() => setShowRentManagerModal(false)}
      />

      {/* Maintenance Complaint Submission Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        propertyId={selectedStay?._id}
        onClose={() => setShowMaintenanceModal(false)}
        onCreated={() => setTicketNotice('Maintenance complaint submitted! Technician assigned.')}
      />

      {/* Digital Rental Agreement Modal */}
      <RentalAgreementModal
        agreement={agreementModalData}
        onClose={() => setAgreementModalData(null)}
        onAcknowledged={() => setTicketNotice('Rental agreement signed and stored securely in platform records.')}
      />

    </div>
  );
};

export default Dashboard;
