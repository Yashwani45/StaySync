import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Users, 
  TrendingUp, 
  MapPin, 
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="space-y-12 pb-16 text-slate-800 bg-white">
      
      {/* Top Hero Banner */}
      <section className="relative min-h-[260px] sm:min-h-[300px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&auto=format&fit=crop&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-[#064e3b]/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            About StaySync
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 font-medium">
            Building better living experiences for a brighter future.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Our Story
            </h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed font-medium">
              <p>
                StaySync was founded with a simple mission — to make finding accommodation and essential living services easier, safer and more convenient for students, working professionals and people relocating to a new city.
              </p>
              <p>
                We are a team of dreamers, builders and problem solvers who believe that everyone deserves a safe, comfortable and connected place to call home.
              </p>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-64 sm:h-72">
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"
                alt="Cozy Stay"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Our Values Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Core Principles
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-center space-y-2 shadow-2xs hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-emerald-950">Trust</h3>
            <p className="text-xs text-slate-600">Verified stays, audited photos &amp; direct rents.</p>
          </div>

          <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200 text-center space-y-2 shadow-2xs hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white mx-auto flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-sky-950">Convenience</h3>
            <p className="text-xs text-slate-600">Rent, tiffin, cleaning in 1 unified dashboard.</p>
          </div>

          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-center space-y-2 shadow-2xs hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white mx-auto flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-amber-950">Community</h3>
            <p className="text-xs text-slate-600">Safe roommate matches &amp; local peer network.</p>
          </div>

          <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 text-center space-y-2 shadow-2xs hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white mx-auto flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-purple-950">Growth</h3>
            <p className="text-xs text-slate-600">Empowering student hubs &amp; local city hosts.</p>
          </div>

        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22] text-white py-12 rounded-3xl max-w-6xl mx-auto px-4 sm:px-6 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
            <span className="text-2xl sm:text-4xl font-black block text-emerald-300">10,000+</span>
            <span className="text-xs text-emerald-100/90 font-bold uppercase tracking-wider mt-1 block">Happy Users</span>
          </div>
          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
            <span className="text-2xl sm:text-4xl font-black block text-sky-300">2,500+</span>
            <span className="text-xs text-emerald-100/90 font-bold uppercase tracking-wider mt-1 block">Verified Listings</span>
          </div>
          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
            <span className="text-2xl sm:text-4xl font-black block text-amber-300">15+</span>
            <span className="text-xs text-emerald-100/90 font-bold uppercase tracking-wider mt-1 block">Student Cities</span>
          </div>
          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
            <span className="text-2xl sm:text-4xl font-black block text-purple-300">24/7</span>
            <span className="text-xs text-emerald-100/90 font-bold uppercase tracking-wider mt-1 block">Resident Support</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
