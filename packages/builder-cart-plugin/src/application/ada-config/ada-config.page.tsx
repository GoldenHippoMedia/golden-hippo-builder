import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { adaPageStore } from './ada-page.store';
import AdaPageList from './components/ada-page-list';
import AssetList from './components/asset-list';

interface AdaConfigPageProps {
  context: ExtendedApplicationContext;
}

const SUBTITLE = 'Accessibility checklist derived from each page’s content — alt text, headings, and link quality';

type View = 'pages' | 'images';

const AdaConfigPage: React.FC<AdaConfigPageProps> = observer(({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);
  const [view, setView] = useState<View>('pages');

  useEffect(() => {
    void adaPageStore.ensureLoaded(api);
  }, [api]);

  const { items: pages, loaded, refreshing, error } = adaPageStore;

  const refreshAction = (
    <button
      onClick={() => adaPageStore.refresh(api)}
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
        <PageHeader title="Accessibility" subtitle={SUBTITLE} />
        <Section title="Failed to load pages" variant="danger">
          <div className="break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error}</div>
        </Section>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div>
        <PageHeader title="Accessibility" subtitle={SUBTITLE} />
        <LoadingSection />
      </div>
    );
  }

  const VIEW_TABS: { value: View; label: string }[] = [
    { value: 'pages', label: 'By Page' },
    { value: 'images', label: 'By Image' },
  ];

  return (
    <div>
      <PageHeader
        title="Accessibility"
        subtitle={`${pages.length} page${pages.length === 1 ? '' : 's'}`}
        actions={refreshAction}
      />
      {error && (
        <div className="mb-4 break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      <div className="mb-4 inline-flex rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] p-0.5">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setView(tab.value)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
              view === tab.value
                ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'pages' ? <AdaPageList pages={pages} /> : <AssetList pages={pages} />}
    </div>
  );
});

AdaConfigPage.displayName = 'AdaConfigPage';

export default AdaConfigPage;
