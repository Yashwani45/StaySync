import React from 'react';
import { PackageOpen } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no active records matching your criteria or filters.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`p-10 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200/90 shadow-2xs ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs font-semibold text-slate-500 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex items-center gap-2.5">
          {actionLabel && (
            <PrimaryButton onClick={onAction} size="sm">
              {actionLabel}
            </PrimaryButton>
          )}
          {secondaryActionLabel && (
            <SecondaryButton onClick={onSecondaryAction} size="sm">
              {secondaryActionLabel}
            </SecondaryButton>
          )}
        </div>
      )}
    </div>
  );
};
