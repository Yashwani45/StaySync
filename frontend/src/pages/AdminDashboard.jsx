import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, paymentsAPI, aiAPI } from '../services/api';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  UtensilsCrossed,
  CalendarCheck,
  CreditCard,
  AlertOctagon,
  Star,
  BarChart3,
  UserCog,
  Sliders,
  History,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText,
  Mail,
  Phone,
  LogOut,
  RefreshCw,
  Plus,
  Save,
  Trash2,
  Eye,
  Check,
  X,
  Lock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  Filter,
  Bell,
  Sun,
  Shield,
  FileSpreadsheet,
  Activity,
  UserX,
  ExternalLink,
  ChevronDown,
  Shirt
} from 'lucide-react';
import AdminLocationOverview from '../components/AdminLocationOverview';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Authentication & Role Check (Admins & Super Admins)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        navigate('/', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Sidebar Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Exactly 7 Main Navigation Sections
  const [activeSection, setActiveSection] = useState('overview');

  // Sub-tabs for combined sections
  const [verificationListingSubTab, setVerificationListingSubTab] = useState('verification'); // 'verification' | 'listings'
  const [bookingsPaymentsSubTab, setBookingsPaymentsSubTab] = useState('bookings'); // 'bookings' | 'payments' | 'refunds' | 'settlements'
  const [supportReviewsSubTab, setSupportReviewsSubTab] = useState('complaints'); // 'complaints' | 'reviews'
  const [settingsReportsSubTab, setSettingsReportsSubTab] = useState('reports'); // 'reports' | 'settings' | 'admins' | 'audit'

  // Advanced Financial & AI States
  const [refundsList, setRefundsList] = useState([]);
  const [settlementsList, setSettlementsList] = useState([]);
  const [settlementsSummary, setSettlementsSummary] = useState(null);
  const [processingRefundId, setProcessingRefundId] = useState(null);
  const [aiAdminInsights, setAiAdminInsights] = useState(null);

  // Global & Date Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [period, setPeriod] = useState('7d'); // '7d' | '30d' | '90d'
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Loading and Feedback States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // 1. Overview & Analytics State
  const [stats, setStats] = useState({
    users: 0,
    tenants: 0,
    owners: 0,
    providers: 0,
    admins: 0,
    properties: 0,
    verifiedProperties: 0,
    pendingProperties: 0,
    services: 0,
    verifiedServices: 0,
    pendingServices: 0,
    pendingVerifications: 0,
    bookings: 0,
    activeRequests: 0,
    acceptedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    openReports: 0,
    grossVolume: 0,
    platformRevenue: 0,
    propertyTypeCounts: [],
    serviceCategoryCounts: [],
    registrationTrend: [],
    revenueTrend: [],
    bookingTrend: [],
    recentActivity: []
  });

  // 2. User Management State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userRoleCounts, setUserRoleCounts] = useState({ ALL: 0, USER: 0, PROPERTY_OWNER: 0, PROVIDER: 0, ADMIN: 0 });
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSort, setUserSort] = useState('newest');

  // 3. Verification & Listings State
  const [verifications, setVerifications] = useState({ properties: [], services: [] });
  const [properties, setProperties] = useState([]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('ALL');
  const [propertySearch, setPropertySearch] = useState('');

  // 4. Service Management State
  const [services, setServices] = useState([]);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('ALL');
  const [serviceStatusFilter, setServiceStatusFilter] = useState('ALL');
  const [serviceSearch, setServiceSearch] = useState('');

  // 5. Bookings & Payments State
  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('ALL');
  const [bookingSearch, setBookingSearch] = useState('');
  const [payments, setPayments] = useState([]);
  const [paymentMetrics, setPaymentMetrics] = useState({ totalTransactions: 0, grossVolume: 0, platformFee: 0 });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');

  // 6. Support & Reviews State
  const [complaints, setComplaints] = useState([]);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('ALL');
  const [reviews, setReviews] = useState([]);

  // 7. Settings, Admins & Audit State
  const [admins, setAdmins] = useState([]);
  const [settings, setSettings] = useState({
    platformFeePercent: 5,
    supportEmail: 'support@staysync.com',
    supportPhone: '+91 (0731) 492-SYNC',
    emergencyHelpline: '+91 98765 43210',
    headquartersAddress: 'StaySync Central Operations Hub, India',
    requirePhysicalAuditForVerification: true,
    maintenanceMode: false
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // Modals
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingUserLoading, setViewingUserLoading] = useState(false);
  const [suspendModalUser, setSuspendModalUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionTargetStatus, setSuspensionTargetStatus] = useState('Suspended');
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newSelectedRole, setNewSelectedRole] = useState('USER');
  const [verifyingItem, setVerifyingItem] = useState(null);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [viewingListing, setViewingListing] = useState(null);
  const [viewingService, setViewingService] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [adminResolutionNotes, setAdminResolutionNotes] = useState('');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'ADMIN',
    permissions: ['ALL']
  });

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(''), 4500);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  // ============================================================================
  // DATA LOADER
  // ============================================================================
  const loadSectionData = async (section = activeSection) => {
    setLoading(true);
    try {
      if (section === 'overview') {
        const [res, aiRes] = await Promise.all([
          adminAPI.getStats({ period }),
          aiAPI.getAdminInsights().catch(() => null)
        ]);
        if (res.success) setStats(res.stats);
        if (aiRes?.success) setAiAdminInsights(aiRes.data);
      } else if (section === 'users') {
        const res = await adminAPI.getUsers({
          role: userRoleFilter,
          status: userStatusFilter,
          search: userSearch,
          page: userPage,
          limit: 15
        });
        if (res.success) {
          setUsers(res.data);
          setUserTotalPages(res.pages || 1);
          if (res.roleCounts) setUserRoleCounts(res.roleCounts);
        }
      } else if (section === 'verification_listings') {
        const [verifRes, propRes] = await Promise.all([
          adminAPI.getVerifications(),
          adminAPI.getProperties({
            propertyType: propertyTypeFilter,
            status: propertyStatusFilter,
            search: propertySearch
          })
        ]);
        if (verifRes.success) setVerifications(verifRes.data);
        if (propRes.success) setProperties(propRes.data);
      } else if (section === 'services') {
        const res = await adminAPI.getServices({
          category: serviceCategoryFilter,
          status: serviceStatusFilter,
          search: serviceSearch
        });
        if (res.success) setServices(res.data);
      } else if (section === 'bookings_payments') {
        const [bookRes, payRes, refRes, setRes] = await Promise.all([
          adminAPI.getBookings({
            status: bookingStatusFilter,
            itemType: bookingTypeFilter,
            search: bookingSearch
          }),
          adminAPI.getPayments({ status: paymentStatusFilter }),
          paymentsAPI.getRefunds().catch(() => ({ data: [] })),
          paymentsAPI.getAdminSettlements().catch(() => ({ data: [], summary: null }))
        ]);
        if (bookRes.success) setBookings(bookRes.data);
        if (payRes.success) {
          setPayments(payRes.data);
          if (payRes.metrics) setPaymentMetrics(payRes.metrics);
        }
        if (refRes?.data) setRefundsList(refRes.data);
        if (setRes?.data) setSettlementsList(setRes.data);
        if (setRes?.summary) setSettlementsSummary(setRes.summary);
      } else if (section === 'support_reviews') {
        const [compRes, revRes] = await Promise.all([
          adminAPI.getComplaints({ status: complaintStatusFilter }),
          adminAPI.getReviews()
        ]);
        if (compRes.success) setComplaints(compRes.data);
        if (revRes.success) setReviews(revRes.data);
      } else if (section === 'settings_reports') {
        const [statsRes, setRes, admRes, auditRes] = await Promise.all([
          adminAPI.getStats({ period }),
          adminAPI.getSettings(),
          adminAPI.getAdmins(),
          adminAPI.getAuditLogs({ action: auditActionFilter })
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (setRes.success && setRes.data) setSettings(setRes.data);
        if (admRes.success) setAdmins(admRes.data);
        if (auditRes.success) setAuditLogs(auditRes.data);
      }
    } catch (err) {
      console.error(`Failed to load data for ${section}:`, err);
      showToast(err.response?.data?.message || `Failed to load ${section} data`, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectionData(activeSection);
  }, [activeSection, period]);

  // Refetch on filters
  useEffect(() => {
    if (activeSection === 'users') loadSectionData('users');
  }, [userRoleFilter, userStatusFilter, userPage, userSearch]);

  useEffect(() => {
    if (activeSection === 'verification_listings') {
      adminAPI.getProperties({
        propertyType: propertyTypeFilter,
        status: propertyStatusFilter,
        search: propertySearch
      }).then(res => {
        if (res.success) setProperties(res.data);
      }).catch(err => console.error(err));
    }
  }, [propertyTypeFilter, propertyStatusFilter, propertySearch]);

  useEffect(() => {
    if (activeSection === 'services') loadSectionData('services');
  }, [serviceCategoryFilter, serviceStatusFilter, serviceSearch]);

  useEffect(() => {
    if (activeSection === 'bookings_payments') loadSectionData('bookings_payments');
  }, [bookingStatusFilter, bookingTypeFilter, paymentStatusFilter, bookingSearch]);

  useEffect(() => {
    if (activeSection === 'support_reviews') {
      adminAPI.getComplaints({ status: complaintStatusFilter }).then(res => {
        if (res.success) setComplaints(res.data);
      }).catch(err => console.error(err));
    }
  }, [complaintStatusFilter]);

  useEffect(() => {
    if (activeSection === 'settings_reports' && settingsReportsSubTab === 'audit') {
      adminAPI.getAuditLogs({ action: auditActionFilter }).then(res => {
        if (res.success) setAuditLogs(res.data);
      }).catch(err => console.error(err));
    }
  }, [auditActionFilter, settingsReportsSubTab]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  // User Profile Inspection
  const handleViewUserProfile = async (targetUser) => {
    setViewingUserLoading(true);
    setViewingUser({ user: targetUser, bookings: [], properties: [], services: [], auditTrail: [] });
    try {
      const res = await adminAPI.getUserDetails(targetUser._id);
      if (res.success && res.data) {
        setViewingUser(res.data);
      }
    } catch (err) {
      console.warn('Detailed profile fetch notice:', err.message);
    } finally {
      setViewingUserLoading(false);
    }
  };

  // Suspend / Deactivate User
  const handleConfirmUserStatus = async (e) => {
    e.preventDefault();
    if (!suspendModalUser) return;
    if (!suspensionReason.trim()) {
      showToast('Please provide a mandatory justification reason', true);
      return;
    }
    setActionLoading(true);
    try {
      const res = await adminAPI.updateUserStatus(suspendModalUser._id, {
        status: suspensionTargetStatus,
        reason: suspensionReason
      });
      if (res.success) {
        showToast(`User account status updated to ${suspensionTargetStatus}`);
        setSuspendModalUser(null);
        setSuspensionReason('');
        loadSectionData('users');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Change Role
  const handleConfirmRoleChange = async (e) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setActionLoading(true);
    try {
      const res = await adminAPI.updateUserRole({
        userId: roleModalUser._id,
        role: newSelectedRole
      });
      if (res.success) {
        showToast(`User role updated to ${newSelectedRole}`);
        setRoleModalUser(null);
        loadSectionData('users');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Verification Approval / Rejection
  const handleExecuteVerification = async (targetStatus) => {
    if (!verifyingItem) return;
    setActionLoading(true);
    try {
      const res = await adminAPI.toggleVerification({
        targetType: verifyingItem.type,
        targetId: verifyingItem.item._id,
        status: targetStatus,
        reason: verificationFeedback || (targetStatus === 'Verified' ? 'Approved by Admin physical check' : 'Rejected by Admin')
      });
      if (res.success) {
        showToast(`${verifyingItem.type} marked as ${targetStatus}`);
        setVerifyingItem(null);
        setVerificationFeedback('');
        loadSectionData('verification_listings');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update verification', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Property Availability
  const handleTogglePropertyAvailable = async (property) => {
    try {
      const res = await adminAPI.updatePropertyStatus(property._id, {
        isAvailable: !property.isAvailable,
        reason: `Availability toggled to ${!property.isAvailable ? 'Vacant/Available' : 'Occupied/Unpublished'}`
      });
      if (res.success) {
        showToast(`Listing ${property.title} availability updated`);
        loadSectionData('verification_listings');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update property status', true);
    }
  };

  // Toggle Service Availability
  const handleToggleServiceAvailable = async (service) => {
    try {
      const res = await adminAPI.updateServiceStatus(service._id, {
        isAvailable: service.isAvailable === false ? true : false,
        reason: `Service active state set to ${service.isAvailable === false ? 'Active' : 'Inactive'}`
      });
      if (res.success) {
        showToast(`Service "${service.businessName}" availability updated`);
        loadSectionData('services');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update service availability', true);
    }
  };

  // Resolve Complaint Ticket
  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!resolvingReport) return;
    setActionLoading(true);
    try {
      const res = await adminAPI.updateComplaint(resolvingReport._id, {
        status: resolutionStatus,
        adminNotes: adminResolutionNotes
      });
      if (res.success) {
        showToast(`Complaint #${resolvingReport._id.slice(-6)} marked as ${resolutionStatus}`);
        setResolvingReport(null);
        setAdminResolutionNotes('');
        loadSectionData('support_reviews');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update complaint status', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Moderate Review (Delete with dynamic score recalculation)
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to moderate and remove this review? The target rating will be dynamically recalculated.')) return;
    setActionLoading(true);
    try {
      const res = await adminAPI.deleteReview(reviewId);
      if (res.success) {
        showToast('Review removed and target rating recalculated');
        loadSectionData('support_reviews');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete review', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Admin (Super Admin only)
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminAPI.createAdmin(newAdminData);
      if (res.success) {
        showToast('New Administrator account provisioned');
        setShowCreateAdminModal(false);
        setNewAdminData({ name: '', email: '', password: '', phone: '', role: 'ADMIN', permissions: ['ALL'] });
        loadSectionData('settings_reports');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create administrator', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Platform Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminAPI.updateSettings(settings);
      if (res.success) {
        showToast('Platform settings saved successfully');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings', true);
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Exporters
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBookingsCSV = () => {
    if (!bookings || bookings.length === 0) {
      showToast('No booking records to export', true);
      return;
    }
    const headers = ['Booking ID', 'Item Type', 'Item Title', 'Customer Name', 'Customer Email', 'Customer Phone', 'Provider/Host', 'Amount (INR)', 'Booking Status', 'Payment Status', 'Created At'];
    const rows = bookings.map(b => [
      b._id,
      b.itemType || 'Property',
      b.itemId?.title || b.itemId?.businessName || 'N/A',
      b.sender?.name || 'N/A',
      b.sender?.email || 'N/A',
      b.sender?.phone || 'N/A',
      b.receiver?.name || 'N/A',
      b.totalAmount || b.pricing?.finalTotal || 0,
      b.status,
      b.paymentStatus || 'Pending',
      new Date(b.createdAt).toISOString()
    ]);
    downloadCSV(`StaySync_Bookings_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Bookings CSV exported successfully');
  };

  const exportUsersCSV = () => {
    if (!users || users.length === 0) {
      showToast('No user records to export', true);
      return;
    }
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Account Status', 'City', 'Created At'];
    const rows = users.map(u => [
      u._id,
      u.name,
      u.email,
      u.phone || 'N/A',
      u.role,
      u.accountStatus || 'Active',
      u.currentCity || 'N/A',
      new Date(u.createdAt).toISOString()
    ]);
    downloadCSV(`StaySync_Users_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Users CSV exported successfully');
  };

  const exportPaymentsCSV = () => {
    if (!payments || payments.length === 0) {
      showToast('No payment records to export', true);
      return;
    }
    const headers = ['Payment ID', 'Order ID', 'Payer Name', 'Payer Email', 'Payee Name', 'Amount (INR)', 'Platform Fee (INR)', 'Method', 'Status', 'Date'];
    const rows = payments.map(p => [
      p._id,
      p.gatewayOrderId || p._id,
      p.payer?.name || 'N/A',
      p.payer?.email || 'N/A',
      p.payee?.name || 'N/A',
      p.amount || 0,
      Math.round((p.amount || 0) * 0.05),
      p.paymentMethod || 'UPI',
      p.status,
      new Date(p.createdAt).toISOString()
    ]);
    downloadCSV(`StaySync_Payments_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Payments CSV exported successfully');
  };

  const handleApproveRefund = async (refundId, action) => {
    setActionLoading(true);
    setProcessingRefundId(refundId);
    try {
      const res = await paymentsAPI.approveRefund(refundId, {
        action,
        adminNotes: action === 'APPROVE' ? 'Approved by Admin' : 'Declined under policy rules'
      });
      if (res.success) {
        showToast(`Refund ${action === 'APPROVE' ? 'approved and processed' : 'rejected'}`);
        const updated = await paymentsAPI.getRefunds();
        if (updated.data) setRefundsList(updated.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update refund', true);
    } finally {
      setActionLoading(false);
      setProcessingRefundId(null);
    }
  };

  const handleProcessSettlement = async (ownerId) => {
    setActionLoading(true);
    try {
      const res = await paymentsAPI.processSettlement({
        ownerId,
        transactionReference: `UTR-STAY-${Date.now().toString().slice(-8)}`,
        notes: 'Administrative payout batch disbursement'
      });
      if (res.success) {
        showToast('Settlement payout processed successfully');
        const updated = await paymentsAPI.getAdminSettlements();
        if (updated.data) setSettlementsList(updated.data);
        if (updated.summary) setSettlementsSummary(updated.summary);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process settlement', true);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // SIDEBAR SECTIONS DEFINITION (EXACTLY 7 SECTIONS)
  // ============================================================================
  const navSections = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users, badge: stats.users },
    { id: 'verification_listings', label: 'Verification & Listings', icon: ShieldCheck, badge: stats.pendingVerifications },
    { id: 'services', label: 'Service Management', icon: UtensilsCrossed, badge: stats.services },
    { id: 'bookings_payments', label: 'Bookings & Payments', icon: CalendarCheck, badge: stats.bookings },
    { id: 'support_reviews', label: 'Support & Reviews', icon: AlertOctagon, badge: stats.openReports },
    { id: 'settings_reports', label: 'Settings & Reports', icon: Sliders }
  ];

  const currentSectionMeta = navSections.find(s => s.id === activeSection) || navSections[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased overflow-x-hidden">
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside
        className={`bg-white border-r border-slate-200/90 flex flex-col shrink-0 sticky top-0 h-screen select-none z-30 transition-all duration-300 shadow-xs ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } max-md:${mobileSidebarOpen ? 'fixed inset-y-0 left-0 w-64' : 'hidden'}`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-slate-150 flex items-center justify-between gap-3 ${sidebarCollapsed ? 'flex-col px-2' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/logo-icon.svg" alt="StaySync Logo" className="w-9 h-9 object-contain shrink-0" />
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-slate-900 tracking-tight">StaySync</span>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md border border-teal-200">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-400">Control Panel v2.5</p>
              </div>
            )}
          </div>

          {/* Sidebar Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navSections.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Profile & Logout */}
        <div className={`p-3 border-t border-slate-150 bg-slate-50/60 ${sidebarCollapsed ? 'p-2' : ''}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] font-semibold text-teal-700 truncate">{user?.role || 'SUPER_ADMIN'}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Sign Out"
              className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="hidden sm:inline">Super Admin</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="text-slate-900 font-extrabold flex items-center gap-1.5">
                <currentSectionMeta.icon className="w-4 h-4 text-teal-600" />
                {currentSectionMeta.label}
              </span>
            </div>
          </div>

          {/* Center: Global Search Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global search (Users, Listings, Bookings)..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setUserSearch(e.target.value);
                  setPropertySearch(e.target.value);
                  setServiceSearch(e.target.value);
                  setBookingSearch(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
              {globalSearch && (
                <button
                  onClick={() => {
                    setGlobalSearch('');
                    setUserSearch('');
                    setPropertySearch('');
                    setServiceSearch('');
                    setBookingSearch('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions, Notifications & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Refresh Data */}
            <button
              onClick={() => loadSectionData(activeSection)}
              disabled={loading}
              title="Refresh active section"
              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition relative"
                title="Audit Notifications"
              >
                <Bell className="w-4 h-4" />
                {(stats.pendingVerifications > 0 || stats.openReports > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                    <h4 className="text-xs font-bold text-slate-900">Platform Notifications</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                      Live
                    </span>
                  </div>
                  <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                    {stats.pendingVerifications > 0 && (
                      <div
                        onClick={() => {
                          setActiveSection('verification_listings');
                          setVerificationListingSubTab('verification');
                          setNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 cursor-pointer hover:bg-amber-50 transition"
                      >
                        <p className="text-xs font-bold text-amber-900">Verification Pending</p>
                        <p className="text-[11px] text-amber-700">{stats.pendingVerifications} property/service requests awaiting audit.</p>
                      </div>
                    )}
                    {stats.openReports > 0 && (
                      <div
                        onClick={() => {
                          setActiveSection('support_reviews');
                          setSupportReviewsSubTab('complaints');
                          setNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80 cursor-pointer hover:bg-rose-50 transition"
                      >
                        <p className="text-xs font-bold text-rose-900">Open Complaints</p>
                        <p className="text-[11px] text-rose-700">{stats.openReports} grievance tickets require investigation.</p>
                      </div>
                    )}
                    {stats.recentActivity && stats.recentActivity.slice(0, 3).map((act, i) => (
                      <div key={i} className="p-2 text-xs text-slate-600 border-b border-slate-100 last:border-0">
                        <span className="font-bold text-slate-900">{act.action}</span>
                        <p className="text-[10px] text-slate-400">{new Date(act.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SaaS Theme Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>SaaS Light</span>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">{user?.name || 'Super Admin'}</p>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200">
                  ROOT
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* TOAST ALERTS */}
        {successToast && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {errorToast && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorToast}</span>
            </div>
            <button onClick={() => setErrorToast('')}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ================================================================ */}
          {/* 1. OVERVIEW SECTION */}
          {/* ================================================================ */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              
              {/* Header & Date Range Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Platform Command Center</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Real-time platform analytics, inventory health, and revenue oversight
                  </p>
                </div>
                
                {/* Period Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                  {['7d', '30d', '90d'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        period === p ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real Platform KPI Cards (7 Core Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Registered Users */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Total Registered Users</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-slate-900">{stats.users}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {stats.tenants} Tenants • {stats.owners} Landlords
                    </p>
                  </div>
                </div>

                {/* 2. Property Owners & Providers */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Owners & Service Providers</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-slate-900">{stats.owners + stats.providers}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {stats.owners} Property • {stats.providers} Daily Service
                    </p>
                  </div>
                </div>

                {/* 3. Active Listings & Services */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Active Listings & Services</span>
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-slate-900">{stats.verifiedProperties + stats.verifiedServices}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {stats.verifiedProperties} Accommodations • {stats.verifiedServices} Services
                    </p>
                  </div>
                </div>

                {/* 4. Active Bookings & Orders */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Active Bookings & Orders</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-slate-900">{stats.bookings}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {stats.acceptedBookings} Accepted • {stats.activeRequests} Pending
                    </p>
                  </div>
                </div>

                {/* 5. Gross Volume & Commission */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Gross Captured Volume</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-slate-900">₹{stats.grossVolume?.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-bold text-teal-700 mt-1">
                      ₹{stats.platformRevenue?.toLocaleString('en-IN')} Platform Commission (5%)
                    </p>
                  </div>
                </div>

                {/* 6. Pending Verifications Queue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Pending Verifications</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-slate-900">{stats.pendingVerifications}</p>
                    <button
                      onClick={() => {
                        setActiveSection('verification_listings');
                        setVerificationListingSubTab('verification');
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 mt-1"
                    >
                      Audit queue <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 7. Open Complaints & Grievances */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Open Customer Complaints</span>
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-900">{stats.openReports}</p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Grievances requiring investigation</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSection('support_reviews');
                        setSupportReviewsSubTab('complaints');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Review Complaints</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Date-Filtered Charts & Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Daily Revenue & Volume Chart (2 Cols) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Revenue & Booking Trends ({period})</h3>
                      <p className="text-xs text-slate-500">Live captured payment volume vs daily bookings count</p>
                    </div>
                    <span className="text-[11px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      5% Commission Ledger
                    </span>
                  </div>

                  {stats.revenueTrend && stats.revenueTrend.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {stats.revenueTrend.map((item, idx) => {
                        const maxVal = Math.max(...stats.revenueTrend.map(i => i.volume || 1));
                        const pct = Math.min(100, Math.round(((item.volume || 0) / maxVal) * 100));
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-600">{item._id}</span>
                              <span className="text-slate-900">₹{(item.volume || 0).toLocaleString('en-IN')} ({item.count || 0} txn)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(8, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 my-4">
                      <p className="text-xs font-bold text-slate-500">No captured transactions in selected date range.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Live payments recorded in the Payment ledger will graph automatically.</p>
                    </div>
                  )}

                  {/* Accommodation Inventory Breakdown */}
                  <div className="mt-6 pt-5 border-t border-slate-150 grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] font-bold text-slate-500">Hostels</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        {stats.propertyTypeCounts?.find(p => p._id === 'Hostel')?.count || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] font-bold text-slate-500">PG Stays</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        {stats.propertyTypeCounts?.find(p => p._id === 'PG')?.count || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] font-bold text-slate-500">Private Rooms</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        {stats.propertyTypeCounts?.find(p => p._id === 'Flat' || p._id === 'Room')?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Platform Activity Feed (1 Col) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      Recent Activity
                    </h3>
                    <button
                      onClick={() => {
                        setActiveSection('settings_reports');
                        setSettingsReportsSubTab('audit');
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="flex-1 divide-y divide-slate-100 overflow-y-auto mt-2 space-y-2">
                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map((log, i) => (
                        <div key={i} className="pt-2.5 first:pt-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-900">{log.action}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{log.reason || 'Admin operation'}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">By: {log.actorName || 'Super Admin'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-6 text-center">No recent administrative logs.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* AI Platform Health & Anomaly Insights */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 rounded-3xl border border-indigo-800/40 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles className="w-48 h-48 text-indigo-400" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-indigo-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black tracking-tight text-white">StaySync AI Platform Health & Risk Engine</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          Health Score: {aiAdminInsights?.healthScore || 94}%
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200/70">Autonomous anomaly detection, transaction risk indicators, and listing compliance monitoring</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-indigo-200">Total GTV: </span>
                      <span className="font-extrabold text-white">₹{(aiAdminInsights?.totalGTV || stats.grossVolume || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Anomalies Detected */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                      Detected Attention Flags ({aiAdminInsights?.anomaliesDetected?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {aiAdminInsights?.anomaliesDetected && aiAdminInsights.anomaliesDetected.length > 0 ? (
                        aiAdminInsights.anomaliesDetected.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs flex items-start gap-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                              item.severity === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {item.severity}
                            </span>
                            <div>
                              <p className="font-bold text-white text-xs">{item.title}</p>
                              <p className="text-[11px] text-slate-300 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">Zero anomalies or suspicious transaction patterns detected.</p>
                      )}
                    </div>
                  </div>

                  {/* AI Recommendations & Compliance Checks */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-teal-300 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      Autonomous System Directives & Suggestions
                    </h4>
                    <div className="space-y-2">
                      {aiAdminInsights?.platformSuggestions && aiAdminInsights.platformSuggestions.length > 0 ? (
                        aiAdminInsights.platformSuggestions.map((sug, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs flex items-start gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-200 font-medium">{sug}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">All services, FSSAI compliance checks, and Razorpay webhooks operating at optimal status.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* 2. USER MANAGEMENT SECTION */}
          {/* ================================================================ */}
          {activeSection === 'users' && (
            <div className="space-y-5">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">User Management Directory</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Search, inspect profiles, update privileges, and manage security suspensions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportUsersCSV}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Interactive Role Tabs Bar */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                {[
                  {
                    id: 'ALL',
                    label: 'All Users',
                    icon: Users,
                    color: 'text-slate-600',
                    activeBg: 'bg-slate-900 text-white shadow-xs',
                    count: userRoleCounts.ALL || stats.users
                  },
                  {
                    id: 'USER',
                    label: 'Tenants & Users',
                    icon: Users,
                    color: 'text-blue-600',
                    activeBg: 'bg-blue-600 text-white shadow-xs',
                    count: userRoleCounts.USER || stats.tenants
                  },
                  {
                    id: 'PROPERTY_OWNER',
                    label: 'Property Owners',
                    icon: Building2,
                    color: 'text-indigo-600',
                    activeBg: 'bg-indigo-600 text-white shadow-xs',
                    count: userRoleCounts.PROPERTY_OWNER || stats.owners
                  },
                  {
                    id: 'PROVIDER',
                    label: 'All Providers',
                    icon: UtensilsCrossed,
                    color: 'text-amber-600',
                    activeBg: 'bg-amber-600 text-white shadow-xs',
                    count: userRoleCounts.PROVIDER || stats.providers
                  },
                  {
                    id: 'CLEANING_PROVIDER',
                    label: 'Cleaning Partners',
                    icon: Sparkles,
                    color: 'text-emerald-600',
                    activeBg: 'bg-emerald-600 text-white shadow-xs',
                    count: userRoleCounts.CLEANING || 0
                  },
                  {
                    id: 'TIFFIN_PROVIDER',
                    label: 'Tiffin Partners',
                    icon: UtensilsCrossed,
                    color: 'text-amber-600',
                    activeBg: 'bg-amber-600 text-white shadow-xs',
                    count: userRoleCounts.TIFFIN || 0
                  },
                  {
                    id: 'LAUNDRY_PROVIDER',
                    label: 'Laundry Partners',
                    icon: Shirt,
                    color: 'text-sky-600',
                    activeBg: 'bg-sky-600 text-white shadow-xs',
                    count: userRoleCounts.LAUNDRY || 0
                  },
                  {
                    id: 'ADMIN',
                    label: 'Administrators',
                    icon: Shield,
                    color: 'text-purple-600',
                    activeBg: 'bg-purple-600 text-white shadow-xs',
                    count: userRoleCounts.ADMIN || stats.admins
                  }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = userRoleFilter === tab.id || (
                    (tab.id === 'PROPERTY_OWNER' && ['HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER'].includes(userRoleFilter)) ||
                    (tab.id === 'ADMIN' && ['SUPER_ADMIN'].includes(userRoleFilter))
                  );
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setUserRoleFilter(tab.id);
                        setUserPage(1);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? `${tab.activeBg} font-extrabold scale-[1.02]`
                          : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : tab.color}`} />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Granular Sub-Pills for Property Owners */}
              {(userRoleFilter === 'PROPERTY_OWNER' || ['HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER'].includes(userRoleFilter)) && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50/60 rounded-xl border border-indigo-200/60 text-xs font-bold animate-in fade-in">
                  <span className="text-[11px] text-indigo-900 font-extrabold mr-1">Owner Sub-Categories:</span>
                  {[
                    { id: 'PROPERTY_OWNER', label: 'All Owners' },
                    { id: 'HOSTEL_OWNER', label: 'Hostel Owners' },
                    { id: 'PG_OWNER', label: 'PG Owners' },
                    { id: 'ROOM_OWNER', label: 'Room Owners' }
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setUserRoleFilter(sub.id); setUserPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                        userRoleFilter === sub.id
                          ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                          : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Granular Sub-Pills for Service Providers */}
              {(['PROVIDER', 'CLEANING_PROVIDER', 'TIFFIN_PROVIDER', 'LAUNDRY_PROVIDER'].includes(userRoleFilter)) && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs font-bold animate-in fade-in">
                  <span className="text-[11px] text-amber-900 font-extrabold mr-1">Provider Sub-Categories:</span>
                  {[
                    { id: 'PROVIDER', label: 'All Providers' },
                    { id: 'CLEANING_PROVIDER', label: 'Cleaning Partners (Housekeeping)' },
                    { id: 'TIFFIN_PROVIDER', label: 'Tiffin & Food Mess' },
                    { id: 'LAUNDRY_PROVIDER', label: 'Laundry & Dry Clean' }
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setUserRoleFilter(sub.id); setUserPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                        userRoleFilter === sub.id
                          ? 'bg-amber-600 text-white font-extrabold shadow-2xs'
                          : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Filters Toolbar (Search & Account Status) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 shrink-0">Account Status:</span>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => { setUserStatusFilter(e.target.value); setUserPage(1); }}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="ALL">All Statuses (Active, Suspended, Deactivated)</option>
                    <option value="Active">Active Accounts Only</option>
                    <option value="Suspended">Suspended Accounts Only</option>
                    <option value="Deactivated">Deactivated (Soft-Deleted)</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Account Status</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="truncate">
                                  <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                u.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                u.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                (u.providerType?.toLowerCase().includes('clean') || u.name?.toLowerCase().includes('clean')) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                (u.providerType?.toLowerCase().includes('tiffin') || u.name?.toLowerCase().includes('tiffin')) ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                (u.providerType?.toLowerCase().includes('laundry') || u.name?.toLowerCase().includes('laundry')) ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                u.propertyType === 'Hostel' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                u.propertyType === 'PG' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                u.propertyType ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                u.role?.includes('OWNER') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                u.role?.includes('PROVIDER') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {u.role === 'PROVIDER'
                                  ? (u.providerType ? `PROVIDER (${u.providerType})` : (u.name?.toLowerCase().includes('clean') ? 'PROVIDER (Cleaning)' : (u.name?.toLowerCase().includes('tiffin') ? 'PROVIDER (Tiffin)' : 'PROVIDER')))
                                  : u.role === 'PROPERTY_OWNER'
                                  ? (u.propertyType ? `OWNER (${u.propertyType})` : 'PROPERTY_OWNER')
                                  : u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              <p className="font-medium">{u.phone || 'N/A'}</p>
                              <p className="text-[10px] text-slate-400">{u.currentCity || 'India'}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                u.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                u.accountStatus === 'Suspended' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  u.accountStatus === 'Active' ? 'bg-emerald-500' :
                                  u.accountStatus === 'Suspended' ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                                {u.accountStatus || 'Active'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewUserProfile(u)}
                                  className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                                  title="View Full Profile"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSuspendModalUser(u);
                                    setSuspensionTargetStatus(u.accountStatus === 'Suspended' ? 'Active' : 'Suspended');
                                    setSuspensionReason('');
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                  title={u.accountStatus === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                                {user?.role === 'SUPER_ADMIN' && (
                                  <button
                                    onClick={() => {
                                      setRoleModalUser(u);
                                      setNewSelectedRole(u.role);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                                    title="Change User Role"
                                  >
                                    <UserCog className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                            No users matched the search query or active filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {userTotalPages > 1 && (
                  <div className="p-4 border-t border-slate-150 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Page {userPage} of {userTotalPages}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        disabled={userPage <= 1}
                        className="px-3 py-1.5 bg-slate-100 rounded-lg disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                        disabled={userPage >= userTotalPages}
                        className="px-3 py-1.5 bg-slate-100 rounded-lg disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* 3. VERIFICATION & LISTINGS SECTION */}
          {/* ================================================================ */}
          {activeSection === 'verification_listings' && (
            <div className="space-y-5">
              
              {/* Header & Sub-Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Verification & Property Listings</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Audit submitted listings, verify identity credentials, and control inventory publication
                  </p>
                </div>
                
                {/* Sub-Tab Navigation */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setVerificationListingSubTab('verification')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      verificationListingSubTab === 'verification' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verification Queue</span>
                    {stats.pendingVerifications > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-black">
                        {stats.pendingVerifications}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setVerificationListingSubTab('listings')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      verificationListingSubTab === 'listings' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Accommodation Listings</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-black">
                      {stats.properties}
                    </span>
                  </button>
                  <button
                    onClick={() => setVerificationListingSubTab('locations')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      verificationListingSubTab === 'locations' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Location Intelligence Map</span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB A: VERIFICATION QUEUE */}
              {verificationListingSubTab === 'verification' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Pending Properties Column */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                          Pending Accommodation Reviews ({verifications.properties?.length || 0})
                        </h3>
                      </div>

                      <div className="mt-3 space-y-3 max-h-[600px] overflow-y-auto">
                        {verifications.properties && verifications.properties.length > 0 ? (
                          verifications.properties.map((p) => (
                            <div key={p._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {p.propertyType}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 mt-1">{p.title}</h4>
                                  <p className="text-[11px] text-slate-500">{p.address}, {p.city}</p>
                                </div>
                                <span className="text-xs font-black text-slate-900">₹{p.price}/bed</span>
                              </div>
                              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                                <span className="text-[11px] font-semibold text-slate-600">Owner: {p.owner?.name || 'Landlord'}</span>
                                <button
                                  onClick={() => setVerifyingItem({ type: 'Property', item: p })}
                                  className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                                >
                                  Audit & Verify
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 py-8 text-center font-semibold">No pending property verifications.</p>
                        )}
                      </div>
                    </div>

                    {/* Pending Service Providers Column */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                          Pending Service Provider Reviews ({verifications.services?.length || 0})
                        </h3>
                      </div>

                      <div className="mt-3 space-y-3 max-h-[600px] overflow-y-auto">
                        {verifications.services && verifications.services.length > 0 ? (
                          verifications.services.map((s) => (
                            <div key={s._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                    {s.category}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 mt-1">{s.businessName}</h4>
                                  <p className="text-[11px] text-slate-500">{s.address}, {s.city}</p>
                                </div>
                                <span className="text-xs font-black text-slate-900">Radius: {s.serviceRadius || 5}km</span>
                              </div>
                              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                                <span className="text-[11px] font-semibold text-slate-600">Provider: {s.user?.name || 'Partner'}</span>
                                <button
                                  onClick={() => setVerifyingItem({ type: 'ServiceProvider', item: s })}
                                  className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                                >
                                  Audit & Verify
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 py-8 text-center font-semibold">No pending service provider verifications.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SUB-TAB B: ACCOMMODATION LISTINGS TABLE */}
              {verificationListingSubTab === 'listings' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search listing title, address..."
                        value={propertySearch}
                        onChange={(e) => setPropertySearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>
                    <select
                      value={propertyTypeFilter}
                      onChange={(e) => setPropertyTypeFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      <option value="ALL">All Property Types</option>
                      <option value="Hostel">Hostel</option>
                      <option value="PG">PG</option>
                      <option value="Flat">Independent Room / Flat</option>
                    </select>
                    <select
                      value={propertyStatusFilter}
                      onChange={(e) => setPropertyStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      <option value="ALL">All Verification Statuses</option>
                      <option value="Verified">Verified Only</option>
                      <option value="Pending">Pending Audit</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Listings Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Listing</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Owner Contact</th>
                            <th className="py-3 px-4">Pricing</th>
                            <th className="py-3 px-4">Verification</th>
                            <th className="py-3 px-4">Publication State</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {properties.length > 0 ? (
                            properties.map((p) => (
                              <tr key={p._id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100'}
                                      alt="Property"
                                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                    />
                                    <div className="truncate max-w-[200px]">
                                      <p className="font-bold text-slate-900 truncate">{p.title}</p>
                                      <p className="text-[11px] text-slate-500 truncate">{p.address}, {p.city}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-700">{p.propertyType}</td>
                                <td className="py-3.5 px-4 text-slate-600">
                                  <p className="font-semibold">{p.owner?.name || 'Owner'}</p>
                                  <p className="text-[10px] text-slate-400">{p.owner?.phone || 'N/A'}</p>
                                </td>
                                <td className="py-3.5 px-4 font-black text-slate-900">
                                  ₹{p.price} <span className="text-[10px] font-semibold text-slate-400">/bed</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    p.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    p.verificationStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                    {p.verificationStatus}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <button
                                    onClick={() => handleTogglePropertyAvailable(p)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                      p.isAvailable !== false
                                        ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                    }`}
                                  >
                                    {p.isAvailable !== false ? 'Published (Live)' : 'Hidden / Full'}
                                  </button>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => setViewingListing(p)}
                                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                                    title="View Listing Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                                No accommodation listings match the active filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB C: LOCATION INTELLIGENCE & MAP OVERVIEW (Part 10) */}
              {verificationListingSubTab === 'locations' && (
                <AdminLocationOverview />
              )}

            </div>
          )}

          {/* ================================================================ */}
          {/* 4. SERVICE MANAGEMENT SECTION */}
          {/* ================================================================ */}
          {activeSection === 'services' && (
            <div className="space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Daily Living Service Management</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Tiffin & meal subscriptions, laundry wash loads, and housekeeping providers
                  </p>
                </div>
              </div>

              {/* Category Filter Tabs Bar for Services */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                {[
                  { id: 'ALL', label: 'All Services', icon: Sparkles, activeBg: 'bg-slate-900 text-white shadow-xs', count: stats.services },
                  { id: 'Cleaning', label: 'Cleaning & Housekeeping', icon: Sparkles, activeBg: 'bg-emerald-600 text-white shadow-xs', color: 'text-emerald-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Cleaning')?.count || 0 },
                  { id: 'Tiffin', label: 'Tiffin & Daily Meals', icon: UtensilsCrossed, activeBg: 'bg-amber-600 text-white shadow-xs', color: 'text-amber-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Tiffin')?.count || 0 },
                  { id: 'Laundry', label: 'Laundry & Wash Loads', icon: Shirt, activeBg: 'bg-sky-600 text-white shadow-xs', color: 'text-sky-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Laundry')?.count || 0 },
                  { id: 'Maintenance', label: 'Maintenance & Repairs', icon: Sliders, activeBg: 'bg-indigo-600 text-white shadow-xs', color: 'text-indigo-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Maintenance')?.count || 0 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = serviceCategoryFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setServiceCategoryFilter(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? `${tab.activeBg} font-extrabold scale-[1.02]`
                          : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : tab.color || 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search provider business or address..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <select
                  value={serviceCategoryFilter}
                  onChange={(e) => setServiceCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Tiffin">Tiffin & Meals</option>
                  <option value="Laundry">Laundry & Wash</option>
                  <option value="Cleaning">Housekeeping & Cleaning</option>
                  <option value="Maintenance">Maintenance & Repair</option>
                  <option value="Movers">Relocation & Movers</option>
                </select>
                <select
                  value={serviceStatusFilter}
                  onChange={(e) => setServiceStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Verification States</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Services Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Service Business</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Provider Contact</th>
                        <th className="py-3 px-4">City / Area</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4">Operational State</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {services.length > 0 ? (
                        services.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{s.businessName}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                {s.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              <p className="font-semibold">{s.user?.name || 'Partner'}</p>
                              <p className="text-[10px] text-slate-400">{s.user?.email || 'N/A'}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {s.city} (Radius: {s.serviceRadius || 5}km)
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{s.rating?.toFixed(1) || '4.0'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                s.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                s.verificationStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {s.verificationStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleToggleServiceAvailable(s)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                  s.isAvailable !== false
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                {s.isAvailable !== false ? 'Active & Serving' : 'Deactivated'}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setViewingService(s)}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                                title="View Package Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                            No service providers match the active criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* 5. BOOKINGS & PAYMENTS SECTION */}
          {/* ================================================================ */}
          {activeSection === 'bookings_payments' && (
            <div className="space-y-5">
              
              {/* Header & Sub-Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Bookings & Financial Ledger</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Central oversight of accommodation reservations, daily living orders, and captured payments
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sub-Tab Navigation */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setBookingsPaymentsSubTab('bookings')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        bookingsPaymentsSubTab === 'bookings' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Bookings & Orders</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-black">
                        {stats.bookings}
                      </span>
                    </button>
                    <button
                      onClick={() => setBookingsPaymentsSubTab('payments')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        bookingsPaymentsSubTab === 'payments' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Payments & Commission</span>
                    </button>
                    <button
                      onClick={() => setBookingsPaymentsSubTab('refunds')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        bookingsPaymentsSubTab === 'refunds' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refund Requests</span>
                      {refundsList.filter(r => r.status === 'Pending').length > 0 && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-black">
                          {refundsList.filter(r => r.status === 'Pending').length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setBookingsPaymentsSubTab('settlements')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        bookingsPaymentsSubTab === 'settlements' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Settlements & Payouts</span>
                      {settlementsList.filter(s => s.status === 'Pending').length > 0 && (
                        <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded-full font-black">
                          {settlementsList.filter(s => s.status === 'Pending').length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Export CSV */}
                  <button
                    onClick={bookingsPaymentsSubTab === 'bookings' ? exportBookingsCSV : exportPaymentsCSV}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB A: BOOKINGS & ORDERS */}
              {bookingsPaymentsSubTab === 'bookings' && (
                <div className="space-y-4">
                  {/* Category Filter Tabs Bar for Services */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                {[
                  { id: 'ALL', label: 'All Services', icon: Sparkles, activeBg: 'bg-slate-900 text-white shadow-xs', count: stats.services },
                  { id: 'Cleaning', label: 'Cleaning & Housekeeping', icon: Sparkles, activeBg: 'bg-emerald-600 text-white shadow-xs', color: 'text-emerald-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Cleaning')?.count || 0 },
                  { id: 'Tiffin', label: 'Tiffin & Daily Meals', icon: UtensilsCrossed, activeBg: 'bg-amber-600 text-white shadow-xs', color: 'text-amber-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Tiffin')?.count || 0 },
                  { id: 'Laundry', label: 'Laundry & Wash Loads', icon: Shirt, activeBg: 'bg-sky-600 text-white shadow-xs', color: 'text-sky-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Laundry')?.count || 0 },
                  { id: 'Maintenance', label: 'Maintenance & Repairs', icon: Sliders, activeBg: 'bg-indigo-600 text-white shadow-xs', color: 'text-indigo-600', count: stats.serviceCategoryCounts?.find(c => c._id === 'Maintenance')?.count || 0 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = serviceCategoryFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setServiceCategoryFilter(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? `${tab.activeBg} font-extrabold scale-[1.02]`
                          : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : tab.color || 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search Booking ID, Tenant, Host..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>
                    <select
                      value={bookingTypeFilter}
                      onChange={(e) => setBookingTypeFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      <option value="ALL">All Item Types</option>
                      <option value="Property">Accommodations (Hostel / PG)</option>
                      <option value="ServiceProvider">Daily Services (Tiffin / Laundry)</option>
                    </select>
                    <select
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      <option value="ALL">All Booking Statuses</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Accepted">Accepted & Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Bookings Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Booking ID</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Listing / Provider</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Payment</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {bookings.length > 0 ? (
                            bookings.map((b) => (
                              <tr key={b._id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                  #{b._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-900">{b.sender?.name || 'Customer'}</p>
                                  <p className="text-[10px] text-slate-400">{b.sender?.phone || 'N/A'}</p>
                                </td>
                                <td className="py-3.5 px-4">
                                  <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                                    {b.itemId?.title || b.itemId?.businessName || 'StaySync Listing'}
                                  </p>
                                  <p className="text-[10px] text-slate-400">Host: {b.receiver?.name || 'Partner'}</p>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {b.itemType || 'Property'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-black text-slate-900">
                                  ₹{b.totalAmount || b.pricing?.finalTotal || '0'}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    b.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {b.paymentStatus || 'Pending'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    b.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700' :
                                    b.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                                    b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                                    'bg-amber-50 text-amber-700'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => setViewingBooking(b)}
                                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                                No booking records found matching current filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB B: PAYMENTS & COMMISSION */}
              {bookingsPaymentsSubTab === 'payments' && (
                <div className="space-y-4">
                  
                  {/* Financial KPI Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-500">Total Captured Volume</span>
                      <p className="text-xl font-black text-slate-900 mt-1">₹{paymentMetrics.grossVolume?.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-500">Platform Commission (5%)</span>
                      <p className="text-xl font-black text-teal-700 mt-1">₹{paymentMetrics.platformFee?.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-500">Captured Transactions</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{payments.filter(p => p.status === 'Captured').length}</p>
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Order Ref</th>
                            <th className="py-3 px-4">Payer</th>
                            <th className="py-3 px-4">Payee</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Platform Fee</th>
                            <th className="py-3 px-4">Method</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {payments.length > 0 ? (
                            payments.map((p) => (
                              <tr key={p._id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                  {p.gatewayOrderId || p._id.slice(-8)}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-900">{p.payer?.name || 'Customer'}</td>
                                <td className="py-3.5 px-4 text-slate-600">{p.payee?.name || 'Provider'}</td>
                                <td className="py-3.5 px-4 font-black text-slate-900">₹{p.amount?.toLocaleString('en-IN')}</td>
                                <td className="py-3.5 px-4 font-extrabold text-teal-700">₹{Math.round((p.amount || 0) * 0.05)}</td>
                                <td className="py-3.5 px-4 font-semibold text-slate-700">{p.paymentMethod || 'UPI'}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    p.status === 'Captured' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    p.status === 'Created' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                                No payment records logged in ledger.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* SUB-TAB C: REFUND MANAGEMENT */}
              {bookingsPaymentsSubTab === 'refunds' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-500">Total Refund Claims</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{refundsList.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
                      <span className="text-xs font-bold text-amber-700">Pending Review</span>
                      <p className="text-xl font-black text-amber-900 mt-1">
                        {refundsList.filter(r => r.status === 'Pending').length}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                      <span className="text-xs font-bold text-emerald-700">Disbursed Refunds</span>
                      <p className="text-xl font-black text-emerald-900 mt-1">
                        ₹{refundsList.filter(r => r.status === 'Processed').reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-150 flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Resident Cancellation & Refund Queue</h3>
                      <button
                        onClick={async () => {
                          const res = await paymentsAPI.getRefunds();
                          if (res.data) setRefundsList(res.data);
                        }}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                            <th className="py-3 px-4">Claim ID</th>
                            <th className="py-3 px-4">Resident</th>
                            <th className="py-3 px-4">Reason & Policy</th>
                            <th className="py-3 px-4">Original Paid</th>
                            <th className="py-3 px-4">Refund Amount</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Ref / Razorpay ID</th>
                            <th className="py-3 px-4 text-right">Admin Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {refundsList && refundsList.length > 0 ? (
                            refundsList.map((ref) => (
                              <tr key={ref._id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                  #{ref._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-900">{ref.payer?.name || 'Resident'}</p>
                                  <p className="text-[11px] text-slate-500">{ref.payer?.email}</p>
                                </td>
                                <td className="py-3 px-4 max-w-xs">
                                  <p className="font-semibold text-slate-800 truncate">{ref.reason || 'Cancellation'}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">Rule: {ref.cancellationTierApplied || 'Cancellation Policy'}</p>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-600">
                                  ₹{(ref.originalPaidAmount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4 font-black text-rose-700">
                                  ₹{(ref.amount || 0).toLocaleString('en-IN')}
                                  <span className="text-[10px] ml-1 text-slate-500 font-normal">({ref.refundType})</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    ref.status === 'Processed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    ref.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {ref.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                  {ref.razorpayRefundId || '—'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {ref.status === 'Pending' ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleApproveRefund(ref._id, 'APPROVE')}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                                      >
                                        <Check className="w-3 h-3" /> Approve
                                      </button>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleApproveRefund(ref._id, 'REJECT')}
                                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-[11px] font-bold transition flex items-center gap-1"
                                      >
                                        <X className="w-3 h-3" /> Decline
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                                No refund claims recorded in system.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB D: OWNER SETTLEMENTS & PAYOUTS */}
              {bookingsPaymentsSubTab === 'settlements' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-500">Total Settled Disbursements</span>
                      <p className="text-xl font-black text-emerald-700 mt-1">
                        ₹{(settlementsSummary?.totalSettled || settlementsList.filter(s => s.status === 'Settled').reduce((sum, s) => sum + s.netPayoutAmount, 0)).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
                      <span className="text-xs font-bold text-blue-700">Pending Payable Amount</span>
                      <p className="text-xl font-black text-blue-900 mt-1">
                        ₹{(settlementsSummary?.totalPending || settlementsList.filter(s => s.status === 'Pending').reduce((sum, s) => sum + s.netPayoutAmount, 0)).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-teal-200 bg-teal-50/30 shadow-xs">
                      <span className="text-xs font-bold text-teal-700">Platform Commission Earned (5%)</span>
                      <p className="text-xl font-black text-teal-900 mt-1">
                        ₹{(settlementsSummary?.commissionCollected || settlementsList.filter(s => s.status === 'Settled').reduce((sum, s) => sum + s.commissionAmount, 0)).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-150 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Owner Payout Batches & Ledger</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Automated 5% commission deduction with UTR electronic bank dispatch</p>
                      </div>
                      <button
                        onClick={async () => {
                          const res = await paymentsAPI.getAdminSettlements();
                          if (res.data) setSettlementsList(res.data);
                          if (res.summary) setSettlementsSummary(res.summary);
                        }}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                            <th className="py-3 px-4">Batch ID</th>
                            <th className="py-3 px-4">Property Landlord</th>
                            <th className="py-3 px-4">Settlement Period</th>
                            <th className="py-3 px-4">Gross Revenue</th>
                            <th className="py-3 px-4">Commission (5%)</th>
                            <th className="py-3 px-4">Net Payout</th>
                            <th className="py-3 px-4">Status & UTR</th>
                            <th className="py-3 px-4 text-right">Disbursement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {settlementsList && settlementsList.length > 0 ? (
                            settlementsList.map((st) => (
                              <tr key={st._id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                  #{st.settlementBatchId || st._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-900">{st.owner?.name || 'Owner'}</p>
                                  <p className="text-[11px] text-slate-500">{st.owner?.email}</p>
                                </td>
                                <td className="py-3 px-4 text-slate-600 text-[11px]">
                                  {new Date(st.periodStart).toLocaleDateString()} — {new Date(st.periodEnd).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-700">
                                  ₹{(st.grossCollectedAmount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4 font-semibold text-teal-700">
                                  ₹{(st.commissionAmount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4 font-black text-slate-900">
                                  ₹{(st.netPayoutAmount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    st.status === 'Settled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    st.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}>
                                    {st.status}
                                  </span>
                                  {st.transactionReference && (
                                    <p className="font-mono text-[10px] text-slate-500 mt-0.5">{st.transactionReference}</p>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {st.status === 'Pending' ? (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleProcessSettlement(st.owner?._id || st.owner)}
                                      className="px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-[11px] font-bold transition flex items-center gap-1 ml-auto shadow-xs"
                                    >
                                      <CheckCircle2 className="w-3 h-3" /> Disburse
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 justify-end">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                                No owner settlement batches logged yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


            </div>
          )}

          {/* ================================================================ */}
          {/* 6. SUPPORT & REVIEWS SECTION */}
          {/* ================================================================ */}
          {activeSection === 'support_reviews' && (
            <div className="space-y-5">
              
              {/* Header & Sub-Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Customer Grievances & Review Moderation</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Investigate customer dispute tickets, enforce community safety, and moderate fraudulent reviews
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setSupportReviewsSubTab('complaints')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      supportReviewsSubTab === 'complaints' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Complaints & Disputes</span>
                    {stats.openReports > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-black">
                        {stats.openReports}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setSupportReviewsSubTab('reviews')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      supportReviewsSubTab === 'reviews' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Review Moderation</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-black">
                      {reviews.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB A: COMPLAINTS & DISPUTES */}
              {supportReviewsSubTab === 'complaints' && (
                <div className="space-y-4">
                  {/* Status Filter */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                    <select
                      value={complaintStatusFilter}
                      onChange={(e) => setComplaintStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      <option value="ALL">All Grievances</option>
                      <option value="OPEN">Open (Requires Action)</option>
                      <option value="INVESTIGATING">Under Investigation</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="DISMISSED">Dismissed</option>
                    </select>
                  </div>

                  {/* Complaints Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Ticket</th>
                            <th className="py-3 px-4">Reporter</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Filed At</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {complaints.length > 0 ? (
                            complaints.map((c) => (
                              <tr key={c._id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                  #{c._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-900">{c.reporter?.name || 'User'}</td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                    {c.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{c.description}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    c.status === 'INVESTIGATING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    c.status === 'DISMISSED' ? 'bg-slate-100 text-slate-600' :
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => {
                                      setResolvingReport(c);
                                      setResolutionStatus(c.status);
                                      setAdminResolutionNotes(c.adminNotes || '');
                                    }}
                                    className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold transition"
                                  >
                                    Investigate
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                                No customer complaints in the queue.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB B: REVIEW MODERATION */}
              {supportReviewsSubTab === 'reviews' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Target Entity</th>
                          <th className="py-3 px-4">Reviewer</th>
                          <th className="py-3 px-4">Rating</th>
                          <th className="py-3 px-4">Feedback Comment</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {reviews.length > 0 ? (
                          reviews.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                {r.targetName || r.targetType || 'Listing'}
                              </td>
                              <td className="py-3.5 px-4 text-slate-700">{r.author?.name || 'Verified Resident'}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1 font-bold text-amber-500">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                  <span>{r.rating} / 5</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 max-w-sm">{r.comment}</td>
                              <td className="py-3.5 px-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteReview(r._id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete & Recalculate Rating"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                              No user reviews found across properties or daily services.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


            </div>
          )}

          {/* ================================================================ */}
          {/* 7. SETTINGS & REPORTS SECTION */}
          {/* ================================================================ */}
          {activeSection === 'settings_reports' && (
            <div className="space-y-5">
              
              {/* Header & Sub-Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Platform Settings, Governance & Audit</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Platform commission fee, supported cities, administrator RBAC provisioning, and immutable logs
                  </p>
                </div>

                {/* Sub-Tab Navigation */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setSettingsReportsSubTab('reports')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      settingsReportsSubTab === 'reports' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Reports & CSV
                  </button>
                  <button
                    onClick={() => setSettingsReportsSubTab('settings')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      settingsReportsSubTab === 'settings' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Platform Config
                  </button>
                  <button
                    onClick={() => setSettingsReportsSubTab('admins')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      settingsReportsSubTab === 'admins' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Admin RBAC ({admins.length})
                  </button>
                  <button
                    onClick={() => setSettingsReportsSubTab('audit')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      settingsReportsSubTab === 'audit' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Audit Trail
                  </button>
                </div>
              </div>

              {/* SUB-TAB A: REPORTS & CSV EXPORT */}
              {settingsReportsSubTab === 'reports' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <FileSpreadsheet className="w-8 h-8 text-teal-600" />
                        <h3 className="text-sm font-black text-slate-900 mt-3">Bookings & Orders Report</h3>
                        <p className="text-xs text-slate-500 mt-1">Complete export of tenant accommodation bookings and daily service subscriptions.</p>
                      </div>
                      <button
                        onClick={exportBookingsCSV}
                        className="mt-4 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Bookings CSV</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <Users className="w-8 h-8 text-blue-600" />
                        <h3 className="text-sm font-black text-slate-900 mt-3">Registered Users Directory</h3>
                        <p className="text-xs text-slate-500 mt-1">Export customer accounts, landlord credentials, and service provider profiles.</p>
                      </div>
                      <button
                        onClick={exportUsersCSV}
                        className="mt-4 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Users CSV</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <CreditCard className="w-8 h-8 text-purple-600" />
                        <h3 className="text-sm font-black text-slate-900 mt-3">Financial Payments Ledger</h3>
                        <p className="text-xs text-slate-500 mt-1">Export captured transactions, payment methods, order references, and 5% fee commission.</p>
                      </div>
                      <button
                        onClick={exportPaymentsCSV}
                        className="mt-4 px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Payments CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB B: PLATFORM CONFIGURATION */}
              {settingsReportsSubTab === 'settings' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl">
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Platform Commission Fee (%)</label>
                      <input
                        type="number"
                        value={settings.platformFeePercent}
                        onChange={(e) => setSettings({ ...settings, platformFeePercent: Number(e.target.value) })}
                        min="0"
                        max="25"
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                      />
                      <p className="text-[11px] text-slate-400 mt-0.5">Applied to all accommodation bookings and daily living service orders.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Customer Support Email</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Direct Support Helpline</label>
                      <input
                        type="text"
                        value={settings.supportPhone}
                        onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">24/7 Emergency Safety Hotline</label>
                      <input
                        type="text"
                        value={settings.emergencyHelpline}
                        onChange={(e) => setSettings({ ...settings, emergencyHelpline: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters Address</label>
                      <textarea
                        value={settings.headquartersAddress}
                        onChange={(e) => setSettings({ ...settings, headquartersAddress: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="requireAudit"
                        checked={settings.requirePhysicalAuditForVerification}
                        onChange={(e) => setSettings({ ...settings, requirePhysicalAuditForVerification: e.target.checked })}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <label htmlFor="requireAudit" className="text-xs font-bold text-slate-700">
                        Require physical inspection audit note before issuing verified status
                      </label>
                    </div>

                    <div className="pt-4 border-t border-slate-150 flex justify-end">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Platform Settings</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SUB-TAB C: ADMIN RBAC */}
              {settingsReportsSubTab === 'admins' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">Platform Administrators ({admins.length})</h3>
                    {user?.role === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => setShowCreateAdminModal(true)}
                        className="px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Provision Administrator</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Admin Name</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Permissions</th>
                          <th className="py-3 px-4">Created Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {admins.map((adm) => (
                          <tr key={adm._id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{adm.name}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                adm.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {adm.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{adm.email}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                {Array.isArray(adm.permissions) ? adm.permissions.join(', ') : 'ALL'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{new Date(adm.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB D: AUDIT TRAIL */}
              {settingsReportsSubTab === 'audit' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Filter Action:</span>
                    <select
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    >
                      <option value="ALL">All Administrative Actions</option>
                      <option value="USER_ACTIVATED">User Activated</option>
                      <option value="USER_SUSPENDED">User Suspended</option>
                      <option value="ROLE_UPDATED">Role Updated</option>
                      <option value="PROPERTY_APPROVED">Property Approved</option>
                      <option value="SERVICE_MODERATED">Service Moderated</option>
                      <option value="COMPLAINT_RESOLVED">Complaint Resolved</option>
                      <option value="REVIEW_MODERATED">Review Moderated</option>
                      <option value="PLATFORM_SETTINGS_UPDATED">Settings Updated</option>
                    </select>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Acting Admin</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Target Resource</th>
                          <th className="py-3 px-4">Justification Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {auditLogs.length > 0 ? (
                          auditLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 px-4 font-mono text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">{log.actorName || log.actor || 'Admin'}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-700">{log.targetType} #{String(log.targetId).slice(-6)}</td>
                              <td className="py-3.5 px-4 text-slate-600 max-w-xs">{log.reason || 'Completed'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                              No audit trail records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


            </div>
          )}

        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODALS */}
      {/* ==================================================================== */}

      {/* 1. User Profile Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">User Profile Inspection</h3>
              <button onClick={() => setViewingUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                  {viewingUser.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{viewingUser.user?.name}</h4>
                  <p className="text-slate-500 font-medium">{viewingUser.user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">{viewingUser.user?.role}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${viewingUser.user?.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {viewingUser.user?.accountStatus || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-150">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Phone Number</span>
                  <p className="font-semibold text-slate-800">{viewingUser.user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current City</span>
                  <p className="font-semibold text-slate-800">{viewingUser.user?.currentCity || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Registration Date</span>
                  <p className="font-semibold text-slate-800">{new Date(viewingUser.user?.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Monthly Budget</span>
                  <p className="font-semibold text-slate-800">{viewingUser.user?.monthlyBudget ? `₹${viewingUser.user.monthlyBudget}` : 'N/A'}</p>
                </div>
              </div>

              {/* Recent Activity Footprint */}
              {viewingUser.bookings && viewingUser.bookings.length > 0 && (
                <div className="pt-3 border-t border-slate-150">
                  <h5 className="font-bold text-slate-900 mb-2">Recent Booking Requests ({viewingUser.bookings.length})</h5>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {viewingUser.bookings.map((b, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800">{b.itemId?.title || b.itemId?.businessName || 'StaySync Service'}</span>
                        <span className="font-bold text-teal-700">{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suspension Reason (if any) */}
              {viewingUser.user?.suspensionReason && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                  <span className="font-bold">Suspension Justification: </span>
                  {viewingUser.user.suspensionReason}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button onClick={() => setViewingUser(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Suspend / Activate User Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Account Status: {suspendModalUser.name}
            </h3>
            <p className="text-xs text-slate-500">
              Update account status to Active, Suspended, or Deactivated (Soft Delete). Mandatory reason required for audit trails.
            </p>

            <form onSubmit={handleConfirmUserStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Account Status</label>
                <select
                  value={suspensionTargetStatus}
                  onChange={(e) => setSuspensionTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                >
                  <option value="Active">Active (Unrestricted)</option>
                  <option value="Suspended">Suspended (Blocked Access)</option>
                  <option value="Deactivated">Deactivated (Soft-Deleted)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mandatory Justification Reason</label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter reason for audit logs (e.g. Terms violation, requested deactivation)..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendModalUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !suspensionReason.trim()}
                  className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50"
                >
                  Confirm Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Change Role Modal (Super Admin only) */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Elevate / Adjust Role: {roleModalUser.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current Role: <span className="font-bold text-slate-900">{roleModalUser.role}</span>. Root security rules strictly prevent demoting the sole active Super Admin.
            </p>

            <form onSubmit={handleConfirmRoleChange} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Role Assignment</label>
                <select
                  value={newSelectedRole}
                  onChange={(e) => setNewSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                >
                  <option value="USER">Customer / Tenant (USER)</option>
                  <option value="HOSTEL_OWNER">Hostel Owner</option>
                  <option value="PG_OWNER">PG Owner</option>
                  <option value="ROOM_OWNER">Room Owner</option>
                  <option value="TIFFIN_PROVIDER">Tiffin Provider</option>
                  <option value="CLEANING_LAUNDRY_PROVIDER">Laundry & Cleaning Provider</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="SUPER_ADMIN">Super Administrator (Root)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Verification Item Audit Modal */}
      {verifyingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Audit & Verify: {verifyingItem.item.title || verifyingItem.item.businessName}
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p><span className="font-bold">Type:</span> {verifyingItem.type}</p>
              <p><span className="font-bold">Address:</span> {verifyingItem.item.address}, {verifyingItem.item.city}</p>
              <p><span className="font-bold">Contact:</span> {verifyingItem.item.owner?.name || verifyingItem.item.user?.name || 'Owner'} ({verifyingItem.item.owner?.phone || verifyingItem.item.user?.phone || 'N/A'})</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Feedback / Audit Justification Note</label>
              <textarea
                value={verificationFeedback}
                onChange={(e) => setVerificationFeedback(e.target.value)}
                placeholder="Enter audit inspection notes or rejection reason..."
                rows={3}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteVerification('Rejected')}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700"
              >
                Reject Listing
              </button>
              <button
                type="button"
                onClick={() => handleExecuteVerification('Verified')}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Viewing Listing Modal */}
      {viewingListing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">{viewingListing.title}</h3>
              <button onClick={() => setViewingListing(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="text-xs space-y-2">
              <p><span className="font-bold">Type:</span> {viewingListing.propertyType}</p>
              <p><span className="font-bold">Address:</span> {viewingListing.address}, {viewingListing.city}</p>
              <p><span className="font-bold">Pricing:</span> ₹{viewingListing.price}/bed</p>
              <p><span className="font-bold">Total / Vacant Beds:</span> {viewingListing.totalBeds} total / {viewingListing.availableBeds} vacant</p>
              <p><span className="font-bold">Amenities:</span> {viewingListing.amenities?.join(', ') || 'Standard'}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingListing(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Viewing Service Modal */}
      {viewingService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">{viewingService.businessName}</h3>
              <button onClick={() => setViewingService(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="text-xs space-y-2">
              <p><span className="font-bold">Category:</span> {viewingService.category}</p>
              <p><span className="font-bold">Coverage:</span> {viewingService.city} (Radius: {viewingService.serviceRadius}km)</p>
              <p><span className="font-bold">Rating:</span> {viewingService.rating?.toFixed(1)} / 5</p>
              <p><span className="font-bold">Description:</span> {viewingService.description}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingService(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Viewing Booking Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Booking Details #{viewingBooking._id.slice(-6).toUpperCase()}</h3>
              <button onClick={() => setViewingBooking(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="text-xs space-y-2">
              <p><span className="font-bold">Customer:</span> {viewingBooking.sender?.name} ({viewingBooking.sender?.phone || 'N/A'})</p>
              <p><span className="font-bold">Host / Provider:</span> {viewingBooking.receiver?.name} ({viewingBooking.receiver?.phone || 'N/A'})</p>
              <p><span className="font-bold">Item:</span> {viewingBooking.itemId?.title || viewingBooking.itemId?.businessName}</p>
              <p><span className="font-bold">Total Amount:</span> ₹{viewingBooking.totalAmount || viewingBooking.pricing?.finalTotal || 0}</p>
              <p><span className="font-bold">Status:</span> {viewingBooking.status} (Payment: {viewingBooking.paymentStatus || 'Pending'})</p>
              {viewingBooking.cancellationReason && (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded-lg">
                  <span className="font-bold">Cancellation Reason:</span> {viewingBooking.cancellationReason}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingBooking(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Resolve Complaint Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Resolve Complaint #{resolvingReport._id.slice(-6).toUpperCase()}</h3>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p><span className="font-bold">Category:</span> {resolvingReport.category}</p>
              <p><span className="font-bold">Description:</span> {resolvingReport.description}</p>
              <p><span className="font-bold">Reporter:</span> {resolvingReport.reporter?.name} ({resolvingReport.reporter?.email})</p>
            </div>

            <form onSubmit={handleResolveComplaint} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                >
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  value={adminResolutionNotes}
                  onChange={(e) => setAdminResolutionNotes(e.target.value)}
                  placeholder="Enter investigation outcome, owner warning, or resolution notes..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingReport(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Provision Administrator Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Provision Administrator Account</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newAdminData.phone}
                  onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newAdminData.role}
                  onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
                >
                  <option value="ADMIN">Platform Administrator (Standard)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full Root Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
