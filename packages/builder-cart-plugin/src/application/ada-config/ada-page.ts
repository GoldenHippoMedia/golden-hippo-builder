import type { BuilderPageContent } from '@goldenhippo/builder-cart-schemas';
import { collectHeadings, collectImages, collectLinkLabels, str, type BuilderBlock } from './blocks';

// A page entry as returned by Builder.io, fetched WITH its visual block tree
// (`data.blocks`) so the audit can inspect on-page content, not just meta.
export type PageEntry = BuilderPageContent;

export type Severity = 'ok' | 'warning' | 'error';

// Link text that tells a screen-reader user nothing about the destination.
// WCAG 2.4.4 (Link Purpose) — these read as "link, click here" out of context.
const GENERIC_LINK_TEXT = new Set([
  'click here',
  'click',
  'here',
  'read more',
  'more',
  'learn more',
  'this',
  'this link',
  'link',
  'go',
  'details',
]);

export interface AdaFinding {
  severity: 'error' | 'warning';
  /** Stable machine code (e.g. "img-missing-alt") for grouping/filtering. */
  code: string;
  message: string;
}

export interface AdaAudit {
  id: string;
  name: string;
  /** The page's URL path (e.g. "/about"). */
  path: string;
  pageType: string;
  published: boolean;
  /** Total on-page images found in the block tree (Image blocks + inline <img>). */
  imageCount: number;
  /** Images with no usable alt text. */
  imagesMissingAlt: number;
  /** Number of headings (h1–h6) found on the page. */
  headingCount: number;
  /** Blocking accessibility defects (missing alt text, etc.). */
  issues: AdaFinding[];
  /** Best-practice warnings (heading order, generic link text, etc.). */
  warnings: AdaFinding[];
  /** True when blocks were present to audit — empty pages can't be assessed. */
  hasContent: boolean;
}

/**
 * Extract a page's URL path. Builder stores the path either directly on
 * `data.url` or as a `urlPath` targeting query — cover both.
 */
export const getPagePath = (page: PageEntry): string => {
  const data = page.data as { url?: string } | undefined;
  if (typeof data?.url === 'string' && data.url) return data.url;

  const query = (page as { query?: { property?: string; value?: unknown }[] }).query ?? [];
  const urlItem = query.find((q) => q?.property === 'urlPath');
  const value = urlItem?.value;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : '';
  return typeof value === 'string' ? value : '';
};

/**
 * A Builder page is "expired" when it has a scheduled end date in the past.
 * These are never relevant to an audit, so they're excluded outright.
 */
export const isExpired = (page: PageEntry): boolean => {
  const endDate = (page as { endDate?: number }).endDate;
  return typeof endDate === 'number' && endDate > 0 && endDate < Date.now();
};

// Coarse buckets for the top-level page-type filter, mirroring the SEO tab.
export type PageCategory = 'Product' | 'Blog' | 'Other';

export const pageCategory = (pageType: string): PageCategory => {
  if (pageType === 'Product') return 'Product';
  if (pageType === 'Blog') return 'Blog';
  return 'Other';
};

// Find the first place the outline jumps more than one level deeper than the
// previous heading (e.g. H2 directly to H4). Returns null when the order is fine.
const firstSkippedLevel = (levels: number[]): { from: number; to: number } | null => {
  let prev = 0;
  for (const level of levels) {
    if (prev !== 0 && level > prev + 1) return { from: prev, to: level };
    prev = level;
  }
  return null;
};

/**
 * Reduce a raw page entry to the accessibility facts we surface, and run the
 * checks that drive the dashboard's issues and warnings.
 */
export const auditPage = (page: PageEntry): AdaAudit => {
  const data = (page.data ?? {}) as { pageType?: string; blocks?: BuilderBlock[] };
  const blocks = Array.isArray(data.blocks) ? data.blocks : undefined;
  const hasContent = blocks !== undefined && blocks.length > 0;

  const images = collectImages(blocks);
  const imagesMissingAlt = images.filter((img) => !img.alt).length;
  const headings = collectHeadings(blocks);
  const headingLevels = headings.map((h) => h.level);
  const emptyHeadings = headings.filter((h) => !h.text).length;
  const linkLabels = collectLinkLabels(blocks);

  const issues: AdaFinding[] = [];
  const warnings: AdaFinding[] = [];

  // WCAG 1.1.1 — non-text content needs a text alternative. Missing alt text is
  // the highest-impact, most common defect, so it's a blocking issue.
  if (imagesMissingAlt > 0) {
    issues.push({
      severity: 'error',
      code: 'img-missing-alt',
      message: `${imagesMissingAlt} of ${images.length} image${images.length === 1 ? '' : 's'} missing alt text`,
    });
  }

  // WCAG 1.3.1 / 2.4.6 — heading structure. Only meaningful on pages that have
  // content to structure.
  const h1Count = headingLevels.filter((l) => l === 1).length;
  if (hasContent && headingLevels.length === 0) {
    warnings.push({ severity: 'warning', code: 'no-headings', message: 'No headings on the page' });
  } else if (h1Count === 0 && headingLevels.length > 0) {
    warnings.push({ severity: 'warning', code: 'no-h1', message: 'No H1 heading on the page' });
  }
  if (h1Count > 1) {
    warnings.push({ severity: 'warning', code: 'multiple-h1', message: `Multiple H1 headings (${h1Count})` });
  }
  const skip = firstSkippedLevel(headingLevels);
  if (skip) {
    warnings.push({
      severity: 'warning',
      code: 'heading-skip',
      message: `Heading level skipped (H${skip.from} → H${skip.to})`,
    });
  }
  if (emptyHeadings > 0) {
    warnings.push({
      severity: 'warning',
      code: 'empty-heading',
      message: `${emptyHeadings} empty heading${emptyHeadings === 1 ? '' : 's'}`,
    });
  }

  // WCAG 2.4.4 — link purpose. Generic ("click here") or empty link/button text
  // is meaningless out of context.
  const genericLinks = Array.from(
    new Set(linkLabels.filter((l) => l && GENERIC_LINK_TEXT.has(l.toLowerCase())).map((l) => l.toLowerCase())),
  );
  const emptyLinks = linkLabels.filter((l) => !l).length;
  if (genericLinks.length > 0) {
    warnings.push({
      severity: 'warning',
      code: 'generic-link',
      message: `Generic link text: ${genericLinks.map((t) => `"${t}"`).join(', ')}`,
    });
  }
  if (emptyLinks > 0) {
    warnings.push({
      severity: 'warning',
      code: 'empty-link',
      message: `${emptyLinks} link/button${emptyLinks === 1 ? '' : 's'} with no text`,
    });
  }

  return {
    id: (page as { id?: string }).id ?? '',
    name: (page as { name?: string }).name ?? '(untitled page)',
    path: getPagePath(page),
    pageType: str(data.pageType) || 'General',
    published: (page as { published?: string }).published === 'published',
    imageCount: images.length,
    imagesMissingAlt,
    headingCount: headingLevels.length,
    issues,
    warnings,
    hasContent,
  };
};

// ---------------------------------------------------------------------------
// Severity + summary
// ---------------------------------------------------------------------------

/** Overall row severity: error if any hard issue, warning if only warnings. */
export const auditSeverity = (audit: AdaAudit): Severity => {
  if (audit.issues.length > 0) return 'error';
  if (audit.warnings.length > 0) return 'warning';
  return 'ok';
};

export interface AdaSummary {
  total: number;
  clean: number;
  withIssues: number;
  imagesMissingAlt: number;
}

export const summarize = (audits: AdaAudit[]): AdaSummary => ({
  total: audits.length,
  clean: audits.filter((a) => a.issues.length === 0 && a.warnings.length === 0).length,
  withIssues: audits.filter((a) => a.issues.length > 0).length,
  imagesMissingAlt: audits.reduce((sum, a) => sum + a.imagesMissingAlt, 0),
});
