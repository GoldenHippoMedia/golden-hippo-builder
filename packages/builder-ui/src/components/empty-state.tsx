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
    <div className={clsx('rounded-2xl bg-base-200 py-16 px-6', className)}>
      <div className="text-center">
        <p className="text-base-content/60 mb-4">{message}</p>
        {action && (
          <button className="btn btn-primary" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
