import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BuilderFunnelContent, BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-schemas';
import { DetailHeader, LoadingSection, Section } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import { HippoFunnel } from '../../services/hippo-api/types';
import HippoApi from '../../services/hippo-api';
import BuilderApi from '../../services/builder-api';
import UserManagementService from '../../services/user-management';

interface FunnelDetailProps {
  item: BuilderFunnelContent;
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

type FunnelStep = HippoFunnel['steps'][number];

/** Builds a Builder.io reference object pointing to the given funnel content entry. */
function buildFunnelRef(funnelContentId: string) {
  return { '@type': '@builder.io/core:Reference', id: funnelContentId };
}

const FunnelDetailPage: React.FC<FunnelDetailProps> = ({ item, data, context, onBack, onRefresh }) => {
  const [hippoFunnel, setHippoFunnel] = useState<HippoFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingAll, setCreatingAll] = useState(false);
  const [creatingStep, setCreatingStep] = useState<string | null>(null);
  const [publishingAll, setPublishingAll] = useState(false);

  const isAdmin = context.user.can('admin');
  const isFunnelActive = !!item.data?.active;
  const canEdit = isAdmin || !isFunnelActive;

  const productionId = item.data?.productionId;

  const findPageForStep = useCallback(
    (slug: string): BuilderFunnelPageContent | undefined => {
      const targetUrl = `/fp/${slug}`;
      return data.funnelPages.find((p) =>
        (p as any).query?.some((q: any) => q.property === 'urlPath' && q.value === targetUrl),
      );
    },
    [data.funnelPages],
  );

  useEffect(() => {
    if (!productionId) {
      setError('This funnel has no Production ID set. Cannot fetch from Hippo API.');
      setLoading(false);
      return;
    }
    const user = UserManagementService.getUserDetails(context);
    const api = new HippoApi(user);
    api
      .getFunnelById(productionId)
      .then((f) => {
        setHippoFunnel(f);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Failed to load funnel from Hippo API.');
        setLoading(false);
      });
  }, [productionId, context]);

  const sortedSteps = useMemo(
    () => (hippoFunnel ? [...hippoFunnel.steps].sort((a, b) => a.stepNumber - b.stepNumber) : []),
    [hippoFunnel],
  );

  const missingSteps = useMemo(
    () => sortedSteps.filter((s) => !findPageForStep(s.slug)),
    [sortedSteps, findPageForStep],
  );

  // All pages that correspond to a step in this funnel
  const stepPages = useMemo(
    () => sortedSteps.map((s) => findPageForStep(s.slug)).filter((p): p is BuilderFunnelPageContent => !!p),
    [sortedSteps, findPageForStep],
  );

  const hasMissingPages = missingSteps.length > 0;
  // Show "Publish All" only when every step has a page and at least one isn't published yet
  const showPublishAll =
    canEdit && !hasMissingPages && stepPages.length > 0 && stepPages.some((p) => p.published !== 'published');

  const handleCreatePage = useCallback(
    async (step: FunnelStep) => {
      setCreatingStep(step.slug);
      try {
        const builderApi = new BuilderApi(context);
        const pageData: Record<string, any> = { title: step.name };
        if (item.id) pageData.funnel = buildFunnelRef(item.id);
        await builderApi.createContent('funnel-page', step.name, pageData, `/fp/${step.slug}`);
        await onRefresh();
      } catch (err: any) {
        await context.dialogs.alert(err.message ?? 'Failed to create page.', 'Error');
      } finally {
        setCreatingStep(null);
      }
    },
    [context, item.id, onRefresh],
  );

  const handleCreateAllPages = useCallback(async () => {
    if (missingSteps.length === 0) return;
    const confirmed = await context.dialogs.prompt({
      title: 'Create Missing Pages',
      text: `This will create ${missingSteps.length} Builder page${missingSteps.length !== 1 ? 's' : ''} for the missing funnel steps. Type "CREATE" to confirm.`,
      confirmText: 'Create Pages',
      cancelText: 'Cancel',
    });
    if (confirmed !== 'CREATE') return;
    setCreatingAll(true);
    try {
      const builderApi = new BuilderApi(context);
      const funnelRef = item.id ? buildFunnelRef(item.id) : undefined;
      for (const step of missingSteps) {
        const pageData: Record<string, any> = { title: step.name };
        if (funnelRef) pageData.funnel = funnelRef;
        await builderApi.createContent('funnel-page', step.name, pageData, `/fp/${step.slug}`);
      }
      await onRefresh();
      await context.dialogs.alert(
        `Successfully created ${missingSteps.length} page${missingSteps.length !== 1 ? 's' : ''}.`,
      );
    } catch (err: any) {
      await context.dialogs.alert(err.message ?? 'Failed to create pages.', 'Error');
    } finally {
      setCreatingAll(false);
    }
  }, [missingSteps, context, item.id, onRefresh]);

  const handlePublishAll = useCallback(async () => {
    const unpublished = stepPages.filter((p) => p.published !== 'published');
    if (unpublished.length === 0) return;
    const confirmed = await context.dialogs.prompt({
      title: 'Publish All Pages',
      text: `This will publish ${unpublished.length} page${unpublished.length !== 1 ? 's' : ''} for this funnel. Type "PUBLISH" to confirm.`,
      confirmText: 'Publish',
      cancelText: 'Cancel',
    });
    if (confirmed !== 'PUBLISH') return;
    setPublishingAll(true);
    try {
      const builderApi = new BuilderApi(context);
      for (const page of unpublished) {
        if (page.id) await builderApi.publishContent('funnel-page', page.id);
      }
      await onRefresh();
      await context.dialogs.alert(
        `Published ${unpublished.length} page${unpublished.length !== 1 ? 's' : ''} successfully.`,
      );
    } catch (err: any) {
      await context.dialogs.alert(err.message ?? 'Failed to publish pages.', 'Error');
    } finally {
      setPublishingAll(false);
    }
  }, [stepPages, context, onRefresh]);

  const handleEditPage = useCallback(
    (page: BuilderFunnelPageContent) => {
      context.location.go(`/content/${page.id}`);
    },
    [context],
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24">
        <LoadingSection message="Loading funnel from Hippo API…" size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <DetailHeader title={item.data?.name ?? 'Funnel'} onBack={onBack} backLabel="Funnels" />
        <Section variant="danger">
          <h3 className="font-semibold text-error mb-1">Error loading funnel data</h3>
          <p className="text-sm text-base-content/70">{error}</p>
        </Section>
      </div>
    );
  }

  if (!hippoFunnel) return null;

  const createdCount = stepPages.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DetailHeader
        title={hippoFunnel.name}
        onBack={onBack}
        backLabel="Funnels"
        badges={[
          { label: hippoFunnel.type ?? 'Pre-purchase', variant: 'primary' },
          { label: isFunnelActive ? 'Active' : 'Inactive', variant: isFunnelActive ? 'success' : 'ghost' },
        ]}
        actions={
          <>
            {canEdit && hasMissingPages && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCreateAllPages}
                disabled={creatingAll || publishingAll}
              >
                {creatingAll
                  ? 'Creating…'
                  : `Create ${missingSteps.length} Missing Page${missingSteps.length !== 1 ? 's' : ''}`}
              </button>
            )}
            {showPublishAll && (
              <button
                className="btn btn-success btn-sm"
                onClick={handlePublishAll}
                disabled={publishingAll || creatingAll}
              >
                {publishingAll ? 'Publishing…' : 'Publish All Pages'}
              </button>
            )}
          </>
        }
      />

      {!isAdmin && isFunnelActive && (
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">
            This funnel is <strong>active in production</strong>. Pages are shown in read-only mode. Contact an admin to
            create or modify pages.
          </span>
        </div>
      )}

      {/* Funnel summary */}
      <Section title="Funnel Details">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Slug</p>
            <code className="text-sm bg-base-300 px-2 py-0.5 rounded">{hippoFunnel.slug ?? '—'}</code>
          </div>
          <div>
            <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Production ID</p>
            <span className="text-sm font-mono text-base-content/70">{hippoFunnel.id}</span>
          </div>
          <div>
            <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Steps</p>
            <span className="text-sm font-semibold">{hippoFunnel.steps.length}</span>
          </div>
          <div>
            <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Builder Pages</p>
            <span className={`text-sm font-semibold ${hasMissingPages ? 'text-warning' : 'text-success'}`}>
              {createdCount} / {sortedSteps.length}
            </span>
          </div>
        </div>
      </Section>

      {/* Pre-purchase options (pricing) */}
      {hippoFunnel.prePurchaseOptions && hippoFunnel.prePurchaseOptions.length > 0 && (
        <Section title="Purchase Options">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>List Price</th>
                  <th>Qty</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {[...hippoFunnel.prePurchaseOptions]
                  .sort((a, b) => {
                    if (a.quantity !== b.quantity) return a.quantity - b.quantity;
                    // subscription before one-time
                    const aType = a.subscription ? 0 : 1;
                    const bType = b.subscription ? 0 : 1;
                    if (aType !== bType) return aType - bType;
                    return a.productName.localeCompare(b.productName);
                  })
                  .map((opt) => (
                    <tr key={opt.orderFormId}>
                      <td>
                        <code className="text-xs">{opt.sku}</code>
                      </td>
                      <td className="font-medium text-sm">{opt.productName}</td>
                      <td className="font-semibold">${opt.purchasePrice.toFixed(2)}</td>
                      <td className="text-base-content/50">
                        {opt.listPrice != null ? `$${opt.listPrice.toFixed(2)}` : '—'}
                      </td>
                      <td>{opt.quantity}</td>
                      <td>
                        {opt.subscription ? (
                          <span className="badge badge-info badge-xs">Subscription</span>
                        ) : (
                          <span className="text-base-content/40 text-xs">One-time</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Funnel Steps */}
      <Section
        title="Funnel Steps"
        subtitle={
          hasMissingPages
            ? `${missingSteps.length} step${missingSteps.length !== 1 ? 's' : ''} missing a Builder page`
            : showPublishAll
              ? `All pages created — ${stepPages.filter((p) => p.published !== 'published').length} unpublished`
              : 'All pages created and published'
        }
        actions={
          <>
            {canEdit && missingSteps.length > 1 && (
              <button
                className="btn btn-primary btn-xs"
                onClick={handleCreateAllPages}
                disabled={creatingAll || publishingAll}
              >
                {creatingAll ? 'Creating…' : 'Create All Missing'}
              </button>
            )}
            {showPublishAll && (
              <button
                className="btn btn-success btn-xs"
                onClick={handlePublishAll}
                disabled={publishingAll || creatingAll}
              >
                {publishingAll ? 'Publishing…' : 'Publish All'}
              </button>
            )}
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Step</th>
                <th>Page Type</th>
                <th>URL</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedSteps.map((step) => {
                const existingPage = findPageForStep(step.slug);
                const isCreatingThis = creatingStep === step.slug;
                const pageStatus = existingPage?.published ?? null;

                return (
                  <tr key={step.slug} className="hover:bg-base-300/20">
                    <td className="text-base-content/40 font-mono text-sm tabular-nums">{step.stepNumber}</td>
                    <td>
                      <div className="font-medium">{step.name}</div>
                      {step.gep && <div className="text-xs font-mono text-base-content/40 mt-0.5">{step.gep}</div>}
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm">{step.pageType}</span>
                    </td>
                    <td>
                      <code className="text-xs text-base-content/60">/fp/{step.slug}</code>
                    </td>
                    <td>
                      {pageStatus === 'published' ? (
                        <span className="badge badge-success badge-sm">Published</span>
                      ) : pageStatus === 'draft' ? (
                        <span className="badge badge-ghost badge-sm">Draft</span>
                      ) : pageStatus != null ? (
                        <span className="badge badge-ghost badge-sm">{pageStatus}</span>
                      ) : (
                        <span className="badge badge-warning badge-sm">Missing</span>
                      )}
                    </td>
                    <td className="text-right">
                      {existingPage ? (
                        <button className="btn btn-ghost btn-xs" onClick={() => handleEditPage(existingPage)}>
                          {canEdit ? 'Edit Page' : 'View Page'}
                        </button>
                      ) : canEdit ? (
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handleCreatePage(step)}
                          disabled={isCreatingThis || creatingAll}
                        >
                          {isCreatingThis ? 'Creating…' : 'Create Page'}
                        </button>
                      ) : (
                        <span className="text-base-content/30 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default FunnelDetailPage;
