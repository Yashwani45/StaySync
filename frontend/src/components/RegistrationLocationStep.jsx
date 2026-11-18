import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Locate,
  Check,
  Compass,
  Building,
  GraduationCap,
  Briefcase,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { locationAPI } from '../services/api';

const CITY_COORDINATES = {
  Indore: [22.7196, 75.8577],
  Bhopal: [23.2599, 77.4126],
  Kota: [25.2138, 75.8648],
  Pune: [18.5204, 73.8567],
  Bangalore: [12.9716, 77.5946],
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.6139, 77.2090],
  Jaipur: [26.9124, 75.7873],
  Ujjain: [23.1765, 75.7885]
};

const DESTINATION_TYPES = [
  { id: 'College / University', label: 'College / University', icon: GraduationCap },
  { id: 'Coaching Institute', label: 'Coaching Hub', icon: BookOpen },
  { id: 'Workplace', label: 'Workplace / Office', icon: Briefcase },
  { id: 'Specific Locality', label: 'Specific Locality', icon: Building },
  { id: 'Other', label: 'Other', icon: MapPin }
];

export default function RegistrationLocationStep({
  accountType = 'USER',
  initialCity = 'Indore',
  onBack,
  onComplete,
  loading = false
}) {
  const isUser = accountType === 'USER';
  const defaultCenter = CITY_COORDINATES[initialCity] || [22.7196, 75.8577];

  // User Current / Preferred Location State
  const [currentLat, setCurrentLat] = useState(defaultCenter[0]);
  const [currentLng, setCurrentLng] = useState(defaultCenter[1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState({
    city: initialCity,
    locality: '',
    area: '',
    state: '',
    pincode: '',
    address: ''
  });
  const [locationSource, setLocationSource] = useState('search');

  // User Destination Preference State (Students / Residents)
  const [destinationType, setDestinationType] = useState('College / University');
  const [destinationName, setDestinationName] = useState('');
  const [destinationLat, setDestinationLat] = useState(defaultCenter[0]);
  const [destinationLng, setDestinationLng] = useState(defaultCenter[1]);
  const [destinationRadius, setDestinationRadius] = useState(5); // 1, 2, 5, 10 km
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [destSearching, setDestSearching] = useState(false);

  // Provider Property Option
  const [addPropertyLater, setAddPropertyLater] = useState(false);

  // Active Tab for User: 'search' | 'destination'
  const [activeStepTab, setActiveStepTab] = useState('location');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const destMarkerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const destSearchTimeoutRef = useRef(null);

  // Reverse Geocode helper
  const handleReverseGeocode = async (lat, lng, isDest = false) => {
    try {
      const res = await locationAPI.reverseGeocode({ lat, lng });
      if (res && res.data) {
        const d = res.data;
        if (!isDest) {
          setDetectedAddress(d.formattedAddress || d.address || '');
          setAddressDetails({
            city: d.city || initialCity,
            locality: d.locality || '',
            area: d.area || '',
            state: d.state || '',
            pincode: d.pincode || '',
            address: d.address || ''
          });
        }
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err.message);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([currentLat, currentLng], 13);

      // OpenStreetMap standard tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; Geoapify'
      }).addTo(map);

      // Custom Location Marker Icon
      const pinIcon = L.divIcon({
        className: 'reg-location-pin',
        html: `
          <div style="
            background: #059669;
            color: #ffffff;
            width: 34px;
            height: 34px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            font-size: 15px;
            cursor: grab;
            transform: translate(-50%, -100%);
          ">
            ${isUser ? '📍' : '🏢'}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const marker = L.marker([currentLat, currentLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      // Marker drag event
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        const rLat = parseFloat(lat.toFixed(6));
        const rLng = parseFloat(lng.toFixed(6));
        setCurrentLat(rLat);
        setCurrentLng(rLng);
        setLocationSource('map');
        handleReverseGeocode(rLat, rLng, false);
      });

      // Map click event
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const rLat = parseFloat(lat.toFixed(6));
        const rLng = parseFloat(lng.toFixed(6));
        marker.setLatLng([rLat, rLng]);
        setCurrentLat(rLat);
        setCurrentLng(rLng);
        setLocationSource('map');
        handleReverseGeocode(rLat, rLng, false);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Trigger initial reverse geocode
      handleReverseGeocode(currentLat, currentLng, false);
    }
  }, []);

  // Update Map Marker and View
  const updateMapPosition = (lat, lng, zoom = 14) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
    }
  };

  // Render / Update Destination Radius Circle for User
  useEffect(() => {
    if (!window.L || !mapInstanceRef.current || !isUser) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    if (activeStepTab === 'destination' && destinationLat && destinationLng) {
      // Draw Destination Pin
      const destIcon = L.divIcon({
        className: 'reg-dest-pin',
        html: `
          <div style="
            background: #4f46e5;
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(79,70,229,0.45);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span>🎯</span>
            <span>${destinationName || 'Target Campus / Hub'}</span>
          </div>
        `,
        iconSize: [120, 28],
        iconAnchor: [60, 14]
      });

      destMarkerRef.current = L.marker([destinationLat, destinationLng], {
        icon: destIcon
      }).addTo(map);

      // Draw Radius Buffer Ring
      radiusCircleRef.current = L.circle([destinationLat, destinationLng], {
        radius: destinationRadius * 1000,
        color: '#4f46e5',
        fillColor: '#6366f1',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '5, 8'
      }).addTo(map);

      map.setView([destinationLat, destinationLng], destinationRadius <= 2 ? 14 : 13, { animate: true });
    }
  }, [activeStepTab, destinationLat, destinationLng, destinationRadius, destinationName, isUser]);

  // GPS Current Location Detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        updateMapPosition(lat, lng, 15);
        setLocationSource('gps');
        handleReverseGeocode(lat, lng, false);
      },
      (err) => {
        setLocatingGps(false);
        alert('Could not detect your exact GPS position. You can search your address or click directly on the map.');
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // Address search query with Geoapify autocomplete debounce
  const handleQueryChange = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await locationAPI.autocomplete({
          text: val.trim(),
          city: addressDetails.city || initialCity,
          lat: currentLat,
          lon: currentLng
        });
        setSuggestions(res.data || []);
      } catch (err) {
        console.warn('Autocomplete error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  // Select Address Suggestion
  const handleSelectSuggestion = (item) => {
    const lat = item.lat || currentLat;
    const lng = item.lng || currentLng;
    updateMapPosition(lat, lng, 15);
    setLocationSource('search');
    setSearchQuery(item.name || item.formatted);
    setDetectedAddress(item.formatted);
    setAddressDetails({
      city: item.city || initialCity,
      locality: item.locality || '',
      area: item.locality || '',
      state: item.state || '',
      pincode: item.pincode || '',
      address: item.address || item.name || ''
    });
    setSuggestions([]);
  };

  // Destination search query with Geoapify autocomplete debounce
  const handleDestQueryChange = (val) => {
    setDestinationName(val);
    if (destSearchTimeoutRef.current) clearTimeout(destSearchTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }

    setDestSearching(true);
    destSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await locationAPI.autocomplete({
          text: val.trim(),
          city: addressDetails.city || initialCity
        });
        setDestSuggestions(res.data || []);
      } catch (err) {
        console.warn('Destination search error:', err);
      } finally {
        setDestSearching(false);
      }
    }, 300);
  };

  const handleSelectDestSuggestion = (item) => {
    setDestinationName(item.name || item.formatted);
    setDestinationLat(item.lat);
    setDestinationLng(item.lng);
    setDestSuggestions([]);
  };

  // Final Submit Handler
  const handleFinalSubmit = () => {
    // GeoJSON Point format: [longitude, latitude]
    const primaryCoordinates = [currentLng, currentLat];

    const locationPayload = {
      type: 'Point',
      coordinates: primaryCoordinates,
      latitude: currentLat,
      longitude: currentLng,
      address: addressDetails.address || detectedAddress,
      city: addressDetails.city || initialCity,
      state: addressDetails.state || '',
      locality: addressDetails.locality || '',
      area: addressDetails.area || '',
      pincode: addressDetails.pincode || '',
      formattedAddress: detectedAddress || `${addressDetails.address || ''}, ${addressDetails.city || initialCity}`.trim(),
      source: locationSource,
      verified: false
    };

    let destinationPayload = undefined;
    if (isUser) {
      destinationPayload = {
        type: 'Point',
        coordinates: [destinationLng, destinationLat],
        destinationType,
        destinationName: destinationName || `${destinationType} near ${addressDetails.city || initialCity}`,
        city: addressDetails.city || initialCity,
        locality: addressDetails.locality || '',
        formattedAddress: destinationName ? `${destinationName}, ${addressDetails.city || initialCity}` : '',
        preferredRadius: Number(destinationRadius) || 5
      };
    }

    onComplete({
      location: locationPayload,
      destinationPreference: destinationPayload,
      addPropertyLater: !isUser && addPropertyLater
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Step 2 of 2 · Location Intelligence
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {isUser ? 'Where are you looking for a stay?' : 'Where is your property or business located?'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isUser
              ? 'Detect GPS, search locality, or drop a pin. We personalize room discovery and commute times.'
              : 'Set your primary business location. You can add multiple properties with independent coordinates later.'}
          </p>
        </div>

        {/* Tab switch for Residents */}
        {isUser && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveStepTab('location')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeStepTab === 'location'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Current / Area</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStepTab('destination')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeStepTab === 'destination'
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Campus / Hub</span>
            </button>
          </div>
        )}
      </div>

      {/* Mode A: Primary Location Search & Map */}
      {activeStepTab === 'location' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Search Bar + GPS Button */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search address, locality, or landmark (Geoapify Autocomplete)..."
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                {searching && (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3 top-3" />
                )}
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={locatingGps}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                title="Detect current GPS coordinates"
              >
                <Locate className={`w-3.5 h-3.5 ${locatingGps ? 'animate-spin' : ''}`} />
                <span>{locatingGps ? 'Detecting...' : 'Detect GPS'}</span>
              </button>
            </div>

            {/* Live Geoapify Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Geoapify &amp; OSM Search Results</span>
                  <span className="text-emerald-600 font-mono">click to select</span>
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 truncate">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                        {item.name || item.formatted}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.formatted}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Leaflet Map with OpenStreetMap */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <div ref={mapContainerRef} className="h-64 sm:h-72 w-full z-0" />

            {/* Draggable notice pill */}
            <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-md flex items-center gap-1.5 pointer-events-none">
              <span className="text-emerald-600 font-bold">📍</span>
              <span>Click on map or drag pin to fine-tune exact position</span>
            </div>
          </div>

          {/* Reverse Geocoded Address Preview */}
          {detectedAddress && (
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs flex items-start gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-emerald-950 block">Detected Address (Geoapify Reverse Geocode):</span>
                <p className="text-emerald-900 text-[11px] font-medium mt-0.5 leading-relaxed">
                  {detectedAddress}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-800/80 font-mono">
                  <span>Lat: {currentLat.toFixed(5)}</span>
                  <span>·</span>
                  <span>Lng: {currentLng.toFixed(5)}</span>
                  <span>·</span>
                  <span className="uppercase font-sans font-bold">Source: {locationSource}</span>
                </div>
              </div>
            </div>
          )}

          {/* Provider Specific Option */}
          {!isUser && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <strong className="text-slate-800 font-bold block">Multiple Properties Note</strong>
                <p className="text-[11px] text-slate-500">
                  You can register once and add multiple properties with independent coordinates later from the dashboard.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={addPropertyLater}
                  onChange={(e) => setAddPropertyLater(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-700">Add Property Later</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Destination & Commute Radius (for Residents / Students) */}
      {isUser && activeStepTab === 'destination' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              Where do you want to find accommodation?
            </span>
            <p className="text-xs text-indigo-950 font-medium">
              We anchor your daily commute so verified hostels and PGs are sorted nearest to your campus or workplace.
            </p>
          </div>

          {/* Destination Type Pills */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Destination Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DESTINATION_TYPES.map((t) => {
                const IconComponent = t.icon;
                const isSelected = destinationType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDestinationType(t.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destination Name Input with Autocomplete */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Campus / Office Name (or landmark)
            </label>
            <div className="relative">
              <input
                type="text"
                value={destinationName}
                onChange={(e) => handleDestQueryChange(e.target.value)}
                placeholder="e.g. SGSITS Indore, DAVV Takshashila, MANIT Bhopal, Allen Kota..."
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
              />
              <Compass className="w-4 h-4 text-indigo-600 absolute left-3 top-3 pointer-events-none" />
              {destSearching && (
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin absolute right-3 top-3" />
              )}
            </div>

            {/* Suggestions */}
            {destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDestSuggestion(item)}
                    className="w-full text-left px-3.5 py-2 hover:bg-indigo-50/70 transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <div className="truncate text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                      {item.name || item.formatted}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Commute Radius Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Preferred Commute Radius
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setDestinationRadius(km)}
                  className={`py-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    destinationRadius === km
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-black'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Within {km} km
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {destinationRadius <= 2
                ? 'Walking / cycling distance to campus'
                : 'Short auto / city transit commute'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation & Submit Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Details</span>
        </button>

        <div className="flex items-center gap-2">
          {isUser && activeStepTab === 'location' && (
            <button
              type="button"
              onClick={() => setActiveStepTab('destination')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Set Campus / Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {(!isUser || activeStepTab === 'destination') && (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Complete Registration</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
