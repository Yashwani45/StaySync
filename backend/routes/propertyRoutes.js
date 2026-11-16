const express = require('express');
const router = express.Router();
const { getProperties, getProperty, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProperties)
  .post(protect, authorize('PROPERTY_OWNER', 'ADMIN'), createProperty);

router.route('/:id')
  .get(getProperty)
  .put(protect, authorize('PROPERTY_OWNER', 'ADMIN'), updateProperty)
  .delete(protect, authorize('PROPERTY_OWNER', 'ADMIN'), deleteProperty);

module.exports = router;
