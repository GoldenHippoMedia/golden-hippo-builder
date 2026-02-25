import React from 'react';
import { PageHeader, StatGridCard, StatGridContainer, Section } from '@goldenhippo/builder-ui';
import { FunnelAppData, PageOption } from '../App';

interface DashboardPageProps {
  data: FunnelAppData;
  setPage: (page: PageOption) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ data, setPage }) => {
  const activeFunnels = data.funnels.filter((f) => f.data?.status === 'active').length;
  const activeDestinations = data.destinations.filter((d) => d.data?.status === 'active').length;
  const activeSplitTests = data.splitTests.filter((t) => t.data?.status === 'active').length;
  const defaultOffer = data.offers.find((o) => o.data?.isDefaultOffer);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Funnel Dashboard" />

      <StatGridContainer columns={4}>
        <StatGridCard
          title="Offers"
          metric={data.offers.length}
          actionLabel="View"
          onActionClick={() => setPage(PageOption.OFFERS)}
        />
        <StatGridCard
          title="Active Funnels"
          metric={`${activeFunnels} / ${data.funnels.length}`}
          actionLabel="View"
          onActionClick={() => setPage(PageOption.FUNNELS)}
        />
        <StatGridCard
          title="Destinations"
          metric={`${activeDestinations} / ${data.destinations.length}`}
          actionLabel="View"
          onActionClick={() => setPage(PageOption.DESTINATIONS)}
        />
        <StatGridCard
          title="Split Tests"
          metric={activeSplitTests}
          subtitle={activeSplitTests > 0 ? 'active' : 'none active'}
          actionLabel="View"
          onActionClick={() => setPage(PageOption.SPLIT_TESTS)}
        />
      </StatGridContainer>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Default Offer">
          {defaultOffer ? (
            <div>
              <p className="text-lg font-semibold">{defaultOffer.data?.displayName ?? defaultOffer.data?.name}</p>
              <p className="text-sm text-base-content/60 mt-1">
                {defaultOffer.data?.products?.length ?? 0} product(s),{' '}
                {defaultOffer.data?.defaultPricing?.length ?? 0} pricing tier(s)
              </p>
            </div>
          ) : (
            <p className="text-base-content/50 italic">No default offer set. Set one in the Offers section.</p>
          )}
        </Section>

        <Section title="Recent Funnels">
          {data.funnels.length > 0 ? (
            <ul className="space-y-3">
              {data.funnels.slice(0, 5).map((funnel) => (
                <li key={funnel.id} className="flex items-center justify-between">
                  <span className="font-medium">{funnel.data?.name ?? funnel.name}</span>
                  <div className="flex items-center gap-2">
                    {funnel.data?.isControl && <span className="badge badge-primary badge-sm">Control</span>}
                    <span
                      className={`badge badge-sm ${funnel.data?.status === 'active' ? 'badge-success' : 'badge-ghost'}`}
                    >
                      {funnel.data?.status ?? 'draft'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base-content/50 italic">No funnels created yet.</p>
          )}
        </Section>
      </div>
    </div>
  );
};

export default DashboardPage;
