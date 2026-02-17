import React from 'react';
import clsx from 'clsx';

type StatCardVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

export interface StatGridCardProps {
  title: string;
  metric: string | number;
  loading?: boolean;
  currency?: boolean;
  actionLabel?: string;
  onActionClick?: () => void;
  variant?: StatCardVariant;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatGridCard(props: StatGridCardProps) {
  const { title, metric, currency, loading, actionLabel, onActionClick, variant, subtitle, icon, className } = props;

  const cardClass = clsx(
    'justify-between w-full px-2 min-h-full rounded-lg shadow-sm hover:shadow-lg',
    {
      'bg-primary hover:bg-primary/70 text-primary-content shadow-primary': variant === 'info',
      'bg-success hover:bg-success/70 text-success-content shadow-success': variant === 'success',
      'bg-warning hover:bg-warning/70 text-warning-content shadow-warning': variant === 'warning',
      'bg-info hover:bg-info/70 text-info-content shadow-info': variant === 'neutral',
      'bg-error hover:bg-error/70 text-error-content shadow-error': variant === 'error',
    },
    className,
  );

  const metricValue = (metric: string | number, currency?: boolean) => {
    if (typeof metric === 'string') {
      return metric;
    }
    if (currency) {
      const rounded = Math.round(metric * 100) / 100;
      const formatted = rounded.toLocaleString('en-US', {
        currency: 'USD',
      });
      return `$${formatted}`;
    }
    return metric.toLocaleString();
  };

  return (
    <div className={cardClass}>
      <div className="p-4">
        <div className="flex justify-between flex-start mb-2">
          <h4 className="uppercase text-lg font-thin">{title}</h4>
          {icon && <div className="opacity-70 text-muted">{icon}</div>}
        </div>
        {loading && (
          <div className="w-fit mx-auto">
            <span className="loading loading-dots loading-xl"></span>
          </div>
        )}
        {!loading && <div className="text-6xl mx-auto ml-16 font-bold">{metricValue(metric, currency)}</div>}

        {subtitle && <div className="text-sm ml-auto w-fit max-w-full">{subtitle}</div>}
      </div>

      {actionLabel && onActionClick && (
        <div className="px-4 pb-2">
          {!loading && (
            <button onClick={onActionClick} className="btn btn-sm btn-outline btn-neutral" disabled={loading}>
              {actionLabel}
            </button>
          )}
          {loading && <span className="mt-6 ml-4 loading loading-dots loading-md"></span>}
        </div>
      )}
    </div>
  );
}
