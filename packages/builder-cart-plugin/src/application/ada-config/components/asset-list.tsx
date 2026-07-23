import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState, StatGridCard, StatGridContainer, StatusBadge } from '@goldenhippo/builder-ui';
import { builderContentUrl } from '../../product-config/builder-urls';
import { buildAssetUsage, summarizeAssets, type AssetUsage } from '../asset-usage';
import { isExpired, type PageEntry } from '../ada-page';

interface AssetListProps {
  pages: PageEntry[];
}

type AltFilter = 'all' | 'missing' | 'reusable';

const ALT_OPTIONS: { value: AltFilter; label: string }[] = [
  { value: 'all', label: 'All images' },
  { value: 'missing', label: 'Missing alt' },
  { value: 'reusable', label: 'Quick wins' },
];

const normalize = (v: string): string => v.toLowerCase().replace(/[^a-z0-9/.]/g, '');

// Builder CDN images accept transform params; request a small webp thumbnail.
const thumb = (url: string): string => (url.includes('cdn.builder.io') ? `${url}?width=96&format=webp` : url);

const AssetDetail: React.FC<{ asset: AssetUsage }> = ({ asset }) => {
  const missing = asset.placements.filter((p) => !p.alt);
  const withAlt = asset.placements.filter((p) => p.alt);

  return (
    <div className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)]/40 p-4">
      {asset.hasReusableAlt && (
        <div className="mb-4 rounded-md border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-[12px] text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--accent)]">Quick win:</span> this image already has alt text on
          other placements — reuse it on the {missing.length} missing one{missing.length === 1 ? '' : 's'}. Builder does
          not copy alt text to images placed before it was set, so these must be re-applied on each page.
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {asset.altsSeen.map((alt) => (
              <span
                key={alt}
                className="inline-flex items-center rounded-md border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-1.5 py-0.5 text-[11px] text-[var(--accent)]"
                title={alt}
              >
                “{alt}”
              </span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="mb-4">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Placements missing alt text ({missing.length})
          </div>
          <ul className="flex flex-col gap-1">
            {missing.map((p, i) => (
              <li key={`${p.pageId}-${i}`} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-[var(--error)]">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--error)]" />
                  <span className="truncate" title={`${p.pageName} — ${p.pagePath}`}>
                    {p.pageName} <span className="font-mono text-[11px] text-[var(--text-muted)]">{p.pagePath}</span>
                  </span>
                </span>
                {p.pageId && (
                  <a
                    href={builderContentUrl(p.pageId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-[11px] text-[var(--accent)] hover:underline"
                  >
                    Open ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {withAlt.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Placements with alt text ({withAlt.length})
          </div>
          <ul className="flex flex-col gap-1">
            {withAlt.map((p, i) => (
              <li key={`${p.pageId}-${i}`} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-[var(--text-secondary)]">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--success)]" />
                  <span className="truncate" title={`${p.pageName} — “${p.alt}”`}>
                    {p.pageName} <span className="text-[var(--text-muted)]">— “{p.alt}”</span>
                  </span>
                </span>
                {p.pageId && (
                  <a
                    href={builderContentUrl(p.pageId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-[11px] text-[var(--accent)] hover:underline"
                  >
                    Open ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const AssetRow: React.FC<{ asset: AssetUsage; expanded: boolean; onToggle: () => void }> = ({
  asset,
  expanded,
  onToggle,
}) => {
  const allMissing = asset.missingAltCount === asset.placements.length;

  return (
    <tr
      onClick={onToggle}
      aria-expanded={expanded}
      title={expanded ? 'Hide placements' : 'Show placements'}
      className={`cursor-pointer border-b border-[var(--border-glass)] align-top last:border-0 hover:bg-[var(--bg-glass-hover)] ${
        expanded ? 'bg-[var(--bg-glass-hover)]' : ''
      }`}
    >
      {/* Image */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <span className="mt-0.5 flex-shrink-0 text-[var(--text-muted)]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
          <img
            src={thumb(asset.url)}
            alt=""
            className="h-10 w-10 flex-shrink-0 rounded border border-[var(--border-glass)] bg-white object-cover"
          />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-[var(--text-primary)]" title={asset.name}>
              {asset.name}
            </div>
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="truncate font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)]"
              title={asset.url}
            >
              {asset.url}
            </a>
          </div>
        </div>
      </td>

      {/* Uses */}
      <td className="whitespace-nowrap px-3 py-3 text-[13px] tabular-nums text-[var(--text-secondary)]">
        {asset.placements.length}
      </td>

      {/* Missing alt */}
      <td className="whitespace-nowrap px-3 py-3">
        {asset.missingAltCount === 0 ? (
          <span className="text-[12px] text-[var(--success)]">none</span>
        ) : (
          <span className="text-[13px] font-medium tabular-nums text-[var(--error)]">
            {asset.missingAltCount}
            <span className="ml-1 text-[11px] font-normal text-[var(--text-muted)]">of {asset.placements.length}</span>
          </span>
        )}
      </td>

      {/* Status */}
      <td className="whitespace-nowrap px-3 py-3">
        {asset.hasReusableAlt ? (
          <StatusBadge status="neutral" label="Reuse available" />
        ) : asset.missingAltCount === 0 ? (
          <StatusBadge status="success" label="All have alt" />
        ) : allMissing ? (
          <StatusBadge status="warning" label="No alt anywhere" />
        ) : (
          <StatusBadge status="warning" label="Some missing" />
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

const AssetList: React.FC<AssetListProps> = ({ pages }) => {
  const [query, setQuery] = useState('');
  const [altFilter, setAltFilter] = useState<AltFilter>('all');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(0);

  const toggleExpanded = (key: string) => setExpandedKey((prev) => (prev === key ? null : key));

  const assets = useMemo(() => buildAssetUsage(pages.filter((p) => !isExpired(p))), [pages]);
  const summary = useMemo(() => summarizeAssets(assets), [assets]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return assets.filter((a) => {
      if (altFilter === 'missing' && a.missingAltCount === 0) return false;
      if (altFilter === 'reusable' && !a.hasReusableAlt) return false;
      if (!q) return true;
      return normalize(`${a.name} ${a.url}`).includes(q);
    });
  }, [assets, query, altFilter]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(pageIndex, pageCount - 1);
  const start = safePage * pageSize;
  const paged = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  useEffect(() => {
    setPageIndex(0);
  }, [query, altFilter, pageSize]);

  return (
    <div className="space-y-4">
      <StatGridContainer columns={4}>
        <StatGridCard title="Images In Use" metric={summary.totalAssets} subtitle="Distinct assets placed on pages" />
        <StatGridCard
          title="With Missing Alt"
          metric={summary.assetsWithMissingAlt}
          variant={summary.assetsWithMissingAlt > 0 ? 'warning' : 'success'}
          subtitle="Images lacking alt somewhere"
        />
        <StatGridCard
          title="Placements Missing Alt"
          metric={summary.placementsMissingAlt}
          variant={summary.placementsMissingAlt > 0 ? 'warning' : 'success'}
          subtitle={`of ${summary.totalPlacements} total placements`}
        />
        <StatGridCard
          title="Quick Wins"
          metric={summary.reusableAltAssets}
          variant={summary.reusableAltAssets > 0 ? 'neutral' : 'success'}
          subtitle="Alt exists elsewhere to reuse"
        />
      </StatGridContainer>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename or URL..."
          className="min-w-[240px] flex-1 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          {ALT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setAltFilter(o.value)}
              className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                altFilter === o.value
                  ? 'border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]'
                  : 'border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <span className="text-xs tabular-nums text-[var(--text-muted)]">
          {filtered.length} of {assets.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={
            assets.length === 0
              ? 'No images found in page content for this brand.'
              : 'No images match the current filter.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)]">
          <table className="w-full min-w-[600px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[52%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[var(--border-glass)]">
                <TH>Image</TH>
                <TH>Uses</TH>
                <TH>Missing Alt</TH>
                <TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {paged.map((asset) => {
                const expanded = expandedKey === asset.url;
                return (
                  <React.Fragment key={asset.url}>
                    <AssetRow asset={asset} expanded={expanded} onToggle={() => toggleExpanded(asset.url)} />
                    {expanded && (
                      <tr className="border-b border-[var(--border-glass)] bg-[var(--bg-glass-hover)] last:border-0">
                        <td colSpan={4} className="px-3 pb-4 pt-0">
                          <AssetDetail asset={asset} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-2 py-1 text-xs text-[var(--text-secondary)] focus:outline-none"
            >
              {[25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <span className="tabular-nums text-[var(--text-muted)]">
            {start + 1}–{Math.min(start + pageSize, total)} of {total}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="cursor-pointer rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 font-medium transition-colors hover:bg-[var(--bg-glass-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <span className="tabular-nums text-[var(--text-muted)]">
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="cursor-pointer rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 font-medium transition-colors hover:bg-[var(--bg-glass-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;
