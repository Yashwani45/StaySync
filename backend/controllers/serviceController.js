const ServiceProvider = require('../models/ServiceProvider');
const Property = require('../models/Property');
const RoommateProfile = require('../models/RoommateProfile');
const User = require('../models/User');
const { getCombinedRecommendations } = require('../services/matchingService');

// @desc    Get all service providers with filters
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const conditions = [];

    if (req.query.user) {
      conditions.push({ user: req.query.user });
    }

    if (req.query.category) {
      if (req.query.category === 'Cleaning' || req.query.category === 'Laundry') {
        conditions.push({ category: { $in: ['Cleaning', 'Laundry'] } });
      } else {
        conditions.push({ category: req.query.category });
      }
    } else if (!req.query.user) {
      conditions.push({ category: { $in: ['Tiffin', 'Cleaning', 'Laundry'] } });
    }

    if (req.query.city && req.query.city !== 'All' && req.query.city !== 'All Cities') {
      conditions.push({ city: new RegExp(req.query.city.trim(), 'i') });
    }

    if (req.query.location || req.query.area || req.query.search) {
      const loc = (req.query.location || req.query.area || req.query.search).trim();
      conditions.push({
        $or: [
          { businessName: new RegExp(loc, 'i') },
          { address: new RegExp(loc, 'i') },
          { city: new RegExp(loc, 'i') },
          { description: new RegExp(loc, 'i') }
        ]
      });
    }

    if (req.query.verifiedOnly) {
      conditions.push({ verificationStatus: 'Verified' });
    }

    const queryFilters = conditions.length > 0 ? { $and: conditions } : {};
    const services = await ServiceProvider.find(queryFilters).populate('user', 'name phone email profileImage');
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single service provider
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await ServiceProvider.findById(req.params.id).populate('user', 'name phone email profileImage');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create service provider listing
// @route   POST /api/services
// @access  Private (Provider/Admin)
exports.createService = async (req, res) => {
  try {
    req.body.user = req.user.id;

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

    // Set coordinates based on city if absent
    if (!req.body.latitude || !req.body.longitude) {
      req.body.latitude = cityBase[0] + (Math.random() - 0.5) * 0.04;
      req.body.longitude = cityBase[1] + (Math.random() - 0.5) * 0.04;
    }

    if (!req.body.verificationStatus) {
      req.body.verificationStatus = 'Verified';
    }

    const DIVERSE_CLEANING_PHOTOS = [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80'
    ];
    const DIVERSE_TIFFIN_PHOTOS = [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80'
    ];

    if (!req.body.photos || req.body.photos.length === 0) {
      const userServicesCount = await ServiceProvider.countDocuments({ user: req.user.id });
      const defaultImg = req.body.photoUrl || (
        req.body.category === 'Tiffin' 
          ? DIVERSE_TIFFIN_PHOTOS[userServicesCount % DIVERSE_TIFFIN_PHOTOS.length]
          : req.body.category === 'Laundry'
          ? DIVERSE_CLEANING_PHOTOS[(userServicesCount + 2) % DIVERSE_CLEANING_PHOTOS.length]
          : DIVERSE_CLEANING_PHOTOS[userServicesCount % DIVERSE_CLEANING_PHOTOS.length]
      );
      req.body.photos = [defaultImg];
      if (!req.body.photoUrl) req.body.photoUrl = defaultImg;
    }

    const service = await ServiceProvider.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update service listing
// @route   PUT /api/services/:id
// @access  Private (Provider/Admin)
exports.updateService = async (req, res) => {
  try {
    let service = await ServiceProvider.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }

    if (service.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    // Strip user to prevent ownership spoofing/tampering
    delete req.body.user;

    service = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete service listing
// @route   DELETE /api/services/:id
// @access  Private (Provider/Admin)
exports.deleteService = async (req, res) => {
  try {
    const service = await ServiceProvider.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }

    if (service.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await service.deleteOne();
    res.json({ success: true, message: 'Service provider removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get combined service recommendation bundles based on user profile
// @route   GET /api/services/recommendations
// @access  Private
exports.getCombinedBundles = async (req, res) => {
  try {
    let userProfile = await RoommateProfile.findOne({ user: req.user.id }).populate('user');
    if (!userProfile) {
      const user = await User.findById(req.user.id);
      if (user && user.role === 'USER') {
        userProfile = await RoommateProfile.create({
          user: user._id,
          age: 21,
          gender: 'Other',
          occupation: 'Not Specified',
          monthlyBudget: 10000,
          selectedServices: ['room']
        });
        userProfile.user = user;
      } else {
        return res.status(404).json({ success: false, message: 'Roommate / preference profile not found' });
      }
    }

    const userObj = userProfile.user || {};
    const city = userObj.preferredCity || userObj.currentCity || userObj.city || 'Indore';
    const stayPref = userObj.propertyType || userObj.preferredRoomType || userProfile.roomType || '';
    const gender = userObj.gender || userProfile.gender || '';

    // Fetch rooms matching user's account creation stay preferences and gender
    const propQuery = { city: new RegExp(city, 'i') };
    if (stayPref) propQuery.propertyType = stayPref;
    if (gender.toLowerCase() === 'female') {
      propQuery.hostelCategory = { $in: ['Girls Hostel', 'Girls & Boys Hostel'] };
    } else if (gender.toLowerCase() === 'male') {
      propQuery.hostelCategory = { $in: ['Boys Hostel', 'Girls & Boys Hostel'] };
    }

    let properties = await Property.find(propQuery);
    if (properties.length === 0 && stayPref) {
      // Relax gender, try with propertyType in city
      properties = await Property.find({ city: new RegExp(city, 'i'), propertyType: stayPref });
    }
    if (properties.length === 0) {
      properties = await Property.find({ city: new RegExp(city, 'i') });
    }
    if (properties.length === 0) {
      properties = await Property.find({});
    }

    let providers = await ServiceProvider.find({ city: new RegExp(city, 'i') });
    if (providers.length === 0) {
      providers = await ServiceProvider.find({});
    }

    // Call matching service
    const bundles = getCombinedRecommendations(userProfile, properties, providers);

    res.json({
      success: true,
      count: bundles.length,
      data: bundles
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
