import React from 'react';
import clsx from 'clsx';

export interface LoadingSectionProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSection({ message, size = 'md' }: LoadingSectionProps) {
  return (
    <section className="p-4 max-w-7xl min-w-full mx-auto">
      <div className="w-fit mx-auto flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
        <div className={clsx('hippo-spinner', size === 'lg' && 'hippo-spinner-lg')} aria-label="Loading" />
        {message && (
          <div className={clsx('font-medium text-[var(--text-secondary)]', size === 'lg' ? 'text-base' : 'text-sm')}>
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
