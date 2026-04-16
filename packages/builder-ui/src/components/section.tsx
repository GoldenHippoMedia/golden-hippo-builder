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
        'rounded-2xl p-8 backdrop-blur-sm border',
        variant === 'danger'
          ? 'border-[var(--error)]/20 bg-[var(--error)]/5'
          : 'bg-[var(--bg-glass)] border-[var(--border-glass)]',
        className,
      )}
    >
      {(title || actions) && (
        <div className={clsx('flex items-center justify-between', children ? 'mb-6' : '')}>
          <div>
            {title && <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h2>}
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
