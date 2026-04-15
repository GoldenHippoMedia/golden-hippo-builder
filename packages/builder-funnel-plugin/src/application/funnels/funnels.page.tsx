import React, { useMemo, useState } from 'react';
import { EmptyState, PageHeader, Section } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import FunnelDetailPage from './funnel-detail.page';

interface FunnelsPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

const FunnelsPage: React.FC<FunnelsPageProps> = ({ data, context, onRefresh }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return data.funnels.find((f) => f.id === selectedId) ?? null;
  }, [data.funnels, selectedId]);

  // Only show Pre-purchase funnels — post-purchase flow not yet decided
  const prePurchaseFunnels = useMemo(
    () => data.funnels.filter((f) => !f.data?.type || f.data.type === 'Pre-purchase'),
    [data.funnels],
  );

  const filteredFunnels = useMemo(() => {
    if (!search.trim()) return prePurchaseFunnels;
    const q = search.toLowerCase();
    return prePurchaseFunnels.filter(
      (f) =>
        f.data?.name?.toLowerCase().includes(q) ||
        f.data?.slug?.toLowerCase().includes(q) ||
        f.data?.productionId?.toLowerCase().includes(q),
    );
  }, [prePurchaseFunnels, search]);

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

  const activeFunnelCount = prePurchaseFunnels.filter((f) => f.data?.active).length;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Pre-Purchase Funnels"
        subtitle={`${activeFunnelCount} active · ${prePurchaseFunnels.length} total synced from Hippo`}
        actions={
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
            Refresh
          </button>
        }
      />

      <Section>
        <div className="mb-5">
          <input
            type="text"
            className="input input-bordered w-full max-w-sm"
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
                : 'No pre-purchase funnels found. Make sure the sync job has run.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Production ID</th>
                  <th>Status</th>
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
                      <span className="font-medium">{funnel.data?.name ?? 'Untitled'}</span>
                    </td>
                    <td>
                      <code className="text-xs bg-base-300 px-2 py-1 rounded">{funnel.data?.slug ?? '—'}</code>
                    </td>
                    <td>
                      <span className="text-sm font-mono text-base-content/60">{funnel.data?.productionId ?? '—'}</span>
                    </td>
                    <td>
                      {funnel.data?.active ? (
                        <span className="badge badge-success badge-sm">Active</span>
                      ) : (
                        <span className="badge badge-ghost badge-sm">Inactive</span>
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
          <p className="text-base-content/60 mb-1 text-sm">{this.state.error.message}</p>
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
