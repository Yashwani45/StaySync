/**
 * Geoapify & OpenStreetMap Geocoding and Autocomplete Service
 * Provides address autocomplete, reverse geocoding, and coordinates resolution
 * with full fallback to OpenStreetMap Nominatim and local student hub data.
 */

const { POPULAR_LOCALITIES } = require('./locationService');

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || 'c67926715f404ca9828236d9d1be6bb5';

/**
 * Autocomplete address or locality using Geoapify with OpenStreetMap fallback
 * @param {string} text - Search text
 * @param {Object} options - { city, lat, lon, limit }
 * @returns {Promise<Array>} - Normalized suggestions
 */
async function autocomplete(text, options = {}) {
  if (!text || !text.trim() || text.trim().length < 2) {
    return [];
  }

  const query = text.trim();
  const limit = options.limit || 8;
  const city = options.city;

  // 1. Try Geoapify Autocomplete API
  if (GEOAPIFY_API_KEY) {
    try {
      let geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&filter=countrycode:in&limit=${limit}`;
      
      if (options.lat && options.lon) {
        geoapifyUrl += `&bias=proximity:${options.lon},${options.lat}`;
      }

      const res = await fetch(geoapifyUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          return data.features.map(f => {
            const p = f.properties || {};
            return {
              formatted: p.formatted || `${p.name || ''}, ${p.city || ''}, ${p.state || ''}`.replace(/^, |, $/g, ''),
              name: p.name || p.address_line1 || query,
              address: p.address_line1 || p.street || p.name || '',
              locality: p.suburb || p.district || p.neighbourhood || p.city || '',
              city: p.city || p.county || city || '',
              state: p.state || 'Madhya Pradesh',
              pincode: p.postcode || '',
              lat: p.lat,
              lng: p.lon,
              source: 'geoapify'
            };
          });
        }
      }
    } catch (err) {
      console.warn('Geoapify autocomplete error, falling back to OpenStreetMap:', err.message);
    }
  }

  // 2. OpenStreetMap Nominatim Fallback
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + (city ? ` ${city}` : ''))}&format=json&addressdetails=1&countrycodes=in&limit=${limit}`;
    const osmRes = await fetch(osmUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'StaySync-Property-Marketplace/1.0 (contact@staysync.in)'
      },
      signal: AbortSignal.timeout(3000)
    });

    if (osmRes.ok) {
      const osmData = await osmRes.json();
      if (Array.isArray(osmData) && osmData.length > 0) {
        return osmData.map(item => {
          const addr = item.address || {};
          return {
            formatted: item.display_name,
            name: addr.road || addr.suburb || item.name || query,
            address: [addr.house_number, addr.road].filter(Boolean).join(' ') || item.name,
            locality: addr.suburb || addr.neighbourhood || addr.city_district || addr.city || '',
            city: addr.city || addr.town || addr.county || city || '',
            state: addr.state || 'Madhya Pradesh',
            pincode: addr.postcode || '',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            source: 'openstreetmap'
          };
        });
      }
    }
  } catch (err) {
    console.warn('OSM Nominatim error, falling back to local database:', err.message);
  }

  // 3. Fallback to Local Verified Database
  const lowerQuery = query.toLowerCase();
  const matched = POPULAR_LOCALITIES.filter(l => 
    l.name.toLowerCase().includes(lowerQuery) || 
    (l.city && l.city.toLowerCase().includes(lowerQuery)) ||
    (l.type && l.type.toLowerCase().includes(lowerQuery))
  );

  return matched.slice(0, limit).map(m => ({
    formatted: `${m.name}, ${m.city}`,
    name: m.name,
    address: m.name,
    locality: m.name,
    city: m.city,
    state: 'Madhya Pradesh',
    pincode: '',
    lat: m.lat,
    lng: m.lng,
    source: 'local'
  }));
}

/**
 * Reverse geocode latitude and longitude to get full address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Address components
 */
async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;

  // 1. Try Geoapify Reverse Geocoding
  if (GEOAPIFY_API_KEY) {
    try {
      const geoapifyUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`;
      const res = await fetch(geoapifyUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const p = data.features[0].properties || {};
          return {
            formattedAddress: p.formatted || '',
            address: p.address_line1 || p.name || '',
            locality: p.suburb || p.district || p.neighbourhood || p.city || '',
            area: p.suburb || '',
            city: p.city || p.county || '',
            state: p.state || 'Madhya Pradesh',
            pincode: p.postcode || '',
            lat: p.lat || lat,
            lng: p.lon || lng,
            source: 'geoapify'
          };
        }
      }
    } catch (err) {
      console.warn('Geoapify reverse geocoding error:', err.message);
    }
  }

  // 2. OpenStreetMap Nominatim Reverse
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'StaySync-Property-Marketplace/1.0 (contact@staysync.in)'
      },
      signal: AbortSignal.timeout(3000)
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      return {
        formattedAddress: data.display_name || '',
        address: [addr.house_number, addr.road].filter(Boolean).join(' ') || data.name || '',
        locality: addr.suburb || addr.neighbourhood || addr.city_district || addr.city || '',
        area: addr.suburb || '',
        city: addr.city || addr.town || addr.county || '',
        state: addr.state || 'Madhya Pradesh',
        pincode: addr.postcode || '',
        lat: parseFloat(data.lat) || lat,
        lng: parseFloat(data.lon) || lng,
        source: 'openstreetmap'
      };
    }
  } catch (err) {
    console.warn('OSM reverse geocoding error:', err.message);
  }

  // 3. Fallback coordinates representation
  return {
    formattedAddress: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    address: `Near coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    locality: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    lat,
    lng,
    source: 'fallback'
  };
}

module.exports = {
  autocomplete,
  reverseGeocode,
  GEOAPIFY_API_KEY
};
