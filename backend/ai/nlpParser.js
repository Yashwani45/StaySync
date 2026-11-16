/**
 * NLP Query Parser for Hinglish and English requests
 * Converts natural queries like "Indore me 8000 me AC room with food"
 * into a structured MongoDB/Mongoose query filter object.
 */
const parseNaturalQuery = (queryText) => {
  if (!queryText) return {};

  const query = queryText.toLowerCase();
  const filters = {};

  // 1. Extract Known Cities
  const cities = ['indore', 'bhopal', 'bangalore', 'bengaluru', 'pune', 'mumbai', 'delhi', 'hyderabad', 'jaipur', 'noida', 'gurgaon', 'ahmedabad'];
  for (const c of cities) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(query)) {
      filters.city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // 2. Extract Budget (e.g., 8k, 8000, 8000 me, under 12k, 12000 under)
  const kBudgetMatch = query.match(/(?:under|below|budget|max|₹|rs\.?)\s*(\d+(?:\.\d+)?)\s*k\b/i) || 
                       query.match(/\b(\d+(?:\.\d+)?)\s*k\s*(?:under|below|budget|ke\s+under|tak|me)?/i);
  
  if (kBudgetMatch) {
    filters.budget = parseFloat(kBudgetMatch[1]) * 1000;
  } else {
    const rawBudgetMatch = query.match(/(?:under|below|budget|max|₹|rs\.?)\s*(\d{4,5})\b/i) ||
                           query.match(/\b(\d{4,5})\s*(?:under|below|budget|ke\s+under|tak|me)?/i);
    if (rawBudgetMatch) {
      filters.budget = parseInt(rawBudgetMatch[1]);
    }
  }

  // 3. Extract Property Type (Hostel, PG, Flat, Room)
  if (/\b(?:hostel|hostels|chatrawas)\b/i.test(query)) {
    filters.propertyType = 'Hostel';
  } else if (/\b(?:pg|paying\s+guest)\b/i.test(query)) {
    filters.propertyType = 'PG';
  } else if (/\b(?:flat|flats|apartment|apartments|1bhk|2bhk|3bhk|bhk)\b/i.test(query)) {
    filters.propertyType = 'Flat';
  } else if (/\b(?:private\s+room|independent\s+room)\b/i.test(query)) {
    filters.propertyType = 'Room';
  }

  // 4. Extract Radius / Distance
  const radiusMatch = query.match(/\b(\d+(?:\.\d+)?)\s*(?:km|kilometer|k\.m\.|mile|km\s+ke\s+andar)\b/i);
  if (radiusMatch) {
    filters.radius = parseFloat(radiusMatch[1]);
  }

  // 5. Extract Room Type (1-Seater Room, 2-Seater Room, 3-Seater Room)
  if (/\b(?:3[\s-]?seater|triple[\s-]?seater|triple[\s-]?sharing|3[\s-]?sharing|three[\s-]?seater|teen[\s-]log|3[\s-]?bed)\b/i.test(query)) {
    filters.roomType = '3-Seater Room';
  } else if (/\b(?:2[\s-]?seater|double[\s-]?seater|double[\s-]?sharing|2[\s-]?sharing|two[\s-]?seater|do[\s-]log|2[\s-]?bed|shared|sharing)\b/i.test(query)) {
    filters.roomType = '2-Seater Room';
  } else if (/\b(?:1[\s-]?seater|single[\s-]?seater|single[\s-]?bed|1[\s-]?bed|single|akela|personal|private)\b/i.test(query)) {
    filters.roomType = '1-Seater Room';
  }

  // 6. Extract Food Availability / Requirement
  if (/\b(?:food|khana|tiffin|meals|mess|breakfast|dinner|lunch|with\s+food)\b/i.test(query)) {
    filters.foodAvailable = true;
  }

  // 7. Extract Cleanliness Requirement
  if (/\b(?:clean|saaf|saf|hygien|swachh)\b/i.test(query)) {
    filters.cleanliness = 'High';
  }

  // 8. Extract AC / Non-AC Requirement
  if (/\b(?:non[\s-]?ac|without\s+ac|ac\s+ke\s+bina)\b/i.test(query)) {
    filters.ac = 'Non-AC';
  } else if (/\b(?:ac|a\/c|air\s*condition(?:er|ing)?)\b/i.test(query)) {
    filters.ac = 'AC';
  }

  // 9. Extract Hostel Category (Girls Hostel, Boys Hostel, Girls & Boys Hostel)
  if (/\b(?:co[\s-]?ed|both|mixed|girls?\s*(?:&|and)\s*boys?|boys?\s*(?:&|and)\s*girls?)\b/i.test(query)) {
    filters.hostelCategory = 'Girls & Boys Hostel';
  } else if (/\b(?:girls?|female|ladki(?:yo)?|women|ladies)\b/i.test(query)) {
    filters.hostelCategory = 'Girls Hostel';
    filters.gender = 'Female';
  } else if (/\b(?:boys?|male|ladk(?:a|e|o)|men|gents?)\b/i.test(query)) {
    filters.hostelCategory = 'Boys Hostel';
    filters.gender = 'Male';
  }

  // 10. Extract Location / Landmark Keywords
  const landmarks = ['vijay nagar', 'geeta bhawan', 'sgsits', 'iit', 'bhawarkua', 'palasia', 'chappan', 'navlakha', 'vallabh nagar', 'simrol', 'whitefield', 'koramangala', 'indiranagar', 'hina pg', 'greenfield'];
  for (const lmk of landmarks) {
    if (query.includes(lmk)) {
      filters.location = lmk;
      break;
    }
  }

  if (!filters.location) {
    const nearMatch = query.match(/\b(?:near|close\s+to)\s+([a-z0-9\s]+?)(?:\s+(?:ke\s+andar|under|budget|room|pg|flat|chahiye|me|\d+)|$)/i) ||
                      query.match(/\b([a-z0-9\s]+?)\s+ke\s+(?:paas|pas|near)\b/i);
    if (nearMatch) {
      const loc = nearMatch[1].trim();
      const noiseWords = ['room', 'pg', 'flat', 'apartment', 'house', 'stay', 'shared', 'single', 'clean', 'ac', 'food', 'rent', 'budget', 'me', 'ke', 'ka', 'ki', 'with', 'under'];
      const filteredWords = loc.split(/\s+/).filter(w => !noiseWords.includes(w) && !cities.includes(w));
      if (filteredWords.length > 0) {
        filters.location = filteredWords.join(' ');
      }
    }
  }

  return filters;
};

module.exports = { parseNaturalQuery };
