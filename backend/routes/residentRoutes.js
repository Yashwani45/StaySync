const express = require('express');
const router = express.Router();
const {
  createMaintenanceTicket,
  getMaintenanceTickets,
  updateTicketStatus,
  getRentSchedule,
  generateRentSchedule,
  payRent,
  getAgreements,
  generateAgreement,
  acknowledgeAgreement,
  getInspections,
  createInspection,
  getCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  addComment,
  reportCommunityPost
} = require('../controllers/residentController');
const { protect } = require('../middleware/auth');

// 1. Maintenance
router.post('/maintenance', protect, createMaintenanceTicket);
router.get('/maintenance', protect, getMaintenanceTickets);
router.put('/maintenance/:id/status', protect, updateTicketStatus);

// 2. Rent Management
router.get('/rent', protect, getRentSchedule);
router.post('/rent/generate', protect, generateRentSchedule);
router.post('/rent/:id/pay', protect, payRent);

// 3. Agreements
router.get('/agreements', protect, getAgreements);
router.post('/agreements/generate', protect, generateAgreement);
router.put('/agreements/:id/acknowledge', protect, acknowledgeAgreement);

// 4. Inspections
router.get('/inspections', protect, getInspections);
router.post('/inspections', protect, createInspection);

// 5. Community Board
router.get('/community', getCommunityPosts);
router.post('/community', protect, createCommunityPost);
router.post('/community/:id/like', protect, toggleLikePost);
router.post('/community/:id/comment', protect, addComment);
router.put('/community/:id/report', protect, reportCommunityPost);

module.exports = router;
