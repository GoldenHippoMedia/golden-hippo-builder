import React from 'react';
import {
  DESC_MAX,
  DESC_MIN,
  TITLE_MAX,
  canonicalPointsElsewhere,
  descriptionSeverity,
  titleSeverity,
  type PageAudit,
  type RobotsMeta,
  type Severity,
} from '../seo-page';

const SEVERITY_TEXT: Record<Severity, string> = {
  ok: 'text-[var(--success)]',
  warning: 'text-[var(--warning)]',
  error: 'text-[var(--error)]',
};

const ROBOTS_LABELS: { key: keyof RobotsMeta; label: string }[] = [
  { key: 'noIndex', label: 'No Index' },
  { key: 'noFollow', label: 'No Follow' },
  { key: 'noArchive', label: 'No Archive' },
  { key: 'noImageIndex', label: 'No Image Index' },
  { key: 'noSnippet', label: 'No Snippet' },
];

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className,
}) => (
  <div className={className}>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
    <div className="mt-1 text-[13px] text-[var(--text-primary)]">{children}</div>
  </div>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="italic text-[var(--text-muted)]">{children}</span>
);

const SeoPageDetail: React.FC<{ audit: PageAudit }> = ({ audit }) => {
  const titleSev = titleSeverity(audit.seoTitle);
  const descSev = descriptionSeverity(audit.description);
  const search = audit.search;
  const hasSearch = Boolean(search.title || search.description || search.content || search.hide);
  const showBlog = audit.pageType === 'Blog';
  const hasBlogFallback = Boolean(audit.blogSnippet || audit.blogThumbnail);

  return (
    <div className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)]/40 p-4">
      {/* Issues / info */}
      {audit.robots.noIndex ? (
        <div className="mb-4">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Info</div>
          <div className="mb-1.5 text-[12px] text-[var(--text-muted)]">
            Noindexed — intentionally excluded from search, so these meta gaps are informational, not issues.
          </div>
          {audit.infoNotes.length === 0 ? (
            <div className="text-[13px] text-[var(--text-secondary)]">No meta gaps.</div>
          ) : (
            <ul className="flex flex-col gap-1">
              {audit.infoNotes.map((note) => (
                <li key={note} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--text-muted)]" />
                  {note}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Issues
          </div>
          {audit.issues.length === 0 ? (
            <div className="text-[13px] font-medium text-[var(--success)]">✓ No SEO issues found</div>
          ) : (
            <ul className="flex flex-col gap-1">
              {audit.issues.map((issue) => (
                <li key={issue} className="flex items-center gap-2 text-[13px] text-[var(--warning)]">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--warning)]" />
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* SEO title */}
        <Field label="SEO Title">
          {audit.seoTitle ? (
            <>
              <div className="break-words">{audit.seoTitle}</div>
              <div className={`mt-0.5 text-[11px] tabular-nums ${SEVERITY_TEXT[titleSev]}`}>
                {audit.seoTitle.length} chars · recommended ≤ {TITLE_MAX}
                {audit.titleIsFallback ? ' · falling back to page title' : ''}
              </div>
            </>
          ) : (
            <Empty>Missing — no SEO Page Title or Title</Empty>
          )}
        </Field>

        {/* SEO description */}
        <Field label="SEO Description">
          {audit.description ? (
            <>
              <div className="break-words">{audit.description}</div>
              <div className={`mt-0.5 text-[11px] tabular-nums ${SEVERITY_TEXT[descSev]}`}>
                {audit.description.length} chars · recommended {DESC_MIN}–{DESC_MAX}
              </div>
            </>
          ) : (
            <Empty>Missing</Empty>
          )}
        </Field>

        {/* Canonical */}
        <Field label="Canonical URL">
          {audit.canonical ? (
            <>
              <a
                href={audit.canonical}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-[12px] text-[var(--accent)] hover:underline"
              >
                {audit.canonical}
              </a>
              {canonicalPointsElsewhere(audit) && (
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  Points to a different URL than this page — intentional consolidation, or a mistake?
                </div>
              )}
            </>
          ) : (
            <Empty>Inherited — uses the page URL</Empty>
          )}
        </Field>

        {/* SEO image */}
        <Field label="Social / SEO Image">
          {audit.seoImage ? (
            <a href={audit.seoImage} target="_blank" rel="noopener noreferrer" title="Open full image">
              <img
                src={audit.seoImage}
                alt={`${audit.name} social image`}
                className="h-20 w-auto max-w-full rounded-md border border-[var(--border-glass)] bg-white object-contain"
              />
            </a>
          ) : (
            <Empty>None{showBlog && audit.blogThumbnail ? ' — blog thumbnail used as fallback' : ''}</Empty>
          )}
        </Field>
      </div>

      {/* Robots */}
      <Field label="Robots Meta" className="mt-4">
        <div className="flex flex-wrap gap-1.5">
          {ROBOTS_LABELS.map(({ key, label }) => {
            const on = Boolean(audit.robots[key]);
            return (
              <span
                key={key}
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                  on
                    ? 'border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]'
                    : 'border-[var(--border-glass)] text-[var(--text-muted)]'
                }`}
              >
                {label}: {on ? 'on' : 'off'}
              </span>
            );
          })}
        </div>
      </Field>

      {/* Internal site search */}
      <Field label="Site Search" className="mt-4">
        {hasSearch ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <span className="text-[var(--text-muted)]">Title: </span>
              {search.title || <Empty>uses SEO/page title</Empty>}
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Hidden from search: </span>
              {search.hide ? <span className="text-[var(--warning)]">Yes</span> : 'No'}
            </div>
            <div className="md:col-span-2">
              <span className="text-[var(--text-muted)]">Description: </span>
              {search.description || <Empty>uses SEO description</Empty>}
            </div>
            {search.content && (
              <div className="md:col-span-2">
                <span className="text-[var(--text-muted)]">Keywords: </span>
                {search.content}
              </div>
            )}
          </div>
        ) : (
          <Empty>Not configured — this page won&apos;t appear in site search unless SEO fields are set</Empty>
        )}
      </Field>

      {/* Blog fallbacks (only relevant for blog / blog-category pages) */}
      {showBlog && (
        <Field label="Blog Meta Fallbacks" className="mt-4">
          {hasBlogFallback ? (
            <div className="flex items-start gap-4">
              {audit.blogThumbnail && (
                <img
                  src={audit.blogThumbnail}
                  alt="Blog thumbnail"
                  className="h-16 w-16 flex-shrink-0 rounded-md border border-[var(--border-glass)] bg-white object-cover"
                />
              )}
              <div className="min-w-0">
                {audit.blogSnippet ? (
                  <span className="break-words">{audit.blogSnippet}</span>
                ) : (
                  <Empty>No snippet</Empty>
                )}
                <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Snippet falls back to the meta description; thumbnail falls back to the social image.
                </div>
              </div>
            </div>
          ) : (
            <Empty>No blog snippet or thumbnail set</Empty>
          )}
        </Field>
      )}
    </div>
  );
};

export default SeoPageDetail;
