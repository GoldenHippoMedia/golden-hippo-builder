import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import OfferFlowList from './components/offer-flow-list';
import OfferFlowEditor from './components/offer-flow-editor';

interface OfferConfigPageProps {
  context: ExtendedApplicationContext;
}

const SUBTITLE = 'Post-checkout offer flows — the sequence of offers a customer walks through after checkout';

const OfferConfigPage: React.FC<OfferConfigPageProps> = ({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flows, setFlows] = useState<BuilderOfferFlowContent[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(
    async (initial: boolean) => {
      if (initial) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const results = await api.getOfferFlows();
        if (!mounted.current) return;
        setFlows(results);
      } catch (e) {
        if (!mounted.current) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted.current) {
          if (initial) setLoading(false);
          else setRefreshing(false);
        }
      }
    },
    [api],
  );

  useEffect(() => {
    void load(true);
  }, [load]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await api.createOfferFlow('New Offer Flow');
      if (!mounted.current) return;
      // Show it immediately — the CDN list is eventually consistent, so we can't rely
      // on an immediate refetch surfacing the fresh draft.
      setFlows((prev) => [created as BuilderOfferFlowContent, ...prev]);
      if (created.id) setActiveFlowId(created.id);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (mounted.current) setCreating(false);
    }
  }, [api]);

  const activeFlow = flows.find((f) => f.id === activeFlowId) ?? null;

  if (loading) {
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

  if (activeFlow) {
    return <OfferFlowEditor flow={activeFlow} onBack={() => setActiveFlowId(null)} />;
  }

  const actions = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => load(false)}
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
};

export default OfferConfigPage;
