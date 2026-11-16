const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  getVerificationQueue,
  toggleVerification,
  getPropertiesAdmin,
  updatePropertyStatusAdmin,
  getServicesAdmin,
  updateServiceStatusAdmin,
  getBookingsAdmin,
  getPaymentsAdmin,
  getComplaintsAdmin,
  updateComplaintAdmin,
  getReviewsAdmin,
  deleteReview,
  getAdmins,
  createAdmin,
  getSettings,
  updateSettings,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All Admin routes require ADMIN or SUPER_ADMIN authorization
router.use(protect, authorize('ADMIN', 'SUPER_ADMIN'));

// 1. Dashboard Overview
router.get('/stats', getStats);

// 2. User & Role Management
router.get('/users', getUsers);
router.get('/users/:id/details', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.put('/user-role', updateUserRole);

// 3. Verification Queue
router.get('/verifications', getVerificationQueue);
router.put('/verify', toggleVerification);

// 4. Property Management
router.get('/properties', getPropertiesAdmin);
router.put('/properties/:id/status', updatePropertyStatusAdmin);

// 5. Service Management
router.get('/services', getServicesAdmin);
router.put('/services/:id/status', updateServiceStatusAdmin);

// 6. Central Booking Management
router.get('/bookings', getBookingsAdmin);

// 7. Payments & Financial Oversight
router.get('/payments', getPaymentsAdmin);

// 8. Complaints & Disputes
router.get('/complaints', getComplaintsAdmin);
router.put('/complaints/:id', updateComplaintAdmin);

// 9. Reviews & Ratings Moderation
router.get('/reviews', getReviewsAdmin);
router.delete('/reviews/:id', deleteReview);

// 10. Admin Provisioning & Permissions
router.get('/admins', getAdmins);
router.post('/create-admin', createAdmin);

// 11. Platform Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// 12. Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
