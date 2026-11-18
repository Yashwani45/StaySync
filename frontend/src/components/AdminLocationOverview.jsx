import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, ShieldCheck, AlertCircle, CheckCircle2, XCircle, 
  Search, ExternalLink, Filter, Compass, Layers, RefreshCw, Eye
} from 'lucide-react';
import { propertiesAPI } from '../services/api';

const CITY_COORDINATES = {
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

const AdminLocationOverview = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  // Filters
  const [cityFilter, setCityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch properties
  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await propertiesAPI.getProperties({});
      if (res.success) {
        setProperties(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin property locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (cityFilter !== 'All' && p.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (typeFilter !== 'All' && p.propertyType !== typeFilter) return false;
    
    const isVerified = p.location?.verified || p.verificationStatus === 'Verified';
    const hasCoords = (p.latitude && p.longitude) || (p.location?.coordinates && p.location.coordinates.length === 2);

    if (statusFilter === 'VERIFIED' && !isVerified) return false;
    if (statusFilter === 'UNVERIFIED' && isVerified) return false;
    if (statusFilter === 'MISSING_COORDS' && hasCoords) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchAddr = p.address?.toLowerCase().includes(q);
      const matchLoc = (p.location?.locality || '').toLowerCase().includes(q);
      if (!matchTitle && !matchAddr && !matchLoc) return false;
    }

    return true;
  });

  // Calculate stats
  const total = properties.length;
  const verifiedCount = properties.filter(p => p.location?.verified || p.verificationStatus === 'Verified').length;
  const unverifiedCount = total - verifiedCount;
  const missingCoordsCount = properties.filter(p => !p.latitude && (!p.location?.coordinates || p.location.coordinates.length < 2)).length;

  // City distribution breakdown
  const cityCounts = properties.reduce((acc, p) => {
    const c = p.city || 'Unknown';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  // Locality distribution breakdown
  const localityCounts = properties.reduce((acc, p) => {
    const loc = p.location?.locality || p.location?.area || 'Prime Locality';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    const center = cityFilter !== 'All' && CITY_COORDINATES[cityFilter]
      ? CITY_COORDINATES[cityFilter]
      : [22.7196, 75.8577];
    const zoom = cityFilter !== 'All' ? 13 : 6;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = [];

    filteredProperties.forEach((prop, idx) => {
      const cityCenter = CITY_COORDINATES[prop.city] || center;
      const lat = prop.location?.coordinates?.[1] || prop.latitude || (cityCenter[0] + (Math.sin(idx * 1.618) * 0.03));
      const lng = prop.location?.coordinates?.[0] || prop.longitude || (cityCenter[1] + (Math.cos(idx * 1.618) * 0.03));
      bounds.push([lat, lng]);

      const isVerified = prop.location?.verified || prop.verificationStatus === 'Verified';
      const pinColor = isVerified ? '#059669' : '#d97706';

      const customIcon = L.divIcon({
        className: 'admin-prop-marker',
        html: `
          <div style="
            background: ${pinColor};
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            transform: translate(-50%, -100%);
            cursor: pointer;
          ">
            <span>🏠</span>
            <span>${prop.title.slice(0, 18)}</span>
            ${isVerified ? '<span style="font-size:9px;background:#065f46;padding:1px 4px;border-radius:999px;">✓ Verified</span>' : '<span style="font-size:9px;background:#92400e;padding:1px 4px;border-radius:999px;">Pending</span>'}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const osmLink = lat && lng
        ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
        : `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${prop.title}, ${prop.address}, ${prop.city}`)}`;

      marker.bindPopup(`
        <div style="font-family: inherit; width: 230px; padding: 6px 8px;">
          <strong style="font-size: 13px; color: #0f172a; display: block;">${prop.title}</strong>
          <span style="font-size: 11px; color: #64748b; display: block; margin: 3px 0;">
            ${prop.address}, ${prop.city}
          </span>
          <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #059669; background: #f0fdf4; padding: 4px 6px; border-radius: 6px; margin: 6px 0;">
            <span>Status: ${isVerified ? 'VERIFIED' : 'PENDING AUDIT'}</span>
            <span>Rent: ₹${prop.monthlyRent || prop.rentPerPerson}</span>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <a href="${osmLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f1f5f9; color: #334155; padding: 5px; border-radius: 6px; font-size: 10px; font-weight: 700; text-decoration: none;">
              OpenStreetMap ↗
            </a>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

  }, [filteredProperties, cityFilter]);

  // Handle Location Verification Status modification
  const handleToggleVerification = async (prop, verifyStatus) => {
    setActionNotice(`Updating verification status for "${prop.title}"...`);
    try {
      const res = await propertiesAPI.updatePropertyLocation(prop._id, {
        verified: verifyStatus
      });
      if (res.success) {
        setActionNotice(`✓ "${prop.title}" location has been ${verifyStatus ? 'VERIFIED' : 'FLAGGED AS UNVERIFIED'}.`);
        loadProperties();
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      setActionNotice('Error updating status: ' + err.message);
    }
  };

  // Zoom to property on map
  const zoomToProperty = (prop) => {
    const lat = prop.location?.coordinates?.[1] || prop.latitude;
    const lng = prop.location?.coordinates?.[0] || prop.longitude;
    if (lat && lng && mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* 1. Header Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">All Mapped Stays</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{total}</div>
          <span className="text-[11px] text-slate-400 font-semibold">Across all active cities</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Verified Locations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{verifiedCount}</div>
          <span className="text-[11px] text-emerald-600/80 font-semibold">Coordinates verified &amp; active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Pending Audit</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{unverifiedCount}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Require host audit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Missing GPS Pins</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">{missingCoordsCount}</div>
          <span className="text-[11px] text-rose-600 font-semibold">Fallback coordinates active</span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl shadow-xs animate-in fade-in flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* 2. Interactive Map & City Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Full Leaflet Map */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          
          {/* Map Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="All">All Cities</option>
                <option value="Indore">Indore</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Kota">Kota</option>
                <option value="Pune">Pune</option>
                <option value="Bangalore">Bangalore</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="All">All Verification Statuses</option>
                <option value="VERIFIED">Verified Coordinates Only</option>
                <option value="UNVERIFIED">Pending / Unverified Only</option>
                <option value="MISSING_COORDS">Missing Coordinates</option>
              </select>

              {/* Category Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Hostel">Hostel</option>
                <option value="PG">PG</option>
                <option value="Flat">Flat</option>
                <option value="Room">Room</option>
              </select>
            </div>

            <button
              onClick={loadProperties}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Map</span>
            </button>
          </div>

          {/* Leaflet Map */}
          <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{filteredProperties.length} Properties Mapped</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-slate-500 font-normal">Click pins to inspect details</span>
            </div>
          </div>
        </div>

        {/* Right Column: City & Locality Distribution Analytics */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* City Distribution Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Property Distribution by City</span>
            </h3>

            <div className="space-y-2">
              {Object.entries(cityCounts).map(([cityName, count]) => {
                const percent = Math.round((count / (total || 1)) * 100);
                return (
                  <div 
                    key={cityName}
                    onClick={() => setCityFilter(cityName)}
                    className="p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50 transition-colors cursor-pointer space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between font-extrabold text-slate-800">
                      <span>{cityName}</span>
                      <span>{count} stays ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Localities Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Top Hubs &amp; Localities</span>
            </h3>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {Object.entries(localityCounts).slice(0, 8).map(([locName, count]) => (
                <div key={locName} className="flex justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50 text-slate-700 font-semibold">
                  <span>{locName}</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 rounded">{count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Address / Coordinate Verification & Audit Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Accommodation Address &amp; Location Verification Queue
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Inspect coordinate mismatches, audit suspicious pin locations, and grant official verification badges.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search property or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 w-56 bg-slate-50"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-black">Property &amp; Type</th>
                <th className="py-3 px-4 font-black">Reported Address</th>
                <th className="py-3 px-4 font-black">City &amp; Locality</th>
                <th className="py-3 px-4 font-black">Coordinates (Lat, Lng)</th>
                <th className="py-3 px-4 font-black">Location Status</th>
                <th className="py-3 px-4 font-black text-right">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProperties.slice(0, 30).map((prop) => {
                const isVerified = prop.location?.verified || prop.verificationStatus === 'Verified';
                const pLat = prop.location?.coordinates?.[1] || prop.latitude;
                const pLng = prop.location?.coordinates?.[0] || prop.longitude;
                const osmLink = pLat && pLng
                  ? `https://www.openstreetmap.org/?mlat=${pLat}&mlon=${pLng}#map=16/${pLat}/${pLng}`
                  : `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${prop.title}, ${prop.address}, ${prop.city}`)}`;

                return (
                  <tr key={prop._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      <div>{prop.title}</div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{prop.propertyType}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
                      {prop.address}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{prop.city}</div>
                      <div className="text-[10px] text-slate-400">{prop.location?.locality || prop.location?.area || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {pLat && pLng ? `${parseFloat(pLat).toFixed(4)}, ${parseFloat(pLng).toFixed(4)}` : <span className="text-rose-500 font-bold">Missing</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      {isVerified ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => zoomToProperty(prop)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Zoom on Map"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={osmLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Open in OpenStreetMap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {isVerified ? (
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(prop, false)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                          >
                            Flag / Reject
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(prop, true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shadow-2xs transition-colors cursor-pointer"
                          >
                            Approve Location
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminLocationOverview;
