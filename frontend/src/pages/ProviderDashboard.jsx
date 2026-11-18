import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, servicesAPI, requestsAPI, bookingsAPI, paymentsAPI } from '../services/api';
import { 
  Home, ClipboardList, Plus, Check, X, ShieldAlert, Star, MessageSquare, 
  ArrowRight, User, Image, Sparkles, MapPin, Tag, Utensils, CheckCircle2, 
  Clock, Calendar, AlertCircle, ShoppingBag, Truck, PauseCircle, Users, 
  DollarSign, RotateCcw, Coffee, ShieldCheck, BedDouble, Trash2,
  Upload, Camera, ChevronLeft, ChevronRight,
  Hotel, Building2, DoorClosed, Moon, Award, Shirt, UtensilsCrossed, FileText, Save, Edit3, Layers,
  Bell, Phone, Mail, Filter, UserCheck, Receipt, Search, Download, CreditCard, ArrowDownLeft, Wallet, CheckCheck
} from 'lucide-react';
import { 
  normalizeImageUrl, 
  DEFAULT_HOSTEL_PHOTOS, 
  DEFAULT_CLEANING_PHOTOS, 
  DEFAULT_TIFFIN_PHOTOS, 
  getDiverseServicePhoto 
} from '../utils/imageHelper';
import PropertyBroadcasterConsole from '../components/PropertyBroadcasterConsole';
import AIOwnerInsightsModal from '../components/AIOwnerInsightsModal';
import OwnerSettlementsModal from '../components/OwnerSettlementsModal';
import LocationPickerMap from '../components/LocationPickerMap';
import ProviderLocationManagement from '../components/ProviderLocationManagement';

const DEFAULT_HOSTEL_AMENITIES = [
  'Wifi', 'AC', 'Geyser', 'Warden / Security', 'CCTV Security', 
  'Biometric Entry', 'RO Water', 'Study Table', 'Daily Cleaning', 'Laundry', 'Power Backup'
];

const DEFAULT_PG_AMENITIES = [
  'Wifi', 'AC', 'Geyser', 'Washing Machine', 'Refrigerator', 
  'RO Water', 'Daily Housekeeping', 'Cupboard', 'Attached Balcony', 'Power Backup', 'Security'
];

const DEFAULT_FLAT_AMENITIES = [
  'Parking', 'Lift / Elevator', '24x7 Water', 'Private Balcony', 
  'Gated Society', 'Power Backup', 'Geyser', 'Air Conditioner', 'Modular Kitchen', 'CCTV Security'
];

const POPULAR_CITIES = [
  'Indore',
  'Bhopal',
  'Bangalore',
  'Pune',
  'Mumbai',
  'Delhi',
  'Jaipur',
  'Hyderabad',
  'Kota',
  'Ujjain',
  'Gwalior',
  'Jabalpur',
  'Ahmedabad',
  'Chandigarh',
  'Lucknow'
];

const AMENITY_THEME_STYLES = {
  indigo: {
    selectedBg: 'bg-indigo-600 text-white border-indigo-600 shadow-2xs',
    unselectedBg: 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300',
    countBadge: 'text-indigo-700 border-indigo-200',
    addBtn: 'text-indigo-700 hover:text-indigo-900 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70',
    inputBorder: 'border-indigo-300 focus:ring-indigo-500',
    submitBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white'
  },
  purple: {
    selectedBg: 'bg-purple-600 text-white border-purple-600 shadow-2xs',
    unselectedBg: 'bg-white text-gray-700 border-gray-200 hover:border-purple-300',
    countBadge: 'text-purple-700 border-purple-200',
    addBtn: 'text-purple-700 hover:text-purple-900 border-purple-200 bg-purple-50/60 hover:bg-purple-100/70',
    inputBorder: 'border-purple-300 focus:ring-purple-500',
    submitBtn: 'bg-purple-600 hover:bg-purple-700 text-white'
  },
  teal: {
    selectedBg: 'bg-teal-700 text-white border-teal-700 shadow-2xs',
    unselectedBg: 'bg-white text-gray-700 border-gray-200 hover:border-teal-300',
    countBadge: 'text-teal-700 border-teal-200',
    addBtn: 'text-teal-700 hover:text-teal-900 border-teal-200 bg-teal-50/60 hover:bg-teal-100/70',
    inputBorder: 'border-teal-300 focus:ring-teal-500',
    submitBtn: 'bg-teal-700 hover:bg-teal-800 text-white'
  }
};

const AmenitiesSection = ({
  title = "PG Facilities & Amenities",
  badgeColor = "indigo",
  defaultAmenities = [],
  selectedAmenities = [],
  toggleAmenity,
  customAmenities = [],
  onAddCustomAmenity,
  onRemoveCustomAmenity
}) => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const st = AMENITY_THEME_STYLES[badgeColor] || AMENITY_THEME_STYLES.indigo;

  const handleAdd = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    const val = inputValue.trim();
    if (!val) return;
    onAddCustomAmenity(val);
    setInputValue('');
    setShowInput(false);
  };

  const allDisplayAmenities = Array.from(new Set([...defaultAmenities, ...customAmenities]));
  const visibleSelectedCount = selectedAmenities.filter(a => allDisplayAmenities.includes(a)).length;

  const suggestedPopular = [
    'Study Table', 'Attached Washroom', 'Microwave', 'Gym / Fitness', 
    'Lift / Elevator', 'Biometric Entry', 'CCTV Security', 'Mess / Meals', 
    'Terrace Access', 'Self Cooking Area'
  ].filter(s => !allDisplayAmenities.includes(s));

  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase text-gray-800 tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowInput(!showInput);
            }}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${st.addBtn}`}
          >
            {showInput ? (
              <span>Cancel</span>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Add Custom Facility</span>
              </>
            )}
          </button>
          <span className={`text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border ${st.countBadge}`}>
            {visibleSelectedCount} Selected
          </span>
        </div>
      </div>

      {showInput && (
        <div className="p-3 bg-white rounded-xl border border-dashed border-gray-300 space-y-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="e.g. Study Table, Attached Washroom, Microwave, Gym..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd(e);
                }
              }}
              className={`flex-1 px-3 py-1.5 text-xs border rounded-xl font-medium focus:ring-2 focus:outline-none ${st.inputBorder}`}
            />
            <button
              type="button"
              disabled={!inputValue.trim()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAdd(e);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs disabled:opacity-50 ${st.submitBtn}`}
            >
              Add
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInput(false);
                setInputValue('');
              }}
              className="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {suggestedPopular.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] font-bold text-gray-400 block mb-1">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1">
                {suggestedPopular.slice(0, 6).map(sugg => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddCustomAmenity(sugg);
                    }}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>+ {sugg}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 pt-1">
        {allDisplayAmenities.map(amenity => {
          const isSelected = selectedAmenities.includes(amenity);
          const isCustom = customAmenities.includes(amenity);

          return (
            <div key={amenity} className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                  isSelected ? st.selectedBg : st.unselectedBg
                }`}
              >
                <span>{isSelected ? '✓ ' : '+ '}</span>
                <span>{amenity}</span>
                {isCustom && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-normal opacity-85 ml-0.5 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    Custom
                  </span>
                )}
              </button>

              {isCustom && (
                <button
                  type="button"
                  title="Remove custom amenity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCustomAmenity(amenity);
                  }}
                  className="ml-1 p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {!showInput && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowInput(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-dashed flex items-center gap-1 ${st.addBtn}`}
          >
            <Plus className="w-3 h-3" />
            <span>Add Custom Facility</span>
          </button>
        )}
      </div>
    </div>
  );
};

const PHOTO_THEME_STYLES = {
  purple: {
    accent: 'purple',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    uploadBtn: 'border-purple-300 text-purple-700 bg-purple-50/60 hover:bg-purple-100/70',
    inputRing: 'focus:ring-purple-500',
    addBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
    presetBtn: 'hover:bg-purple-50 text-gray-700 hover:text-purple-700 border-gray-200 hover:border-purple-300'
  },
  indigo: {
    accent: 'indigo',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    uploadBtn: 'border-indigo-300 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/70',
    inputRing: 'focus:ring-indigo-500',
    addBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    presetBtn: 'hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border-gray-200 hover:border-indigo-300'
  },
  teal: {
    accent: 'teal',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    uploadBtn: 'border-teal-300 text-teal-700 bg-teal-50/60 hover:bg-teal-100/70',
    inputRing: 'focus:ring-teal-500',
    addBtn: 'bg-teal-700 hover:bg-teal-800 text-white',
    presetBtn: 'hover:bg-teal-50 text-gray-700 hover:text-teal-700 border-gray-200 hover:border-teal-300'
  },
  emerald: {
    accent: 'emerald',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    uploadBtn: 'border-emerald-300 text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100',
    inputRing: 'focus:ring-emerald-600',
    addBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    presetBtn: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-200 hover:border-emerald-300'
  }
};

const PropertyPhotoManager = ({
  photos = [],
  onChange,
  propertyType = 'Hostel',
  badgeColor = 'purple',
  title = '',
  subtitle = '',
  hideUrlInput = false,
  presets = []
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const theme = PHOTO_THEME_STYLES[badgeColor] || PHOTO_THEME_STYLES.purple;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErrorMsg('');
    setIsProcessing(true);

    let processed = 0;
    const collected = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select valid image files only (PNG, JPG, JPEG, WebP).');
        processed++;
        if (processed === files.length) setIsProcessing(false);
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg('Some images exceeded the 20MB limit and were skipped.');
        processed++;
        if (processed === files.length) setIsProcessing(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 900;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.78);
            collected.push(compressed);
          } catch {
            collected.push(event.target.result);
          }

          processed++;
          if (processed === files.length) {
            onChange([...photos, ...collected]);
            setIsProcessing(false);
          }
        };
        img.onerror = () => {
          processed++;
          if (processed === files.length) setIsProcessing(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddUrl = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const normalized = normalizeImageUrl(trimmed);
    onChange([...photos, normalized]);
    setUrlInput('');
  };

  const handleRemove = (index) => {
    onChange(photos.filter((_, idx) => idx !== index));
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    const selected = photos[index];
    const rest = photos.filter((_, idx) => idx !== index);
    onChange([selected, ...rest]);
  };

  const handleMove = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= photos.length) return;
    const copy = [...photos];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    onChange(copy);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
        <div>
          <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-1.5">
            <Camera className={`w-4 h-4 ${badgeColor === 'emerald' ? 'text-emerald-600' : 'text-purple-600'}`} />
            <span>{title || `Property Photo Gallery (${propertyType === 'PG' ? 'PG' : propertyType === 'Room' || propertyType === 'Flat' ? 'Flat / Room' : 'Hostel'})`}</span>
          </h4>
          <p className="text-[11px] text-gray-500 font-medium">
            {subtitle || 'Upload multiple photos from your device or paste links. The 1st photo is used as the main cover photo.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs inline-flex items-center gap-1.5 ${theme.badge}`}>
            <Camera className="w-3.5 h-3.5" />
            <span>{photos.length} Photo{photos.length === 1 ? '' : 's'} Added</span>
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload & URL Input Row */}
      <div className={hideUrlInput ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
        {/* Device Upload Dropzone / Button */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            {hideUrlInput ? 'Multi-Select Photos from Device (Mobile / PC Gallery)' : 'Method 1: Upload Multiple Photos from Device'}
          </label>
          <label className={`w-full py-3 px-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-2xs ${theme.uploadBtn}`}>
            <Upload className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">
              {isProcessing ? 'Optimizing & Adding Photos...' : 'Click to Choose Photos (Select Multiple at Once)'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={isProcessing}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Tip: You can select multiple kitchen, thali or dining photos at once. PNG, JPG, WebP supported.
          </span>
        </div>

        {/* URL Input - only if hideUrlInput is false */}
        {!hideUrlInput && (
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Method 2: Paste Photo URL or Link
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or web image link"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddUrl(e);
                  }
                }}
                className={`flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl font-medium focus:ring-2 focus:outline-none ${theme.inputRing}`}
              />
              <button
                type="button"
                disabled={!urlInput.trim()}
                onClick={handleAddUrl}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs disabled:opacity-40 cursor-pointer ${theme.addBtn}`}
              >
                + Add
              </button>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Supports Unsplash page links, direct image URLs, and image hosting CDNs.
            </span>
          </div>
        )}
      </div>

      {presets && presets.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] text-gray-500 font-bold">Quick Presets:</span>
          {presets.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange([...photos, qp.url])}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${theme.presetBtn}`}
            >
              {qp.name}
            </button>
          ))}
        </div>
      )}

      {/* Photo Preview Gallery Grid */}
      <div className="pt-2">
        {photos.length === 0 ? (
          <div className="py-6 px-4 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-300 opacity-80" />
            <p className="text-xs font-bold text-gray-600">No photos added yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Upload multiple photos from your device or paste an image link above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Added Photos ({photos.length}) — Click "Set Cover" or use arrows to rearrange order:</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer"
              >
                Clear All Photos
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {photos.map((photo, idx) => {
                const isCover = idx === 0;
                return (
                  <div
                    key={`${idx}-${photo.slice(0, 30)}`}
                    className={`relative rounded-xl overflow-hidden border bg-white group shadow-2xs transition-all ${
                      isCover ? 'border-emerald-500 ring-2 ring-emerald-400/40' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="aspect-4/3 w-full bg-gray-100 overflow-hidden relative">
                      <img
                        src={normalizeImageUrl(photo)}
                        alt={`Property photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600';
                        }}
                      />

                      {/* Cover Badge */}
                      {isCover ? (
                        <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                          ⭐ Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSetCover(idx);
                          }}
                          className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-black/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Make this the main cover photo"
                        >
                          Set Cover
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(idx);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer"
                        title="Delete photo"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Photo Index Number */}
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.2 rounded backdrop-blur-xs">
                        #{idx + 1}
                      </span>

                      {/* Left / Right Reorder Steppers */}
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMove(idx, idx - 1);
                            }}
                            className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {idx < photos.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMove(idx, idx + 1);
                            }}
                            className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                            title="Move right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyLocationFormFields = ({
  address, setAddress,
  locality, setLocality,
  landmark, setLandmark,
  pincode, setPincode,
  locationVisibility, setLocationVisibility,
  propLatitude, setPropLatitude,
  propLongitude, setPropLongitude,
  city
}) => (
  <div className="lg:col-span-3 p-4.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3.5 mt-2">
    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">Property Location &amp; Map Coordinates</span>
      </div>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        GPS Enabled
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="sm:col-span-2">
        <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Street Address *</label>
        <input
          type="text"
          required
          placeholder="e.g. 22, Scheme No 54, near Radisson Square"
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">Locality / Area *</label>
        <input
          type="text"
          required
          placeholder="e.g. Vijay Nagar, Bhawarkua, MP Nagar"
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">Prominent Landmark</label>
        <input
          type="text"
          placeholder="e.g. Near C21 Mall / SGSITS College"
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
        <input
          type="text"
          placeholder="e.g. 452010"
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">Location Visibility Policy</label>
        <select
          value={locationVisibility}
          onChange={(e) => setLocationVisibility(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="public">🌐 Show Exact Location Publicly</option>
          <option value="approximate">🛡️ Show Approximate Area (Exact on booking)</option>
          <option value="booked">🔒 Show Exact Location After Booking Confirmation</option>
        </select>
      </div>
    </div>

    {/* Location Picker Interactive Map */}
    <div>
      <label className="block text-[11px] font-bold text-slate-700 mb-1">
        Pinpoint Exact Location on Map (Click or Drag Marker)
      </label>
      <LocationPickerMap
        latitude={propLatitude}
        longitude={propLongitude}
        city={city}
        onCoordinatesChange={({ lat, lng }) => {
          setPropLatitude(lat);
          setPropLongitude(lng);
        }}
      />
    </div>
  </div>
);

const ProviderDashboard = ({ initialTab, propertyType: forcedPropertyType }) => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Route security: Only authenticated PROVIDER, PROPERTY_OWNER or ADMIN can access ProviderDashboard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (user.role === 'USER') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Determine active dashboard category strictly from user's login profile (Personalized Dashboard)
  const paramType = searchParams.get('type')?.toLowerCase();
  const userProvType = (user?.providerType || '').toLowerCase();
  const userRole = user?.role;

  const isPropertyOwnerRole =
    userRole === 'PROPERTY_OWNER' ||
    userRole === 'HOSTEL_OWNER' ||
    userRole === 'PG_OWNER' ||
    userRole === 'ROOM_OWNER';

  // Determine if this user has a fixed personalized role (Tiffin, Cleaning, or Property Owner)
  const isPersonalizedProvider = Boolean(initialTab) || isPropertyOwnerRole || userRole === 'PROPERTY_OWNER' || userRole === 'PROVIDER' || userRole === 'HOSTEL_OWNER' || userRole === 'PG_OWNER' || userRole === 'ROOM_OWNER' || userRole === 'TIFFIN_PROVIDER' || userRole === 'CLEANING_LAUNDRY_PROVIDER';

  const getPersonalizedTab = () => {
    if (initialTab) return initialTab;
    if (isPropertyOwnerRole) return 'property';
    if (userRole === 'PROVIDER' || userRole === 'TIFFIN_PROVIDER' || userRole === 'CLEANING_LAUNDRY_PROVIDER') {
      if (userRole === 'CLEANING_LAUNDRY_PROVIDER' || userProvType === 'cleaning' || userProvType === 'laundry') return 'cleaning';
      return 'tiffin';
    }
    // For Admin or unauthenticated/demo, respect query param or default to tiffin
    if (paramType === 'cleaning' || paramType === 'laundry') return 'cleaning';
    if (paramType === 'property') return 'property';
    return 'tiffin';
  };

  const [activeTab, setActiveTab] = useState(getPersonalizedTab());

  useEffect(() => {
    if (isPersonalizedProvider || isPropertyOwnerRole) {
      const fixedTab = getPersonalizedTab();
      setActiveTab(fixedTab);
      if (paramType !== fixedTab) {
        setSearchParams({ type: fixedTab }, { replace: true });
      }
    } else if (paramType) {
      if (paramType === 'cleaning') setActiveTab('cleaning');
      else if (paramType === 'tiffin') setActiveTab('tiffin');
      else if (paramType === 'property') setActiveTab('property');
    }
  }, [userRole, userProvType, paramType, initialTab, isPropertyOwnerRole]);

  const handleTabChange = (newTab) => {
    if ((isPersonalizedProvider || isPropertyOwnerRole) && !initialTab) return; // Prevent changing tab if personalized
    setActiveTab(newTab);
    setSearchParams({ type: newTab });
    if (newTab === 'property' && activeSectionTab === 'menu') {
      setActiveSectionTab('rooms');
    } else if (newTab !== 'property' && activeSectionTab === 'rooms') {
      setActiveSectionTab('menu');
    }
  };

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listing creation form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [stateLoc, setStateLoc] = useState('Madhya Pradesh');
  const [pincode, setPincode] = useState('');
  const [propLatitude, setPropLatitude] = useState('');
  const [propLongitude, setPropLongitude] = useState('');
  const [locationVisibility, setLocationVisibility] = useState('public');
  const initialCity = searchParams.get('city') || user?.currentCity || user?.preferredCity || user?.city || '';
  const [city, setCity] = useState(initialCity);
  const [userCitySynced, setUserCitySynced] = useState(Boolean(searchParams.get('city')));
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [roomType, setRoomType] = useState('2-Seater Room');
  const [hostelCategory, setHostelCategory] = useState('Girls & Boys Hostel');
  const [propertyType, setPropertyType] = useState(forcedPropertyType || user?.propertyType || 'Hostel');
  const isHostel = forcedPropertyType === 'Hostel' || user?.propertyType === 'Hostel' || user?.role === 'HOSTEL_OWNER' || propertyType === 'Hostel';
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  
  // Keep propertyType and operating city synchronized with user's registered account
  useEffect(() => {
    if (forcedPropertyType) {
      setPropertyType(forcedPropertyType);
    } else if (user && !editingPropertyId) {
      if (user.propertyType) {
        setPropertyType(user.propertyType);
      }
      const uCity = user.currentCity || user.preferredCity || user.city;
      if (uCity && (!userCitySynced || !city)) {
        setCity(uCity);
        setUserCitySynced(true);
      }
    }
  }, [forcedPropertyType, user, editingPropertyId, userCitySynced, city]);

  // Listen for Navbar "+ Add Listing / Hostel" trigger (only on user click)
  useEffect(() => {
    const handleOpenFormEvent = () => {
      resetForm();
      setShowCreateForm(true);
    };
    window.addEventListener('staysync-open-create-listing', handleOpenFormEvent);
    return () => window.removeEventListener('staysync-open-create-listing', handleOpenFormEvent);
  }, []);
  const [serviceCategory, setServiceCategory] = useState(activeTab === 'cleaning' ? 'Cleaning' : 'Tiffin');
  const [foodAvailable, setFoodAvailable] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [propertyPhotos, setPropertyPhotos] = useState([]);
  const [managedPropertyId, setManagedPropertyId] = useState(null);
  const [showPropertyManageModal, setShowPropertyManageModal] = useState(false);
  const [showAIInsightsModal, setShowAIInsightsModal] = useState(false);
  const [showSettlementsModal, setShowSettlementsModal] = useState(false);

  // User & Payment Management States
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Dedicated Section Tab State (Switch between Menus, Rooms, Listings/Branches, Inquiries, Customers, and Payments)
  const [activeSectionTab, setActiveSectionTab] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#provider-inquiries-section') return 'inquiries';
    if (hash === '#provider-users-section') return 'customers';
    if (hash === '#provider-payments-section') return 'payments';
    if (hash === '#provider-listings-section') return 'listings';
    if (hash === '#tiffin-menu-section') return 'menu';
    const param = searchParams.get('section') || searchParams.get('view');
    if (param && ['listings', 'inquiries', 'customers', 'payments', 'menu', 'rooms'].includes(param)) return param;
    return (userRole === 'PROPERTY_OWNER' || isPropertyOwnerRole) ? 'rooms' : 'menu';
  });

  const switchSectionTab = (tabKey) => {
    setActiveSectionTab(tabKey);
    const hashTarget =
      tabKey === 'inquiries' ? 'provider-inquiries-section' :
      tabKey === 'customers' ? 'provider-users-section' :
      tabKey === 'payments' ? 'provider-payments-section' :
      tabKey === 'listings' ? 'provider-listings-section' :
      tabKey === 'menu' ? 'tiffin-menu-section' :
      'provider-overview-section';
    window.location.hash = hashTarget;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#provider-inquiries-section') setActiveSectionTab('inquiries');
      else if (hash === '#provider-users-section') setActiveSectionTab('customers');
      else if (hash === '#provider-payments-section') setActiveSectionTab('payments');
      else if (hash === '#provider-listings-section') setActiveSectionTab('listings');
      else if (hash === '#tiffin-menu-section') setActiveSectionTab('menu');
      else if (hash === '#provider-overview-section') {
        setActiveSectionTab(activeTab === 'property' ? 'rooms' : 'menu');
      }
    };
    const handleTabEvent = (e) => {
      const target = e.detail;
      if (target === 'provider-inquiries-section') setActiveSectionTab('inquiries');
      else if (target === 'provider-users-section') setActiveSectionTab('customers');
      else if (target === 'provider-payments-section') setActiveSectionTab('payments');
      else if (target === 'provider-listings-section') setActiveSectionTab('listings');
      else if (target === 'tiffin-menu-section') setActiveSectionTab('menu');
      else if (target === 'provider-overview-section') {
        setActiveSectionTab(activeTab === 'property' ? 'rooms' : 'menu');
      }
    };
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('staysync-switch-provider-tab', handleTabEvent);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('staysync-switch-provider-tab', handleTabEvent);
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'property' && activeSectionTab === 'menu' && propertyType !== 'Hostel' && !isHostel) {
      setActiveSectionTab('rooms');
    }
  }, [activeTab, activeSectionTab, propertyType, isHostel]);

  const handleSelectPropertyForManagement = (propId) => {
    setManagedPropertyId(propId);
    setShowPropertyManageModal(true);
  };
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [hostelCurfew, setHostelCurfew] = useState('10:30 PM');

  const [customAmenities, setCustomAmenities] = useState([]);

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddCustomAmenity = (amenity) => {
    const trimmed = amenity.trim();
    if (!trimmed) return;
    if (!customAmenities.includes(trimmed)) {
      setCustomAmenities(prev => [...prev, trimmed]);
    }
    if (!selectedAmenities.includes(trimmed)) {
      setSelectedAmenities(prev => [...prev, trimmed]);
    }
  };

  const handleRemoveCustomAmenity = (amenity) => {
    setCustomAmenities(prev => prev.filter(a => a !== amenity));
    setSelectedAmenities(prev => prev.filter(a => a !== amenity));
  };

  // PG & Room additional states
  const [pgSharingTypes, setPgSharingTypes] = useState(['Single Room (Private)', 'Double Sharing (2 Beds)']);
  const [pgFoodPolicy, setPgFoodPolicy] = useState('3 Meals Included');
  const [pgNoticePeriod, setPgNoticePeriod] = useState('1 Month');
  const [pgCurfew, setPgCurfew] = useState('No Curfew (24x7)');
  const [roomSubtype, setRoomSubtype] = useState('1 BHK Flat');
  const [furnishing, setFurnishing] = useState('Fully Furnished');
  const [preferredTenants, setPreferredTenants] = useState('Any / All Welcome');
  const [maintenanceCharges, setMaintenanceCharges] = useState('0');
  const [electricityCharges, setElectricityCharges] = useState('As per meter unit');
  const [floorNumber, setFloorNumber] = useState('1st Floor');
  const [kitchenType, setKitchenType] = useState('Dedicated Private Kitchen');

  const togglePgSharingType = (type) => {
    if (pgSharingTypes.includes(type)) {
      if (pgSharingTypes.length > 1) {
        setPgSharingTypes(pgSharingTypes.filter(t => t !== type));
      }
    } else {
      setPgSharingTypes([...pgSharingTypes, type]);
    }
  };

  // Add PG Room Modal States
  const [showAddPgRoomModal, setShowAddPgRoomModal] = useState(false);
  const [newPgRoomName, setNewPgRoomName] = useState('');
  const [newPgSharingType, setNewPgSharingType] = useState('Double Sharing (2 Beds)');
  const [newPgRent, setNewPgRent] = useState('');
  const [newPgTotalBeds, setNewPgTotalBeds] = useState('2');
  const [newPgAvailableBeds, setNewPgAvailableBeds] = useState('2');
  const [newPgCustomSharing, setNewPgCustomSharing] = useState('');
  const [addingPgRoom, setAddingPgRoom] = useState(false);
  const [customPgSharing, setCustomPgSharing] = useState('');

  // 1-Seater, 2-Seater, 3-Seater room tier configurations
  const [tier1Active, setTier1Active] = useState(true);
  const [tier1Rent, setTier1Rent] = useState('8500');
  const [tier1AvailableBeds, setTier1AvailableBeds] = useState('1');
  const [tier1TotalBeds, setTier1TotalBeds] = useState('1');

  const [tier2Active, setTier2Active] = useState(true);
  const [tier2Rent, setTier2Rent] = useState('6000');
  const [tier2AvailableBeds, setTier2AvailableBeds] = useState('2');
  const [tier2TotalBeds, setTier2TotalBeds] = useState('2');

  const [tier3Active, setTier3Active] = useState(true);
  const [tier3Rent, setTier3Rent] = useState('4500');
  const [tier3AvailableBeds, setTier3AvailableBeds] = useState('3');
  const [tier3TotalBeds, setTier3TotalBeds] = useState('3');

  // Direct Bed & Rent count for Hostel (owner enters bed count directly, not forced seater)
  const [totalHostelBeds, setTotalHostelBeds] = useState('20');
  const [availableHostelBeds, setAvailableHostelBeds] = useState('5');
  
  // Default Weekly Menu: Unique varied meals for each day of the week
  const DEFAULT_WEEKLY_MENU = {
    monday: {
      breakfast: 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
      lunch: 'Dal Tadka, Shahi Paneer, 4 Phulkas, Steamed Rice & Salad',
      dinner: 'Aloo Gobi, Yellow Dal Fry, 4 Butter Rotis & Jeera Rice'
    },
    tuesday: {
      breakfast: 'Aloo Pyaz Paratha with Fresh Curd & Pickle',
      lunch: 'Kadhi Pakoda, Bhindi Masala, 4 Rotis & Jeera Rice',
      dinner: 'Sev Tamatar, Yellow Dal, 4 Rotis & Steamed Rice'
    },
    wednesday: {
      breakfast: 'Idli Sambhar & Fresh Coconut Chutney',
      lunch: 'Chole Masala, Paneer Bhurji, 4 Phulkas & Jeera Rice',
      dinner: 'Matar Paneer, Dal Fry, 4 Butter Rotis & Gulab Jamun'
    },
    thursday: {
      breakfast: 'Methi Thepla with Fresh Curd & Pickle',
      lunch: 'Dal Makhani, Dum Aloo, 4 Rotis & Steamed Rice',
      dinner: 'Lauki Kofta Curry, Moong Dal Fry, 4 Rotis & Rice'
    },
    friday: {
      breakfast: 'Veg Upma / Bread Roll with Mint Chutney',
      lunch: 'Rajma Masala, Aloo Jeera, 4 Phulkas, Veg Pulao & Salad',
      dinner: 'Baingan Bharta, Chana Dal Fry, 4 Phulkas & Sweet'
    },
    saturday: {
      breakfast: 'Moong Dal Chilla / Puri Sabzi',
      lunch: 'Pav Bhaji / Paneer Do Pyaza, Dal Tadka, 4 Rotis & Rice',
      dinner: 'Mix Veg Curry, Masoor Dal, 4 Rotis & Jeera Rice'
    },
    sunday: {
      breakfast: 'Masala Dosa / Bedmi Puri with Aloo Sabzi',
      lunch: 'Special Royal Thali: Paneer Butter Masala, Chole Bhature, Pulao & Sweet Kheer',
      dinner: 'Light Khichdi / Kadai Paneer, Butter Naan & Sweet Bite',
      special: 'Special Royal Thali: Paneer Butter Masala, Pulao & Sweet Kheer'
    }
  };

  const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' }
  ];

  const getTodayKey = () => {
    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return map[new Date().getDay()];
  };

  // Tiffin details subform & Live Menu Broadcast States
  const [activeMenuDay, setActiveMenuDay] = useState(getTodayKey());
  const [weeklyMenu, setWeeklyMenu] = useState(DEFAULT_WEEKLY_MENU);
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [vegPrice, setVegPrice] = useState('');
  const [nonVegPrice, setNonVegPrice] = useState('');
  const [mealsIncluded, setMealsIncluded] = useState(['Breakfast', 'Lunch', 'Dinner']);
  const [breakfastDish, setBreakfastDish] = useState('Poha, Jalebi / Idli Sambhar & Hot Masala Chai');
  const [lunchDish, setLunchDish] = useState('Dal Tadka, Shahi Paneer, 4 Phulkas, Steamed Rice & Fresh Salad');
  const [dinnerDish, setDinnerDish] = useState('Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis, Jeera Rice & Sweet Gulab Jamun');
  const [sundaySpecialDish, setSundaySpecialDish] = useState('Special Royal Thali: Paneer Butter Masala, Chole Bhature, Pulao & Sweet Kheer');
  const [breakfastImage, setBreakfastImage] = useState('https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80');
  const [lunchImage, setLunchImage] = useState('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80');
  const [dinnerImage, setDinnerImage] = useState('https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80');
  const [sundaySpecialImage, setSundaySpecialImage] = useState('https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80');
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [isPureVeg, setIsPureVeg] = useState(true);
  const [tiffinServiceRadius, setTiffinServiceRadius] = useState('5');
  const [todaySpecialDish, setTodaySpecialDish] = useState('');
  const [selectedTiffinBranchId, setSelectedTiffinBranchId] = useState(null);
  const [selectedCleaningBranchId, setSelectedCleaningBranchId] = useState(null);

  // Cleaning & Laundry details subform
  const [pricePerKg, setPricePerKg] = useState('');
  const [roomCleanRate, setRoomCleanRate] = useState('');
  const [bathroomCleanRate, setBathroomCleanRate] = useState('');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  
  // Response modal states
  const [responseMsg, setResponseMsg] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [inquiryFilter, setInquiryFilter] = useState('All');

  // Quick Action notification banner
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Operational Data for Tiffin Subscribers & Cleaning Orders (Starts empty, populated ONLY by real user data)
  const [tiffinSubscribers, setTiffinSubscribers] = useState([]);
  const [cleaningBookings, setCleaningBookings] = useState([]);
  const [hostelRooms, setHostelRooms] = useState([]);
  const [pgRooms, setPgRooms] = useState([]);
  const [flatUnits, setFlatUnits] = useState([]);

  const handleToggleRoomStatus = async (roomId, explicitDelta = null) => {
    let target = null;
    let nextRooms = [];

    setHostelRooms(prev => {
      nextRooms = prev.map(r => {
        if (r.id === roomId) {
          let newAvail;
          if (explicitDelta !== null) {
            newAvail = Math.max(0, Math.min(r.totalBeds, (r.availableBeds ?? 0) + explicitDelta));
          } else {
            const isCurrentlyVacant = r.status === 'Available' && r.availableBeds > 0;
            newAvail = isCurrentlyVacant ? 0 : r.totalBeds;
          }
          const isAvail = newAvail > 0;
          target = {
            ...r,
            availableBeds: newAvail,
            status: isAvail ? 'Available' : 'Occupied',
            occupant: isAvail ? 'Vacant Bed' : 'Reserved Bed',
            dueStatus: isAvail ? 'Open for Booking' : 'Due on 1st'
          };
          return target;
        }
        return r;
      });
      return nextRooms;
    });

    if (!target) return;

    setActionSuccessMsg(
      target.availableBeds > 0
        ? `✓ ${target.roomNo}: ${target.availableBeds}/${target.totalBeds} beds vacant (Live on StaySync)`
        : `✓ ${target.roomNo}: Marked Occupied (Live on StaySync)`
    );
    setTimeout(() => setActionSuccessMsg(''), 4000);

    try {
      const propId = target.propertyId;
      if (propId) {
        const currentProp = listings.find(l => (l._id || l.id) === propId);
        if (currentProp) {
          const propRooms = nextRooms.filter(r => r.propertyId === propId);
          const updatedTiers = propRooms.map(r => ({
            roomType: r.roomNo || r.type,
            occupancy: r.totalBeds || 1,
            rentPerPerson: parseInt((r.rent || '').replace(/[^\d]/g, '')) || currentProp.monthlyRent || 6000,
            totalBeds: r.totalBeds || 1,
            availableBeds: r.availableBeds,
            isAvailable: r.availableBeds > 0
          }));

          const totalAvail = updatedTiers.reduce((sum, t) => sum + (t.availableBeds || 0), 0);
          const totalCapacity = updatedTiers.reduce((sum, t) => sum + (t.totalBeds || 1), 0);

          await propertiesAPI.updateProperty(propId, {
            roomTiers: updatedTiers,
            availableBeds: totalAvail,
            totalBeds: totalCapacity,
            isAvailable: totalAvail > 0
          });

          setListings(prev => prev.map(p => {
            if ((p._id || p.id) === propId) {
              return {
                ...p,
                roomTiers: updatedTiers,
                availableBeds: totalAvail,
                totalBeds: totalCapacity,
                isAvailable: totalAvail > 0
              };
            }
            return p;
          }));
        }
      }
    } catch (err) {
      console.error('Failed to sync hostel vacancy with server:', err);
    }
  };

  const handleTogglePgBed = async (bedId, explicitDelta = null) => {
    let target = null;
    let nextRooms = [];

    setPgRooms(prev => {
      nextRooms = prev.map(b => {
        if (b.id === bedId) {
          let newAvail;
          if (explicitDelta !== null) {
            newAvail = Math.max(0, Math.min(b.totalBeds, (b.availableBeds ?? 0) + explicitDelta));
          } else {
            const isCurrentlyVacant = b.status === 'Available' && b.availableBeds > 0;
            newAvail = isCurrentlyVacant ? 0 : b.totalBeds;
          }
          const isAvail = newAvail > 0;
          target = {
            ...b,
            availableBeds: newAvail,
            status: isAvail ? 'Available' : 'Occupied',
            occupant: isAvail ? 'Vacant Bed' : 'Reserved Bed',
            dueStatus: isAvail ? 'Open for Booking' : 'Paid'
          };
          return target;
        }
        return b;
      });
      return nextRooms;
    });

    if (!target) return;

    setActionSuccessMsg(
      target.availableBeds > 0
        ? `✓ ${target.roomNo}: ${target.availableBeds}/${target.totalBeds} beds vacant (Live on StaySync)`
        : `✓ ${target.roomNo}: Marked Occupied (Live on StaySync)`
    );
    setTimeout(() => setActionSuccessMsg(''), 4000);

    // Persist to MongoDB
    try {
      const propId = target.propertyId;
      if (propId) {
        const currentProp = listings.find(l => (l._id || l.id) === propId);
        if (currentProp) {
          const propRooms = nextRooms.filter(r => r.propertyId === propId);
          const updatedTiers = propRooms.map(r => ({
            roomType: r.roomNo || r.type,
            occupancy: r.totalBeds || 1,
            rentPerPerson: parseInt((r.rent || '').replace(/[^\d]/g, '')) || currentProp.monthlyRent || 7000,
            totalBeds: r.totalBeds || 1,
            availableBeds: r.availableBeds,
            isAvailable: r.availableBeds > 0
          }));

          const totalAvail = updatedTiers.reduce((sum, t) => sum + (t.availableBeds || 0), 0);
          const totalCapacity = updatedTiers.reduce((sum, t) => sum + (t.totalBeds || 1), 0);

          await propertiesAPI.updateProperty(propId, {
            roomTiers: updatedTiers,
            availableBeds: totalAvail,
            totalBeds: totalCapacity,
            isAvailable: totalAvail > 0
          });

          // Sync into listings state so operational metrics update dynamically
          setListings(prev => prev.map(p => {
            if ((p._id || p.id) === propId) {
              return {
                ...p,
                roomTiers: updatedTiers,
                availableBeds: totalAvail,
                totalBeds: totalCapacity,
                isAvailable: totalAvail > 0
              };
            }
            return p;
          }));
        }
      }
    } catch (err) {
      console.error('Failed to sync PG bed vacancy with server:', err);
    }
  };

  const handleToggleFlatUnit = async (unitId) => {
    let target = null;
    let nextUnits = [];

    setFlatUnits(prev => {
      nextUnits = prev.map(u => {
        if (u.id === unitId) {
          const isCurrentlyVacant = u.status === 'Available';
          const newAvail = isCurrentlyVacant ? 0 : 1;
          const isAvail = newAvail > 0;
          target = {
            ...u,
            availableBeds: newAvail,
            status: isAvail ? 'Available' : 'Occupied',
            occupant: isAvail ? 'Vacant Unit' : 'Reserved Unit',
            dueStatus: isAvail ? 'Open for Move-in' : 'Paid'
          };
          return target;
        }
        return u;
      });
      return nextUnits;
    });

    if (!target) return;

    setActionSuccessMsg(
      target.status === 'Available'
        ? `✓ Unit ${target.unitNo || target.roomNo} marked Vacant & broadcasted live!`
        : `✓ Unit ${target.unitNo || target.roomNo} marked Leased / Occupied & broadcasted live!`
    );
    setTimeout(() => setActionSuccessMsg(''), 4000);

    try {
      const propId = target.propertyId;
      if (propId) {
        await propertiesAPI.updateProperty(propId, {
          availableBeds: target.status === 'Available' ? 1 : 0,
          isAvailable: target.status === 'Available'
        });

        setListings(prev => prev.map(p => {
          if ((p._id || p.id) === propId) {
            return {
              ...p,
              availableBeds: target.status === 'Available' ? 1 : 0,
              isAvailable: target.status === 'Available'
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to sync flat vacancy with server:', err);
    }
  };

  const handleAddCustomPgSharing = () => {
    const trimmed = customPgSharing.trim();
    if (!trimmed) return;
    if (!pgSharingTypes.includes(trimmed)) {
      setPgSharingTypes(prev => [...prev, trimmed]);
    }
    setCustomPgSharing('');
  };

  const handleOpenAddPgRoom = () => {
    const pgListing = (activeManagedProperty && activeManagedProperty.propertyType === 'PG') 
      ? activeManagedProperty 
      : (displayedListings.find(l => l.propertyType === 'PG') || displayedListings[0]);
    if (!pgListing) {
      resetForm();
      setShowCreateForm(true);
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }
    const defaultRent = pgListing.monthlyRent || pgListing.rentPerPerson || 7000;
    const nextRoomNum = `Room ${pgRooms.length + 101}`;
    setNewPgRoomName(nextRoomNum);
    setNewPgSharingType('Double Sharing (2 Beds)');
    setNewPgRent(defaultRent.toString());
    setNewPgTotalBeds('2');
    setNewPgAvailableBeds('2');
    setNewPgCustomSharing('');
    setShowAddPgRoomModal(true);
  };

  const handlePgSharingTypeChange = (val) => {
    setNewPgSharingType(val);
    if (val.includes('Single') || val.includes('1')) {
      setNewPgTotalBeds('1');
      setNewPgAvailableBeds('1');
    } else if (val.includes('Double') || val.includes('2')) {
      setNewPgTotalBeds('2');
      setNewPgAvailableBeds('2');
    } else if (val.includes('Triple') || val.includes('3')) {
      setNewPgTotalBeds('3');
      setNewPgAvailableBeds('3');
    } else if (val.includes('4')) {
      setNewPgTotalBeds('4');
      setNewPgAvailableBeds('4');
    }
  };

  const handleAddPgRoomSubmit = async (e) => {
    e.preventDefault();
    setAddingPgRoom(true);

    try {
      const pgListing = (activeManagedProperty && activeManagedProperty.propertyType === 'PG')
        ? activeManagedProperty
        : (displayedListings.find(l => l.propertyType === 'PG') || displayedListings[0]);
      if (!pgListing) {
        alert('Please create your PG listing first.');
        return;
      }

      const propId = pgListing._id || pgListing.id;
      const roomTypeFinal = (newPgSharingType === 'Custom' ? newPgCustomSharing.trim() : newPgSharingType) || 'Double Sharing (2 Beds)';
      const roomNameFinal = newPgRoomName.trim() || roomTypeFinal;
      const totalB = Math.max(1, parseInt(newPgTotalBeds) || 2);
      const availB = Math.max(0, Math.min(totalB, parseInt(newPgAvailableBeds) !== undefined ? parseInt(newPgAvailableBeds) : totalB));
      const rentPerPerson = parseInt(newPgRent) || pgListing.monthlyRent || 7000;

      const newTier = {
        roomType: roomNameFinal,
        occupancy: totalB,
        rentPerPerson,
        totalBeds: totalB,
        availableBeds: availB,
        isAvailable: availB > 0
      };

      const existingTiers = (pgListing.roomTiers && pgListing.roomTiers.length > 0)
        ? [...pgListing.roomTiers]
        : pgRooms.filter(r => r.propertyId === propId).map(r => ({
            roomType: r.roomNo || r.type,
            occupancy: r.totalBeds || 1,
            rentPerPerson: parseInt((r.rent || '').replace(/[^\d]/g, '')) || pgListing.monthlyRent || 7000,
            totalBeds: r.totalBeds || 1,
            availableBeds: r.availableBeds,
            isAvailable: r.availableBeds > 0
          }));

      const updatedTiers = [...existingTiers, newTier];
      const updatedOffered = Array.from(new Set([...(pgListing.roomTypesOffered || []), roomTypeFinal]));
      const totalCapacity = updatedTiers.reduce((sum, t) => sum + (t.totalBeds || 1), 0);
      const totalAvail = updatedTiers.reduce((sum, t) => sum + (t.availableBeds || 0), 0);

      const res = await propertiesAPI.updateProperty(propId, {
        roomTiers: updatedTiers,
        roomTypesOffered: updatedOffered,
        totalBeds: totalCapacity,
        availableBeds: totalAvail,
        isAvailable: totalAvail > 0
      });

      const updatedProp = res.data || {
        ...pgListing,
        roomTiers: updatedTiers,
        roomTypesOffered: updatedOffered,
        totalBeds: totalCapacity,
        availableBeds: totalAvail,
        isAvailable: totalAvail > 0
      };

      setListings(prev => prev.map(p => (p._id || p.id) === propId ? updatedProp : p));
      setShowAddPgRoomModal(false);
      setActionSuccessMsg(`✓ Room "${roomNameFinal}" added to your PG and broadcasted live!`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to add PG room:', err);
      alert(err.response?.data?.message || err.message || 'Failed to add PG room');
    } finally {
      setAddingPgRoom(false);
    }
  };

  const handleDeletePgRoom = async (bedId) => {
    const targetBed = pgRooms.find(b => b.id === bedId);
    if (!targetBed) return;

    if (!window.confirm(`Are you sure you want to remove "${targetBed.roomNo}" from your live PG broadcaster?`)) {
      return;
    }

    try {
      const propId = targetBed.propertyId;
      const currentProp = listings.find(l => (l._id || l.id) === propId);
      if (!currentProp) return;

      const remainingRooms = pgRooms.filter(b => b.id !== bedId && b.propertyId === propId);
      const updatedTiers = remainingRooms.map(r => ({
        roomType: r.roomNo || r.type,
        occupancy: r.totalBeds || 1,
        rentPerPerson: parseInt((r.rent || '').replace(/[^\d]/g, '')) || currentProp.monthlyRent || 7000,
        totalBeds: r.totalBeds || 1,
        availableBeds: r.availableBeds,
        isAvailable: r.availableBeds > 0
      }));

      const totalCapacity = updatedTiers.reduce((sum, t) => sum + (t.totalBeds || 1), 0);
      const totalAvail = updatedTiers.reduce((sum, t) => sum + (t.availableBeds || 0), 0);

      await propertiesAPI.updateProperty(propId, {
        roomTiers: updatedTiers,
        totalBeds: totalCapacity,
        availableBeds: totalAvail,
        isAvailable: totalAvail > 0
      });

      setListings(prev => prev.map(p => {
        if ((p._id || p.id) === propId) {
          return {
            ...p,
            roomTiers: updatedTiers,
            totalBeds: totalCapacity,
            availableBeds: totalAvail,
            isAvailable: totalAvail > 0
          };
        }
        return p;
      }));

      setActionSuccessMsg(`✓ "${targetBed.roomNo}" removed from live broadcaster.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete PG room:', err);
      alert('Failed to remove PG room.');
    }
  };

  const loadProviderData = async () => {
    setLoading(true);
    try {
      // 1. Load active requests
      const reqRes = await requestsAPI.getRequests();
      if (reqRes.success) {
        setRequests(reqRes.data);
      }

      // 2. Load provider's own listings
      const currentUserId = user?._id || user?.id;
      if (user?.role === 'PROPERTY_OWNER' || activeTab === 'property') {
        const propRes = await propertiesAPI.getProperties({});
        if (propRes.success) {
          const ownProps = propRes.data.filter(p => {
            const ownerId = p.owner?._id || p.owner?.id || p.owner;
            return ownerId && currentUserId && ownerId.toString() === currentUserId.toString();
          });
          if (user?.role === 'PROPERTY_OWNER') {
            setListings(ownProps);
            if (user?.propertyType) {
              setPropertyType(user.propertyType);
            } else if (ownProps.length > 0 && ownProps[0].propertyType) {
              setPropertyType(ownProps[0].propertyType);
            }
          } else {
            setListings(ownProps.length > 0 ? ownProps : propRes.data);
          }

          // If there is a hostel in ownProps or listings, sync messMenu into menu states
          const currentHostelProp = (ownProps.length > 0 ? ownProps : propRes.data).find(p => p.propertyType === 'Hostel');
          if (currentHostelProp?.messMenu) {
            const fetchedWeekly = currentHostelProp.messMenu.weeklyMenu || {};
            const mergedWeekly = {
              ...DEFAULT_WEEKLY_MENU,
              ...fetchedWeekly
            };
            setWeeklyMenu(mergedWeekly);
            const dayK = activeMenuDay || getTodayKey();
            const currentDayMenu = mergedWeekly[dayK] || DEFAULT_WEEKLY_MENU[dayK] || {};
            setBreakfastDish(currentDayMenu.breakfast || currentHostelProp.messMenu.breakfast || 'Poha, Jalebi & Masala Chai');
            setLunchDish(currentDayMenu.lunch || currentHostelProp.messMenu.lunch || 'Dal Tadka, Shahi Paneer, 4 Phulkas, Rice & Salad');
            setDinnerDish(currentDayMenu.dinner || currentHostelProp.messMenu.dinner || 'Mix Veg Curry, Yellow Dal, 4 Rotis & Rice');
          }
        }
      } else {
        // Provider role: fetch services (Tiffin and Cleaning only)
        const servRes = await servicesAPI.getServices({});
        if (servRes.success) {
          // Filter to only Tiffin and Cleaning/Laundry
          const validServices = servRes.data.filter(s => 
            s.category === 'Tiffin' || s.category === 'Cleaning' || s.category === 'Laundry'
          );
          const ownServs = validServices.filter(s => {
            const provUserId = s.user?._id || s.user?.id || s.user;
            return provUserId && currentUserId && provUserId.toString() === currentUserId.toString();
          });
          const effectiveListings = ownServs.length > 0 ? ownServs : validServices;
          setListings(effectiveListings);

          // Sync live menu fields for active Tiffin place/branch
          const tiffinServs = effectiveListings.filter(s => s.category === 'Tiffin' || (!s.category && s.tiffinDetails));
          const currentBranchId = selectedTiffinBranchId || (tiffinServs[0]?._id || tiffinServs[0]?.id);
          if (!selectedTiffinBranchId && currentBranchId) {
            setSelectedTiffinBranchId(currentBranchId);
          }
          const tiffinListing = tiffinServs.find(s => (s._id || s.id) === currentBranchId) || tiffinServs[0] || effectiveListings[0];
          if (tiffinListing?.tiffinDetails) {
            if (Array.isArray(tiffinListing.tiffinDetails.meals) && tiffinListing.tiffinDetails.meals.length > 0) {
              setMealsIncluded(tiffinListing.tiffinDetails.meals);
            }
            const fetchedWeekly = tiffinListing.tiffinDetails.weeklyMenu || {};
            const mergedWeekly = {
              ...DEFAULT_WEEKLY_MENU,
              ...fetchedWeekly
            };
            setWeeklyMenu(mergedWeekly);

            const dayK = activeMenuDay || getTodayKey();
            const currentDayMenu = mergedWeekly[dayK] || DEFAULT_WEEKLY_MENU[dayK] || {};
            setBreakfastDish(currentDayMenu.breakfast || tiffinListing.tiffinDetails.breakfast || 'Poha, Jalebi & Masala Chai');
            setLunchDish(currentDayMenu.lunch || tiffinListing.tiffinDetails.lunch || 'Dal Tadka, Shahi Paneer, 4 Phulkas, Rice & Salad');
            setDinnerDish(currentDayMenu.dinner || tiffinListing.tiffinDetails.dinner || 'Mix Veg Curry, Yellow Dal, 4 Rotis & Rice');
            setSundaySpecialDish(currentDayMenu.special || tiffinListing.tiffinDetails.sundaySpecial || 'Special Royal Thali & Sweet Kheer');

            if (tiffinListing.tiffinDetails.breakfastImage) setBreakfastImage(tiffinListing.tiffinDetails.breakfastImage);
            if (tiffinListing.tiffinDetails.lunchImage) setLunchImage(tiffinListing.tiffinDetails.lunchImage);
            if (tiffinListing.tiffinDetails.dinnerImage) setDinnerImage(tiffinListing.tiffinDetails.dinnerImage);
            if (tiffinListing.tiffinDetails.sundaySpecialImage) setSundaySpecialImage(tiffinListing.tiffinDetails.sundaySpecialImage);
          }

          // Sync active Cleaning place/branch
          const clnServs = effectiveListings.filter(s => s.category === 'Cleaning' || s.category === 'Laundry' || (!s.category && s.cleaningDetails));
          const currentClnBranchId = selectedCleaningBranchId || (clnServs[0]?._id || clnServs[0]?.id);
          if (!selectedCleaningBranchId && currentClnBranchId) {
            setSelectedCleaningBranchId(currentClnBranchId);
          }
        }
      }

      // 3. Load provider's payment history
      try {
        setPaymentsLoading(true);
        const payRes = await paymentsAPI.getHistory();
        if (payRes && payRes.success) {
          setPayments(payRes.data || []);
        }
      } catch (pErr) {
        console.error('Failed to load payment history:', pErr);
      } finally {
        setPaymentsLoading(false);
      }

    } catch (err) {
      console.error('Failed to load provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, [user, activeTab]);

  // Handle Day Switch in Weekly Menu
  const handleSelectDay = (dayKey) => {
    // Save current active day's inputs to weeklyMenu state
    const updatedWeekly = {
      ...weeklyMenu,
      [activeMenuDay]: {
        breakfast: breakfastDish,
        lunch: lunchDish,
        dinner: dinnerDish,
        ...(activeMenuDay === 'sunday' ? { special: sundaySpecialDish } : {})
      }
    };
    setWeeklyMenu(updatedWeekly);

    // Switch to new day and load its dishes
    setActiveMenuDay(dayKey);
    const targetDayData = updatedWeekly[dayKey] || DEFAULT_WEEKLY_MENU[dayKey] || {};
    setBreakfastDish(targetDayData.breakfast || '');
    setLunchDish(targetDayData.lunch || '');
    setDinnerDish(targetDayData.dinner || '');
    if (dayKey === 'sunday' && targetDayData.special) {
      setSundaySpecialDish(targetDayData.special);
    }
  };

  // Handle Branch / Center Location Switch (Different places)
  const handleSelectBranch = (branchId) => {
    setSelectedTiffinBranchId(branchId);
    const targetBranch = listings.find(b => (b._id || b.id) === branchId);
    if (targetBranch) {
      const details = targetBranch.tiffinDetails || {};
      if (Array.isArray(details.meals) && details.meals.length > 0) {
        setMealsIncluded(details.meals);
      }
      const branchWeekly = details.weeklyMenu || DEFAULT_WEEKLY_MENU;
      const mergedWeekly = {
        ...DEFAULT_WEEKLY_MENU,
        ...branchWeekly
      };
      setWeeklyMenu(mergedWeekly);
      const dayK = activeMenuDay || getTodayKey();
      const currentDayMenu = mergedWeekly[dayK] || DEFAULT_WEEKLY_MENU[dayK] || {};
      setBreakfastDish(currentDayMenu.breakfast || details.breakfast || 'Poha, Jalebi & Masala Chai');
      setLunchDish(currentDayMenu.lunch || details.lunch || 'Dal Tadka, Shahi Paneer, 4 Phulkas, Rice & Salad');
      setDinnerDish(currentDayMenu.dinner || details.dinner || 'Mix Veg Curry, Yellow Dal, 4 Rotis & Rice');
      setSundaySpecialDish(currentDayMenu.special || details.sundaySpecial || 'Special Royal Thali & Sweet Kheer');
      if (details.breakfastImage) setBreakfastImage(details.breakfastImage);
      if (details.lunchImage) setLunchImage(details.lunchImage);
      if (details.dinnerImage) setDinnerImage(details.dinnerImage);
      if (details.sundaySpecialImage) setSundaySpecialImage(details.sundaySpecialImage);

      const branchName = targetBranch.businessName || targetBranch.address || 'Kitchen Center';
      setActionSuccessMsg(`Managing Menu for: "${branchName}" (${targetBranch.city || 'Hub'})`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  // Handle Cleaning Branch / Center Location Switch (Different places)
  const handleSelectCleaningBranch = (branchId) => {
    setSelectedCleaningBranchId(branchId);
    const targetBranch = listings.find(b => (b._id || b.id) === branchId);
    if (targetBranch) {
      const branchName = targetBranch.businessName || targetBranch.address || 'Cleaning Service Hub';
      setActionSuccessMsg(`Active Cleaning Hub: "${branchName}" (${targetBranch.city || 'Hub'})`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  // Handle Save & Broadcast Live Menu to Customers for the active branch
  const handleSaveMenu = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingMenu(true);
    try {
      const currentTiffin = (selectedTiffinBranchId ? listings.find(l => (l._id || l.id) === selectedTiffinBranchId) : null) || listings.find(l => l.category === 'Tiffin') || listings[0];
      const updatedWeekly = {
        ...weeklyMenu,
        [activeMenuDay]: {
          breakfast: breakfastDish,
          lunch: lunchDish,
          dinner: dinnerDish,
          ...(activeMenuDay === 'sunday' ? { special: sundaySpecialDish } : {})
        }
      };
      setWeeklyMenu(updatedWeekly);

      const todayK = getTodayKey();
      const todayBreakfast = activeMenuDay === todayK ? breakfastDish : (updatedWeekly[todayK]?.breakfast || breakfastDish);
      const todayLunch = activeMenuDay === todayK ? lunchDish : (updatedWeekly[todayK]?.lunch || lunchDish);
      const todayDinner = activeMenuDay === todayK ? dinnerDish : (updatedWeekly[todayK]?.dinner || dinnerDish);
      const sundaySpecial = activeMenuDay === 'sunday' ? sundaySpecialDish : (updatedWeekly.sunday?.special || sundaySpecialDish);

      if (activeTab === 'property' || isHostel) {
        const currentHostel = (editingPropertyId ? listings.find(l => (l._id || l.id) === editingPropertyId) : null) || listings.find(l => l.propertyType === 'Hostel') || listings[0];
        if (currentHostel?._id) {
          const payload = {
            foodAvailable: true,
            messMenu: {
              breakfast: todayBreakfast,
              lunch: todayLunch,
              dinner: todayDinner,
              weeklyMenu: updatedWeekly
            }
          };
          const res = await propertiesAPI.updateProperty(currentHostel._id, payload);
          if (res.success || res.property || res.data) {
            const dayName = DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label || activeMenuDay;
            const hostelName = currentHostel.title || currentHostel.businessName || 'Hostel Mess';
            setActionSuccessMsg(`[${hostelName}] ${dayName}'s Mess Menu (Breakfast, Lunch, Dinner) saved successfully!`);
            setIsEditingMenu(false);
            setTimeout(() => setActionSuccessMsg(''), 5000);
            loadProviderData();
          }
        } else {
          setActionSuccessMsg('Hostel mess menu updated in preview! Publish your hostel listing below to make it permanent.');
          setIsEditingMenu(false);
          setTimeout(() => setActionSuccessMsg(''), 5000);
        }
      } else if (currentTiffin?._id) {
        const payload = {
          tiffinDetails: {
            ...(currentTiffin.tiffinDetails || {}),
            meals: mealsIncluded,
            breakfast: todayBreakfast,
            lunch: todayLunch,
            dinner: todayDinner,
            sundaySpecial: sundaySpecial,
            weeklyMenu: updatedWeekly,
            breakfastImage: breakfastImage,
            lunchImage: lunchImage,
            dinnerImage: dinnerImage,
            sundaySpecialImage: sundaySpecialImage,
            menu: {
              ...(currentTiffin.tiffinDetails?.menu || {}),
              breakfast: todayBreakfast,
              lunch: todayLunch,
              dinner: todayDinner,
              sundaySpecial: sundaySpecial,
              monday: updatedWeekly.monday?.lunch || todayLunch,
              tuesday: updatedWeekly.tuesday?.lunch,
              wednesday: updatedWeekly.wednesday?.lunch,
              thursday: updatedWeekly.thursday?.lunch,
              friday: updatedWeekly.friday?.lunch,
              saturday: updatedWeekly.saturday?.lunch,
              sunday: updatedWeekly.sunday?.special || updatedWeekly.sunday?.lunch || sundaySpecial
            }
          }
        };
        const res = await servicesAPI.updateService(currentTiffin._id, payload);
        if (res.success) {
          const dayName = DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label || activeMenuDay;
          const branchName = currentTiffin.businessName || currentTiffin.address || 'Kitchen Center';
          setActionSuccessMsg(`[${branchName} - ${currentTiffin.city || 'Hub'}] ${dayName}'s Menu & Schedule saved successfully!`);
          setIsEditingMenu(false);
          setTimeout(() => setActionSuccessMsg(''), 5000);
          loadProviderData();
        }
      } else {
        setActionSuccessMsg('Menu updated in preview! Add a tiffin branch below to make it permanent.');
        setIsEditingMenu(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update live menu');
    } finally {
      setSavingMenu(false);
    }
  };

  // Handle Request Status update (Accept/Reject/Checked In/Completed)
  const handleUpdateStatus = async (reqId, newStatus) => {
    try {
      let res;
      try {
        res = await bookingsAPI.updateStatus(reqId, {
          status: newStatus,
          responseMessage: responseMsg || (newStatus === 'Accepted' ? 'Confirmed and added to schedule.' : 'Slot not available.')
        });
      } catch (bkErr) {
        // Fallback to legacy request status endpoint
        res = await requestsAPI.updateRequestStatus(reqId, {
          status: newStatus,
          responseMessage: responseMsg || (newStatus === 'Accepted' ? 'Confirmed and added to schedule.' : 'Slot not available.')
        });
      }

      if (res.success) {
        setSelectedReq(null);
        setResponseMsg('');
        setActionSuccessMsg(`Booking status updated to ${newStatus}!`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        loadProviderData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const resetForm = () => {
    setEditingPropertyId(null);
    setTitle('');
    setBusinessName('');
    setDescription('');
    setAddress('');
    setCity(searchParams.get('city') || user?.currentCity || user?.preferredCity || user?.city || '');
    setMonthlyRent('');
    setSecurityDeposit('');
    setHostelCategory('Girls & Boys Hostel');
    setRoomType('2-Seater Room');
    setPropertyType(user?.propertyType || 'Hostel');
    setServiceCategory(activeTab === 'cleaning' ? 'Cleaning' : 'Tiffin');
    setFoodAvailable(true);
    setSelectedAmenities([]);
    setCustomAmenities([]);
    setHostelCurfew('10:30 PM');
    setPhotoUrl('');
    setPropertyPhotos([]);
    setMonthlyPrice('');
    setVegPrice('');
    setNonVegPrice('');
    setIsPureVeg(true);
    setTiffinServiceRadius('5');
    setTodaySpecialDish('');
    setPricePerKg('');
    setRoomCleanRate('');
    setBathroomCleanRate('');
    setTier1Active(true);
    setTier1Rent('8500');
    setTier1AvailableBeds('1');
    setTier2Active(true);
    setTier2Rent('6000');
    setTier2AvailableBeds('2');
    setTier3Active(true);
    setTier3Rent('4500');
    setTier3AvailableBeds('3');
    setTier3TotalBeds('3');
    setTotalHostelBeds('20');
    setAvailableHostelBeds('5');
    setPgSharingTypes(['Single Room (Private)', 'Double Sharing (2 Beds)']);
    setPgFoodPolicy('3 Meals Included');
    setPgNoticePeriod('1 Month');
    setPgCurfew('No Curfew (24x7)');
    setRoomSubtype('1 BHK Flat');
    setFurnishing('Fully Furnished');
    setPreferredTenants('Any / All Welcome');
    setMaintenanceCharges('0');
    setElectricityCharges('As per meter unit');
    setFloorNumber('1st Floor');
    setKitchenType('Dedicated Private Kitchen');
    setLocality('');
    setArea('');
    setLandmark('');
    setStateLoc('Madhya Pradesh');
    setPincode('');
    setPropLatitude('');
    setPropLongitude('');
    setLocationVisibility('public');
  };

  const handleEditProperty = (prop) => {
    setEditingPropertyId(prop._id);
    setTitle(prop.title || '');
    setPropertyType(prop.propertyType || 'Hostel');
    setHostelCategory(prop.hostelCategory || 'Girls & Boys Hostel');
    setCity(prop.city || user?.currentCity || user?.preferredCity || user?.city || '');
    setAddress(prop.address || '');
    setLocality(prop.location?.locality || '');
    setArea(prop.location?.area || '');
    setLandmark(prop.location?.landmark || '');
    setStateLoc(prop.location?.state || 'Madhya Pradesh');
    setPincode(prop.location?.pincode || '');
    setPropLatitude(prop.location?.coordinates?.[1] || prop.latitude || '');
    setPropLongitude(prop.location?.coordinates?.[0] || prop.longitude || '');
    setLocationVisibility(prop.location?.visibility || 'public');
    setSecurityDeposit(prop.securityDeposit?.toString() || '');
    setFoodAvailable(prop.foodAvailable !== undefined ? prop.foodAvailable : true);
    setHostelCurfew(prop.gateTiming || '10:30 PM');
    setDescription(prop.description || '');
    if (prop.photos && Array.isArray(prop.photos) && prop.photos.length > 0) {
      setPropertyPhotos(prop.photos);
      setPhotoUrl(prop.photos[0] || '');
    } else {
      setPropertyPhotos([]);
      setPhotoUrl('');
    }
    if (prop.amenities && Array.isArray(prop.amenities)) {
      setSelectedAmenities(prop.amenities);
      const defaultKnown = new Set([
        ...DEFAULT_HOSTEL_AMENITIES,
        ...DEFAULT_PG_AMENITIES,
        ...DEFAULT_FLAT_AMENITIES
      ]);
      const loadedCustoms = prop.amenities.filter(a => !defaultKnown.has(a));
      setCustomAmenities(loadedCustoms);
    }

    if (prop.propertyType === 'Hostel') {
      const hTotalBeds = prop.totalBeds || (prop.roomTiers && prop.roomTiers.length > 0 ? prop.roomTiers.reduce((s, t) => s + (parseInt(t.totalBeds) || 1), 0) : 20);
      const hAvailBeds = prop.availableBeds !== undefined ? prop.availableBeds : (prop.roomTiers && prop.roomTiers.length > 0 ? prop.roomTiers.reduce((s, t) => s + (parseInt(t.availableBeds) || 0), 0) : 5);
      const hRent = prop.monthlyRent || prop.rentPerPerson || (prop.roomTiers && prop.roomTiers[0]?.rentPerPerson) || 6000;
      setTotalHostelBeds(hTotalBeds.toString());
      setAvailableHostelBeds(hAvailBeds.toString());
      setMonthlyRent(hRent.toString());
      if (prop.foodAvailable !== undefined) setFoodAvailable(prop.foodAvailable);
      if (prop.messMenu) {
        if (prop.messMenu.breakfast) setBreakfastDish(prop.messMenu.breakfast);
        if (prop.messMenu.lunch) setLunchDish(prop.messMenu.lunch);
        if (prop.messMenu.dinner) setDinnerDish(prop.messMenu.dinner);
        if (prop.messMenu.weeklyMenu) setWeeklyMenu(prop.messMenu.weeklyMenu);
      }
    } else if (prop.propertyType === 'PG') {
      setMonthlyRent(prop.monthlyRent?.toString() || prop.rentPerPerson?.toString() || '7000');
      if (prop.foodPolicy) setPgFoodPolicy(prop.foodPolicy);
      if (prop.noticePeriod) setPgNoticePeriod(prop.noticePeriod);
      if (prop.gateTiming) setPgCurfew(prop.gateTiming);
      if (prop.roomTypesOffered && prop.roomTypesOffered.length > 0) {
        setPgSharingTypes(prop.roomTypesOffered);
      }
    } else if (prop.propertyType === 'Room' || prop.propertyType === 'Flat') {
      setMonthlyRent(prop.monthlyRent?.toString() || '8500');
      if (prop.roomType) setRoomSubtype(prop.roomType);
      if (prop.furnishing) setFurnishing(prop.furnishing);
      if (prop.preferredTenants) setPreferredTenants(prop.preferredTenants);
      if (prop.maintenanceCharges !== undefined) setMaintenanceCharges(prop.maintenanceCharges.toString());
      if (prop.electricityCharges) setElectricityCharges(prop.electricityCharges);
      if (prop.floorNumber) setFloorNumber(prop.floorNumber);
      if (prop.kitchenType) setKitchenType(prop.kitchenType);
    }

    if (prop.roomTiers && prop.roomTiers.length > 0) {
      const t1 = prop.roomTiers.find(t => t.roomType?.includes('1-Seater'));
      if (t1) {
        setTier1Active(true);
        setTier1Rent(t1.rentPerPerson?.toString() || '8500');
        setTier1AvailableBeds(t1.availableBeds?.toString() || '1');
        setTier1TotalBeds(t1.totalBeds?.toString() || '1');
      } else {
        setTier1Active(false);
      }
      const t2 = prop.roomTiers.find(t => t.roomType?.includes('2-Seater'));
      if (t2) {
        setTier2Active(true);
        setTier2Rent(t2.rentPerPerson?.toString() || '6000');
        setTier2AvailableBeds(t2.availableBeds?.toString() || '2');
        setTier2TotalBeds(t2.totalBeds?.toString() || '2');
      } else {
        setTier2Active(false);
      }
      const t3 = prop.roomTiers.find(t => t.roomType?.includes('3-Seater'));
      if (t3) {
        setTier3Active(true);
        setTier3Rent(t3.rentPerPerson?.toString() || '4500');
        setTier3AvailableBeds(t3.availableBeds?.toString() || '3');
        setTier3TotalBeds(t3.totalBeds?.toString() || '3');
      } else {
        setTier3Active(false);
      }
    }
    setShowCreateForm(true);
  };

  const handleEditService = (service) => {
    resetForm();
    setEditingPropertyId(service._id || service.id);
    setBusinessName(service.businessName || '');
    setCity(service.city || user?.currentCity || user?.preferredCity || user?.city || '');
    setAddress(service.address || '');
    setPhotoUrl(service.photos?.[0] || service.photoUrl || '');
    if (service.photos && Array.isArray(service.photos) && service.photos.length > 0) {
      setPropertyPhotos(service.photos);
    } else if (service.photoUrl) {
      setPropertyPhotos([service.photoUrl]);
    } else {
      setPropertyPhotos([]);
    }
    
    if (service.category === 'Tiffin') {
      setActiveTab('tiffin');
      setServiceCategory('Tiffin');
      if (service.tiffinDetails) {
        setMonthlyPrice(service.tiffinDetails.monthlyPrice?.toString() || '3200');
        setVegPrice(service.tiffinDetails.vegPrice?.toString() || '90');
        setNonVegPrice(service.tiffinDetails.nonVegPrice?.toString() || '');
        if (Array.isArray(service.tiffinDetails.meals) && service.tiffinDetails.meals.length > 0) {
          setMealsIncluded(service.tiffinDetails.meals);
        }
        setIsPureVeg(service.tiffinDetails.isPureVeg !== false);
      }
      if (service.serviceRadius) {
        setTiffinServiceRadius(service.serviceRadius.toString());
      }
    } else {
      setActiveTab('cleaning');
      setServiceCategory(service.category || 'Cleaning');
      if (service.cleaningDetails?.priceMap) {
        const pm = service.cleaningDetails.priceMap;
        setRoomCleanRate((pm['Regular Room'] || pm.get?.('Regular Room'))?.toString() || '250');
        setBathroomCleanRate((pm['Bathroom'] || pm.get?.('Bathroom'))?.toString() || '200');
      }
      if (service.laundryDetails) {
        setPricePerKg(service.laundryDetails.pricePerKg?.toString() || '55');
      }
    }
    setShowCreateForm(true);
  };

  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName || 'this offering'}"?`)) {
      return;
    }
    try {
      const res = await servicesAPI.deleteService(serviceId);
      if (res.success || res.message) {
        setActionSuccessMsg(`✓ Offering removed successfully.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        loadProviderData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete service');
    }
  };

  // Submit Listing creation
  const handleCreateListing = async (e) => {
    e.preventDefault();

    try {
      if (user?.role === 'PROPERTY_OWNER' || activeTab === 'property') {
        const configuredTiers = [];
        if (tier1Active && tier1Rent) {
          configuredTiers.push({
            roomType: '1-Seater Room',
            occupancy: 1,
            rentPerPerson: parseInt(tier1Rent),
            availableBeds: parseInt(tier1AvailableBeds) || 1,
            totalBeds: parseInt(tier1TotalBeds) || 1,
            isAvailable: true
          });
        }
        if (tier2Active && tier2Rent) {
          configuredTiers.push({
            roomType: '2-Seater Room',
            occupancy: 2,
            rentPerPerson: parseInt(tier2Rent),
            availableBeds: parseInt(tier2AvailableBeds) || 2,
            totalBeds: parseInt(tier2TotalBeds) || 2,
            isAvailable: true
          });
        }
        if (tier3Active && tier3Rent) {
          configuredTiers.push({
            roomType: '3-Seater Room',
            occupancy: 3,
            rentPerPerson: parseInt(tier3Rent),
            availableBeds: parseInt(tier3AvailableBeds) || 3,
            totalBeds: parseInt(tier3TotalBeds) || 3,
            isAvailable: true
          });
        }

        const primaryTier = configuredTiers[0] || {
          roomType: '2-Seater Room',
          occupancy: 2,
          rentPerPerson: parseInt(monthlyRent) || 6000,
          availableBeds: 2,
          totalBeds: 2
        };

        const defaultFallbackPhoto = propertyType === 'PG'
          ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'
          : (propertyType === 'Room' || propertyType === 'Flat')
          ? 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'
          : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600';

        const finalPhotos = propertyPhotos.length > 0
          ? propertyPhotos.map(p => normalizeImageUrl(p))
          : (photoUrl ? [normalizeImageUrl(photoUrl)] : [defaultFallbackPhoto]);

        let payload;
        if (propertyType === 'Hostel') {
          const totalBedsNum = Math.max(1, parseInt(totalHostelBeds) || 20);
          const availBedsNum = (availableHostelBeds !== '' && !isNaN(parseInt(availableHostelBeds)))
            ? Math.max(0, Math.min(parseInt(availableHostelBeds), totalBedsNum))
            : Math.min(5, totalBedsNum);
          const rentVal = Math.max(1, parseInt(monthlyRent) || 6000);

          const hostelTiers = [
            {
              roomType: 'Hostel Bed',
              occupancy: 1,
              rentPerPerson: rentVal,
              availableBeds: availBedsNum,
              totalBeds: totalBedsNum,
              isAvailable: availBedsNum > 0
            }
          ];

          payload = {
            title,
            description: description || `Well maintained ${hostelCategory} located at ${address}, ${city}. Includes food and modern amenities.`,
            propertyType: 'Hostel',
            hostelCategory,
            address,
            city,
            location: {
              address,
              city,
              locality: locality || '',
              area: area || '',
              landmark: landmark || '',
              state: stateLoc || 'Madhya Pradesh',
              pincode: pincode || '',
              type: 'Point',
              coordinates: [parseFloat(propLongitude) || 75.8577, parseFloat(propLatitude) || 22.7196],
              visibility: locationVisibility || 'public',
              formattedAddress: [address, locality, city, stateLoc || 'Madhya Pradesh'].filter(Boolean).join(', ')
            },
            latitude: parseFloat(propLatitude) || 22.7196,
            longitude: parseFloat(propLongitude) || 75.8577,
            monthlyRent: rentVal,
            rentPerPerson: rentVal,
            securityDeposit: securityDeposit ? parseInt(securityDeposit) : rentVal,
            roomType: 'Hostel Bed',
            occupancy: 1,
            availableBeds: availBedsNum,
            totalBeds: totalBedsNum,
            roomTiers: hostelTiers,
            foodAvailable,
            gateTiming: hostelCurfew,
            amenities: selectedAmenities,
            photos: finalPhotos,
            messMenu: {
              breakfast: breakfastDish || 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
              lunch: lunchDish || 'Dal Tadka, Shahi Paneer, 4 Butter Phulkas, Steamed Rice & Green Salad',
              dinner: dinnerDish || 'Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis & Jeera Rice',
              weeklyMenu: weeklyMenu || {}
            }
          };
        } else if (propertyType === 'PG') {
          const pgRentVal = parseInt(monthlyRent) || 7000;
          const sharingList = pgSharingTypes.length > 0 ? pgSharingTypes : ['Single Room (Private)', 'Double Sharing (2 Beds)'];
          
          const existingProp = listings.find(l => (l._id || l.id) === editingPropertyId);
          const pgTiers = sharingList.map((st) => {
            const isSingle = st.includes('Single') || st.includes('1');
            const isTriple = st.includes('Triple') || st.includes('3');
            const is4 = st.includes('4');
            const occ = isSingle ? 1 : isTriple ? 3 : is4 ? 4 : 2;
            const tRent = isSingle ? Math.round(pgRentVal * 1.25 / 100) * 100 : isTriple ? Math.round(pgRentVal * 0.85 / 100) * 100 : is4 ? Math.round(pgRentVal * 0.75 / 100) * 100 : pgRentVal;
            
            const existingTier = (existingProp?.roomTiers || []).find(t => t.roomType === st);
            const totalBeds = existingTier?.totalBeds || occ;
            const availableBeds = existingTier?.availableBeds !== undefined 
              ? Math.min(existingTier.availableBeds, totalBeds) 
              : totalBeds;

            return {
              roomType: st,
              occupancy: occ,
              rentPerPerson: tRent,
              totalBeds,
              availableBeds,
              isAvailable: availableBeds > 0
            };
          });

          const calculatedTotalBeds = pgTiers.reduce((sum, t) => sum + t.totalBeds, 0);
          const calculatedAvailBeds = pgTiers.reduce((sum, t) => sum + t.availableBeds, 0);

          payload = {
            title,
            description: description || `Comfortable and modern PG accommodation for ${hostelCategory} situated at ${address}, ${city}.`,
            propertyType: 'PG',
            hostelCategory,
            address,
            city,
            location: {
              address,
              city,
              locality: locality || '',
              area: area || '',
              landmark: landmark || '',
              state: stateLoc || 'Madhya Pradesh',
              pincode: pincode || '',
              type: 'Point',
              coordinates: [parseFloat(propLongitude) || 75.8577, parseFloat(propLatitude) || 22.7196],
              visibility: locationVisibility || 'public',
              formattedAddress: [address, locality, city, stateLoc || 'Madhya Pradesh'].filter(Boolean).join(', ')
            },
            latitude: parseFloat(propLatitude) || 22.7196,
            longitude: parseFloat(propLongitude) || 75.8577,
            monthlyRent: pgRentVal,
            rentPerPerson: pgRentVal,
            securityDeposit: securityDeposit ? parseInt(securityDeposit) : pgRentVal,
            roomType: pgSharingTypes[0] || 'Double Sharing (2 Beds)',
            roomTypesOffered: pgSharingTypes,
            roomTiers: pgTiers,
            occupancy: 2,
            totalBeds: calculatedTotalBeds,
            availableBeds: calculatedAvailBeds,
            foodAvailable: pgFoodPolicy.includes('Included'),
            foodPolicy: pgFoodPolicy,
            noticePeriod: pgNoticePeriod,
            gateTiming: pgCurfew,
            amenities: selectedAmenities,
            photos: finalPhotos
          };
        } else {
          // Room / Flat
          const rentVal = parseInt(monthlyRent) || 8500;
          const flatTiers = [
            {
              roomType: roomSubtype,
              occupancy: roomSubtype.includes('2 BHK') ? 2 : 1,
              rentPerPerson: rentVal,
              totalBeds: 1,
              availableBeds: 1,
              isAvailable: true
            }
          ];
          payload = {
            title,
            description: description || `Independent ${roomSubtype} (${furnishing}) located at ${address}, ${city}.`,
            propertyType: roomSubtype.includes('Flat') ? 'Flat' : 'Room',
            hostelCategory: preferredTenants.includes('Girls') ? 'Girls Hostel' : 'Girls & Boys Hostel',
            address,
            city,
            location: {
              address,
              city,
              locality: locality || '',
              area: area || '',
              landmark: landmark || '',
              state: stateLoc || 'Madhya Pradesh',
              pincode: pincode || '',
              type: 'Point',
              coordinates: [parseFloat(propLongitude) || 75.8577, parseFloat(propLatitude) || 22.7196],
              visibility: locationVisibility || 'public',
              formattedAddress: [address, locality, city, stateLoc || 'Madhya Pradesh'].filter(Boolean).join(', ')
            },
            latitude: parseFloat(propLatitude) || 22.7196,
            longitude: parseFloat(propLongitude) || 75.8577,
            monthlyRent: rentVal,
            rentPerPerson: rentVal,
            securityDeposit: securityDeposit ? parseInt(securityDeposit) : rentVal,
            roomType: roomSubtype,
            roomTiers: flatTiers,
            occupancy: roomSubtype.includes('2 BHK') ? 2 : 1,
            totalBeds: 1,
            availableBeds: 1,
            furnishing,
            preferredTenants,
            maintenanceCharges: parseInt(maintenanceCharges) || 0,
            electricityCharges,
            floorNumber,
            kitchenType,
            foodAvailable: false,
            amenities: selectedAmenities,
            photos: finalPhotos
          };
        }

        let res;
        if (editingPropertyId) {
          res = await propertiesAPI.updateProperty(editingPropertyId, payload);
        } else {
          res = await propertiesAPI.createProperty(payload);
        }
        if (res.success) {
          const wasEditing = Boolean(editingPropertyId);
          resetForm();
          setShowCreateForm(false);
          setActionSuccessMsg(`✓ ${propertyType} listing ${wasEditing ? 'updated' : 'published'} successfully!`);
          setTimeout(() => setActionSuccessMsg(''), 4000);
          loadProviderData();
        }
      } else {
        // Tiffin or Cleaning Service Provider
        const cat = activeTab === 'cleaning' ? (serviceCategory === 'Laundry' ? 'Laundry' : 'Cleaning') : 'Tiffin';
        const branchIndex = listings.length;
        const defaultCatPhoto = cat === 'Tiffin'
          ? DEFAULT_TIFFIN_PHOTOS[branchIndex % DEFAULT_TIFFIN_PHOTOS.length]
          : cat === 'Laundry'
          ? DEFAULT_CLEANING_PHOTOS[(branchIndex + 2) % DEFAULT_CLEANING_PHOTOS.length]
          : DEFAULT_CLEANING_PHOTOS[branchIndex % DEFAULT_CLEANING_PHOTOS.length];

        const finalPhotos = propertyPhotos.length > 0
          ? propertyPhotos.map(p => normalizeImageUrl(p))
          : (photoUrl ? [normalizeImageUrl(photoUrl)] : [defaultCatPhoto]);

        const payload = {
          businessName: businessName || (cat === 'Tiffin' ? 'Home Kitchen Tiffin Express' : 'SmartClean Services'),
          category: cat,
          description: description || (cat === 'Tiffin' 
            ? 'Fresh, hygienic, pure home-cooked breakfast, lunch and dinner delivered hot to your doorstep daily.'
            : 'Professional room deep cleaning, bathroom sanitization and doorstep per-kg laundry wash.'),
          address: address || (user?.currentCity ? `Central Hub, ${user.currentCity}` : (city ? `Central Hub, ${city}` : 'Main Center')),
          city: city || user?.currentCity || user?.preferredCity || user?.city || 'Local',
          serviceRadius: parseInt(tiffinServiceRadius) || 5,
          photos: finalPhotos,
          photoUrl: finalPhotos[0],
          tiffinDetails: cat === 'Tiffin' ? (() => {
            const existingBranch = editingPropertyId ? listings.find(l => (l._id || l.id) === editingPropertyId) : null;
            const existingWeekly = existingBranch?.tiffinDetails?.weeklyMenu;
            const existingMenu = existingBranch?.tiffinDetails?.menu;
            return {
              isPureVeg: isPureVeg,
              vegPrice: vegPrice ? parseInt(vegPrice) : 90,
              nonVegPrice: nonVegPrice ? parseInt(nonVegPrice) : (isPureVeg ? undefined : 130),
              monthlyPrice: monthlyPrice ? parseInt(monthlyPrice) : 3200,
              meals: mealsIncluded,
              weeklyMenu: existingWeekly || weeklyMenu || DEFAULT_WEEKLY_MENU,
              breakfast: breakfastDish || existingBranch?.tiffinDetails?.breakfast,
              lunch: lunchDish || existingBranch?.tiffinDetails?.lunch,
              dinner: dinnerDish || existingBranch?.tiffinDetails?.dinner,
              sundaySpecial: sundaySpecialDish || existingBranch?.tiffinDetails?.sundaySpecial,
              menu: existingMenu || {
                breakfast: breakfastDish,
                lunch: lunchDish,
                dinner: dinnerDish,
                sundaySpecial: sundaySpecialDish,
                monday: lunchDish,
                tuesday: 'Rajma Masala, Aloo Gobi, 4 Rotis, Jeera Rice',
                wednesday: 'Chole, Mix Veg Sabzi, 4 Rotis, Steamed Rice',
                thursday: 'Kadhi Pakoda, Bhindi Masala, 4 Rotis, Rice',
                friday: 'Dal Makhani, Shahi Paneer, 4 Butter Rotis, Pulao',
                saturday: 'Sev Tamatar, Yellow Dal, 4 Rotis, Rice',
                sunday: sundaySpecialDish
              }
            };
          })() : undefined,
          cleaningDetails: cat === 'Cleaning' ? {
            services: ['Regular Room', 'Bathroom Sanitization', 'Deep Clean'],
            priceMap: {
              'Regular Room': roomCleanRate ? parseInt(roomCleanRate) : 250,
              'Bathroom': bathroomCleanRate ? parseInt(bathroomCleanRate) : 200,
              'Deep Clean': 500
            }
          } : undefined,
          laundryDetails: (cat === 'Cleaning' || cat === 'Laundry') ? {
            pricePerKg: pricePerKg ? parseInt(pricePerKg) : 55,
            ironingPrice: 8,
            pickupAvailable: pickupAvailable,
            turnaroundHours: 24
          } : undefined
        };

        let res;
        if (editingPropertyId) {
          res = await servicesAPI.updateService(editingPropertyId, payload);
        } else {
          res = await servicesAPI.createService(payload);
        }
        if (res.success) {
          const wasEditing = Boolean(editingPropertyId);
          const savedBranchId = res.data?._id || res.data?.id;
          if (cat === 'Tiffin' && savedBranchId) {
            setSelectedTiffinBranchId(savedBranchId);
          }
          if ((cat === 'Cleaning' || cat === 'Laundry') && savedBranchId) {
            setSelectedCleaningBranchId(savedBranchId);
          }
          resetForm();
          setShowCreateForm(false);
          setActionSuccessMsg(
            cat === 'Tiffin'
              ? `✓ Tiffin Branch [${payload.businessName || 'Kitchen Center'} - ${payload.city || 'Hub'}] ${wasEditing ? 'updated' : 'published'} successfully!`
              : (cat === 'Cleaning' || cat === 'Laundry')
              ? `✓ Cleaning Hub [${payload.businessName || 'Cleaning Service Hub'} - ${payload.city || 'Hub'}] ${wasEditing ? 'updated' : 'published'} successfully!`
              : `✓ ${cat} offering ${wasEditing ? 'updated' : 'published'} successfully!`
          );
          setTimeout(() => setActionSuccessMsg(''), 4000);
          loadProviderData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response?.data : err.message) || 'Failed to create listing';
      alert(msg);
    }
  };

  // Helper to reliably display pricing and never print undefined
  const getPricingDisplay = (item) => {
    if (item.propertyType === 'Room' || item.propertyType === 'Flat') {
      const price = item.monthlyRent || item.rentPerPerson;
      return `₹${price.toLocaleString('en-IN')}/mo (Unit Rent)`;
    }
    if (item.rentPerPerson || item.monthlyRent) {
      const price = item.rentPerPerson || item.monthlyRent;
      return `₹${price.toLocaleString('en-IN')}/person/mo`;
    }
    if (item.category === 'Tiffin' || item.tiffinDetails?.monthlyPrice) {
      const price = item.tiffinDetails?.monthlyPrice || 3200;
      return `₹${price.toLocaleString('en-IN')}/mo`;
    }
    if (item.category === 'Laundry' || item.laundryDetails?.pricePerKg) {
      const price = item.laundryDetails?.pricePerKg || 50;
      return `₹${price}/kg`;
    }
    if (item.category === 'Cleaning' || item.cleaningDetails) {
      const regularPrice = item.cleaningDetails?.priceMap?.['Regular Room'] || 250;
      return `₹${regularPrice}/room`;
    }
    return '₹Custom Rate';
  };

  // Filter listings based on active tab
  const displayedListings = listings.filter(item => {
    if (activeTab === 'tiffin') {
      return item.category === 'Tiffin' || (!item.category && item.tiffinDetails);
    }
    if (activeTab === 'cleaning') {
      return item.category === 'Cleaning' || item.category === 'Laundry' || (!item.category && (item.cleaningDetails || item.laundryDetails));
    }
    if (activeTab === 'property') {
      return item.propertyType || item.monthlyRent;
    }
    return true;
  });

  // All Tiffin Branches / Centers across different places
  const tiffinBranches = useMemo(() => {
    return listings.filter(s => s.category === 'Tiffin' || (!s.category && s.tiffinDetails));
  }, [listings]);

  // Currently selected Tiffin Branch for menu & order management
  const activeTiffinBranch = useMemo(() => {
    if (!tiffinBranches || tiffinBranches.length === 0) return null;
    if (selectedTiffinBranchId) {
      return tiffinBranches.find(b => (b._id || b.id) === selectedTiffinBranchId) || tiffinBranches[0];
    }
    return tiffinBranches[0];
  }, [tiffinBranches, selectedTiffinBranchId]);

  // All Cleaning Branches / Centers across different places
  const cleaningBranches = useMemo(() => {
    return listings.filter(s => s.category === 'Cleaning' || s.category === 'Laundry' || (!s.category && (s.cleaningDetails || s.laundryDetails)));
  }, [listings]);

  // Currently selected Cleaning Branch for housekeeping & laundry management
  const activeCleaningBranch = useMemo(() => {
    if (!cleaningBranches || cleaningBranches.length === 0) return null;
    if (selectedCleaningBranchId) {
      return cleaningBranches.find(b => (b._id || b.id) === selectedCleaningBranchId) || cleaningBranches[0];
    }
    return cleaningBranches[0];
  }, [cleaningBranches, selectedCleaningBranchId]);

  // Real accepted tenants for Property Owner
  const acceptedTenants = useMemo(() => {
    return requests.filter(r => r.status === 'Accepted');
  }, [requests]);

  // -------------------------------------------------------------
  // ALL RESIDENTS / CUSTOMERS OF THIS PROVIDER
  // -------------------------------------------------------------
  const providerCustomers = useMemo(() => {
    const userMap = new Map();

    requests.forEach(r => {
      const u = r.sender || r.user;
      if (!u) return;
      const uid = (u._id || u.id || u.email || `${r._id}`).toString();

      const bookingTitle = r.property?.title || r.itemId?.title || r.service?.title || (r.itemType === 'Property' ? 'Room / Bed Stay' : 'Service Booking');
      const assigned = r.assignedBed?.roomNumber ? `Room ${r.assignedBed.roomNumber}${r.assignedBed.bedNumber ? ` · Bed ${r.assignedBed.bedNumber}` : ''}` : null;
      const amount = r.pricingDetails?.totalAmount || r.proposedPrice || (r.itemId?.monthlyRent || 0);

      if (!userMap.has(uid)) {
        userMap.set(uid, {
          id: uid,
          user: u,
          name: u.name || r.name || 'Customer / Student',
          email: u.email || '',
          phone: u.phone || '',
          avatar: u.profileImage || null,
          role: u.role || 'USER',
          latestBooking: bookingTitle,
          assignedBed: assigned,
          status: r.status,
          paymentStatus: r.paymentStatus || (['Confirmed', 'Checked In', 'Accepted'].includes(r.status) ? 'Paid' : 'Pending'),
          amount: amount,
          date: r.createdAt,
          totalBookings: 1
        });
      } else {
        const existing = userMap.get(uid);
        existing.totalBookings += 1;
        if (['Checked In', 'Confirmed', 'Accepted'].includes(r.status)) {
          existing.status = r.status;
          existing.latestBooking = bookingTitle;
          if (assigned) existing.assignedBed = assigned;
          if (amount > 0) existing.amount = amount;
          existing.paymentStatus = r.paymentStatus || 'Paid';
        }
      }
    });

    return Array.from(userMap.values());
  }, [requests]);

  // Filtered Customers based on Search & Status
  const filteredCustomers = useMemo(() => {
    return providerCustomers.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch) ||
        (c.assignedBed && c.assignedBed.toLowerCase().includes(customerSearch.toLowerCase())) ||
        c.latestBooking.toLowerCase().includes(customerSearch.toLowerCase());

      const matchStatus =
        customerStatusFilter === 'All' ? true :
        customerStatusFilter === 'Active' ? (['Checked In', 'Confirmed', 'Accepted'].includes(c.status)) :
        c.status === customerStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [providerCustomers, customerSearch, customerStatusFilter]);

  // -------------------------------------------------------------
  // ALL PAYMENTS & EARNINGS TRANSACTIONS
  // -------------------------------------------------------------
  const combinedPayments = useMemo(() => {
    // 1. Direct payments from backend Payment model
    const directList = (payments || []).map(p => ({
      id: p._id || p.id,
      customerName: p.payer?.name || 'Customer',
      customerPhone: p.payer?.phone || '',
      customerEmail: p.payer?.email || '',
      serviceOrStay: p.propertyId?.title || p.serviceId?.title || p.bookingId?.itemId?.title || 'Accommodation / Service Fee',
      amount: p.amount || 0,
      status: p.status === 'Captured' || p.status === 'Authorized' ? 'Paid' : p.status,
      paymentMethod: p.paymentMethod || p.gateway || 'UPI',
      date: p.createdAt,
      ref: p.gatewayPaymentId || `PAY-${(p._id || '').slice(-6).toUpperCase()}`
    }));

    // 2. Supplement from requests with financial records
    const reqList = requests
      .filter(r => r.paymentStatus === 'Paid' || r.status === 'Confirmed' || r.status === 'Checked In' || (r.pricingDetails?.totalAmount > 0) || r.proposedPrice > 0)
      .map(r => ({
        id: r._id,
        customerName: r.sender?.name || 'Customer',
        customerPhone: r.sender?.phone || '',
        customerEmail: r.sender?.email || '',
        serviceOrStay: r.property?.title || r.itemId?.title || r.service?.title || (r.itemType === 'Property' ? 'Room Booking Rent' : 'Service Order Fee'),
        amount: r.pricingDetails?.totalAmount || r.proposedPrice || (r.itemId?.monthlyRent || 0),
        status: r.paymentStatus === 'Paid' || r.status === 'Confirmed' || r.status === 'Checked In' ? 'Paid' : (r.paymentStatus || 'Pending'),
        paymentMethod: r.paymentReference ? 'Razorpay Online' : 'UPI / Direct',
        date: r.updatedAt || r.createdAt,
        ref: r.paymentReference || `TXN-${(r._id || '').slice(-6).toUpperCase()}`
      }));

    // Merge and deduplicate by reference/id
    const seen = new Set();
    const result = [];
    [...directList, ...reqList].forEach(item => {
      if (item.amount > 0 && !seen.has(item.ref)) {
        seen.add(item.ref);
        result.push(item);
      }
    });

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, requests]);

  const totalReceivedRevenue = useMemo(() => {
    return combinedPayments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [combinedPayments]);

  const totalPendingPayments = useMemo(() => {
    return combinedPayments
      .filter(p => p.status === 'Pending' || p.status === 'Created')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [combinedPayments]);

  const filteredPayments = useMemo(() => {
    return combinedPayments.filter(p => {
      const matchSearch =
        p.customerName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.ref.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.serviceOrStay.toLowerCase().includes(paymentSearch.toLowerCase());

      const matchStatus =
        paymentStatusFilter === 'All' ? true :
        p.status.toLowerCase() === paymentStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [combinedPayments, paymentSearch, paymentStatusFilter]);

  // Target property currently being managed in the Live Broadcaster & Room Management
  const activeManagedProperty = useMemo(() => {
    if (!displayedListings || displayedListings.length === 0) return null;
    if (managedPropertyId) {
      return displayedListings.find(l => (l._id || l.id) === managedPropertyId) || null;
    }
    return null;
  }, [managedPropertyId, displayedListings]);

  // Real Operational Metrics derived specifically for activeManagedProperty
  const managedCapacity = useMemo(() => {
    if (!activeManagedProperty) return 0;
    if (activeManagedProperty.roomTiers && activeManagedProperty.roomTiers.length > 0) {
      return activeManagedProperty.roomTiers.reduce((sum, t) => sum + (parseInt(t.totalBeds) || parseInt(t.occupancy) || 1), 0);
    }
    return parseInt(activeManagedProperty.totalBeds) || parseInt(activeManagedProperty.occupancy) || 1;
  }, [activeManagedProperty]);

  const managedVacancies = useMemo(() => {
    if (!activeManagedProperty) return 0;
    if (activeManagedProperty.roomTiers && activeManagedProperty.roomTiers.length > 0) {
      return activeManagedProperty.roomTiers.reduce((sum, t) => sum + (parseInt(t.availableBeds) || 0), 0);
    }
    return parseInt(activeManagedProperty.availableBeds) || 0;
  }, [activeManagedProperty]);

  const managedOccupied = Math.max(0, managedCapacity - managedVacancies);
  const managedOccupancyRate = managedCapacity > 0 ? Math.round((managedOccupied / managedCapacity) * 100) : 0;

  const managedRentRoll = useMemo(() => {
    if (!activeManagedProperty) return 0;
    if (activeManagedProperty.roomTiers && activeManagedProperty.roomTiers.length > 0) {
      const activeOccupiedRevenue = activeManagedProperty.roomTiers.reduce((sum, t) => {
        const occBeds = Math.max(0, (parseInt(t.totalBeds) || 1) - (parseInt(t.availableBeds) || 0));
        return sum + (occBeds * (parseInt(t.rentPerPerson) || 0));
      }, 0);
      if (activeOccupiedRevenue > 0) return activeOccupiedRevenue;
      return activeManagedProperty.roomTiers.reduce((sum, t) => {
        return sum + ((parseInt(t.totalBeds) || 1) * (parseInt(t.rentPerPerson) || 0));
      }, 0);
    }
    return parseInt(activeManagedProperty.monthlyRent || activeManagedProperty.rentPerPerson || 0) || 0;
  }, [activeManagedProperty]);

  // Legacy aliases for backward compatibility
  const totalBedsCapacity = managedCapacity;
  const occupiedCount = managedOccupied;
  const vacanciesCount = managedVacancies;
  const occupancyRate = managedOccupancyRate;
  const totalRentRoll = managedRentRoll;

  // Populate real rooms/beds specifically for activeManagedProperty
  useEffect(() => {
    if (activeManagedProperty) {
      const propId = activeManagedProperty._id || activeManagedProperty.id;
      const pType = activeManagedProperty.propertyType || propertyType || 'Hostel';

      const rooms = [];

      if (activeManagedProperty.roomTiers && activeManagedProperty.roomTiers.length > 0) {
        activeManagedProperty.roomTiers.forEach((tier, tIdx) => {
          const totalB = Math.max(1, tier.totalBeds || tier.occupancy || 1);
          const availB = Math.max(0, Math.min(tier.availableBeds !== undefined ? tier.availableBeds : totalB, totalB));
          const isAvail = availB > 0 && tier.isAvailable !== false;

          rooms.push({
            id: `${propId}-tier-${tIdx}`,
            propertyId: propId,
            tierIndex: tIdx,
            roomNo: tier.roomType || `Room Tier ${tIdx + 1}`,
            type: tier.roomType || activeManagedProperty.roomType || 'Standard Room',
            rent: `₹${(tier.rentPerPerson || activeManagedProperty.monthlyRent || (pType === 'PG' ? 7000 : 6000)).toLocaleString('en-IN')}`,
            availableBeds: availB,
            totalBeds: totalB,
            status: isAvail ? 'Available' : 'Occupied',
            occupant: isAvail ? 'Vacant Bed' : 'Reserved Bed',
            dueStatus: isAvail ? 'Open for Booking' : 'Paid'
          });
        });
      } else {
        if (pType === 'PG') {
          const offered = (Array.isArray(activeManagedProperty.roomTypesOffered) && activeManagedProperty.roomTypesOffered.length > 0)
            ? activeManagedProperty.roomTypesOffered
            : ['Single Room (Private)', 'Double Sharing (2 Beds)', 'Triple Sharing (3 Beds)'];
          offered.forEach((st, tIdx) => {
            const isSingle = st.includes('Single') || st.includes('1');
            const isTriple = st.includes('Triple') || st.includes('3');
            const is4 = st.includes('4');
            const occ = isSingle ? 1 : isTriple ? 3 : is4 ? 4 : 2;
            const rentVal = activeManagedProperty.monthlyRent || activeManagedProperty.rentPerPerson || 7000;
            const tRent = isSingle ? Math.round(rentVal * 1.25 / 100) * 100 : isTriple ? Math.round(rentVal * 0.85 / 100) * 100 : is4 ? Math.round(rentVal * 0.75 / 100) * 100 : rentVal;
            const totalB = occ;
            const availB = Math.max(0, Math.min(activeManagedProperty.availableBeds !== undefined ? activeManagedProperty.availableBeds : totalB, totalB));
            const isAvail = availB > 0 && activeManagedProperty.isAvailable !== false;

            rooms.push({
              id: `${propId}-tier-${tIdx}`,
              propertyId: propId,
              tierIndex: tIdx,
              roomNo: st,
              type: st,
              rent: `₹${tRent.toLocaleString('en-IN')}`,
              availableBeds: availB,
              totalBeds: totalB,
              status: isAvail ? 'Available' : 'Occupied',
              occupant: isAvail ? 'Vacant Bed' : 'Reserved Bed',
              dueStatus: isAvail ? 'Open for Booking' : 'Paid'
            });
          });
        } else if (pType === 'Room' || pType === 'Flat') {
          const isAvail = (activeManagedProperty.availableBeds > 0 || activeManagedProperty.isAvailable !== false);
          rooms.push({
            id: `${propId}`,
            propertyId: propId,
            tierIndex: 0,
            unitNo: activeManagedProperty.title || activeManagedProperty.roomType || 'Unit 101',
            type: activeManagedProperty.roomType || 'Standard Accommodation',
            rent: `₹${(activeManagedProperty.monthlyRent || activeManagedProperty.rentPerPerson || 0).toLocaleString('en-IN')}`,
            availableBeds: isAvail ? 1 : 0,
            totalBeds: 1,
            status: isAvail ? 'Available' : 'Occupied',
            occupant: isAvail ? 'Vacant Unit' : 'Reserved Unit',
            dueStatus: isAvail ? 'Open for Move-in' : 'Paid'
          });
        } else {
          const totalB = Math.max(1, activeManagedProperty.totalBeds ?? 2);
          const availB = Math.max(0, Math.min(activeManagedProperty.availableBeds !== undefined ? activeManagedProperty.availableBeds : totalB, totalB));
          const isAvail = availB > 0 && activeManagedProperty.isAvailable !== false;
          rooms.push({
            id: `${propId}`,
            propertyId: propId,
            tierIndex: 0,
            roomNo: activeManagedProperty.title || activeManagedProperty.roomType || 'Wing A Room',
            type: activeManagedProperty.roomType || 'Standard Room',
            rent: `₹${(activeManagedProperty.monthlyRent || activeManagedProperty.rentPerPerson || 0).toLocaleString('en-IN')}`,
            availableBeds: availB,
            totalBeds: totalB,
            status: isAvail ? 'Available' : 'Occupied',
            occupant: isAvail ? 'Vacant Bed' : 'Reserved Bed',
            dueStatus: isAvail ? 'Open for Booking' : 'Due on 1st'
          });
        }
      }

      if (pType === 'PG') {
        setPgRooms(rooms);
        setHostelRooms([]);
        setFlatUnits([]);
      } else if (pType === 'Room' || pType === 'Flat') {
        setFlatUnits(rooms);
        setHostelRooms([]);
        setPgRooms([]);
      } else {
        setHostelRooms(rooms);
        setPgRooms([]);
        setFlatUnits([]);
      }
    } else {
      setHostelRooms([]);
      setPgRooms([]);
      setFlatUnits([]);
    }
  }, [activeManagedProperty, propertyType]);

  // Populate real tiffin subscribers & cleaning bookings from requests
  useEffect(() => {
    const realTiffin = requests
      .filter(r => (r.service?.category === 'Tiffin' || r.category === 'Tiffin' || activeTab === 'tiffin'))
      .map((r, idx) => ({
        id: r._id || r.id || idx,
        name: r.user?.name || r.name || 'Customer',
        room: r.deliveryAddress || r.user?.address || r.user?.currentCity || 'Customer Address',
        plan: r.service?.title || 'Daily Meal Plan',
        status: r.status === 'Accepted' ? 'Active' : r.status,
        todayDelivery: r.status === 'Accepted' ? 'Scheduled (Fresh Meal)' : r.status,
        pauseDays: 0
      }));
    setTiffinSubscribers(realTiffin);

    const realCleaning = requests
      .filter(r => (r.service?.category === 'Cleaning' || r.service?.category === 'Laundry' || activeTab === 'cleaning'))
      .map((r, idx) => ({
        id: r._id || r.id || idx,
        tenant: r.user?.name || r.name || 'Customer',
        location: r.deliveryAddress || r.user?.address || r.user?.currentCity || 'Service Address',
        service: r.service?.title || 'Room Cleaning',
        time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Scheduled',
        rate: `₹${r.service?.monthlyPrice || r.service?.cleaningPrice || 350}`,
        status: r.status
      }));
    setCleaningBookings(realCleaning);
  }, [requests, activeTab]);

  if (authLoading || !user || user.role === 'USER') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Action Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Top Header & Section Switcher */}
      <div id="provider-overview-section" className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {activeTab === 'tiffin' && 'Tiffin & Meals Kitchen Panel'}
              {activeTab === 'cleaning' && 'Cleaning & Laundry Partner Panel'}
              {activeTab === 'property' && (
                propertyType === 'PG' ? 'PG (Paying Guest) Owner Portal' :
                propertyType === 'Room' || propertyType === 'Flat' ? 'Room & Flat Rental Portal' :
                'Hostel Owner Portal'
              )}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {activeTab === 'tiffin' && 'Manage your kitchen centers across different places, daily rotating menus, active subscribers, and delivery schedules.'}
            {activeTab === 'cleaning' && 'Manage your room sanitization rates, laundry per-kg pricing, and doorstep customer appointments.'}
            {activeTab === 'property' && (
              propertyType === 'PG' ? 'Manage your PG beds, sharing options, food policies, and track incoming tenant inquiries.' :
              propertyType === 'Room' || propertyType === 'Flat' ? 'Manage your flats, private rooms, furnishing details, leases, and tenant applications.' :
              'Manage your hostel rooms, track bed vacancies, publish listings, and respond to incoming student applications.'
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Jump to User Directory */}
          <button
            type="button"
            onClick={() => switchSectionTab('customers')}
            className={`font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border shadow-2xs transition-all cursor-pointer ${
              activeSectionTab === 'customers'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
            title="View User / Tenant Directory"
          >
            <Users className={`w-4 h-4 ${activeSectionTab === 'customers' ? 'text-white' : 'text-blue-600'}`} />
            <span>Customers</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeSectionTab === 'customers' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {providerCustomers.length}
            </span>
          </button>

          {/* Jump to Payments Ledger */}
          <button
            type="button"
            onClick={() => switchSectionTab('payments')}
            className={`font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border shadow-2xs transition-all cursor-pointer ${
              activeSectionTab === 'payments'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
            title="View Payment Transactions History"
          >
            <Receipt className={`w-4 h-4 ${activeSectionTab === 'payments' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Payments</span>
            <span className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
              activeSectionTab === 'payments' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              ₹{totalReceivedRevenue.toLocaleString('en-IN')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchSectionTab('inquiries')}
            className={`font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border shadow-2xs transition-all cursor-pointer ${
              activeSectionTab === 'inquiries'
                ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
            title="Jump to Inquiries & Notifications"
          >
            <Bell className={`w-4 h-4 ${activeSectionTab === 'inquiries' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Inquiries</span>
            {requests.filter(r => r.status === 'Pending').length > 0 ? (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {requests.filter(r => r.status === 'Pending').length}
              </span>
            ) : (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeSectionTab === 'inquiries' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {requests.length}
              </span>
            )}
          </button>

          {/* AI Insights & Settlements Actions */}
          <button
            onClick={() => setShowAIInsightsModal(true)}
            className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
            title="Open AI Business Insights"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Insights</span>
          </button>

          <button
            onClick={() => setShowSettlementsModal(true)}
            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 shadow-2xs transition-all cursor-pointer"
            title="View Payouts & Commission Settlements"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Settlements</span>
          </button>
        </div>
      </div>

      {/* DEDICATED SEPARATE DASHBOARD TABS SWITCHER - ONLY shown for Admin or non-personalized demo view */}
      {!isPersonalizedProvider && !isPropertyOwnerRole ? (
        <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/80 overflow-x-auto">
          <button
            onClick={() => handleTabChange('tiffin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tiffin'
                ? 'bg-white text-emerald-600 shadow-xs border border-emerald-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Tiffin &amp; Meals Dashboard</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">Kitchen</span>
          </button>

          <button
            onClick={() => handleTabChange('cleaning')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cleaning'
                ? 'bg-white text-teal-600 shadow-xs border border-teal-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Cleaning &amp; Laundry Dashboard</span>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full font-bold">Housekeeping</span>
          </button>

          <button
            onClick={() => handleTabChange('property')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'property'
                ? 'bg-white text-purple-600 shadow-xs border border-purple-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Hostel &amp; Rooms Dashboard</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">Hostels &amp; PGs</span>
          </button>
        </div>
      ) : (
        /* Personalized Partner Badge for logged in role (No unwanted other tabs!) */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white rounded-3xl border border-gray-200/90 shadow-xs gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              activeTab === 'tiffin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80' :
              activeTab === 'cleaning' ? 'bg-teal-50 text-teal-600 border border-teal-200/80' :
              'bg-purple-50 text-purple-600 border border-purple-200/80'
            }`}>
              {activeTab === 'tiffin' && <Utensils className="w-6 h-6" />}
              {activeTab === 'cleaning' && <Sparkles className="w-6 h-6" />}
              {activeTab === 'property' && <Home className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                  {activeTab === 'tiffin' && 'Kitchen & Tiffin Services Dashboard'}
                  {activeTab === 'cleaning' && 'Housekeeping & Laundry Services Dashboard'}
                  {activeTab === 'property' && (
                    propertyType === 'PG' ? 'Paying Guest (PG) Management Portal' :
                    propertyType === 'Room' || propertyType === 'Flat' ? 'Room & Flat Rental Portal' :
                    'Hostel & Property Management Portal'
                  )}
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  activeTab === 'tiffin' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  activeTab === 'cleaning' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                  'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  Personalized Role
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap font-medium">
                <span>Logged in as <strong className="text-gray-900">{user?.name || user?.businessName || user?.email}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-gray-700">
                  {userRole === 'PROPERTY_OWNER' 
                    ? (propertyType === 'PG' ? 'PG Owner' : propertyType === 'Room' || propertyType === 'Flat' ? 'Room / Flat Owner' : 'Hostel Owner')
                    : `${user?.providerType || 'Service'} Partner`}
                </strong></span>
                {(user?.currentCity || user?.preferredCity || city) && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                      {user?.currentCity || user?.preferredCity || city}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs self-start sm:self-auto shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Verified Active Session
          </span>
        </div>
      )}

      {/* PRIMARY DASHBOARD SECTION TABS (Strict Single-Tab View, No Endless Scroll!) */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 w-full sm:w-fit overflow-x-auto hide-scrollbar shadow-2xs">
        {/* Tab 1: Menus / Operations / Rooms */}
        {activeTab === 'property' ? (
          <button
            type="button"
            onClick={() => switchSectionTab('rooms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSectionTab === 'rooms'
                ? 'bg-white text-purple-900 shadow-xs border border-purple-200/80 font-black'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <BedDouble className="w-4 h-4 text-purple-600" />
            <span>Rooms &amp; Bed Vacancies</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchSectionTab('menu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSectionTab === 'menu'
                ? activeTab === 'tiffin'
                  ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200/80 font-black'
                  : 'bg-white text-teal-900 shadow-xs border border-teal-200/80 font-black'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            {activeTab === 'tiffin' ? <Utensils className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4 text-teal-600" />}
            <span>{activeTab === 'tiffin' ? 'Daily & Weekly Menus' : 'Services & Rates'}</span>
            {activeTab === 'tiffin' && (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
                activeSectionTab === 'menu' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white/60 text-gray-600 border-gray-200'
              }`}>
                7-Day Rotating
              </span>
            )}
          </button>
        )}

        {/* Tab 2: Centers, Branches & Properties */}
        <button
          type="button"
          onClick={() => switchSectionTab('listings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSectionTab === 'listings'
              ? activeTab === 'tiffin'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200/80 font-black'
                : activeTab === 'cleaning'
                ? 'bg-white text-teal-900 shadow-xs border border-teal-200/80 font-black'
                : 'bg-white text-purple-900 shadow-xs border border-purple-200/80 font-black'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          {activeTab === 'tiffin' ? <Building2 className="w-4 h-4 text-emerald-600" /> :
           activeTab === 'cleaning' ? <Building2 className="w-4 h-4 text-teal-600" /> :
           <Building2 className="w-4 h-4 text-purple-600" />}
          <span>
            {activeTab === 'tiffin' ? 'Kitchen Centers & Branches' :
             activeTab === 'cleaning' ? 'Service Hubs & Branches' :
             (propertyType === 'PG' ? 'My PG Accommodations' :
              propertyType === 'Room' || propertyType === 'Flat' ? 'Flats & Rooms' :
              'My Hostels')}
          </span>
          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
            activeSectionTab === 'listings' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-white/60 text-gray-600 border-gray-200'
          }`}>
            {displayedListings.length}
          </span>
        </button>

        {/* Optional Tab 3 for Hostel: Hostel Mess Menu */}
        {activeTab === 'property' && (propertyType === 'Hostel' || isHostel || displayedListings.some(l => l.propertyType === 'Hostel')) && (
          <button
            type="button"
            onClick={() => switchSectionTab('menu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSectionTab === 'menu'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-300 font-black'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>Hostel Mess Menu</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Mess
            </span>
          </button>
        )}

        {/* Tab 4 for Property Owner: Property Locations & Map Management (Part 9) */}
        {activeTab === 'property' && (
          <button
            type="button"
            onClick={() => switchSectionTab('locations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSectionTab === 'locations'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-300 font-black'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Locations &amp; Maps</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
              activeSectionTab === 'locations' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white/60 text-gray-600 border-gray-200'
            }`}>
              {displayedListings.length}
            </span>
          </button>
        )}

        {/* Common Tab: Inquiries & Orders */}
        <button
          type="button"
          onClick={() => switchSectionTab('inquiries')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSectionTab === 'inquiries'
              ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80 font-black'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>Inquiries &amp; Orders</span>
          {requests.filter(r => r.status === 'Pending').length > 0 ? (
            <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
              {requests.filter(r => r.status === 'Pending').length} Pending
            </span>
          ) : (
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
              activeSectionTab === 'inquiries' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-white/60 text-gray-600 border-gray-200'
            }`}>
              {requests.length}
            </span>
          )}
        </button>

        {/* Common Tab: Residents & Customers */}
        <button
          type="button"
          onClick={() => switchSectionTab('customers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSectionTab === 'customers'
              ? 'bg-white text-blue-900 shadow-xs border border-blue-200 font-black'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Residents &amp; Customers</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeSectionTab === 'customers' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
          }`}>
            {providerCustomers.length}
          </span>
        </button>

        {/* Common Tab: Payments & Revenue */}
        <button
          type="button"
          onClick={() => switchSectionTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSectionTab === 'payments'
              ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200 font-black'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-600" />
          <span>Payments &amp; Revenue</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeSectionTab === 'payments' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
          }`}>
            ₹{totalReceivedRevenue.toLocaleString('en-IN')}
          </span>
        </button>
      </div>

      {/* SECTION 1: DAILY & WEEKLY MENUS / SERVICES & RATES / HOSTEL MESS (ONLY SHOWN WHEN MENU TAB IS ACTIVE) */}
      {activeSectionTab === 'menu' && (
        <div className="space-y-6">

      {/* TAB 1: TIFFIN & MEALS DASHBOARD VIEW */}
      {activeTab === 'tiffin' && (
        <div className="space-y-6">
          {/* Tiffin Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Subscribers</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {tiffinSubscribers.filter(s => s.status === 'Active').length}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {tiffinSubscribers.length} total registered
              </span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Dispatch</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {tiffinSubscribers.filter(s => s.status === 'Active').length} / {tiffinSubscribers.length}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {tiffinSubscribers.length > 0 ? 'Fresh meals in prep' : 'No pending dispatch'}
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/30 p-4 sm:p-5 rounded-3xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Meal Pauses</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-2xs">
                  <PauseCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {tiffinSubscribers.filter(s => s.status === 'Paused').length}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                Temporarily paused
              </span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Subscriptions</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                ₹{((tiffinSubscribers.filter(s => s.status === 'Active').length) * (displayedListings.find(l => l.category === 'Tiffin')?.tiffinDetails?.monthlyPrice || 3200)).toLocaleString('en-IN')}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Recurring monthly revenue
              </span>
            </div>
          </div>

          {/* MULTI-BRANCH PLACE SELECTOR BAR (For owner having tiffin centers at diff places) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-gray-900 tracking-tight">
                      Tiffin Centers &amp; Branches Across Different Places ({tiffinBranches.length} {tiffinBranches.length === 1 ? 'Place' : 'Places'})
                    </h3>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Multi-Place Kitchen Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    Click any place below to manage its specific daily rotating menu, dishes, subscribers, and pricing.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchSectionTab('listings')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  title="View branch cards grid"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>View All Branches ({tiffinBranches.length})</span>
                </button>
              </div>
            </div>

            {/* Branch Pills Switcher */}
            <div className="flex items-center gap-2.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
              {tiffinBranches.map(branch => {
                const isSelected = (branch._id || branch.id) === (activeTiffinBranch?._id || activeTiffinBranch?.id);
                return (
                  <button
                    key={branch._id || branch.id}
                    type="button"
                    onClick={() => handleSelectBranch(branch._id || branch.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                        : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 border-emerald-200/90'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-extrabold">{branch.businessName || 'Kitchen Center'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isSelected ? 'bg-emerald-700/90 text-white' : 'bg-white text-emerald-900 border border-emerald-200'
                    }`}>
                      {branch.city || 'Hub'}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Active Place
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Live Kitchen Menu Broadcast Card with Food Photos */}
          <div className="bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative z-10 space-y-2 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/30 tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{activeTiffinBranch ? `Place: ${activeTiffinBranch.businessName || activeTiffinBranch.address || 'Kitchen'}` : 'Central Kitchen Hub'}</span>
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Kitchen Live & Cooking
                </span>
                <span className="bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                  Broadcasts to Customer Screens
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Daily Homestyle Meals & Live Food Broadcast
              </h2>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                Set today's live meal menu and dish photos for this place. Subscribed students and PG residents immediately see today's breakfast, lunch, and dinner directly in their dashboard.
              </p>
            </div>
            
            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <div className="bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/25 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">Next Dispatch</span>
                <strong className="text-lg font-black text-white">12:30 PM</strong>
                <span className="text-[10px] text-emerald-300 font-bold block">Lunch Packing Ready</span>
              </div>
              {!isEditingMenu && (
                <button
                  type="button"
                  onClick={() => setIsEditingMenu(true)}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit & Set Menu</span>
                </button>
              )}
            </div>
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          <div id="tiffin-menu-section" className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-4 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-150 gap-2">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5"><Utensils className="w-4 h-4 text-emerald-600" /><span>Daily Meal Menu &amp; Food Photos</span></span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    {activeTiffinBranch ? `Place: ${activeTiffinBranch.businessName || activeTiffinBranch.address || 'Branch'} (${activeTiffinBranch.city || 'Hub'})` : `${DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label} Schedule`}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                    {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}
                  </span>
                  {activeMenuDay === getTodayKey() && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                      ● Active Today
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Different menu for each day of the week (Monday to Sunday) broadcasted live to all hostel students.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEditingMenu ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingMenu(false)}
                    className="text-xs text-gray-500 hover:text-gray-800 font-bold px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    Close Editor
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingMenu(true)}
                    className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5" /><span>Edit {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}'s Menu</span></span>
                  </button>
                )}
              </div>
            </div>

            {/* 7-DAY WEEKLY SCHEDULE SELECTOR BAR */}
            <div className="bg-emerald-50/60 p-2 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 min-w-max">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 px-2 shrink-0 flex items-center gap-1">
                  <span>Select Day:</span>
                </span>
                {DAYS_OF_WEEK.map((d) => {
                  const isCurrentSelected = activeMenuDay === d.key;
                  const isToday = getTodayKey() === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => handleSelectDay(d.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        isCurrentSelected
                          ? 'bg-emerald-600 text-white shadow-xs scale-102'
                          : 'bg-white hover:bg-emerald-100/70 text-gray-700 border border-emerald-100'
                      }`}
                    >
                      <span>{d.label}</span>
                      {isToday && (
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter ${
                          isCurrentSelected ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isEditingMenu && (
                <button
                  type="button"
                  onClick={() => {
                    setWeeklyMenu(DEFAULT_WEEKLY_MENU);
                    const target = DEFAULT_WEEKLY_MENU[activeMenuDay] || {};
                    setBreakfastDish(target.breakfast || '');
                    setLunchDish(target.lunch || '');
                    setDinnerDish(target.dinner || '');
                    if (activeMenuDay === 'sunday') {
                      setSundaySpecialDish(target.special || '');
                    }
                    setActionSuccessMsg('Filled standard varied dishes for all 7 days! Click Save to apply.');
                    setTimeout(() => setActionSuccessMsg(''), 4000);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Load Variety Menu</span>
                </button>
              )}
            </div>

            {isEditingMenu ? (
              /* Inline Live Menu & Photo Editor for the Selected Day */
              <form onSubmit={handleSaveMenu} className="bg-emerald-50/40 p-4 sm:p-6 rounded-2xl border border-emerald-200 space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-emerald-200 gap-1">
                  <div>
                    <h4 className="text-xs font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Updating Dishes for {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}</span>
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Set custom breakfast, lunch, and dinner dishes for {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}. You can tab between days above to customize each day of the week!
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Auto-saves to weekly rotation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Breakfast Input */}
                  <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-emerald-950">
                        {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label} Breakfast (7:30 - 9:30 AM)
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Morning</span>
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      value={breakfastDish}
                      onChange={(e) => setBreakfastDish(e.target.value)}
                      placeholder="e.g. Poha, Jalebi / Idli Sambhar & Hot Masala Chai"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <img src={breakfastImage} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-emerald-200 shrink-0" />
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:ring-1 focus:ring-emerald-600 focus:outline-none text-gray-600 font-mono"
                        value={breakfastImage}
                        onChange={(e) => setBreakfastImage(e.target.value)}
                        placeholder="Food Photo URL"
                      />
                    </div>
                  </div>

                  {/* Lunch Input */}
                  <div className="bg-white p-3.5 rounded-2xl border border-amber-150 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-950">
                        {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label} Lunch Thali (12:30 - 2:00 PM)
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Afternoon</span>
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      value={lunchDish}
                      onChange={(e) => setLunchDish(e.target.value)}
                      placeholder="e.g. Dal Tadka, Shahi Paneer, 4 Phulkas, Steamed Rice & Salad"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <img src={lunchImage} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-amber-200 shrink-0" />
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:ring-1 focus:ring-emerald-600 focus:outline-none text-gray-600 font-mono"
                        value={lunchImage}
                        onChange={(e) => setLunchImage(e.target.value)}
                        placeholder="Food Photo URL"
                      />
                    </div>
                  </div>

                  {/* Dinner Input */}
                  <div className="bg-white p-3.5 rounded-2xl border border-emerald-150 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-emerald-950">
                        {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label} Dinner (7:30 - 9:30 PM)
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Night</span>
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      value={dinnerDish}
                      onChange={(e) => setDinnerDish(e.target.value)}
                      placeholder="e.g. Mix Veg Curry, Yellow Dal Fry, 4 Rotis, Jeera Rice & Sweet"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <img src={dinnerImage} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-emerald-200 shrink-0" />
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:ring-1 focus:ring-emerald-600 focus:outline-none text-gray-600 font-mono"
                        value={dinnerImage}
                        onChange={(e) => setDinnerImage(e.target.value)}
                        placeholder="Food Photo URL"
                      />
                    </div>
                  </div>

                  {/* Sunday Special / Weekend Highlight Input */}
                  <div className="bg-white p-3.5 rounded-2xl border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-purple-950">
                        {activeMenuDay === 'sunday' ? 'Sunday Royal Feast Special' : `${DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label} Chef Highlight`}
                      </label>
                      <span className="text-[10px] text-purple-600 font-bold">
                        {activeMenuDay === 'sunday' ? 'Sunday Only' : 'Special Dish'}
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-purple-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                      value={sundaySpecialDish}
                      onChange={(e) => setSundaySpecialDish(e.target.value)}
                      placeholder="e.g. Special Royal Thali: Paneer Butter Masala, Pulao & Sweet Kheer"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <img src={sundaySpecialImage} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-purple-200 shrink-0" />
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:ring-1 focus:ring-purple-500 focus:outline-none text-gray-600 font-mono"
                        value={sundaySpecialImage}
                        onChange={(e) => setSundaySpecialImage(e.target.value)}
                        placeholder="Food Photo URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-[11px] text-gray-500">
                    Click another day above to edit Monday, Tuesday, etc. then click Save.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingMenu(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl cursor-pointer border border-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingMenu}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{savingMenu ? 'Saving...' : `Save & Broadcast ${DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}'s Menu`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Live Menu 4-Slot Grid Display with Food Photos for the Selected Day */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {/* 1. Breakfast */}
                <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                  <div className="h-40 w-full relative overflow-hidden bg-emerald-50">
                    <img
                      src={breakfastImage}
                      alt="Breakfast Meal"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                    <span className="absolute top-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                      {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Breakfast
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      7:30 - 9:30 AM
                    </span>
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px]">
                      <span className="bg-emerald-600/90 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Fresh Cooked
                      </span>
                      <span className="font-semibold text-emerald-200">Morning Slot</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 leading-snug line-clamp-2">
                        {weeklyMenu[activeMenuDay]?.breakfast || breakfastDish}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        Freshly prepared hot breakfast with masala tea for {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-700">Pure Veg</span>
                      <span className="text-gray-400 font-semibold">{DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Menu</span>
                    </div>
                  </div>
                </div>

                {/* 2. Lunch */}
                <div className="bg-white rounded-2xl border border-amber-150 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                  <div className="h-40 w-full relative overflow-hidden bg-amber-50">
                    <img
                      src={lunchImage}
                      alt="Lunch Meal"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                    <span className="absolute top-2.5 left-2.5 bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                      {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Lunch Thali
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      12:30 - 2:00 PM
                    </span>
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px]">
                      <span className="bg-emerald-600/90 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Full Meal
                      </span>
                      <span className="font-semibold text-amber-200">Doorstep Box</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 leading-snug line-clamp-2">
                        {weeklyMenu[activeMenuDay]?.lunch || lunchDish}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        Packed in multi-tier insulated warm tiffin boxes.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-700">4 Rotis + Sabzi + Dal + Rice</span>
                      <span className="text-gray-400 font-semibold">{DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Dispatch</span>
                    </div>
                  </div>
                </div>

                {/* 3. Dinner */}
                <div className="bg-white rounded-2xl border border-emerald-150 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                  <div className="h-40 w-full relative overflow-hidden bg-emerald-50">
                    <img
                      src={dinnerImage}
                      alt="Dinner Meal"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                    <span className="absolute top-2.5 left-2.5 bg-emerald-700/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                      {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Dinner
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      7:30 - 9:30 PM
                    </span>
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px]">
                      <span className="bg-emerald-600/90 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Hot Dispatch
                      </span>
                      <span className="font-semibold text-emerald-200">Night Delivery</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 leading-snug line-clamp-2">
                        {weeklyMenu[activeMenuDay]?.dinner || dinnerDish}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        Light & comforting homestyle curry and phulkas.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-700">Fresh Chapatis</span>
                      <span className="text-gray-400 font-semibold">{DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Night</span>
                    </div>
                  </div>
                </div>

                {/* 4. Sunday Special / Chef's Highlight */}
                <div className="bg-white rounded-2xl border border-purple-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group ring-1 ring-purple-100">
                  <div className="h-40 w-full relative overflow-hidden bg-purple-50">
                    <img
                      src={sundaySpecialImage}
                      alt="Special Feast"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                    <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                      {activeMenuDay === 'sunday' ? 'Royal Sunday' : `${DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Special`}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      ★ Special
                    </span>
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px]">
                      <span className="bg-purple-600/90 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        Sweets Included
                      </span>
                      <span className="font-semibold text-purple-200">Highlight</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-black text-purple-950 leading-snug line-clamp-2">
                        {activeMenuDay === 'sunday' ? (weeklyMenu.sunday?.special || sundaySpecialDish) : (weeklyMenu[activeMenuDay]?.lunch || lunchDish)}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        {activeMenuDay === 'sunday' ? 'Grand weekend thali with dessert & festive delicacies.' : 'Fresh premium specialty meal for subscribers.'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-purple-700">Special Feast</span>
                      <span className="text-purple-600 font-extrabold">All Subscribers</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Tiffin Subscribers Table */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-150">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Today's Meal Dispatch & Pause Tracker</span>
              </h3>
              <span className="text-xs text-gray-400 font-medium">Daily delivery route</span>
            </div>

            {tiffinSubscribers.length === 0 ? (
              <div className="text-center py-10 px-4 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                <Utensils className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-gray-700">No active meal subscribers yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">When customers place meal orders or subscribe to your tiffin plan, their dispatch details will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 text-[11px] font-black text-gray-400 uppercase">
                      <th className="py-2.5 pr-4">Tenant / Student</th>
                      <th className="py-2.5 px-4">Delivery Location</th>
                      <th className="py-2.5 px-4">Subscription Plan</th>
                      <th className="py-2.5 px-4">Today's Status</th>
                      <th className="py-2.5 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tiffinSubscribers.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 pr-4 font-bold text-gray-900">{sub.name}</td>
                        <td className="py-3 px-4 text-gray-600">{sub.room}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">{sub.plan}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            sub.status === 'Paused'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {sub.todayDelivery}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setTiffinSubscribers(prev => prev.map(item => {
                                if (item.id === sub.id) {
                                  const newStatus = item.status === 'Active' ? 'Paused' : 'Active';
                                  return {
                                    ...item,
                                    status: newStatus,
                                    todayDelivery: newStatus === 'Paused' ? 'Skipped (Paused by Kitchen)' : 'Dispatched (Lunch)'
                                  };
                                }
                                return item;
                              }));
                            }}
                            className="text-[11px] font-bold text-gray-500 hover:text-emerald-600 underline cursor-pointer"
                          >
                            {sub.status === 'Active' ? 'Pause Meal' : 'Resume Meal'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLEANING & LAUNDRY DASHBOARD VIEW */}
      {activeTab === 'cleaning' && (
        <div className="space-y-6">
          {/* Cleaning Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/30 p-4 sm:p-5 rounded-3xl border border-teal-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scheduled Visits</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {cleaningBookings.length} {cleaningBookings.length === 1 ? 'Visit' : 'Visits'}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full">
                {cleaningBookings.filter(b => b.status === 'Accepted').length} confirmed appointments
              </span>
            </div>

            <div className="bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/30 p-4 sm:p-5 rounded-3xl border border-teal-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Laundry Pickups</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {cleaningBookings.filter(b => b.service?.toLowerCase().includes('laundry')).length} Pickups
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Doorstep laundry orders
              </span>
            </div>

            <div className="bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/30 p-4 sm:p-5 rounded-3xl border border-teal-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Turnaround</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">24 Hours</p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                Standard doorstep delivery
              </span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Revenue</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                ₹{(cleaningBookings.filter(b => b.status === 'Accepted').length * (displayedListings.find(l => l.category === 'Cleaning' || l.category === 'Laundry')?.cleaningDetails?.priceMap?.['Regular Room'] || 250)).toLocaleString('en-IN')}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Confirmed bookings
              </span>
            </div>
          </div>

          {/* MULTI-BRANCH PLACE SELECTOR BAR (For owner having cleaning hubs at diff places) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-teal-200 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-gray-900 tracking-tight">
                      Cleaning Hubs &amp; Branches Across Different Places ({cleaningBranches.length} {cleaningBranches.length === 1 ? 'Place' : 'Places'})
                    </h3>
                    <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                      Multi-Place Service Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    Click any place below to manage its specific housekeeping rates, laundry charges, and appointment schedule.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchSectionTab('listings')}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/90 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  title="View service hub cards grid"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>View All Hubs ({cleaningBranches.length})</span>
                </button>
              </div>
            </div>

            {/* Branch Pills Switcher */}
            <div className="flex items-center gap-2.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
              {cleaningBranches.map(branch => {
                const isSelected = (branch._id || branch.id) === (activeCleaningBranch?._id || activeCleaningBranch?.id);
                return (
                  <button
                    key={branch._id || branch.id}
                    type="button"
                    onClick={() => handleSelectCleaningBranch(branch._id || branch.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-300'
                        : 'bg-teal-50/70 hover:bg-teal-100 text-teal-950 border-teal-200/90'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-extrabold">{branch.businessName || 'Cleaning Hub'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isSelected ? 'bg-teal-700/90 text-white' : 'bg-white text-teal-900 border border-teal-200'
                    }`}>
                      {branch.city || 'Hub'}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Active Place
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Rate Card Overview */}
          <div className="bg-teal-50/60 p-5 rounded-3xl border border-teal-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-600 text-white shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                    Live Housekeeping &amp; Laundry Rate Card {activeCleaningBranch ? `· Place: ${activeCleaningBranch.businessName || activeCleaningBranch.address || 'Central Hub'} (${activeCleaningBranch.city || 'Hub'})` : ''}
                  </h3>
                  <p className="text-xs text-teal-800">Transparent rates published to tenants across local hostels &amp; PGs.</p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] bg-teal-200/80 text-teal-900 font-extrabold px-2.5 py-1 rounded-full uppercase">
                ✓ Rates Published
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="bg-white rounded-2xl border border-teal-150 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                <div className="h-32 w-full relative overflow-hidden bg-teal-50">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80"
                    alt="Room Deep Cleaning"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <span className="absolute top-2.5 left-2.5 bg-teal-700/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                    Deep Cleaning
                  </span>
                  <span className="absolute bottom-2 left-2.5 text-white text-xs font-black">
                    ₹250 - ₹350 <span className="text-[10px] font-normal text-teal-200">/room</span>
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-black text-gray-900">Room Deep Cleaning & Scrubbing</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">Includes floor scrubbing, dust removal, ceiling fans & cobwebs.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-teal-150 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                <div className="h-32 w-full relative overflow-hidden bg-teal-50">
                  <img
                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80"
                    alt="Washroom Sanitization"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <span className="absolute top-2.5 left-2.5 bg-teal-700/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                    Sanitization
                  </span>
                  <span className="absolute bottom-2 left-2.5 text-white text-xs font-black">
                    ₹200 <span className="text-[10px] font-normal text-teal-200">/bathroom</span>
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-black text-gray-900">Washroom Disinfection & Shine</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">Anti-bacterial disinfection, tile de-scaling, mirror & tap shine.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-teal-150 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                <div className="h-32 w-full relative overflow-hidden bg-teal-50">
                  <img
                    src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=80"
                    alt="Wash & Fold Laundry"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <span className="absolute top-2.5 left-2.5 bg-teal-700/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                    Doorstep Laundry
                  </span>
                  <span className="absolute bottom-2 left-2.5 text-white text-xs font-black">
                    ₹50 - ₹60 <span className="text-[10px] font-normal text-teal-200">/kg</span>
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-black text-gray-900">Wash, Sun-Dry & Fold</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">Hygienic machine wash, sun dry, fold. Steam iron at ₹8/cloth.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cleaning Appointment Queue */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-150">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Today's Cleaning & Laundry Appointments</span>
              </h3>
              <span className="text-xs text-gray-400 font-medium">Scheduled bookings</span>
            </div>

            {cleaningBookings.length === 0 ? (
              <div className="text-center py-10 px-4 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-gray-700">No cleaning or laundry appointments yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">When customers book cleaning or laundry services, their scheduled appointments will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 text-[11px] font-black text-gray-400 uppercase">
                      <th className="py-2.5 pr-4">Tenant</th>
                      <th className="py-2.5 px-4">Location</th>
                      <th className="py-2.5 px-4">Service Booked</th>
                      <th className="py-2.5 px-4">Time Slot</th>
                      <th className="py-2.5 px-4">Rate</th>
                      <th className="py-2.5 pl-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cleaningBookings.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 pr-4 font-bold text-gray-900">{item.tenant}</td>
                        <td className="py-3 px-4 text-gray-600">{item.location}</td>
                        <td className="py-3 px-4 font-semibold text-teal-700">{item.service}</td>
                        <td className="py-3 px-4 font-mono text-gray-600">{item.time}</td>
                        <td className="py-3 px-4 font-black text-green-700">{item.rate}</td>
                        <td className="py-3 pl-4 text-right">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOSTEL MESS MENU (BREAKFAST, LUNCH, DINNER) SECTION (Inside Menu Tab for Hostels) */}
      {activeTab === 'property' && (propertyType === 'Hostel' || isHostel || displayedListings.some(l => l.propertyType === 'Hostel')) && (
        <div id="tiffin-menu-section" className="bg-white p-5 sm:p-6 rounded-3xl border border-amber-200/90 shadow-xs space-y-4 scroll-mt-20">
          {displayedListings.some(l => l.propertyType === 'Hostel') && !displayedListings.some(l => l.propertyType === 'Hostel' && l.foodAvailable) ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 shadow-2xs">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">
                Mess Facility is Disabled for your Hostel ("Food Optional")
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Aapne apne hostel me mess / food facility include nahi ki hai ("Food Optional"). Agar aap students ko daily breakfast, lunch aur dinner provide karna chahte hain, to neeche "Enable Mess Facility" par click karke menu set kar sakte hain.
              </p>
              <button
                type="button"
                onClick={() => {
                  const targetHostel = displayedListings.find(l => l.propertyType === 'Hostel');
                  if (targetHostel) {
                    handleEditProperty(targetHostel);
                    setFoodAvailable(true);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Enable Mess Facility &amp; Set Menu</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                      <Utensils className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                      Hostel Mess Menu &amp; Daily Meal Schedule
                    </h3>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                      Breakfast · Lunch · Dinner Included
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md">
                      {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}
                    </span>
                    {activeMenuDay === getTodayKey() && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span>Active Today</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Daily homestyle meals (Breakfast, Lunch, Dinner) broadcasted live to all students residing in your hostel.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isEditingMenu ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingMenu(false)}
                      className="text-xs text-gray-600 hover:text-gray-900 font-bold px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      Close Editor
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingMenu(true)}
                      className="text-xs text-white bg-amber-600 hover:bg-amber-700 font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}'s Mess Menu</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 7-DAY WEEKLY SCHEDULE SELECTOR BAR */}
              <div className="bg-amber-50/60 p-2 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 min-w-max">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 px-2 shrink-0 flex items-center gap-1">
                    <span>Select Day:</span>
                  </span>
                  {DAYS_OF_WEEK.map((d) => {
                    const isCurrentSelected = activeMenuDay === d.key;
                    const isToday = getTodayKey() === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => handleSelectDay(d.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                          isCurrentSelected
                            ? 'bg-amber-600 text-white shadow-xs scale-102'
                            : 'bg-white hover:bg-amber-100/70 text-gray-700 border border-amber-100'
                        }`}
                      >
                        <span>{d.label}</span>
                        {isToday && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter ${
                            isCurrentSelected ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Today
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {isEditingMenu && (
                  <button
                    type="button"
                    onClick={() => {
                      setWeeklyMenu(DEFAULT_WEEKLY_MENU);
                      const target = DEFAULT_WEEKLY_MENU[activeMenuDay] || {};
                      setBreakfastDish(target.breakfast || '');
                      setLunchDish(target.lunch || '');
                      setDinnerDish(target.dinner || '');
                      if (activeMenuDay === 'sunday') {
                        setSundaySpecialDish(target.special || '');
                      }
                      setActionSuccessMsg('Filled standard varied dishes for all 7 days! Click Save to apply.');
                      setTimeout(() => setActionSuccessMsg(''), 4000);
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Load Variety Menu</span>
                  </button>
                )}
              </div>

              {/* Form or Cards */}
              {isEditingMenu ? (
                <form onSubmit={handleSaveMenu} className="bg-amber-50/40 p-4 sm:p-6 rounded-2xl border border-amber-200 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-amber-200 gap-1">
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Updating Hostel Mess Menu for {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}</span>
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Customize breakfast, lunch, and dinner dishes for {DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}. You can tab between days above to customize the full week!
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Auto-saves to hostel schedule</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Breakfast */}
                    <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-950">
                          🌅 Breakfast (7:30 - 9:30 AM)
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">Morning</span>
                      </div>
                      <textarea
                        rows="3"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                        value={breakfastDish}
                        onChange={(e) => setBreakfastDish(e.target.value)}
                        placeholder="e.g. Poha, Jalebi / Idli Sambhar & Hot Masala Chai"
                      />
                    </div>

                    {/* 2. Lunch */}
                    <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-950">
                          ☀️ Lunch Thali (12:30 - 2:00 PM)
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">Afternoon</span>
                      </div>
                      <textarea
                        rows="3"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                        value={lunchDish}
                        onChange={(e) => setLunchDish(e.target.value)}
                        placeholder="e.g. Dal Tadka, Shahi Paneer, 4 Butter Phulkas, Steamed Rice & Green Salad"
                      />
                    </div>

                    {/* 3. Dinner */}
                    <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-950">
                          🌙 Dinner (7:30 - 9:30 PM)
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">Night</span>
                      </div>
                      <textarea
                        rows="3"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                        value={dinnerDish}
                        onChange={(e) => setDinnerDish(e.target.value)}
                        placeholder="e.g. Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis & Jeera Rice"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                    <span className="text-[11px] text-gray-500">
                      Click another day above to edit dishes for that day, then click Save.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingMenu(false)}
                        className="px-4 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl cursor-pointer border border-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingMenu}
                        className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{savingMenu ? 'Saving...' : `Save & Broadcast ${DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.label}'s Mess Menu`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Breakfast Card */}
                  <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/20 rounded-2xl border border-amber-200/80 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>🌅 Breakfast</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">7:30 - 9:30 AM</span>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 leading-snug">
                        {weeklyMenu[activeMenuDay]?.breakfast || breakfastDish}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Fresh morning breakfast served with hot masala chai in the hostel dining hall.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-800">Fresh Cooked</span>
                      <span className="text-gray-400 font-semibold">{DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Breakfast</span>
                    </div>
                  </div>

                  {/* Lunch Card */}
                  <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/20 rounded-2xl border border-amber-200/80 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>☀️ Lunch Thali</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">12:30 - 2:00 PM</span>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 leading-snug">
                        {weeklyMenu[activeMenuDay]?.lunch || lunchDish}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Nutritious homestyle lunch with phulkas, fresh dal, sabzi, rice and salad.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-800">Full Thali</span>
                      <span className="text-gray-400 font-semibold">{DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Lunch</span>
                    </div>
                  </div>

                  {/* Dinner Card */}
                  <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/20 rounded-2xl border border-amber-200/80 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>🌙 Dinner</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">7:30 - 9:30 PM</span>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 leading-snug">
                        {weeklyMenu[activeMenuDay]?.dinner || dinnerDish}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Warm evening dinner prepared fresh before curfew hours.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-800">Night Meal</span>
                      <span className="text-gray-400 font-semibold">{DAYS_OF_WEEK.find(d => d.key === activeMenuDay)?.short} Dinner</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      </div>
      )}

      {/* SECTION 2: ROOMS & BED VACANCIES (ONLY SHOWN FOR PROPERTY OWNER ON ROOMS TAB) */}
      {activeSectionTab === 'rooms' && activeTab === 'property' && (
        <div className="space-y-6">
          {displayedListings.length === 0 ? (
            /* BRAND-NEW OWNER ONBOARDING HERO BANNER (No misleading mock hostel data!) */
            <div className={`p-6 sm:p-8 rounded-3xl text-white shadow-md space-y-4 ${
              propertyType === 'PG' 
                ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800' 
                : propertyType === 'Room' || propertyType === 'Flat'
                ? 'bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800'
                : 'bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-xl">
                    {propertyType === 'PG' ? 'PG' : propertyType === 'Room' || propertyType === 'Flat' ? 'Room' : 'Hostel'}
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/25">
                      {propertyType === 'PG' ? 'PG Owner Onboarding' : propertyType === 'Room' || propertyType === 'Flat' ? 'Flat & Room Rental Setup' : 'Hostel Owner Onboarding'} • Step 1 of 1
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {propertyType === 'PG' 
                        ? `Welcome, ${user?.name || 'Partner'}! Setup Your PG Accommodation`
                        : propertyType === 'Room' || propertyType === 'Flat'
                        ? `Welcome, ${user?.name || 'Partner'}! Setup Your Room or Flat Listing`
                        : `Welcome, ${user?.name || 'Partner'}! Setup Your Student Hostel`}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white text-gray-900 font-extrabold px-3 py-1.5 rounded-full shadow-xs">
                    Registered Business: {propertyType === 'PG' ? 'Paying Guest (PG)' : propertyType === 'Room' || propertyType === 'Flat' ? 'Room / Flat' : 'Hostel'}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-3xl">
                {propertyType === 'PG' && 'Complete your PG setup below — specify Girls, Boys or Coliving PG type, bed sharing options, food & meal policies, curfew timings, and monthly rent per bed. Your PG will be published live to students and working professionals in your city.'}
                {(propertyType === 'Room' || propertyType === 'Flat') && 'Complete your flat or room listing setup below — select flat configuration (1 RK, 1 BHK, 2 BHK), furnishing status, tenant preferences, kitchen setup, and monthly unit rent. Once published, your listing will be immediately discoverable on StaySync.'}
                {propertyType === 'Hostel' && 'Complete your hostel setup below — specify Girls or Boys category, configure 1-seater, 2-seater, and 3-seater room sharing tiers with individual bed counts, mess food policy, and gate curfew. Once submitted, your hostel will be accessible to college students across StaySync.'}
              </p>

              {/* Onboarding Steps Progress Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white text-purple-900 font-black text-xs flex items-center justify-center shrink-0">1</span>
                  <div className="text-[11px]">
                    <p className="font-bold text-white">Fill Property Details</p>
                    <p className="text-white/70 text-[10px]">Title, address &amp; amenities</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white text-purple-900 font-black text-xs flex items-center justify-center shrink-0">2</span>
                  <div className="text-[11px]">
                    <p className="font-bold text-white">{propertyType === 'PG' ? 'Set Meals & Sharing Rents' : propertyType === 'Room' || propertyType === 'Flat' ? 'Set Unit Rent & Leases' : 'Configure Room Tiers'}</p>
                    <p className="text-white/70 text-[10px]">{propertyType === 'PG' ? 'Bed rates & food policy' : propertyType === 'Room' || propertyType === 'Flat' ? 'Furnishing & deposits' : 'Single, double, triple beds'}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs flex items-center justify-center shrink-0">✓</span>
                  <div className="text-[11px]">
                    <p className="font-bold text-white">Publish Live to Tenants</p>
                    <p className="text-white/70 text-[10px]">Instant search availability</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CLEAN PROPERTY PORTFOLIO OVERVIEW HERO (ZERO ROOM/BED DATA IN UPPER) */
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`p-3 rounded-2xl text-white shadow-2xs shrink-0 ${
                    propertyType === 'PG' ? 'bg-indigo-600' : propertyType === 'Hostel' ? 'bg-purple-600' : 'bg-teal-700'
                  }`}>
                    <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        propertyType === 'PG' ? 'bg-indigo-100 text-indigo-800' : propertyType === 'Hostel' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {propertyType === 'PG' ? 'Paying Guest (PG) Hub' : propertyType === 'Hostel' ? 'Student Hostel Hub' : 'Flats & Rooms Hub'}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Verified Provider
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-1">
                      {propertyType === 'PG' ? 'My PG Accommodations' : propertyType === 'Hostel' ? 'My Student Hostels' : 'My Rental Flats & Rooms'}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Select any property card below to manage its live room tiers, bed vacancies, and tenant agreements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Portfolio Stats Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Total Listings</span>
                  <p className="text-lg font-black text-gray-900">{displayedListings.length} {displayedListings.length === 1 ? 'Property' : 'Properties'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Total Bed Capacity</span>
                  <p className="text-lg font-black text-purple-700">
                    {displayedListings.reduce((sum, p) => {
                      if (p.roomTiers && p.roomTiers.length > 0) {
                        return sum + p.roomTiers.reduce((s, t) => s + (parseInt(t.totalBeds) || parseInt(t.occupancy) || 1), 0);
                      }
                      return sum + (parseInt(p.totalBeds) || parseInt(p.occupancy) || 1);
                    }, 0)} {propertyType === 'Room' || propertyType === 'Flat' ? 'Units' : 'Beds'}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-150">
                  <span className="text-[10px] font-black uppercase text-emerald-800 block tracking-wider">Live Open Vacancies</span>
                  <p className="text-lg font-black text-emerald-700">
                    {displayedListings.reduce((sum, p) => {
                      if (p.roomTiers && p.roomTiers.length > 0) {
                        return sum + p.roomTiers.reduce((s, t) => s + (parseInt(t.availableBeds) || 0), 0);
                      }
                      return sum + (parseInt(p.availableBeds) || 0);
                    }, 0)} {propertyType === 'Room' || propertyType === 'Flat' ? 'Units Open' : 'Beds Open'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DOCKED PROPERTY BROADCASTER CONSOLE (when a property is clicked and manage modal is dismissed) */}
          {activeManagedProperty && !showPropertyManageModal && (
            <div id="property-broadcaster-console" className="mt-8 pt-6 border-t-2 border-indigo-150 space-y-4 animate-fadeIn">
              <PropertyBroadcasterConsole
                activeManagedProperty={activeManagedProperty}
                displayedListings={displayedListings}
                managedCapacity={managedCapacity}
                managedOccupied={managedOccupied}
                managedOccupancyRate={managedOccupancyRate}
                managedVacancies={managedVacancies}
                managedRentRoll={managedRentRoll}
                hostelRooms={hostelRooms}
                pgRooms={pgRooms}
                flatUnits={flatUnits}
                handleToggleRoomStatus={handleToggleRoomStatus}
                handleTogglePgBed={handleTogglePgBed}
                handleToggleFlatUnit={handleToggleFlatUnit}
                handleOpenAddPgRoom={handleOpenAddPgRoom}
                handleDeletePgRoom={handleDeletePgRoom}
                handleEditProperty={handleEditProperty}
                handleSelectPropertyForManagement={handleSelectPropertyForManagement}
                acceptedTenants={acceptedTenants}
                onClose={() => setManagedPropertyId(null)}
                isModal={false}
              />
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: KITCHEN CENTERS, SERVICE HUBS & PROPERTY LISTINGS (ONLY SHOWN ON LISTINGS TAB) */}
      {activeSectionTab === 'listings' && (
        <div className="space-y-6">
          {/* BRAND NEW PROPERTY OWNER INITIAL SETUP BANNER (when listings === 0 and modal is not opened) */}
          {activeTab === 'property' && displayedListings.length === 0 && !showCreateForm && (
            <div className="bg-purple-50/70 p-6 sm:p-8 rounded-3xl border border-purple-200 text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shadow-xs">
                <Home className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Welcome to Your Property Management Portal!
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  You haven't listed any {propertyType === 'PG' ? 'PGs' : propertyType === 'Hostel' ? 'Hostels' : 'Flats/Rooms'} yet. Publish your first property listing to start receiving student and tenant inquiries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { resetForm(); setShowCreateForm(true); }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-sm hover:shadow cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Set Up Your First Property Now</span>
              </button>
            </div>
          )}

      {/* CREATE OFFERING / LISTING FORM MODAL OVERLAY */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateForm(false);
            }
          }}
        >
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto p-5 sm:p-8 my-auto">
            <datalist id="popular-cities-list">
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className={`w-5 h-5 ${activeTab === 'tiffin' ? 'text-emerald-600' : activeTab === 'cleaning' ? 'text-teal-600' : 'text-purple-600'}`} />
                <span>
                  {activeTab === 'tiffin' && (editingPropertyId ? 'Edit Tiffin Branch / Place Details' : 'Add Tiffin Branch (Diff Place / Location)')}
                  {activeTab === 'cleaning' && (editingPropertyId ? 'Edit Cleaning Branch / Place Details' : 'Add Cleaning Branch (Diff Place / Location)')}
                  {activeTab === 'property' && (
                    editingPropertyId 
                      ? `Edit ${propertyType === 'PG' ? 'PG Accommodation' : propertyType === 'Room' || propertyType === 'Flat' ? 'Flat / Room' : 'Hostel'} Details`
                      : `Publish New ${propertyType === 'PG' ? 'PG Accommodation' : propertyType === 'Room' || propertyType === 'Flat' ? 'Room / Flat' : 'Hostel'} Listing`
                  )}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => { resetForm(); setShowCreateForm(false); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center text-sm font-black transition-colors cursor-pointer"
                title="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-5">

          {activeTab === 'property' ? (
            // PROPERTY OWNER FORM
            <div className="space-y-4">
              {/* Ownership Type Switcher - ONLY shown if user doesn't have a registered propertyType */}
              {!user?.propertyType && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">Property Type</label>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Selected for Setup: {propertyType === 'PG' ? 'Paying Guest (PG)' : propertyType === 'Room' || propertyType === 'Flat' ? 'Room / Flat' : 'Hostel'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-purple-50 rounded-2xl border border-purple-200">
                    <button
                      type="button"
                      onClick={() => { setPropertyType('Hostel'); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        propertyType === 'Hostel'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-900 hover:bg-purple-200/50'
                      }`}
                    >
                      <Hotel className="w-4 h-4" />
                      <span>Hostel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPropertyType('PG'); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        propertyType === 'PG'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-900 hover:bg-purple-200/50'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>PG (Paying Guest)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPropertyType('Room'); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        propertyType === 'Room' || propertyType === 'Flat'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-900 hover:bg-purple-200/50'
                      }`}
                    >
                      <DoorClosed className="w-4 h-4" />
                      <span>Room / Flat</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* SUBFORM A: HOSTEL SPECIFIC REQUIREMENTS                        */}
              {/* ============================================================== */}
              {propertyType === 'Hostel' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Hostel Name / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Greenfield Premium Girls Hostel"
                        className="w-full px-3.5 py-2.5 border border-purple-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-gray-900 bg-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Hostel Category</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-purple-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-gray-800 bg-white"
                        value={hostelCategory}
                        onChange={(e) => setHostelCategory(e.target.value)}
                      >
                        <option value="Girls Hostel">Girls Hostel Only</option>
                        <option value="Boys Hostel">Boys Hostel Only</option>
                        <option value="Girls & Boys Hostel">Girls &amp; Boys (Co-ed Hostel)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Operating City</label>
                      <input
                        type="text"
                        required
                        list="popular-cities-list"
                        placeholder={user?.currentCity || "e.g. Bhopal, Indore"}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 6000"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Gate In-Time / Curfew</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
                        value={hostelCurfew}
                        onChange={(e) => setHostelCurfew(e.target.value)}
                      >
                        <option value="No Curfew">No Curfew (24x7 Open Entry)</option>
                        <option value="10:00 PM">10:00 PM</option>
                        <option value="10:30 PM">10:30 PM</option>
                        <option value="11:00 PM">11:00 PM</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none bg-purple-50 p-2.5 rounded-xl border border-purple-200 w-full">
                        <input
                          type="checkbox"
                          checked={foodAvailable}
                          onChange={(e) => setFoodAvailable(e.target.checked)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded accent-purple-600"
                        />
                        <span className="text-xs text-purple-900 font-bold flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5 text-purple-600" /><span>Daily Mess / 3 Meals Included</span></span>
                      </label>
                    </div>

                    <PropertyLocationFormFields
                      address={address} setAddress={setAddress}
                      locality={locality} setLocality={setLocality}
                      landmark={landmark} setLandmark={setLandmark}
                      pincode={pincode} setPincode={setPincode}
                      locationVisibility={locationVisibility} setLocationVisibility={setLocationVisibility}
                      propLatitude={propLatitude} setPropLatitude={setPropLatitude}
                      propLongitude={propLongitude} setPropLongitude={setPropLongitude}
                      city={city}
                    />
                  </div>

                  {/* Direct Hostel Bed Capacity & Pricing (Direct Owner Input, No Seater Restrictions) */}
                  <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 border border-purple-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-150">
                      <div>
                        <h3 className="text-xs font-black uppercase text-gray-900 tracking-wider flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-purple-600" />
                          <span>Hostel Bed Capacity &amp; Monthly Rent</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          Enter your total beds, available vacancies, and monthly rent per bed directly (no forced seater restrictions).
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-150/60 text-purple-800 border border-purple-200">
                        Owner Direct Entry
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* Total Beds */}
                      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1.5 focus-within:ring-2 focus-within:ring-purple-400">
                        <label className="block text-[11px] font-bold text-gray-700">
                          Total Beds in Hostel <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="e.g. 20"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-purple-500"
                            value={totalHostelBeds}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTotalHostelBeds(val);
                              if (val && parseInt(availableHostelBeds) > parseInt(val)) {
                                setAvailableHostelBeds(val);
                              }
                            }}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-400">Beds</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">Entire building bed capacity</p>
                      </div>

                      {/* Available / Vacant Beds */}
                      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1.5 focus-within:ring-2 focus-within:ring-purple-400">
                        <label className="block text-[11px] font-bold text-emerald-800">
                          Available / Vacant Beds <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={totalHostelBeds || undefined}
                            required
                            placeholder="e.g. 5"
                            className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50/20 focus:outline-none focus:border-emerald-500"
                            value={availableHostelBeds}
                            onChange={(e) => setAvailableHostelBeds(e.target.value)}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-semibold text-emerald-600">Open</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">Ready for immediate booking</p>
                      </div>

                      {/* Monthly Rent per Bed */}
                      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1.5 focus-within:ring-2 focus-within:ring-purple-400">
                        <label className="block text-[11px] font-bold text-purple-900">
                          Monthly Rent / Bed (₹) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="100"
                            required
                            placeholder="e.g. 6000"
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm font-bold text-purple-700 bg-purple-50/20 focus:outline-none focus:border-purple-500"
                            value={monthlyRent}
                            onChange={(e) => setMonthlyRent(e.target.value)}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-semibold text-purple-600">/ mo</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">Standard rent per resident</p>
                      </div>
                    </div>

                    {/* Quick Live Summary Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-100/50 border border-purple-200/60 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700">
                          Total: <strong className="text-gray-900">{totalHostelBeds || 0} Beds</strong>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="font-bold text-emerald-700">
                          Open: <strong>{availableHostelBeds || 0} Vacant</strong>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="font-bold text-purple-700">
                          Occupied: <strong>{Math.max(0, (parseInt(totalHostelBeds) || 0) - (parseInt(availableHostelBeds) || 0))} Beds</strong>
                        </span>
                      </div>
                      <div className="font-extrabold text-purple-900">
                        ₹{monthlyRent ? parseInt(monthlyRent).toLocaleString('en-IN') : '6,000'} / person / month
                      </div>
                    </div>
                  </div>

                  {/* Hostel Mess Menu (Breakfast, Lunch, Dinner) */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border border-amber-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/60">
                      <div>
                        <h3 className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-amber-600" />
                          <span>Hostel Mess &amp; Daily Food Menu</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          Specify daily homestyle breakfast, lunch, and dinner dishes included with student hostel stay.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-amber-100/70 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-300/70 transition self-start sm:self-auto">
                        <input
                          type="checkbox"
                          checked={foodAvailable}
                          onChange={(e) => setFoodAvailable(e.target.checked)}
                          className="w-3.5 h-3.5 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="text-[11px] font-extrabold text-amber-900">Food Included</span>
                      </label>
                    </div>

                    {foodAvailable && (
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* Breakfast */}
                        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5 focus-within:ring-2 focus-within:ring-amber-400">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                              <span>🌅 Breakfast (नाश्ता)</span>
                              <span className="text-[10px] text-amber-700 font-medium">· 7:30 - 9:30 AM</span>
                            </label>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Morning</span>
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Poha, Jalebi / Idli Sambhar & Hot Masala Chai"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-amber-500"
                            value={breakfastDish}
                            onChange={(e) => setBreakfastDish(e.target.value)}
                          />
                        </div>

                        {/* Lunch */}
                        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5 focus-within:ring-2 focus-within:ring-amber-400">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                              <span>☀️ Lunch (दोपहर का भोजन)</span>
                              <span className="text-[10px] text-amber-700 font-medium">· 12:30 - 2:00 PM</span>
                            </label>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Afternoon</span>
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Dal Tadka, Shahi Paneer, 4 Butter Phulkas, Steamed Rice & Green Salad"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-amber-500"
                            value={lunchDish}
                            onChange={(e) => setLunchDish(e.target.value)}
                          />
                        </div>

                        {/* Dinner */}
                        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5 focus-within:ring-2 focus-within:ring-amber-400">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                              <span>🌙 Dinner (रात का खाना)</span>
                              <span className="text-[10px] text-amber-700 font-medium">· 7:30 - 9:30 PM</span>
                            </label>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Night</span>
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis & Jeera Rice"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-amber-500"
                            value={dinnerDish}
                            onChange={(e) => setDinnerDish(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hostel Amenities */}
                  <AmenitiesSection
                    title="Hostel Security & Facilities"
                    badgeColor="purple"
                    defaultAmenities={DEFAULT_HOSTEL_AMENITIES}
                    selectedAmenities={selectedAmenities}
                    toggleAmenity={toggleAmenity}
                    customAmenities={customAmenities}
                    onAddCustomAmenity={handleAddCustomAmenity}
                    onRemoveCustomAmenity={handleRemoveCustomAmenity}
                  />
                </div>
              )}

              {/* ============================================================== */}
              {/* SUBFORM B: PG (PAYING GUEST) SPECIFIC REQUIREMENTS             */}
              {/* ============================================================== */}
              {propertyType === 'PG' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">PG Name / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Comfort PG for Boys"
                        className="w-full px-3.5 py-2.5 border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-gray-900 bg-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">PG Category</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-indigo-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-gray-800 bg-white"
                        value={hostelCategory}
                        onChange={(e) => setHostelCategory(e.target.value)}
                      >
                        <option value="Boys Hostel">Boys PG Only</option>
                        <option value="Girls Hostel">Girls PG Only</option>
                        <option value="Girls & Boys Hostel">Unisex &amp; Coliving PG</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Operating City</label>
                      <input
                        type="text"
                        required
                        list="popular-cities-list"
                        placeholder={user?.currentCity || "e.g. Bhopal, Indore"}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Base Monthly Rent / Bed (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 7000"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-green-700"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 7000"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Food Policy &amp; Meals</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                        value={pgFoodPolicy}
                        onChange={(e) => setPgFoodPolicy(e.target.value)}
                      >
                        <option value="3 Meals Included">3 Meals Included (Daily Breakfast, Lunch &amp; Dinner)</option>
                        <option value="2 Meals (Breakfast + Dinner)">2 Meals Included (Breakfast &amp; Dinner)</option>
                        <option value="Breakfast Only">Breakfast Only</option>
                        <option value="Self Cook / Mess Optional">Self Cook / Mess Optional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Notice Period</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                        value={pgNoticePeriod}
                        onChange={(e) => setPgNoticePeriod(e.target.value)}
                      >
                        <option value="15 Days">15 Days</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                        <option value="No Notice Period">No Notice Period</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Gate In-Time / Curfew</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                        value={pgCurfew}
                        onChange={(e) => setPgCurfew(e.target.value)}
                      >
                        <option value="No Curfew (24x7)">No Curfew (24x7 Open Entry)</option>
                        <option value="10:30 PM">10:30 PM</option>
                        <option value="11:00 PM">11:00 PM</option>
                      </select>
                    </div>

                    <PropertyLocationFormFields
                      address={address} setAddress={setAddress}
                      locality={locality} setLocality={setLocality}
                      landmark={landmark} setLandmark={setLandmark}
                      pincode={pincode} setPincode={setPincode}
                      locationVisibility={locationVisibility} setLocationVisibility={setLocationVisibility}
                      propLatitude={propLatitude} setPropLatitude={setPropLatitude}
                      propLongitude={propLongitude} setPropLongitude={setPropLongitude}
                      city={city}
                    />
                  </div>

                  {/* PG Sharing Types Multiselect */}
                  <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black uppercase text-indigo-950 tracking-wider">
                        Select Sharing Types Available at PG
                      </label>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full border border-indigo-200">
                        {pgSharingTypes.length} configured
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pgSharingTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => togglePgSharingType(type)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-indigo-600 text-white border-indigo-600 shadow-2xs flex items-center gap-1.5"
                        >
                          <span>✓</span>
                          <span>{type}</span>
                        </button>
                      ))}
                      {['Single Room (Private)', 'Double Sharing (2 Beds)', 'Triple Sharing (3 Beds)', '4-Sharing Bed']
                        .filter(type => !pgSharingTypes.includes(type))
                        .map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => togglePgSharingType(type)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-white text-gray-700 border-gray-200 hover:border-indigo-300 flex items-center gap-1"
                          >
                            <span>+</span>
                            <span>{type}</span>
                          </button>
                        ))}
                    </div>

                    {/* Add Custom PG Sharing Type input */}
                    <div className="pt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add custom sharing type (e.g. 5-Sharing Dorm, Suite with Balcony)..."
                        value={customPgSharing}
                        onChange={(e) => setCustomPgSharing(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomPgSharing();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 border border-indigo-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomPgSharing}
                        disabled={!customPgSharing.trim()}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                      >
                        + Add Custom
                      </button>
                    </div>
                  </div>

                  {/* PG Amenities Checklist */}
                  <AmenitiesSection
                    title="PG Facilities & Amenities"
                    badgeColor="indigo"
                    defaultAmenities={DEFAULT_PG_AMENITIES}
                    selectedAmenities={selectedAmenities}
                    toggleAmenity={toggleAmenity}
                    customAmenities={customAmenities}
                    onAddCustomAmenity={handleAddCustomAmenity}
                    onRemoveCustomAmenity={handleRemoveCustomAmenity}
                  />
                </div>
              )}

              {/* ============================================================== */}
              {/* SUBFORM C: ROOM / FLAT SPECIFIC REQUIREMENTS                   */}
              {/* ============================================================== */}
              {(propertyType === 'Room' || propertyType === 'Flat') && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Room / Flat Listing Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Spacious Semi-Furnished 1 BHK Flat near Coaching Hub"
                        className="w-full px-3.5 py-2.5 border border-teal-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-gray-900 bg-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Accommodation Sub-Type</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-teal-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-gray-800 bg-white"
                        value={roomSubtype}
                        onChange={(e) => setRoomSubtype(e.target.value)}
                      >
                        <option value="1 BHK Flat">1 BHK Flat</option>
                        <option value="2 BHK Flat">2 BHK Flat</option>
                        <option value="3 BHK Flat">3 BHK Flat</option>
                        <option value="1 RK Flat">1 RK Room / Flat</option>
                        <option value="Single Room">Independent Single Room</option>
                        <option value="Studio Apartment">Studio Apartment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Operating City</label>
                      <input
                        type="text"
                        required
                        list="popular-cities-list"
                        placeholder={user?.currentCity || "e.g. Bhopal, Indore"}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Unit Rent (₹ / month)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 8500"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-green-700"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Furnishing Status</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                        value={furnishing}
                        onChange={(e) => setFurnishing(e.target.value)}
                      >
                        <option value="Fully Furnished">Fully Furnished (Bed, Wardrobe, AC/Cooler, Fridge)</option>
                        <option value="Semi-Furnished">Semi-Furnished (Fan, Lights, Geyser, Wardrobe)</option>
                        <option value="Unfurnished">Unfurnished (Bare Unit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Tenants</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                        value={preferredTenants}
                        onChange={(e) => setPreferredTenants(e.target.value)}
                      >
                        <option value="Any / All Welcome">Any / All Welcome</option>
                        <option value="Bachelor Students">Bachelor Students</option>
                        <option value="Working Professionals">Working Professionals</option>
                        <option value="Families Only">Families Only</option>
                        <option value="Girls Only">Girls Only / Ladies</option>
                        <option value="Boys Only">Boys Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Floor Number</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                        value={floorNumber}
                        onChange={(e) => setFloorNumber(e.target.value)}
                      >
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="3rd Floor">3rd Floor</option>
                        <option value="4th Floor+">4th Floor or Higher</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Kitchen Setup</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                        value={kitchenType}
                        onChange={(e) => setKitchenType(e.target.value)}
                      >
                        <option value="Dedicated Private Kitchen">Dedicated Private Kitchen</option>
                        <option value="Modular Kitchen">Modular Kitchen</option>
                        <option value="Shared Kitchen">Shared Kitchen</option>
                        <option value="No Kitchen Allowed">No Kitchen Allowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Maintenance Charges (₹/mo)</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                        value={maintenanceCharges}
                        onChange={(e) => setMaintenanceCharges(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Electricity &amp; Water</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                        value={electricityCharges}
                        onChange={(e) => setElectricityCharges(e.target.value)}
                      >
                        <option value="Included in rent">Included in monthly rent</option>
                        <option value="As per meter unit">As per sub-meter unit consumption</option>
                      </select>
                    </div>

                    <PropertyLocationFormFields
                      address={address} setAddress={setAddress}
                      locality={locality} setLocality={setLocality}
                      landmark={landmark} setLandmark={setLandmark}
                      pincode={pincode} setPincode={setPincode}
                      locationVisibility={locationVisibility} setLocationVisibility={setLocationVisibility}
                      propLatitude={propLatitude} setPropLatitude={setPropLatitude}
                      propLongitude={propLongitude} setPropLongitude={setPropLongitude}
                      city={city}
                    />
                  </div>

                  {/* Room / Flat Amenities Checklist */}
                  <AmenitiesSection
                    title="Flat & Building Amenities"
                    badgeColor="teal"
                    defaultAmenities={DEFAULT_FLAT_AMENITIES}
                    selectedAmenities={selectedAmenities}
                    toggleAmenity={toggleAmenity}
                    customAmenities={customAmenities}
                    onAddCustomAmenity={handleAddCustomAmenity}
                    onRemoveCustomAmenity={handleRemoveCustomAmenity}
                  />
                </div>
              )}

              {/* Property Photo Gallery Manager (Hostel, PG, Room / Flat) */}
              <PropertyPhotoManager
                photos={propertyPhotos}
                onChange={setPropertyPhotos}
                propertyType={propertyType}
                badgeColor={propertyType === 'Hostel' ? 'purple' : propertyType === 'PG' ? 'indigo' : 'teal'}
              />
            </div>
          ) : activeTab === 'tiffin' ? (
            // DEDICATED TIFFIN CREATION FORM
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Different Places &amp; Kitchen Centers:</strong> If you operate tiffin kitchens across multiple places (e.g. Vijay Nagar, Bhawarkua, Palasia), each branch has its own local address, operating city, and independent daily food menu!
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tiffin Center / Branch Name (For this Place)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annapurna Tiffin - Vijay Nagar Hub"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Operating City</label>
                  <input
                    type="text"
                    required
                    list="popular-cities-list"
                    placeholder={user?.currentCity || "e.g. Bhopal, Indore"}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Plan Rate (₹ / month)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3200"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold text-green-700"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Single Veg Thali Rate (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 90"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold text-green-700"
                    value={vegPrice}
                    onChange={(e) => setVegPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Single Non-Veg Thali Rate (₹, Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 130 (leave blank if pure veg)"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold text-red-600"
                    value={nonVegPrice}
                    onChange={(e) => setNonVegPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery / Service Radius (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold text-gray-800"
                    value={tiffinServiceRadius}
                    onChange={(e) => setTiffinServiceRadius(e.target.value)}
                  />
                </div>

                {/* Dietary Preference Toggle */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Dietary Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPureVeg(true)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isPureVeg ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <span>100% Pure Vegetarian Kitchen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPureVeg(false)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        !isPureVeg ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                      <span>Veg &amp; Non-Veg Available</span>
                    </button>
                  </div>
                </div>

                {/* Meal Slots Provided */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Daily Meal Services Provided</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'Breakfast', label: 'Breakfast', time: '8:00 - 10:30 AM' },
                      { key: 'Lunch', label: 'Lunch Thali', time: '12:30 - 3:00 PM' },
                      { key: 'Dinner', label: 'Dinner Thali', time: '7:30 - 10:00 PM' },
                      { key: 'Sunday Special', label: 'Sunday Special', time: '12:00 - 4:00 PM' }
                    ].map(slot => {
                      const isChecked = mealsIncluded.includes(slot.key);
                      return (
                        <button
                          key={slot.key}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              if (mealsIncluded.length > 1) {
                                setMealsIncluded(mealsIncluded.filter(m => m !== slot.key));
                              }
                            } else {
                              setMealsIncluded([...mealsIncluded, slot.key]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs font-bold'
                              : 'bg-gray-50 border-gray-200 text-gray-400 font-medium'
                          }`}
                        >
                          <div className="text-xs">{slot.label}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{slot.time}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kitchen / Branch Multi-Photo Manager */}
                <div className="md:col-span-2">
                  <PropertyPhotoManager
                    photos={propertyPhotos}
                    onChange={setPropertyPhotos}
                    badgeColor="emerald"
                    title="Kitchen & Center Photos"
                    subtitle="Multi-select photos from your phone / computer (thali, kitchen, packaging). No URL needed!"
                    hideUrlInput={true}
                    presets={[
                      { name: 'Homestyle Thali', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
                      { name: 'Royal Feast', url: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80' },
                      { name: 'Fresh Tiffin', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80' },
                      { name: 'Clean Kitchen', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80' }
                    ]}
                  />
                </div>

                <div className="md:col-span-2 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <div className="space-y-0.5">
                    <strong className="block font-bold text-emerald-950">Daily Meal Dishes &amp; Menu Setup (Baad Me Dashboard Par):</strong>
                    <span className="text-[11px] text-emerald-800 leading-relaxed block">
                      Is branch ka daily breakfast, lunch, dinner aur weekly rotating dishes menu aap branch add hone ke baad apne dashboard ke <strong>"Weekly Menu Manager"</strong> se kabhi bhi har din (Monday se Sunday) ke mutabik set aur change kar sakte hain. Is form me koi dish dalne ki zaroorat nahi hai.
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kitchen / Branch Address (Specific to this Place)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14, Scheme 54, Near Velocity III, Vijay Nagar, Indore"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            // DEDICATED CLEANING & LAUNDRY CREATION FORM
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cleaning Hub / Branch Name (For this Place)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SmartClean Housekeeping & Laundry"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Operating City</label>
                  <input
                    type="text"
                    required
                    list="popular-cities-list"
                    placeholder={user?.currentCity || "e.g. Bhopal, Indore"}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Room Deep Cleaning Rate (₹ / room)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-green-700"
                    value={roomCleanRate}
                    onChange={(e) => setRoomCleanRate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Laundry Wash & Fold Rate (₹ / kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-green-700"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Service Hub / Branch Address (Specific to this Place)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45, Bhawarkua Main Road, Indore"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <PropertyPhotoManager
                    photos={propertyPhotos}
                    onChange={setPropertyPhotos}
                    badgeColor="teal"
                    title="Cleaning Hub & Service Photos"
                    subtitle="Multi-select photos from your phone / computer, or pick from verified presets below."
                    hideUrlInput={true}
                    presets={[
                      { name: 'Washroom Sanitization', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80' },
                      { name: 'Deep Room Cleaning', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80' },
                      { name: 'Doorstep Laundry', url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80' },
                      { name: 'Surface & Housekeeping', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80' }
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description & Highlights</label>
            <textarea
              required
              rows="3"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Describe your service quality, hygiene standards, turnaround time..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
            <button
              type="button"
              onClick={() => { resetForm(); setShowCreateForm(false); }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${
                activeTab === 'property' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : activeTab === 'tiffin'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white font-bold px-7 py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5`}
            >
              <span>
                {editingPropertyId 
                  ? (activeTab === 'tiffin' || activeTab === 'cleaning' ? 'Save & Update Branch Details' : 'Save & Update Details') 
                  : activeTab === 'tiffin' || activeTab === 'cleaning'
                  ? 'Add & Publish Branch at This Place' 
                  : propertyType === 'PG' 
                  ? 'Publish PG Listing Live' 
                  : propertyType === 'Room' || propertyType === 'Flat' 
                  ? 'Publish Flat / Room Listing Live' 
                  : 'Publish Hostel Listing Live'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

      {/* SECTION 1: ACTIVE LISTINGS PARALLEL GRID */}
      <div id="provider-listings-section" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              {activeTab === 'tiffin' && <Utensils className="w-5 h-5 text-emerald-600" />}
              {activeTab === 'cleaning' && <Sparkles className="w-5 h-5 text-teal-600" />}
              {activeTab === 'property' && <Home className="w-5 h-5 text-purple-600" />}
              <span>
                Active {activeTab === 'tiffin' 
                  ? 'Tiffin Centers & Branches Across Places' 
                  : activeTab === 'cleaning' 
                  ? 'Cleaning Hubs & Branches Across Places' 
                  : propertyType === 'PG' 
                  ? 'PG Accommodations' 
                  : propertyType === 'Room' || propertyType === 'Flat' 
                  ? 'Flats & Rooms' 
                  : 'Hostels'} ({displayedListings.length})
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              {activeTab === 'tiffin'
                ? 'Each kitchen center has its own address, local city, and independent weekly meal menu.'
                : activeTab === 'cleaning'
                ? 'Each service hub has its own address, local city, and independent housekeeping rates.'
                : 'Live listings accessible to tenants searching in this category.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { resetForm(); setShowCreateForm(true); }}
            className={`font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all hover:shadow cursor-pointer text-white self-start sm:self-auto shrink-0 ${
              activeTab === 'tiffin' ? 'bg-emerald-600 hover:bg-emerald-700' :
              activeTab === 'cleaning' ? 'bg-teal-600 hover:bg-teal-700' :
              'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'tiffin' ? '+ Add Tiffin Branch / Place' :
               activeTab === 'cleaning' ? '+ Add Cleaning Hub / Place' :
               propertyType === 'PG' ? '+ Add PG Listing' :
               propertyType === 'Room' || propertyType === 'Flat' ? '+ Add Room / Flat' :
               '+ Add Hostel Listing'}
            </span>
          </button>
        </div>

        {displayedListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedListings.map((item, idx) => {
              const isSelected = (item._id || item.id) === (
                activeTab === 'tiffin'
                  ? (activeTiffinBranch?._id || activeTiffinBranch?.id)
                  : activeTab === 'cleaning'
                  ? (activeCleaningBranch?._id || activeCleaningBranch?.id)
                  : (activeManagedProperty?._id || activeManagedProperty?.id)
              );
              return (
              <div 
                key={item._id || item.id} 
                onClick={() => {
                  if (activeTab === 'property') {
                    handleSelectPropertyForManagement(item._id || item.id);
                  } else if (activeTab === 'tiffin') {
                    handleSelectBranch(item._id || item.id);
                  } else if (activeTab === 'cleaning') {
                    handleSelectCleaningBranch(item._id || item.id);
                  }
                }}
                className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? (activeTab === 'tiffin' 
                        ? 'border-emerald-600 ring-2 ring-emerald-400/40 shadow-md'
                        : activeTab === 'cleaning'
                        ? 'border-teal-500 ring-2 ring-teal-400/40 shadow-md'
                        : 'border-indigo-400 ring-2 ring-indigo-400/40 shadow-md')
                    : (activeTab === 'cleaning'
                        ? 'border-gray-200/90 hover:border-teal-300'
                        : 'border-gray-200/90 hover:border-emerald-300')
                }`}
              >
                <div>
                  {(() => {
                    const cardPhoto = getDiverseServicePhoto(item, idx);
                    return (
                      <div className="h-44 rounded-2xl overflow-hidden bg-gray-100 relative mb-4">
                        <img
                          src={cardPhoto}
                          alt={item.title || item.businessName}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = item.category === 'Tiffin' || activeTab === 'tiffin'
                              ? DEFAULT_TIFFIN_PHOTOS[idx % DEFAULT_TIFFIN_PHOTOS.length]
                              : DEFAULT_CLEANING_PHOTOS[idx % DEFAULT_CLEANING_PHOTOS.length];
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10 max-w-[70%]">
                          <span className="bg-gray-900/85 text-white font-extrabold px-2.5 py-1 rounded-lg uppercase text-[10px] backdrop-blur-md shadow-xs">
                            {item.propertyType || item.category || (activeTab === 'tiffin' ? 'Tiffin' : activeTab === 'cleaning' ? 'Cleaning' : 'Hostel')}
                          </span>
                          {isSelected && (
                            <span className={`text-white font-extrabold px-2.5 py-1 rounded-lg uppercase text-[10px] backdrop-blur-md shadow-xs flex items-center gap-1.5 animate-fadeIn ${
                              activeTab === 'tiffin' ? 'bg-emerald-600' :
                              activeTab === 'cleaning' ? 'bg-teal-600' : 'bg-emerald-600'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              <span>{activeTab === 'property' ? 'Live Console' : 'Active Branch'}</span>
                            </span>
                          )}
                        </div>
                        <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs bg-emerald-600 text-white z-10">
                          ✓ Verified Provider
                        </span>
                        {item.photos?.length > 1 && (
                          <span className="absolute bottom-3 right-3 bg-black/75 text-white font-bold px-2 py-0.5 rounded-md text-[10px] backdrop-blur-md flex items-center gap-1 shadow-xs pointer-events-none">
                            <Camera className="w-3 h-3 text-purple-300" />
                            <span>{item.photos.length} Photos</span>
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="font-black text-gray-900 text-base line-clamp-1 group-hover:text-green-600 transition-colors">
                      {item.title || item.businessName}
                    </h3>
                  </div>

                  {item.address && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-3 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="line-clamp-1">{item.address}, {item.city}</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 font-medium">
                    {item.description}
                  </p>

                  {/* Highlights by category */}
                  {activeTab === 'property' && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-800 space-y-1.5 mb-3">
                      {item.propertyType === 'Room' || item.propertyType === 'Flat' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">
                              {item.roomType || '1 BHK Flat'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                              {item.furnishing || 'Semi-Furnished'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                            <div className="bg-white p-1 rounded-md border border-gray-200">
                              <span className="text-gray-400 block text-[9px]">Tenants</span>
                              <span className="font-bold text-gray-800">{item.preferredTenants || 'Any / All'}</span>
                            </div>
                            <div className="bg-white p-1 rounded-md border border-gray-200">
                              <span className="text-gray-400 block text-[9px]">Maintenance</span>
                              <span className="font-bold text-green-700">{item.maintenanceCharges ? `₹${item.maintenanceCharges}/mo` : 'Included'}</span>
                            </div>
                          </div>
                        </>
                      ) : item.propertyType === 'PG' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                              {item.hostelCategory || 'Boys PG'}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {item.foodPolicy || (item.foodAvailable ? '3 Meals Included' : 'Self Cook')}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                            <div className="bg-white p-1 rounded-md border border-gray-200">
                              <span className="text-gray-400 block text-[9px]">Curfew / Gate</span>
                              <span className="font-bold text-gray-800">{item.gateTiming || 'No Curfew'}</span>
                            </div>
                            <div className="bg-white p-1 rounded-md border border-gray-200">
                              <span className="text-gray-400 block text-[9px]">Notice Period</span>
                              <span className="font-bold text-gray-800">{item.noticePeriod || '1 Month'}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                              {item.hostelCategory || 'Girls & Boys Hostel'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500">
                              {item.foodAvailable ? 'Food Included' : 'Food Optional'}
                            </span>
                          </div>
                          {item.roomTiers && item.roomTiers.length > 0 ? (
                            <div className={`grid ${item.roomTiers.length === 1 ? 'grid-cols-2' : item.roomTiers.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 pt-1 text-[10px]`}>
                              {item.roomTiers.map(t => (
                                <div key={t.roomType} className="bg-white p-1.5 rounded-md border border-gray-200 text-center">
                                  <span className="font-bold block text-gray-700 truncate">{t.roomType.replace(' Room', '')}</span>
                                  <span className="text-green-700 font-extrabold">₹{t.rentPerPerson?.toLocaleString('en-IN')}/mo</span>
                                  <span className="text-[9px] text-gray-500 block">{t.availableBeds || 0} open of {t.totalBeds || item.totalBeds || 1}</span>
                                </div>
                              ))}
                              {item.roomTiers.length === 1 && (
                                <div className="bg-purple-50/60 p-1.5 rounded-md border border-purple-200 text-center flex flex-col justify-center">
                                  <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">Total Building Capacity</span>
                                  <span className="font-extrabold text-purple-900 text-xs">{item.totalBeds || item.roomTiers[0]?.totalBeds || 20} Total Beds</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-500">
                              {item.roomType || 'Hostel Bed'} · {item.availableBeds || 1} of {item.totalBeds || item.occupancy || 2} beds open
                            </div>
                          )}

                          {/* Daily Hostel Mess Menu Strip OR Rules & Living Info (Maintains exact balanced card height) */}
                          {item.foodAvailable ? (
                            <div className="pt-2 border-t border-purple-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                                  <Utensils className="w-3 h-3 text-amber-600" />
                                  <span>Daily Mess Menu</span>
                                </span>
                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                  Breakfast · Lunch · Dinner
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-[9.5px]">
                                <div className="bg-white p-1 rounded border border-gray-200" title={item.messMenu?.breakfast || 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai'}>
                                  <span className="text-[8px] font-bold text-amber-800 block">🌅 Breakfast</span>
                                  <span className="font-semibold text-gray-800 truncate block">{item.messMenu?.breakfast || 'Poha & Chai'}</span>
                                </div>
                                <div className="bg-white p-1 rounded border border-gray-200" title={item.messMenu?.lunch || 'Dal Tadka, Shahi Paneer, 4 Butter Phulkas, Steamed Rice & Green Salad'}>
                                  <span className="text-[8px] font-bold text-amber-800 block">☀️ Lunch</span>
                                  <span className="font-semibold text-gray-800 truncate block">{item.messMenu?.lunch || 'Dal, Paneer & Rice'}</span>
                                </div>
                                <div className="bg-white p-1 rounded border border-gray-200" title={item.messMenu?.dinner || 'Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis & Jeera Rice'}>
                                  <span className="text-[8px] font-bold text-amber-800 block">🌙 Dinner</span>
                                  <span className="font-semibold text-gray-800 truncate block">{item.messMenu?.dinner || 'Mix Veg & Rotis'}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-purple-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                                  <span>Hostel Rules &amp; Facilities</span>
                                </span>
                                <span className="text-[9px] font-extrabold bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                                  Food Optional / Self-Cook
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-[9.5px]">
                                <div className="bg-white p-1.5 rounded-lg border border-gray-200 text-center">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Gate Curfew</span>
                                  <span className="font-bold text-gray-800 truncate block">{item.gateTiming || '10:30 PM'}</span>
                                </div>
                                <div className="bg-white p-1.5 rounded-lg border border-gray-200 text-center">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Security Dep.</span>
                                  <span className="font-bold text-purple-700 truncate block">{item.securityDeposit ? `₹${item.securityDeposit.toLocaleString('en-IN')}` : '₹5,000'}</span>
                                </div>
                                <div className="bg-white p-1.5 rounded-lg border border-gray-200 text-center">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Mess Facility</span>
                                  <span className="font-bold text-amber-700 truncate block">Self / External</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {item.category === 'Tiffin' && (
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 space-y-0.5 mb-3">
                      <span className="font-bold block">✓ Meals: {item.tiffinDetails?.meals?.join(', ') || 'Lunch & Dinner'}</span>
                      <span className="text-gray-500 line-clamp-1">Today: {item.tiffinDetails?.lunch || item.tiffinDetails?.breakfast || item.tiffinDetails?.menu?.monday || todaySpecialDish || lunchDish || 'Fresh Homestyle Meals'}</span>
                    </div>
                  )}

                  {(item.category === 'Cleaning' || item.category === 'Laundry') && (
                    <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-150 text-[11px] text-teal-900 space-y-0.5 mb-3">
                      <span className="font-bold block">✓ Room Cleaning & Laundry Pickup</span>
                      <span className="text-gray-500">24-hour turnaround · Doorstep service</span>
                    </div>
                  )}
                </div>
                
                {/* Card Footer: Tier 1 (Price & Selected status) + Tier 2 (Action Buttons Bar) */}
                <div className="border-t border-gray-150 pt-3.5 mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">Pricing Rate</span>
                      <span className="text-base sm:text-lg font-black text-emerald-600">
                        {getPricingDisplay(item)}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        activeTab === 'tiffin' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        activeTab === 'cleaning' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                        'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active Place</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                        Click to select
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTab === 'property' && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPropertyForManagement(item._id || item.id);
                            switchSectionTab('rooms');
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-xs'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                          title="Open Live Bed Vacancy Broadcaster for this property"
                        >
                          <BedDouble className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{isSelected ? 'Rooms Open' : 'Manage Rooms'}</span>
                        </button>

                        {item.propertyType === 'Hostel' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.foodAvailable) {
                                setIsEditingMenu(true);
                                switchSectionTab('menu');
                              } else {
                                handleEditProperty(item);
                                setFoodAvailable(true);
                              }
                            }}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              item.foodAvailable
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                            }`}
                            title={item.foodAvailable ? "Manage and edit hostel mess menu (Breakfast, Lunch, Dinner)" : "Add mess food facility to this hostel"}
                          >
                            <Utensils className="w-3.5 h-3.5 text-amber-600" />
                            <span>{item.foodAvailable ? 'Mess Menu' : '+ Add Mess'}</span>
                          </button>
                        )}
                      </>
                    )}

                    {activeTab === 'tiffin' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBranch(item._id || item.id);
                          switchSectionTab('menu');
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 ${
                          isSelected
                            ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                        }`}
                        title="Manage daily menu and dishes for this branch"
                      >
                        <Utensils className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{isSelected ? 'Managing Menu' : 'Manage Menu'}</span>
                      </button>
                    )}

                    {activeTab === 'cleaning' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCleaningBranch(item._id || item.id);
                          switchSectionTab('menu');
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-xs'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80'
                        }`}
                        title="Select this cleaning hub as active place"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{isSelected ? 'Managing Hub' : 'Manage Hub'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTab === 'property') handleEditProperty(item);
                        else handleEditService(item);
                      }}
                      className="py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Edit branch details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {(activeTab === 'tiffin' || activeTab === 'cleaning') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(item._id || item.id, item.businessName);
                        }}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold border border-red-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="Delete branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white border border-gray-200 rounded-3xl text-gray-400">
            {activeTab === 'tiffin' && (
              <>
                <Utensils className="w-12 h-12 mx-auto mb-2 text-emerald-300" />
                <p className="text-xs font-bold text-gray-700">No tiffin branches or kitchen centers added yet.</p>
                <button 
                  onClick={() => { resetForm(); setShowCreateForm(true); }} 
                  className="text-xs text-emerald-600 font-bold underline mt-2 inline-block cursor-pointer"
                >
                  + Add your first Tiffin Branch (Place)
                </button>
              </>
            )}
            {activeTab === 'cleaning' && (
              <>
                <Sparkles className="w-12 h-12 mx-auto mb-2 text-teal-300" />
                <p className="text-xs font-bold text-gray-700">No cleaning branches or service hubs added yet.</p>
                <button 
                  onClick={() => { resetForm(); setShowCreateForm(true); }} 
                  className="text-xs text-teal-600 font-bold underline mt-2 inline-block cursor-pointer"
                >
                  + Add your first Cleaning Branch (Place)
                </button>
              </>
            )}
            {activeTab === 'property' && (
              <div className="py-6 max-w-md mx-auto space-y-2">
                <div className="w-12 h-12 mx-auto bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-150 shadow-2xs">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-gray-900">
                  No {propertyType === 'PG' ? 'PG Accommodations' : propertyType === 'Room' || propertyType === 'Flat' ? 'Flats or Rooms' : 'Hostels'} Published Yet
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Please complete and submit the setup form above to publish your property live on StaySync.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

        </div>
      )}

      {/* SECTION: PROPERTY LOCATION MANAGEMENT (Part 9) */}
      {activeSectionTab === 'locations' && activeTab === 'property' && (
        <ProviderLocationManagement
          listings={displayedListings}
          onEditLocation={(prop) => {
            handleEditProperty(prop);
            setShowCreateForm(true);
            switchSectionTab('listings');
          }}
          onRefresh={loadProviderData}
        />
      )}

      {/* SECTION 2: INCOMING TENANT INQUIRIES & SERVICE BOOKINGS */}
      {activeSectionTab === 'inquiries' && (
      <div id="provider-inquiries-section" className="space-y-4 pt-2 scroll-mt-20">
        {(() => {
          const pendingRequests = requests.filter(r => r.status === 'Pending');
          const acceptedRequests = requests.filter(r => r.status === 'Accepted');
          const rejectedRequests = requests.filter(r => r.status === 'Rejected');
          const displayedReqs = requests.filter(r => {
            if (inquiryFilter === 'Pending') return r.status === 'Pending';
            if (inquiryFilter === 'Accepted') return r.status === 'Accepted';
            if (inquiryFilter === 'Rejected') return r.status === 'Rejected';
            return true;
          });

          return (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-2xs shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <span>Customer Inquiries &amp; Notifications</span>
                      <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full border border-gray-200">
                        {requests.length}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      Direct booking applications and inquiry messages submitted by seekers.
                    </p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/80 overflow-x-auto shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setInquiryFilter('All')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      inquiryFilter === 'All'
                        ? 'bg-white text-gray-900 shadow-2xs font-black'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All ({requests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryFilter('Pending')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      inquiryFilter === 'Pending'
                        ? 'bg-amber-500 text-white shadow-2xs font-black'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Pending ({pendingRequests.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryFilter('Accepted')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      inquiryFilter === 'Accepted'
                        ? 'bg-emerald-600 text-white shadow-2xs font-black'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Accepted ({acceptedRequests.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryFilter('Rejected')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      inquiryFilter === 'Rejected'
                        ? 'bg-red-600 text-white shadow-2xs font-black'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    <span>Declined ({rejectedRequests.length})</span>
                  </button>
                </div>
              </div>

              {displayedReqs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {displayedReqs.map(req => (
                    <div key={req._id} className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={req.sender?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt="Tenant"
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-black text-gray-900 text-sm truncate">{req.sender?.name || 'Interested Customer'}</h4>
                              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                {req.sender?.phone && (
                                  <a
                                    href={`tel:${req.sender.phone}`}
                                    className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{req.sender.phone}</span>
                                  </a>
                                )}
                                {req.sender?.email && (
                                  <a
                                    href={`mailto:${req.sender.email}`}
                                    className="text-[11px] text-gray-500 hover:underline flex items-center gap-1 truncate max-w-[160px]"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{req.sender.email}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border whitespace-nowrap flex items-center gap-1 ${
                              req.status === 'Pending' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : req.status === 'Accepted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                              {req.status === 'Accepted' && <Check className="w-3 h-3" />}
                              {req.status === 'Rejected' && <X className="w-3 h-3" />}
                              <span>{req.status}</span>
                            </span>
                          </div>
                        </div>

                        {/* Property / Service Context Chip */}
                        {(req.property?.title || req.itemId?.title || req.service?.title) && (
                          <div className="text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-150 flex items-center justify-between">
                            <span className="font-semibold text-gray-600 truncate">
                              Regarding: <strong className="text-gray-900">{req.property?.title || req.itemId?.title || req.service?.title}</strong>
                            </span>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                              {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}

                        {/* Customer Note */}
                        <div className="bg-gray-50/90 p-3.5 sm:p-4 rounded-2xl border border-gray-200/60 space-y-2">
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Customer Note</span>
                          <p className="text-xs text-gray-700 italic font-medium break-words leading-relaxed">"{req.message}"</p>
                          {req.proposedPrice && (
                            <p className="text-xs font-extrabold text-gray-800 pt-2 border-t border-gray-200/60 mt-2 flex items-center justify-between">
                              <span className="text-gray-500">Proposed Budget / Offer:</span>
                              <strong className="text-emerald-700 font-black text-sm">₹{req.proposedPrice.toLocaleString('en-IN')}</strong>
                            </p>
                          )}
                        </div>

                        {/* Provider Response Display */}
                        {req.responseMessage && (
                          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80 text-xs text-gray-700 font-medium break-words">
                            <strong className="text-emerald-800 font-bold block mb-0.5">Your Sent Reply:</strong>
                            <p className="text-gray-700 italic">"{req.responseMessage}"</p>
                          </div>
                        )}
                      </div>

                      {/* Pending Action Triggers & Quick Snippets */}
                      {req.status === 'Pending' && (
                        <div className="pt-3 border-t border-gray-150 space-y-2.5">
                          {selectedReq?._id === req._id ? (
                            <div className="space-y-3">
                              {/* Quick Reply Snippet Buttons */}
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Quick Fill:</span>
                                <button
                                  type="button"
                                  onClick={() => setResponseMsg('Confirmed! Slot available, visit scheduled for tomorrow.')}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                >
                                  ✓ Slot Available
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setResponseMsg('Booking accepted! Please call to finalize move-in details.')}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
                                >
                                  ✓ Finalize Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setResponseMsg('Sorry, all beds/slots are currently occupied.')}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                                >
                                  ✕ Currently Full
                                </button>
                              </div>

                              <input
                                type="text"
                                placeholder={activeTab === 'tiffin' ? 'e.g. Confirmed! Tiffin delivery begins tomorrow at 12:30 PM.' : 'e.g. Slot confirmed! Visit scheduled for tomorrow 3 PM.'}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                value={responseMsg}
                                onChange={(e) => setResponseMsg(e.target.value)}
                              />

                              <div className="flex gap-2 justify-end flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReq(null)}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl text-gray-600 font-bold cursor-pointer transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(req._id, 'Accepted')}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept &amp; Confirm</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  setSelectedReq(req);
                                  setResponseMsg('Confirmed! Slot available, please call to finalize visit.');
                                }}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Respond to Inquiry</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Check-In / Check-Out Actions for Confirmed & Checked In Bookings */}
                      {(req.status === 'Confirmed' || req.status === 'Accepted' || req.status === 'Payment Pending' || req.status === 'Checked In') && (
                        <div className="pt-3 border-t border-gray-150 flex items-center justify-between gap-2 flex-wrap">
                          {req.assignedBed?.roomNumber ? (
                            <span className="text-xs bg-purple-100 text-purple-800 font-black px-2.5 py-1 rounded-xl border border-purple-200">
                              🛏️ {req.assignedBed.roomNumber} · {req.assignedBed.bedNumber}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-500 font-semibold">
                              Status: <strong className="text-gray-900">{req.status}</strong>
                            </span>
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                            {(req.status === 'Confirmed' || req.status === 'Accepted') && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(req._id, 'Checked In')}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Mark Checked In</span>
                              </button>
                            )}
                            {req.status === 'Checked In' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(req._id, 'Completed')}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Check-Out</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl text-gray-400 space-y-2">
                  <ClipboardList className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-xs font-bold text-gray-700">
                    {inquiryFilter === 'All'
                      ? 'No inquiries or booking orders received yet.'
                      : `No ${inquiryFilter.toLowerCase()} inquiries.`}
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                    Customer requests for your {activeTab} service will appear here in real-time.
                  </p>
                </div>
              )}
            </>
          );
        })()}
      </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: MY RESIDENTS & CUSTOMER DIRECTORY                  */}
      {/* ============================================================== */}
      {activeSectionTab === 'customers' && (
      <div id="provider-users-section" className="space-y-4 pt-2 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80 shadow-2xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>My Residents &amp; Customers</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  {providerCustomers.length}
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Complete directory of students, tenants, and clients associated with your services.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, room..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs">
              {['All', 'Active', 'Pending'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCustomerStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    customerStatusFilter === st
                      ? 'bg-white text-blue-800 shadow-2xs font-black'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3.5 px-4 sm:px-6">Customer / Tenant</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Service / Room Allocation</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Billing / Rate</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={cust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={cust.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <strong className="text-gray-900 font-black block truncate">{cust.name}</strong>
                            <span className="text-[10px] text-gray-400 font-medium block">
                              Joined {new Date(cust.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {cust.phone ? (
                            <a href={`tel:${cust.phone}`} className="text-emerald-700 hover:underline font-bold flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{cust.phone}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">No phone</span>
                          )}
                          {cust.email && (
                            <a href={`mailto:${cust.email}`} className="text-gray-500 hover:underline flex items-center gap-1 text-[11px] truncate max-w-[150px]">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate">{cust.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-gray-800 block truncate max-w-[200px]">{cust.latestBooking}</span>
                          {cust.assignedBed ? (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-black px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                              🛏️ {cust.assignedBed}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Regular booking</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          cust.status === 'Checked In' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          cust.status === 'Confirmed' || cust.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          cust.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {cust.status === 'Checked In' && <UserCheck className="w-3 h-3" />}
                          {cust.status === 'Confirmed' && <Check className="w-3 h-3" />}
                          {cust.status === 'Pending' && <Clock className="w-3 h-3" />}
                          <span>{cust.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <strong className="text-gray-900 font-black block">₹{cust.amount?.toLocaleString('en-IN')}</strong>
                          <span className={`text-[10px] font-bold ${
                            cust.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            ● {cust.paymentStatus}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cust.phone && (
                            <a
                              href={`tel:${cust.phone}`}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                              title="Call Customer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {cust.email && (
                            <a
                              href={`mailto:${cust.email}`}
                              className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                              title="Email Customer"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-3xl text-gray-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-xs font-bold text-gray-700">No customers found</p>
            <p className="text-[11px] text-gray-400">
              {customerSearch ? 'Try a different search keyword.' : 'Tenants and service customers will appear here automatically upon inquiry or booking.'}
            </p>
          </div>
        )}
      </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: PAYMENT & REVENUE HISTORY                          */}
      {/* ============================================================== */}
      {activeSectionTab === 'payments' && (
      <div id="provider-payments-section" className="space-y-4 pt-2 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-2xs shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>Payments &amp; Revenue Ledger</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  ₹{totalReceivedRevenue.toLocaleString('en-IN')} Received
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Audit transactions, track monthly student rent collections, and monitor net settlements.
              </p>
            </div>
          </div>

          {/* Quick Action: Settlements Modal */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSettlementsModal(true)}
              className="text-xs font-bold px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Settlement Payouts</span>
            </button>
          </div>
        </div>

        {/* 3 Summary Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/30 p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">Total Collected</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <strong className="text-2xl font-black text-emerald-800 tracking-tight block">
              ₹{totalReceivedRevenue.toLocaleString('en-IN')}
            </strong>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
              ✓ Successfully processed &amp; cleared
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/30 p-4 sm:p-5 rounded-3xl border border-blue-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">Completed Payments</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <strong className="text-2xl font-black text-blue-900 tracking-tight block">
              {combinedPayments.filter(p => p.status === 'Paid').length}
            </strong>
            <span className="text-[10px] text-blue-600 font-semibold block mt-1">
              Out of {combinedPayments.length} total orders / invoices
            </span>
          </div>

          <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/30 p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Pending Receivables</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <strong className="text-2xl font-black text-amber-900 tracking-tight block">
              ₹{totalPendingPayments.toLocaleString('en-IN')}
            </strong>
            <span className="text-[10px] text-amber-600 font-semibold block mt-1">
              {combinedPayments.filter(p => p.status === 'Pending' || p.status === 'Created').length} pending collection
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by transaction ref, customer..."
              value={paymentSearch}
              onChange={(e) => setPaymentSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs self-start sm:self-auto">
            {['All', 'Paid', 'Pending'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setPaymentStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  paymentStatusFilter === st
                    ? 'bg-white text-emerald-800 shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length > 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3.5 px-4 sm:px-6">Transaction Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Service / Room</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id || p.ref} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono font-bold text-gray-800 block text-[11px]">{p.ref}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <strong className="text-gray-900 font-bold block">{p.customerName}</strong>
                          {p.customerPhone && (
                            <span className="text-[10px] text-gray-400 block">{p.customerPhone}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-gray-700 font-medium block truncate max-w-[180px]">{p.serviceOrStay}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-sm font-black text-gray-900 block">₹{Number(p.amount).toLocaleString('en-IN')}</strong>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-md border border-gray-200">
                          {p.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {p.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{p.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(p)}
                          className="px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 rounded-lg text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-3xl text-gray-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-xs font-bold text-gray-700">No payment records found</p>
            <p className="text-[11px] text-gray-400">
              {paymentSearch ? 'Try adjusting your search criteria.' : 'Transactions will appear here as users complete online or direct bookings.'}
            </p>
          </div>
        )}
      </div>
      )}

      {/* RECEIPT / INVOICE MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Payment Receipt</h3>
                  <span className="text-[10px] font-mono text-gray-400">{selectedReceipt.ref}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Amount Received</span>
              <p className="text-3xl font-black text-emerald-800">₹{Number(selectedReceipt.amount).toLocaleString('en-IN')}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Status: {selectedReceipt.status}
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-gray-100">
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Customer:</span>
                <strong className="text-gray-900">{selectedReceipt.customerName}</strong>
              </div>
              {selectedReceipt.customerPhone && (
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <span className="text-gray-700 font-mono">{selectedReceipt.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">For:</span>
                <strong className="text-gray-900 truncate max-w-[220px] text-right">{selectedReceipt.serviceOrStay}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Payment Mode:</span>
                <span className="text-gray-800 font-bold">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Date &amp; Time:</span>
                <span className="text-gray-700">{new Date(selectedReceipt.date).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-150 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PROPERTY MANAGEMENT MODAL (TRIGGERED ON CARD CLICK OR "MANAGE ROOMS & BEDS") */}
      {showPropertyManageModal && activeManagedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-slate-50 rounded-3xl max-w-5xl w-full max-w-full min-w-0 p-4 sm:p-6 shadow-2xl border border-gray-200 my-auto space-y-4 animate-scaleUp max-h-[92vh] overflow-y-auto overflow-x-hidden">
            <PropertyBroadcasterConsole
              activeManagedProperty={activeManagedProperty}
              displayedListings={displayedListings}
              managedCapacity={managedCapacity}
              managedOccupied={managedOccupied}
              managedOccupancyRate={managedOccupancyRate}
              managedVacancies={managedVacancies}
              managedRentRoll={managedRentRoll}
              hostelRooms={hostelRooms}
              pgRooms={pgRooms}
              flatUnits={flatUnits}
              handleToggleRoomStatus={handleToggleRoomStatus}
              handleTogglePgBed={handleTogglePgBed}
              handleToggleFlatUnit={handleToggleFlatUnit}
              handleOpenAddPgRoom={handleOpenAddPgRoom}
              handleDeletePgRoom={handleDeletePgRoom}
              handleEditProperty={handleEditProperty}
              handleSelectPropertyForManagement={handleSelectPropertyForManagement}
              acceptedTenants={acceptedTenants}
              onClose={() => setShowPropertyManageModal(false)}
              isModal={true}
            />

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs">
              <p className="text-gray-500 font-medium text-[11px]">
                All bed vacancy changes are instantly updated in search for prospective students and tenants.
              </p>
              <button
                type="button"
                onClick={() => setShowPropertyManageModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Done / Close Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PG ROOM MODAL */}
      {showAddPgRoomModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-indigo-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-2xs">
                  <BedDouble className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Add PG Room</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Add a room or sharing tier with live bed capacity and rent.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPgRoomModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPgRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Room Name / Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 101, Single AC Room, Wing B"
                  value={newPgRoomName}
                  onChange={(e) => setNewPgRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-indigo-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sharing / Occupancy Category</label>
                <select
                  value={newPgSharingType}
                  onChange={(e) => handlePgSharingTypeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-indigo-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Single Room (Private)">Single Room (Private - 1 Bed)</option>
                  <option value="Double Sharing (2 Beds)">Double Sharing (2 Beds)</option>
                  <option value="Triple Sharing (3 Beds)">Triple Sharing (3 Beds)</option>
                  <option value="4-Sharing Bed">4-Sharing Bed (4 Beds)</option>
                  <option value="Custom">+ Custom Sharing Category...</option>
                </select>
              </div>

              {newPgSharingType === 'Custom' && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Custom Sharing Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5-Sharing Dorm, Suite with Balcony"
                    value={newPgCustomSharing}
                    onChange={(e) => setNewPgCustomSharing(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-indigo-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Rent per Bed (₹)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="7000"
                    value={newPgRent}
                    onChange={(e) => setNewPgRent(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border border-indigo-200 rounded-xl text-xs font-black text-green-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Beds in Room</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPgTotalBeds}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPgTotalBeds(val);
                      if (parseInt(newPgAvailableBeds) > parseInt(val)) {
                        setNewPgAvailableBeds(val);
                      }
                    }}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vacant / Available Beds</label>
                  <input
                    type="number"
                    min="0"
                    max={newPgTotalBeds || 10}
                    required
                    value={newPgAvailableBeds}
                    onChange={(e) => setNewPgAvailableBeds(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAddPgRoomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingPgRoom}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{addingPgRoom ? 'Adding Room...' : 'Add Room & Broadcast Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Owner Insights Modal */}
      <AIOwnerInsightsModal
        isOpen={showAIInsightsModal}
        onClose={() => setShowAIInsightsModal(false)}
      />

      {/* Owner Settlements & Commission Modal */}
      <OwnerSettlementsModal
        isOpen={showSettlementsModal}
        onClose={() => setShowSettlementsModal(false)}
      />

    </div>
  );
};

export default ProviderDashboard;
