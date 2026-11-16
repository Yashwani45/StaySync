/**
 * Normalizes user-pasted image URLs (especially Unsplash webpage links)
 * to high-performance direct image URLs with fallback handling.
 */
export const normalizeImageUrl = (url) => {
  const fallback = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80';

  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Convert Unsplash photo webpage URLs (e.g. https://unsplash.com/photos/G_y5j9L7Q6c or https://unsplash.com/photos/room-G_y5j9L7Q6c)
  // to direct CDN image URLs
  if (trimmed.includes('unsplash.com/photos/')) {
    const parts = trimmed.split('unsplash.com/photos/')[1]?.split('?')[0]?.split('/');
    if (parts && parts[0]) {
      const slugOrId = parts[0];
      const photoId = slugOrId.includes('-') ? slugOrId.split('-').pop() : slugOrId;
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&q=80`;
    }
  }

  // If it's already an images.unsplash.com URL
  if (trimmed.includes('images.unsplash.com')) {
    if (!trimmed.includes('?')) {
      return `${trimmed}?auto=format&fit=crop&w=600&q=80`;
    }
    return trimmed;
  }

  return trimmed;
};

export const DEFAULT_HOSTEL_PHOTOS = [
  {
    name: '🏢 Modern PG',
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: '🛏️ Shared Hostel Room',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: '🛋️ Furnished Flat',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: '✨ Premium Studio',
    url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80'
  }
];

export const DEFAULT_CLEANING_PHOTOS = [
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80', // Sparkling Bathroom & Tiles
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80', // Deep Window & Room Cleaning
  'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80', // Doorstep Laundry & Linens
  'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80', // Housekeeping & Floor Vacuum
  'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80'  // Washing Machines & Pressing
];

export const DEFAULT_TIFFIN_PHOTOS = [
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80', // Homestyle Thali
  'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80', // Royal Feast
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80', // Fresh Tiffin Bowl
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80', // Clean Kitchen
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80'  // Indori Breakfast
];

/**
 * Ensures distinct, diverse imagery for service provider branches & listings
 * preventing duplicate identical fallback photos across multiple branches.
 */
export const getDiverseServicePhoto = (item, index = 0) => {
  const cat = (item?.category || item?.propertyType || '').toLowerCase();
  const isCleaning = cat.includes('clean') || cat.includes('laundry') || cat.includes('housekeep');
  const isTiffin = cat.includes('tiffin') || cat.includes('food') || cat.includes('meal');

  const pool = isCleaning 
    ? DEFAULT_CLEANING_PHOTOS 
    : isTiffin 
    ? DEFAULT_TIFFIN_PHOTOS 
    : DEFAULT_HOSTEL_PHOTOS.map(p => p.url);

  // If item has a custom uploaded photo
  const existingPhoto = item?.photos?.[0] || item?.photoUrl;
  if (existingPhoto && typeof existingPhoto === 'string' && existingPhoto.trim()) {
    // If user uploaded a unique photo (e.g. data:image, blob:, or custom link)
    if (existingPhoto.startsWith('data:') || existingPhoto.startsWith('blob:') || !existingPhoto.includes('unsplash.com/photo-1581578731548')) {
      return normalizeImageUrl(existingPhoto);
    }
  }

  // Pick deterministic unique photo from pool based on index and item ID
  let salt = typeof index === 'number' ? index : 0;
  if (item?._id || item?.id) {
    const idStr = (item._id || item.id).toString();
    salt = (salt + idStr.charCodeAt(idStr.length - 1)) % pool.length;
  }
  return pool[salt % pool.length];
};
