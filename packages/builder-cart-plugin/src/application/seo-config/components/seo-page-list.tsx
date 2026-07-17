import React, { useMemo, useState } from 'react';
import { EmptyState, StatGridCard, StatGridContainer, StatusBadge } from '@goldenhippo/builder-ui';
import { builderContentUrl } from '../../product-config/builder-urls';
import {
  activeRobotsFlags,
  auditPage,
  descriptionSeverity,
  looksLikeBlogCategory,
  pageCategory,
  summarize,
  titleSeverity,
  type PageAudit,
  type PageCategory,
  type PageEntry,
  type Severity,
} from '../seo-page';

interface SeoPageListProps {
  pages: PageEntry[];
}

type CategoryFilter = 'all' | PageCategory;

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Product', label: 'Products' },
  { value: 'Blog', label: 'Blogs' },
  { value: 'Other', label: 'General' },
];

type StatusFilter = 'all' | 'published' | 'draft';
type SitemapFilter = 'all' | 'in' | 'excluded';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Any status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const SITEMAP_OPTIONS: { value: SitemapFilter; label: string }[] = [
  { value: 'all', label: 'Any sitemap' },
  { value: 'in', label: 'In sitemap' },
  { value: 'excluded', label: 'Excluded' },
];

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  const active = value !== 'all';
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus:outline-none ${
        active
          ? 'border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]'
          : 'border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]'
      }`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const CategoryButton: React.FC<{ active: boolean; label: string; count: number; onClick: () => void }> = ({
  active,
  label,
  count,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? 'border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]'
        : 'border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]'
    }`}
  >
    {label}
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
        active ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-glass-hover)] text-[var(--text-muted)]'
      }`}
    >
      {count}
    </span>
  </button>
);

const normalize = (v: string): string => v.toLowerCase().replace(/[^a-z0-9/]/g, '');

const SEVERITY_DOT: Record<Severity, string> = {
  ok: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]',
  error: 'bg-[var(--error)]',
};

// A compact "value + character count" cell. The dot encodes health so a long
// scan of the table reveals problem rows without reading every value.
const MetaCell: React.FC<{ value: string; severity: Severity; emptyLabel: string; note?: string }> = ({
  value,
  severity,
  emptyLabel,
  note,
}) => (
  <div className="flex min-w-0 items-start gap-2">
    <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${SEVERITY_DOT[severity]}`} />
    <div className="min-w-0">
      {value ? (
        <>
          <div className="truncate text-[13px] text-[var(--text-primary)]" title={value}>
            {value}
          </div>
          <div className="text-[11px] tabular-nums text-[var(--text-muted)]">
            {value.length} chars{note ? ` · ${note}` : ''}
          </div>
        </>
      ) : (
        <span className="text-[12px] italic text-[var(--text-muted)]">{emptyLabel}</span>
      )}
    </div>
  </div>
);

const Chip: React.FC<{ label: string; tone: 'robot' | 'canonical'; title?: string }> = ({ label, tone, title }) => (
  <span
    title={title}
    className={
      tone === 'robot'
        ? 'inline-flex items-center rounded-md border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--warning)]'
        : 'inline-flex items-center rounded-md border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]'
    }
  >
    {label}
  </span>
);

const PageRow: React.FC<{ audit: PageAudit }> = ({ audit }) => {
  const robotFlags = activeRobotsFlags(audit.robots);
  const hasIssues = audit.issues.length > 0;
  // A General page we're grouping under Blogs by naming/URL convention.
  const asBlog = looksLikeBlogCategory(audit);

  return (
    <tr className="border-b border-[var(--border-glass)] align-top last:border-0 hover:bg-[var(--bg-glass-hover)]">
      {/* Page */}
      <td className="px-3 py-3">
        <div className="flex items-start gap-2">
          {hasIssues && (
            <span
              className="mt-0.5 flex-shrink-0 text-[var(--warning)]"
              title={audit.issues.join('\n')}
              aria-label={`${audit.issues.length} SEO issue(s)`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-[var(--text-primary)]" title={audit.name}>
              {audit.name}
            </div>
            <div className="truncate font-mono text-[11px] text-[var(--text-muted)]" title={audit.path}>
              {audit.path || '—'}
            </div>
          </div>
        </div>
      </td>

      {/* SEO Title */}
      <td className="px-3 py-3">
        <MetaCell
          value={audit.seoTitle}
          severity={titleSeverity(audit.seoTitle)}
          emptyLabel="Missing title"
          note={audit.titleIsFallback && audit.seoTitle ? 'from page title' : undefined}
        />
      </td>

      {/* Description */}
      <td className="px-3 py-3">
        <MetaCell
          value={audit.description}
          severity={descriptionSeverity(audit.description)}
          emptyLabel="Missing description"
        />
      </td>

      {/* Type / Status */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="flex flex-col items-start gap-1.5">
          <StatusBadge status="neutral" label={audit.pageType} />
          {asBlog && (
            <span
              title="Grouped under Blogs by naming/URL convention (page type is General)"
              className="text-[10px] italic text-[var(--text-muted)]"
            >
              ↳ as blog
            </span>
          )}
          <StatusBadge
            status={audit.published ? 'success' : 'warning'}
            label={audit.published ? 'Published' : 'Draft'}
          />
        </div>
      </td>

      {/* Sitemap + flags (canonical / image folded in here) */}
      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1.5">
          <StatusBadge
            status={audit.inSitemap ? 'success' : 'neutral'}
            label={audit.inSitemap ? 'In sitemap' : 'Excluded'}
          />
          <div className="flex flex-wrap items-center gap-1">
            {robotFlags.map((f) => (
              <Chip key={f} label={f} tone="robot" />
            ))}
            {audit.canonical && <Chip label="canonical" tone="canonical" title={audit.canonical} />}
            {audit.seoImage ? (
              <img
                src={audit.seoImage}
                alt=""
                title="Social image set"
                className="h-6 w-6 rounded border border-[var(--border-glass)] bg-white object-cover"
              />
            ) : (
              <span className="text-[10px] italic text-[var(--text-muted)]">no image</span>
            )}
          </div>
        </div>
      </td>

      {/* Action */}
      <td className="px-2 py-3 text-right">
        {audit.id && (
          <a
            href={builderContentUrl(audit.id)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this page in the Builder.io content editor"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--accent)]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
            </svg>
          </a>
        )}
      </td>
    </tr>
  );
};

const TH: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th
    className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] ${className ?? ''}`}
  >
    {children}
  </th>
);

const SeoPageList: React.FC<SeoPageListProps> = ({ pages }) => {
  const [query, setQuery] = useState('');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sitemap, setSitemap] = useState<SitemapFilter>('all');

  const audits = useMemo(() => {
    return pages.map(auditPage).sort((a, b) => a.path.localeCompare(b.path) || a.name.localeCompare(b.name));
  }, [pages]);

  // Counts per tab reflect the full set (independent of search / issues), so the
  // badges stay a stable overview of the catalog.
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = { all: audits.length, Product: 0, Blog: 0, Other: 0 };
    audits.forEach((a) => {
      counts[pageCategory(a)] += 1;
    });
    return counts;
  }, [audits]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return audits.filter((a) => {
      if (category !== 'all' && pageCategory(a) !== category) return false;
      if (status === 'published' && !a.published) return false;
      if (status === 'draft' && a.published) return false;
      if (sitemap === 'in' && !a.inSitemap) return false;
      if (sitemap === 'excluded' && a.inSitemap) return false;
      if (issuesOnly && a.issues.length === 0) return false;
      if (!q) return true;
      return normalize(`${a.name} ${a.path} ${a.seoTitle}`).includes(q);
    });
  }, [audits, query, issuesOnly, category, status, sitemap]);

  const anyFilter = query.trim() !== '' || issuesOnly || category !== 'all' || status !== 'all' || sitemap !== 'all';

  // Stats mirror the filtered view so they describe what's on screen. When a
  // filter is active, the Pages card notes the full total for context.
  const summary = useMemo(() => summarize(filtered), [filtered]);

  return (
    <div className="space-y-4">
      <StatGridContainer columns={4}>
        <StatGridCard
          title="Pages"
          metric={summary.total}
          subtitle={anyFilter ? `of ${audits.length} total` : 'Across this brand'}
        />
        <StatGridCard
          title="In Sitemap"
          metric={summary.inSitemap}
          variant="success"
          subtitle="Published & indexable"
        />
        <StatGridCard
          title="Missing Description"
          metric={summary.missingDescription}
          variant={summary.missingDescription > 0 ? 'warning' : 'success'}
          subtitle="No SEO description set"
        />
        <StatGridCard title="Excluded" metric={summary.excluded} variant="neutral" subtitle="Draft or noindexed" />
      </StatGridContainer>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_TABS.map((tab) => (
          <CategoryButton
            key={tab.value}
            active={category === tab.value}
            label={tab.label}
            count={categoryCounts[tab.value]}
            onClick={() => setCategory(tab.value)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by page name, path, or SEO title..."
          className="min-w-[240px] flex-1 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:outline-none"
        />
        <FilterSelect
          ariaLabel="Filter by publish status"
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          ariaLabel="Filter by sitemap inclusion"
          value={sitemap}
          onChange={setSitemap}
          options={SITEMAP_OPTIONS}
        />
        <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={issuesOnly}
            onChange={(e) => setIssuesOnly(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Issues only
        </label>
        <span className="text-xs tabular-nums text-[var(--text-muted)]">
          {filtered.length} of {audits.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={
            query || issuesOnly || category !== 'all' || status !== 'all' || sitemap !== 'all'
              ? 'No pages match the current filter.'
              : 'No pages are configured for this brand yet.'
          }
        />
      ) : (
        // table-fixed + colgroup make columns share the available width and let
        // the long text columns truncate, so the table fits Builder's panel
        // instead of forcing a horizontal scrollbar. The modest min-width only
        // kicks in on very narrow panels.
        <div className="overflow-x-auto rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)]">
          <table className="w-full min-w-[600px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[23%]" />
              <col className="w-[23%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[44px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[var(--border-glass)]">
                <TH>Page</TH>
                <TH>SEO Title</TH>
                <TH>Description</TH>
                <TH>Type / Status</TH>
                <TH>Sitemap</TH>
                <TH>&nbsp;</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((audit, i) => (
                <PageRow key={audit.id || `page-${i}`} audit={audit} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeoPageList;
