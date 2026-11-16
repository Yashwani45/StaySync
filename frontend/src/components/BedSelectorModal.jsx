import React, { useState, useEffect } from 'react';
import { 
  X, BedDouble, Calendar, ShieldCheck, Clock, CheckCircle2, 
  AlertCircle, ArrowRight, Lock, Sparkles, AlertTriangle, Info
} from 'lucide-react';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BedSelectorModal = ({ property, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomsData, setRoomsData] = useState([]);
  const [cancellationPolicy, setCancellationPolicy] = useState('Moderate');
  const [securityDeposit, setSecurityDeposit] = useState(0);

  // Selected state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  
  // Date states (default: today -> 1 month later)
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthDate = new Date();
  nextMonthDate.setDate(nextMonthDate.getDate() + 30);
  const nextMonthStr = nextMonthDate.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(nextMonthStr);
  const [durationMonths, setDurationMonths] = useState(1);

  // Holding state
  const [holdingLoading, setHoldingLoading] = useState(false);
  const [holdSuccessData, setHoldSuccessData] = useState(null);
  const [holdCountdown, setHoldCountdown] = useState(15 * 60); // 15 mins in secs

  // Load available beds from backend
  const fetchBeds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingsAPI.getAvailableBeds(property._id || property.id, {
        checkInDate,
        checkOutDate
      });
      if (res.success && res.data) {
        setRoomsData(res.data.rooms || []);
        setCancellationPolicy(res.data.cancellationPolicy || 'Moderate');
        setSecurityDeposit(res.data.securityDeposit || 0);

        // Auto-select first available bed if none selected
        if (!selectedBed && res.data.rooms?.length > 0) {
          for (const rm of res.data.rooms) {
            const availBed = rm.beds?.find(b => b.status === 'AVAILABLE' || b.heldByMe);
            if (availBed) {
              setSelectedRoom(rm);
              setSelectedBed(availBed);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load bed inventory:', err);
      setError(err.response?.data?.message || 'Failed to load available room & bed layout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (property) {
      fetchBeds();
    }
  }, [property, checkInDate, checkOutDate]);

  // Handle Hold countdown timer
  useEffect(() => {
    if (!holdSuccessData) return;
    const interval = setInterval(() => {
      setHoldCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setHoldSuccessData(null);
          fetchBeds();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdSuccessData]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Pricing calculations
  const baseRent = selectedRoom ? selectedRoom.rentPerPerson : (property.rentPerPerson || property.monthlyRent || 6000);
  const calculatedDeposit = securityDeposit || baseRent;
  const serviceFee = Math.round(baseRent * 0.05); // 5% platform commission
  const totalDue = baseRent + calculatedDeposit + serviceFee;

  // Hold Bed action
  const handleHoldAndBook = async () => {
    if (!selectedRoom || !selectedBed) {
      setError('Please select an available bed first.');
      return;
    }
    setHoldingLoading(true);
    setError('');

    try {
      // 1. Lock bed temporarily
      const holdRes = await bookingsAPI.holdBed({
        propertyId: property._id || property.id,
        roomNumber: selectedRoom.roomNumber,
        bedNumber: selectedBed.bedNumber,
        checkInDate,
        checkOutDate
      });

      if (holdRes.success) {
        setHoldSuccessData(holdRes.data);
        setHoldCountdown(holdRes.data.ttlSeconds || 900);

        // 2. Submit formal booking request linked to this held bed
        const bookingRes = await bookingsAPI.createBooking({
          propertyId: property._id || property.id,
          roomNumber: selectedRoom.roomNumber,
          bedNumber: selectedBed.bedNumber,
          roomType: selectedRoom.tierName,
          checkInDate,
          checkOutDate,
          durationMonths,
          message: `Booking request for ${selectedRoom.roomNumber} (${selectedBed.bedNumber}) from ${checkInDate} to ${checkOutDate}`,
          pricingDetails: {
            baseAmount: baseRent,
            deposit: calculatedDeposit,
            serviceFee,
            totalAmount: totalDue
          }
        });

        if (bookingRes.success) {
          if (onBookingSuccess) {
            onBookingSuccess(bookingRes.data);
          }
        }
      }
    } catch (err) {
      console.error('Error during bed reservation & booking:', err);
      setError(err.response?.data?.message || 'Could not complete bed reservation. Please try again.');
    } finally {
      setHoldingLoading(false);
    }
  };

  const getPolicyDetails = (policy) => {
    switch (policy) {
      case 'Flexible':
        return {
          label: 'Flexible Policy',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          desc: '100% refund if cancelled up to 24 hours prior to check-in.'
        };
      case 'Strict':
        return {
          label: 'Strict Policy',
          color: 'bg-rose-50 text-rose-800 border-rose-200',
          desc: '50% refund up to 7 days before check-in. Non-refundable afterwards.'
        };
      case 'Moderate':
      default:
        return {
          label: 'Moderate Policy',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          desc: '100% refund up to 5 days before check-in, 50% up to 48 hours.'
        };
    }
  };

  const policyInfo = getPolicyDetails(cancellationPolicy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <BedDouble className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Select Your Room & Available Bed
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {property.title} &bull; {property.city}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Active 15-Minute Hold Notification Banner */}
          {holdSuccessData && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <div>
                  <strong className="block text-xs sm:text-sm font-extrabold text-emerald-800">
                    Bed Locked for You! Reservation Request Submitted
                  </strong>
                  <span className="text-[11px] text-emerald-700">
                    {holdSuccessData.roomNumber} · {holdSuccessData.bedNumber} is reserved. Time remaining to pay:
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-2xs tracking-wider shrink-0 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatCountdown(holdCountdown)}</span>
              </span>
            </div>
          )}

          {/* Date Range Selectors */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Check-in Date</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Check-out Date</span>
              </label>
              <input
                type="date"
                min={checkInDate}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Duration</span>
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600"
              >
                <option value={1}>1 Month (Flexible)</option>
                <option value={3}>3 Months (Semester)</option>
                <option value={6}>6 Months</option>
                <option value={12}>1 Year (Annual)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Rooms and Beds Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Available Rooms & Beds
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Held
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Occupied
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs font-semibold animate-pulse space-y-2">
                <BedDouble className="w-8 h-8 text-purple-500 mx-auto animate-bounce" />
                <p>Checking live room availability and reservation locks...</p>
              </div>
            ) : roomsData.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-medium">
                No rooms configured for this property yet. Please contact the landlord directly.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomsData.map((rm) => (
                  <div
                    key={rm.roomNumber}
                    className={`p-4 rounded-2xl border transition-all ${
                      selectedRoom?.roomNumber === rm.roomNumber
                        ? 'border-purple-600 bg-purple-50/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-black text-slate-900">{rm.roomNumber}</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          Floor {rm.floor}
                        </span>
                      </div>
                      <span className="text-xs font-black text-purple-700">
                        ₹{rm.rentPerPerson?.toLocaleString('en-IN')}<span className="text-[10px] font-medium text-slate-400">/mo</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-semibold block mb-3">
                      {rm.tierName} &bull; {rm.availableBedsCount} of {rm.occupancy} beds open
                    </span>

                    {/* Beds in this Room */}
                    <div className="grid grid-cols-2 gap-2">
                      {rm.beds?.map((bed) => {
                        const isSelected = selectedRoom?.roomNumber === rm.roomNumber && selectedBed?.bedNumber === bed.bedNumber;
                        const isAvailable = bed.status === 'AVAILABLE' || bed.heldByMe;
                        const isHeldByOther = bed.status === 'HELD' && !bed.heldByMe;
                        const isOccupied = bed.status === 'OCCUPIED';

                        return (
                          <button
                            key={bed.bedNumber}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedRoom(rm);
                              setSelectedBed(bed);
                              setError('');
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-600/30'
                                : isAvailable
                                ? 'bg-emerald-50/60 hover:bg-emerald-100/60 border-emerald-200 text-emerald-900'
                                : isHeldByOther
                                ? 'bg-amber-50/50 border-amber-200 text-amber-800 opacity-70 cursor-not-allowed'
                                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <BedDouble className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-xs font-bold">{bed.bedNumber}</span>
                            </div>

                            <span className="text-[10px] font-black uppercase">
                              {isSelected ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : isAvailable ? (
                                'Open'
                              ) : isHeldByOther ? (
                                <Lock className="w-3 h-3 text-amber-600" />
                              ) : (
                                'Full'
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Breakdown & Cancellation Policy Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Cancellation Policy Banner */}
            <div className="lg:col-span-6 p-4 rounded-2xl border text-xs space-y-1.5 ${policyInfo.color}">
              <div className="flex items-center gap-2 font-black text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{policyInfo.label}</span>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                {policyInfo.desc}
              </p>
              <span className="text-[10px] text-slate-400 block pt-1">
                Zero booking commission &bull; Direct landlord rental agreement
              </span>
            </div>

            {/* Price Summary */}
            <div className="lg:col-span-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Monthly Rent ({selectedRoom?.tierName || '1 Bed'})</span>
                <span className="font-bold text-slate-900">₹{baseRent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Refundable Security Deposit</span>
                <span className="font-bold text-slate-900">₹{calculatedDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Platform Service & Tenant Verification Fee</span>
                <span className="font-bold text-slate-900">₹{serviceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Amount Due</span>
                <span className="text-purple-700 text-base">₹{totalDue.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Submit Hold & Proceed Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!selectedBed || holdingLoading}
              onClick={handleHoldAndBook}
              className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                !selectedBed || holdingLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer hover:shadow-purple-600/25 active:scale-98'
              }`}
            >
              {holdingLoading ? (
                <span>Locking Bed & Submitting Request...</span>
              ) : (
                <>
                  <span>
                    Lock {selectedRoom?.roomNumber || 'Room'} · {selectedBed?.bedNumber || 'Bed'} & Submit Booking
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center font-medium mt-2">
              🔒 15-minute temporary bed hold is applied immediately to prevent double-booking.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BedSelectorModal;
