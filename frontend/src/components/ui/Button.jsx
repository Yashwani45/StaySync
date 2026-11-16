import React from 'react';
import { Loader2 } from 'lucide-react';

export const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs font-bold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-extrabold rounded-xl gap-2.5',
    xl: 'px-6 py-3.5 text-base font-black rounded-2xl gap-3',
  }[size] || 'px-4 py-2 text-xs font-bold rounded-xl gap-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 select-none shadow-xs
        bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1
        disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};

export const SecondaryButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs font-bold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-extrabold rounded-xl gap-2.5',
    xl: 'px-6 py-3.5 text-base font-black rounded-2xl gap-3',
  }[size] || 'px-4 py-2 text-xs font-bold rounded-xl gap-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 select-none
        bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs
        focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1
        disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-slate-400" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0 text-slate-500" />
      ) : null}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0 text-slate-500" />
      )}
    </button>
  );
};

export const TealButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs font-bold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-extrabold rounded-xl gap-2.5',
  }[size] || 'px-4 py-2 text-xs font-bold rounded-xl gap-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 select-none shadow-xs
        bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white
        focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-1
        disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export const DangerButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs font-bold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-extrabold rounded-xl gap-2.5',
  }[size] || 'px-4 py-2 text-xs font-bold rounded-xl gap-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 select-none shadow-xs
        bg-rose-50 hover:bg-rose-100 text-rose-700 active:bg-rose-200 border border-rose-200
        focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1
        disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0 text-rose-500" /> : Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export const GhostButton = ({
  children,
  onClick,
  disabled = false,
  icon: Icon,
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    md: 'px-3 py-1.5 text-xs font-bold rounded-xl gap-2',
    lg: 'px-4 py-2 text-sm font-extrabold rounded-xl gap-2',
  }[size] || 'px-3 py-1.5 text-xs font-bold rounded-xl gap-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-bold tracking-tight transition-all select-none
        text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/70
        disabled:opacity-40 disabled:pointer-events-none
        ${sizeClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export const IconButton = ({
  icon: Icon,
  onClick,
  title,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-9 h-9 rounded-xl text-sm',
    lg: 'w-11 h-11 rounded-2xl text-base',
  }[size] || 'w-9 h-9 rounded-xl';

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size] || 'w-4 h-4';

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
    secondary: 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs',
    ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200',
    teal: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200',
  }[variant] || 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all select-none shrink-0
        focus:outline-none focus:ring-2 focus:ring-indigo-500/30
        disabled:opacity-40 disabled:pointer-events-none
        ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon className={iconSizes} />}
    </button>
  );
};
