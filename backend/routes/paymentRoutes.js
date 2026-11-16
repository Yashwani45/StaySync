const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getPaymentInvoice,
  requestRefund,
  getRefunds,
  approveRefund,
  getOwnerSettlements,
  getAdminSettlements,
  processSettlement,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Public webhook
router.post('/webhook', handleRazorpayWebhook);

// Protected payment endpoints
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/invoice/:paymentId', protect, getPaymentInvoice);

// Refund management
router.post('/refund', protect, requestRefund);
router.get('/refunds', protect, getRefunds);
router.put('/refunds/:id/approve', protect, authorize('ADMIN', 'SUPER_ADMIN'), approveRefund);

// Settlement management
router.get(
  '/settlements/owner',
  protect,
  authorize('PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER', 'PROVIDER', 'TIFFIN_PROVIDER', 'CLEANING_LAUNDRY_PROVIDER', 'ADMIN', 'SUPER_ADMIN'),
  getOwnerSettlements
);
router.get('/settlements/admin', protect, authorize('ADMIN', 'SUPER_ADMIN'), getAdminSettlements);
router.post('/settlements/process', protect, authorize('ADMIN', 'SUPER_ADMIN'), processSettlement);

module.exports = router;
