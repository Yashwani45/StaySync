import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, Locate, Check, Info, Loader2, Sparkles } from 'lucide-react';
import { locationAPI } from '../services/api';

const CITY_CENTERS = {
  Indore: [22.7196, 75.8577],
  Bhopal: [23.2599, 77.4126],
  Bangalore: [12.9716, 77.5946],
  Pune: [18.5204, 73.8567],
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.6139, 77.2090],
  Jaipur: [26.9124, 75.7873],
  Kota: [25.2138, 75.8648],
  Ujjain: [23.1765, 75.7885]
};

const LocationPickerMap = ({
  latitude,
  longitude,
  city = 'Indore',
  onCoordinatesChange,
  onAddressSelect
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const fallbackCenter = CITY_CENTERS[city] || [22.7196, 75.8577];
  const initialLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : fallbackCenter[0];
  const initialLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : fallbackCenter[1];

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [reverseAddress, setReverseAddress] = useState('');
  const [reverseLoading, setReverseLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Sync internal state if props change from outside
  useEffect(() => {
    if (latitude && !isNaN(parseFloat(latitude)) && longitude && !isNaN(parseFloat(longitude))) {
      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);
      setCurrentLat(latVal);
      setCurrentLng(lngVal);

      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([latVal, lngVal]);
        mapInstanceRef.current.panTo([latVal, lngVal]);
      }
    }
  }, [latitude, longitude]);

  // Reverse geocode whenever coordinates change
  const fetchReverseGeocode = async (lat, lng) => {
    setReverseLoading(true);
    try {
      const res = await locationAPI.reverseGeocode({ lat, lng });
      if (res && res.data) {
        const addr = res.data.formattedAddress || res.data.address;
        setReverseAddress(addr);
        if (onAddressSelect) {
          onAddressSelect(res.data);
        }
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    } finally {
      setReverseLoading(false);
    }
  };

  // Initialize Leaflet Map with OpenStreetMap
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([currentLat, currentLng], 14);

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; Geoapify'
      }).addTo(map);

      // Draggable property marker icon
      const pinIcon = L.divIcon({
        className: 'picker-draggable-pin',
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
            📍
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const marker = L.marker([currentLat, currentLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        const rLat = parseFloat(lat.toFixed(6));
        const rLng = parseFloat(lng.toFixed(6));
        setCurrentLat(rLat);
        setCurrentLng(rLng);
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: rLat, lng: rLng });
        }
        fetchReverseGeocode(rLat, rLng);
      });

      // Handle click on map to position pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const rLat = parseFloat(lat.toFixed(6));
        const rLng = parseFloat(lng.toFixed(6));
        marker.setLatLng([rLat, rLng]);
        setCurrentLat(rLat);
        setCurrentLng(rLng);
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: rLat, lng: rLng });
        }
        fetchReverseGeocode(rLat, rLng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Initial reverse geocode
      fetchReverseGeocode(currentLat, currentLng);
    }
  }, []);

  // Update marker position manually
  const updateMarkerPosition = (newLat, newLng, shouldReverse = true) => {
    setCurrentLat(newLat);
    setCurrentLng(newLng);
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.setView([newLat, newLng], 15, { animate: true });
    }
    if (onCoordinatesChange) {
      onCoordinatesChange({ lat: newLat, lng: newLng });
    }
    if (shouldReverse) {
      fetchReverseGeocode(newLat, newLng);
    }
  };

  // Live Geoapify Autocomplete search on typing
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
          city,
          lat: currentLat,
          lon: currentLng
        });
        setSuggestions(res.data || []);
      } catch (err) {
        console.warn('Geoapify autocomplete error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  // Select autocomplete suggestion
  const selectSuggestion = (item) => {
    updateMarkerPosition(item.lat, item.lng, false);
    setSearchQuery(item.name || item.formatted);
    setReverseAddress(item.formatted);
    setSuggestions([]);
    if (onAddressSelect) {
      onAddressSelect(item);
    }
  };

  // GPS Locate Device
  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported in your browser');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        updateMarkerPosition(lat, lng, true);
      },
      (err) => {
        setLocatingGps(false);
        alert('Could not detect location. Please grant location permissions in browser.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3.5">
      
      {/* 1. Address Search Bar with Live Geoapify Autocomplete */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search address, landmark, or area (e.g. Bhawarkua, Vijay Nagar)..."
              className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            {searching && (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3 top-3" />
            )}
          </div>

          <button
            type="button"
            onClick={handleGpsLocate}
            disabled={locatingGps}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            title="Use current GPS location"
          >
            <Locate className={`w-3.5 h-3.5 ${locatingGps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Use GPS</span>
          </button>
        </div>

        {/* Live Geoapify Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
            <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Geoapify &amp; OSM Search Results</span>
              <span className="text-emerald-600 lowercase font-mono">live autocomplete</span>
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSuggestion(item)}
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

      {/* 2. Interactive Leaflet Map with OpenStreetMap */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
        <div ref={mapContainerRef} className="h-64 w-full z-0" />

        {/* Live Pin Instruction Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-md flex items-center gap-1.5 pointer-events-none">
          <span className="text-emerald-600 font-bold">📍</span>
          <span>Click on map or drag pin to fine-tune exact property position</span>
        </div>
      </div>

      {/* 3. Reverse Geocoded Address Preview */}
      {reverseAddress && (
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-emerald-950 block">Detected Address (Geoapify Reverse Geocode):</span>
            <p className="text-emerald-900 text-[11px] font-medium mt-0.5 leading-relaxed">
              {reverseAddress}
            </p>
          </div>
          {reverseLoading && <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0 mt-0.5" />}
        </div>
      )}

      {/* 4. Manual Coordinate Fine-Tuning */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Latitude (OpenStreetMap)
          </label>
          <input
            type="number"
            step="any"
            value={currentLat}
            onChange={(e) => updateMarkerPosition(parseFloat(e.target.value) || 0, currentLng, false)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Longitude (OpenStreetMap)
          </label>
          <input
            type="number"
            step="any"
            value={currentLng}
            onChange={(e) => updateMarkerPosition(currentLat, parseFloat(e.target.value) || 0, false)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
