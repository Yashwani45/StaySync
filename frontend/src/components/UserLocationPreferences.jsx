import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  Target,
  Sparkles,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { normalizeImageUrl } from '../utils/imageHelper';

// Popular student hubs & landmarks with exact coordinates
const POPULAR_HUBS = {
  Indore: [
    { name: 'Bhawarkua Square (Student Coaching Hub)', locality: 'Bhawarkua', lat: 22.6926, lng: 75.8676 },
    { name: 'SGSITS Engineering College', locality: 'Vallabh Nagar', lat: 22.7266, lng: 75.8753 },
    { name: 'DAVV Takshashila Campus (Khandwa Rd)', locality: 'Bhawarkua', lat: 22.6885, lng: 75.8770 },
    { name: 'Vijay Nagar Square', locality: 'Vijay Nagar', lat: 22.7533, lng: 75.8937 },
    { name: 'Geeta Bhawan Square', locality: 'Geeta Bhawan', lat: 22.7177, lng: 75.8821 },
    { name: 'Holkar Science College', locality: 'Bhawarkua', lat: 22.6975, lng: 75.8655 },
    { name: 'Super Corridor IT Park', locality: 'Super Corridor', lat: 22.7662, lng: 75.8234 }
  ],
  Bhopal: [
    { name: 'MP Nagar Zone 2 (Student & Coaching Hub)', locality: 'MP Nagar', lat: 23.2332, lng: 77.4344 },
    { name: 'MANIT Engineering Campus', locality: 'MANIT', lat: 23.2167, lng: 77.4069 },
    { name: 'AIIMS Bhopal Campus', locality: 'Saket Nagar', lat: 23.2065, lng: 77.4608 },
    { name: 'Arera Colony (10 No. Market)', locality: 'Arera Colony', lat: 23.2120, lng: 77.4367 },
    { name: 'Indrapuri (BHEL Coaching Hub)', locality: 'Indrapuri', lat: 23.2510, lng: 77.4650 }
  ],
  Kota: [
    { name: 'Talwandi Coaching Area', locality: 'Talwandi', lat: 25.1432, lng: 75.8421 },
    { name: 'Indra Vihar (Allen Sangyan Hub)', locality: 'Indra Vihar', lat: 25.1380, lng: 75.8490 },
    { name: 'Rajeev Gandhi Nagar (Allen & Resonance)', locality: 'Rajeev Gandhi Nagar', lat: 25.1320, lng: 75.8560 },
    { name: 'Landmark City (Kunhari Hub)', locality: 'Kunhari', lat: 25.2150, lng: 75.8340 }
  ],
  Pune: [
    { name: 'FC Road & Fergusson College', locality: 'Shivajinagar', lat: 18.5246, lng: 73.8415 },
    { name: 'Hinjewadi IT Park Phase 1', locality: 'Hinjewadi', lat: 18.5913, lng: 73.7389 },
    { name: 'Kothrud (MIT World Peace Univ)', locality: 'Kothrud', lat: 18.5074, lng: 73.8077 },
    { name: 'Viman Nagar (Symbiosis Hub)', locality: 'Viman Nagar', lat: 18.5679, lng: 73.9143 }
  ]
};

// Haversine formula in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function UserLocationPreferences({ properties = [], onExploreStay }) {
  // Load saved preferences from localStorage
  const [pref, setPref] = useState(() => {
    try {
      const saved = localStorage.getItem('staysync_user_location_pref');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      city: 'Indore',
      locality: 'Bhawarkua',
      landmark: 'Bhawarkua Square (Student Coaching Hub)',
      radius: 5,
      lat: 22.6926,
      lng: 75.8676
    };
  });

  const [savedNotice, setSavedNotice] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempCity, setTempCity] = useState(pref.city || 'Indore');
  const [tempLocality, setTempLocality] = useState(pref.locality || '');
  const [tempLandmark, setTempLandmark] = useState(pref.landmark || '');
  const [tempRadius, setTempRadius] = useState(pref.radius || 5);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const hubMarkerRef = useRef(null);
  const circleRef = useRef(null);

  // Available hubs for the selected city
  const cityHubs = useMemo(() => {
    return POPULAR_HUBS[tempCity] || POPULAR_HUBS.Indore;
  }, [tempCity]);

  // Handle Hub Selection
  const handleHubSelect = (hub) => {
    setTempLocality(hub.locality);
    setTempLandmark(hub.name);
  };

  // Save Preferences
  const handleSavePreferences = () => {
    const selectedHub = cityHubs.find(h => h.name === tempLandmark) || cityHubs[0];
    const newPref = {
      city: tempCity,
      locality: tempLocality || selectedHub?.locality || '',
      landmark: tempLandmark || selectedHub?.name || '',
      radius: Number(tempRadius) || 5,
      lat: selectedHub?.lat || (tempCity === 'Bhopal' ? 23.2599 : 22.7196),
      lng: selectedHub?.lng || (tempCity === 'Bhopal' ? 77.4126 : 75.8577)
    };

    setPref(newPref);
    localStorage.setItem('staysync_user_location_pref', JSON.stringify(newPref));
    setIsEditing(false);
    setSavedNotice('Preferred location hub updated! Distance calculations have been refreshed.');
    setTimeout(() => setSavedNotice(''), 3500);
  };

  // Compute distance from preferred landmark for all properties
  const propertiesWithDistance = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    return properties
      .map(p => {
        const pLat = p.location?.coordinates?.[1] || p.latitude;
        const pLng = p.location?.coordinates?.[0] || p.longitude;
        const dist = (pLat && pLng && pref.lat && pref.lng)
          ? calculateDistance(pref.lat, pref.lng, pLat, pLng)
          : null;
        return {
          ...p,
          calculatedDistance: dist,
          hasCoords: Boolean(pLat && pLng),
          lat: pLat,
          lng: pLng
        };
      })
      .sort((a, b) => {
        if (a.calculatedDistance === null) return 1;
        if (b.calculatedDistance === null) return -1;
        return a.calculatedDistance - b.calculatedDistance;
      });
  }, [properties, pref]);

  // Nearby stays within radius
  const nearbyStays = useMemo(() => {
    return propertiesWithDistance.filter(p => 
      p.calculatedDistance !== null && p.calculatedDistance <= pref.radius
    );
  }, [propertiesWithDistance, pref.radius]);

  // Render Leaflet Map using window.L
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    const centerLat = pref.lat || 22.7196;
    const centerLng = pref.lng || 75.8577;
    const zoomLevel = pref.radius <= 2 ? 14 : (pref.radius <= 5 ? 13 : 12);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([centerLat, centerLng], zoomLevel);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], zoomLevel);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    if (hubMarkerRef.current) hubMarkerRef.current.remove();
    if (circleRef.current) circleRef.current.remove();
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Hub Anchor Marker
    const hubIcon = L.divIcon({
      className: 'custom-hub-pin',
      html: `
        <div style="
          background: #4f46e5;
          color: white;
          padding: 6px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
          display: flex;
          align-items: center;
          gap: 4px;
          border: 2px solid white;
          white-space: nowrap;
        ">
          <span>🎯</span>
          <span>${pref.locality || pref.landmark || 'Anchor Hub'}</span>
        </div>
      `,
      iconSize: [140, 36],
      iconAnchor: [70, 18]
    });

    hubMarkerRef.current = L.marker([centerLat, centerLng], { icon: hubIcon }).addTo(map);
    hubMarkerRef.current.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 4px;">
        <b style="color: #4f46e5;">🎯 Your Anchor Hub</b>
        <p style="margin: 3px 0; color: #1f2937; font-weight: 600;">${pref.landmark}</p>
        <span style="font-size: 10px; color: #6b7280;">Search Radius: ${pref.radius} km</span>
      </div>
    `);

    // Radius Circle
    circleRef.current = L.circle([centerLat, centerLng], {
      radius: pref.radius * 1000,
      color: '#4f46e5',
      fillColor: '#6366f1',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '5, 8'
    }).addTo(map);

    // Stays Markers
    propertiesWithDistance.filter(p => p.hasCoords).forEach(p => {
      const isWithin = p.calculatedDistance !== null && p.calculatedDistance <= pref.radius;
      const stayIcon = L.divIcon({
        className: 'custom-stay-pin',
        html: `
          <div style="
            background: ${isWithin ? '#059669' : '#475569'};
            color: white;
            padding: 4px 8px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            box-shadow: 0 3px 10px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 3px;
            border: 2px solid white;
            white-space: nowrap;
          ">
            <span>₹${(p.rentPerPerson || p.monthlyRent || 0).toLocaleString('en-IN')}</span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
      });

      const marker = L.marker([p.lat, p.lng], { icon: stayIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px; max-width: 180px;">
          <b style="color: #111827;">${p.title}</b>
          <p style="margin: 2px 0; color: #059669; font-weight: 800;">₹${(p.rentPerPerson || p.monthlyRent || 0).toLocaleString('en-IN')}/mo</p>
          ${p.calculatedDistance !== null ? `<p style="margin: 2px 0; font-size: 10px; color: #4f46e5; font-weight: 700;">📍 ${p.calculatedDistance} km from hub</p>` : ''}
          <a href="https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pref.lat}%2C${pref.lng}%3B${p.lat}%2C${p.lng}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; color: #059669; font-weight: bold; text-decoration: underline;">Open Directions (OSM) ↗</a>
        </div>
      `);
      markersRef.current.push(marker);
    });

  }, [pref, propertiesWithDistance]);

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
          <button onClick={() => setSavedNotice('')} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">✕</button>
        </div>
      )}

      {/* 1. PREFERRED LOCATION HUB HERO CARD */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-gray-150">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/70">
                <Compass className="w-4 h-4" />
              </span>
              <h2 className="text-base font-black text-gray-900">Your College / Workplace Location Hub</h2>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                Active Anchor
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              StaySync measures exact commute distances and matches stays within your daily transit radius without requiring GPS permissions.
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Close Settings' : 'Change Hub & Radius'}</span>
          </button>
        </div>

        {/* Current Hub Metrics */}
        {!isEditing ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
            <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/70">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target City</span>
              <strong className="text-sm font-black text-gray-900 block mt-0.5">{pref.city}</strong>
              <span className="text-[10px] text-gray-400">Madhya Pradesh</span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/70">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Locality</span>
              <strong className="text-sm font-black text-gray-900 block mt-0.5">{pref.locality || 'City Center'}</strong>
              <span className="text-[10px] text-gray-400">Student zone</span>
            </div>

            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/70">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Preferred Landmark</span>
              <strong className="text-xs font-black text-indigo-950 block mt-0.5 truncate" title={pref.landmark}>
                {pref.landmark}
              </strong>
              <span className="text-[10px] text-indigo-700">Anchor point</span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/70">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Search Radius</span>
              <strong className="text-sm font-black text-emerald-950 block mt-0.5">Within {pref.radius} km</strong>
              <span className="text-[10px] text-emerald-700">{nearbyStays.length} stays matching</span>
            </div>
          </div>
        ) : (
          /* Hub Edit Form */
          <div className="pt-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Target City</label>
                <select
                  value={tempCity}
                  onChange={(e) => {
                    const c = e.target.value;
                    setTempCity(c);
                    const defaultHub = POPULAR_HUBS[c]?.[0];
                    if (defaultHub) {
                      setTempLocality(defaultHub.locality);
                      setTempLandmark(defaultHub.name);
                    }
                  }}
                  className="w-full text-xs font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Indore">Indore</option>
                  <option value="Bhopal">Bhopal</option>
                  <option value="Kota">Kota</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Select Campus / Coaching Hub</label>
                <select
                  value={tempLandmark}
                  onChange={(e) => {
                    const hub = cityHubs.find(h => h.name === e.target.value);
                    if (hub) handleHubSelect(hub);
                    else setTempLandmark(e.target.value);
                  }}
                  className="w-full text-xs font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500"
                >
                  {cityHubs.map(h => (
                    <option key={h.name} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Locality / Area</label>
                <input
                  type="text"
                  value={tempLocality}
                  onChange={(e) => setTempLocality(e.target.value)}
                  placeholder="e.g. Bhawarkua, Geeta Bhawan"
                  className="w-full text-xs font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Preferred Max Radius</label>
                <select
                  value={tempRadius}
                  onChange={(e) => setTempRadius(Number(e.target.value))}
                  className="w-full text-xs font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value={1}>Within 1 km (Walking)</option>
                  <option value={2}>Within 2 km (Cycle / Walk)</option>
                  <option value={5}>Within 5 km (Quick Auto/Transit)</option>
                  <option value={10}>Within 10 km (City-wide)</option>
                  <option value={15}>Within 15 km (Suburban)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Location Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE HUB MAP & RADIUS VISUALIZER */}
      <div className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 bg-gray-50/80 border-b border-gray-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg">
              <Target className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-extrabold text-gray-900">
              Living Radius Map from <span className="text-indigo-600">{pref.landmark}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Your Hub
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Verified Stays ({nearbyStays.length})
            </span>
            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              ⭕ {pref.radius} km Buffer
            </span>
          </div>
        </div>

        <div ref={mapContainerRef} className="h-[340px] w-full relative z-0"></div>
      </div>

      {/* 3. STAYS RANKED BY DISTANCE FROM YOUR HUB */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-150">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Verified Stays Ranked by Proximity</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Sorted nearest to your anchor point: <span className="font-bold text-gray-800">{pref.landmark}</span>
            </p>
          </div>
          <Link
            to="/marketplace?tab=rooms"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Explore All in Marketplace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {propertiesWithDistance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propertiesWithDistance.slice(0, 6).map(stay => {
              const stayLat = stay.lat;
              const stayLng = stay.lng;
              const isWithinRadius = stay.calculatedDistance !== null && stay.calculatedDistance <= pref.radius;

              return (
                <div
                  key={stay._id}
                  className="rounded-2xl border border-gray-200/80 p-3.5 hover:shadow-md transition-all bg-white flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Stay Image & Badge */}
                    <div className="relative h-32 rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                      <img
                        src={normalizeImageUrl(stay.photos?.[0])}
                        alt={stay.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      {stay.calculatedDistance !== null && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black shadow-xs ${
                          isWithinRadius
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800/80 text-white'
                        }`}>
                          📍 {stay.calculatedDistance} km away
                        </span>
                      )}
                      <span className="absolute top-2 right-2 bg-white/90 text-gray-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {stay.hostelCategory || 'Hostel'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-gray-900 truncate" title={stay.title}>
                      {stay.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{stay.location?.locality || stay.locality || stay.city}</span>
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Monthly Rent</span>
                        <span className="text-sm font-black text-gray-900">
                          ₹{(stay.rentPerPerson || stay.monthlyRent || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                        {stay.roomType || 'Shared Room'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {stayLat && stayLng && (
                      <a
                        href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pref.lat}%2C${pref.lng}%3B${stayLat}%2C${stayLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-center font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1"
                        title="Open Directions in OpenStreetMap"
                      >
                        <Navigation className="w-3 h-3 text-indigo-600" />
                        <span>Directions</span>
                      </a>
                    )}
                    <Link
                      to={`/marketplace?tab=rooms&search=${encodeURIComponent(stay.title)}`}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 space-y-2">
            <MapPin className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-xs font-bold text-gray-600">No stays currently listed in {pref.city}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
