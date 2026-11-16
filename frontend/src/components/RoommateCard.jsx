import React, { useState } from 'react';
import { ShieldAlert, Smile, Frown, CheckCircle2, UserCheck, MessageCircle, Star, Heart, Sparkles, MapPin } from 'lucide-react';
import VerificationBadge from './VerificationBadge';

const RoommateCard = ({ roommate, onConnect, onShortlist, isShortlisted }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const {
    _id,
    user,
    age,
    gender,
    occupation,
    collegeOrOffice,
    monthlyBudget,
    compatibilityScore = 80,
    matches = [],
    differences = []
  } = roommate;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-700 border-green-200 bg-green-50';
    if (score >= 75) return 'text-green-600 border-green-200 bg-green-50/60';
    if (score >= 60) return 'text-yellow-700 border-yellow-200 bg-yellow-50';
    return 'text-gray-600 border-gray-200 bg-gray-50';
  };

  const getScoreProgressBar = (score) => {
    if (score >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (score >= 75) return 'bg-gradient-to-r from-green-400 to-teal-500';
    if (score >= 60) return 'bg-gradient-to-r from-amber-400 to-yellow-500';
    return 'bg-gray-400';
  };

  const name = user?.name || 'Anonymous';
  const profileImage = user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  const city = user?.preferredCity || user?.currentCity || '';

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden flex flex-col hover:shadow-xl hover:border-green-300 transition-all duration-300 relative group">
      
      {/* Top Header Card */}
      <div className="p-5 flex items-start gap-4">
        {/* Profile Avatar with status indicator ring */}
        <div className="relative shrink-0">
          <img
            src={profileImage}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-green-500/30 group-hover:ring-green-500 transition-all"
          />
          {user?.isVerified && (
            <span className="absolute bottom-0 right-0 p-0.5 rounded-full bg-green-600 text-white border-2 border-white shadow-xs" title="Verified User Profile">
              <CheckCircle2 className="w-3.5 h-3.5 fill-green-600 text-white" />
            </span>
          )}
        </div>

        {/* User basic info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-gray-900 text-base truncate group-hover:text-green-600 transition-colors">
              {name}
            </h3>
            
            {/* Shortlist Heart button */}
            <button
              onClick={() => onShortlist(_id)}
              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 transition-colors shrink-0 hover:bg-gray-50"
              title="Save Roommate"
            >
              <Heart className={`w-4.5 h-4.5 ${isShortlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          <p className="text-gray-500 text-xs font-semibold mt-0.5">
            {gender}, {age} yrs · {occupation}
          </p>
          
          {collegeOrOffice && (
            <p className="text-gray-500 text-[11px] mt-1 truncate font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{collegeOrOffice}</span>
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Budget: <strong className="text-gray-900 font-bold">₹{monthlyBudget.toLocaleString('en-IN')}/mo</strong>
            </span>
            {city && (
              <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200">
                {city}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Compatibility Progress Bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span>Compatibility Score</span>
          </span>
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getScoreColor(compatibilityScore)}`}>
            {compatibilityScore}% Match
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full ${getScoreProgressBar(compatibilityScore)} rounded-full transition-all duration-500`}
            style={{ width: `${compatibilityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Matches & Differences Analysis */}
      <div className="px-5 py-4 border-t border-gray-150 bg-gray-50/60 flex-1 flex flex-col justify-between">
        
        {/* Toggle details */}
        <div>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="text-xs text-green-600 hover:text-green-700 font-bold mb-2.5 transition-colors focus:outline-none flex items-center gap-1"
          >
            <span>{showAnalysis ? 'Hide Match Analysis' : 'Show Match Analysis'}</span>
          </button>

          {showAnalysis ? (
            <div className="space-y-3 mb-4 animate-fadeIn">
              {/* Matches (Good Alignment) */}
              {matches.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold tracking-wider text-green-800 uppercase mb-1 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-green-600" />
                    Matches
                  </h4>
                  <ul className="space-y-1 pl-1">
                    {matches.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-1 font-medium">
                        <span className="text-green-600 shrink-0 font-extrabold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Differences (Friction Areas) */}
              {differences.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold tracking-wider text-amber-800 uppercase mb-1 flex items-center gap-1">
                    <Frown className="w-3.5 h-3.5 text-amber-600" />
                    Differences
                  </h4>
                  <ul className="space-y-1 pl-1">
                    {differences.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-start gap-1 font-medium">
                        <span className="text-amber-600 shrink-0 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-xs text-gray-600 line-clamp-2 italic font-medium">
                {matches.slice(0, 2).join(', ')}
                {matches.length > 2 && '...'}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onConnect(roommate)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect & Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoommateCard;
