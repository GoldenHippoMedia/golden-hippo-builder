import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { offerFlowStore } from './offer-flow.store';
import OfferFlowList from './components/offer-flow-list';
import OfferFlowEditor from './components/offer-flow-editor';

interface OfferConfigPageProps {
  context: ExtendedApplicationContext;
}

const SUBTITLE = 'Post-checkout offer flows — the sequence of offers a customer walks through after checkout';

const OfferConfigPage: React.FC<OfferConfigPageProps> = observer(({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  // View state stays local; the flow data lives in the shared store so it survives tab switches.
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void offerFlowStore.ensureLoaded(api);
  }, [api]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    offerFlowStore.setError(null);
    try {
      const created = await api.createOfferFlow('New Offer Flow');
      offerFlowStore.prepend(created as BuilderOfferFlowContent);
      if (created.id) setActiveFlowId(created.id);
    } catch (e) {
      offerFlowStore.setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }, [api]);

  const { items: flows, loading, refreshing, error } = offerFlowStore;

  if (loading && flows.length === 0) {
    return (
      <div>
        <PageHeader title="Offer Config" subtitle={SUBTITLE} />
        <LoadingSection />
      </div>
    );
  }

  if (error && flows.length === 0) {
    return (
      <div>
        <PageHeader title="Offer Config" subtitle={SUBTITLE} />
        <Section title="Failed to load offer flows" variant="danger">
          <div className="break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error}</div>
        </Section>
      </div>
    );
  }

  const activeFlow = offerFlowStore.getById(activeFlowId);
  if (activeFlow) {
    return <OfferFlowEditor flow={activeFlow} onBack={() => setActiveFlowId(null)} />;
  }

  const actions = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => offerFlowStore.refresh(api)}
        disabled={refreshing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        title="Re-fetch offer flows from Builder.io (cache-busted)"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={refreshing ? 'animate-spin' : ''}
        >
          <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
          <path d="M21 21v-5h-5" />
        </svg>
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      <button
        onClick={handleCreate}
        disabled={creating}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#1a1300] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        title="Create a new offer flow"
      >
        {creating ? 'Creating...' : '+ New flow'}
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Offer Config"
        subtitle={`${flows.length} flow${flows.length === 1 ? '' : 's'}`}
        actions={actions}
      />
      {error && (
        <div className="mb-4 break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}
      <OfferFlowList flows={flows} onSelect={setActiveFlowId} onCreate={handleCreate} />
    </div>
  );
});

OfferConfigPage.displayName = 'OfferConfigPage';

export default OfferConfigPage;
