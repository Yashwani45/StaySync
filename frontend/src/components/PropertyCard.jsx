import React, { useState, useMemo } from 'react';
import { Star, MapPin, Heart, ArrowRight, CheckCircle2, Users, BedDouble, Utensils, Shield, ShieldCheck, Check, ChevronLeft, ChevronRight, Camera, DoorClosed, Building2, Home, Clock, FileText } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import { normalizeImageUrl } from '../utils/imageHelper';

const PropertyCard = ({
  property,
  onInquire,
  onShortlist,
  isShortlisted,
  onSelectStay,
  isSelected = false,
  onViewDetails
}) => {
  const {
    _id,
    title,
    propertyType = 'Hostel',
    hostelCategory = 'Girls & Boys Hostel',
    address,
    city,
    photos,
    amenities = [],
    foodAvailable = false,
    verificationStatus,
    rating = 4.5,
    distance,
    roomTiers = []
  } = property;

  const displayDistance = distance || property.distanceKm;

  // Selected room tier state (defaults to property's active roomType or first available tier)
  const initialTierType = property.roomType || '2-Seater Room';
  const [selectedTierType, setSelectedTierType] = useState(initialTierType);

  // Multiple photos carousel support
  const validPhotos = useMemo(() => {
    if (Array.isArray(photos) && photos.length > 0) {
      return photos.filter(p => typeof p === 'string' && p.trim().length > 0);
    }
    return [];
  }, [photos]);

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const safePhotoIdx = validPhotos.length > 0 ? (currentPhotoIdx % validPhotos.length) : 0;
  const imageSrc = normalizeImageUrl(validPhotos[safePhotoIdx] || photos?.[0]);

  // Active tier calculation
  const activeTier = (roomTiers && roomTiers.length > 0)
    ? (roomTiers.find(t => t.roomType === selectedTierType && t.isAvailable !== false) || roomTiers[0])
    : null;

  const currentRoomType = activeTier ? activeTier.roomType : (property.roomType || '2-Seater Room');
  const currentRent = activeTier ? activeTier.rentPerPerson : (property.rentPerPerson || property.monthlyRent || 6000);
  const currentOccupancy = activeTier ? activeTier.occupancy : (property.occupancy || (currentRoomType === '1-Seater Room' ? 1 : currentRoomType === '3-Seater Room' ? 3 : 2));
  const currentAvailableBeds = activeTier ? activeTier.availableBeds : (property.availableBeds !== undefined ? property.availableBeds : 1);
  const currentTotalBeds = activeTier ? (activeTier.totalBeds || activeTier.occupancy) : (property.totalBeds || currentOccupancy);

  const isSharedRoom = currentOccupancy > 1;
  const occupiedBeds = Math.max(0, currentOccupancy - currentAvailableBeds);

  // Address formatting cleanup
  const cleanAddress = useMemo(() => {
    return [address, city]
      .filter(Boolean)
      .join(', ')
      .replace(/\s+,/g, ', ')
      .replace(/,\s*,/g, ', ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }, [address, city]);

  // Visual category styling
  const getCategoryBadgeStyle = (cat) => {
    if (propertyType === 'PG') {
      return {
        bg: 'bg-indigo-600/90 text-white border-indigo-400/30',
        label: cat?.includes('Girls') ? 'Girls PG' : cat?.includes('Boys') ? 'Boys PG' : 'Unisex / Coliving PG',
        dot: 'bg-indigo-300'
      };
    }
    if (propertyType === 'Room' || propertyType === 'Flat') {
      return {
        bg: 'bg-teal-700/90 text-white border-teal-400/30',
        label: 'Flat / Apartment',
        dot: 'bg-teal-300'
      };
    }
    if (cat === 'Girls Hostel') {
      return {
        bg: 'bg-rose-600/90 text-white border-rose-400/30',
        label: 'Girls Hostel',
        dot: 'bg-rose-300'
      };
    }
    if (cat === 'Boys Hostel') {
      return {
        bg: 'bg-blue-600/90 text-white border-blue-400/30',
        label: 'Boys Hostel',
        dot: 'bg-blue-300'
      };
    }
    return {
      bg: 'bg-slate-900/90 text-white border-slate-700/40',
      label: 'Co-ed Hostel',
      dot: 'bg-emerald-400'
    };
  };

  const catStyle = getCategoryBadgeStyle(hostelCategory);

  return (
    <div className={`bg-white rounded-3xl shadow-xs border overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 relative ${
      isSelected 
        ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' 
        : 'border-slate-200 hover:border-emerald-400'
    }`}>
      
      {/* Property Photo */}
      <div 
        onClick={() => onViewDetails && onViewDetails(property)}
        className="relative h-56 overflow-hidden bg-slate-100 group/photo cursor-pointer"
      >
        <img
          src={imageSrc}
          alt={title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Vignettes for High Contrast Legibility */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

        {/* Carousel Navigation Arrows when multiple photos exist */}
        {validPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentPhotoIdx((prev) => (prev <= 0 ? validPhotos.length - 1 : prev - 1));
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentPhotoIdx((prev) => (prev >= validPhotos.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Mini indicator dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 pointer-events-none">
              {validPhotos.slice(0, 6).map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1 rounded-full transition-all ${
                    dotIdx === safePhotoIdx ? 'w-3.5 bg-white shadow-xs' : 'w-1 bg-white/50'
                  }`}
                />
              ))}
              {validPhotos.length > 6 && (
                <span className="text-[8px] text-white/80 font-bold leading-none">+</span>
              )}
            </div>
          </>
        )}
        
        {/* Top-Left Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10 max-w-[75%]">
          {isSelected && (
            <span className="bg-emerald-600 text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3 h-3" /> Selected Stay
            </span>
          )}

          {/* Hostel Category Badge */}
          <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1.5 border ${catStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot} animate-pulse`}></span>
            <span>{catStyle.label}</span>
          </span>

          <VerificationBadge status={verificationStatus} variant="glass" />
        </div>
        
        {/* Top-Right Badges (Heart + Photo Count) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShortlist && onShortlist(_id);
            }}
            className="p-2 rounded-full bg-white/85 hover:bg-white text-gray-500 hover:text-rose-500 transition-all shadow-md backdrop-blur-md hover:scale-110 active:scale-90 cursor-pointer"
            title="Save Hostel"
          >
            <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {validPhotos.length > 1 && (
            <div className="flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs pointer-events-none">
              <Camera className="w-3 h-3 text-white/90" />
              <span>{safePhotoIdx + 1}/{validPhotos.length}</span>
            </div>
          )}
        </div>

        {/* Food / Feature Floating Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/65 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15 z-10 shadow-xs">
          <Utensils className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="line-clamp-1 max-w-[190px]">
            {propertyType === 'Room' || propertyType === 'Flat'
              ? (property.furnishing || 'Furnished Unit')
              : propertyType === 'PG'
              ? (property.foodPolicy || (foodAvailable ? '3 Meals Included' : 'Food Optional'))
              : (foodAvailable ? 'Mess Food Included' : 'Food Self-Cook / Optional')}
          </span>
        </div>

        {/* Rating Floating Pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 text-gray-900 text-xs font-black px-2 py-0.5 rounded-lg shadow-md z-10 backdrop-blur-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 
              onClick={() => onViewDetails && onViewDetails(property)}
              className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-emerald-700 transition-colors tracking-tight cursor-pointer"
              title={title}
            >
              {title}
            </h3>
          </div>

          {/* Address and Distance */}
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3 font-medium">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span className="truncate text-gray-600 flex-1">{cleanAddress}</span>
            {property.isApproximateLocation && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Approx.
              </span>
            )}
            {displayDistance !== undefined && displayDistance !== null && (
              <>
                <span className="text-gray-300 font-normal shrink-0">•</span>
                <span className="font-bold shrink-0 text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                  📍 {displayDistance} km away
                </span>
              </>
            )}
          </div>

          {/* Differentiated Accommodation Overview */}
          {propertyType === 'Room' || propertyType === 'Flat' ? (
            <div className="mb-3.5 p-2.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-800 gap-1">
                <span className="text-teal-900 font-extrabold flex items-center gap-1.5 truncate">
                  <DoorClosed className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>{property.roomType || '1 BHK Flat'}</span>
                </span>
                <span className="text-[10px] font-black bg-white text-teal-800 px-2 py-0.5 rounded border border-teal-200 shrink-0 whitespace-nowrap">
                  {property.furnishing || 'Fully Furnished'}
                </span>
              </div>
              <div className="text-[11px] text-gray-600 flex items-center justify-between pt-1 border-t border-teal-150">
                <span className="truncate flex items-center gap-1">
                  <Users className="w-3 h-3 text-teal-700/80 shrink-0" />
                  <span><strong>Tenants:</strong> {property.preferredTenants || 'Any / All'}</span>
                </span>
                <span className="shrink-0 whitespace-nowrap flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-teal-700/80 shrink-0" />
                  <span>{property.floorNumber || '1st Floor'}</span>
                </span>
              </div>
            </div>
          ) : propertyType === 'PG' ? (
            <div className="mb-3.5 p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-800 gap-1">
                <span className="text-indigo-900 font-extrabold flex items-center gap-1.5 truncate">
                  <Home className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  <span>{property.roomTypesOffered?.join(', ') || property.roomType || 'Double Sharing'}</span>
                </span>
                <span className="text-[10px] font-black bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0 whitespace-nowrap inline-flex items-center gap-1">
                  <Utensils className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{property.foodPolicy || (foodAvailable ? '3 Meals Incl.' : 'Self Cook')}</span>
                </span>
              </div>
              <div className="text-[11px] text-gray-600 flex items-center justify-between pt-1 border-t border-indigo-150">
                <span className="truncate flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-700/80 shrink-0" />
                  <span><strong>Curfew:</strong> {property.gateTiming || 'No Curfew'}</span>
                </span>
                <span className="shrink-0 whitespace-nowrap flex items-center gap-1">
                  <FileText className="w-3 h-3 text-indigo-700/80 shrink-0" />
                  <span><strong>Notice:</strong> {property.noticePeriod || '1 Month'}</span>
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Unified Room Sharing & Vacancy Widget */}
              {roomTiers && roomTiers.filter(t => t.isAvailable !== false).length > 1 ? (
                <div className="mb-3.5 bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between px-0.5 mb-1.5 text-[10px] font-black text-emerald-950 uppercase tracking-wider">
                    <span className="flex items-center gap-1 text-slate-700">
                      <BedDouble className="w-3 h-3 text-emerald-600" /> Room Sharing:
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold lowercase">tap to select</span>
                  </div>

                  {/* Tier Selection Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {roomTiers.filter(t => t.isAvailable !== false).map((tierObj) => {
                      const tierName = tierObj.roomType;
                      const isSelectedTier = selectedTierType === tierName;

                      return (
                        <button
                          key={tierName}
                          type="button"
                          onClick={() => setSelectedTierType(tierName)}
                          className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                            isSelectedTier
                              ? 'bg-[#059669] text-white font-black shadow-xs ring-2 ring-emerald-400/40'
                              : 'bg-white hover:bg-emerald-50 text-slate-700 font-bold border border-slate-200 hover:border-emerald-200'
                          }`}
                        >
                          <div className="text-[11px] font-extrabold leading-tight truncate">
                            {tierName.replace(' Room', '')}
                          </div>
                          <div className={`text-[10px] font-bold mt-0.5 leading-tight ${isSelectedTier ? 'text-emerald-100' : 'text-emerald-700'}`}>
                            ₹{tierObj.rentPerPerson?.toLocaleString('en-IN') || '--'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Selection Status Row (No awkward multi-line wrapping) */}
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-extrabold text-slate-900 text-[11px] truncate">
                          {currentRoomType}
                        </span>
                        <span className="text-slate-400 text-[10px] whitespace-nowrap font-medium">
                          ({currentOccupancy} {currentOccupancy === 1 ? 'Person' : 'Persons'})
                        </span>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 whitespace-nowrap ${
                        currentAvailableBeds > 0
                          ? 'text-emerald-700 bg-emerald-100/90 border border-emerald-200'
                          : 'text-rose-700 bg-rose-100/90 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${currentAvailableBeds > 0 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                        {currentAvailableBeds > 0 ? `${currentAvailableBeds} Beds Vacant` : 'Fully Occupied'}
                      </span>
                    </div>

                    {/* Roommate Detail line */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {isSharedRoom ? (
                        <span className="truncate">
                          <strong className="text-slate-700">Shared:</strong> {currentAvailableBeds} bed{currentAvailableBeds > 1 ? 's' : ''} vacant
                          {occupiedBeds > 0 ? ` (${occupiedBeds} residing)` : ' (full room available)'}
                        </span>
                      ) : (
                        <span className="truncate">
                          <strong className="text-slate-700">Private:</strong> Dedicated room without roommates
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Room Tier Status */
                <div className="mb-3.5 p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-slate-900 text-xs truncate">{currentRoomType}</span>
                    <span className="text-slate-400 text-[11px] whitespace-nowrap">({currentOccupancy}P)</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 whitespace-nowrap ${
                    currentAvailableBeds > 0
                      ? 'text-emerald-700 bg-emerald-100/90 border border-emerald-200'
                      : 'text-rose-700 bg-rose-100/90 border border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentAvailableBeds > 0 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                    {currentAvailableBeds > 0 ? `${currentAvailableBeds} Beds Vacant` : 'Fully Booked'}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Hostel Mess Menu (Breakfast, Lunch, Dinner) OR Living Info (Gate & Deposit) */}
          {Boolean(foodAvailable) && (propertyType === 'Hostel' || property.messMenu) ? (
            <div className="mb-3 p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10px] space-y-1">
              <div className="flex items-center justify-between text-amber-950 font-black">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-3 h-3 text-amber-600" />
                  <span>Hostel Daily Mess Menu</span>
                </span>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">3 Meals Included</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[9px] text-gray-700">
                <div className="truncate" title={property.messMenu?.breakfast || 'Poha, Jalebi / Paratha'}>
                  <strong className="text-amber-800">B:</strong> {property.messMenu?.breakfast || 'Poha, Paratha & Chai'}
                </div>
                <div className="truncate" title={property.messMenu?.lunch || 'Dal, Paneer, Rotis & Rice'}>
                  <strong className="text-amber-800">L:</strong> {property.messMenu?.lunch || 'Dal, Sabzi, Rotis, Rice'}
                </div>
                <div className="truncate" title={property.messMenu?.dinner || 'Dal Fry, Rotis & Rice'}>
                  <strong className="text-amber-800">D:</strong> {property.messMenu?.dinner || 'Mix Veg, Rotis & Rice'}
                </div>
              </div>
            </div>
          ) : propertyType === 'Hostel' ? (
            <div className="mb-3 p-2 rounded-xl bg-purple-50/50 border border-purple-100 text-[10px] flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-purple-600 shrink-0" />
                <span>Gate: <strong>{property.gateTiming || '10:30 PM'}</strong></span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Deposit: <strong>{property.securityDeposit ? `₹${property.securityDeposit.toLocaleString('en-IN')}` : '₹5,000'}</strong></span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Food Optional</span>
            </div>
          ) : null}

          {/* Amenities Highlights Chips with Vibrant Color Accents */}
          <div className="flex flex-wrap gap-1.5 mb-3.5 items-center">
            {amenities.slice(0, 3).map((amenity, index) => {
              const chipColor = amenity.toLowerCase().includes('wifi') ? 'bg-sky-50 text-sky-800 border-sky-200' :
                amenity.toLowerCase().includes('food') || amenity.toLowerCase().includes('mess') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                amenity.toLowerCase().includes('ac') ? 'bg-teal-50 text-teal-800 border-teal-200' :
                amenity.toLowerCase().includes('security') || amenity.toLowerCase().includes('cctv') ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                'bg-emerald-50 text-emerald-800 border-emerald-200';
              return (
                <span
                  key={index}
                  className={`text-[10px] font-bold ${chipColor} px-2 py-0.5 rounded-lg border transition-colors shadow-2xs`}
                >
                  {amenity}
                </span>
              );
            })}
            {amenities.length > 3 && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* 2-Tier Card Footer: Price Row + Action Buttons Row */}
        <div className="pt-3 border-t border-slate-150 mt-auto flex flex-col gap-2.5">
          {/* Tier 1: Price and OpenStreetMap Link */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-700 tracking-tight">
                  ₹{currentRent.toLocaleString('en-IN')}
                </span>
                <span className="text-gray-500 text-xs font-bold">
                  {propertyType === 'Room' || propertyType === 'Flat' ? '/mo' : '/person'}
                </span>
              </div>
              <span className="text-gray-400 text-[10px] font-medium block leading-none mt-0.5">
                {propertyType === 'Room' || propertyType === 'Flat' ? 'Total monthly unit rent' : 'per month • all inclusive'}
              </span>
            </div>

            {(() => {
              const propLat = property.location?.coordinates?.[1] || property.latitude;
              const propLng = property.location?.coordinates?.[0] || property.longitude;
              const osmLink = propLat && propLng
                ? `https://www.openstreetmap.org/?mlat=${propLat}&mlon=${propLng}#map=16/${propLat}/${propLng}`
                : `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${title}, ${cleanAddress}`)}`;

              return (
                <a
                  href={osmLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 rounded-xl transition-all border border-slate-200 hover:border-emerald-200 shrink-0 flex items-center gap-1 text-[11px] font-bold"
                  title="Open in OpenStreetMap"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Map</span>
                </a>
              );
            })()}
          </div>

          {/* Tier 2: Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onViewDetails) {
                  onViewDetails(property);
                } else if (onInquire) {
                  onInquire({
                    ...property,
                    roomType: currentRoomType,
                    monthlyRent: currentRent,
                    rentPerPerson: currentRent,
                    occupancy: currentOccupancy,
                    availableBeds: currentAvailableBeds
                  });
                }
              }}
              className="w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 cursor-pointer text-center"
            >
              View Details
            </button>

            {onSelectStay ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStay({
                    ...property,
                    roomType: currentRoomType,
                    monthlyRent: currentRent,
                    rentPerPerson: currentRent,
                    occupancy: currentOccupancy,
                    availableBeds: currentAvailableBeds
                  });
                }}
                className={`w-full py-2.5 px-2 rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#064e3b] text-white shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-[#059669] hover:bg-[#047857] text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isSelected ? 'Booked' : 'Book Stay'}</span>
              </button>
            ) : onInquire ? (
              <button
                type="button"
                onClick={() => onInquire({
                  ...property,
                  roomType: currentRoomType,
                  monthlyRent: currentRent,
                  rentPerPerson: currentRent,
                  occupancy: currentOccupancy,
                  availableBeds: currentAvailableBeds
                })}
                className="w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Book Stay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
