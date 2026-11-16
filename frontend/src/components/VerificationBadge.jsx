import React from 'react';
import { ShieldCheck } from 'lucide-react';

const VerificationBadge = ({ status, variant = 'default', className = '' }) => {
  if (status !== 'Verified') return null;

  if (variant === 'glass' || variant === 'frosted') {
    return (
      <span className={`inline-flex items-center gap-1 bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-emerald-400/30 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
        Verified Stay
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200/80 shadow-2xs ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      Verified Stay
    </span>
  );
};

export default VerificationBadge;

