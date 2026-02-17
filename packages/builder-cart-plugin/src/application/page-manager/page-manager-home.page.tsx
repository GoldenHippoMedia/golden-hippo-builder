import React, { useState, useMemo } from 'react';
import { StatGridContainer, StatGridCard, PageCard, LoadingSection } from '@goldenhippo/builder-ui';
import { PageDetails } from '@utils/utils.interfaces';
import { PageTypes } from '@core/models/page-types';
import { PageDetailsDialog } from '@components/page-details-dialog.component';

interface PageManagerHomePageProps {
  pages: PageDetails[];
  loading: boolean;
  onRefresh: () => void;
}

interface PageListProps {
  pages: PageDetails[];
  loading: boolean;
}

const PageList: React.FC<PageListProps> = ({ pages, loading }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<PageDetails | null>(null);

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch =
        search === '' ||
        page.title.toLowerCase().includes(search.toLowerCase()) ||
        page.path.toLowerCase().includes(search.toLowerCase());

      const matchesType = filterType === 'all' || page.pageType === filterType;

      const matchesStatus = filterStatus === 'all' || page.validationStatus === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [pages, search, filterType, filterStatus]);

  if (loading) {
    return <LoadingSection message="Loading pages..." size="lg" />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search pages..."
          className="input input-bordered input-sm flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered select-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          {Object.values(PageTypes).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered select-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="valid">Valid</option>
          <option value="warning">Warnings</option>
          <option value="invalid">Invalid</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-base-content/60 mb-3">
        Showing {filteredPages.length} of {pages.length} pages
      </p>

      {/* Page grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPages.map((page) => (
          <PageCard
            key={page.id}
            title={page.title}
            path={page.path}
            pageType={page.pageType}
            thumbnail={page.thumbnail}
            validationStatus={page.validationStatus}
            issueCount={page.issues.length}
            warningCount={page.warnings.length}
            lastUpdated={page.lastUpdated}
            onClick={() => setSelectedPage(page)}
          />
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-lg">No pages match your filters.</p>
        </div>
      )}

      <PageDetailsDialog page={selectedPage} open={selectedPage !== null} onClose={() => setSelectedPage(null)} />
    </div>
  );
};

const PageManagerHomePage: React.FC<PageManagerHomePageProps> = ({ pages, loading, onRefresh }) => {
  const generalCount = pages.filter((p) => p.pageType === PageTypes.GENERAL).length;
  const pdpCount = pages.filter((p) => p.pageType === PageTypes.PRODUCT).length;
  const blogCount = pages.filter((p) => p.pageType === PageTypes.BLOG).length;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Page Manager</h2>
          <p className="text-base-content/70">View and manage all published pages.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Refresh'}
        </button>
      </div>

      <StatGridContainer>
        <StatGridCard
          title="General Pages"
          metric={generalCount}
          loading={loading}
          variant="info"
          subtitle="Standard website pages"
        />
        <StatGridCard
          title="Product Pages"
          metric={pdpCount}
          loading={loading}
          variant="success"
          subtitle="Product detail pages"
        />
        <StatGridCard
          title="Blog Posts"
          metric={blogCount}
          loading={loading}
          variant="warning"
          subtitle="Published blog articles"
        />
      </StatGridContainer>

      <div className="divider"></div>

      <PageList pages={pages} loading={loading} />
    </div>
  );
};

export default PageManagerHomePage;
