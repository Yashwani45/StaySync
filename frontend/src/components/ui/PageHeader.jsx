import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Breadcrumbs = ({ items = [], className = '' }) => {
  return (
    <nav className={`flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-3 ${className}`}>
      <Link to="/" className="hover:text-slate-900 transition flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-slate-400" />
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            {isLast || !item.href ? (
              <span className="text-slate-900 font-bold truncate max-w-xs">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-slate-900 transition truncate max-w-xs">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export const PageHeader = ({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};
