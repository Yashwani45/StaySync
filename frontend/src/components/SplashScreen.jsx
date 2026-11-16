import React, { useState, useEffect } from 'react';
import { Building2, Map, Utensils, Shirt, Wallet } from 'lucide-react';

const FEATURES = [
  { icon: Building2, label: "Hostels & PGs", desc: "Verified rooms & hostels", color: "from-blue-500 to-cyan-400" },
  { icon: Map, label: "Interactive Maps", desc: "Real-time location view", color: "from-purple-500 to-indigo-400" },
  { icon: Utensils, label: "Tiffin Meals", desc: "Daily meal subscriptions", color: "from-emerald-600 to-teal-400" },
  { icon: Shirt, label: "Laundry & Chores", desc: "Hassle-free daily help", color: "from-pink-500 to-rose-400" },
  { icon: Wallet, label: "Expense Manager", desc: "Easy split billing", color: "from-emerald-500 to-teal-400" }
];

export default function SplashScreen({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Phase 1: Sequential step progression
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < FEATURES.length) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 550);

    // Phase 2: Fade-out transition after all steps show
    const fadeTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 3200);

    // Phase 3: Unmount callback
    const unmountTimeout = setTimeout(() => {
      onComplete();
    }, 3900);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(unmountTimeout);
    };
  }, [onComplete]);

  // Set logo animation to start
  useEffect(() => {
    const t = setTimeout(() => setLogoLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-all duration-700 ease-in-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
      }`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-[80px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-50 blur-[80px] opacity-60" />

      <div className="relative flex flex-col items-center max-w-lg w-full px-6 text-center space-y-8">
        
        {/* Brand / Logo Section */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center mx-auto">
            {/* Spinning/pulsing aura */}
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="absolute w-20 h-20 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center animate-pulse" />
            
            <img
              src="/logo.svg"
              alt="StaySync Logo"
              className={`relative w-14 h-14 object-contain transition-all duration-700 ${
                logoLoaded ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
              }`}
            />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Stay<span className="text-green-600">Sync</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">
            Your Personal Living Companion
          </p>
        </div>

        {/* Loading Feature Steps */}
        <div className="w-full space-y-3 py-4 text-left max-w-sm">
          {FEATURES.map((feat, index) => {
            const isShown = activeStep > index;
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-2.5 rounded-xl border bg-white/60 backdrop-blur-sm transition-all duration-500 transform ${
                  isShown
                    ? 'opacity-100 translate-y-0 scale-100 border-gray-250 shadow-sm'
                    : 'opacity-0 translate-y-4 scale-95 border-transparent'
                }`}
              >
                {/* Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                    feat.color
                  } text-white shadow-md transform transition-transform duration-300 ${
                    isShown ? 'scale-100' : 'scale-75'
                  }`}
                >
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-gray-800 leading-tight">
                    {feat.label}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    {feat.desc}
                  </p>
                </div>

                {/* Status indicator checkmark */}
                <div className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-50 text-green-600">
                  <svg
                    className={`w-3.5 h-3.5 transition-all duration-300 ${
                      isShown ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom loading indicator */}
        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-[3000ms] ease-out"
            style={{ width: activeStep === FEATURES.length ? '100%' : `${(activeStep / FEATURES.length) * 85}%` }}
          />
        </div>

      </div>
    </div>
  );
}
