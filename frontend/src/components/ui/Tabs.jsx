import React from 'react';

export const SegmentedTabs = ({
  tabs = [],
  activeTab,
  onChange,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'p-0.5 text-xs rounded-xl gap-1',
    md: 'p-1 text-xs font-bold rounded-xl gap-1.5',
    lg: 'p-1.5 text-sm font-extrabold rounded-2xl gap-2',
  }[size] || 'p-1 text-xs font-bold rounded-xl gap-1.5';

  return (
    <div className={`inline-flex items-center bg-slate-100 border border-slate-200/90 shadow-2xs ${sizeClasses} ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const badge = typeof tab === 'object' ? tab.badge : undefined;
        const Icon = typeof tab === 'object' ? tab.icon : undefined;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 select-none ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
            {badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const UnderlineTabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-slate-200 flex items-center gap-6 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const badge = typeof tab === 'object' ? tab.badge : undefined;
        const Icon = typeof tab === 'object' ? tab.icon : undefined;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 py-3 px-1 text-xs font-bold border-b-2 transition-all whitespace-nowrap select-none ${
              isActive
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{label}</span>
            {badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
