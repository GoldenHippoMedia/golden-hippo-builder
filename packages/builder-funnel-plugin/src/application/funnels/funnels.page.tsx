import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { EmptyState, PageHeader, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import { funnelDataStore } from '../../stores/funnel-data.store';
import FunnelDetailPage from './funnel-detail.page';

interface FunnelsPageProps {
  context: ExtendedApplicationContext;
}

const StatusBadge: React.FC<{ variant: 'success' | 'warning' | 'error' | 'ghost'; label: string }> = ({
  variant,
  label,
}) => {
  const cls: Record<string, string> = {
    success: 'bg-[var(--success)]/15 text-[var(--success)]',
    warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
    error: 'bg-[var(--error)]/15 text-[var(--error)]',
    ghost: 'bg-[var(--bg-glass)] text-[var(--text-muted)]',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls[variant]}`}>{label}</span>;
};

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

interface BrandSummary {
  name: string;
  total: number;
  active: number;
}

const FunnelsPage: React.FC<FunnelsPageProps> = observer(({ context }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const { funnels, funnelPages } = funnelDataStore;

  const prePurchaseFunnels = useMemo(
    () => funnels.filter((f) => !f.data?.type || f.data.type === 'Pre-purchase'),
    [funnels],
  );

  const brands = useMemo(() => {
    const names = [...new Set(prePurchaseFunnels.map((f) => f.data?.brand).filter(Boolean))] as string[];
    return names.sort();
  }, [prePurchaseFunnels]);

  const brandSummaries = useMemo<BrandSummary[]>(
    () =>
      brands.map((name) => {
        const brandFunnels = prePurchaseFunnels.filter((f) => f.data?.brand === name);
        return {
          name,
          total: brandFunnels.length,
          active: brandFunnels.filter((f) => f.data?.active).length,
        };
      }),
    [brands, prePurchaseFunnels],
  );

  const filteredFunnels = useMemo(() => {
    let result = prePurchaseFunnels;
    if (selectedBrand) {
      result = result.filter((f) => f.data?.brand === selectedBrand);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.data?.name?.toLowerCase().includes(q) ||
          f.data?.slug?.toLowerCase().includes(q) ||
          f.data?.productionId?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [prePurchaseFunnels, selectedBrand, search]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return funnels.find((f) => f.id === selectedId) ?? null;
  }, [funnels, selectedId]);

  const handleRefresh = () => funnelDataStore.refresh(context);

  if (selectedItem) {
    return (
      <ErrorBoundary onBack={() => setSelectedId(null)}>
        <FunnelDetailPage
          item={selectedItem}
          funnelPages={funnelPages}
          context={context}
          onBack={() => setSelectedId(null)}
          onRefresh={handleRefresh}
        />
      </ErrorBoundary>
    );
  }

  const activeFunnelCount = selectedBrand
    ? brandSummaries.find((b) => b.name === selectedBrand)?.active ?? 0
    : prePurchaseFunnels.filter((f) => f.data?.active).length;
  const totalFunnelCount = selectedBrand
    ? brandSummaries.find((b) => b.name === selectedBrand)?.total ?? 0
    : prePurchaseFunnels.length;

  return (
    <div>
      <PageHeader
        title="Pre-Purchase Funnels"
        subtitle={`${activeFunnelCount} active · ${totalFunnelCount} total`}
        actions={<SmallButton onClick={handleRefresh}>Refresh</SmallButton>}
      />

      {/* Brand filter bar */}
      {brands.length > 1 && (
        <div className="flex gap-0.5 p-1 bg-[var(--bg-glass)] border border-[var(--border-glass)] rounded-xl mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all ${
              !selectedBrand
                ? 'text-[var(--accent)] bg-[var(--accent-subtle)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]'
            }`}
            onClick={() => setSelectedBrand(null)}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all ${
                selectedBrand === brand
                  ? 'text-[var(--accent)] bg-[var(--accent-subtle)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]'
              }`}
              onClick={() => setSelectedBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Brand summary cards — visible when "All" is selected */}
      {!selectedBrand && brandSummaries.length > 1 && (
        <div
          className={`grid gap-4 mb-6 ${
            brandSummaries.length <= 3
              ? `grid-cols-${brandSummaries.length}`
              : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {brandSummaries.map((brand) => (
            <button
              key={brand.name}
              className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-5 text-left cursor-pointer hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-glass-focus)] transition-all"
              onClick={() => setSelectedBrand(brand.name)}
            >
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">{brand.name}</div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[var(--text-primary)]">{brand.total}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  funnel{brand.total !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {brand.active} active · {brand.total - brand.active} inactive
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search + Table */}
      <Section>
        <div className="mb-5">
          <input
            type="text"
            className="hippo-input max-w-sm"
            placeholder="Search by name, slug, or production ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredFunnels.length === 0 ? (
          <EmptyState
            message={
              search
                ? `No funnels match "${search}". Try a different name, slug, or ID.`
                : selectedBrand
                  ? `No pre-purchase funnels found for ${selectedBrand}.`
                  : 'No pre-purchase funnels found. Make sure the sync job has run.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-glass)]">
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Name</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Slug</th>
                  {!selectedBrand && (
                    <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Brand</th>
                  )}
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
                    Production ID
                  </th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunnels.map((funnel) => (
                  <tr
                    key={funnel.id}
                    className="border-b border-[var(--border-glass)] last:border-b-0 hover:bg-[var(--bg-glass-hover)] cursor-pointer transition-colors"
                    onClick={() => setSelectedId(funnel.id ?? null)}
                  >
                    <td className="py-3 pr-4">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {funnel.data?.name ?? 'Untitled'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <code className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-glass)] text-[var(--text-secondary)]">
                        {funnel.data?.slug ?? '—'}
                      </code>
                    </td>
                    {!selectedBrand && (
                      <td className="py-3 pr-4">
                        <span className="text-xs text-[var(--text-secondary)]">{funnel.data?.brand ?? '—'}</span>
                      </td>
                    )}
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {funnel.data?.productionId ?? '—'}
                      </span>
                    </td>
                    <td className="py-3">
                      {funnel.data?.active ? (
                        <StatusBadge variant="success" label="Active" />
                      ) : (
                        <StatusBadge variant="ghost" label="Inactive" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
});

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
        <div className="py-12 text-center">
          <h2 className="text-xl font-bold text-[var(--error)] mb-2">Failed to load funnel</h2>
          <p className="text-[var(--text-secondary)] mb-1 text-sm">{this.state.error.message}</p>
          <pre className="text-xs text-[var(--text-muted)] mb-4 max-h-32 overflow-auto bg-[var(--bg-glass)] rounded-xl p-3 text-left max-w-2xl mx-auto">
            {this.state.error.stack}
          </pre>
          <button
            className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[#1a1a2e] font-semibold text-sm cursor-pointer transition-all hover:brightness-110 hover:shadow-[0_0_20px_var(--accent-glow)]"
            onClick={this.props.onBack}
          >
            Back to Funnels
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default FunnelsPage;
