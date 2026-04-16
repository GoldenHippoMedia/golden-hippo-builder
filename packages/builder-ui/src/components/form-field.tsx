import React from 'react';
import clsx from 'clsx';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, helper, error, children, className }: FormFieldProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      <label className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
        {label}
        {required && <span className="text-[var(--accent)] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-[var(--error)]">{error}</p>}
      {!error && helper && <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{helper}</p>}
    </div>
  );
}
