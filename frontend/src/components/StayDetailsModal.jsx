import React, { useState } from 'react';
import { 
  X, Star, MapPin, CheckCircle2, ShieldCheck, Heart, 
  Wifi, Snowflake, Utensils, Shirt, Shield, Clock, 
  Phone, MessageSquare, ArrowRight, BedDouble, Calendar, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeImageUrl } from '../utils/imageHelper';
import BedSelectorModal from './BedSelectorModal';

const StayDetailsModal = ({ property, onClose, onBook }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [moveInDate, setMoveInDate] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [isSaved, setIsSaved] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [showBedSelector, setShowBedSelector] = useState(false);

  if (!property) return null;

  const photos = Array.isArray(property.photos) && property.photos.length > 0 
    ? property.photos 
    : [property.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'];

  const rent = property.monthlyRent || property.rentPerPerson || property.rent || 6000;
  const rating = property.rating || 4.5;
  const reviewsCount = property.reviewsCount || 28;
  const availableRooms = property.availableRooms || property.availableBeds || 2;

  const handleBooking = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingSent(true);
    if (onBook) onBook(property, { moveInDate, duration });
  };

  const handleChat = () => {
    if (!user) navigate('/login');
    else navigate('/chat');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full my-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Sticky Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 shadow-md flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. GALLERY SECTION */}
        <div className="p-5 sm:p-6 pb-2 space-y-3">
          {/* Main Large Photo */}
          <div className="h-64 sm:h-96 rounded-2xl overflow-hidden relative bg-slate-100">
            <img
              src={normalizeImageUrl(photos[selectedPhoto] || photos[0])}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-[#059669] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Property</span>
              </span>
              <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                {property.propertyType || 'PG / Hostel'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className="absolute top-3 right-14 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((ph, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhoto(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedPhoto === idx ? 'border-emerald-600 scale-102 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={normalizeImageUrl(ph)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. HEADER INFO & TITLE */}
        <div className="px-5 sm:px-6 py-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {property.title}
              </h2>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating} ({reviewsCount} reviews)</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{[property.address, property.city].filter(Boolean).join(', ') || 'Prime Location'}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-black text-[#059669]">
              ₹{rent.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500"> /month</span>
            <span className="block text-[11px] font-bold text-slate-500">
              Available Rooms: {availableRooms}
            </span>
          </div>
        </div>

        {/* 3. TABS BAR */}
        <div className="px-5 sm:px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {['Overview', 'Rooms & Beds', 'Amenities', 'Location', 'Reviews'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#059669] text-[#059669]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. CONTENT & STICKY BOOKING CARD */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Tab details */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 mb-2">About This Property</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {property.description || 
                      `${property.title} offers a comfortable and secure living experience with modern amenities, hygienic food, high-speed Wi-Fi, and a friendly community environment. Perfect for college students and working professionals.`}
                  </p>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 mb-3">Key Features</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2.5 p-2.5 bg-indigo-50/80 rounded-xl border border-indigo-200 shadow-2xs">
                      <BedDouble className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-bold text-indigo-950">Fully Furnished</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 bg-sky-50/80 rounded-xl border border-sky-200 shadow-2xs">
                      <Wifi className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="font-bold text-sky-950">High-Speed Wi-Fi</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 bg-teal-50/80 rounded-xl border border-teal-200 shadow-2xs">
                      <Snowflake className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-bold text-teal-950">Air Conditioned</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 shadow-2xs">
                      <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-amber-950">Daily Meals</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 bg-purple-50/80 rounded-xl border border-purple-200 shadow-2xs">
                      <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="font-bold text-purple-950">CCTV Security</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 shadow-2xs">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-950">24/7 Support</span>
                    </div>
                  </div>
                </div>

                {property.rules && property.rules.length > 0 && (
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 mb-2">House Rules</h3>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {property.rules.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Rooms & Beds' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900">Room Sharing Tiers</h3>
                <div className="space-y-2.5">
                  {(property.roomTiers && property.roomTiers.length > 0 ? property.roomTiers : [
                    { roomType: '1-Seater Private Room', rentPerPerson: rent + 2000, occupancy: 1, availableBeds: 1 },
                    { roomType: '2-Seater Shared Room', rentPerPerson: rent, occupancy: 2, availableBeds: 2 },
                    { roomType: '3-Seater Shared Room', rentPerPerson: Math.max(4000, rent - 1200), occupancy: 3, availableBeds: 3 }
                  ]).map((tier, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">{tier.roomType}</strong>
                        <span className="text-[11px] text-slate-500">Max occupancy: {tier.occupancy} &bull; Beds available: {tier.availableBeds || 1}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-[#059669]">₹{tier.rentPerPerson?.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-400 block">/person/month</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Amenities' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900">Property Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(property.amenities || ['WiFi', 'AC', 'Geyser', 'Security', 'Laundry', 'Cleaning', 'Water Purifier', 'Power Backup']).map((am, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{am}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Location' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900">Location &amp; Neighborhood</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Located in the heart of {property.city || 'the city'}, close to coaching institutes, tech hubs, grocery stores, and public transit.
                </p>
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
                  📍 Map View: {[property.address, property.city].filter(Boolean).join(', ') || 'Prime Locality'}
                </div>
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">Resident Reviews</h3>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {rating} / 5.0
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Rohan K. (SGSITS Student)</span>
                      <span className="text-amber-500">★★★★★</span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      Very clean rooms and the food quality is super homestyle. Landlord is responsive and zero broker hassle.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Priya S. (IT Professional)</span>
                      <span className="text-amber-500">★★★★☆</span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      High-speed internet is reliable for WFH, power backup works smoothly during outages.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Book Your Stay Card */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Book Your Stay</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Reserve your bed directly with zero middleman fee.
              </p>
            </div>

            {bookingSent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold space-y-2 text-center animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <strong className="block text-sm">Booking Request Sent!</strong>
                <p className="text-slate-600">The property owner and our support team have been notified. We will confirm your visit shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Move-in Date
                  </label>
                  <input
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Stay Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months (Standard Academic)</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Monthly Rent</span>
                    <span className="font-bold text-slate-900">₹{rent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Brokerage Fee</span>
                    <span className="font-bold text-emerald-600">₹0 (Zero Brokerage)</span>
                  </div>
                  <div className="border-t border-slate-100 pt-1 flex justify-between font-black text-slate-900 text-sm">
                    <span>Estimated Total</span>
                    <span className="text-[#059669]">₹{rent.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Room & Bed Selector Direct Action */}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    setShowBedSelector(true);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Choose Specific Room & Bed</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="shrink-0 mx-2 text-[10px] uppercase font-bold text-slate-400">or instant inquiry</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Quick Inquire</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleChat}
                  className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Chat with Owner</span>
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-400 text-center font-medium">
              🔒 100% Verified Stay Guarantee &bull; Direct Landlord Agreement
            </div>
          </div>

        </div>

      </div>

      {/* Bed Selector Modal */}
      {showBedSelector && (
        <BedSelectorModal
          property={property}
          onClose={() => setShowBedSelector(false)}
          onBookingSuccess={(bookingData) => {
            setShowBedSelector(false);
            setBookingSent(true);
            if (onBook) onBook(property, bookingData);
          }}
        />
      )}
    </div>
  );
};

export default StayDetailsModal;
