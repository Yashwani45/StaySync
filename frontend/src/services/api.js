import axios from 'axios';

const api = axios.create({
  baseURL: '', // Using relative path since Vite proxy is configured
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staysync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data).then(r => r.data),
  login: (data) => api.post('/api/auth/login', data).then(r => r.data),
  googleAuth: (credential) => api.post('/api/auth/google', { credential }).then(r => r.data),
  getProfile: () => api.get('/api/auth/profile').then(r => r.data),
  updateProfile: (data) => api.put('/api/auth/profile', data).then(r => r.data)
};

// Properties Services
export const propertiesAPI = {
  getProperties: (filters = {}) => api.get('/api/properties', { params: filters }).then(r => r.data),
  getProperty: (id) => api.get(`/api/properties/${id}`).then(r => r.data),
  createProperty: (data) => api.post('/api/properties', data).then(r => r.data),
  updateProperty: (id, data) => api.put(`/api/properties/${id}`, data).then(r => r.data),
  deleteProperty: (id) => api.delete(`/api/properties/${id}`).then(r => r.data)
};

// Roommate Services
export const roommatesAPI = {
  getRoommates: () => api.get('/api/roommates').then(r => r.data),
  getRoommateProfile: (id) => api.get(`/api/roommates/${id}`).then(r => r.data),
  getMatches: () => api.get('/api/roommates/matches').then(r => r.data),
  report: (data) => api.post('/api/roommates/report', data).then(r => r.data)
};

// Modular Service Provider Services
export const servicesAPI = {
  getServices: (filters = {}) => api.get('/api/services', { params: filters }).then(r => r.data),
  getService: (id) => api.get(`/api/services/${id}`).then(r => r.data),
  createService: (data) => api.post('/api/services', data).then(r => r.data),
  updateService: (id, data) => api.put(`/api/services/${id}`, data).then(r => r.data),
  deleteService: (id) => api.delete(`/api/services/${id}`).then(r => r.data),
  getRecommendations: () => api.get('/api/services/recommendations').then(r => r.data)
};

// Booking Request Services
export const requestsAPI = {
  getRequests: () => api.get('/api/requests').then(r => r.data),
  getMyRequests: () => api.get('/api/requests').then(r => r.data),
  createRequest: (data) => api.post('/api/requests', data).then(r => r.data),
  updateRequestStatus: (id, statusData) => api.put(`/api/requests/${id}`, statusData).then(r => r.data)
};

// Complete StaySync 2.0 Booking & Bed Reservation Services
export const bookingsAPI = {
  getAvailableBeds: (propertyId, params = {}) => api.get(`/api/bookings/available-beds/${propertyId}`, { params }).then(r => r.data),
  holdBed: (data) => api.post('/api/bookings/hold-bed', data).then(r => r.data),
  releaseBed: (data) => api.post('/api/bookings/release-bed', data).then(r => r.data),
  createBooking: (data) => api.post('/api/bookings/create', data).then(r => r.data),
  updateStatus: (id, statusData) => api.put(`/api/bookings/${id}/status`, statusData).then(r => r.data),
  cancelBooking: (id, reasonData) => api.post(`/api/bookings/${id}/cancel`, reasonData).then(r => r.data),
  getOwnerCalendar: (propertyId) => api.get(`/api/bookings/owner-calendar/${propertyId}`).then(r => r.data)
};

// Expense Manager Services
export const expensesAPI = {
  getExpenses: () => api.get('/api/expenses').then(r => r.data),
  createExpense: (data) => api.post('/api/expenses', data).then(r => r.data),
  deleteExpense: (id) => api.delete(`/api/expenses/${id}`).then(r => r.data)
};

// Chat Services
export const chatAPI = {
  getConversations: () => api.get('/api/chat/conversations').then(r => r.data),
  getMessages: (conversationId) => api.get(`/api/chat/messages/${conversationId}`).then(r => r.data),
  sendMessage: (data) => api.post('/api/chat/messages', data).then(r => r.data)
};

// Notifications Services
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications').then(r => r.data),
  markAsRead: () => api.put('/api/notifications/read').then(r => r.data)
};

// Admin & Super Admin Services
export const adminAPI = {
  getStats: (params = {}) => api.get('/api/admin/stats', { params }).then(r => r.data),
  getUsers: (params = {}) => api.get('/api/admin/users', { params }).then(r => r.data),
  getUserDetails: (id) => api.get(`/api/admin/users/${id}/details`).then(r => r.data),
  updateUserStatus: (id, data) => api.put(`/api/admin/users/${id}/status`, data).then(r => r.data),
  updateUserRole: (data) => api.put('/api/admin/user-role', data).then(r => r.data),
  getVerifications: () => api.get('/api/admin/verifications').then(r => r.data),
  toggleVerification: (data) => api.put('/api/admin/verify', data).then(r => r.data),
  getProperties: (params = {}) => api.get('/api/admin/properties', { params }).then(r => r.data),
  updatePropertyStatus: (id, data) => api.put(`/api/admin/properties/${id}/status`, data).then(r => r.data),
  getServices: (params = {}) => api.get('/api/admin/services', { params }).then(r => r.data),
  updateServiceStatus: (id, data) => api.put(`/api/admin/services/${id}/status`, data).then(r => r.data),
  getBookings: (params = {}) => api.get('/api/admin/bookings', { params }).then(r => r.data),
  getPayments: (params = {}) => api.get('/api/admin/payments', { params }).then(r => r.data),
  getComplaints: (params = {}) => api.get('/api/admin/complaints', { params }).then(r => r.data),
  updateComplaint: (id, data) => api.put(`/api/admin/complaints/${id}`, data).then(r => r.data),
  getReports: () => api.get('/api/admin/complaints').then(r => r.data),
  getReviews: () => api.get('/api/admin/reviews').then(r => r.data),
  deleteReview: (id) => api.delete(`/api/admin/reviews/${id}`).then(r => r.data),
  getAdmins: () => api.get('/api/admin/admins').then(r => r.data),
  createAdmin: (data) => api.post('/api/admin/create-admin', data).then(r => r.data),
  getSettings: () => api.get('/api/admin/settings').then(r => r.data),
  updateSettings: (data) => api.put('/api/admin/settings', data).then(r => r.data),
  getAuditLogs: (params = {}) => api.get('/api/admin/audit-logs', { params }).then(r => r.data)
};

// Reviews & Ratings Services
export const reviewsAPI = {
  getReviews: (targetId) => api.get(`/api/reviews/${targetId}`).then(r => r.data),
  createReview: (data) => api.post('/api/reviews', data).then(r => r.data)
};

// Payments & Checkout Services
export const paymentsAPI = {
  createOrder: (data) => api.post('/api/payments/create-order', data).then(r => r.data),
  verifyPayment: (data) => api.post('/api/payments/verify', data).then(r => r.data),
  getHistory: () => api.get('/api/payments/history').then(r => r.data),
  getInvoice: (paymentId) => api.get(`/api/payments/invoice/${paymentId}`).then(r => r.data),
  requestRefund: (data) => api.post('/api/payments/refund', data).then(r => r.data),
  getRefunds: () => api.get('/api/payments/refunds').then(r => r.data),
  approveRefund: (id, data) => api.put(`/api/payments/refunds/${id}/approve`, data).then(r => r.data),
  getOwnerSettlements: () => api.get('/api/payments/settlements/owner').then(r => r.data),
  getAdminSettlements: () => api.get('/api/payments/settlements/admin').then(r => r.data),
  processSettlement: (data) => api.post('/api/payments/settlements/process', data).then(r => r.data)
};

// AI Intelligence & Living Assistant Services
export const aiAPI = {
  getRecommendations: (params = {}) => api.get('/api/ai/recommendations', { params }).then(r => r.data),
  askAssistant: (question) => api.post('/api/ai/assistant', { question }).then(r => r.data),
  getRoommateMatch: (id) => api.get(`/api/ai/roommate-match/${id}`).then(r => r.data),
  getOwnerInsights: () => api.get('/api/ai/owner-insights').then(r => r.data),
  getAdminInsights: () => api.get('/api/ai/admin-insights').then(r => r.data)
};

// Resident Management (HRMS / PMS) Services
export const residentAPI = {
  // Maintenance Tickets
  getMaintenanceTickets: () => api.get('/api/resident/maintenance').then(r => r.data),
  createMaintenanceTicket: (data) => api.post('/api/resident/maintenance', data).then(r => r.data),
  updateTicketStatus: (id, data) => api.put(`/api/resident/maintenance/${id}/status`, data).then(r => r.data),

  // Rent Management
  getRentSchedule: () => api.get('/api/resident/rent').then(r => r.data),
  generateRentSchedule: (data) => api.post('/api/resident/rent/generate', data).then(r => r.data),
  payRent: (id, data) => api.post(`/api/resident/rent/${id}/pay`, data).then(r => r.data),

  // Digital Agreements
  getAgreements: () => api.get('/api/resident/agreements').then(r => r.data),
  generateAgreement: (data) => api.post('/api/resident/agreements/generate', data).then(r => r.data),
  acknowledgeAgreement: (id) => api.put(`/api/resident/agreements/${id}/acknowledge`).then(r => r.data),

  // Move-in / Move-out Inspections
  getInspections: () => api.get('/api/resident/inspections').then(r => r.data),
  createInspection: (data) => api.post('/api/resident/inspections', data).then(r => r.data),

  // Community Board
  getCommunityPosts: (params = {}) => api.get('/api/resident/community', { params }).then(r => r.data),
  createCommunityPost: (data) => api.post('/api/resident/community', data).then(r => r.data),
  toggleLikePost: (id) => api.post(`/api/resident/community/${id}/like`).then(r => r.data),
  addComment: (id, text) => api.post(`/api/resident/community/${id}/comment`, { text }).then(r => r.data),
  reportPost: (id) => api.put(`/api/resident/community/${id}/report`).then(r => r.data)
};

export default api;
