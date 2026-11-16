import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Star, ShieldCheck, ArrowRight, Utensils, Sparkles, Home } from 'lucide-react';
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
  selectedStayId,
  onSelectService,
  selectedProviderIds = []
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    const L = window.L;

    // Default center based on selected city (or Central India if All)
    const isAllCities = selectedCity === 'All' || selectedCity === 'All Cities' || !selectedCity;
    const center = !isAllCities && CITY_COORDINATES[selectedCity]
      ? CITY_COORDINATES[selectedCity]
      : [21.1458, 79.0882];
    const defaultZoom = isAllCities ? 5 : 13;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(center, defaultZoom);

      // Clean, modern map tiles (CartoDB Positron / OSM)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, defaultZoom);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = [];

    // Helper to calculate jittered coordinates if exact lat/lng is missing
    const getCoords = (item, index) => {
      const cityCenter = CITY_COORDINATES[item.city] || center;
      const lat = item.latitude || (cityCenter[0] + (Math.sin(index * 1.618) * 0.032));
      const lng = item.longitude || (cityCenter[1] + (Math.cos(index * 1.618) * 0.032));
      return [lat, lng];
    };

    const homeSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    const bedSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`;
    const utensilsSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M12 2v20"/><path d="m19 22-1.5-6"/><path d="M5 2v4a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2"/><path d="M8 2v20"/></svg>`;
    const sparklesSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    const pinSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:2px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    const navSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px;"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;

    if (activeTab === 'rooms') {
      // Add pins for properties (Hostels, PGs, Rooms)
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
              <span>₹${(property.monthlyRent || 0).toLocaleString('en-IN')}</span>
              ${isSelected ? '<span style="background:#065f46;font-size:9px;padding:1px 4px;border-radius:999px;">✓ Active</span>' : ''}
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.title}, ${property.address}, ${property.city}`)}`;
        const imageSrc = normalizeImageUrl(property.photos?.[0]);

        const rentVal = property.rentPerPerson || property.monthlyRent || 0;
        const bedsVal = property.availableBeds !== undefined ? property.availableBeds : 1;
        const occVal = property.occupancy || (property.roomType === '1-Seater Room' ? 1 : property.roomType === '3-Seater Room' ? 3 : 2);
        const catVal = property.hostelCategory || 'Girls & Boys Hostel';
        const roomTypeVal = property.roomType || '2-Seater Room';

        const popupContent = `
          <div style="font-family: inherit; width: 255px; border-radius: 14px; overflow: hidden; padding: 0;">
            <div style="position: relative; height: 115px; width: 100%; background: #e5e7eb;">
              <img src="${imageSrc}" alt="${property.title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80';" style="width: 100%; height: 100%; object-fit: cover;" />
              <span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.85); color: #fff; font-size: 9px; font-weight: bold; padding: 2px 7px; border-radius: 6px;">
                ${catVal} · ${roomTypeVal}
              </span>
              <span style="position: absolute; top: 6px; right: 6px; background: #059669; color: #fff; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 6px;">
                ★ ${(property.rating || 4.5).toFixed(1)}
              </span>
            </div>
            <div style="padding: 11px;">
              <h4 style="font-size: 13px; font-weight: 800; color: #111827; margin: 0 0 3px 0; line-height: 1.25;">${property.title}</h4>
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 5px 0; line-height: 1.3;">${pinSvg}${property.address}, ${property.city}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 4px 6px; background: #f0fdf4; border-radius: 6px; font-size: 10px; font-weight: bold; color: #166534;">
                <span>${bedsVal} of ${occVal} Beds Available</span>
                <span>${property.foodAvailable ? 'Food Included' : 'Food Optional'}</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; padding: 6px 8px; background: #f9fafb; border-radius: 8px;">
                <span style="font-size: 14px; font-weight: 800; color: #059669;">₹${rentVal.toLocaleString('en-IN')}<span style="font-size: 9px; font-weight: normal; color: #9ca3af;"> /person/mo</span></span>
                <span style="font-size: 10px; color: #4b5563; font-weight: 600;">Dep: ₹${(property.securityDeposit || rentVal).toLocaleString('en-IN')}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <button id="popup-select-btn-${property._id}" style="width: 100%; background: ${isSelected ? '#e0e7ff' : '#059669'}; color: ${isSelected ? '#3730a3' : '#ffffff'}; border: none; padding: 7px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  ${isSelected ? '✓ Current Active Stay' : 'Book & Confirm (Email)'}
                </button>
                <div style="display: flex; gap: 6px;">
                  <a href="${gmapsLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f3f4f6; color: #374151; padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 3px; border: 1px solid #e5e7eb;">
                    ${navSvg}Directions
                  </a>
                  <button id="popup-inquire-btn-${property._id}" style="flex: 1; background: #1f2937; color: #ffffff; border: none; padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; cursor: pointer;">
                    Inquire
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent, { maxWidth: 270, className: 'property-map-popup' });

        marker.on('popupopen', () => {
          const selectBtn = document.getElementById(`popup-select-btn-${property._id}`);
          if (selectBtn && onSelectStay) {
            selectBtn.onclick = () => onSelectStay(property);
          }
          const inqBtn = document.getElementById(`popup-inquire-btn-${property._id}`);
          if (inqBtn && onInquire) {
            inqBtn.onclick = () => onInquire(property);
          }
        });

        markersRef.current.push(marker);
      });
    } else if (activeTab === 'services' || activeTab === 'tiffin' || activeTab === 'cleaning') {
      // Add pins for services (Tiffins & Cleaning)
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
              transition: transform 0.2s;
            " onmouseover="this.style.transform='translate(-50%, -110%) scale(1.08)'" onmouseout="this.style.transform='translate(-50%, -100%) scale(1)'">
              <span>${iconSvg}</span>
              <span>${priceLabel}</span>
              ${isSelected ? '<span style="background:#065f46;font-size:9px;padding:1px 4px;border-radius:999px;">✓ Active</span>' : ''}
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${service.businessName}, ${service.address}, ${service.city}`)}`;
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
                <span style="font-size: 10px; color: #4b5563; font-weight: 600;">Doorstep Delivery</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <button id="popup-service-select-btn-${service._id}" style="width: 100%; background: ${isSelected ? '#e0e7ff' : '#059669'}; color: ${isSelected ? '#3730a3' : '#ffffff'}; border: none; padding: 7px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  ${isSelected ? '✓ Subscribed' : 'Book & Confirm (Email)'}
                </button>
                <div style="display: flex; gap: 6px;">
                  <a href="${gmapsLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f3f4f6; color: #374151; padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 3px; border: 1px solid #e5e7eb;">
                    ${navSvg}Directions
                  </a>
                  <button id="popup-service-inquire-btn-${service._id}" style="flex: 1; background: #1f2937; color: #ffffff; border: none; padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 700; cursor: pointer;">
                    Inquire
                  </button>
                </div>
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
          const inqBtn = document.getElementById(`popup-service-inquire-btn-${service._id}`);
          if (inqBtn && onInquire) {
            inqBtn.onclick = () => onInquire(service);
          }
        });

        markersRef.current.push(marker);
      });
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

  }, [properties, services, activeTab, selectedCity, selectedStayId, selectedProviderIds]);

  const itemCount = activeTab === 'rooms' ? properties.length : services.length;
  const itemTypeLabel = activeTab === 'rooms' ? 'Hostels, PGs & Rooms' : 'Tiffin & Cleaning Services';

  return (
    <div className="relative w-full h-[560px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Top Map Info Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm flex items-center gap-2 text-xs">
        <MapPin className="w-4 h-4 text-green-600" />
        <span className="font-bold text-gray-800">{itemCount} {itemTypeLabel} in {selectedCity}</span>
        <span className="text-gray-300">|</span>
        <span className="text-[10px] text-gray-500 font-medium">Click pins to view details, book with email confirmation & get Google Maps directions</span>
      </div>
    </div>
  );
};

export default PropertiesMap;