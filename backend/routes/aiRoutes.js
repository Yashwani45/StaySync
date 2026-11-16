const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  askLivingAssistant,
  getExplainableRoommateMatch,
  getOwnerInsights,
  getAdminInsights
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// Public or Protected: Real DB personalized stay recommendations
router.get('/recommendations', getPersonalizedRecommendations);

// Protected: AI Living Assistant scoped to current user
router.post('/assistant', protect, askLivingAssistant);

// Protected: In-depth explainable roommate compatibility breakdown
router.get('/roommate-match/:id', protect, getExplainableRoommateMatch);

// Protected: AI Owner Business Insights
router.get(
  '/owner-insights',
  protect,
  authorize('PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER', 'PROVIDER', 'ADMIN', 'SUPER_ADMIN'),
  getOwnerInsights
);

// Protected: AI Admin Platform Insights
router.get('/admin-insights', protect, authorize('ADMIN', 'SUPER_ADMIN'), getAdminInsights);

module.exports = router;
