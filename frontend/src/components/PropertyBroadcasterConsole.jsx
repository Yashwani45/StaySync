import React, { useRef } from 'react';
import { 
  Home, Users, DollarSign, Plus, Trash2, ShieldCheck, BedDouble, 
  MapPin, Calendar, Tag, X, Edit3, Hotel, DoorClosed, Building,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const PropertyBroadcasterConsole = ({
  activeManagedProperty,
  displayedListings = [],
  managedCapacity = 0,
  managedOccupied = 0,
  managedOccupancyRate = 0,
  managedVacancies = 0,
  managedRentRoll = 0,
  hostelRooms = [],
  pgRooms = [],
  flatUnits = [],
  handleToggleRoomStatus,
  handleTogglePgBed,
  handleToggleFlatUnit,
  handleOpenAddPgRoom,
  handleDeletePgRoom,
  handleEditProperty,
  handleSelectPropertyForManagement,
  acceptedTenants = [],
  onClose,
  isModal = false
}) => {
  const switcherRef = useRef(null);

  const scrollSwitcher = (dir) => {
    if (switcherRef.current) {
      switcherRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  if (!activeManagedProperty) return null;

  const propType = activeManagedProperty.propertyType || 'Hostel';

  const themeConfig = {
    Hostel: {
      primary: 'purple',
      icon: <Hotel className="w-5 h-5 sm:w-6 sm:h-6" />,
      iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-600/20',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200/80',
      category: activeManagedProperty.hostelCategory || 'Hostel Accommodation',
      capacityUnit: 'Beds',
      capacityDesc: 'Hostel Wing Rooms',
      occupiedUnit: 'Beds',
      tenantLabel: 'Active Resident',
      vacancyUnit: 'Vacant Beds'
    },
    PG: {
      primary: 'indigo',
      icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
      iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-600/20',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200/80',
      category: activeManagedProperty.hostelCategory || 'PG Accommodation',
      capacityUnit: 'Beds',
      capacityDesc: 'Single & Shared PG Beds',
      occupiedUnit: 'Beds',
      tenantLabel: 'Active Resident',
      vacancyUnit: 'Vacant Beds'
    },
    Flat: {
      primary: 'teal',
      icon: <DoorClosed className="w-5 h-5 sm:w-6 sm:h-6" />,
      iconBg: 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-600/20',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-200/80',
      category: activeManagedProperty.roomType || 'Flat / Independent Unit',
      capacityUnit: 'Units',
      capacityDesc: 'Flats & Independent Rooms',
      occupiedUnit: 'Leased',
      tenantLabel: 'Active Tenant',
      vacancyUnit: 'Vacant Units'
    },
    Room: {
      primary: 'teal',
      icon: <DoorClosed className="w-5 h-5 sm:w-6 sm:h-6" />,
      iconBg: 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-600/20',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-200/80',
      category: activeManagedProperty.roomType || 'Room Listing',
      capacityUnit: 'Units',
      capacityDesc: 'Flats & Independent Rooms',
      occupiedUnit: 'Leased',
      tenantLabel: 'Active Tenant',
      vacancyUnit: 'Vacant Units'
    }
  };

  const theme = themeConfig[propType] || themeConfig.Hostel;

  const getListingIcon = (type) => {
    if (type === 'Hostel') return <Hotel className="w-3.5 h-3.5" />;
    if (type === 'PG') return <Home className="w-3.5 h-3.5" />;
    return <DoorClosed className="w-3.5 h-3.5" />;
  };

  return (
    <div id="property-broadcaster-console" className="space-y-4">
      {/* Selected Property Banner with Clean Property Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
        {/* Top Header Row: Identity on Left, Quick Actions on Right */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <span className={`p-3.5 rounded-2xl text-white shadow-sm shrink-0 ${theme.iconBg}`}>
              {theme.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${theme.badgeBg}`}>
                  {propType}
                </span>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                  {theme.category}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Vacancy Broadcaster</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                {activeManagedProperty.title || activeManagedProperty.businessName || 'Property Accommodation'}
              </h2>
              {activeManagedProperty.address && (
                <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{activeManagedProperty.address}{activeManagedProperty.city ? `, ${activeManagedProperty.city}` : ''}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions (Edit Details & Close) */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
            {activeManagedProperty && handleEditProperty && (
              <button
                type="button"
                onClick={() => handleEditProperty(activeManagedProperty)}
                className="text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-gray-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Edit property details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-gray-600 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Close Console"
              >
                <X className="w-4 h-4" />
                <span>{isModal ? 'Close' : 'Close Console'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Multi-Property Switcher Row (Shown when 2+ properties exist) */}
        {displayedListings.length > 1 && (
          <div className="pt-3 border-t border-gray-150 w-full max-w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 w-full min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  <span>Switch Property ({displayedListings.length})</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-gray-400 font-medium truncate">
                  — Select accommodation
                </span>
              </div>

              {/* Direct Dropdown Switcher + Scroll Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <select
                  value={activeManagedProperty?._id || activeManagedProperty?.id}
                  onChange={(e) => handleSelectPropertyForManagement && handleSelectPropertyForManagement(e.target.value)}
                  className="text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl px-2.5 py-1 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer max-w-[170px] sm:max-w-[240px] truncate shadow-2xs"
                  title="Direct Property Selector"
                >
                  {displayedListings.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.title} ({p.propertyType || 'PG'})
                    </option>
                  ))}
                </select>

                <div className="hidden sm:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollSwitcher(-1)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition cursor-pointer shadow-2xs"
                    title="Scroll left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSwitcher(1)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition cursor-pointer shadow-2xs"
                    title="Scroll right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Pills Strip - Strictly bounded within container */}
            <div className="w-full max-w-full min-w-0 overflow-hidden relative">
              <div 
                ref={switcherRef}
                className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth w-full min-w-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {displayedListings.map((prop) => {
                  const isCur = (prop._id || prop.id) === (activeManagedProperty?._id || activeManagedProperty?.id);
                  const pType = prop.propertyType || 'Hostel';
                  return (
                    <button
                      key={prop._id || prop.id}
                      type="button"
                      onClick={() => handleSelectPropertyForManagement && handleSelectPropertyForManagement(prop._id || prop.id)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                        isCur
                          ? pType === 'PG'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-600/20'
                            : pType === 'Hostel'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-600/20'
                            : 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-700/20'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                      title={`Manage vacancies for ${prop.title}`}
                    >
                      <span className="shrink-0">{getListingIcon(pType)}</span>
                      <span className="max-w-36 sm:max-w-44 truncate">{prop.title}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        isCur ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                      }`}>
                        {pType}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Occupancy & Revenue Metrics strictly for activeManagedProperty */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Capacity */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Total Capacity</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Home className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {managedCapacity} <span className="text-sm font-bold text-gray-500">{theme.capacityUnit}</span>
          </p>
          <span className="text-[11px] text-purple-600 font-bold block mt-1.5 truncate">
            {theme.capacityDesc}
          </span>
        </div>

        {/* Card 2: Current Occupancy */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Current Occupancy</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {managedOccupied} <span className="text-sm font-bold text-gray-400">/ {managedCapacity} {theme.occupiedUnit}</span>
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 my-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, managedOccupancyRate))}%` }} 
            />
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block truncate">
            {managedOccupancyRate}% Occupancy · {managedOccupied} {theme.tenantLabel}{managedOccupied === 1 ? '' : 's'}
          </span>
        </div>

        {/* Card 3: Vacancies Open */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Vacancies Open</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <BedDouble className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {managedVacancies} <span className="text-sm font-bold text-amber-700/70">{theme.vacancyUnit}</span>
          </p>
          <span className="text-[11px] text-gray-500 font-medium block mt-1.5 truncate">
            Ready for immediate move-in
          </span>
        </div>

        {/* Card 4: Monthly Rent Roll */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Monthly Rent Roll</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            ₹{managedRentRoll.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-gray-400 font-medium block mt-1.5 truncate">
            {managedOccupied > 0 ? 'Active monthly collection' : 'Projected monthly collection'}
          </span>
        </div>
      </div>

      {/* LIVE VACANCY BROADCASTER: TAILORED FOR HOSTEL, PG, OR ROOM */}
      {propType === 'Hostel' && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50/40 p-5 sm:p-6 rounded-3xl border border-purple-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-2xs">
                <Hotel className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">
                  Live Hostel Bed Vacancy Broadcaster
                </h3>
                <p className="text-xs text-purple-900 font-medium">
                  Toggle vacancies with 1 click — updates immediately on tenant searches across StaySync.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approved &amp; Verified by Admin</span>
              </span>
            </div>
          </div>

          {hostelRooms.length === 0 ? (
            <div className="p-8 text-center bg-white/80 rounded-2xl border border-dashed border-purple-200 space-y-2">
              <BedDouble className="w-8 h-8 text-purple-300 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No hostel rooms configured yet</p>
              <p className="text-[11px] text-gray-500">Configure your hostel rooms in Edit Details to broadcast live bed vacancies to students.</p>
              {activeManagedProperty && handleEditProperty && (
                <button
                  type="button"
                  onClick={() => handleEditProperty(activeManagedProperty)}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure Rooms</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {hostelRooms.map((room) => {
                const isAvailable = room.status === 'Available' && room.availableBeds > 0;
                return (
                  <div
                    key={room.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isAvailable
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-white border-gray-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-gray-900">{room.roomNo}</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isAvailable ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-rose-500'}`} />
                        {isAvailable ? `${room.availableBeds} Vacant Bed${room.availableBeds > 1 ? 's' : ''}` : 'Occupied'}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1">
                      <p className="text-gray-500 font-medium">Type: <strong className="text-gray-800">{room.type}</strong></p>
                      <p className="text-gray-500 font-medium">Rent: <strong className="text-green-700">{room.rent}/mo</strong></p>
                      <div className="flex items-center justify-between pt-1 pb-0.5">
                        <p className="text-gray-500 font-medium">
                          Availability: <strong className={isAvailable ? 'text-emerald-700 font-bold' : 'text-gray-600 font-bold'}>{room.availableBeds} / {room.totalBeds} Beds Vacant</strong>
                        </p>
                        {/* Quick bed increment/decrement */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
                          <button
                            type="button"
                            title="Decrease vacant bed count"
                            disabled={room.availableBeds <= 0}
                            onClick={() => handleToggleRoomStatus && handleToggleRoomStatus(room.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-black text-gray-700 hover:bg-gray-100 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold px-1.5 text-gray-800 min-w-4 text-center">{room.availableBeds}</span>
                          <button
                            type="button"
                            title="Increase vacant bed count"
                            disabled={room.availableBeds >= room.totalBeds}
                            onClick={() => handleToggleRoomStatus && handleToggleRoomStatus(room.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-black text-gray-700 hover:bg-gray-100 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleRoomStatus && handleToggleRoomStatus(room.id)}
                      className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                        isAvailable
                          ? 'bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-emerald-800 border border-emerald-300'
                          : 'bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200'
                      }`}
                    >
                      {isAvailable ? 'Mark All Beds as Occupied' : 'Mark as Vacant / Open'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {propType === 'PG' && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50/40 p-5 sm:p-6 rounded-3xl border border-indigo-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-2xs">
                <Home className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">
                  Live PG Bed Vacancy Broadcaster &amp; Meal Management
                </h3>
                <p className="text-xs text-indigo-900 font-medium">
                  Toggle PG bed availability with 1 click — updates immediately on PG searches across StaySync.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified PG Accommodation</span>
              </span>
              <button
                type="button"
                onClick={handleOpenAddPgRoom}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add PG Room</span>
              </button>
            </div>
          </div>

          {pgRooms.length === 0 ? (
            <div className="p-8 text-center bg-white/80 rounded-2xl border border-dashed border-indigo-200 space-y-2">
              <BedDouble className="w-8 h-8 text-indigo-300 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No PG rooms configured yet</p>
              <p className="text-[11px] text-gray-500">Configure your PG sharing tiers to broadcast live bed vacancies to seekers.</p>
              <button
                type="button"
                onClick={handleOpenAddPgRoom}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                + Add PG Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {pgRooms.map((bed) => {
                const isAvailable = bed.status === 'Available' && bed.availableBeds > 0;
                return (
                  <div
                    key={bed.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isAvailable
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-white border-gray-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-gray-900">{bed.roomNo}</span>
                        <button
                          type="button"
                          title={`Remove ${bed.roomNo}`}
                          onClick={() => handleDeletePgRoom && handleDeletePgRoom(bed.id)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isAvailable ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-rose-500'}`} />
                        {isAvailable ? `${bed.availableBeds} Vacant Bed${bed.availableBeds > 1 ? 's' : ''}` : 'Occupied'}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1">
                      <p className="text-gray-500 font-medium">Sharing: <strong className="text-gray-800">{bed.type}</strong></p>
                      <p className="text-gray-500 font-medium">Rent: <strong className="text-green-700">{bed.rent}/bed/mo</strong></p>
                      <div className="flex items-center justify-between pt-1 pb-0.5">
                        <p className="text-gray-500 font-medium">
                          Availability: <strong className={isAvailable ? 'text-emerald-700 font-bold' : 'text-gray-600 font-bold'}>{bed.availableBeds} / {bed.totalBeds} Beds Vacant</strong>
                        </p>
                        {/* Quick Bed Increment / Decrement Stepper */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
                          <button
                            type="button"
                            title="Decrease vacant bed count"
                            disabled={bed.availableBeds <= 0}
                            onClick={() => handleTogglePgBed && handleTogglePgBed(bed.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-black text-gray-700 hover:bg-gray-100 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold px-1.5 text-gray-800 min-w-4 text-center">{bed.availableBeds}</span>
                          <button
                            type="button"
                            title="Increase vacant bed count"
                            disabled={bed.availableBeds >= bed.totalBeds}
                            onClick={() => handleTogglePgBed && handleTogglePgBed(bed.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-black text-gray-700 hover:bg-gray-100 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePgBed && handleTogglePgBed(bed.id)}
                      className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                        isAvailable
                          ? 'bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {isAvailable ? 'Mark All Beds as Occupied' : 'Mark as Vacant / Open'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(propType === 'Room' || propType === 'Flat') && (
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50/60 to-teal-50/40 p-5 sm:p-6 rounded-3xl border border-teal-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-2xs">
                <DoorClosed className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">
                  Live Flat &amp; Unit Vacancy Broadcaster &amp; Lease Status
                </h3>
                <p className="text-xs text-teal-900 font-medium">
                  Toggle unit vacancy with 1 click — updates immediately on flat/room searches across StaySync.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Property Owner</span>
              </span>
            </div>
          </div>

          {flatUnits.length === 0 ? (
            <div className="p-8 text-center bg-white/80 rounded-2xl border border-dashed border-teal-200 space-y-2">
              <DoorClosed className="w-8 h-8 text-teal-300 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No units or rooms configured yet</p>
              <p className="text-[11px] text-gray-500">Configure your flats and independent rooms to broadcast occupancy and lease status.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {flatUnits.map((unit) => {
                const isAvailable = unit.status === 'Available';
                return (
                  <div
                    key={unit.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isAvailable
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-white border-gray-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-gray-900">{unit.unitNo}</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isAvailable ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-rose-500'}`} />
                        {isAvailable ? 'Vacant Unit' : 'Leased'}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-0.5">
                      <p className="text-gray-500 font-medium">Type: <strong className="text-gray-800">{unit.type}</strong></p>
                      <p className="text-gray-500 font-medium">Rent: <strong className="text-green-700">{unit.rent}/mo</strong></p>
                      <p className="text-gray-500 font-medium">Status: <strong className={isAvailable ? 'text-emerald-700' : 'text-teal-700'}>{isAvailable ? 'Vacant / Ready to Move' : 'Leased Unit'}</strong></p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlatUnit && handleToggleFlatUnit(unit.id)}
                      className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                        isAvailable
                          ? 'bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-emerald-800 border border-emerald-300'
                          : 'bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 border border-teal-200'
                      }`}
                    >
                      {isAvailable ? 'Mark as Leased' : 'Mark as Vacant Unit'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LIVE PRICING & INCLUDED AMENITIES OVERVIEW: TAILORED */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-150">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600" />
            <span>
              {propType === 'Room' || propType === 'Flat'
                ? 'Flat & Room Rental Rates & Amenities Overview'
                : propType === 'PG'
                ? 'PG Room Sharing Rates, Meals & Amenities Overview'
                : 'Hostel Room Sharing Rates & Amenities Overview'}
            </span>
          </h3>
          <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
            Live Pricing Rates
          </span>
        </div>

        {propType === 'Hostel' && (
          activeManagedProperty?.roomTiers && activeManagedProperty.roomTiers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {activeManagedProperty.roomTiers.map((tier, idx) => (
                <div key={idx} className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-150 space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1">
                    {tier.roomType?.includes('1') ? <BedDouble className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                    <span>{tier.roomType || `Room Tier ${idx + 1}`}</span>
                  </span>
                  <p className="text-lg font-black text-gray-900">
                    ₹{(tier.rentPerPerson || activeManagedProperty.monthlyRent || 0).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-gray-400">/bed /mo</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Bed Capacity: {tier.totalBeds || 1} beds ({tier.availableBeds ?? 1} currently vacant).
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-150 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5" />
                  <span>{activeManagedProperty?.title || 'Hostel Accommodation'}</span>
                </span>
                <p className="text-lg font-black text-gray-900">
                  ₹{(activeManagedProperty?.rentPerPerson || activeManagedProperty?.monthlyRent || 0).toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-gray-400">/person/mo</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  {activeManagedProperty?.foodAvailable ? 'Includes 3-time meals & mess' : 'Mess optional'} · Curfew: {activeManagedProperty?.gateTiming || '10:30 PM'}.
                </p>
              </div>
            </div>
          )
        )}

        {propType === 'PG' && (
          activeManagedProperty?.roomTypesOffered && activeManagedProperty.roomTypesOffered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {activeManagedProperty.roomTypesOffered.map((type, idx) => (
                <div key={idx} className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-150 space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1">
                    {type.includes('Single') ? <BedDouble className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                    <span>{type}</span>
                  </span>
                  <p className="text-lg font-black text-gray-900">
                    ₹{(activeManagedProperty.rentPerPerson || activeManagedProperty.monthlyRent || 0).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-gray-400">/bed /mo</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {activeManagedProperty.foodPolicy || '3 Meals Included'} · Curfew: {activeManagedProperty.gateTiming || 'No Curfew'}.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-150 space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span>{activeManagedProperty?.title || 'PG Accommodation'}</span>
                </span>
                <p className="text-lg font-black text-gray-900">
                  ₹{(activeManagedProperty?.rentPerPerson || activeManagedProperty?.monthlyRent || 0).toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-gray-400">/bed /mo</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  {activeManagedProperty?.foodPolicy || 'Meals Included'} · Notice: {activeManagedProperty?.noticePeriod || '1 Month'}.
                </p>
              </div>
            </div>
          )
        )}

        {(propType === 'Room' || propType === 'Flat') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-teal-50/50 p-3.5 rounded-2xl border border-teal-150 space-y-1">
              <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5">
                <DoorClosed className="w-3.5 h-3.5" />
                <span>{activeManagedProperty?.roomType || 'Unit Listing'}</span>
              </span>
              <p className="text-lg font-black text-gray-900">
                ₹{(activeManagedProperty?.monthlyRent || activeManagedProperty?.rentPerPerson || 0).toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-gray-400">/mo</span>
              </p>
              <p className="text-[11px] text-gray-500">
                {activeManagedProperty?.furnishing || 'Semi-Furnished'} · {activeManagedProperty?.preferredTenants || 'Any / All'}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
          {activeManagedProperty?.amenities && activeManagedProperty.amenities.length > 0 ? (
            activeManagedProperty.amenities.map(amenity => (
              <span key={amenity} className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-lg">
                ✓ {amenity}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic text-xs">No amenities listed yet.</span>
          )}
        </div>
      </div>

      {/* RESIDENT & LEASE DIRECTORY TABLE: TAILORED */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-150">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>
              {propType === 'Room' || propType === 'Flat'
                ? 'Active Tenant Leases & Monthly Rent Ledger'
                : propType === 'PG'
                ? 'Active PG Residents & Monthly Rent Ledger'
                : 'Active Student Residents & Monthly Rent Ledger'}
            </span>
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            {acceptedTenants.length} Active {acceptedTenants.length === 1 ? 'Agreement' : 'Agreements'}
          </span>
        </div>

        {acceptedTenants.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <div className="w-10 h-10 mx-auto bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-gray-800">
              No active {propType === 'Room' || propType === 'Flat' ? 'tenant leases' : 'residents'} yet
            </p>
            <p className="text-[11px] text-gray-400 max-w-md mx-auto">
              When tenants book your {propType === 'PG' ? 'PG' : propType === 'Room' || propType === 'Flat' ? 'flat' : 'hostel'} and you accept them, their official agreement records and rent status will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {propType === 'Hostel' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-150 text-[11px] font-black text-gray-400 uppercase">
                    <th className="py-2.5 pr-4">Tenant Name</th>
                    <th className="py-2.5 px-4">Room &amp; Bed</th>
                    <th className="py-2.5 px-4">Sharing Type</th>
                    <th className="py-2.5 px-4">Monthly Rent</th>
                    <th className="py-2.5 px-4">Food Plan</th>
                    <th className="py-2.5 pl-4 text-right">Rent Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {acceptedTenants.map((req, idx) => {
                    const tenantName = req.sender?.name || 'Resident Student';
                    const roomName = req.itemId?.roomType || req.property?.roomType || `Room ${101 + idx}`;
                    const sharingType = req.itemId?.roomType || 'Standard Sharing';
                    const rent = req.proposedPrice || req.itemId?.rentPerPerson || req.itemId?.monthlyRent || req.property?.monthlyRent || 0;
                    const foodIncluded = req.itemId?.foodAvailable ?? true;
                    return (
                      <tr key={req._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 pr-4 font-bold text-gray-900">{tenantName}</td>
                        <td className="py-3 px-4 font-semibold text-purple-700">{roomName}</td>
                        <td className="py-3 px-4 text-gray-600">{sharingType}</td>
                        <td className="py-3 px-4 font-black text-green-700">₹{rent.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {foodIncluded ? (
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              ✓ Mess Included
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Self Cook / Mess</span>
                          )}
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                            Active Agreement
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {propType === 'PG' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-150 text-[11px] font-black text-gray-400 uppercase">
                    <th className="py-2.5 pr-4">Resident Name</th>
                    <th className="py-2.5 px-4">Room &amp; Bed</th>
                    <th className="py-2.5 px-4">Sharing Type</th>
                    <th className="py-2.5 px-4">Monthly Rent</th>
                    <th className="py-2.5 px-4">Meal Plan</th>
                    <th className="py-2.5 px-4">Curfew</th>
                    <th className="py-2.5 pl-4 text-right">Rent Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {acceptedTenants.map((req, idx) => {
                    const tenantName = req.sender?.name || 'PG Resident';
                    const roomName = req.itemId?.roomType || req.property?.roomType || `PG Bed ${idx + 1}`;
                    const sharingType = req.itemId?.roomType || 'Shared PG Room';
                    const rent = req.proposedPrice || req.itemId?.rentPerPerson || req.itemId?.monthlyRent || req.property?.monthlyRent || 0;
                    const foodPolicy = req.itemId?.foodPolicy || '3 Meals Included';
                    const curfew = req.itemId?.gateTiming || 'No Curfew';
                    return (
                      <tr key={req._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 pr-4 font-bold text-gray-900">{tenantName}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-700">{roomName}</td>
                        <td className="py-3 px-4 text-gray-600">{sharingType}</td>
                        <td className="py-3 px-4 font-black text-green-700">₹{rent.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {foodPolicy}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">{curfew}</td>
                        <td className="py-3 pl-4 text-right">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200">
                            Active Agreement
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {(propType === 'Room' || propType === 'Flat') && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-150 text-[11px] font-black text-gray-400 uppercase">
                    <th className="py-2.5 pr-4">Tenant / Family</th>
                    <th className="py-2.5 px-4">Unit No</th>
                    <th className="py-2.5 px-4">Unit Type</th>
                    <th className="py-2.5 px-4">Monthly Rent</th>
                    <th className="py-2.5 px-4">Furnishing</th>
                    <th className="py-2.5 px-4">Lease Agreement</th>
                    <th className="py-2.5 pl-4 text-right">Rent Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {acceptedTenants.map((req, idx) => {
                    const tenantName = req.sender?.name || 'Tenant';
                    const unitNo = req.itemId?.title || req.property?.title || `Unit ${idx + 1}`;
                    const unitType = req.itemId?.roomType || req.property?.roomType || '1 BHK Flat';
                    const rent = req.proposedPrice || req.itemId?.monthlyRent || req.itemId?.rentPerPerson || 0;
                    const furnishing = req.itemId?.furnishing || 'Semi-Furnished';
                    return (
                      <tr key={req._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 pr-4 font-bold text-gray-900">{tenantName}</td>
                        <td className="py-3 px-4 font-semibold text-teal-700">{unitNo}</td>
                        <td className="py-3 px-4 text-gray-600">{unitType}</td>
                        <td className="py-3 px-4 font-black text-green-700">₹{rent.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {furnishing}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">11 Months Lease</td>
                        <td className="py-3 pl-4 text-right">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-teal-100 text-teal-800 border-teal-200">
                            Active Lease
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyBroadcasterConsole;
