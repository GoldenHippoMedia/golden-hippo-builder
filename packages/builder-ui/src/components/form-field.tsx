import React from 'react';
import clsx from 'clsx';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  /** Optional control rendered right-aligned in the label row (e.g. a per-field locale selector). */
  labelAccessory?: React.ReactNode;
}

export function FormField({ label, required, helper, error, children, className, labelAccessory }: FormFieldProps) {
  const labelEl = (
    <label className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
      {label}
      {required && <span className="text-[var(--accent)] ml-0.5">*</span>}
    </label>
  );
  return (
    <div className={clsx('space-y-2.5', className)}>
      {labelAccessory ? (
        <div className="flex items-center justify-between gap-2">
          {labelEl}
          {labelAccessory}
        </div>
      ) : (
        labelEl
      )}
      {children}
      {error && <p className="text-[11px] text-[var(--error)]">{error}</p>}
      {!error && helper && <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{helper}</p>}
    </div>
  );
}
