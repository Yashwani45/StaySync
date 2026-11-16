import React, { useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { PrimaryButton, SecondaryButton, DangerButton } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
              <div>
                {title && <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>}
                {subtitle && <p className="text-xs font-semibold text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Optional Footer */}
          {footer && (
            <div className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 rounded-b-3xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-indigo-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
  }[type] || <AlertTriangle className="w-6 h-6 text-rose-600" />;

  const iconBg = {
    danger: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-indigo-50 border-indigo-100',
    success: 'bg-emerald-50 border-emerald-100',
  }[type] || 'bg-rose-50 border-rose-100';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center sm:text-left sm:flex sm:items-start sm:gap-4">
        <div className={`mx-auto sm:mx-0 w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconBg}`}>
          {icons}
        </div>
        <div className="mt-3 sm:mt-0">
          <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <SecondaryButton onClick={onClose} disabled={loading} size="sm">
          {cancelText}
        </SecondaryButton>
        {type === 'danger' ? (
          <DangerButton onClick={onConfirm} loading={loading} size="sm">
            {confirmText}
          </DangerButton>
        ) : (
          <PrimaryButton onClick={onConfirm} loading={loading} size="sm">
            {confirmText}
          </PrimaryButton>
        )}
      </div>
    </Modal>
  );
};
