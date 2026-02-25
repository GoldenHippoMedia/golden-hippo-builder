import React from 'react';
import clsx from 'clsx';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
}

export function Section({ title, subtitle, actions, children, className, variant = 'default' }: SectionProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl p-6',
        variant === 'danger' ? 'border border-error/20 bg-error/5' : 'bg-base-200',
        className,
      )}
    >
      {(title || actions) && (
        <div className={clsx('flex items-center justify-between', children ? 'mb-5' : '')}>
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm text-base-content/60 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
