import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setMobileMenuOpen as reduxSetMobileMenuOpen, setNotificationsCount as reduxSetNotificationsCount } from '../store/slices/uiSlice';
import {
  Menu,
  X,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Calendar,
  Wallet,
  MessageSquare,
  ShieldAlert,
  Building2,
  Hotel,
  Home as HomeIcon,
  Sparkles,
  UtensilsCrossed,
  LogIn,
  UserPlus,
  BookMarked,
  ChevronDown,
  Layers,
  Settings,
  Plus,
  ClipboardList,
  Utensils,
  BedDouble,
  Compass,
  ArrowRight,
  Users,
  Receipt
} from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { getRoleDashboardLink as getRoleDest, getRoleBadgeLabel as getRoleBadge, isProviderUser } from '../utils/roleHelper';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const mobileMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen);
  const setMobileMenuOpen = (val) => dispatch(reduxSetMobileMenuOpen(val));
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch unread notifications count if user is logged in
  useEffect(() => {
    let interval;
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const res = await notificationsAPI.getNotifications();
          if (res.success && Array.isArray(res.data)) {
            setNotificationsList(res.data);
            const unread = res.data.filter(n => !n.readStatus).length;
            setUnreadNotifications(unread);
            dispatch(reduxSetNotificationsCount(unread));
          }
        } catch (err) {
          console.error('Navbar notification check failed:', err);
        }
      }
    };

    fetchUnreadCount();
    if (user) {
      interval = setInterval(fetchUnreadCount, 20000);
    }
    return () => clearInterval(interval);
  }, [user]);

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsAPI.markAsRead();
      setNotificationsList(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadNotifications(0);
      dispatch(reduxSetNotificationsCount(0));
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const isCurrentActive = (path, searchStr = '') => {
    if (searchStr) {
      return (location.pathname === path || location.pathname === '/marketplaces') && location.search.includes(searchStr);
    }
    return location.pathname === path || (path === '/marketplace' && (location.pathname === '/marketplace' || location.pathname === '/marketplaces'));
  };

  const getRoleDashboardLink = () => getRoleDest(user);
  const getRoleBadgeLabel = () => getRoleBadge(user);

  // Determine current workspace & dashboard role context
  const isProviderDashboard =
    location.pathname.startsWith('/provider-dashboard') ||
    location.pathname.startsWith('/owner') ||
    location.pathname.startsWith('/provider');

  const isResidentDashboard =
    location.pathname.startsWith('/dashboard') ||
    location.pathname === '/bookings' ||
    location.pathname === '/expenses' ||
    location.pathname === '/shift-planner' ||
    location.pathname === '/chat';

  const isProviderRole = isProviderUser(user);

  const isHostel =
    location.pathname === '/owner/hostel' ||
    user?.role === 'HOSTEL_OWNER' ||
    (user?.role === 'PROPERTY_OWNER' && (user?.propertyType === 'Hostel' || !user?.propertyType));

  const isPg =
    location.pathname === '/owner/pg' ||
    user?.role === 'PG_OWNER' ||
    (user?.role === 'PROPERTY_OWNER' && user?.propertyType === 'PG');

  const isRoom =
    location.pathname === '/owner/room' ||
    user?.role === 'ROOM_OWNER' ||
    (user?.role === 'PROPERTY_OWNER' && (user?.propertyType === 'Room' || user?.propertyType === 'Flat'));

  const isTiffin =
    location.pathname === '/provider/tiffin' ||
    user?.role === 'TIFFIN_PROVIDER' ||
    (user?.role === 'PROVIDER' && user?.providerType?.toLowerCase() !== 'cleaning');

  const isCleaning =
    location.pathname === '/provider/services' ||
    user?.role === 'CLEANING_LAUNDRY_PROVIDER' ||
    (user?.role === 'PROVIDER' && user?.providerType?.toLowerCase() === 'cleaning');

  const handleScrollToSection = (sectionId) => {
    window.dispatchEvent(new CustomEvent('staysync-switch-provider-tab', { detail: sectionId }));
    window.location.hash = sectionId;
    if (isProviderDashboard) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return;
    }
    navigate(`${getRoleDashboardLink()}#${sectionId}`);
  };

  const handleOpenCreateListing = () => {
    if (isProviderDashboard) {
      window.dispatchEvent(new CustomEvent('staysync-open-create-listing'));
    } else {
      navigate(getRoleDashboardLink());
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('staysync-open-create-listing'));
      }, 200);
    }
  };

  // Do not render public marketplace navbar on Super Admin and Admin dashboard routes or for Admin users
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Brand Logo & Name */}
          <div className="flex items-center shrink-0">
            <Link to={user ? getRoleDashboardLink() : "/"} className="flex items-center gap-2.5 group py-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-center p-1.5 shadow-2xs group-hover:shadow-xs group-hover:border-emerald-300 transition-all">
                <img
                  src="/logo.svg"
                  alt="StaySync Logo"
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                Stay<span className="text-emerald-600">Sync</span>
              </span>
            </Link>
          </div>

          {/* Center: Main Navigation Links - DYNAMICALLY ACCORDING TO DASHBOARD ROLE */}
          <div className="hidden md:flex items-center space-x-0.5 lg:space-x-1 shrink-0 whitespace-nowrap">
            {isProviderRole ? (
              /* PROVIDER / OWNER DASHBOARD NAVIGATION COMPONENTS (Strict Single-Line Format) */
              <>
                <button
                  type="button"
                  onClick={() => handleScrollToSection('provider-overview-section')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-purple-800 hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="whitespace-nowrap">
                    {isHostel ? 'Hostel Portal' :
                     isPg ? 'PG Portal' :
                     isRoom ? 'Rental Portal' :
                     isTiffin ? 'Kitchen Portal' :
                     'Cleaning Portal'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScrollToSection('provider-listings-section')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-purple-800 hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">
                    {isHostel ? 'My Hostels' :
                     isPg ? 'My PGs' :
                     isRoom ? 'My Rooms' :
                     isTiffin ? 'My Kitchens' :
                     'Service Hubs'}
                  </span>
                </button>

                {(isHostel || isPg) && (
                  <button
                    type="button"
                    onClick={() => handleScrollToSection('provider-listings-section')}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-purple-800 hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  >
                    <BedDouble className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="whitespace-nowrap">{isHostel ? 'Bed Vacancies' : 'Bed Sharing'}</span>
                  </button>
                )}

                {(isHostel || isTiffin) && (
                  <button
                    type="button"
                    onClick={() => handleScrollToSection('tiffin-menu-section')}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  >
                    <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="whitespace-nowrap">{isHostel ? 'Mess Menu' : 'Weekly Menu'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleScrollToSection('provider-inquiries-section')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="whitespace-nowrap">Inquiries</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScrollToSection('provider-users-section')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">Customers</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScrollToSection('provider-payments-section')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">Payments</span>
                </button>
              </>
            ) : isProviderRole ? (
              /* PROVIDER NAVIGATION (When on /bookings, /profile, etc.) */
              <>
                <Link
                  to={getRoleDashboardLink()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-purple-800 hover:bg-purple-50 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="whitespace-nowrap">Provider Portal</span>
                </Link>

                <a
                  href={`${getRoleDashboardLink()}#provider-inquiries-section`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-green-800 hover:bg-green-50 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="whitespace-nowrap">Inquiries &amp; Bookings</span>
                </a>

                <Link
                  to="/bookings"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    location.pathname === '/bookings'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="whitespace-nowrap">My Orders</span>
                </Link>

                <Link
                  to="/marketplace"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">Marketplace</span>
                </Link>
              </>
            ) : user ? (
              /* RESIDENT / PERSONAL DASHBOARD NAVIGATION COMPONENTS (Strictly: My Bookings, Marketplace, Expense Tracker, Shift Planner) */
              <>
                <Link
                  to="/bookings"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    location.pathname === '/bookings' || isCurrentActive('/dashboard', 'tab=requests')
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">My Bookings</span>
                </Link>

                <Link
                  to="/marketplace?tab=rooms"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    isCurrentActive('/marketplace')
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">Marketplace</span>
                </Link>

                <Link
                  to="/expenses"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    location.pathname === '/expenses'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">Expense Tracker</span>
                </Link>

                <Link
                  to="/shift-planner"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    location.pathname === '/shift-planner'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="whitespace-nowrap">Shift Planner</span>
                </Link>
              </>
            ) : (
              /* PUBLIC MARKETING & DISCOVERY NAVIGATION (ONLY FOR GUESTS) */
              <>
                <Link
                  to="/"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                    isCurrentActive('/')
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/marketplace?tab=rooms"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                    isCurrentActive('/marketplace', 'tab=rooms')
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  Find Stays
                </Link>

                <Link
                  to="/marketplace?tab=services"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                    isCurrentActive('/marketplace', 'tab=services')
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  Services
                </Link>

                <Link
                  to="/about"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                    location.pathname === '/about'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  About Us
                </Link>

                <Link
                  to="/contact"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                    location.pathname === '/contact'
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Right: Authenticated Controls or Guest Auth CTAs */}
          <div className="hidden md:flex items-center space-x-2.5 shrink-0 whitespace-nowrap">
            {user ? (
              <div className="flex items-center space-x-2.5 shrink-0 whitespace-nowrap">
                {/* Notifications Bell with Interactive Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    title="In-app Notifications & Status Updates"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-gray-200 shadow-2xl py-3 z-50 animate-fadeIn divide-y divide-gray-100">
                      <div className="px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">Notifications</h4>
                          {unreadNotifications > 0 && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                              {unreadNotifications} New
                            </span>
                          )}
                        </div>
                        {unreadNotifications > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllNotificationsRead}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 py-1">
                        {notificationsList.length > 0 ? (
                          notificationsList.slice(0, 6).map((notif) => (
                            <div
                              key={notif._id}
                              className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50/80 transition ${
                                !notif.readStatus ? 'bg-emerald-50/30' : ''
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                !notif.readStatus ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-bold text-gray-900 truncate">{notif.title}</p>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                    {new Date(notif.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-400 space-y-1">
                            <Bell className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                            <p className="text-xs font-bold text-gray-700">No new notifications</p>
                            <p className="text-[11px] text-gray-400">You're all caught up!</p>
                          </div>
                        )}
                      </div>

                      <div className="px-4 pt-2.5 pb-1 text-center">
                        <Link
                          to={user.role === 'provider' ? '/provider-dashboard#provider-inquiries-section' : '/dashboard?tab=requests'}
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>View all inquiries &amp; activity</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar & Interactive Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                  >
                    <img
                      src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    />
                    <div className="text-left hidden lg:block leading-tight">
                      <span className="text-xs font-bold text-gray-900 block truncate max-w-[120px]">{user.name}</span>
                      <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block">{getRoleBadgeLabel()}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {/* Dropdown Card */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl py-2 z-50 animate-fadeIn divide-y divide-gray-100">
                      
                      {/* User Header Summary */}
                      <div className="px-4 py-3 bg-gray-50/70">
                        <p className="text-xs font-extrabold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {getRoleBadgeLabel()}
                        </span>
                      </div>

                      {/* Role Dashboard & My Bookings */}
                      <div className="py-1.5">
                        <Link
                          to={getRoleDashboardLink()}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{user.role === 'USER' ? 'Resident Dashboard' : 'Provider Portal'}</span>
                        </Link>

                        {isProviderRole ? (
                          <>
                            <a
                              href={`${getRoleDashboardLink()}#provider-inquiries-section`}
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                if (location.pathname.startsWith('/owner') || location.pathname.startsWith('/provider')) {
                                  handleScrollToSection('provider-inquiries-section');
                                }
                              }}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                              <ClipboardList className="w-3.5 h-3.5 text-green-600" />
                              <span>Tenant Inquiries &amp; Bookings</span>
                            </a>
                            <Link
                              to="/bookings"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                            >
                              <BookMarked className="w-3.5 h-3.5 text-teal-600" />
                              <span>My Orders &amp; Submissions</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/bookings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                          >
                            <BookMarked className="w-3.5 h-3.5 text-teal-600" />
                            <span>My Bookings &amp; Orders</span>
                          </Link>
                        )}
                      </div>

                      {/* Living Companion Tools (for residents) */}
                      {user.role === 'USER' && (
                        <div className="py-1.5">
                          <Link
                            to="/shift-planner"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Shift Planner</span>
                          </Link>
                          <Link
                            to="/expenses"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Wallet className="w-3.5 h-3.5 text-blue-600" />
                            <span>Shared Expense Tracker</span>
                          </Link>
                          <Link
                            to="/chat"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                            <span>Messages &amp; Chat</span>
                          </Link>
                        </div>
                      )}

                      {/* Profile Settings & Logout */}
                      <div className="py-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-gray-500" />
                          <span>Account &amp; Profile</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-600" />
                          <span>Log Out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link
                to="/dashboard?tab=requests"
                className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          
          {/* Dashboard Specific or Public Navigation */}
          {isProviderRole ? (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 px-3">
                {isHostel ? 'Hostel Management Menu' :
                 isPg ? 'PG Management Menu' :
                 isRoom ? 'Flat & Room Management' :
                 isTiffin ? 'Kitchen Management' :
                 'Services Management'}
              </span>

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleScrollToSection('provider-overview-section'); }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-purple-50 hover:text-purple-700"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-600" />
                <span>Portal Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleScrollToSection('provider-listings-section'); }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-purple-50 hover:text-purple-700"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isHostel ? 'My Hostels' :
                   isPg ? 'My PGs' :
                   isRoom ? 'My Rooms & Flats' :
                   isTiffin ? 'My Kitchens' :
                   'Service Hubs'}
                </span>
              </button>

              {(isHostel || isPg) && (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleScrollToSection('provider-listings-section'); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-purple-50 hover:text-purple-700"
                >
                  <BedDouble className="w-4 h-4 text-blue-600" />
                  <span>{isHostel ? 'Bed Vacancy Tracker' : 'Bed Sharing'}</span>
                </button>
              )}

              {(isHostel || isTiffin) && (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleScrollToSection('tiffin-menu-section'); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-amber-50 hover:text-amber-700"
                >
                  <Utensils className="w-4 h-4 text-amber-600" />
                  <span>{isHostel ? 'Hostel Mess Menu' : 'Weekly Meal Menu'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleScrollToSection('provider-inquiries-section'); }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                <ClipboardList className="w-4 h-4 text-green-600" />
                <span>Incoming Inquiries &amp; Bookings</span>
              </button>
            </div>
          ) : user ? (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 px-3">
                {isProviderRole ? 'Provider Management' : 'Resident Workspace'}
              </span>
              <Link
                to={isProviderRole ? `${getRoleDashboardLink()}#provider-inquiries-section` : "/bookings"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <BookMarked className="w-4 h-4 text-emerald-600" />
                <span>{isProviderRole ? 'Tenant Inquiries & Bookings' : 'My Bookings'}</span>
              </Link>
              <Link
                to="/marketplace?tab=rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Marketplace</span>
              </Link>
              <Link
                to="/expenses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Wallet className="w-4 h-4 text-blue-600" />
                <span>Expense Tracker</span>
              </Link>
              <Link
                to="/shift-planner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Shift Planner</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3">Explore Marketplace</span>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <HomeIcon className="w-4 h-4 text-emerald-600" />
                <span>Home</span>
              </Link>
              <Link
                to="/marketplace?tab=rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Find Stays (Hostels, PGs, Rooms)</span>
              </Link>
              <Link
                to="/marketplace?tab=services&category=Tiffin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span>Food &amp; Tiffin Subscriptions</span>
              </Link>
              <Link
                to="/marketplace?tab=services&category=Cleaning"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Cleaning &amp; Laundry</span>
              </Link>
              {isProviderRole && (
                <Link
                  to={getRoleDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-purple-700 bg-purple-50"
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-600" />
                  <span>Open {isHostel ? 'Hostel Portal' : isPg ? 'PG Portal' : isRoom ? 'Rental Portal' : isTiffin ? 'Kitchen Portal' : 'Provider Portal'}</span>
                </Link>
              )}
            </div>
          )}

          {/* User Controls if logged in */}
          {user ? (
            <div className="space-y-1 pt-2 border-t border-gray-150">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3">My Account &amp; Workspace</span>
              <Link
                to={getRoleDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>{user.role === 'USER' ? 'Resident Dashboard' : 'Provider Portal'}</span>
              </Link>
              <Link
                to={isProviderRole ? `${getRoleDashboardLink()}#provider-inquiries-section` : "/bookings"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <BookMarked className="w-4 h-4 text-teal-600" />
                <span>{isProviderRole ? 'Tenant Inquiries & Bookings' : 'My Bookings & Orders'}</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Account Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-150 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 text-center rounded-xl border border-gray-300 font-bold text-xs text-gray-800 block"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 text-center rounded-xl bg-emerald-600 text-white font-black text-xs block shadow-xs"
              >
                Sign Up
              </Link>
              <Link
                to="/register?role=PROPERTY_OWNER"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 text-center rounded-xl bg-gray-100 font-bold text-xs text-gray-800 block"
              >
                Become a Partner (Hostel / Kitchen)
              </Link>
            </div>
          )}

        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Resident & Guest Mobile UX) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
            location.pathname === '/' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span className="mt-0.5">Explore</span>
        </Link>
        <Link
          to="/marketplace?tab=rooms"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
            location.pathname.startsWith('/marketplace') ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="mt-0.5">Stays</span>
        </Link>
        {user ? (
          <>
            <Link
              to="/bookings"
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
                location.pathname === '/bookings' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span className="mt-0.5">Bookings</span>
            </Link>
            <Link
              to={getRoleDashboardLink()}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
                location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/provider-dashboard') ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="mt-0.5">Portal</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
                location.pathname === '/profile' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="mt-0.5">Profile</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/marketplace?tab=services"
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
                location.search.includes('services') ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="mt-0.5">Services</span>
            </Link>
            <Link
              to="/login"
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-900"
            >
              <LogIn className="w-4 h-4" />
              <span className="mt-0.5">Sign In</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
