const express = require('express');
const router = express.Router();
const { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  getPropertiesMap,
  getPropertyLocation,
  updatePropertyLocation
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

// Map lightweight pins endpoint
router.get('/map', getPropertiesMap);

// Property location & privacy endpoints
router.route('/:id/location')
  .get(getPropertyLocation)
  .put(protect, authorize('PROPERTY_OWNER', 'ADMIN'), updatePropertyLocation);

router.route('/')
  .get(getProperties)
  .post(protect, authorize('PROPERTY_OWNER', 'ADMIN'), createProperty);

router.route('/:id')
  .get(getProperty)
  .put(protect, authorize('PROPERTY_OWNER', 'ADMIN'), updateProperty)
  .delete(protect, authorize('PROPERTY_OWNER', 'ADMIN'), deleteProperty);

module.exports = router;
