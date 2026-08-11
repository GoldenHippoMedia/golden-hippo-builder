import React from 'react';
import { DetailHeader, type DetailHeaderBadge, Section } from '@goldenhippo/builder-ui';
import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';

interface OfferFlowEditorProps {
  flow: BuilderOfferFlowContent;
  onBack: () => void;
}

const Fact: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-2.5">
    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
    <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
  </div>
);

// Read-only overview only — the settings bar, step sequence, and targeting editors land in the
// next slices. This shell exists so flow selection and navigation are wired end-to-end now.
const OfferFlowEditor: React.FC<OfferFlowEditorProps> = ({ flow, onBack }) => {
  const data = flow.data;
  const isActive = data?.active !== false;
  const steps = data?.steps?.length ?? 0;
  const conditions = data?.conditions?.length ?? 0;

  const badges: DetailHeaderBadge[] = [
    { label: isActive ? 'Active' : 'Inactive', variant: isActive ? 'success' : 'ghost' },
  ];
  if (data?.isDefault) badges.push({ label: 'Default', variant: 'primary' });

  return (
    <div>
      <DetailHeader title={data?.name || 'Untitled flow'} onBack={onBack} backLabel="All flows" badges={badges} />

      <Section title="Overview">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Fact label="Priority" value={data?.priority ?? 0} />
          <Fact label="Step target" value={data?.stepTarget ?? 'All surviving'} />
          <Fact label="Steps" value={steps} />
          <Fact label="Conditions" value={conditions === 0 ? 'None (default)' : conditions} />
          <Fact label="Exclude subscribed" value={data?.excludeSubscribedProducts ? 'Yes' : 'No'} />
          <Fact
            label="Exclude previously purchased"
            value={data?.excludePreviouslyPurchased ? `Yes · ${data?.previousPurchaseLookback ?? '3 months'}` : 'No'}
          />
        </div>
      </Section>

      <Section title="Flow editor">
        <p className="text-sm text-[var(--text-secondary)]">
          The settings bar, step sequence, and targeting editors are coming next. For now this confirms the flow loads
          and navigation works end-to-end.
        </p>
      </Section>
    </div>
  );
};

export default OfferFlowEditor;
