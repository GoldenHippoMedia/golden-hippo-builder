import React from 'react';
import { PageHeader, StatGridCard, StatGridContainer, Section } from '@goldenhippo/builder-ui';
import { FunnelAppData, PageOption } from '../App';

interface DashboardPageProps {
  data: FunnelAppData;
  setPage: (page: PageOption) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ data, setPage }) => {
  const prePurchaseFunnels = data.funnels.filter((f) => !f.data?.type || f.data.type === 'Pre-purchase');
  const activeFunnels = prePurchaseFunnels.filter((f) => f.data?.active).length;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Funnel Dashboard" />

      <StatGridContainer columns={4}>
        <StatGridCard
          title="Pre-Purchase Funnels"
          metric={`${activeFunnels} active / ${prePurchaseFunnels.length} total`}
          actionLabel="View"
          onActionClick={() => setPage(PageOption.FUNNELS)}
        />
        <StatGridCard
          title="Funnel Pages"
          metric={`${data.funnelPages.length}`}
          actionLabel="View Funnels"
          onActionClick={() => setPage(PageOption.FUNNELS)}
        />
      </StatGridContainer>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Recent Funnels">
          {prePurchaseFunnels.length > 0 ? (
            <ul className="space-y-3">
              {prePurchaseFunnels.slice(0, 6).map((funnel) => (
                <li key={funnel.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{funnel.data?.name ?? funnel.name}</span>
                    {funnel.data?.slug && (
                      <code className="ml-2 text-xs bg-base-300 px-1.5 py-0.5 rounded text-base-content/60">
                        {funnel.data.slug}
                      </code>
                    )}
                  </div>
                  <span className={`badge badge-sm ${funnel.data?.active ? 'badge-success' : 'badge-ghost'}`}>
                    {funnel.data?.active ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base-content/50 italic">No funnels yet. Make sure the sync job has run.</p>
          )}
        </Section>
      </div>
    </div>
  );
};

export default DashboardPage;
