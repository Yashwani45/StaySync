import React, { useState } from 'react';
import { 
  Mail, CheckCircle2, ShieldCheck, Home, Utensils, Sparkles, 
  Phone, MapPin, Calendar, DollarSign, Download, X, ExternalLink, 
  FileText, Check, ArrowRight, Printer
} from 'lucide-react';
import { normalizeImageUrl } from '../utils/imageHelper';

const EmailConfirmationModal = ({ isOpen, onClose, bookingData, user, onGoToDashboard }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !bookingData) return null;

  const {
    category, // 'Property', 'Tiffin', or 'Cleaning'
    title,
    businessName,
    propertyType,
    roomType,
    address,
    city,
    monthlyRent,
    securityDeposit,
    tiffinPrice,
    cleaningPrice,
    foodAvailable,
    amenities = [],
    ownerName,
    ownerPhone,
    bookingId = `SS-${Date.now().toString().slice(-6)}`,
    bookingDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } = bookingData;

  const displayTitle = title || businessName || 'StaySync Living Service';
  const displayCategory = category === 'Property' 
    ? (propertyType ? `${propertyType} · ${roomType || 'Room'}` : 'Hostel / Room Stay') 
    : (category === 'Tiffin' ? 'Daily Tiffin & Mess Subscription' : 'Room Deep Cleaning & Laundry');

  const priceDisplay = monthlyRent 
    ? `₹${Number(monthlyRent).toLocaleString('en-IN')}/month` 
    : tiffinPrice 
    ? `₹${Number(tiffinPrice).toLocaleString('en-IN')}/month` 
    : cleaningPrice 
    ? `₹${Number(cleaningPrice).toLocaleString('en-IN')}` 
    : '₹Standard Rate';

  const handlePrint = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      window.print();
      setDownloadSuccess(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6">
        
        {/* Email Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs text-white">
              <Mail className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                StaySync Automated Email Dispatcher
              </span>
              <p className="text-xs text-emerald-100 font-medium">Official Contract & Move-In Confirmation</p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 leading-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
            <span>Booking Confirmed &amp; Registered!</span>
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            An official email receipt has been sent to <strong className="text-white underline">{user?.email || 'your registered email'}</strong>.
          </p>
        </div>

        {/* Simulated Email Envelope Card Body */}
        <div className="p-5 sm:p-6 space-y-5 text-gray-700 max-h-[75vh] overflow-y-auto">
          
          {/* Email Metadata Header */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/90 text-xs space-y-1.5">
            <div className="flex flex-wrap justify-between gap-1 text-[11px] text-gray-500 border-b border-gray-200 pb-1.5">
              <span><strong>From:</strong> StaySync Automated Dispatcher &lt;bookings@staysync.com&gt;</span>
              <span><strong>Date:</strong> {bookingDate} (Just now)</span>
            </div>
            <div className="text-[11px] text-gray-700">
              <p><strong>To:</strong> {user?.name || 'Resident'} &lt;{user?.email || 'tenant@staysync.com'}&gt;</p>
              <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Subject:</strong> Official Confirmation: Your {displayCategory} [{displayTitle}] is Registered!</span>
              </p>
            </div>
          </div>

          {/* Salutation & Status Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-gray-900">
                Dear {user?.name || 'Valued Resident'},
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Welcome to StaySync! Your booking has been verified and registered into the system.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-[11px] rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>[REGISTERED & CONFIRMED]</span>
            </span>
          </div>

          {/* Official Invoice & Booking Details Grid */}
          <div className="bg-white rounded-2xl border-2 border-emerald-100 p-4 sm:p-5 shadow-xs space-y-4">
            
            <div className="flex items-start justify-between gap-3 border-b border-gray-150 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                  {displayCategory}
                </span>
                <h4 className="text-lg font-black text-gray-900 mt-0.5">{displayTitle}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{address}, {city}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Booking Reference</span>
                <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  #{bookingId}
                </span>
              </div>
            </div>

            {/* Financial & Schedule Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-150">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Rate</span>
                <strong className="text-sm font-black text-emerald-700">{priceDisplay}</strong>
              </div>

              {securityDeposit && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Security Deposit</span>
                  <strong className="text-sm font-black text-gray-800">₹{Number(securityDeposit).toLocaleString('en-IN')}</strong>
                </div>
              )}

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Move-in / Activation</span>
                <strong className="text-xs font-black text-gray-800">Tomorrow (Immediate)</strong>
              </div>
            </div>

            {/* Included Amenities / Food Badge */}
            {(foodAvailable || (amenities && amenities.length > 0)) && (
              <div className="pt-1 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Included Amenities & Facilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {foodAvailable && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                      <Utensils className="w-3 h-3 text-amber-700" />
                      <span>3 Daily Meals Included</span>
                    </span>
                  )}
                  {amenities.map(a => (
                    <span key={a} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Landlord / Provider Direct Contact */}
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-blue-900 block text-xs">Direct Owner / Provider Contact:</span>
                  <span className="text-gray-600 text-[11px]">{ownerName || displayTitle}</span>
                </div>
              </div>
              <a
                href={`tel:${ownerPhone || '+919826012345'}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 self-start sm:self-auto hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-3 h-3 text-blue-600" />
                <span>{ownerPhone || '+91 98260 12345'}</span>
              </a>
            </div>

          </div>

          {/* Next Steps Guide */}
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-950">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>What happens next?</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              <li>The landlord/provider has received your booking confirmation on their dashboard.</li>
              <li>Your active room, daily meals, and rent tracker have been connected to your <strong>Living Dashboard</strong>.</li>
              <li>Keep this email receipt safe for move-in verification and security deposit refund.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>{downloadSuccess ? 'Printing...' : 'Print / Save PDF Receipt'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onGoToDashboard}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Living Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EmailConfirmationModal;
