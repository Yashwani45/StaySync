const express = require('express');
const router = express.Router();
const { getServices, getService, createService, updateService, deleteService, getCombinedBundles } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Recommendations route must come BEFORE /:id to prevent parameter matching conflict
router.get('/recommendations', protect, getCombinedBundles);

router.route('/')
  .get(getServices)
  .post(protect, authorize('PROVIDER', 'ADMIN'), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('PROVIDER', 'ADMIN'), updateService)
  .delete(protect, authorize('PROVIDER', 'ADMIN'), deleteService);

module.exports = router;
