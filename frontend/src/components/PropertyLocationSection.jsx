import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, ExternalLink, ShieldCheck, AlertCircle, 
  GraduationCap, HeartPulse, Train, ShoppingBag, Utensils, 
  CreditCard, Trees, Compass, Clock, Car, Footprints, Layers
} from 'lucide-react';
import { propertiesAPI, locationAPI } from '../services/api';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Places', icon: Layers },
  { id: 'Colleges & Universities', label: 'Colleges', icon: GraduationCap },
  { id: 'Hospitals', label: 'Hospitals', icon: HeartPulse },
  { id: 'Transit & Metro', label: 'Transit', icon: Train },
  { id: 'Markets & Malls', label: 'Markets', icon: ShoppingBag },
  { id: 'Food & Cafes', label: 'Food', icon: Utensils },
  { id: 'ATMs & Banks', label: 'ATMs', icon: CreditCard },
  { id: 'Parks & Recreation', label: 'Parks', icon: Trees }
];

const PropertyLocationSection = ({ property }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const propertyMarkerRef = useRef(null);
  const circleRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Fallback coordinates
  const defaultLat = property.location?.coordinates?.[1] || property.latitude || 22.7196;
  const defaultLng = property.location?.coordinates?.[0] || property.longitude || 75.8577;

  // Load verified location policy and nearby places
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        // 1. Fetch location respecting privacy
        const locRes = await propertiesAPI.getPropertyLocation(property._id).catch(() => null);
        const locData = locRes?.data || {
          isExact: true,
          latitude: defaultLat,
          longitude: defaultLng,
          address: property.address,
          locality: property.locality || property.location?.locality || '',
          city: property.city,
          visibility: property.location?.visibility || 'public'
        };

        if (isMounted) setLocationDetails(locData);

        // 2. Fetch nearby places
        const placesRes = await locationAPI.getNearbyPlaces({
          lat: locData.latitude,
          lng: locData.longitude,
          city: property.city
        }).catch(() => null);

        if (isMounted) {
          setNearbyPlaces(placesRes?.data || []);
        }
      } catch (err) {
        console.error('Error fetching property location intelligence:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [property]);

  // Leaflet Map Initialization & Rendering
  useEffect(() => {
    if (!window.L || !mapContainerRef.current || !locationDetails) return;
    const L = window.L;

    const propLat = locationDetails.latitude;
    const propLng = locationDetails.longitude;

    // Initialize map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([propLat, propLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([propLat, propLng], 14);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    if (propertyMarkerRef.current) propertyMarkerRef.current.remove();
    if (circleRef.current) circleRef.current.remove();
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Property Marker
    const isApprox = locationDetails.isApproximate || locationDetails.visibility === 'approximate';
    const pinColor = isApprox ? '#d97706' : '#059669';

    const propPinIcon = L.divIcon({
      className: 'prop-detail-pin',
      html: `
        <div style="
          background: ${pinColor};
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          border: 2.5px solid #ffffff;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
          transform: translate(-50%, -100%);
        ">
          <span>🏠</span>
          <span>${property.title || 'Property'}</span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    propertyMarkerRef.current = L.marker([propLat, propLng], { icon: propPinIcon, zIndexOffset: 500 })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 6px 8px; font-family: inherit;">
          <strong style="font-size: 13px; color: #111827; display: block;">${property.title}</strong>
          <span style="font-size: 11px; color: #6b7280; display: block; margin-top: 2px;">
            ${locationDetails.address}, ${locationDetails.city}
          </span>
          ${isApprox ? '<span style="font-size:10px; color:#b45309; font-weight:700; margin-top:4px; display:block;">📍 Approximate locality zone shown</span>' : ''}
        </div>
      `);

    // Draw Approximate Circle if visibility is approximate
    if (isApprox) {
      circleRef.current = L.circle([propLat, propLng], {
        radius: 400,
        color: '#d97706',
        weight: 1.5,
        fillColor: '#f59e0b',
        fillOpacity: 0.12,
        dashArray: '4, 6'
      }).addTo(map);
    }

    // Add Markers for Nearby Places
    const filteredPlaces = activeCategory === 'All'
      ? nearbyPlaces
      : nearbyPlaces.filter(p => p.category === activeCategory);

    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlace?.name === place.name;
      const placePin = L.divIcon({
        className: 'nearby-place-pin',
        html: `
          <div style="
            background: ${isSelected ? '#1e293b' : '#3b82f6'};
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            padding: 4px 7px;
            border-radius: 9999px;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 3px;
            transform: translate(-50%, -100%);
            cursor: pointer;
            transition: transform 0.15s;
          ">
            <span>📍</span>
            <span>${place.name.slice(0, 16)}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([place.lat, place.lng], { icon: placePin }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 6px; font-family: inherit; width: 200px;">
          <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase;">${place.category}</div>
          <strong style="font-size: 12px; color: #0f172a; display: block; margin: 2px 0;">${place.name}</strong>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${place.address || ''}</div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 4px 6px; border-radius: 6px; margin-bottom: 6px;">
            <span>${place.distanceKm} km</span>
            <span>${place.walkingTime}</span>
          </div>
          <a href="${place.directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #2563eb; color: #ffffff; padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-decoration: none;">
            Get Directions ↗
          </a>
        </div>
      `);

      marker.on('click', () => setSelectedPlace(place));
      markersRef.current.push(marker);
    });

  }, [locationDetails, nearbyPlaces, activeCategory, selectedPlace]);

  // Handle clicking a nearby place from list
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([place.lat, place.lng], 15, { animate: true });
    }
  };

  const isApproximate = locationDetails?.isApproximate || locationDetails?.visibility === 'approximate' || locationDetails?.visibility === 'booked';
  const targetLat = locationDetails?.latitude || defaultLat;
  const targetLng = locationDetails?.longitude || defaultLng;
  const osmSearchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${property.title}, ${locationDetails?.address || property.address}, ${locationDetails?.city || property.city}`)}`;
  const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${targetLat}%2C${targetLng}`;

  const filteredPlaces = activeCategory === 'All'
    ? nearbyPlaces
    : nearbyPlaces.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Location Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>Location &amp; Surrounding Neighborhood</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {[locationDetails?.locality || property.location?.locality, locationDetails?.city || property.city].filter(Boolean).join(', ') || 'Prime Central Area'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={osmDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions (OSM)</span>
          </a>
          <a
            href={osmSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>OpenStreetMap</span>
          </a>
        </div>
      </div>

      {/* Privacy Alert Banner if Approximate Location */}
      {isApproximate && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-extrabold block text-amber-950">Host Privacy Enabled</strong>
            {locationDetails?.privacyNotice || 'Approximate locality zone is shown for privacy. Exact building number and host contact are revealed immediately after booking confirmation.'}
          </div>
        </div>
      )}

      {/* 2. Interactive Map Container */}
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* Map Legend Overlay */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>{property.title}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">{filteredPlaces.length} nearby points marked</span>
        </div>
      </div>

      {/* 3. Nearby Places Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Nearby Places &amp; Transit Stops</span>
          </h4>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredPlaces.length} places within 8 km
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Places List Cards */}
        {filteredPlaces.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200">
            No nearby places registered under "{activeCategory}". Select "All Places" to view general landmarks.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredPlaces.map((pl, idx) => {
              const isSelected = selectedPlace?.name === pl.name;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectPlace(pl)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                      <span>{pl.category}</span>
                    </div>
                    <strong className="block text-slate-900 font-extrabold truncate mt-0.5">
                      {pl.name}
                    </strong>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {pl.address || `${pl.city} central area`}
                    </span>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 block">
                      {pl.distanceKm} km
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold block flex items-center justify-end gap-1">
                      <Footprints className="w-3 h-3 text-slate-400" />
                      <span>{pl.walkingTime}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default PropertyLocationSection;
