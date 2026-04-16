import React from 'react';
import clsx from 'clsx';

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  className?: string;
}

const STATUS_STYLES: Record<StatusBadgeProps['status'], string> = {
  success: 'bg-[var(--success)]/15 text-[var(--success)]',
  warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
  error: 'bg-[var(--error)]/15 text-[var(--error)]',
  info: 'bg-[var(--accent)]/15 text-[var(--accent)]',
  neutral: 'bg-[var(--bg-glass-hover)] text-[var(--text-secondary)]',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
