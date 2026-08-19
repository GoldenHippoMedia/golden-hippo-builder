import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { seoPageStore } from './seo-page.store';
import SeoPageList from './components/seo-page-list';

interface SeoConfigPageProps {
  context: ExtendedApplicationContext;
}

const SUBTITLE = 'A bird’s-eye view of every page’s SEO and sitemap configuration';

const SeoConfigPage: React.FC<SeoConfigPageProps> = observer(({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  useEffect(() => {
    void seoPageStore.ensureLoaded(api);
  }, [api]);

  const { items: pages, loaded, refreshing, error } = seoPageStore;

  const refreshAction = (
    <button
      onClick={() => seoPageStore.refresh(api)}
      disabled={refreshing}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] disabled:cursor-not-allowed disabled:opacity-40"
      title="Re-fetch pages from Builder.io (cache-busted)"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={refreshing ? 'animate-spin' : ''}
      >
        <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  );

  if (error && !loaded) {
    return (
      <div>
        <PageHeader title="SEO Config" subtitle={SUBTITLE} />
        <Section title="Failed to load pages" variant="danger">
          <div className="break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error}</div>
        </Section>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div>
        <PageHeader title="SEO Config" subtitle={SUBTITLE} />
        <LoadingSection />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="SEO Config"
        subtitle={`${pages.length} page${pages.length === 1 ? '' : 's'}`}
        actions={refreshAction}
      />
      {error && (
        <div className="mb-4 break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}
      <SeoPageList pages={pages} />
    </div>
  );
});

SeoConfigPage.displayName = 'SeoConfigPage';

export default SeoConfigPage;
