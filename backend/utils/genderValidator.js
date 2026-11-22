const RoommateProfile = require('../models/RoommateProfile');

/**
 * Gender validation helper to prevent cross-gender bookings
 * (e.g. male user booking a Girls Hostel, or female user booking a Boys Hostel)
 */
const validateGenderMatch = async (user, property) => {
  if (!property || !property.hostelCategory) {
    return { valid: true };
  }

  // Flats, Apartments, and Co-Ed stays are open to everyone
  const cat = (property.hostelCategory || '').toLowerCase();
  const isGirlsOnly = cat.includes('girls') && !cat.includes('boys') && !cat.includes('&') && !cat.includes('co-ed');
  const isBoysOnly = cat.includes('boys') && !cat.includes('girls') && !cat.includes('&') && !cat.includes('co-ed');

  if (!isGirlsOnly && !isBoysOnly) {
    return { valid: true };
  }

  // Resolve user gender from User model or RoommateProfile
  let userGender = (user?.gender || '').toLowerCase();
  if (!userGender && (user?._id || user?.id)) {
    try {
      const profile = await RoommateProfile.findOne({ user: user._id || user.id });
      if (profile && profile.gender) {
        userGender = profile.gender.toLowerCase();
      }
    } catch (e) {
      // ignore
    }
  }

  if (isGirlsOnly && userGender === 'male') {
    return {
      valid: false,
      message: `Cannot book "${property.title}": This is a Girls Hostel exclusively for female residents. Please choose a Boys or Co-Ed stay.`
    };
  }

  if (isBoysOnly && userGender === 'female') {
    return {
      valid: false,
      message: `Cannot book "${property.title}": This is a Boys Hostel exclusively for male residents. Please choose a Girls or Co-Ed stay.`
    };
  }

  return { valid: true };
};

module.exports = {
  validateGenderMatch
};
