import React, { useMemo, useState } from 'react';
import { BuilderFunnelDestinationContent } from '@goldenhippo/builder-funnel-schemas';
import { EmptyState, PageHeader, Section } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import DestinationDetailPage from './destination-detail.page';

interface DestinationsPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

const DestinationsPage: React.FC<DestinationsPageProps> = ({ data, context, onRefresh }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return data.destinations.find((d) => d.id === selectedId) ?? null;
  }, [data.destinations, selectedId]);

  if (selectedItem) {
    return (
      <DestinationDetailPage
        item={selectedItem}
        data={data}
        context={context}
        onBack={() => setSelectedId(null)}
        onRefresh={onRefresh}
      />
    );
  }

  const getDefaultFunnelName = (dest: BuilderFunnelDestinationContent) => {
    const funnelId = dest.data?.defaultFunnel?.id;
    if (!funnelId) return '—';
    const funnel = data.funnels.find((f) => f.id === funnelId);
    return funnel?.data?.name ?? 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Destinations"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
            Refresh
          </button>
        }
      />

      {data.destinations.length === 0 ? (
        <EmptyState message="No destinations found." />
      ) : (
        <Section>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Default Funnel</th>
                  <th>Status</th>
                  <th>Split Test</th>
                </tr>
              </thead>
              <tbody>
                {data.destinations.map((dest) => (
                  <tr
                    key={dest.id}
                    className="hover:bg-base-300/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(dest.id ?? null)}
                  >
                    <td className="font-medium">{dest.data?.name ?? 'Untitled'}</td>
                    <td>
                      <code className="text-xs bg-base-300 px-2 py-1 rounded">/d/{dest.data?.slug ?? '…'}</code>
                    </td>
                    <td className="text-sm text-base-content/70">{getDefaultFunnelName(dest)}</td>
                    <td>
                      {dest.data?.active ? (
                        <span className="badge badge-success badge-sm">Active</span>
                      ) : (
                        <span className="badge badge-ghost badge-sm">Inactive</span>
                      )}
                    </td>
                    <td>
                      {dest.data?.splitTest?.productionId ? (
                        <span className="badge badge-info badge-sm">{dest.data.splitTest.name ?? 'Split Test'}</span>
                      ) : (
                        <span className="text-base-content/40 text-sm">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
};

export default DestinationsPage;
