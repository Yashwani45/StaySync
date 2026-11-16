import React, { useState } from 'react';
import { Star, MapPin, Calendar, Clock, ArrowRight, BookOpen, Bike, Wrench, Shield, CheckCircle2, Utensils, Shirt, Sparkles, Package, Coffee, Moon, Award } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import { getDiverseServicePhoto, DEFAULT_CLEANING_PHOTOS, DEFAULT_TIFFIN_PHOTOS } from '../utils/imageHelper';

const getTodayKey = () => {
  const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return map[new Date().getDay()];
};

const ServiceCard = ({ service, onBook, onInquire, onSelectService, isSelected = false }) => {
  const [selectedDay, setSelectedDay] = useState(getTodayKey());
  const {
    _id,
    businessName,
    category,
    description,
    address,
    city,
    rating,
    verificationStatus,
    serviceRadius = 5,
    tiffinDetails,
    laundryDetails,
    cleaningDetails,
    maintenanceDetails,
    moversDetails
  } = service;

  // Address formatting cleanup
  const cleanAddress = [address, city]
    .filter(Boolean)
    .join(', ')
    .replace(/\s+,/g, ', ')
    .replace(/,\s*,/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Render specific badge icons by category
  const renderCategoryIcon = () => {
    switch (category) {
      case 'Tiffin':
        return (
          <span className="inline-flex items-center gap-1 bg-[#064e3b] text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-emerald-500/30 shadow-xs">
            <Utensils className="w-3 h-3 shrink-0 text-emerald-300" />
            <span>Tiffin &amp; Mess</span>
          </span>
        );
      case 'Laundry':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-blue-400/30 shadow-xs">
            <Shirt className="w-3 h-3 shrink-0" />
            <span>Laundry Care</span>
          </span>
        );
      case 'Cleaning':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-teal-400/30 shadow-xs">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Deep Cleaning</span>
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-amber-400/30 shadow-xs">
            <Wrench className="w-3 h-3 shrink-0" />
            <span>Repair Service</span>
          </span>
        );
      case 'Movers':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-purple-400/30 shadow-xs">
            <Package className="w-3 h-3 shrink-0" />
            <span>Packers &amp; Movers</span>
          </span>
        );
      default:
        return <span className="bg-gray-800/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-gray-600/30 shadow-xs">Service</span>;
    }
  };

  // Render pricing summaries by category
  const renderPriceInfo = () => {
    if (category === 'Tiffin' && tiffinDetails) {
      return (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-700 tracking-tight">₹{tiffinDetails.monthlyPrice || 2400}</span>
            <span className="text-xs font-semibold text-slate-500">/mo</span>
          </div>
          <span className="text-slate-400 text-[10px] font-medium block leading-none mt-0.5">Veg meal subscription</span>
        </div>
      );
    }
    if (category === 'Laundry' && laundryDetails) {
      return (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-sky-700 tracking-tight">₹{laundryDetails.pricePerKg || 60}</span>
            <span className="text-xs font-semibold text-slate-500">/kg</span>
          </div>
          <span className="text-slate-400 text-[10px] font-medium block leading-none mt-0.5">Wash &amp; fold service</span>
        </div>
      );
    }
    if (category === 'Cleaning' && cleaningDetails) {
      return (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-teal-700 tracking-tight">₹{cleaningDetails.priceMap?.['Regular Room'] || 150}</span>
            <span className="text-xs font-semibold text-slate-500">/room</span>
          </div>
          <span className="text-slate-400 text-[10px] font-medium block leading-none mt-0.5">Starting cleaning rate</span>
        </div>
      );
    }
    if (category === 'Maintenance' && maintenanceDetails) {
      return (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">₹{maintenanceDetails.calloutFee || 150}</span>
            <span className="text-xs font-semibold text-slate-500">visit</span>
          </div>
          <span className="text-slate-400 text-[10px] font-medium block leading-none mt-0.5">Standard call-out fee</span>
        </div>
      );
    }
    if (category === 'Movers' && moversDetails) {
      return (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-700 tracking-tight">₹{moversDetails.baseFee || 2500}</span>
            <span className="text-xs font-semibold text-slate-500">base</span>
          </div>
          <span className="text-slate-400 text-[10px] font-medium block leading-none mt-0.5">Relocation base fee</span>
        </div>
      );
    }
    return null;
  };

  // Render highlights (meals menu, laundry delivery, plumber callouts)
  const renderHighlights = () => {
    if (category === 'Tiffin' && tiffinDetails) {
      const days = [
        { key: 'monday', short: 'Mon' },
        { key: 'tuesday', short: 'Tue' },
        { key: 'wednesday', short: 'Wed' },
        { key: 'thursday', short: 'Thu' },
        { key: 'friday', short: 'Fri' },
        { key: 'saturday', short: 'Sat' },
        { key: 'sunday', short: 'Sun' }
      ];

      const dayData = tiffinDetails.weeklyMenu?.[selectedDay] || {};
      const fallbackDay = tiffinDetails.menu?.[selectedDay];

      const bf = dayData.breakfast || (selectedDay === getTodayKey() ? (tiffinDetails.breakfast || tiffinDetails.menu?.breakfast) : null) || 'Poha, Jalebi & Chai';
      const lu = dayData.lunch || fallbackDay || (selectedDay === getTodayKey() ? (tiffinDetails.lunch || tiffinDetails.menu?.lunch) : null) || 'Dal Tadka, Shahi Paneer, 4 Rotis & Rice';
      const di = dayData.dinner || (selectedDay === getTodayKey() ? (tiffinDetails.dinner || tiffinDetails.menu?.dinner) : null) || 'Mix Veg Sabzi, Yellow Dal, 4 Rotis & Rice';
      const sun = dayData.special || (selectedDay === 'sunday' ? (tiffinDetails.sundaySpecial || tiffinDetails.menu?.sundaySpecial) : null) || 'Special Royal Thali & Sweet';

      return (
        <div className="text-xs space-y-2 py-1">
          {/* Day selection tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none" onClick={(e) => e.stopPropagation()}>
            {days.map((d) => {
              const isSelectedDay = selectedDay === d.key;
              const isToday = getTodayKey() === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    isSelectedDay
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/60'
                  }`}
                >
                  {d.short}
                  {isToday && <span className="ml-1 text-[8px] font-black opacity-90">•</span>}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-950 bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-150">
              <span className="inline-flex items-center gap-1 font-extrabold text-[10px] uppercase text-emerald-700 shrink-0">
                <Coffee className="w-3 h-3 text-emerald-600" />
                <span>BF:</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-800 line-clamp-1">{bf}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-950 bg-amber-50/70 p-1.5 rounded-xl border border-amber-150">
              <span className="inline-flex items-center gap-1 font-extrabold text-[10px] uppercase text-amber-700 shrink-0">
                <Utensils className="w-3 h-3 text-amber-600" />
                <span>Lunch:</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-800 line-clamp-1">{lu}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-950 bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-150">
              <span className="inline-flex items-center gap-1 font-extrabold text-[10px] uppercase text-emerald-700 shrink-0">
                <Moon className="w-3 h-3 text-emerald-600" />
                <span>Dinner:</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-800 line-clamp-1">{di}</span>
            </div>
            {selectedDay === 'sunday' && (
              <div className="flex items-center gap-1.5 text-purple-950 bg-purple-50/70 p-1.5 rounded-xl border border-purple-150">
                <span className="inline-flex items-center gap-1 font-extrabold text-[10px] uppercase text-purple-700 shrink-0">
                  <Award className="w-3 h-3 text-purple-600" />
                  <span>Sunday:</span>
                </span>
                <span className="text-[11px] font-bold text-purple-900 line-clamp-1">{sun}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    if (category === 'Laundry' && laundryDetails) {
      return (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${laundryDetails.pickupAvailable ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
            <span className="font-semibold text-gray-800">{laundryDetails.pickupAvailable ? 'Doorstep Pickup & Drop Available' : 'Store visit only'}</span>
          </div>
          <p className="text-gray-400 text-[10px] font-medium leading-none">Standard Turnaround: {laundryDetails.turnaroundHours} hours</p>
        </div>
      );
    }
    if (category === 'Cleaning' && cleaningDetails) {
      const priceMap = cleaningDetails.priceMap || {};
      const services = Object.keys(priceMap);
      return (
        <div className="text-xs text-gray-500 flex flex-wrap gap-1.5 items-center">
          <span className="font-bold text-gray-700 text-[11px]">Services:</span>
          {services.slice(0, 3).map((s, i) => (
            <span key={i} className="bg-teal-50 text-teal-800 border border-teal-200/70 px-2 py-0.5 rounded-md text-[10px] font-bold">
              {s} (₹{priceMap[s]})
            </span>
          ))}
        </div>
      );
    }
    if (category === 'Maintenance' && maintenanceDetails) {
      return (
        <div className="text-xs text-gray-600 space-y-0.5">
          <p className="font-bold text-amber-800">Category: {maintenanceDetails.subCategory || 'Electrician'}</p>
          <p className="text-[10px] text-gray-400 font-medium">Rate: ₹{maintenanceDetails.hourlyRate}/hour after inspection</p>
        </div>
      );
    }
    if (category === 'Movers' && moversDetails) {
      return (
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-bold text-purple-800">Rates: ₹{moversDetails.pricePerKm}/km distance charges</p>
          <div className="flex gap-1">
            {moversDetails.vehicleTypes?.slice(0, 2).map((v, i) => (
              <span key={i} className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-bold">{v}</span>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xs border p-5 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group ${
      isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' : 'border-gray-200/90'
    }`}>
      
      {/* Category Image Header */}
      <div className="h-44 -mx-5 -mt-5 mb-4 rounded-t-3xl overflow-hidden relative bg-gray-100 group/photo">
        <img
          src={getDiverseServicePhoto(service)}
          alt={businessName}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = category === 'Tiffin'
              ? DEFAULT_TIFFIN_PHOTOS[0]
              : DEFAULT_CLEANING_PHOTOS[0];
          }}
          className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          {renderCategoryIcon()}
          {isSelected && (
            <span className="bg-emerald-600 text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3 h-3" /> Subscribed
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs text-gray-900 px-2 py-0.5 rounded-lg text-xs font-black shadow-md z-10">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{rating ? rating.toFixed(1) : '4.5'}</span>
        </div>
      </div>

      {/* Upper Provider Info */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors tracking-tight">
            {businessName}
          </h3>
          <VerificationBadge status={verificationStatus} />
        </div>

        {/* Location & Radius */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3 font-medium">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span className="line-clamp-1 text-slate-600">{cleanAddress}</span>
          <span className="text-slate-300 font-normal shrink-0">•</span>
          <span className="font-bold shrink-0 text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">Radius: {serviceRadius} km</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3.5">
          {description}
        </p>

        {/* Category Details Highlight */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-4 min-h-[50px] flex flex-col justify-center">
          {renderHighlights()}
        </div>
      </div>

      {/* 2-Tier Card Footer: Price Row + Action Buttons Row */}
      <div className="pt-3 border-t border-slate-150 mt-auto flex flex-col gap-2.5">
        {/* Tier 1: Price info */}
        <div className="flex items-baseline justify-between gap-2">
          {renderPriceInfo()}
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {serviceRadius} km radius
          </span>
        </div>
        
        {/* Tier 2: Action buttons */}
        <div className={`grid ${onSelectService && (onBook || onInquire) ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1`}>
          {onSelectService && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectService(service);
              }}
              className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-[#064e3b] text-white shadow-sm ring-2 ring-emerald-400/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isSelected ? 'Subscribed' : 'Select Plan'}</span>
            </button>
          )}

          {(onBook || onInquire) && (
            <button
              type="button"
              onClick={() => (onBook ? onBook(service) : onInquire(service))}
              className="w-full py-2.5 px-2 rounded-xl text-xs font-black transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 bg-[#059669] hover:bg-[#047857] text-white group/btn"
            >
              <span>{category === 'Tiffin' ? 'Subscribe' : 'Book Service'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
