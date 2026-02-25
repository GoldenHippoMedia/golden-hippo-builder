import React, { useState, useMemo, useCallback } from 'react';
import { BuilderFunnelContent, BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-schemas';
import { PageHeader, Section, FormField, EmptyState, StatusBadge, LoadingSection } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import FunnelDetailPage from './funnel-detail.page';

const PAGE_TYPE_SHORT: Record<string, string> = {
  landing: 'lp',
  survey: 'svy',
  vsl: 'vsl',
  coupon: 'cpn',
  'offer-selector': 'os',
};

const buildPageUrl = (stepNumber: number, pageType: string, gep: string, funnelId: string): string => {
  const id = gep.trim() || funnelId || '';
  const typeShort = PAGE_TYPE_SHORT[pageType] ?? pageType;
  return `/${id}/${typeShort}/${stepNumber}`;
};

const buildUrlQuery = (url: string) => [{ property: 'urlPath', operator: 'is', value: url }];

type CreateMode = 'variant' | 'scratch';

interface FunnelsPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

const FunnelsPage: React.FC<FunnelsPageProps> = ({ data, context, onRefresh }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOfferId, setFilterOfferId] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('variant');

  // Variant mode state
  const [variantOfferId, setVariantOfferId] = useState('');
  const [variantSourceId, setVariantSourceId] = useState('');
  const [variantName, setVariantName] = useState('');

  // Scratch mode state
  const [scratchName, setScratchName] = useState('');
  const [scratchOfferId, setScratchOfferId] = useState('');
  const [scratchIsControl, setScratchIsControl] = useState(false);

  const [creating, setCreating] = useState(false);

  // --- ALL hooks must be above the early return to satisfy Rules of Hooks ---

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return data.funnels.find((f) => f.id === selectedId) ?? null;
  }, [data.funnels, selectedId]);

  const variantFunnels = useMemo(() => {
    if (!variantOfferId) return [];
    return data.funnels.filter((f) => f.data?.offer?.id === variantOfferId);
  }, [data.funnels, variantOfferId]);

  const sourceFunnel = useMemo(() => {
    if (!variantSourceId) return null;
    return data.funnels.find((f) => f.id === variantSourceId) ?? null;
  }, [data.funnels, variantSourceId]);

  const navigateAfterCreate = useCallback(
    async (newId: string | null) => {
      await onRefresh();
      setTimeout(() => {
        setCreating(false);
        setSelectedId(newId);
      }, 0);
    },
    [onRefresh],
  );

  // --- Early return for detail view (after all hooks) ---

  if (selectedItem) {
    return (
      <ErrorBoundary onBack={() => setSelectedId(null)}>
        <FunnelDetailPage
          item={selectedItem}
          data={data}
          context={context}
          onBack={() => setSelectedId(null)}
          onRefresh={onRefresh}
        />
      </ErrorBoundary>
    );
  }

  // --- List view helpers (plain functions, not hooks) ---

  const filteredFunnels =
    filterOfferId === 'all' ? data.funnels : data.funnels.filter((f) => f.data?.offer?.id === filterOfferId);

  const getOfferName = (funnel: BuilderFunnelContent) => {
    const offerId = funnel.data?.offer?.id;
    if (!offerId) return 'Unknown';
    const offer = data.offers.find((o) => o.id === offerId);
    return offer?.data?.displayName ?? offer?.data?.name ?? 'Unknown';
  };

  const getStepCount = (funnel: BuilderFunnelContent) => funnel.data?.steps?.length ?? 0;

  const handleVariantOfferChange = (offerId: string) => {
    setVariantOfferId(offerId);
    const funnelsForOffer = data.funnels.filter((f) => f.data?.offer?.id === offerId);
    const control = funnelsForOffer.find((f) => f.data?.isControl);
    setVariantSourceId(control?.id ?? (funnelsForOffer[0]?.id ?? ''));
    setVariantName('');
  };

  const handleVariantSourceChange = (sourceId: string) => {
    setVariantSourceId(sourceId);
    setVariantName('');
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setCreateMode('variant');
    setVariantOfferId('');
    setVariantSourceId('');
    setVariantName('');
    setScratchName('');
    setScratchOfferId('');
    setScratchIsControl(false);
  };

  const handleCreateVariant = async () => {
    if (!variantName.trim() || !variantOfferId || !variantSourceId || !sourceFunnel) return;
    try {
      setCreating(true);
      const api = new BuilderApi(context);
      const sd = sourceFunnel.data;

      const copiedPricing = (sd?.pricing ?? []).map((t) => ({
        quantity: t.quantity ?? 1,
        label: t.label || undefined,
        isMostPopular: t.isMostPopular || undefined,
        standardPrice: t.standardPrice ?? 0,
        subscriptionAvailable: t.subscriptionAvailable,
        subscriptionPrice: t.subscriptionPrice || undefined,
        subscriptionFrequency: t.subscriptionFrequency || undefined,
        checkoutFeatures: t.checkoutFeatures?.tryBeforeYouBuy?.enabled
          ? { tryBeforeYouBuy: { enabled: true, upfrontCost: t.checkoutFeatures.tryBeforeYouBuy.upfrontCost ?? 0 } }
          : undefined,
      }));

      // Step 1: Create funnel entry (no steps yet — pages need the funnel ID)
      const newFunnel = await api.createContent('funnel', variantName.trim(), {
        name: variantName.trim(),
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: variantOfferId },
        isControl: false,
        status: 'draft',
        pricing: copiedPricing,
        steps: [],
      });
      const funnelId = newFunnel.id!;
      const funnelRef = { '@type': '@builder.io/core:Reference', model: 'funnel', id: funnelId };

      // Step 2: Copy pages for each step with funnel reference + naming + URL
      const copiedSteps = [];
      let overallStepNum = 0;
      let userStepIndex = 0;
      for (const step of sd?.steps ?? []) {
        overallStepNum++;
        const isOS = step.stepType === 'offer-selector';
        if (!isOS) userStepIndex++;
        let newPageId = '';
        if (step.page?.id) {
          const sourcePage = await api.getFullContent<BuilderFunnelPageContent>('funnel-page', step.page.id, false);
          if (sourcePage) {
            const pd = sourcePage.data;
            const pageName = isOS
              ? `${variantName.trim()} - OS - ${funnelId}`
              : `${variantName.trim()} - Step ${userStepIndex} - ${funnelId}`;
            const pageType = pd?.pageType ?? step.stepType;
            const pageUrl = buildPageUrl(overallStepNum, pageType, '', funnelId);
            const newPage = await api.createContent('funnel-page', pageName, {
              title: pageName,
              pageType,
              funnel: funnelRef,
              seo: pd?.seo,
              robotsMeta: pd?.robotsMeta,
              blocks: (pd as any)?.blocks,
            }, pageUrl);
            newPageId = newPage.id ?? '';
          }
        }
        copiedSteps.push({
          stepType: step.stepType,
          page: newPageId ? { '@type': '@builder.io/core:Reference', model: 'funnel-page', id: newPageId } : undefined,
        });
      }

      // Ensure offer-selector exists as the last step
      if (!copiedSteps.some((s) => s.stepType === 'offer-selector')) {
        overallStepNum++;
        const osPageName = `${variantName.trim()} - OS - ${funnelId}`;
        const osUrl = buildPageUrl(overallStepNum, 'offer-selector', '', funnelId);
        const osPage = await api.createContent('funnel-page', osPageName, {
          title: osPageName,
          pageType: 'offer-selector',
          funnel: funnelRef,
        }, osUrl);
        copiedSteps.push({
          stepType: 'offer-selector',
          page: { '@type': '@builder.io/core:Reference', model: 'funnel-page', id: osPage.id },
        });
      }

      // Step 3: Update funnel with step references
      await api.updateContent('funnel', funnelId, {
        name: variantName.trim(),
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: variantOfferId },
        isControl: false,
        status: 'draft',
        pricing: copiedPricing,
        steps: copiedSteps,
      });

      resetForm();
      await navigateAfterCreate(funnelId);
    } catch (err) {
      console.error('[Hippo Funnels] Error creating variant', err);
      setCreating(false);
      await context.dialogs.alert('Failed to create variant. Please try again.');
    }
  };

  const handleCreateScratch = async () => {
    if (!scratchName.trim() || !scratchOfferId) return;
    try {
      setCreating(true);
      const api = new BuilderApi(context);

      // Step 1: Create funnel entry (no steps yet — pages need the funnel ID)
      const newFunnel = await api.createContent('funnel', scratchName.trim(), {
        name: scratchName.trim(),
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: scratchOfferId },
        isControl: scratchIsControl,
        status: 'draft',
        steps: [],
      });
      const funnelId = newFunnel.id!;
      const funnelRef = { '@type': '@builder.io/core:Reference', model: 'funnel', id: funnelId };

      // Step 2: Create the required offer-selector page with funnel reference + naming + URL
      const osPageName = `${scratchName.trim()} - OS - ${funnelId}`;
      const osUrl = buildPageUrl(1, 'offer-selector', '', funnelId);
      const osPage = await api.createContent('funnel-page', osPageName, {
        title: osPageName,
        pageType: 'offer-selector',
        funnel: funnelRef,
      }, osUrl);

      // Step 3: Update funnel with step references
      await api.updateContent('funnel', funnelId, {
        name: scratchName.trim(),
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: scratchOfferId },
        isControl: scratchIsControl,
        status: 'draft',
        steps: [
          {
            stepType: 'offer-selector',
            page: { '@type': '@builder.io/core:Reference', model: 'funnel-page', id: osPage.id },
          },
        ],
      });

      resetForm();
      await navigateAfterCreate(funnelId);
    } catch (err) {
      console.error('[Hippo Funnels] Error creating funnel', err);
      setCreating(false);
      await context.dialogs.alert('Failed to create funnel. Please try again.');
    }
  };

  const variantValid = variantName.trim() && variantOfferId && variantSourceId;
  const scratchValid = scratchName.trim() && scratchOfferId;
  const hasFunnelsToCopy = data.funnels.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Funnels"
        actions={
          <>
            <select
              className="select select-bordered"
              value={filterOfferId}
              onChange={(e) => setFilterOfferId(e.target.value)}
            >
              <option value="all">All Offers</option>
              {data.offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.data?.displayName ?? offer.data?.name ?? 'Untitled'}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost" onClick={onRefresh}>
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={data.offers.length === 0}
              title={data.offers.length === 0 ? 'Create an offer first' : undefined}
            >
              + New Funnel
            </button>
          </>
        }
      />

      {showCreateForm && (
        <Section className="mb-6">
          <div className="flex gap-2 mb-6">
            <button
              className={`btn btn-sm ${createMode === 'variant' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCreateMode('variant')}
            >
              Create Variant
            </button>
            <button
              className={`btn btn-sm ${createMode === 'scratch' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCreateMode('scratch')}
            >
              Create from Scratch
            </button>
          </div>

          {createMode === 'variant' ? (
            <>
              <p className="text-sm text-base-content/60 mb-4">
                Copy an existing funnel (pricing, steps, pages, and settings) as a starting point for a new variant.
              </p>
              {!hasFunnelsToCopy ? (
                <p className="text-base-content/50 text-sm">
                  No funnels exist yet. Use &quot;Create from Scratch&quot; to create your first funnel.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Offer" required>
                      <select
                        className="select select-bordered w-full"
                        value={variantOfferId}
                        onChange={(e) => handleVariantOfferChange(e.target.value)}
                      >
                        <option value="">Select an offer...</option>
                        {data.offers.map((offer) => (
                          <option key={offer.id} value={offer.id}>
                            {offer.data?.displayName ?? offer.data?.name ?? 'Untitled'}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Copy From" required helper={sourceFunnel?.data?.isControl ? 'Control funnel (recommended)' : undefined}>
                      <select
                        className="select select-bordered w-full"
                        value={variantSourceId}
                        onChange={(e) => handleVariantSourceChange(e.target.value)}
                        disabled={!variantOfferId}
                      >
                        <option value="">{variantOfferId ? (variantFunnels.length === 0 ? 'No funnels for this offer' : 'Select a funnel...') : 'Select an offer first'}</option>
                        {variantFunnels.map((funnel) => (
                          <option key={funnel.id} value={funnel.id}>
                            {funnel.data?.name ?? 'Untitled'}
                            {funnel.data?.isControl ? ' (Control)' : ''}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Variant Name" required>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder={sourceFunnel ? `e.g., "${sourceFunnel.data?.name} — v2"` : 'e.g., "VSL Variant"'}
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                      />
                    </FormField>
                  </div>
                  {sourceFunnel && (
                    <div className="mt-4 text-xs text-base-content/50">
                      Copies {sourceFunnel.data?.pricing?.length ?? 0} pricing tier(s) and {sourceFunnel.data?.steps?.length ?? 0} step(s) with pages from &quot;{sourceFunnel.data?.name}&quot;
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={!variantValid || creating}
                  onClick={handleCreateVariant}
                >
                  {creating ? 'Creating...' : 'Create Variant'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-base-content/60 mb-4">
                Create a new funnel from scratch. Use this for your first funnel on an offer (typically the control).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Funnel Name" required>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder='e.g., "Control", "Pricing Test v2"'
                    value={scratchName}
                    onChange={(e) => setScratchName(e.target.value)}
                  />
                </FormField>
                <FormField label="Offer" required>
                  <select
                    className="select select-bordered w-full"
                    value={scratchOfferId}
                    onChange={(e) => setScratchOfferId(e.target.value)}
                  >
                    <option value="">Select an offer...</option>
                    {data.offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.data?.displayName ?? offer.data?.name ?? 'Untitled'}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={!scratchValid || creating}
                  onClick={handleCreateScratch}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </>
          )}
        </Section>
      )}

      {creating && !showCreateForm ? (
        <LoadingSection message="Creating funnel..." />
      ) : filteredFunnels.length === 0 && !showCreateForm ? (
        <EmptyState
          message={
            filterOfferId === 'all'
              ? data.offers.length === 0
                ? 'Create an offer first, then add funnels.'
                : 'No funnels yet. Create your first funnel to get started.'
              : 'No funnels for this offer.'
          }
          action={
            data.offers.length > 0
              ? { label: '+ Create First Funnel', onClick: () => setShowCreateForm(true) }
              : undefined
          }
        />
      ) : !showCreateForm ? (
        <Section>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Offer</th>
                  <th>Status</th>
                  <th>Steps</th>
                  <th>Pricing Tiers</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunnels.map((funnel) => (
                  <tr
                    key={funnel.id}
                    className="hover:bg-base-300/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(funnel.id ?? null)}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{funnel.data?.name ?? 'Untitled'}</span>
                        {funnel.data?.isControl && <span className="badge badge-primary badge-xs">Control</span>}
                      </div>
                    </td>
                    <td className="text-base-content/70">{getOfferName(funnel)}</td>
                    <td>
                      <StatusBadge status={funnel.data?.status ?? 'draft'} />
                    </td>
                    <td>{getStepCount(funnel)}</td>
                    <td>{funnel.data?.pricing?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { onBack: () => void; children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Hippo Funnels] Funnel detail page crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h2 className="text-xl font-bold text-error mb-2">Failed to load funnel</h2>
          <p className="text-base-content/60 mb-1 text-sm">
            {this.state.error.message}
          </p>
          <pre className="text-xs text-base-content/40 mb-4 max-h-32 overflow-auto bg-base-300 rounded p-3 text-left">
            {this.state.error.stack}
          </pre>
          <button className="btn btn-primary" onClick={this.props.onBack}>
            Back to Funnels
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default FunnelsPage;
