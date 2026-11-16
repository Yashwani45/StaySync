const Property = require('../models/Property');
const RoommateProfile = require('../models/RoommateProfile');
const { parseNaturalQuery } = require('../ai/nlpParser');

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
            { description: new RegExp(parsedFilters.location, 'i') }
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
            { description: new RegExp(loc, 'i') }
          ]
        });
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

      const distance = parseFloat((1 + Math.random() * 3.5).toFixed(1));

      return {
        ...raw,
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
    const cityBase = CITY_COORDS[req.body.city] || [22.7196, 75.8577];

    if (!req.body.latitude || !req.body.longitude) {
      req.body.latitude = cityBase[0] + (Math.random() - 0.5) * 0.04;
      req.body.longitude = cityBase[1] + (Math.random() - 0.5) * 0.04;
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
