import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BuilderFunnelContent, BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-schemas';
import { DetailHeader, LoadingSection, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import { HippoFunnel } from '../../services/hippo-api/types';
import HippoApi from '../../services/hippo-api';
import BuilderApi from '../../services/builder-api';
import UserManagementService from '../../services/user-management';

interface FunnelDetailProps {
  item: BuilderFunnelContent;
  funnelPages: BuilderFunnelPageContent[];
  context: ExtendedApplicationContext;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

type FunnelStep = HippoFunnel['steps'][number];

const StatusBadge: React.FC<{ variant: 'success' | 'warning' | 'error' | 'ghost' | 'info'; label: string }> = ({
  variant,
  label,
}) => {
  const cls: Record<string, string> = {
    success: 'bg-[var(--success)]/15 text-[var(--success)]',
    warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
    error: 'bg-[var(--error)]/15 text-[var(--error)]',
    ghost: 'bg-[var(--bg-glass)] text-[var(--text-muted)]',
    info: 'bg-[var(--accent)]/15 text-[var(--accent)]',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls[variant]}`}>{label}</span>;
};

const AccentButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`px-5 py-2 rounded-lg bg-[var(--accent)] text-[#1a1a2e] font-semibold text-sm cursor-pointer transition-all hover:brightness-110 hover:shadow-[0_0_20px_var(--accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none ${className ?? ''}`}
    {...props}
  >
    {children}
  </button>
);

const SmallButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ''}`}
    {...props}
  >
    {children}
  </button>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide mb-1">{label}</div>
    <div className="text-sm text-[var(--text-primary)]">{value}</div>
  </div>
);

function buildFunnelRef(funnelContentId: string) {
  return {
    '@type': '@builder.io/core:Reference',
    model: 'funnel',
    id: funnelContentId,
  };
}

const FunnelDetailPage: React.FC<FunnelDetailProps> = ({ item, funnelPages, context, onBack, onRefresh }) => {
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
  const slug = item.data?.slug;
  const brand = item.data?.brand ?? '';

  const findPageForStep = useCallback(
    (stepSlug: string): BuilderFunnelPageContent | undefined => {
      const targetUrl = `/fp/${stepSlug}`;
      return funnelPages.find((p) =>
        (p as any).query?.some((q: any) => q.property === 'urlPath' && q.value === targetUrl),
      );
    },
    [funnelPages],
  );

  useEffect(() => {
    if (!productionId && !slug) {
      setError('This funnel has no Production ID or slug set. Cannot fetch from Hippo API.');
      setLoading(false);
      return;
    }
    const user = UserManagementService.getUserDetails(context);
    const api = new HippoApi(user);
    if (productionId) {
      api
        .getFunnelById(productionId, brand)
        .then((f) => {
          setHippoFunnel(f);
          setLoading(false);
        })
        .catch(() => {
          if (slug) {
            api
              .getFunnelByGEP(slug, brand)
              .then((f) => {
                setHippoFunnel(f);
                setLoading(false);
              })
              .catch((err: Error) => {
                setError(err.message ?? 'Failed to load funnel from Hippo API.');
                setLoading(false);
              });
          } else {
            setError('Failed to load funnel from Hippo API.');
            setLoading(false);
          }
        });
    } else if (slug) {
      api
        .getFunnelByGEP(slug, brand)
        .then((f) => {
          setHippoFunnel(f);
          setLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message ?? 'Failed to load funnel from Hippo API.');
          setLoading(false);
        });
    }
  }, [productionId, slug, brand, context]);

  const sortedSteps = useMemo(
    () => (hippoFunnel ? [...hippoFunnel.steps].sort((a, b) => a.stepNumber - b.stepNumber) : []),
    [hippoFunnel],
  );

  const missingSteps = useMemo(
    () => sortedSteps.filter((s) => !findPageForStep(s.slug)),
    [sortedSteps, findPageForStep],
  );

  const stepPages = useMemo(
    () => sortedSteps.map((s) => findPageForStep(s.slug)).filter((p): p is BuilderFunnelPageContent => !!p),
    [sortedSteps, findPageForStep],
  );

  const hasMissingPages = missingSteps.length > 0;
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
      <div className="flex items-center justify-center py-24">
        <LoadingSection message="Loading funnel from Hippo API…" size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <DetailHeader title={item.data?.name ?? 'Funnel'} onBack={onBack} backLabel="Funnels" />
        <Section variant="danger">
          <h3 className="font-semibold text-[var(--error)] mb-1">Error loading funnel data</h3>
          <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        </Section>
      </div>
    );
  }

  if (!hippoFunnel) return null;

  const createdCount = stepPages.length;

  return (
    <div className="space-y-6">
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
              <AccentButton onClick={handleCreateAllPages} disabled={creatingAll || publishingAll}>
                {creatingAll
                  ? 'Creating…'
                  : `Create ${missingSteps.length} Missing Page${missingSteps.length !== 1 ? 's' : ''}`}
              </AccentButton>
            )}
            {showPublishAll && (
              <SmallButton
                onClick={handlePublishAll}
                disabled={publishingAll || creatingAll}
                className="!bg-[var(--success)]/15 !text-[var(--success)] !border-[var(--success)]/20"
              >
                {publishingAll ? 'Publishing…' : 'Publish All Pages'}
              </SmallButton>
            )}
          </>
        }
      />

      {!isAdmin && isFunnelActive && (
        <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-5 py-4 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0 mt-0.5 text-[var(--warning)]"
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
          <span className="text-sm text-[var(--warning)]">
            This funnel is <strong>active in production</strong>. Pages are shown in read-only mode. Contact an admin to
            create or modify pages.
          </span>
        </div>
      )}

      <Section title="Funnel Details">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <InfoRow
            label="Slug"
            value={
              <code className="text-sm font-mono px-2 py-0.5 rounded bg-[var(--bg-glass)]">
                {hippoFunnel.slug ?? '—'}
              </code>
            }
          />
          <InfoRow label="Production ID" value={<span className="font-mono text-xs">{hippoFunnel.id}</span>} />
          <InfoRow label="Steps" value={<span className="font-semibold">{hippoFunnel.steps.length}</span>} />
          <InfoRow
            label="Builder Pages"
            value={
              <span className={`font-semibold ${hasMissingPages ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                {createdCount} / {sortedSteps.length}
              </span>
            }
          />
        </div>
      </Section>

      {hippoFunnel.prePurchaseOptions && hippoFunnel.prePurchaseOptions.length > 0 && (
        <Section title="Purchase Options">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-glass)]">
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">SKU</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Product</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Price</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">List Price</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Qty</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Type</th>
                </tr>
              </thead>
              <tbody>
                {[...hippoFunnel.prePurchaseOptions]
                  .sort((a, b) => {
                    if (a.quantity !== b.quantity) return a.quantity - b.quantity;
                    const aType = a.subscription ? 0 : 1;
                    const bType = b.subscription ? 0 : 1;
                    if (aType !== bType) return aType - bType;
                    return a.productName.localeCompare(b.productName);
                  })
                  .map((opt) => (
                    <tr key={opt.orderFormId} className="border-b border-[var(--border-glass)] last:border-b-0">
                      <td className="py-3 pr-4">
                        <code className="text-xs font-mono text-[var(--text-secondary)]">{opt.sku}</code>
                      </td>
                      <td className="py-3 pr-4 text-sm font-medium text-[var(--text-primary)]">{opt.productName}</td>
                      <td className="py-3 pr-4 font-semibold text-[var(--text-primary)]">
                        ${opt.purchasePrice.toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-muted)]">
                        {opt.listPrice != null ? `$${opt.listPrice.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-primary)]">{opt.quantity}</td>
                      <td className="py-3">
                        {opt.subscription ? (
                          <StatusBadge variant="info" label="Subscription" />
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">One-time</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

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
              <AccentButton
                onClick={handleCreateAllPages}
                disabled={creatingAll || publishingAll}
                className="!text-xs !px-3 !py-1.5"
              >
                {creatingAll ? 'Creating…' : 'Create All Missing'}
              </AccentButton>
            )}
            {showPublishAll && (
              <SmallButton
                onClick={handlePublishAll}
                disabled={publishingAll || creatingAll}
                className="!bg-[var(--success)]/15 !text-[var(--success)] !border-[var(--success)]/20"
              >
                {publishingAll ? 'Publishing…' : 'Publish All'}
              </SmallButton>
            )}
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-glass)]">
                <th className="pb-3 w-10 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">#</th>
                <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Step</th>
                <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Page Type</th>
                <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">URL</th>
                <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Status</th>
                <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSteps.map((step) => {
                const existingPage = findPageForStep(step.slug);
                const isCreatingThis = creatingStep === step.slug;
                const pageStatus = existingPage?.published ?? null;

                return (
                  <tr
                    key={step.slug}
                    className="border-b border-[var(--border-glass)] last:border-b-0 hover:bg-[var(--bg-glass-hover)] transition-colors"
                  >
                    <td className="py-3 pr-4 text-[var(--text-muted)] font-mono text-sm tabular-nums">
                      {step.stepNumber}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]">{step.name}</div>
                      {step.gep && <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5">{step.gep}</div>}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge variant="ghost" label={step.pageType} />
                    </td>
                    <td className="py-3 pr-4">
                      <code className="text-xs font-mono text-[var(--text-secondary)]">/fp/{step.slug}</code>
                    </td>
                    <td className="py-3 pr-4">
                      {pageStatus === 'published' ? (
                        <StatusBadge variant="success" label="Published" />
                      ) : pageStatus === 'draft' ? (
                        <StatusBadge variant="ghost" label="Draft" />
                      ) : pageStatus != null ? (
                        <StatusBadge variant="ghost" label={pageStatus} />
                      ) : (
                        <StatusBadge variant="warning" label="Missing" />
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {existingPage ? (
                        <SmallButton onClick={() => handleEditPage(existingPage)}>
                          {canEdit ? 'Edit Page' : 'View Page'}
                        </SmallButton>
                      ) : canEdit ? (
                        <AccentButton
                          onClick={() => handleCreatePage(step)}
                          disabled={isCreatingThis || creatingAll}
                          className="!text-xs !px-3 !py-1.5"
                        >
                          {isCreatingThis ? 'Creating…' : 'Create Page'}
                        </AccentButton>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">—</span>
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
