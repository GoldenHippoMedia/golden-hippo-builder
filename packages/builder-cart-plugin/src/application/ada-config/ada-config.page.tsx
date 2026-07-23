import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import AdaPageList from './components/ada-page-list';
import AssetList from './components/asset-list';
import { type PageEntry } from './ada-page';

interface AdaConfigPageProps {
  context: ExtendedApplicationContext;
}

const SUBTITLE = 'Accessibility checklist derived from each page’s content — alt text, headings, and link quality';

// Blocks make responses much heavier than the SEO audit's meta-only fetch, so
// we cap lower. Pages beyond this are noted rather than silently dropped.
const PAGE_LIMIT = 1000;

type View = 'pages' | 'images';

const AdaConfigPage: React.FC<AdaConfigPageProps> = ({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [view, setView] = useState<View>('pages');

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(
    async (initial: boolean) => {
      if (initial) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        // includeBlocks is required — the audit inspects the visual block tree.
        const results = await api.getModelEntries<PageEntry>('page', {
          bustCache: true,
          limit: PAGE_LIMIT,
          includeBlocks: true,
        });
        if (!mounted.current) return;
        setPages(results);
      } catch (e) {
        if (!mounted.current) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted.current) {
          if (initial) setLoading(false);
          else setRefreshing(false);
        }
      }
    },
    [api],
  );

  useEffect(() => {
    void load(true);
  }, [load]);

  const refreshAction = (
    <button
      onClick={() => load(false)}
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

  if (loading) {
    return (
      <div>
        <PageHeader title="Accessibility" subtitle={SUBTITLE} />
        <LoadingSection />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Accessibility" subtitle={SUBTITLE} />
        <Section title="Failed to load pages">
          <div className="break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error}</div>
        </Section>
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
};

export default AdaConfigPage;
