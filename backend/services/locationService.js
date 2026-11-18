/**
 * Location Service for StaySync
 * Handles spatial distance calculations, landmark discoveries, and locality lookups.
 */

// Haversine distance formula in Kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

// Curated verified places database for major student & professional hubs
const VERIFIED_NEARBY_PLACES = [
  // INDORE - Colleges & Universities
  {
    name: 'SGSITS Engineering College',
    category: 'Colleges & Universities',
    city: 'Indore',
    lat: 22.7244,
    lng: 75.8712,
    address: '23 Sir M. Visvesvaraya Marg, Vallabh Nagar, Indore',
    icon: 'GraduationCap'
  },
  {
    name: 'DAVV Takshashila Campus (Khandwa Rd)',
    category: 'Colleges & Universities',
    city: 'Indore',
    lat: 22.6908,
    lng: 75.8770,
    address: 'Khandwa Road, Bhanwar Kuan, Indore',
    icon: 'GraduationCap'
  },
  {
    name: 'Holkar Science College',
    category: 'Colleges & Universities',
    city: 'Indore',
    lat: 22.6997,
    lng: 75.8675,
    address: 'A.B. Road, Bhawarkua, Indore',
    icon: 'GraduationCap'
  },
  {
    name: 'Medi-Caps University',
    category: 'Colleges & Universities',
    city: 'Indore',
    lat: 22.6186,
    lng: 75.8175,
    address: 'A.B. Road, Pigdamber, Rau, Indore',
    icon: 'GraduationCap'
  },
  {
    name: 'IIM Indore',
    category: 'Colleges & Universities',
    city: 'Indore',
    lat: 22.6247,
    lng: 75.8003,
    address: 'Prabandh Shikhar, Rau-Pithampur Road, Indore',
    icon: 'GraduationCap'
  },
  {
    name: 'IIT Indore (Simrol)',
    category: 'Colleges & Universities',
    city: 'Indore',
    lat: 22.5204,
    lng: 75.9207,
    address: 'Khandwa Road, Simrol, Indore',
    icon: 'GraduationCap'
  },

  // INDORE - Hospitals & Healthcare
  {
    name: 'Bombay Hospital Indore',
    category: 'Hospitals',
    city: 'Indore',
    lat: 22.7562,
    lng: 75.8943,
    address: 'Eastern Ring Rd, Near Vijay Nagar, Indore',
    icon: 'HeartPulse'
  },
  {
    name: 'CHL Hospital',
    category: 'Hospitals',
    city: 'Indore',
    lat: 22.7301,
    lng: 75.8948,
    address: 'A.B. Road, LIG Square, Indore',
    icon: 'HeartPulse'
  },
  {
    name: 'Medanta Super Specialty Hospital',
    category: 'Hospitals',
    city: 'Indore',
    lat: 22.7601,
    lng: 75.9080,
    address: 'Plot No. 8, PU-4, Commercial Complex, Scheme 54, Vijay Nagar, Indore',
    icon: 'HeartPulse'
  },
  {
    name: 'Maharaja Yeshwantrao Hospital (MY Hospital)',
    category: 'Hospitals',
    city: 'Indore',
    lat: 22.7161,
    lng: 75.8688,
    address: 'Sanyogitaganj, South Tukoganj, Indore',
    icon: 'HeartPulse'
  },
  {
    name: 'Apple Hospital',
    category: 'Hospitals',
    city: 'Indore',
    lat: 22.7001,
    lng: 75.8720,
    address: 'Near Bhawarkua Square, A.B. Road, Indore',
    icon: 'HeartPulse'
  },

  // INDORE - Public Transit & Metro
  {
    name: 'Indore Junction Railway Station',
    category: 'Transit & Metro',
    city: 'Indore',
    lat: 22.7177,
    lng: 75.8682,
    address: 'Chhoti Gwaltoli, Indore',
    icon: 'Train'
  },
  {
    name: 'Sarwate Bus Stand',
    category: 'Transit & Metro',
    city: 'Indore',
    lat: 22.7126,
    lng: 75.8661,
    address: 'Sarwate Bus Stand Rd, South Tukoganj, Indore',
    icon: 'Bus'
  },
  {
    name: 'Radisson Square Metro Station',
    category: 'Transit & Metro',
    city: 'Indore',
    lat: 22.7485,
    lng: 75.8950,
    address: 'Ring Road, Vijay Nagar, Indore',
    icon: 'TrainTrack'
  },
  {
    name: 'Bhawarkua BRTS / Bus Stop',
    category: 'Transit & Metro',
    city: 'Indore',
    lat: 22.6925,
    lng: 75.8668,
    address: 'Bhawarkua Main Square, A.B. Road, Indore',
    icon: 'Bus'
  },
  {
    name: 'Geeta Bhawan Square BRTS',
    category: 'Transit & Metro',
    city: 'Indore',
    lat: 22.7185,
    lng: 75.8815,
    address: 'A.B. Road, Geeta Bhawan, Indore',
    icon: 'Bus'
  },
  {
    name: 'Indore International Airport (IDR)',
    category: 'Transit & Metro',
    city: 'Indore',
    lat: 22.7246,
    lng: 75.8055,
    address: 'Depalpur Road, Gandhi Nagar, Indore',
    icon: 'Plane'
  },

  // INDORE - Markets & Shopping
  {
    name: 'Phoenix Citadel Mall',
    category: 'Markets & Malls',
    city: 'Indore',
    lat: 22.7938,
    lng: 75.9298,
    address: 'MR-10 Junction, Bypass Rd, Indore',
    icon: 'ShoppingBag'
  },
  {
    name: 'Treasure Island (TI) Mall',
    category: 'Markets & Malls',
    city: 'Indore',
    lat: 22.7233,
    lng: 75.8779,
    address: 'MG Road, South Tukoganj, Indore',
    icon: 'ShoppingBag'
  },
  {
    name: 'C21 Mall & Malhar Mega Mall',
    category: 'Markets & Malls',
    city: 'Indore',
    lat: 22.7490,
    lng: 75.8931,
    address: 'A.B. Road, Scheme 54, Vijay Nagar, Indore',
    icon: 'ShoppingBag'
  },
  {
    name: 'Chappan Dukan Street Food Market',
    category: 'Markets & Malls',
    city: 'Indore',
    lat: 22.7248,
    lng: 75.8841,
    address: 'New Palasia, Indore',
    icon: 'Store'
  },
  {
    name: 'Bhawarkua Student Book & Stationary Market',
    category: 'Markets & Malls',
    city: 'Indore',
    lat: 22.6935,
    lng: 75.8660,
    address: 'Bhawarkua Main Road, Indore',
    icon: 'Store'
  },

  // INDORE - Food & Cafes
  {
    name: 'Apna Sweets & Multi-cuisine (Bhawarkua)',
    category: 'Food & Cafes',
    city: 'Indore',
    lat: 22.6920,
    lng: 75.8670,
    address: 'Bhawarkua Main Cross Rd, Indore',
    icon: 'Utensils'
  },
  {
    name: 'Chai Kaapi (Vijay Nagar)',
    category: 'Food & Cafes',
    city: 'Indore',
    lat: 22.7520,
    lng: 75.8910,
    address: 'Near Scheme 54, Vijay Nagar, Indore',
    icon: 'Coffee'
  },
  {
    name: 'Mr. Beans Gourmet Coffee Lounge',
    category: 'Food & Cafes',
    city: 'Indore',
    lat: 22.7258,
    lng: 75.8860,
    address: 'Saket Nagar, Old Palasia, Indore',
    icon: 'Coffee'
  },

  // INDORE - ATMs & Banks
  {
    name: 'State Bank of India (SBI) ATM & Branch',
    category: 'ATMs & Banks',
    city: 'Indore',
    lat: 22.6930,
    lng: 75.8665,
    address: 'Bhawarkua Main Square, Indore',
    icon: 'CreditCard'
  },
  {
    name: 'HDFC Bank & 24/7 ATM',
    category: 'ATMs & Banks',
    city: 'Indore',
    lat: 22.7510,
    lng: 75.8920,
    address: 'A.B. Road, Vijay Nagar, Indore',
    icon: 'CreditCard'
  },
  {
    name: 'ICICI Bank 24hr ATM',
    category: 'ATMs & Banks',
    city: 'Indore',
    lat: 22.7180,
    lng: 75.8810,
    address: 'Geeta Bhawan Square, Indore',
    icon: 'CreditCard'
  },

  // INDORE - Parks & Recreation
  {
    name: 'Pipliyapala Regional Park',
    category: 'Parks & Recreation',
    city: 'Indore',
    lat: 22.6780,
    lng: 75.8510,
    address: 'Ring Road, Pipliyapala, Indore',
    icon: 'Trees'
  },
  {
    name: 'Meghdoot Garden',
    category: 'Parks & Recreation',
    city: 'Indore',
    lat: 22.7540,
    lng: 75.8910,
    address: 'Near Scheme 54, Vijay Nagar, Indore',
    icon: 'Trees'
  },

  // BHOPAL - Key Landmarks & Hubs
  {
    name: 'MANIT Bhopal',
    category: 'Colleges & Universities',
    city: 'Bhopal',
    lat: 23.2166,
    lng: 77.4072,
    address: 'Link Road Number 3, Near Kali Mata Mandir, Bhopal',
    icon: 'GraduationCap'
  },
  {
    name: 'AIIMS Bhopal',
    category: 'Hospitals',
    city: 'Bhopal',
    lat: 23.2064,
    lng: 77.4608,
    address: 'Saket Nagar, AIIMS Campus, Bhopal',
    icon: 'HeartPulse'
  },
  {
    name: 'Rani Kamlapati Railway Station (Habibganj)',
    category: 'Transit & Metro',
    city: 'Bhopal',
    lat: 23.2081,
    lng: 77.4379,
    address: 'Habibganj, Bhopal',
    icon: 'Train'
  },
  {
    name: 'DB City Mall',
    category: 'Markets & Malls',
    city: 'Bhopal',
    lat: 23.2332,
    lng: 77.4332,
    address: 'Hoshangabad Rd, Arera Hills, Bhopal',
    icon: 'ShoppingBag'
  },
  {
    name: 'MP Nagar Zone 2 Commercial Hub',
    category: 'Markets & Malls',
    city: 'Bhopal',
    lat: 23.2325,
    lng: 77.4340,
    address: 'Maharana Pratap Nagar Zone-II, Bhopal',
    icon: 'Store'
  },

  // KOTA - Coaching Institutes & Hubs
  {
    name: 'Allen Career Institute (Samyak / Samarth)',
    category: 'Colleges & Universities',
    city: 'Kota',
    lat: 25.1388,
    lng: 75.8450,
    address: 'Landmark City, Kunadi / Indra Vihar, Kota',
    icon: 'GraduationCap'
  },
  {
    name: 'Resonance Eduventures',
    category: 'Colleges & Universities',
    city: 'Kota',
    lat: 25.1345,
    lng: 75.8398,
    address: 'CG Tower, A-46 & 52, IPIA, Near City Mall, Jhalawar Road, Kota',
    icon: 'GraduationCap'
  },
  {
    name: 'Kota Junction Railway Station',
    category: 'Transit & Metro',
    city: 'Kota',
    lat: 25.2201,
    lng: 75.8860,
    address: 'Bhimganj Mandi, Kota',
    icon: 'Train'
  },
  {
    name: 'City Mall Kota',
    category: 'Markets & Malls',
    city: 'Kota',
    lat: 25.1432,
    lng: 75.8480,
    address: 'Jhalawar Road, Commercial Area, Kota',
    icon: 'ShoppingBag'
  },

  // PUNE - Hubs
  {
    name: 'COEP Technological University',
    category: 'Colleges & Universities',
    city: 'Pune',
    lat: 18.5283,
    lng: 73.8550,
    address: 'Wellesley Rd, Shivajinagar, Pune',
    icon: 'GraduationCap'
  },
  {
    name: 'Fergusson College',
    category: 'Colleges & Universities',
    city: 'Pune',
    lat: 18.5230,
    lng: 73.8400,
    address: 'FC Road, Shivajinagar, Pune',
    icon: 'GraduationCap'
  },
  {
    name: 'Pune Junction Railway Station',
    category: 'Transit & Metro',
    city: 'Pune',
    lat: 18.5284,
    lng: 73.8744,
    address: 'Station Rd, Agarkar Nagar, Pune',
    icon: 'Train'
  },
  {
    name: 'Phoenix Marketcity Viman Nagar',
    category: 'Markets & Malls',
    city: 'Pune',
    lat: 18.5620,
    lng: 73.9167,
    address: 'Viman Nagar, Pune',
    icon: 'ShoppingBag'
  }
];

// Verified Localities index for fast autocomplete
const POPULAR_LOCALITIES = [
  // Indore
  { name: 'Bhawarkua', city: 'Indore', lat: 22.6925, lng: 75.8668, type: 'Locality' },
  { name: 'Vijay Nagar', city: 'Indore', lat: 22.7523, lng: 75.8940, type: 'Locality' },
  { name: 'Geeta Bhawan', city: 'Indore', lat: 22.7185, lng: 75.8815, type: 'Locality' },
  { name: 'Palasia (Old & New)', city: 'Indore', lat: 22.7248, lng: 75.8841, type: 'Locality' },
  { name: 'Super Corridor', city: 'Indore', lat: 22.7750, lng: 75.8200, type: 'Area' },
  { name: 'Navlakha', city: 'Indore', lat: 22.7010, lng: 75.8750, type: 'Locality' },
  { name: 'Rau / Silicon City', city: 'Indore', lat: 22.6250, lng: 75.8200, type: 'Locality' },
  { name: 'LIG Colony', city: 'Indore', lat: 22.7350, lng: 75.8900, type: 'Locality' },
  { name: 'Rajendra Nagar', city: 'Indore', lat: 22.6750, lng: 75.8300, type: 'Locality' },
  { name: 'Sapna Sangeeta', city: 'Indore', lat: 22.7030, lng: 75.8670, type: 'Locality' },
  { name: 'Annapurna', city: 'Indore', lat: 22.6980, lng: 75.8370, type: 'Locality' },
  { name: 'Simrol', city: 'Indore', lat: 22.5204, lng: 75.9207, type: 'Area' },

  // Bhopal
  { name: 'MP Nagar', city: 'Bhopal', lat: 23.2325, lng: 77.4340, type: 'Locality' },
  { name: 'Arera Colony', city: 'Bhopal', lat: 23.2100, lng: 77.4250, type: 'Locality' },
  { name: 'Indrapuri', city: 'Bhopal', lat: 23.2500, lng: 77.4650, type: 'Locality' },
  { name: 'Kolar Road', city: 'Bhopal', lat: 23.1800, lng: 77.4200, type: 'Area' },
  { name: 'Hoshangabad Road', city: 'Bhopal', lat: 23.1900, lng: 77.4450, type: 'Area' },
  { name: 'New Market', city: 'Bhopal', lat: 23.2310, lng: 77.3990, type: 'Locality' },

  // Kota
  { name: 'Indra Vihar', city: 'Kota', lat: 25.1388, lng: 75.8450, type: 'Locality' },
  { name: 'Talwandi', city: 'Kota', lat: 25.1480, lng: 75.8400, type: 'Locality' },
  { name: 'Rajiv Gandhi Nagar', city: 'Kota', lat: 25.1320, lng: 75.8470, type: 'Locality' },
  { name: 'Landmark City (Kunadi)', city: 'Kota', lat: 25.2100, lng: 75.8250, type: 'Area' },
  { name: 'Mahaveer Nagar', city: 'Kota', lat: 25.1410, lng: 75.8420, type: 'Locality' },

  // Pune
  { name: 'Kothrud', city: 'Pune', lat: 18.5074, lng: 73.8077, type: 'Locality' },
  { name: 'Hinjewadi IT Park', city: 'Pune', lat: 18.5913, lng: 73.7389, type: 'Area' },
  { name: 'Viman Nagar', city: 'Pune', lat: 18.5620, lng: 73.9167, type: 'Locality' },
  { name: 'Shivajinagar', city: 'Pune', lat: 18.5314, lng: 73.8446, type: 'Locality' },
  { name: 'Wakad', city: 'Pune', lat: 18.5987, lng: 73.7684, type: 'Locality' },
  { name: 'Baner', city: 'Pune', lat: 18.5590, lng: 73.7868, type: 'Locality' }
];

/**
 * Get nearby places for a given latitude and longitude.
 * Accurately calculates distances to every place without fake data.
 */
function getNearbyPlacesForLocation(lat, lng, city = null, category = null, limit = 20) {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return [];
  }

  const pLat = parseFloat(lat);
  const pLng = parseFloat(lng);

  let filtered = VERIFIED_NEARBY_PLACES;

  // Filter by category if specified
  if (category && category !== 'All' && category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Calculate Haversine distance for each place
  const placesWithDist = filtered.map(p => {
    const dist = calculateDistance(pLat, pLng, p.lat, p.lng);
    // Estimated travel times
    const walkingMins = Math.round((dist / 4.5) * 60); // Average walking speed ~4.5 km/h
    const drivingMins = Math.max(2, Math.round((dist / 25) * 60)); // Average city traffic ~25 km/h

    return {
      name: p.name,
      category: p.category,
      city: p.city,
      lat: p.lat,
      lng: p.lng,
      address: p.address,
      icon: p.icon,
      distanceKm: dist,
      walkingTime: walkingMins <= 60 ? `${walkingMins} min walk` : `${(walkingMins / 60).toFixed(1)} hr walk`,
      drivingTime: drivingMins <= 60 ? `${drivingMins} min drive` : `${(drivingMins / 60).toFixed(1)} hr drive`,
      directionsUrl: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pLat}%2C${pLng}%3B${p.lat}%2C${p.lng}`
    };
  });

  // Sort by nearest first
  placesWithDist.sort((a, b) => a.distanceKm - b.distanceKm);

  return placesWithDist.slice(0, limit);
}

/**
 * Search localities and landmarks across cities
 */
function searchLocalitiesAndLandmarks(query, city = null) {
  if (!query || !query.trim()) {
    if (city && city !== 'All') {
      return POPULAR_LOCALITIES.filter(l => l.city.toLowerCase() === city.toLowerCase());
    }
    return POPULAR_LOCALITIES.slice(0, 10);
  }

  const q = query.trim().toLowerCase();
  const results = [];

  // Match localities
  for (const loc of POPULAR_LOCALITIES) {
    if (city && city !== 'All' && loc.city.toLowerCase() !== city.toLowerCase()) {
      continue;
    }
    if (loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q)) {
      results.push({
        title: loc.name,
        subtitle: `${loc.type} in ${loc.city}`,
        type: loc.type,
        city: loc.city,
        lat: loc.lat,
        lng: loc.lng
      });
    }
  }

  // Match verified places
  for (const pl of VERIFIED_NEARBY_PLACES) {
    if (city && city !== 'All' && pl.city.toLowerCase() !== city.toLowerCase()) {
      continue;
    }
    if (pl.name.toLowerCase().includes(q) || (pl.address && pl.address.toLowerCase().includes(q))) {
      results.push({
        title: pl.name,
        subtitle: `${pl.category} · ${pl.city}`,
        type: pl.category,
        city: pl.city,
        lat: pl.lat,
        lng: pl.lng
      });
    }
  }

  return results.slice(0, 15);
}

module.exports = {
  calculateDistance,
  getNearbyPlacesForLocation,
  searchLocalitiesAndLandmarks,
  POPULAR_LOCALITIES,
  VERIFIED_NEARBY_PLACES
};
