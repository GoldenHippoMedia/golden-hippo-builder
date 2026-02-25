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
    <div className={clsx('space-y-1.5', className)}>
      <label className="text-sm font-medium text-base-content/80">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
      {!error && helper && <p className="text-xs text-base-content/50">{helper}</p>}
    </div>
  );
}
