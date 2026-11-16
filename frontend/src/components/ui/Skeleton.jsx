import React from 'react';

export const LoadingSkeleton = ({ className = '', count = 1 }) => {
  if (count === 1) {
    return (
      <div className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`} />
    );
  }

  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`} />
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 animate-pulse">
    <div className="h-44 bg-slate-200/70 rounded-xl" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-200/70 rounded-md w-3/4" />
      <div className="h-3 bg-slate-200/60 rounded-md w-1/2" />
    </div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <div className="h-5 bg-slate-200/70 rounded-md w-1/3" />
      <div className="h-7 bg-slate-200/70 rounded-lg w-20" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden p-4 space-y-3 animate-pulse">
    <div className="h-6 bg-slate-200/70 rounded-lg w-full mb-4" />
    {Array.from({ length: rows }).map((_, rIdx) => (
      <div key={rIdx} className="grid grid-cols-4 gap-4 py-2 border-b border-slate-100 last:border-0">
        {Array.from({ length: cols }).map((_, cIdx) => (
          <div key={cIdx} className="h-4 bg-slate-200/60 rounded-md" />
        ))}
      </div>
    ))}
  </div>
);
