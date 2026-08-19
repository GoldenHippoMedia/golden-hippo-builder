import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { offerFlowStore } from './offer-flow.store';
import { offerTemplateStore } from './offer-template.store';
import { offerStore } from './offer.store';
import { productStore } from '../product-config/product-data.store';
import OfferFlowList from './components/offer-flow-list';
import OfferFlowEditor from './components/offer-flow-editor';
import ProductPicker from './components/product-picker';
import FlowSimulator from './components/flow-simulator';

interface OfferConfigPageProps {
  context: ExtendedApplicationContext;
}

const SUBTITLE = 'Post-checkout offer flows — the sequence of offers a customer walks through after checkout';

/** True when any of the flow's targeting conditions references the given product entry. */
const flowTargetsProduct = (flow: BuilderOfferFlowContent, productId: string): boolean =>
  (flow.data?.conditions ?? []).some((condition) =>
    (condition.products ?? []).some((p: any) => (p?.product?.value?.id ?? p?.product?.id) === productId),
  );

const OfferConfigPage: React.FC<OfferConfigPageProps> = observer(({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  // View state stays local; the flow data lives in the shared store so it survives tab switches.
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [productFilter, setProductFilter] = useState<string>('');

  useEffect(() => {
    void offerFlowStore.ensureLoaded(api);
    // Loaded so the list can resolve targeting references to product names, each
    // step's template reference to its offer count, and each step's offers to names.
    void productStore.ensureLoaded(api);
    void offerTemplateStore.ensureLoaded(api);
    void offerStore.ensureLoaded(context);
  }, [api, context]);

  const createFlow = useCallback(
    async (name: string, conditions: NonNullable<BuilderOfferFlowContent['data']>['conditions'] = []) => {
      setCreating(true);
      offerFlowStore.setError(null);
      try {
        const created = await api.createOfferFlow(name, conditions);
        offerFlowStore.prepend(created as BuilderOfferFlowContent);
        if (created.id) setActiveFlowId(created.id);
      } catch (e) {
        offerFlowStore.setError(e instanceof Error ? e.message : String(e));
      } finally {
        setCreating(false);
      }
    },
    [api],
  );
  const handleCreate = useCallback(() => createFlow('New Offer Flow'), [createFlow]);

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
    return (
      <OfferFlowEditor key={activeFlow.id} context={context} flow={activeFlow} onBack={() => setActiveFlowId(null)} />
    );
  }

  const actions = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => offerFlowStore.refresh(api)}
        disabled={refreshing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium cursor-pointer text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] disabled:cursor-not-allowed disabled:opacity-40"
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
        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold cursor-pointer text-[#1a1300] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        title="Create a new offer flow"
      >
        {creating ? 'Creating...' : '+ New flow'}
      </button>
    </div>
  );

  const total = flows.length;
  const filteredFlows = productFilter ? flows.filter((flow) => flowTargetsProduct(flow, productFilter)) : flows;

  return (
    <div>
      <PageHeader
        title="Offer Config"
        subtitle={
          productFilter ? `${filteredFlows.length} of ${total} flows` : `${total} flow${total === 1 ? '' : 's'}`
        }
        actions={actions}
      />
      {error && (
        <div className="mb-4 break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}
      {total > 0 && (
        <FlowSimulator
          flows={flows}
          products={productStore.items}
          productsLoading={productStore.loading}
          productsError={productStore.error}
          onOpenFlow={setActiveFlowId}
          onCreateFromCart={createFlow}
        />
      )}
      {total > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="shrink-0 text-xs font-medium text-[var(--text-secondary)]">Filter by product</span>
          <div className="w-72">
            <ProductPicker
              products={productStore.items}
              valueId={productFilter}
              onSelect={setProductFilter}
              loading={productStore.loading}
              error={productStore.error}
            />
          </div>
        </div>
      )}
      {productFilter && filteredFlows.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
          No flows target this product.{' '}
          <button
            type="button"
            onClick={() => setProductFilter('')}
            className="cursor-pointer font-semibold text-[var(--accent)] hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <OfferFlowList
          flows={filteredFlows}
          products={productStore.items}
          templates={offerTemplateStore.items}
          offers={offerStore.offers}
          onSelect={setActiveFlowId}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
});

OfferConfigPage.displayName = 'OfferConfigPage';

export default OfferConfigPage;
