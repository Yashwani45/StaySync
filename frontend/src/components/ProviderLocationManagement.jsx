import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, ShieldCheck, AlertCircle, Edit3, Eye, Navigation, 
  CheckCircle2, Compass, Layers, Save, RefreshCw, ExternalLink
} from 'lucide-react';
import { propertiesAPI } from '../services/api';

const ProviderLocationManagement = ({ listings = [], onEditLocation, onRefresh }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [selectedProperty, setSelectedProperty] = useState(listings[0] || null);
  const [editingLocId, setEditingLocId] = useState(null);
  const [editVisibility, setEditVisibility] = useState('public');
  const [editAddress, setEditAddress] = useState('');
  const [editLocality, setEditLocality] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Stats calculation
  const totalListings = listings.length;
  const verifiedLocations = listings.filter(p => p.location?.verified || p.verificationStatus === 'Verified').length;
  const missingCoords = listings.filter(p => !p.latitude && !p.location?.coordinates).length;
  const publicCount = listings.filter(p => (p.location?.visibility || 'public') === 'public').length;
  const approxCount = listings.filter(p => p.location?.visibility === 'approximate').length;
  const bookedCount = listings.filter(p => p.location?.visibility === 'booked').length;

  // Initialize Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    const firstValid = listings.find(p => p.latitude && p.longitude) || listings[0];
    const center = firstValid?.latitude 
      ? [firstValid.latitude, firstValid.longitude] 
      : [22.7196, 75.8577];

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(center, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = [];

    listings.forEach((prop, idx) => {
      const lat = prop.location?.coordinates?.[1] || prop.latitude || (22.7196 + idx * 0.01);
      const lng = prop.location?.coordinates?.[0] || prop.longitude || (75.8577 + idx * 0.01);
      bounds.push([lat, lng]);

      const isSel = selectedProperty?._id === prop._id;
      const isVerified = prop.location?.verified || prop.verificationStatus === 'Verified';

      const pinIcon = L.divIcon({
        className: 'provider-loc-pin',
        html: `
          <div style="
            background: ${isSel ? '#10b981' : isVerified ? '#059669' : '#d97706'};
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 5px 9px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid ${isSel ? '#34d399' : '#ffffff'};
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            transform: translate(-50%, -100%);
            cursor: pointer;
          ">
            <span>🏠</span>
            <span>${prop.title}</span>
            ${isVerified ? '<span style="font-size:9px;background:#065f46;padding:1px 3px;border-radius:999px;">✓</span>' : ''}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 6px 8px; width: 220px;">
          <strong style="font-size: 13px; color: #0f172a; display: block;">${prop.title}</strong>
          <span style="font-size: 11px; color: #64748b; display: block; margin: 2px 0;">
            ${prop.address}, ${prop.city}
          </span>
          <div style="font-size: 10px; font-weight: 700; color: #059669; margin-top: 4px;">
            Visibility: ${(prop.location?.visibility || 'public').toUpperCase()}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedProperty(prop);
      });

      markersRef.current.push(marker);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [listings, selectedProperty]);

  // Zoom to property on map
  const handleZoomToProperty = (prop) => {
    setSelectedProperty(prop);
    const lat = prop.location?.coordinates?.[1] || prop.latitude;
    const lng = prop.location?.coordinates?.[0] || prop.longitude;
    if (lat && lng && mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }
  };

  // Start quick edit
  const startQuickEdit = (prop) => {
    setEditingLocId(prop._id);
    setEditVisibility(prop.location?.visibility || 'public');
    setEditAddress(prop.address || '');
    setEditLocality(prop.location?.locality || '');
    setEditLat(prop.location?.coordinates?.[1] || prop.latitude || '');
    setEditLng(prop.location?.coordinates?.[0] || prop.longitude || '');
  };

  // Save quick edit
  const saveQuickEdit = async (propId) => {
    setSaving(true);
    setStatusMsg('');
    try {
      const res = await propertiesAPI.updatePropertyLocation(propId, {
        address: editAddress,
        locality: editLocality,
        visibility: editVisibility,
        latitude: parseFloat(editLat),
        longitude: parseFloat(editLng)
      });
      if (res.success) {
        setStatusMsg('✓ Location updated successfully!');
        setEditingLocId(null);
        if (onRefresh) onRefresh();
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      setStatusMsg('Error updating location: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* 1. Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Stays</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalListings}</div>
          <span className="text-[11px] text-slate-400 font-semibold">Active listings</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Verified Locations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{verifiedLocations}</div>
          <span className="text-[11px] text-emerald-600/80 font-semibold">Passed location audit</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Missing GPS Pins</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{missingCoords}</div>
          <span className="text-[11px] text-slate-400 font-semibold">Need map positioning</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Visibility Mix</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs font-bold text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span>Public:</span>
              <strong className="text-slate-900">{publicCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Approximate:</span>
              <strong className="text-slate-900">{approxCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Post-booking:</span>
              <strong className="text-slate-900">{bookedCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-in fade-in">
          {statusMsg}
        </div>
      )}

      {/* 2. Interactive Map Overview */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              My Property Locations Overview Map
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Click pins to inspect property coordinates &amp; privacy
          </span>
        </div>

        <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>
      </div>

      {/* 3. Property Location Management List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Manage Accommodation Locations &amp; Visibility
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Update street address, GPS coordinates, and student privacy settings.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {listings.map((prop) => {
            const isEditing = editingLocId === prop._id;
            const pLat = prop.location?.coordinates?.[1] || prop.latitude;
            const pLng = prop.location?.coordinates?.[0] || prop.longitude;
            const visibility = prop.location?.visibility || 'public';
            const isVerified = prop.location?.verified || prop.verificationStatus === 'Verified';

            return (
              <div key={prop._id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                {isEditing ? (
                  // Quick Edit Inline Form
                  <div className="space-y-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-extrabold text-emerald-950">
                        Editing Location: {prop.title}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setEditingLocId(null)}
                        className="text-xs text-slate-400 hover:text-slate-700"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Locality / Area</label>
                        <input
                          type="text"
                          value={editLocality}
                          onChange={(e) => setEditLocality(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editLat}
                          onChange={(e) => setEditLat(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editLng}
                          onChange={(e) => setEditLng(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Visibility Policy</label>
                        <select
                          value={editVisibility}
                          onChange={(e) => setEditVisibility(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold"
                        >
                          <option value="public">Public (Exact)</option>
                          <option value="approximate">Approximate Zone</option>
                          <option value="booked">Exact on Booking Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingLocId(null)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => saveQuickEdit(prop._id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save Location'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Read View
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-extrabold text-slate-900 truncate">
                          {prop.title}
                        </strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {prop.propertyType || 'Hostel'}
                        </span>
                        {isVerified ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            Unverified Pin
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 flex items-center gap-1 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{prop.address}, {prop.city}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                        <span>Lat: {pLat ? parseFloat(pLat).toFixed(5) : 'Missing'}</span>
                        <span>Lng: {pLng ? parseFloat(pLng).toFixed(5) : 'Missing'}</span>
                        <span className="font-sans font-bold text-slate-500">
                          Visibility: <strong className="text-slate-800">{visibility}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleZoomToProperty(prop)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/80 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View on Map</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startQuickEdit(prop)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Edit Location</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ProviderLocationManagement;
