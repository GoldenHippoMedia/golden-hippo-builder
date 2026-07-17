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
  issues: string[];
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

  const published = (page as { published?: string }).published === 'published';
  const inSitemap = published && !robots.noIndex;

  const issues: string[] = [];
  if (!seoTitle) {
    issues.push('Missing SEO title');
  } else if (seoTitle.length > TITLE_MAX) {
    issues.push(`SEO title long (${seoTitle.length} chars)`);
  }
  if (!description) {
    issues.push('Missing SEO description');
  } else if (description.length > DESC_MAX) {
    issues.push(`Description long (${description.length} chars)`);
  } else if (description.length < DESC_MIN) {
    issues.push(`Description short (${description.length} chars)`);
  }
  if (!seoImage) {
    issues.push('No social image');
  }

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
  missingDescription: audits.filter((a) => !a.description).length,
  excluded: audits.filter((a) => !a.inSitemap).length,
});
