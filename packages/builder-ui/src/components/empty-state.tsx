import React from 'react';
import clsx from 'clsx';

export interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-dashed border-[var(--border-glass)] py-16 px-6 backdrop-blur-sm',
        className,
      )}
    >
      <div className="text-center">
        <p className="text-[var(--text-muted)] mb-4">{message}</p>
        {action && (
          <button
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-[#1a1a2e] font-semibold text-sm cursor-pointer transition-all hover:brightness-110 hover:shadow-[0_0_20px_var(--accent-glow)]"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
