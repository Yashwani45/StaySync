import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

export const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const norm = (status || '').toLowerCase().trim();

  // Status mappings
  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: status || 'Unknown'
  };

  if (['confirmed', 'accepted', 'active', 'settled', 'resolved', 'verified', 'captured', 'paid', 'approved', 'completed'].includes(norm)) {
    config = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/80',
      dot: 'bg-emerald-500',
      label: status
    };
  } else if (['pending', 'payment pending', 'owner approved', 'processing', 'submitted', 'assigned', 'in progress', 'created', 'open', 'investigating'].includes(norm)) {
    config = {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200/80',
      dot: 'bg-amber-500',
      label: status
    };
  } else if (['refund pending', 'partially refunded', 'refunded'].includes(norm)) {
    config = {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200/80',
      dot: 'bg-indigo-500',
      label: status
    };
  } else if (['cancelled', 'rejected', 'expired', 'declined', 'failed', 'suspended', 'closed'].includes(norm)) {
    config = {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200/80',
      dot: 'bg-rose-500',
      label: status
    };
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
  }[size] || 'px-2.5 py-1 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight rounded-full border shadow-2xs ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const CategoryBadge = ({ category, size = 'sm', className = '' }) => {
  const norm = (category || '').toLowerCase();
  
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (norm.includes('hostel')) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (norm.includes('pg')) {
    color = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (norm.includes('flat') || norm.includes('room')) {
    color = 'bg-teal-50 text-teal-700 border-teal-200';
  } else if (norm.includes('tiffin') || norm.includes('food')) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm.includes('clean') || norm.includes('laundry')) {
    color = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-[11px] font-bold',
    md: 'px-2.5 py-1 text-xs font-bold',
  }[size] || 'px-2 py-0.5 text-[11px] font-bold';

  return (
    <span className={`inline-flex items-center rounded-lg border ${color} ${sizeClasses} ${className}`}>
      {category}
    </span>
  );
};

export const TagBadge = ({ children, icon: Icon, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 ${className}`}>
    {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
    <span>{children}</span>
  </span>
);

export const VerifiedCheckBadge = ({ verified = true, label = 'Verified', size = 'sm', className = '' }) => {
  if (!verified) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full shadow-2xs
        ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${className}`}
    >
      <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
      <span>{label}</span>
    </span>
  );
};
