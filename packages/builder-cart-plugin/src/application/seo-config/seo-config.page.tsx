import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import SeoPageList from './components/seo-page-list';
import { type PageEntry } from './seo-page';

interface SeoConfigPageProps {
  context: ExtendedApplicationContext;
}

const SUBTITLE = 'A bird’s-eye view of every page’s SEO and sitemap configuration';

const SeoConfigPage: React.FC<SeoConfigPageProps> = ({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);

  // Tracks whether the component is still mounted so an in-flight load doesn't
  // set state after unmount.
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
        const results = await api.getModelEntries<PageEntry>('page', { bustCache: true, limit: 2000 });
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
        <PageHeader title="SEO Config" subtitle={SUBTITLE} />
        <LoadingSection />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="SEO Config" subtitle={SUBTITLE} />
        <Section title="Failed to load pages">
          <div className="break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error}</div>
        </Section>
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

      <SeoPageList pages={pages} />
    </div>
  );
};

export default SeoConfigPage;
