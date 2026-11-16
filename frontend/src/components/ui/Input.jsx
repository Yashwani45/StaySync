import React from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

export const InputField = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  onClear,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 tracking-tight">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`block w-full text-xs font-semibold text-slate-900 bg-white border rounded-xl transition-all placeholder:text-slate-400
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${onClear && value ? 'pr-9' : 'pr-3.5'}
            py-2.5
            ${error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
            }
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            focus:outline-none ${className}`}
          {...props}
        />
        {onClear && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {error ? (
        <p className="text-[11px] font-semibold text-rose-600 animate-in fade-in">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export const TextareaField = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 tracking-tight">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={`block w-full text-xs font-semibold text-slate-900 bg-white border rounded-xl p-3 transition-all placeholder:text-slate-400 shadow-2xs
          ${error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200/90 hover:border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
          }
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          focus:outline-none resize-none ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-[11px] font-semibold text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export const SelectField = ({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-slate-700 tracking-tight">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`block w-full text-xs font-semibold text-slate-900 bg-white border rounded-xl transition-all appearance-none cursor-pointer
            ${Icon ? 'pl-10' : 'pl-3.5'} pr-9 py-2.5
            ${error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
            }
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            focus:outline-none ${className}`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search stays, verified PGs, hostels, locations...',
  size = 'md',
  className = '',
  shortcutHint = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-2 pl-9 pr-8 text-xs rounded-xl',
    md: 'py-2.5 pl-10 pr-9 text-xs font-semibold rounded-xl',
    lg: 'py-3.5 pl-12 pr-10 text-sm font-semibold rounded-2xl shadow-xs',
  }[size] || 'py-2.5 pl-10 pr-9 text-xs font-semibold rounded-xl';

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-3',
    md: 'w-4 h-4 left-3.5',
    lg: 'w-5 h-5 left-4',
  }[size] || 'w-4 h-4 left-3.5';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className={`absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 ${iconSizes}`}>
        <Search />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400
          transition-all duration-200 shadow-2xs hover:border-slate-300
          focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none ${sizeClasses}`}
        {...props}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : shortcutHint ? (
        <span className="absolute top-1/2 -translate-y-1/2 right-3 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-400 border border-slate-200">
          ⌘K
        </span>
      ) : null}
    </div>
  );
};
