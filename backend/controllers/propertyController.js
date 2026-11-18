const Property = require('../models/Property');
const RoommateProfile = require('../models/RoommateProfile');
const Request = require('../models/Request');
const jwt = require('jsonwebtoken');
const { parseNaturalQuery } = require('../ai/nlpParser');
const { calculateDistance } = require('../services/locationService');

const CITY_COORDS = {
  Indore: [22.7196, 75.8577],
  Bhopal: [23.2599, 77.4126],
  Bangalore: [12.9716, 77.5946],
  Bengaluru: [12.9716, 77.5946],
  Pune: [18.5204, 73.8567],
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.6139, 77.2090],
  Jaipur: [26.9124, 75.7873],
  Hyderabad: [17.3850, 78.4867],
  Kota: [25.2138, 75.8648],
  Ujjain: [23.1765, 75.7885],
  Gwalior: [26.2183, 78.1828],
  Jabalpur: [23.1815, 79.9864],
  Ahmedabad: [23.0225, 72.5714],
  Lucknow: [26.8467, 80.9462],
  Chandigarh: [30.7333, 76.7794]
};

// Helper to normalize room types
const normalizeRoomType = (type) => {
  if (!type) return null;
  const t = type.trim();
  if (/^1[\s-]?seater/i.test(t) || /^single/i.test(t)) return '1-Seater Room';
  if (/^2[\s-]?seater/i.test(t) || /^double/i.test(t) || /^shared$/i.test(t)) return '2-Seater Room';
  if (/^3[\s-]?seater/i.test(t) || /^triple/i.test(t)) return '3-Seater Room';
  return t;
};

// Helper to normalize hostel category
const normalizeHostelCategory = (cat) => {
  if (!cat) return null;
  const c = cat.trim();
  if (/girls?\s*(?:&|and)\s*boys?|co[\s-]?ed|mixed/i.test(c)) return 'Girls & Boys Hostel';
  if (/girls?|female|women|ladies/i.test(c)) return 'Girls Hostel';
  if (/boys?|male|gents?|men/i.test(c)) return 'Boys Hostel';
  return c;
};

// @desc    Get all properties (with hostel filters & NLP support)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    let queryFilters = {};

    // 1. NLP Search parsing
    if (req.query.nlpSearch) {
      const rawQuery = req.query.nlpSearch.trim();
      const parsedFilters = parseNaturalQuery(rawQuery);
      const conditions = [];

      if (parsedFilters.city) {
        conditions.push({ city: new RegExp(parsedFilters.city, 'i') });
      } else if (req.query.city && req.query.city !== 'All') {
        conditions.push({ city: new RegExp(req.query.city, 'i') });
      }

      if (parsedFilters.budget) {
        conditions.push({
          $or: [
            { monthlyRent: { $lte: parsedFilters.budget } },
            { rentPerPerson: { $lte: parsedFilters.budget } },
            { 'roomTiers.rentPerPerson': { $lte: parsedFilters.budget } }
          ]
        });
      }

      if (parsedFilters.roomType) {
        const normRoom = normalizeRoomType(parsedFilters.roomType);
        conditions.push({
          $or: [
            { roomType: normRoom },
            { 'roomTiers.roomType': normRoom }
          ]
        });
      }

      if (parsedFilters.propertyType) {
        conditions.push({ propertyType: parsedFilters.propertyType });
      }

      if (parsedFilters.hostelCategory) {
        conditions.push({ hostelCategory: parsedFilters.hostelCategory });
      } else if (parsedFilters.gender === 'Female') {
        conditions.push({
          hostelCategory: { $in: ['Girls Hostel', 'Girls & Boys Hostel'] }
        });
      } else if (parsedFilters.gender === 'Male') {
        conditions.push({
          hostelCategory: { $in: ['Boys Hostel', 'Girls & Boys Hostel'] }
        });
      }

      if (parsedFilters.foodAvailable !== undefined) {
        conditions.push({ foodAvailable: parsedFilters.foodAvailable });
      }

      if (parsedFilters.ac) {
        if (parsedFilters.ac === 'AC') {
          conditions.push({ amenities: 'AC' });
        } else {
          conditions.push({ amenities: { $ne: 'AC' } });
        }
      }

      if (parsedFilters.location) {
        conditions.push({
          $or: [
            { title: new RegExp(parsedFilters.location, 'i') },
            { address: new RegExp(parsedFilters.location, 'i') },
            { description: new RegExp(parsedFilters.location, 'i') },
            { 'location.locality': new RegExp(parsedFilters.location, 'i') },
            { 'location.area': new RegExp(parsedFilters.location, 'i') },
            { 'location.landmark': new RegExp(parsedFilters.location, 'i') },
            { 'location.formattedAddress': new RegExp(parsedFilters.location, 'i') }
          ]
        });
      }

      if (conditions.length > 0) {
        queryFilters = { $and: conditions };
      }

    } else {
      // 2. Standard dropdown filters
      const conditions = [];

      if (req.query.owner) {
        conditions.push({ owner: req.query.owner });
      }

      if (req.query.city && req.query.city !== 'All' && req.query.city !== 'All Cities') {
        conditions.push({ city: new RegExp(req.query.city.trim(), 'i') });
      }

      if (req.query.location || req.query.area || req.query.search) {
        const loc = (req.query.location || req.query.area || req.query.search).trim();
        conditions.push({
          $or: [
            { address: new RegExp(loc, 'i') },
            { title: new RegExp(loc, 'i') },
            { city: new RegExp(loc, 'i') },
            { description: new RegExp(loc, 'i') },
            { 'location.locality': new RegExp(loc, 'i') },
            { 'location.area': new RegExp(loc, 'i') },
            { 'location.landmark': new RegExp(loc, 'i') },
            { 'location.formattedAddress': new RegExp(loc, 'i') }
          ]
        });
      }

      // Radius filter
      if (req.query.radius && req.query.userLat && req.query.userLng) {
        const uLat = parseFloat(req.query.userLat);
        const uLng = parseFloat(req.query.userLng);
        const uRadius = parseFloat(req.query.radius);
        if (!isNaN(uLat) && !isNaN(uLng) && !isNaN(uRadius) && uRadius > 0) {
          const radiusInRadians = uRadius / 6378.1;
          conditions.push({
            $or: [
              {
                'location.coordinates': {
                  $geoWithin: {
                    $centerSphere: [[uLng, uLat], radiusInRadians]
                  }
                }
              },
              {
                latitude: { $gte: uLat - (uRadius / 111), $lte: uLat + (uRadius / 111) },
                longitude: {
                  $gte: uLng - (uRadius / (111 * Math.cos((uLat * Math.PI) / 180))),
                  $lte: uLng + (uRadius / (111 * Math.cos((uLat * Math.PI) / 180)))
                }
              }
            ]
          });
        }
      }

      if (req.query.maxBudget || req.query.budget) {
        const budgetVal = parseInt(req.query.maxBudget || req.query.budget);
        conditions.push({
          $or: [
            { monthlyRent: { $lte: budgetVal } },
            { rentPerPerson: { $lte: budgetVal } },
            { 'roomTiers.rentPerPerson': { $lte: budgetVal } }
          ]
        });
      }

      if (req.query.roomType && req.query.roomType !== 'All') {
        const normRoom = normalizeRoomType(req.query.roomType);
        conditions.push({
          $or: [
            { roomType: normRoom },
            { 'roomTiers.roomType': normRoom, 'roomTiers.availableBeds': { $gt: 0 } }
          ]
        });
      }

      if (req.query.propertyType && req.query.propertyType !== 'All') {
        conditions.push({ propertyType: req.query.propertyType });
      }

      if (req.query.hostelCategory && req.query.hostelCategory !== 'All') {
        const normCat = normalizeHostelCategory(req.query.hostelCategory);
        if (normCat === 'Girls Hostel') {
          // Strictly Girls Stays Only
          conditions.push({ hostelCategory: 'Girls Hostel' });
        } else if (normCat === 'Boys Hostel') {
          // Strictly Boys Stays Only
          conditions.push({ hostelCategory: 'Boys Hostel' });
        } else {
          conditions.push({ hostelCategory: normCat });
        }
      } else if (req.query.gender) {
        if (req.query.gender.toLowerCase() === 'female') {
          conditions.push({ hostelCategory: 'Girls Hostel' });
        } else if (req.query.gender.toLowerCase() === 'male') {
          conditions.push({ hostelCategory: 'Boys Hostel' });
        }
      }

      if (req.query.foodAvailable && req.query.foodAvailable === 'true') {
        conditions.push({ foodAvailable: true });
      }

      if (req.query.verifiedOnly && req.query.verifiedOnly === 'true') {
        conditions.push({ verificationStatus: 'Verified' });
      }

      if (req.query.amenities) {
        const amenitiesArr = req.query.amenities.split(',');
        conditions.push({ amenities: { $all: amenitiesArr } });
      }

      if (conditions.length > 0) {
        queryFilters = { $and: conditions };
      }
    }

    let properties = await Property.find(queryFilters).populate('owner', 'name phone email profileImage');

    // 3. Fallback search if strict NLP filters returned 0 results
    if (properties.length === 0 && req.query.nlpSearch) {
      const parsedFilters = parseNaturalQuery(req.query.nlpSearch);
      const fallbackConditions = [];

      if (parsedFilters.city) {
        fallbackConditions.push({ city: new RegExp(parsedFilters.city, 'i') });
      } else if (req.query.city && req.query.city !== 'All') {
        fallbackConditions.push({ city: new RegExp(req.query.city, 'i') });
      }

      if (parsedFilters.budget) {
        fallbackConditions.push({ monthlyRent: { $lte: parsedFilters.budget * 1.35 } });
      }

      if (parsedFilters.hostelCategory) {
        fallbackConditions.push({ hostelCategory: parsedFilters.hostelCategory });
      }

      const fallbackQuery = fallbackConditions.length > 0 ? { $and: fallbackConditions } : {};
      properties = await Property.find(fallbackQuery).populate('owner', 'name phone email profileImage');
    }

    // 4. Format properties with room occupancy, rent per person, amenities, food availability, and available beds
    const formattedProperties = properties.map(property => {
      const raw = property.toObject();

      // Normalize roomType
      let roomType = raw.roomType || '2-Seater Room';
      if (roomType === 'Single') roomType = '1-Seater Room';
      if (roomType === 'Shared') roomType = '2-Seater Room';

      // Determine occupancy from roomType
      let occupancy = raw.occupancy || (roomType === '1-Seater Room' ? 1 : roomType === '3-Seater Room' ? 3 : 2);
      let totalBeds = raw.totalBeds || occupancy;
      let availableBeds = raw.availableBeds !== undefined ? raw.availableBeds : 1;
      let rentPerPerson = raw.rentPerPerson || raw.monthlyRent || 6000;
      let hostelCategory = raw.hostelCategory || 'Girls & Boys Hostel';

      // Room tiers based on actual propertyType and configured tiers
      let roomTiers = raw.roomTiers && raw.roomTiers.length > 0 ? raw.roomTiers : [];
      if (roomTiers.length > 0) {
        roomTiers = roomTiers.map(t => {
          const tot = Math.max(1, t.totalBeds || t.occupancy || 1);
          const av = Math.max(0, Math.min(t.availableBeds !== undefined ? t.availableBeds : tot, tot));
          return {
            ...t,
            totalBeds: tot,
            availableBeds: av,
            isAvailable: t.isAvailable !== false && av > 0
          };
        });
      } else {
        if (raw.propertyType === 'PG') {
          const pgOffers = (Array.isArray(raw.roomTypesOffered) && raw.roomTypesOffered.length > 0)
            ? raw.roomTypesOffered
            : ['Single Room (Private)', 'Double Sharing (2 Beds)'];
          roomTiers = pgOffers.map(stType => {
            const isSingle = stType.includes('Single') || stType.includes('1');
            const isTriple = stType.includes('Triple') || stType.includes('3');
            const is4 = stType.includes('4');
            const occ = isSingle ? 1 : isTriple ? 3 : is4 ? 4 : 2;
            const tRent = isSingle ? Math.round(rentPerPerson * 1.25 / 100) * 100 : isTriple ? Math.round(rentPerPerson * 0.85 / 100) * 100 : is4 ? Math.round(rentPerPerson * 0.75 / 100) * 100 : rentPerPerson;
            const tBeds = occ;
            const aBeds = Math.min(availableBeds, tBeds);
            return {
              roomType: stType,
              occupancy: occ,
              rentPerPerson: tRent,
              totalBeds: tBeds,
              availableBeds: aBeds,
              isAvailable: aBeds > 0
            };
          });
        } else if (raw.propertyType === 'Room' || raw.propertyType === 'Flat') {
          roomTiers = [
            {
              roomType: raw.roomType || '1 BHK Flat',
              occupancy: occupancy,
              rentPerPerson: rentPerPerson,
              totalBeds: 1,
              availableBeds: Math.min(availableBeds, 1),
              isAvailable: availableBeds > 0
            }
          ];
        } else {
          // Default Hostel room tiers
          roomTiers = [
            {
              roomType: '1-Seater Room',
              occupancy: 1,
              rentPerPerson: Math.round(rentPerPerson * 1.35 / 100) * 100,
              totalBeds: 1,
              availableBeds: roomType === '1-Seater Room' ? Math.min(availableBeds, 1) : 1,
              isAvailable: true
            },
            {
              roomType: '2-Seater Room',
              occupancy: 2,
              rentPerPerson: rentPerPerson,
              totalBeds: 2,
              availableBeds: roomType === '2-Seater Room' ? Math.min(availableBeds, 2) : 2,
              isAvailable: true
            },
            {
              roomType: '3-Seater Room',
              occupancy: 3,
              rentPerPerson: Math.round(rentPerPerson * 0.78 / 100) * 100,
              totalBeds: 3,
              availableBeds: roomType === '3-Seater Room' ? Math.min(availableBeds, 3) : 2,
              isAvailable: true
            }
          ];
        }
      }

      // If a specific roomType was requested in query or NLP, adapt primary view to that configured tier
      const targetRoom = req.query.roomType ? normalizeRoomType(req.query.roomType) : null;
      if (targetRoom) {
        const matchingTier = roomTiers.find(t => t.roomType === targetRoom && t.isAvailable !== false);
        if (matchingTier) {
          roomType = matchingTier.roomType;
          occupancy = matchingTier.occupancy;
          totalBeds = matchingTier.totalBeds || matchingTier.occupancy;
          availableBeds = matchingTier.availableBeds;
          rentPerPerson = matchingTier.rentPerPerson;
        }
      }

      // Roommate accommodation info for shared rooms
      const isShared = occupancy > 1;
      const roommateInfo = {
        isShared,
        occupancy,
        totalBeds,
        availableBeds,
        occupiedBeds: Math.max(0, occupancy - availableBeds),
        roommatesPresent: Math.max(0, occupancy - availableBeds),
        roommateStatusText: isShared
          ? `${availableBeds} of ${occupancy} beds open (${Math.max(0, occupancy - availableBeds)} roommate currently residing)`
          : 'Private Single Occupancy (No roommates)'
      };

      // Accurate Haversine Distance calculation
      const pLat = raw.location?.coordinates?.[1] || raw.latitude;
      const pLng = raw.location?.coordinates?.[0] || raw.longitude;

      let distance = null;
      const uLat = req.query.userLat ? parseFloat(req.query.userLat) : null;
      const uLng = req.query.userLng ? parseFloat(req.query.userLng) : null;

      if (uLat !== null && uLng !== null && !isNaN(uLat) && !isNaN(uLng) && pLat && pLng) {
        distance = calculateDistance(uLat, uLng, pLat, pLng);
      } else if (pLat && pLng) {
        // Distance from representative city center
        const cityCenter = CITY_COORDS[raw.city] || [22.7196, 75.8577];
        distance = calculateDistance(cityCenter[0], cityCenter[1], pLat, pLng);
      }

      // Location Privacy policy check for public feed
      const isApproximate = raw.location?.visibility === 'approximate' || raw.location?.visibility === 'booked';
      const safeLatitude = isApproximate ? (pLat + 0.0025) : pLat;
      const safeLongitude = isApproximate ? (pLng - 0.002) : pLng;
      const safeAddress = isApproximate ? (raw.location?.locality || raw.city || 'Prime Area') : raw.address;

      return {
        ...raw,
        address: safeAddress,
        latitude: safeLatitude,
        longitude: safeLongitude,
        isApproximateLocation: isApproximate,
        hostelCategory,
        roomType,
        occupancy,
        totalBeds,
        availableBeds,
        rentPerPerson,
        monthlyRent: rentPerPerson,
        roomTiers,
        roommateInfo,
        distance
      };
    });

    // Sorting support: Nearest First, Lowest Rent, Highest Rated, Recently Added
    const sortBy = req.query.sortBy || req.query.sort;
    if (sortBy === 'nearest') {
      formattedProperties.sort((a, b) => ((a.distance ?? 9999) - (b.distance ?? 9999)));
    } else if (sortBy === 'lowest_rent' || sortBy === 'price_low') {
      formattedProperties.sort((a, b) => (a.rentPerPerson || a.monthlyRent || 0) - (b.rentPerPerson || b.monthlyRent || 0));
    } else if (sortBy === 'highest_rated' || sortBy === 'rating') {
      formattedProperties.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'recent' || sortBy === 'recently_added') {
      formattedProperties.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    res.json({ success: true, count: formattedProperties.length, data: formattedProperties });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name phone email profileImage');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a property listing
// @route   POST /api/properties
// @access  Private (Owner/Admin)
exports.createProperty = async (req, res) => {
  try {
    // Add owner to req.body
    req.body.owner = req.user.id;

    const cityBase = CITY_COORDS[req.body.city] || [22.7196, 75.8577];

    if (!req.body.latitude || !req.body.longitude) {
      if (req.body.location?.coordinates && req.body.location.coordinates.length === 2) {
        req.body.longitude = req.body.location.coordinates[0];
        req.body.latitude = req.body.location.coordinates[1];
      } else {
        req.body.latitude = cityBase[0] + (Math.random() - 0.5) * 0.04;
        req.body.longitude = cityBase[1] + (Math.random() - 0.5) * 0.04;
      }
    }

    // Build structured GeoJSON location subdocument
    if (!req.body.location) {
      req.body.location = {
        address: req.body.address || '',
        city: req.body.city || '',
        locality: req.body.locality || req.body.area || '',
        area: req.body.area || '',
        landmark: req.body.landmark || '',
        state: req.body.state || 'Madhya Pradesh',
        pincode: req.body.pincode || '',
        type: 'Point',
        coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
        visibility: req.body.locationVisibility || req.body.visibility || 'public',
        verified: req.user?.role === 'ADMIN',
        formattedAddress: [req.body.address, req.body.locality, req.body.city, req.body.state || 'Madhya Pradesh'].filter(Boolean).join(', '),
        lastUpdatedAt: new Date()
      };
    } else {
      req.body.location.type = 'Point';
      if (!req.body.location.coordinates || req.body.location.coordinates.length < 2) {
        req.body.location.coordinates = [Number(req.body.longitude), Number(req.body.latitude)];
      }
      if (!req.body.location.visibility) {
        req.body.location.visibility = req.body.locationVisibility || 'public';
      }
      req.body.location.lastUpdatedAt = new Date();
    }

    if (req.body.hostelCategory) {
      req.body.hostelCategory = normalizeHostelCategory(req.body.hostelCategory);
    }
    if (req.body.roomType) {
      req.body.roomType = normalizeRoomType(req.body.roomType);
    }

    // Auto-calculate from roomTiers if provided
    if (Array.isArray(req.body.roomTiers) && req.body.roomTiers.length > 0) {
      const activeTiers = req.body.roomTiers.filter(t => t.isAvailable !== false);
      if (activeTiers.length > 0) {
        if (!req.body.monthlyRent && !req.body.rentPerPerson) {
          req.body.rentPerPerson = Math.min(...activeTiers.map(t => t.rentPerPerson));
          req.body.monthlyRent = req.body.rentPerPerson;
        }
        if (!req.body.roomType) {
          req.body.roomType = activeTiers[0].roomType;
          req.body.occupancy = activeTiers[0].occupancy;
        }
        if (!req.body.availableBeds) {
          req.body.availableBeds = activeTiers.reduce((sum, t) => sum + (t.availableBeds || 1), 0);
        }
      }
    }

    if (!req.body.securityDeposit) {
      req.body.securityDeposit = req.body.rentPerPerson || req.body.monthlyRent || 5000;
    }

    if (!req.body.verificationStatus) {
      req.body.verificationStatus = 'Verified';
    }

    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    // Strip owner to prevent ownership spoofing/tampering
    delete req.body.owner;

    if (req.body.hostelCategory) {
      req.body.hostelCategory = normalizeHostelCategory(req.body.hostelCategory);
    }
    if (req.body.roomType) {
      req.body.roomType = normalizeRoomType(req.body.roomType);
    }

    // Synchronize location subdocument
    if (req.body.location) {
      if (Array.isArray(req.body.location.coordinates) && req.body.location.coordinates.length === 2) {
        req.body.longitude = Number(req.body.location.coordinates[0]);
        req.body.latitude = Number(req.body.location.coordinates[1]);
        req.body.location.type = 'Point';
      }
      req.body.location.lastUpdatedAt = new Date();
    } else if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      const latNum = Number(req.body.latitude);
      const lngNum = Number(req.body.longitude);
      req.body.location = {
        ...(property.location ? property.location.toObject() : {}),
        address: req.body.address || property.address,
        city: req.body.city || property.city,
        locality: req.body.locality || property.location?.locality || '',
        area: req.body.area || property.location?.area || '',
        landmark: req.body.landmark || property.location?.landmark || '',
        state: req.body.state || property.location?.state || 'Madhya Pradesh',
        pincode: req.body.pincode || property.location?.pincode || '',
        type: 'Point',
        coordinates: [lngNum, latNum],
        visibility: req.body.locationVisibility || property.location?.visibility || 'public',
        lastUpdatedAt: new Date()
      };
    }

    if (Array.isArray(req.body.roomTiers) && req.body.roomTiers.length > 0) {
      const activeTiers = req.body.roomTiers.filter(t => t.isAvailable !== false);
      if (activeTiers.length > 0) {
        if (!req.body.monthlyRent && !req.body.rentPerPerson) {
          req.body.rentPerPerson = Math.min(...activeTiers.map(t => t.rentPerPerson));
          req.body.monthlyRent = req.body.rentPerPerson;
        }
      }
      req.body.availableBeds = req.body.roomTiers.reduce((sum, t) => sum + (t.availableBeds || 0), 0);
      req.body.totalBeds = req.body.roomTiers.reduce((sum, t) => sum + (t.totalBeds || t.occupancy || 1), 0);
      req.body.isAvailable = req.body.availableBeds > 0;
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get lightweight property pins for map
// @route   GET /api/properties/map
// @access  Public
exports.getPropertiesMap = async (req, res) => {
  try {
    const filter = {};
    if (req.query.city && req.query.city !== 'All' && req.query.city !== 'All Cities') {
      filter.city = new RegExp(req.query.city.trim(), 'i');
    }
    if (req.query.propertyType && req.query.propertyType !== 'All') {
      filter.propertyType = req.query.propertyType;
    }
    if (req.query.hostelCategory && req.query.hostelCategory !== 'All') {
      filter.hostelCategory = req.query.hostelCategory;
    }

    const properties = await Property.find(filter)
      .select('title propertyType hostelCategory roomType monthlyRent rentPerPerson rating photos address city location latitude longitude availableBeds occupancy foodAvailable verificationStatus')
      .lean();

    const pins = properties.map(p => {
      const lat = p.location?.coordinates?.[1] || p.latitude;
      const lng = p.location?.coordinates?.[0] || p.longitude;
      const isApprox = p.location?.visibility === 'approximate' || p.location?.visibility === 'booked';
      return {
        _id: p._id,
        title: p.title,
        propertyType: p.propertyType,
        hostelCategory: p.hostelCategory,
        roomType: p.roomType,
        monthlyRent: p.rentPerPerson || p.monthlyRent,
        rentPerPerson: p.rentPerPerson || p.monthlyRent,
        rating: p.rating || 4.5,
        photo: p.photos?.[0] || '',
        address: isApprox ? `${p.location?.locality || p.city}` : p.address,
        city: p.city,
        latitude: isApprox ? (lat + 0.0025) : lat,
        longitude: isApprox ? (lng - 0.002) : lng,
        isApproximate: isApprox,
        availableBeds: p.availableBeds,
        occupancy: p.occupancy,
        foodAvailable: p.foodAvailable,
        verificationStatus: p.verificationStatus
      };
    });

    res.json({ success: true, count: pins.length, data: pins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single property location respecting privacy policy
// @route   GET /api/properties/:id/location
// @access  Public (with optional token verification)
exports.getPropertyLocation = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .select('title address city location latitude longitude owner verificationStatus')
      .populate('owner', 'name phone email');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const visibility = property.location?.visibility || 'public';
    const lat = property.location?.coordinates?.[1] || property.latitude;
    const lng = property.location?.coordinates?.[0] || property.longitude;

    // Optional user token check
    let user = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        user = jwt.verify(token, process.env.JWT_SECRET || 'staysync_jwt_secret_key_12345');
      } catch (err) {}
    }

    const isOwnerOrAdmin = user && (user.id === property.owner?._id?.toString() || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

    // Check if user has an accepted / confirmed request or booking
    let hasConfirmedAccess = isOwnerOrAdmin;
    if (!hasConfirmedAccess && user) {
      const approvedReq = await Request.findOne({
        sender: user.id,
        itemId: property._id,
        status: { $in: ['Accepted', 'Confirmed', 'Owner Approved', 'Checked In'] }
      });
      if (approvedReq) {
        hasConfirmedAccess = true;
      }
    }

    if (visibility === 'public' || hasConfirmedAccess) {
      return res.json({
        success: true,
        data: {
          visibility,
          isExact: true,
          latitude: lat,
          longitude: lng,
          address: property.address,
          locality: property.location?.locality || '',
          area: property.location?.area || '',
          landmark: property.location?.landmark || '',
          city: property.city,
          state: property.location?.state || 'Madhya Pradesh',
          pincode: property.location?.pincode || '',
          formattedAddress: property.location?.formattedAddress || `${property.address}, ${property.city}`,
          verified: property.location?.verified || property.verificationStatus === 'Verified',
          ownerContact: hasConfirmedAccess ? { name: property.owner?.name, phone: property.owner?.phone } : undefined
        }
      });
    }

    // Approximate area returned for privacy
    return res.json({
      success: true,
      data: {
        visibility,
        isExact: false,
        isApproximate: true,
        latitude: lat + 0.0025,
        longitude: lng - 0.002,
        address: `${property.location?.locality || property.location?.area || 'Near Prime Center'}, ${property.city}`,
        locality: property.location?.locality || '',
        area: property.location?.area || '',
        landmark: property.location?.landmark || '',
        city: property.city,
        state: property.location?.state || 'Madhya Pradesh',
        formattedAddress: `${property.location?.locality || 'Prime Locality'}, ${property.city}`,
        verified: property.location?.verified || property.verificationStatus === 'Verified',
        privacyNotice: visibility === 'booked' 
          ? 'Exact address and pinpoint directions are revealed after your booking is confirmed.'
          : 'Approximate locality shown for host safety. Exact pin revealed upon booking or host approval.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update property location
// @route   PUT /api/properties/:id/location
// @access  Private (Owner/Admin)
exports.updatePropertyLocation = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property location' });
    }

    const {
      address,
      city,
      locality,
      area,
      landmark,
      state,
      pincode,
      latitude,
      longitude,
      visibility,
      verified
    } = req.body;

    if (!property.location) {
      property.location = {};
    }

    if (address !== undefined) {
      property.address = address;
      property.location.address = address;
    }
    if (city !== undefined) {
      property.city = city;
      property.location.city = city;
    }
    if (locality !== undefined) property.location.locality = locality;
    if (area !== undefined) property.location.area = area;
    if (landmark !== undefined) property.location.landmark = landmark;
    if (state !== undefined) property.location.state = state;
    if (pincode !== undefined) property.location.pincode = pincode;
    if (visibility !== undefined) property.location.visibility = visibility;

    if (latitude !== undefined && longitude !== undefined) {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        property.latitude = latNum;
        property.longitude = lngNum;
        property.location.type = 'Point';
        property.location.coordinates = [lngNum, latNum];
      }
    }

    // Only Admin can verify directly
    if (req.user.role === 'ADMIN' && verified !== undefined) {
      property.location.verified = Boolean(verified);
    } else {
      property.location.verified = false;
    }

    const parts = [
      property.location.address || property.address,
      property.location.locality || property.location.area,
      property.location.city || property.city,
      property.location.state
    ].filter(Boolean);
    property.location.formattedAddress = parts.join(', ');
    property.location.lastUpdatedAt = new Date();

    await property.save();

    res.json({ success: true, message: 'Property location updated successfully', data: property.location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
