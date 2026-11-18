const Property = require('../models/Property');
const {
  calculateDistance,
  getNearbyPlacesForLocation,
  searchLocalitiesAndLandmarks
} = require('../services/locationService');
const geoapifyService = require('../services/geoapifyService');

// @desc    Search localities, landmarks, colleges, and transit points (Geoapify + OSM + Local)
// @route   GET /api/location/search
// @access  Public
exports.searchLocations = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || req.query.search || '';
    const city = req.query.city || null;
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lon = req.query.lng || req.query.lon ? parseFloat(req.query.lng || req.query.lon) : null;

    if (!query.trim()) {
      const results = searchLocalitiesAndLandmarks('', city);
      return res.json({
        success: true,
        count: results.length,
        data: results
      });
    }

    // Use Geoapify autocomplete with OpenStreetMap fallback
    const suggestions = await geoapifyService.autocomplete(query, { city, lat, lon });

    // Also get matched curated landmarks
    const localMatches = searchLocalitiesAndLandmarks(query, city);

    // Merge without duplicates
    const combined = [...localMatches];
    const seen = new Set(localMatches.map(m => (m.name || '').toLowerCase()));

    suggestions.forEach(s => {
      const key = (s.name || s.formatted || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(s);
      }
    });

    res.json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Live address autocomplete powered by Geoapify & OSM
// @route   GET /api/location/autocomplete
// @access  Public
exports.autocompleteAddress = async (req, res) => {
  try {
    const query = req.query.text || req.query.q || '';
    const city = req.query.city;
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lon = req.query.lng || req.query.lon ? parseFloat(req.query.lng || req.query.lon) : null;

    if (!query || query.trim().length < 2) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const results = await geoapifyService.autocomplete(query, { city, lat, lon });
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reverse geocoding (coordinates -> address, locality, city)
// @route   GET /api/location/reverse
// @access  Public
exports.reverseGeocodeLocation = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng || req.query.lon);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required.'
      });
    }

    const addressData = await geoapifyService.reverseGeocode(lat, lng);
    res.json({
      success: true,
      data: addressData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Validate coordinates and location address
// @route   POST /api/location/validate
// @access  Public
exports.validateLocation = async (req, res) => {
  try {
    const { lat, lng, address, city, pincode } = req.body;

    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);

    if (isNaN(numLat) || isNaN(numLng)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid coordinates: latitude and longitude must be numbers.'
      });
    }

    if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Coordinates out of geographical boundaries.'
      });
    }

    // Check India bounding box
    const isWithinIndia = numLat >= 6.0 && numLat <= 38.0 && numLng >= 68.0 && numLng <= 98.0;

    let detectedAddress = null;
    try {
      detectedAddress = await geoapifyService.reverseGeocode(numLat, numLng);
    } catch (e) {
      // ignore
    }

    res.json({
      success: true,
      valid: true,
      isWithinIndia,
      data: {
        coordinates: [numLng, numLat], // GeoJSON order [longitude, latitude]
        latitude: numLat,
        longitude: numLng,
        city: detectedAddress?.city || city || '',
        locality: detectedAddress?.locality || '',
        area: detectedAddress?.area || '',
        state: detectedAddress?.state || '',
        pincode: detectedAddress?.pincode || pincode || '',
        formattedAddress: detectedAddress?.formattedAddress || address || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get nearby verified places (colleges, hospitals, transit, markets, etc.) for a coordinate
// @route   GET /api/location/nearby-places
// @access  Public
exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, category, city, limit } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude query parameters are required.'
      });
    }

    const places = getNearbyPlacesForLocation(
      parseFloat(lat),
      parseFloat(lng),
      city,
      category,
      limit ? parseInt(limit) : 20
    );

    res.json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get properties within a specific radius from a point (MongoDB GeoJSON 2dsphere $geoWithin)
// @route   GET /api/location/nearby
// @access  Public
exports.getNearbyProperties = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius || 5); // default 5km
    const city = req.query.city;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required.'
      });
    }

    // 1 Radian in km is ~6378.1
    const radiusInRadians = radiusKm / 6378.1;

    let geoQuery = {
      $or: [
        {
          'location.coordinates': {
            $geoWithin: {
              $centerSphere: [[lng, lat], radiusInRadians]
            }
          }
        },
        // Fallback for documents with legacy latitude and longitude
        {
          latitude: { $gte: lat - (radiusKm / 111), $lte: lat + (radiusKm / 111) },
          longitude: { $gte: lng - (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))), $lte: lng + (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))) }
        }
      ]
    };

    if (city && city !== 'All' && city !== 'All Cities') {
      geoQuery = {
        $and: [
          geoQuery,
          { city: new RegExp(city.trim(), 'i') }
        ]
      };
    }

    const properties = await Property.find(geoQuery).populate('owner', 'name email phone profileImage');

    // Attach calculated Haversine distance
    const withDistance = properties.map(p => {
      const pLat = p.location?.coordinates?.[1] || p.latitude;
      const pLng = p.location?.coordinates?.[0] || p.longitude;
      const dist = (pLat && pLng) ? calculateDistance(lat, lng, pLat, pLng) : null;

      const obj = p.toObject();
      obj.calculatedDistance = dist;
      return obj;
    });

    withDistance.sort((a, b) => (a.calculatedDistance || 999) - (b.calculatedDistance || 999));

    res.json({
      success: true,
      count: withDistance.length,
      data: withDistance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
