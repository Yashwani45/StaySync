import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, Navigation, Star, ShieldCheck, ArrowRight, Utensils, 
  Sparkles, Home, Locate, RefreshCw, AlertCircle, Eye, BedDouble, Search
} from 'lucide-react';
import { normalizeImageUrl } from '../utils/imageHelper';

const CITY_COORDINATES = {
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

const PropertiesMap = ({ 
  properties = [], 
  services = [],
  activeTab = 'rooms',
  selectedCity = 'All', 
  onInquire,
  onSelectStay,
  onViewDetails,
  selectedStayId,
  onSelectService,
  selectedProviderIds = [],
  searchRadius = null,
  userCoords = null,
  onUserCoordsChange = null,
  onSearchArea = null,
  loading = false
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const lastCenterRef = useRef(null);

  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [internalUserCoords, setInternalUserCoords] = useState(userCoords);

  // Sync internal user coordinates with prop
  useEffect(() => {
    if (userCoords) setInternalUserCoords(userCoords);
  }, [userCoords]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setInternalUserCoords(coords);
        if (onUserCoordsChange) {
          onUserCoordsChange({ lat: coords[0], lng: coords[1] });
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 14, { animate: true });
        }
      },
      (err) => {
        setLocatingUser(false);
        console.warn('Geolocation error:', err.message);
        alert('Could not detect your exact position. Please enable location permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    // Default center based on selected city (or Central India if All)
    const isAllCities = selectedCity === 'All' || selectedCity === 'All Cities' || !selectedCity;
    const center = internalUserCoords || (!isAllCities && CITY_COORDINATES[selectedCity]
      ? CITY_COORDINATES[selectedCity]
      : [22.7196, 75.8577]);
    const defaultZoom = internalUserCoords ? 14 : isAllCities ? 6 : 13;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(center, defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Listen to map drag/move to offer "Search This Area"
      map.on('moveend', () => {
        const curCenter = map.getCenter();
        if (lastCenterRef.current) {
          const dLat = Math.abs(curCenter.lat - lastCenterRef.current.lat);
          const dLng = Math.abs(curCenter.lng - lastCenterRef.current.lng);
          if (dLat > 0.007 || dLng > 0.007) {
            setShowSearchAreaBtn(true);
          }
        } else {
          lastCenterRef.current = curCenter;
        }
      });

      mapInstanceRef.current = map;
    } else {
      // Re-center when city changes if user hasn't explicitly moved
      if (!showSearchAreaBtn) {
        mapInstanceRef.current.setView(center, defaultZoom);
      }
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    // Add User Current Location Marker if available
    if (internalUserCoords) {
      const userIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div style="position:relative; width: 22px; height: 22px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(59, 130, 246, 0.35); animation: pulse 1.8s infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 9999px; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35); position:relative; z-index:2;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      userMarkerRef.current = L.marker(internalUserCoords, { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<div style="font-weight:700;font-size:12px;padding:4px 6px;">📍 You Are Here</div>');

      // Draw Radius Circle if active
      if (searchRadius && !isNaN(searchRadius) && searchRadius > 0) {
        radiusCircleRef.current = L.circle(internalUserCoords, {
          radius: searchRadius * 1000,
          color: '#059669',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.1
        }).addTo(map);
      }
    }

    const bounds = [];
    if (internalUserCoords) bounds.push(internalUserCoords);

    // Helper to calculate coordinates
    const getCoords = (item, index) => {
      const cityCenter = CITY_COORDINATES[item.city] || center;
      const lat = item.location?.coordinates?.[1] || item.latitude || (cityCenter[0] + (Math.sin(index * 1.618) * 0.032));
      const lng = item.location?.coordinates?.[0] || item.longitude || (cityCenter[1] + (Math.cos(index * 1.618) * 0.032));
      return [lat, lng];
    };

    const homeSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    const bedSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`;
    const utensilsSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M12 2v20"/><path d="m19 22-1.5-6"/><path d="M5 2v4a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2"/><path d="M8 2v20"/></svg>`;
    const sparklesSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    const pinSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:2px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    const navSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px;"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;

    if (activeTab === 'rooms') {
      properties.forEach((property, index) => {
        const [lat, lng] = getCoords(property, index);
        bounds.push([lat, lng]);

        const isSelected = selectedStayId === property._id;
        const pType = property.propertyType || 'Hostel';
        const iconHtml = pType === 'Hostel' ? homeSvg : pType === 'PG' ? bedSvg : homeSvg;
        const pinBg = isSelected ? '#10b981' : pType === 'Hostel' ? '#2563eb' : pType === 'PG' ? '#0d9488' : '#7c3aed';

        const customIcon = L.divIcon({
          className: 'custom-property-pin',
          html: `
            <div style="
              background: ${pinBg};
              color: #ffffff;
              font-family: inherit;
              font-size: 11px;
              font-weight: 800;
              padding: 5px 9px;
              border-radius: 9999px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.3);
              border: 2px solid ${isSelected ? '#34d399' : '#ffffff'};
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
              transform: translate(-50%, -100%);
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='translate(-50%, -110%) scale(1.08)'" onmouseout="this.style.transform='translate(-50%, -100%) scale(1)'">
              <span>${iconHtml}</span>
              <span>₹${(property.rentPerPerson || property.monthlyRent || 0).toLocaleString('en-IN')}</span>
              ${isSelected ? '<span style="background:#065f46;font-size:9px;padding:1px 4px;border-radius:999px;">✓ Active</span>' : ''}
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const osmLink = lat && lng 
          ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
          : `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${property.title}, ${property.address}, ${property.city}`)}`;
        const imageSrc = normalizeImageUrl(property.photos?.[0] || property.photo);

        const rentVal = property.rentPerPerson || property.monthlyRent || 0;
        const bedsVal = property.availableBeds !== undefined ? property.availableBeds : 1;
        const occVal = property.occupancy || (property.roomType === '1-Seater Room' ? 1 : property.roomType === '3-Seater Room' ? 3 : 2);
        const catVal = property.hostelCategory || 'Girls & Boys Hostel';
        const roomTypeVal = property.roomType || '2-Seater Room';
        const isApprox = property.isApproximate || property.isApproximateLocation;

        const popupContent = `
          <div style="font-family: inherit; width: 260px; border-radius: 14px; overflow: hidden; padding: 0;">
            <div style="position: relative; height: 120px; width: 100%; background: #e5e7eb;">
              <img src="${imageSrc}" alt="${property.title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80';" style="width: 100%; height: 100%; object-fit: cover;" />
              <span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.85); color: #fff; font-size: 9px; font-weight: bold; padding: 2px 7px; border-radius: 6px;">
                ${catVal} · ${roomTypeVal}
              </span>
              <span style="position: absolute; top: 6px; right: 6px; background: #059669; color: #fff; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 6px;">
                ★ ${(property.rating || 4.5).toFixed(1)}
              </span>
            </div>
            <div style="padding: 12px;">
              <h4 style="font-size: 13px; font-weight: 800; color: #111827; margin: 0 0 3px 0; line-height: 1.25;">${property.title}</h4>
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 5px 0; line-height: 1.3;">
                ${pinSvg}${property.address}, ${property.city}
                ${isApprox ? '<span style="font-size:9px;color:#d97706;font-weight:600;display:block;">(Approximate area shown)</span>' : ''}
              </p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 4px 6px; background: #f0fdf4; border-radius: 6px; font-size: 10px; font-weight: bold; color: #166534;">
                <span>${bedsVal} of ${occVal} Beds Available</span>
                <span>${property.foodAvailable ? 'Food Included' : 'Food Optional'}</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; padding: 6px 8px; background: #f9fafb; border-radius: 8px;">
                <span style="font-size: 14px; font-weight: 800; color: #059669;">₹${rentVal.toLocaleString('en-IN')}<span style="font-size: 9px; font-weight: normal; color: #9ca3af;"> /mo</span></span>
                ${property.distance ? `<span style="font-size: 10px; color: #2563eb; font-weight: 700;">📍 ${property.distance} km away</span>` : ''}
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <button id="popup-view-details-btn-${property._id}" style="width: 100%; background: #059669; color: #ffffff; border: none; padding: 7px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  View Stay & Nearby Places &rarr;
                </button>
                <div style="display: flex; gap: 6px;">
                  <button id="popup-select-btn-${property._id}" style="flex: 1; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; cursor: pointer;">
                    ${isSelected ? '✓ Selected' : 'Instant Hold'}
                  </button>
                  <a href="${osmLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f3f4f6; color: #374151; padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 3px; border: 1px solid #e5e7eb;">
                    ${navSvg}Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent, { maxWidth: 280, className: 'property-map-popup' });

        marker.on('popupopen', () => {
          const viewBtn = document.getElementById(`popup-view-details-btn-${property._id}`);
          if (viewBtn && onViewDetails) {
            viewBtn.onclick = () => onViewDetails(property);
          }
          const selectBtn = document.getElementById(`popup-select-btn-${property._id}`);
          if (selectBtn && onSelectStay) {
            selectBtn.onclick = () => onSelectStay(property);
          }
        });

        markersRef.current.push(marker);
      });
    } else {
      // Services (Tiffins & Cleaning)
      services.forEach((service, index) => {
        const [lat, lng] = getCoords(service, index);
        bounds.push([lat, lng]);

        const isTiffin = service.category === 'Tiffin';
        const isSelected = selectedProviderIds.includes(service._id);
        const iconSvg = isTiffin ? utensilsSvg : sparklesSvg;
        const pinBg = isSelected ? '#10b981' : isTiffin ? '#ea580c' : '#0891b2';
        const priceLabel = isTiffin 
          ? `₹${service.tiffinDetails?.monthlyPrice || 3200}/mo` 
          : `₹${service.cleaningDetails?.priceMap?.['Regular Room'] || 350}`;

        const customIcon = L.divIcon({
          className: 'custom-service-pin',
          html: `
            <div style="
              background: ${pinBg};
              color: #ffffff;
              font-family: inherit;
              font-size: 11px;
              font-weight: 800;
              padding: 5px 9px;
              border-radius: 9999px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.3);
              border: 2px solid ${isSelected ? '#34d399' : '#ffffff'};
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
              transform: translate(-50%, -100%);
              cursor: pointer;
            ">
              <span>${iconSvg}</span>
              <span>${priceLabel}</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const osmLink = lat && lng 
          ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
          : `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${service.businessName}, ${service.address}, ${service.city}`)}`;
        const imageSrc = normalizeImageUrl(service.profileImage || (isTiffin ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'));

        const popupContent = `
          <div style="font-family: inherit; width: 250px; border-radius: 14px; overflow: hidden; padding: 0;">
            <div style="position: relative; height: 115px; width: 100%; background: #e5e7eb;">
              <img src="${imageSrc}" alt="${service.businessName}" style="width: 100%; height: 100%; object-fit: cover;" />
              <span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.75); color: #fff; font-size: 9px; font-weight: bold; padding: 2px 7px; border-radius: 6px;">
                ${service.category} Partner
              </span>
              <span style="position: absolute; top: 6px; right: 6px; background: #059669; color: #fff; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 6px;">
                ★ ${(service.rating || 4.7).toFixed(1)}
              </span>
            </div>
            <div style="padding: 11px;">
              <h4 style="font-size: 13px; font-weight: 800; color: #111827; margin: 0 0 3px 0; line-height: 1.25;">${service.businessName}</h4>
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 7px 0; line-height: 1.3;">${pinSvg}${service.address || 'Central City'}, ${service.city}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; padding: 6px 8px; background: #f9fafb; border-radius: 8px;">
                <span style="font-size: 14px; font-weight: 800; color: #059669;">${priceLabel}</span>
                <span style="font-size: 10px; color: #4b5563; font-weight: 600;">Doorstep Service</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <button id="popup-service-select-btn-${service._id}" style="width: 100%; background: ${isSelected ? '#e0e7ff' : '#059669'}; color: ${isSelected ? '#3730a3' : '#ffffff'}; border: none; padding: 7px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer;">
                  ${isSelected ? '✓ Subscribed' : 'Book with Email Confirmation'}
                </button>
                <a href="${osmLink}" target="_blank" rel="noopener noreferrer" style="text-align: center; background: #f3f4f6; color: #374151; padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; text-decoration: none; border: 1px solid #e5e7eb;">
                  ${navSvg}Directions
                </a>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent, { maxWidth: 270, className: 'property-map-popup' });

        marker.on('popupopen', () => {
          const selectBtn = document.getElementById(`popup-service-select-btn-${service._id}`);
          if (selectBtn && onSelectService) {
            selectBtn.onclick = () => onSelectService(service);
          }
        });

        markersRef.current.push(marker);
      });
    }

    if (bounds.length > 1 && !internalUserCoords && !showSearchAreaBtn) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }

  }, [properties, services, activeTab, selectedCity, selectedStayId, selectedProviderIds, internalUserCoords, searchRadius]);

  const itemCount = activeTab === 'rooms' ? properties.length : services.length;
  const itemTypeLabel = activeTab === 'rooms' ? 'Hostels, PGs & Rooms' : 'Tiffin & Cleaning Services';

  const handleTriggerSearchArea = () => {
    setShowSearchAreaBtn(false);
    if (mapInstanceRef.current && onSearchArea) {
      const center = mapInstanceRef.current.getCenter();
      lastCenterRef.current = center;
      onSearchArea({ lat: center.lat, lng: center.lng });
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-50">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header Banner */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-md flex items-center gap-3 text-xs">
        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="font-extrabold text-slate-800 text-xs">
            {itemCount} {itemTypeLabel} {selectedCity && selectedCity !== 'All' ? `in ${selectedCity}` : 'Across Cities'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Interactive live map · Click pins to preview rent, vacancy &amp; navigate
          </div>
        </div>
      </div>

      {/* Search This Area Floating Button */}
      {showSearchAreaBtn && (
        <button
          onClick={handleTriggerSearchArea}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/95 hover:bg-black text-white text-xs font-extrabold px-5 py-2.5 rounded-full shadow-xl border border-slate-700/80 backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-top-2"
        >
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          <span>Search This Area</span>
        </button>
      )}

      {/* Locate Me Floating Action Button */}
      <button
        onClick={handleLocateMe}
        disabled={locatingUser}
        title="Find My Location (GPS)"
        className={`absolute bottom-6 left-4 z-10 bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
          internalUserCoords ? 'border-blue-500 text-blue-600' : ''
        }`}
      >
        <Locate className={`w-4 h-4 ${locatingUser ? 'animate-spin text-blue-600' : internalUserCoords ? 'text-blue-600' : 'text-slate-600'}`} />
        <span>{locatingUser ? 'Detecting...' : internalUserCoords ? 'Near Me Active' : 'Locate Me'}</span>
      </button>

      {/* Empty State Overlay */}
      {!loading && itemCount === 0 && (
        <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 text-base">No Properties In This Map View</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We couldn't find any listings matching your active filters in this area. Try expanding your radius or moving the map.
            </p>
            <button
              onClick={() => {
                setShowSearchAreaBtn(false);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView(CITY_COORDINATES[selectedCity] || [22.7196, 75.8577], 12);
                }
              }}
              className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer"
            >
              Reset Map View
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-sm flex items-center gap-2 text-xs text-slate-600 font-semibold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          <span>Updating Pins...</span>
        </div>
      )}
    </div>
  );
};

export default PropertiesMap;
