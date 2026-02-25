import React from 'react';
import clsx from 'clsx';

export interface DetailHeaderBadge {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'ghost';
}

export interface DetailHeaderProps {
  title: string;
  onBack: () => void;
  backLabel?: string;
  badges?: DetailHeaderBadge[];
  actions?: React.ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<string, string> = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  ghost: 'badge-ghost',
};

export function DetailHeader({ title, onBack, backLabel, badges, actions, className }: DetailHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between mb-8', className)}>
      <div className="flex items-center gap-4">
        <button className="btn btn-ghost btn-sm gap-1" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          {backLabel ?? 'Back'}
        </button>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {badges?.map((badge, i) => (
          <span key={i} className={clsx('badge', VARIANT_CLASS[badge.variant ?? 'ghost'])}>
            {badge.label}
          </span>
        ))}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
