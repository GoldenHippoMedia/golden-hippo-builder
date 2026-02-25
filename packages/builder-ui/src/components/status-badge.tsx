import React from 'react';
import clsx from 'clsx';

const STATUS_VARIANT: Record<string, string> = {
  active: 'badge-success',
  running: 'badge-info',
  completed: 'badge-success',
  success: 'badge-success',
  draft: 'badge-ghost',
  inactive: 'badge-ghost',
  paused: 'badge-warning',
  cancelled: 'badge-error',
  archived: 'badge-error',
  error: 'badge-error',
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const badgeClass = STATUS_VARIANT[status] ?? 'badge-ghost';
  return <span className={clsx('badge badge-sm font-medium', badgeClass, className)}>{status}</span>;
}
