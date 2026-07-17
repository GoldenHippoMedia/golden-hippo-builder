import type { BuilderPageContent } from '@goldenhippo/builder-cart-schemas';

// A page entry as returned by Builder.io. BuilderPageContent is a discriminated
// union (General | PDP | Blog); every member shares the SEO fields in BasePageData,
// so `page.data?.heading` etc. resolve across the whole union.
export type PageEntry = BuilderPageContent;

// SEO best-practice character budgets. Titles over ~60 chars and descriptions
// outside ~120–160 chars get truncated in search results, so we flag them.
export const TITLE_MAX = 60;
export const DESC_MIN = 120;
export const DESC_MAX = 160;

export type Severity = 'ok' | 'warning' | 'error';

export interface RobotsMeta {
  noIndex?: boolean;
  noFollow?: boolean;
  noArchive?: boolean;
  noImageIndex?: boolean;
  noSnippet?: boolean;
}

export interface PageAudit {
  id: string;
  name: string;
  /** The page's URL path (e.g. "/about"), used to build the sitemap. */
  path: string;
  pageType: string;
  published: boolean;
  /** Resolved SEO title: heading override, else the page title. */
  seoTitle: string;
  /** True when we fell back to `title` because no SEO Page Title was set. */
  titleIsFallback: boolean;
  description: string;
  canonical: string;
  seoImage: string;
  robots: RobotsMeta;
  /** Published AND indexable — i.e. this page belongs in the sitemap. */
  inSitemap: boolean;
  /** Meta defects that count against SEO health (indexable pages only). */
  issues: string[];
  /** Same gaps, but on a noindexed page — informational, not defects. */
  infoNotes: string[];
  /** Internal site-search configuration (distinct from SEO/meta). */
  search: SearchConfig;
  /** Blog snippet — the model uses this as a meta-description fallback. */
  blogSnippet: string;
  /** Blog thumbnail — the model uses this as a social-image fallback. */
  blogThumbnail: string;
}

export interface SearchConfig {
  title: string;
  description: string;
  hide: boolean;
  content: string;
}

interface PageQueryItem {
  property?: string;
  value?: unknown;
}

// The SEO-relevant slice of a page's data, shared across every member of the
// BuilderPageContent union (BasePageData).
interface SeoData {
  title?: string;
  pageType?: string;
  heading?: string;
  canonicalURL?: string;
  description?: string;
  seoImage?: string;
  robotsMeta?: RobotsMeta;
  search?: { title?: string; description?: string; hide?: boolean; content?: string };
  blog?: { snippet?: string; thumbnail?: string };
}

/**
 * Extract a page's URL path. Builder stores the path either directly on
 * `data.url` or as a `urlPath` targeting query — cover both.
 */
export const getPagePath = (page: PageEntry): string => {
  const data = page.data as { url?: string } | undefined;
  if (typeof data?.url === 'string' && data.url) return data.url;

  const query = (page as { query?: PageQueryItem[] }).query ?? [];
  const urlItem = query.find((q) => q?.property === 'urlPath');
  const value = urlItem?.value;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : '';
  return typeof value === 'string' ? value : '';
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Reduce a raw page entry to the SEO facts we surface, and run the health
 * checks that drive the dashboard's warnings and summary stats.
 */
export const auditPage = (page: PageEntry): PageAudit => {
  const data = (page.data ?? {}) as SeoData;
  const heading = str(data.heading);
  const title = str(data.title);
  const seoTitle = heading || title;
  const description = str(data.description);
  const canonical = str(data.canonicalURL);
  const seoImage = str(data.seoImage);
  const robots: RobotsMeta = data.robotsMeta ?? {};
  const search = data.search ?? {};

  const published = (page as { published?: string }).published === 'published';
  const inSitemap = published && !robots.noIndex;

  // Run the meta-completeness checks the same way for every page, then route
  // them by intent: on a deliberately noindexed page these gaps are excluded
  // from search on purpose, so they're informational rather than defects.
  const checks: string[] = [];
  if (!seoTitle) {
    checks.push('Missing SEO title');
  } else if (seoTitle.length > TITLE_MAX) {
    checks.push(`SEO title long (${seoTitle.length} chars)`);
  }
  if (!description) {
    checks.push('Missing SEO description');
  } else if (description.length > DESC_MAX) {
    checks.push(`Description long (${description.length} chars)`);
  } else if (description.length < DESC_MIN) {
    checks.push(`Description short (${description.length} chars)`);
  }
  if (!seoImage) {
    checks.push('No social image');
  }
  const issues = robots.noIndex ? [] : checks;
  const infoNotes = robots.noIndex ? checks : [];

  return {
    id: (page as { id?: string }).id ?? '',
    name: (page as { name?: string }).name ?? '(untitled page)',
    path: getPagePath(page),
    pageType: str(data.pageType) || 'General',
    published,
    seoTitle,
    titleIsFallback: !heading && !!title,
    description,
    canonical,
    seoImage,
    robots,
    inSitemap,
    issues,
    infoNotes,
    search: {
      title: str(search.title),
      description: str(search.description),
      hide: !!search.hide,
      content: str(search.content),
    },
    blogSnippet: str(data.blog?.snippet),
    blogThumbnail: str(data.blog?.thumbnail),
  };
};

// Coarse buckets for the top-level page-type filter. Everything that isn't a
// product or blog page (General, and any future types) falls into "Other".
export type PageCategory = 'Product' | 'Blog' | 'Other';

// Some brands publish blog *category* pages as `General` (not `Blog`) — named
// like "Blog Category - Dairy" and/or served under a `/c/` slug. There's no
// structured flag for this, so we fall back to a name/path heuristic to group
// them with blogs. Tune these two constants if the match is too loose/tight.
export const BLOG_TITLE_PATTERN = /blog/i;
const BLOG_PATH_PREFIXES = ['/c/'];

type CategoryInput = Pick<PageAudit, 'pageType' | 'name' | 'seoTitle' | 'path'>;

/**
 * True when a `General` page looks like a blog category page by naming/URL
 * convention. Only ever reclassifies General pages — Product/Blog are trusted.
 */
export const looksLikeBlogCategory = (page: CategoryInput): boolean => {
  if (page.pageType !== 'General') return false;
  const path = page.path.toLowerCase();
  if (BLOG_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  return BLOG_TITLE_PATTERN.test(page.name) || BLOG_TITLE_PATTERN.test(page.seoTitle);
};

export const pageCategory = (page: CategoryInput): PageCategory => {
  if (page.pageType === 'Product') return 'Product';
  if (page.pageType === 'Blog') return 'Blog';
  if (looksLikeBlogCategory(page)) return 'Blog';
  return 'Other';
};

/** The active robots flags on a page, as short labels for chips. */
export const activeRobotsFlags = (robots: RobotsMeta): string[] => {
  const flags: string[] = [];
  if (robots.noIndex) flags.push('noindex');
  if (robots.noFollow) flags.push('nofollow');
  if (robots.noArchive) flags.push('noarchive');
  if (robots.noImageIndex) flags.push('noimageindex');
  if (robots.noSnippet) flags.push('nosnippet');
  return flags;
};

/** Severity of a description against the length budget (for the char badge). */
export const descriptionSeverity = (description: string): Severity => {
  if (!description) return 'error';
  if (description.length > DESC_MAX || description.length < DESC_MIN) return 'warning';
  return 'ok';
};

/** Severity of an SEO title against the length budget. */
export const titleSeverity = (seoTitle: string): Severity => {
  if (!seoTitle) return 'error';
  if (seoTitle.length > TITLE_MAX) return 'warning';
  return 'ok';
};

export interface SeoSummary {
  total: number;
  inSitemap: number;
  missingDescription: number;
  excluded: number;
}

export const summarize = (audits: PageAudit[]): SeoSummary => ({
  total: audits.length,
  inSitemap: audits.filter((a) => a.inSitemap).length,
  // Only counts pages where a description actually matters — noindexed pages are
  // intentionally excluded from search, matching the issue-flagging rule.
  missingDescription: audits.filter((a) => !a.description && !a.robots.noIndex).length,
  excluded: audits.filter((a) => !a.inSitemap).length,
});
