import React, { useState, useMemo, useCallback } from 'react';
import {
  BuilderFunnelContent,
  FunnelStepType,
  SUBSCRIPTION_FREQUENCIES,
  FREQUENCY_LABELS,
  SubscriptionFrequency,
} from '@goldenhippo/builder-funnel-schemas';
import { DetailHeader, Section, FormField } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';

interface FunnelDetailProps {
  item: BuilderFunnelContent;
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

interface StepForm {
  stepType: FunnelStepType;
  pageId: string;
}

interface PricingTierForm {
  quantity: number;
  label: string;
  isMostPopular: boolean;
  standardPrice: number;
  subscriptionAvailable: boolean;
  subscriptionPrice: number;
  subscriptionFrequency: SubscriptionFrequency;
  checkoutFeatures: {
    tryBeforeYouBuy: { enabled: boolean; upfrontCost: number };
  };
}

const emptyPricingTier = (): PricingTierForm => ({
  quantity: 1,
  label: '',
  isMostPopular: false,
  standardPrice: 0,
  subscriptionAvailable: true,
  subscriptionPrice: 0,
  subscriptionFrequency: 'Monthly',
  checkoutFeatures: {
    tryBeforeYouBuy: { enabled: false, upfrontCost: 0 },
  },
});

const parsePricingTier = (t: any): PricingTierForm => ({
  quantity: t.quantity ?? 1,
  label: t.label ?? '',
  isMostPopular: t.isMostPopular ?? false,
  standardPrice: t.standardPrice ?? 0,
  subscriptionAvailable: t.subscriptionAvailable ?? true,
  subscriptionPrice: t.subscriptionPrice ?? 0,
  subscriptionFrequency: t.subscriptionFrequency ?? 'Monthly',
  checkoutFeatures: {
    tryBeforeYouBuy: {
      enabled: t.checkoutFeatures?.tryBeforeYouBuy?.enabled ?? false,
      upfrontCost: t.checkoutFeatures?.tryBeforeYouBuy?.upfrontCost ?? 0,
    },
  },
});

const STEP_TYPES: FunnelStepType[] = ['landing', 'survey', 'vsl', 'coupon'];

const buildPageName = (step: number | 'os', funnelName: string, gep: string, funnelId: string): string => {
  const n = funnelName.trim() || 'Funnel';
  const s = step === 'os' ? 'OS' : `Step ${step}`;
  const id = gep.trim() || funnelId || '';
  return `${n} - ${s} - ${id}`;
};

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

const FunnelDetailPage: React.FC<FunnelDetailProps> = ({ item, data, context, onBack, onRefresh }) => {
  const d = item.data;
  const [name, setName] = useState<string>(d?.name ?? '');
  const [offerId, setOfferId] = useState<string>(d?.offer?.id ?? '');
  const [isControl, setIsControl] = useState<boolean>(d?.isControl ?? false);
  const [status, setStatus] = useState<string>(d?.status ?? 'draft');
  const [ghSlug, setGhSlug] = useState<string>(d?.gh?.slug ?? '');

  // User-configurable steps (everything except offer-selector)
  const [userSteps, setUserSteps] = useState<StepForm[]>(() => {
    return (d?.steps ?? [])
      .filter((s) => s.stepType !== 'offer-selector')
      .map((s) => ({
        stepType: s.stepType ?? 'landing',
        pageId: s.page?.id ?? '',
      }));
  });

  // The offer-selector page (always last step, always required)
  const [offerSelectorPageId, setOfferSelectorPageId] = useState<string>(() => {
    const os = (d?.steps ?? []).find((s) => s.stepType === 'offer-selector');
    return os?.page?.id ?? '';
  });

  const [addingStep, setAddingStep] = useState(false);
  const [stepBusy, setStepBusy] = useState(false);
  const [pricing, setPricing] = useState<PricingTierForm[]>((d?.pricing ?? []).map(parsePricingTier));
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const offerName = useMemo(() => {
    const offer = data.offers.find((o) => o.id === offerId);
    return offer?.data?.displayName ?? offer?.data?.name ?? '';
  }, [data.offers, offerId]);

  // Use persisted status for editability — local status changes don't unlock/lock until saved & refreshed
  const persistedStatus = d?.status ?? 'draft';
  const isDraft = persistedStatus === 'draft';
  const isActive = persistedStatus === 'active';

  // Lock funnel when it's referenced by any active destination
  const activeDestinations = useMemo(
    () => data.destinations.filter((d) => d.data?.primaryFunnel?.id === item.id && d.data?.status === 'active'),
    [data.destinations, item.id],
  );
  const isLocked = activeDestinations.length > 0;

  const addStep = async () => {
    try {
      setAddingStep(true);
      const api = new BuilderApi(context);
      const stepNumber = userSteps.length + 1;
      const pageName = buildPageName(stepNumber, name, ghSlug, item.id ?? '');
      const pageUrl = buildPageUrl(stepNumber, 'landing', ghSlug, item.id ?? '');
      const newPage = await api.createContent('funnel-page', pageName, {
        title: pageName,
        pageType: 'landing',
        funnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: item.id },
      }, pageUrl);
      // Update offer-selector page URL (its step number shifted)
      if (offerSelectorPageId) {
        const osUrl = buildPageUrl(stepNumber + 1, 'offer-selector', ghSlug, item.id ?? '');
        api.patchContent('funnel-page', offerSelectorPageId, {
          query: buildUrlQuery(osUrl),
        }).catch((err) => console.error('[Hippo Funnels] Error updating OS page URL', err));
      }
      await onRefresh();
      setUserSteps((prev) => [...prev, { stepType: 'landing' as FunnelStepType, pageId: newPage.id ?? '' }]);
    } catch (err) {
      console.error('[Hippo Funnels] Error creating page for step', err);
      await context.dialogs.alert('Failed to create page for step. Please try again.');
    } finally {
      setAddingStep(false);
    }
  };
  const removeStep = async (index: number) => {
    const step = userSteps[index];
    const stepLabel = `Step ${index + 1} (${step.stepType})`;
    const hasPage = !!step.pageId;

    try {
      const text = hasPage
        ? `This will remove "${stepLabel}" and archive its linked page.\n\nType "REMOVE" to confirm.`
        : `Type "REMOVE" to confirm removing "${stepLabel}".`;
      const result = await context.dialogs.prompt({
        title: 'Remove Step',
        text,
        confirmText: 'Remove',
        cancelText: 'Cancel',
      });
      if (result !== 'REMOVE') return;
    } catch {
      return;
    }

    setStepBusy(true);
    try {
      const api = new BuilderApi(context);

      // Archive the linked page instead of deleting it
      if (hasPage) {
        await api.patchContent('funnel-page', step.pageId, { published: 'archived' });
      }

      // Remove step from local state
      const remaining = userSteps.filter((_, i) => i !== index);
      setUserSteps(remaining);

      // Rename subsequent pages and update URLs to fix step numbering
      const renamePromises: Promise<void>[] = [];
      for (let i = index; i < remaining.length; i++) {
        if (remaining[i].pageId) {
          const newName = buildPageName(i + 1, name, ghSlug, item.id ?? '');
          const newUrl = buildPageUrl(i + 1, remaining[i].stepType, ghSlug, item.id ?? '');
          renamePromises.push(api.patchContent('funnel-page', remaining[i].pageId, { name: newName, query: buildUrlQuery(newUrl) }));
        }
      }
      // Update offer-selector page URL (its step number shifted)
      if (offerSelectorPageId) {
        const osUrl = buildPageUrl(remaining.length + 1, 'offer-selector', ghSlug, item.id ?? '');
        renamePromises.push(
          api.patchContent('funnel-page', offerSelectorPageId, { query: buildUrlQuery(osUrl) }),
        );
      }
      if (renamePromises.length > 0) {
        await Promise.all(renamePromises);
      }

      await onRefresh();
    } catch (err) {
      console.error('[Hippo Funnels] Error removing step', err);
    } finally {
      setStepBusy(false);
    }
  };
  const updateStep = (index: number, field: keyof StepForm, value: string | FunnelStepType) => {
    setUserSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    // Sync pageType and URL to linked page when step type changes
    if (field === 'stepType') {
      const step = userSteps[index];
      if (step?.pageId) {
        const api = new BuilderApi(context);
        const newUrl = buildPageUrl(index + 1, value as string, ghSlug, item.id ?? '');
        api.mergeContentData('funnel-page', step.pageId, {
          pageType: value,
        }, { query: buildUrlQuery(newUrl) }).catch((err) => {
          console.error('[Hippo Funnels] Error syncing pageType to page', err);
        });
      }
    }
  };
  const moveStep = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= userSteps.length) return;

    // Capture steps being swapped before state update
    const movingStep = userSteps[index];
    const displacedStep = userSteps[newIndex];

    // Optimistic local update
    setUserSteps((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });

    // Rename affected pages in the background
    const api = new BuilderApi(context);
    const renamePromises = [];
    if (movingStep.pageId) {
      const stepNum = newIndex + 1;
      const newUrl = buildPageUrl(stepNum, movingStep.stepType, ghSlug, item.id ?? '');
      renamePromises.push(
        api.patchContent('funnel-page', movingStep.pageId, {
          name: buildPageName(stepNum, name, ghSlug, item.id ?? ''),
          query: buildUrlQuery(newUrl),
        }),
      );
    }
    if (displacedStep.pageId) {
      const stepNum = index + 1;
      const newUrl = buildPageUrl(stepNum, displacedStep.stepType, ghSlug, item.id ?? '');
      renamePromises.push(
        api.patchContent('funnel-page', displacedStep.pageId, {
          name: buildPageName(stepNum, name, ghSlug, item.id ?? ''),
          query: buildUrlQuery(newUrl),
        }),
      );
    }
    if (renamePromises.length > 0) {
      setStepBusy(true);
      try {
        await Promise.all(renamePromises);
        await onRefresh();
      } catch (err) {
        console.error('[Hippo Funnels] Error renaming pages after reorder', err);
      } finally {
        setStepBusy(false);
      }
    }
  };

  const addPricingTier = () => setPricing((prev) => [...prev, emptyPricingTier()]);
  const removePricingTier = (index: number) => {
    setPricing((prev) => prev.filter((_, i) => i !== index));
    if (expandedTier === index) setExpandedTier(null);
  };
  const updatePricingField = (index: number, field: string, value: any) => {
    setPricing((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const copy = { ...t };
        if (field.startsWith('checkoutFeatures.')) {
          const path = field.replace('checkoutFeatures.', '').split('.');
          const cfCopy = { ...copy.checkoutFeatures };
          if (path[0] === 'tryBeforeYouBuy') {
            cfCopy.tryBeforeYouBuy = { ...cfCopy.tryBeforeYouBuy, [path[1]]: value };
          }
          copy.checkoutFeatures = cfCopy;
        } else {
          (copy as any)[field] = value;
        }
        return copy;
      }),
    );
  };
  const copyPricingFromOffer = useCallback(() => {
    const offer = data.offers.find((o) => o.id === offerId);
    const offerPricing = offer?.data?.defaultPricing;
    if (!offerPricing?.length) return;
    setPricing(offerPricing.map(parsePricingTier));
  }, [data.offers, offerId]);

  const serializePricing = (tiers: PricingTierForm[]) =>
    tiers.map((t) => ({
      quantity: t.quantity,
      label: t.label.trim() || undefined,
      isMostPopular: t.isMostPopular || undefined,
      standardPrice: t.standardPrice,
      subscriptionAvailable: t.subscriptionAvailable,
      subscriptionPrice: t.subscriptionAvailable ? t.subscriptionPrice || undefined : undefined,
      subscriptionFrequency: t.subscriptionAvailable ? t.subscriptionFrequency : undefined,
      checkoutFeatures: t.checkoutFeatures.tryBeforeYouBuy.enabled
        ? { tryBeforeYouBuy: t.checkoutFeatures.tryBeforeYouBuy }
        : undefined,
    }));

  const handleSave = useCallback(async () => {
    if (!name.trim() || !offerId) return;
    try {
      setSaving(true);
      const api = new BuilderApi(context);

      // Sync all page names, URLs, and pageTypes to match current funnel state
      const pageUpdatePromises: Promise<void>[] = [];
      for (let i = 0; i < userSteps.length; i++) {
        if (userSteps[i].pageId) {
          const stepUrl = buildPageUrl(i + 1, userSteps[i].stepType, ghSlug, item.id ?? '');
          pageUpdatePromises.push(
            api.mergeContentData(
              'funnel-page',
              userSteps[i].pageId,
              { pageType: userSteps[i].stepType },
              { name: buildPageName(i + 1, name, ghSlug, item.id ?? ''), query: buildUrlQuery(stepUrl) },
            ),
          );
        }
      }
      if (offerSelectorPageId) {
        const osStepNum = userSteps.length + 1;
        const osUrl = buildPageUrl(osStepNum, 'offer-selector', ghSlug, item.id ?? '');
        pageUpdatePromises.push(
          api.mergeContentData(
            'funnel-page',
            offerSelectorPageId,
            { pageType: 'offer-selector' },
            { name: buildPageName('os', name, ghSlug, item.id ?? ''), query: buildUrlQuery(osUrl) },
          ),
        );
      }

      await Promise.all([
        ...pageUpdatePromises,
        api.updateContent('funnel', item.id!, {
          ...d,
          name: name.trim(),
          offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: offerId },
          isControl,
          status,
          gh: ghSlug.trim() ? { slug: ghSlug.trim() } : undefined,
          steps: [
            ...userSteps.map((s) => ({
              stepType: s.stepType,
              page: s.pageId ? { '@type': '@builder.io/core:Reference', model: 'funnel-page', id: s.pageId } : undefined,
            })),
            {
              stepType: 'offer-selector',
              page: offerSelectorPageId ? { '@type': '@builder.io/core:Reference', model: 'funnel-page', id: offerSelectorPageId } : undefined,
            },
          ],
          pricing: serializePricing(pricing),
        }),
      ]);

      // Sync Builder published status based on funnel status
      const publishedMap: Record<string, string> = { active: 'published', draft: 'draft', archived: 'archived' };
      const published = publishedMap[status];
      if (published) {
        const publishPromises: Promise<void>[] = [
          api.patchContent('funnel', item.id!, { published }),
        ];
        for (const s of userSteps) {
          if (s.pageId) publishPromises.push(api.patchContent('funnel-page', s.pageId, { published }));
        }
        if (offerSelectorPageId) {
          publishPromises.push(api.patchContent('funnel-page', offerSelectorPageId, { published }));
        }
        await Promise.all(publishPromises);
      }

      onRefresh();
    } catch (err) {
      console.error('[Hippo Funnels] Error saving funnel', err);
      await context.dialogs.alert('Failed to save funnel. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [item, d, context, name, offerId, isControl, status, ghSlug, userSteps, offerSelectorPageId, pricing, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Delete Funnel',
        text: `Type "DELETE" to confirm deleting "${name}".`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      if (confirmed !== 'DELETE') return;
      setDeleting(true);
      const api = new BuilderApi(context);
      await api.removeContent(item);
      onRefresh();
      onBack();
    } catch {
      // user cancelled
    } finally {
      setDeleting(false);
    }
  }, [context, item, name, onBack, onRefresh]);

  const isValid = name.trim() && offerId;

  return (
    <div className="max-w-5xl mx-auto">
      <DetailHeader
        title={d?.name ?? 'Funnel'}
        onBack={onBack}
        badges={[
          ...(d?.isControl ? [{ label: 'Control' as const, variant: 'primary' as const }] : []),
          {
            label: d?.status ?? 'draft',
            variant: (d?.status === 'active' ? 'success' : d?.status === 'paused' ? 'warning' : d?.status === 'archived' ? 'error' : 'ghost') as any,
          },
        ]}
        actions={
          <>
            {!isLocked && (
              <button className="btn btn-error btn-outline" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid || saving || isLocked}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      />

      <div className="space-y-6">
        {isLocked && (
          <Section>
            <div className="flex items-start gap-3">
              <span className="badge badge-warning shrink-0 mt-0.5">Locked</span>
              <div className="text-sm text-base-content/60">
                <p>
                  This funnel is locked because it is the primary funnel on {activeDestinations.length === 1 ? 'an active destination' : `${activeDestinations.length} active destinations`}:
                </p>
                <ul className="list-disc list-inside mt-1 text-base-content/70">
                  {activeDestinations.map((dest) => (
                    <li key={dest.id}>{dest.data?.name ?? 'Untitled'} (/d/{dest.data?.slug})</li>
                  ))}
                </ul>
                <p className="mt-1">To edit this funnel, deactivate or repoint the destination(s) above, then set this funnel back to draft.</p>
              </div>
            </div>
          </Section>
        )}

        {!isDraft && !isLocked && (
          <Section>
            <p className="text-sm text-base-content/60">
              This funnel is no longer in draft. Only the status can be changed. Set it back to draft to edit other fields.
            </p>
          </Section>
        )}

        <Section title="Basic Info">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Funnel Name" required>
              <input type="text" className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} disabled={!isDraft} />
            </FormField>
            <FormField label="Offer" required>
              <select className="select select-bordered w-full" value={offerId} onChange={(e) => setOfferId(e.target.value)} disabled={!isDraft}>
                <option value="">Select an offer...</option>
                {data.offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.data?.displayName ?? offer.data?.name ?? 'Untitled'}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <select className="select select-bordered w-full" value={status} onChange={(e) => setStatus(e.target.value)} disabled={isLocked}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
            <FormField
              label="Generic End Point"
              helper={ghSlug.trim() ? `Also accessible at /fp/${ghSlug.trim()}` : `Accessible at /fp/${item.id ?? '...'}`}
            >
              <input type="text" className="input input-bordered w-full" placeholder="Optional — e.g., control" value={ghSlug} onChange={(e) => setGhSlug(e.target.value)} disabled={!isDraft} />
            </FormField>
            {isControl && (
              <div className="flex items-center mt-2">
                <span className="badge badge-primary">Control Funnel</span>
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Steps"
          actions={
            isDraft ? (
              <button className="btn btn-sm btn-ghost" onClick={addStep} disabled={addingStep || stepBusy}>
                {addingStep ? 'Creating...' : '+ Add Step'}
              </button>
            ) : undefined
          }
        >
          <p className="text-xs text-base-content/50 mb-3">
            Steps run in order, ending with the required Offer Selector. Each step auto-creates a page you can design in Builder.io.
          </p>
          <div className="space-y-2">
            {userSteps.map((step, i) => {
              const linkedPage = step.pageId ? data.funnelPages.find((p) => p.id === step.pageId) : null;
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-base-300 px-3 py-2">
                  <span className="text-sm font-mono text-base-content/50 w-6 text-center shrink-0">{i + 1}</span>
                  {isDraft && (
                    <div className="flex gap-1 shrink-0">
                      <button className={`btn btn-sm btn-ghost ${i === 0 || stepBusy ? 'opacity-20' : ''}`} onClick={() => moveStep(i, -1)} disabled={i === 0 || stepBusy}>&uarr;</button>
                      <button className={`btn btn-sm btn-ghost ${i === userSteps.length - 1 || stepBusy ? 'opacity-20' : ''}`} onClick={() => moveStep(i, 1)} disabled={i === userSteps.length - 1 || stepBusy}>&darr;</button>
                    </div>
                  )}
                  <select className="select select-ghost select-sm text-sm w-32 shrink-0" value={step.stepType} onChange={(e) => updateStep(i, 'stepType', e.target.value)} disabled={!isDraft}>
                    {STEP_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-xs text-base-content/50 truncate flex-1">
                    {linkedPage ? (linkedPage.name ?? linkedPage.data?.title ?? 'Untitled') : 'No page'}
                  </span>
                  {step.pageId && (
                    <a href={`https://builder.io/content/${step.pageId}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost shrink-0">
                      Edit Page
                    </a>
                  )}
                  {isDraft && (
                    <button className="text-xs text-error/70 hover:text-error shrink-0" onClick={() => removeStep(i)} disabled={stepBusy}>
                      Remove
                    </button>
                  )}
                </div>
              );
            })}

            {/* Offer Selector — always last, always required */}
            {(() => {
              const osPage = offerSelectorPageId ? data.funnelPages.find((p) => p.id === offerSelectorPageId) : null;
              return (
                <div className="flex items-center gap-3 rounded-lg bg-base-200/50 px-3 py-2">
                  <span className="text-sm font-mono text-base-content/50 w-6 text-center shrink-0">{userSteps.length + 1}</span>
                  {isDraft && <div className="w-[68px] shrink-0" />}
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <span className="text-sm font-medium">offer-selector</span>
                    <span className="badge badge-primary badge-xs">Required</span>
                  </div>
                  <span className="text-xs text-base-content/50 truncate flex-1">
                    {osPage ? (osPage.name ?? osPage.data?.title ?? 'Untitled') : 'No page'}
                  </span>
                  {offerSelectorPageId && (
                    <a href={`https://builder.io/content/${offerSelectorPageId}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost shrink-0">
                      Edit Page
                    </a>
                  )}
                </div>
              );
            })()}
          </div>
        </Section>

        <Section
          title="Pricing Tiers"
          actions={
            isDraft ? (
              <div className="flex gap-2">
                {offerId && (
                  <button className="btn btn-sm btn-ghost" onClick={copyPricingFromOffer} title="Copy default pricing from offer">
                    Copy from Offer{offerName ? ` (${offerName})` : ''}
                  </button>
                )}
                <button className="btn btn-sm btn-ghost" onClick={addPricingTier}>
                  + Add Tier
                </button>
              </div>
            ) : undefined
          }
        >
          {pricing.length === 0 ? (
            <p className="text-base-content/50">
              No pricing tiers.{isDraft && offerId ? ' Use "Copy from Offer" to start with the offer defaults.' : ''}
            </p>
          ) : (
            <div className="space-y-3">
              {pricing.map((tier, i) => (
                <div key={i} className="border border-base-300 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-300/30 transition-colors"
                    onClick={() => setExpandedTier(expandedTier === i ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {tier.label || `Tier ${i + 1}`} &mdash; Qty {tier.quantity} &mdash; ${tier.standardPrice.toFixed(2)}
                        {tier.subscriptionAvailable && (
                          <span className="text-base-content/50 font-normal"> / ${tier.subscriptionPrice.toFixed(2)} sub</span>
                        )}
                      </span>
                      {tier.isMostPopular && <span className="badge badge-accent badge-sm">Most Popular</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {isDraft && (
                        <button
                          className="btn btn-sm btn-ghost text-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePricingTier(i);
                          }}
                        >
                          Remove
                        </button>
                      )}
                      <span className="text-xs text-base-content/40">{expandedTier === i ? '\u25B2' : '\u25BC'}</span>
                    </div>
                  </div>
                  {expandedTier === i && (
                    <div className="p-4 border-t border-base-300 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormField label="Quantity">
                          <input type="number" className="input input-bordered input-sm w-full" min={1} value={tier.quantity} onChange={(e) => updatePricingField(i, 'quantity', parseInt(e.target.value) || 1)} disabled={!isDraft} />
                        </FormField>
                        <FormField label="Label">
                          <input type="text" className="input input-bordered input-sm w-full" value={tier.label} onChange={(e) => updatePricingField(i, 'label', e.target.value)} disabled={!isDraft} />
                        </FormField>
                        <FormField label="Standard Price">
                          <input type="number" className="input input-bordered input-sm w-full" step="0.01" min={0} value={tier.standardPrice} onChange={(e) => updatePricingField(i, 'standardPrice', parseFloat(e.target.value) || 0)} disabled={!isDraft} />
                        </FormField>
                        <FormField label="Subscription">
                          <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              className="toggle toggle-sm toggle-primary"
                              checked={tier.subscriptionAvailable}
                              onChange={(e) => updatePricingField(i, 'subscriptionAvailable', e.target.checked)}
                              disabled={!isDraft}
                            />
                            <span className="text-sm">{tier.subscriptionAvailable ? 'Enabled' : 'Disabled'}</span>
                          </label>
                        </FormField>
                        {tier.subscriptionAvailable && (
                          <>
                            <FormField label="Subscription Price">
                              <input type="number" className="input input-bordered input-sm w-full" step="0.01" min={0} value={tier.subscriptionPrice} onChange={(e) => updatePricingField(i, 'subscriptionPrice', parseFloat(e.target.value) || 0)} disabled={!isDraft} />
                            </FormField>
                            <FormField label="Subscription Frequency">
                              <select
                                className="select select-bordered select-sm w-full"
                                value={tier.subscriptionFrequency}
                                onChange={(e) => updatePricingField(i, 'subscriptionFrequency', e.target.value)}
                                disabled={!isDraft}
                              >
                                {SUBSCRIPTION_FREQUENCIES.map((freq) => (
                                  <option key={freq} value={freq}>
                                    {FREQUENCY_LABELS[freq]}
                                  </option>
                                ))}
                              </select>
                            </FormField>
                          </>
                        )}
                        <FormField label="Most Popular">
                          <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input type="checkbox" className="checkbox checkbox-sm" checked={tier.isMostPopular} onChange={(e) => updatePricingField(i, 'isMostPopular', e.target.checked)} disabled={!isDraft} />
                            <span className="text-sm">Highlight this tier</span>
                          </label>
                        </FormField>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default FunnelDetailPage;
