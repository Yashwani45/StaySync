import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-5',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs transition-all duration-200
        ${hover ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer' : ''}
        ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendLabel,
  color = 'indigo',
  actionLabel,
  onAction,
  className = '',
}) => {
  const colorSchemes = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  }[color] || 'bg-indigo-50 text-indigo-600 border-indigo-100';

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-500 tracking-tight">{title}</span>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colorSchemes}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || trend || actionLabel) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend !== undefined ? (
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center text-[11px] font-extrabold ${trend >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-[11px] text-slate-400 font-medium">{trendLabel}</span>}
            </div>
          ) : subtext ? (
            <span className="text-[11px] font-semibold text-slate-400 truncate">{subtext}</span>
          ) : <span />}

          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  badge,
  className = '',
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-indigo-200 group ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center transition-transform group-hover:scale-105">
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      {badge && (
        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-base font-black text-slate-900 mt-4 tracking-tight group-hover:text-indigo-600 transition-colors">
      {title}
    </h3>
    <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-relaxed">
      {description}
    </p>
  </div>
);
