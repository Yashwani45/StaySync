const express = require('express');
const router = express.Router();
const {
  searchLocations,
  autocompleteAddress,
  reverseGeocodeLocation,
  validateLocation,
  getNearbyPlaces,
  getNearbyProperties
} = require('../controllers/locationController');

router.get('/search', searchLocations);
router.get('/autocomplete', autocompleteAddress);
router.get('/reverse', reverseGeocodeLocation);
router.post('/validate', validateLocation);
router.get('/nearby-places', getNearbyPlaces);
router.get('/nearby', getNearbyProperties);

module.exports = router;
