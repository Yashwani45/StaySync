const Property = require('../models/Property');
const RoommateProfile = require('../models/RoommateProfile');
const Request = require('../models/Request');
const Report = require('../models/Report');
const User = require('../models/User');
const { calculateRoommateCompatibility } = require('../services/matchingService');

// @desc    Get hostel shared rooms with roommate bed openings
// @route   GET /api/roommates
// @access  Private / Public
exports.getRoommates = async (req, res) => {
  try {
    const sharedProperties = await Property.find({
      $or: [
        { roomType: { $in: ['2-Seater Room', '3-Seater Room', 'Shared'] } },
        { occupancy: { $gt: 1 } },
        { 'roomTiers.occupancy': { $gt: 1 }, 'roomTiers.availableBeds': { $gt: 0 } }
      ]
    }).populate('owner', 'name phone email profileImage');

    const hostelRoommateList = sharedProperties.map(prop => {
      const raw = prop.toObject();
      const occupancy = raw.occupancy || 2;
      const availableBeds = raw.availableBeds || 1;
      const occupiedBeds = Math.max(0, occupancy - availableBeds);

      return {
        _id: raw._id,
        propertyId: raw._id,
        hostelTitle: raw.title,
        hostelCategory: raw.hostelCategory || 'Girls & Boys Hostel',
        city: raw.city,
        address: raw.address,
        roomType: raw.roomType || '2-Seater Room',
        occupancy,
        totalBeds: raw.totalBeds || occupancy,
        availableBeds,
        occupiedBeds,
        rentPerPerson: raw.rentPerPerson || raw.monthlyRent,
        foodAvailable: raw.foodAvailable,
        amenities: raw.amenities,
        owner: raw.owner,
        photos: raw.photos,
        roommateNotice: `${availableBeds} of ${occupancy} beds available (${occupiedBeds} roommate present in this room)`
      };
    });

    res.json({
      success: true,
      count: hostelRoommateList.length,
      data: hostelRoommateList,
      message: 'Roommate accommodation spots available in hostels'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get compatible opt-in roommate profiles based on lifestyle & budget
// @route   GET /api/roommates/matches
// @access  Private
exports.getRoommateMatches = async (req, res) => {
  try {
    const myProfile = await RoommateProfile.findOne({ user: req.user.id });

    // Fetch other active profiles in same city or with roommate service enabled
    const query = { user: { $ne: req.user.id } };
    if (myProfile && myProfile.preferredGender && myProfile.preferredGender !== 'Any') {
      query.gender = myProfile.preferredGender;
    }

    const otherProfiles = await RoommateProfile.find(query).populate('user', 'name profileImage currentCity isVerified');

    // Check which users have an accepted connection with req.user.id
    const acceptedConnections = await Request.find({
      itemType: 'Roommate',
      status: 'Accepted',
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    });

    const connectedUserIds = new Set(
      acceptedConnections.map(c => 
        c.sender.toString() === req.user.id ? c.receiver.toString() : c.sender.toString()
      )
    );

    const matchesList = otherProfiles.map(p => {
      const pObj = p.toObject();
      const otherUserId = pObj.user?._id?.toString() || pObj.user?.toString();
      const isConnected = connectedUserIds.has(otherUserId);

      let compatibility = { score: 75, matches: ['Open to room sharing'], differences: [] };
      if (myProfile) {
        compatibility = calculateRoommateCompatibility(myProfile, p);
      }

      return {
        _id: pObj._id,
        userId: otherUserId,
        name: pObj.user?.name || 'Fellow Resident',
        profileImage: pObj.user?.profileImage,
        age: pObj.age,
        gender: pObj.gender,
        occupation: pObj.occupation,
        collegeOrOffice: pObj.collegeOrOffice,
        monthlyBudget: pObj.monthlyBudget,
        foodPreference: pObj.foodPreference,
        sleepSchedule: pObj.sleepSchedule,
        cleanliness: pObj.cleanliness,
        noiseTolerance: pObj.noiseTolerance,
        smoking: pObj.smoking,
        drinking: pObj.drinking,
        acPreference: pObj.acPreference,
        hobbies: pObj.hobbies,
        compatibilityScore: compatibility.score,
        matches: compatibility.matches,
        differences: compatibility.differences,
        isConnected,
        // Contact details are strictly protected until mutual connection
        contact: isConnected ? { phone: pObj.user?.phone, email: pObj.user?.email } : null
      };
    });

    // Sort by compatibility score descending
    matchesList.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      success: true,
      count: matchesList.length,
      data: matchesList
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Report suspicious roommate profile or listing
// @route   POST /api/roommates/report
// @access  Private
exports.reportRoommate = async (req, res) => {
  try {
    const { targetUserId, reason, details } = req.body;

    if (!targetUserId || !reason) {
      return res.status(400).json({ success: false, message: 'Target user ID and reason are required' });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedItem: targetUserId,
      itemType: 'User',
      reason,
      description: details || 'Reported through roommate safety feature'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted for administrative review',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single hostel shared room accommodation info
// @route   GET /api/roommates/:id
// @access  Private / Public
exports.getRoommateProfile = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name phone email profileImage');
      
    if (!property) {
      return res.status(404).json({ success: false, message: 'Hostel accommodation not found' });
    }

    const occupancy = property.occupancy || 2;
    const availableBeds = property.availableBeds || 1;

    res.json({
      success: true,
      data: {
        ...property.toObject(),
        roommateInfo: {
          isShared: occupancy > 1,
          occupancy,
          availableBeds,
          occupiedBeds: Math.max(0, occupancy - availableBeds)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
