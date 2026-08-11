import React from 'react';
import { EmptyState, StatusBadge } from '@goldenhippo/builder-ui';
import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';

interface OfferFlowListProps {
  flows: BuilderOfferFlowContent[];
  onSelect: (id: string) => void;
  onCreate: () => void;
}

const stepCount = (flow: BuilderOfferFlowContent): number => flow.data?.steps?.length ?? 0;
const conditionCount = (flow: BuilderOfferFlowContent): number => flow.data?.conditions?.length ?? 0;

// Default flows first (the brand-wide fallback), then highest priority, then name.
const byListOrder = (a: BuilderOfferFlowContent, b: BuilderOfferFlowContent): number =>
  Number(b.data?.isDefault ?? false) - Number(a.data?.isDefault ?? false) ||
  (b.data?.priority ?? 0) - (a.data?.priority ?? 0) ||
  (a.data?.name ?? '').localeCompare(b.data?.name ?? '');

const OfferFlowList: React.FC<OfferFlowListProps> = ({ flows, onSelect, onCreate }) => {
  if (flows.length === 0) {
    return (
      <EmptyState
        message="No offer flows yet. Create one to start building a post-checkout offer sequence."
        action={{ label: '+ New flow', onClick: onCreate }}
      />
    );
  }

  const sorted = [...flows].sort(byListOrder);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((flow) => {
        const isActive = flow.data?.active !== false;
        const isDefault = flow.data?.isDefault === true;
        const steps = stepCount(flow);
        const conditions = conditionCount(flow);
        return (
          <button
            key={flow.id}
            onClick={() => flow.id && onSelect(flow.id)}
            className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 py-3 text-left transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--bg-glass-hover)]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {flow.data?.name || 'Untitled flow'}
                </span>
                {isDefault && (
                  <span className="rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    Default
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                <span>
                  {steps} step{steps === 1 ? '' : 's'}
                </span>
                <span>Priority {flow.data?.priority ?? 0}</span>
                <span>
                  {conditions === 0 ? 'No conditions' : `${conditions} condition${conditions === 1 ? '' : 's'}`}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={isActive ? 'active' : 'neutral'} label={isActive ? 'Active' : 'Inactive'} />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-secondary)]"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default OfferFlowList;
