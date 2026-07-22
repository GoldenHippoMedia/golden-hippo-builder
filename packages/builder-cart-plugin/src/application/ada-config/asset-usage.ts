import { collectImages } from './blocks';
import { getPagePath, type PageEntry } from './ada-page';
import type { BuilderBlock } from './blocks';

// The per-asset view groups every on-page image placement by its source asset
// URL. Because Builder does NOT expose an asset's stored alt text through any
// API, we can't read "the CDN value" directly — instead we treat the alt text
// observed across a given asset's placements as the source of truth. That lets
// us surface the "set before/after placement" caveat: when the same image has
// alt text on some pages but not others, the missing ones can reuse it.

/** One placement of an asset on a specific page. */
export interface AssetPlacement {
  pageId: string;
  pageName: string;
  pagePath: string;
  /** Alt text on this placement (empty when missing). */
  alt: string;
}

export interface AssetUsage {
  /** Normalized asset URL — the grouping key and a usable thumbnail source. */
  url: string;
  /** Best-effort filename derived from the URL, for display. */
  name: string;
  /** Every placement of this asset across all pages. */
  placements: AssetPlacement[];
  /** Placements with no alt text. */
  missingAltCount: number;
  /** Distinct non-empty alt texts seen for this asset, most-used first. */
  altsSeen: string[];
  /**
   * True when some placements lack alt text AND at least one placement has it —
   * i.e. the caveat: the alt exists and just needs re-applying to the others.
   */
  hasReusableAlt: boolean;
}

// Builder image URLs carry transform query params (?width=…&format=…) that vary
// per placement but don't change asset identity. Strip the query and any
// trailing slash so every placement of one asset collapses to a single key.
export const normalizeAssetUrl = (url: string): string => url.split('?')[0].replace(/\/+$/, '');

const fileName = (url: string): string => {
  const last = normalizeAssetUrl(url).split('/').pop() ?? '';
  try {
    return decodeURIComponent(last) || url;
  } catch {
    return last || url;
  }
};

interface Bucket {
  url: string;
  placements: AssetPlacement[];
  altCounts: Map<string, number>;
}

/**
 * Group every image placement across all pages by its source asset. Expired
 * pages are excluded (handled by the caller's page list, but guarded here too
 * would require isExpired — kept simple: the caller passes the pages to use).
 */
export const buildAssetUsage = (pages: PageEntry[]): AssetUsage[] => {
  const buckets = new Map<string, Bucket>();

  for (const page of pages) {
    const data = (page.data ?? {}) as { blocks?: BuilderBlock[] };
    const blocks = Array.isArray(data.blocks) ? data.blocks : undefined;
    const images = collectImages(blocks);
    if (images.length === 0) continue;

    const pageId = (page as { id?: string }).id ?? '';
    const pageName = (page as { name?: string }).name ?? '(untitled page)';
    const pagePath = getPagePath(page);

    for (const img of images) {
      const key = normalizeAssetUrl(img.url);
      if (!key) continue;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { url: key, placements: [], altCounts: new Map() };
        buckets.set(key, bucket);
      }
      bucket.placements.push({ pageId, pageName, pagePath, alt: img.alt });
      if (img.alt) bucket.altCounts.set(img.alt, (bucket.altCounts.get(img.alt) ?? 0) + 1);
    }
  }

  const usages: AssetUsage[] = [];
  for (const bucket of buckets.values()) {
    const missingAltCount = bucket.placements.filter((p) => !p.alt).length;
    const altsSeen = Array.from(bucket.altCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([alt]) => alt);
    usages.push({
      url: bucket.url,
      name: fileName(bucket.url),
      placements: bucket.placements,
      missingAltCount,
      altsSeen,
      hasReusableAlt: missingAltCount > 0 && altsSeen.length > 0,
    });
  }

  // Worst first: reusable-alt quick wins, then most placements missing alt.
  return usages.sort(
    (a, b) =>
      Number(b.hasReusableAlt) - Number(a.hasReusableAlt) ||
      b.missingAltCount - a.missingAltCount ||
      b.placements.length - a.placements.length ||
      a.name.localeCompare(b.name),
  );
};

export interface AssetUsageSummary {
  totalAssets: number;
  assetsWithMissingAlt: number;
  totalPlacements: number;
  placementsMissingAlt: number;
  /** Assets where alt exists on some placements but not others (quick wins). */
  reusableAltAssets: number;
}

export const summarizeAssets = (usages: AssetUsage[]): AssetUsageSummary => ({
  totalAssets: usages.length,
  assetsWithMissingAlt: usages.filter((u) => u.missingAltCount > 0).length,
  totalPlacements: usages.reduce((sum, u) => sum + u.placements.length, 0),
  placementsMissingAlt: usages.reduce((sum, u) => sum + u.missingAltCount, 0),
  reusableAltAssets: usages.filter((u) => u.hasReusableAlt).length,
});
