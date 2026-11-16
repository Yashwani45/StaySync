import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, ShieldAlert, Sparkles, Home, Users, Salad, Shirt, Brush, Wrench, Container, HelpCircle } from 'lucide-react';

const Onboarding = () => {
  const { roommateProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(roommateProfile?.selectedServices || ['room']);
  const [loading, setLoading] = useState(false);

  const modules = [
    { id: 'room', label: 'Find a Room / PG', icon: <Home className="w-5 h-5" />, desc: 'Explore local hostels, rooms, and shared apartments.' },
    { id: 'tiffin', label: 'Find Tiffin / Food', icon: <Salad className="w-5 h-5" />, desc: 'Subscribe to healthy vegetarian home-delivered meal plans.' },
    { id: 'laundry', label: 'Find Laundry Washers', icon: <Shirt className="w-5 h-5" />, desc: 'Find nearby ironing and regular dry cleaning providers.' },
    { id: 'cleaning', label: 'Find Deep Cleaning', icon: <Brush className="w-5 h-5" />, desc: 'Book sweeps, bathroom washes, or deep home cleaning.' },
    { id: 'maintenance', label: 'Find Repair Techs', icon: <Wrench className="w-5 h-5" />, desc: 'Instant bookings for local electricians, plumbers & AC mechanics.' },
    { id: 'movers', label: 'Find Packers & Movers', icon: <Container className="w-5 h-5" />, desc: 'Safe luggage relocation services when moving cities.' }
  ];

  const handleToggle = (id) => {
    if (selected.includes(id)) {
      // Don't allow empty selection to prevent dashboard crash
      if (selected.length > 1) {
        setSelected(selected.filter(x => x !== id));
      }
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleCompleteLivingSelect = () => {
    setSelected(['room', 'tiffin', 'laundry', 'cleaning', 'maintenance', 'movers']);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ selectedServices: selected });
      // Take them to profile details next to configure budget and lifestyle vectors
      navigate('/profile');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        
        {/* Title */}
        <div className="text-center mb-8">
          <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Step 1 of 2: Personalize
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">What do you need?</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            Select one or multiple modules. StaySync will customize your dashboard to show only selected services.
          </p>
        </div>

        {/* Quick Option - All In One Bundle */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleCompleteLivingSelect}
            className="w-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-xl p-4 flex items-center justify-between text-left transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm text-green-900 font-bold">Complete Living Solution</strong>
                <span className="text-xs text-green-700">Activate all services (Accommodation, Tiffin, Cleaning, Chores, Movers).</span>
              </div>
            </div>
            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Quick Setup
            </span>
          </button>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const isSelected = selected.includes(m.id);
            return (
              <div
                key={m.id}
                onClick={() => handleToggle(m.id)}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3 select-none ${isSelected ? 'bg-green-50/40 border-green-500 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-800">{m.label}</h3>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="mt-8 pt-6 border-t border-gray-150 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold px-8 py-3 rounded-lg text-sm shadow-sm transition-all"
          >
            {loading ? 'Saving Preferences...' : 'Save & Continue'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
