import React from 'react';
import clsx from 'clsx';

export interface LoadingSectionProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  loadingType?: 'dots' | 'spinner' | 'ball' | 'ring' | 'bars';
}

const SIZE_CLASS: Record<NonNullable<LoadingSectionProps['size']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

const COLOR_CLASS: Record<NonNullable<LoadingSectionProps['color']>, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-error',
  default: 'text-default',
};

export function LoadingSection({ message, color = 'default', size = 'md', loadingType = 'dots' }: LoadingSectionProps) {
  const sizeClass = SIZE_CLASS[size];
  const colorClass = COLOR_CLASS[color];

  const loadingIndicatorClass = clsx('loading', sizeClass, colorClass, {
    'loading-dots': loadingType === 'dots',
    'loading-spinner': loadingType === 'spinner',
    'loading-ball': loadingType === 'ball',
    'loading-ring': loadingType === 'ring',
    'loading-bars': loadingType === 'bars',
  });

  const messageClass = clsx('font-medium', sizeClass, colorClass);

  return (
    <section className="p-4 max-w-7xl min-w-full mx-auto rounded-lg">
      <div className="w-fit mx-auto flex flex-col items-center justify-center gap-2" role="status" aria-live="polite">
        {message && <div className={messageClass}>{message}</div>}
        <div className={loadingIndicatorClass} aria-label="Loading"></div>
      </div>
    </section>
  );
}
