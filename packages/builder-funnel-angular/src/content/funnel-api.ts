import type {
  BuilderFunnelOfferContent,
  BuilderFunnelContent,
  BuilderFunnelDestinationContent,
  BuilderFunnelSplitTestContent,
  BuilderFunnelPageContent,
  FunnelPricingTier,
  FunnelStep,
} from '@goldenhippo/builder-funnel-schemas';
import type { ContentQueryOptions } from './types';
import { fetchOneEntry, fetchAllEntries } from './fetch';

// ---------------------------------------------------------------------------
// Model name constants
// ---------------------------------------------------------------------------

/** Builder.io model names for funnel content */
export const FUNNEL_MODELS = {
  OFFER: 'funnel-offer',
  FUNNEL: 'funnel',
  DESTINATION: 'funnel-destination',
  SPLIT_TEST: 'funnel-split-test',
  FUNNEL_PAGE: 'funnel-page',
  PRODUCT: 'product',
  PRODUCT_CATEGORY: 'product-category',
  PRODUCT_TAG: 'product-tag',
  PRODUCT_INGREDIENT: 'product-ingredient',
  PRODUCT_USE_CASE: 'product-use-case',
} as const;

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/** Result of resolving a destination or split test to a specific funnel */
export interface ResolvedFunnel {
  /** The resolved funnel content entry */
  funnel: BuilderFunnelContent;
  /** Builder entry ID of the resolved offer */
  offerId: string;
  /** Builder entry ID of the resolved funnel */
  funnelId: string;
  /** Builder entry ID of the active split test (if resolution went through a split test) */
  splitTestId?: string;
}

/** Pricing tier with computed per-unit prices and savings */
export interface ResolvedPricingTier extends FunnelPricingTier {
  /** Price per unit (standardPrice / quantity) */
  unitPrice: number;
  /** Percentage saved vs the single-unit tier (0 for the base tier) */
  savingsPercent: number;
  /** Subscription price per unit, if subscription is available */
  subscriptionUnitPrice?: number;
}

// ---------------------------------------------------------------------------
// Offer lookups
// ---------------------------------------------------------------------------

/** Fetch a funnel offer by its Builder.io entry ID */
export function getOfferById(id: string, options?: ContentQueryOptions): Promise<BuilderFunnelOfferContent | null> {
  return fetchOneEntry<BuilderFunnelOfferContent>(FUNNEL_MODELS.OFFER, {
    ...options,
    query: { ...options?.query, id },
  });
}

/** Fetch a funnel offer by its GEP slug (data.gh.slug) */
export function getOfferBySlug(slug: string, options?: ContentQueryOptions): Promise<BuilderFunnelOfferContent | null> {
  return fetchOneEntry<BuilderFunnelOfferContent>(FUNNEL_MODELS.OFFER, {
    ...options,
    query: { ...options?.query, 'data.gh.slug': slug },
  });
}

/** Fetch the default offer (the one with isDefaultOffer: true) */
export function getDefaultOffer(options?: ContentQueryOptions): Promise<BuilderFunnelOfferContent | null> {
  return fetchOneEntry<BuilderFunnelOfferContent>(FUNNEL_MODELS.OFFER, {
    ...options,
    query: { ...options?.query, 'data.isDefaultOffer': true },
  });
}

// ---------------------------------------------------------------------------
// Funnel lookups
// ---------------------------------------------------------------------------

/** Fetch a funnel by its Builder.io entry ID */
export function getFunnelById(id: string, options?: ContentQueryOptions): Promise<BuilderFunnelContent | null> {
  return fetchOneEntry<BuilderFunnelContent>(FUNNEL_MODELS.FUNNEL, {
    ...options,
    query: { ...options?.query, id },
  });
}

/**
 * Fetch a funnel by Builder ID or GEP slug.
 * Tries ID lookup first, then falls back to data.gh.slug.
 * Use for `/fp/[idOrSlug]` route resolution.
 */
export async function getFunnelByIdOrGEP(
  idOrSlug: string,
  options?: ContentQueryOptions,
): Promise<BuilderFunnelContent | null> {
  const byId = await getFunnelById(idOrSlug, options);
  if (byId) return byId;

  return fetchOneEntry<BuilderFunnelContent>(FUNNEL_MODELS.FUNNEL, {
    ...options,
    query: { ...options?.query, 'data.gh.slug': idOrSlug },
  });
}

// ---------------------------------------------------------------------------
// Destination lookups
// ---------------------------------------------------------------------------

/** Fetch a destination by its URL slug (data.slug). Use for `/d/[slug]` route resolution. */
export function getDestinationBySlug(
  slug: string,
  options?: ContentQueryOptions,
): Promise<BuilderFunnelDestinationContent | null> {
  return fetchOneEntry<BuilderFunnelDestinationContent>(FUNNEL_MODELS.DESTINATION, {
    ...options,
    query: { ...options?.query, 'data.slug': slug },
  });
}

// ---------------------------------------------------------------------------
// Page lookups
// ---------------------------------------------------------------------------

/**
 * Fetch a funnel page by URL path.
 * Uses Builder.io's `userAttributes.urlPath` targeting to match the page.
 */
export function getFunnelPage(
  urlPath: string,
  options?: ContentQueryOptions,
): Promise<BuilderFunnelPageContent | null> {
  return fetchOneEntry<BuilderFunnelPageContent>(FUNNEL_MODELS.FUNNEL_PAGE, {
    ...options,
    userAttributes: { urlPath, ...options?.userAttributes },
  });
}

// ---------------------------------------------------------------------------
// Funnel resolution — destination → funnel
// ---------------------------------------------------------------------------

/**
 * Resolve which funnel to serve for a destination.
 *
 * If the destination has an active split test (enriched), selects a random
 * variant. Otherwise falls back to the primary funnel. The resolved funnel
 * is fetched by ID so the caller always gets the full enriched content.
 *
 * **Important:** The caller is responsible for persisting the result (e.g., in
 * a cookie keyed by `${destinationSlug}:${splitTestId}`) so the same user
 * sees the same variant within a session.
 *
 * @param destination - An enriched `BuilderFunnelDestinationContent` (fetch with enrich=true)
 * @param options - Additional query options for the funnel fetch
 */
export async function getFunnelFromDestination(
  destination: BuilderFunnelDestinationContent,
  options?: ContentQueryOptions,
): Promise<ResolvedFunnel | null> {
  const d = destination.data;
  if (!d) return null;

  const offerId = (d.offer as any)?.id;
  if (!offerId) return null;

  // Check for an active split test with enriched variant data
  const splitTest = d.activeSplitTest as any;
  const splitTestId: string | undefined = splitTest?.id;
  const variants: any[] | undefined = splitTest?.data?.variants;

  if (splitTestId && variants && variants.length > 0) {
    const idx = Math.floor(Math.random() * variants.length);
    const funnelId: string | undefined = variants[idx]?.funnel?.id;
    if (funnelId) {
      const funnel = await getFunnelById(funnelId, options);
      if (funnel) return { funnel, offerId, funnelId, splitTestId };
    }
  }

  // Fall back to primary funnel
  const funnelId = (d.primaryFunnel as any)?.id;
  if (!funnelId) return null;

  const funnel = await getFunnelById(funnelId, options);
  if (!funnel) return null;

  return { funnel, offerId, funnelId };
}

// ---------------------------------------------------------------------------
// Funnel resolution — split test → funnel
// ---------------------------------------------------------------------------

/**
 * Resolve a funnel from a split test.
 * Fetches the split test by ID (enriched), picks a random variant, then
 * fetches and returns the resolved funnel. Same randomization logic as
 * `getFunnelFromDestination` — use when you already know the split test ID.
 *
 * @param splitTestId - Builder entry ID of the split test
 * @param options - Additional query options
 */
export async function getFunnelFromSplitTest(
  splitTestId: string,
  options?: ContentQueryOptions,
): Promise<BuilderFunnelContent | null> {
  const splitTest = await fetchOneEntry<BuilderFunnelSplitTestContent>(FUNNEL_MODELS.SPLIT_TEST, {
    ...options,
    query: { ...options?.query, id: splitTestId },
    enrich: true,
  });

  const variants = splitTest?.data?.variants;
  if (!variants || variants.length === 0) return null;

  const idx = Math.floor(Math.random() * variants.length);
  const funnelId = (variants[idx]?.funnel as any)?.id;
  if (!funnelId) return null;

  return getFunnelById(funnelId, options);
}

// ---------------------------------------------------------------------------
// Pricing utilities
// ---------------------------------------------------------------------------

/**
 * Extract and enrich pricing tiers from a funnel.
 * Returns tiers sorted by quantity (ascending) with computed per-unit prices
 * and savings percentages relative to the single-unit tier.
 */
export function getPricingFromFunnel(funnel: BuilderFunnelContent): ResolvedPricingTier[] {
  const tiers = funnel?.data?.pricing;
  if (!tiers || tiers.length === 0) return [];

  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
  const baseUnitPrice = sorted[0].quantity > 0 ? sorted[0].standardPrice / sorted[0].quantity : 0;

  return sorted.map((tier) => {
    const unitPrice = tier.quantity > 0 ? tier.standardPrice / tier.quantity : tier.standardPrice;
    const savingsPercent = baseUnitPrice > 0 ? Math.round((1 - unitPrice / baseUnitPrice) * 100) : 0;
    const subscriptionUnitPrice =
      tier.subscriptionPrice != null && tier.quantity > 0 ? tier.subscriptionPrice / tier.quantity : undefined;

    return { ...tier, unitPrice, savingsPercent, subscriptionUnitPrice };
  });
}

/** Find the tier marked as "Most Popular", or undefined if none */
export function getMostPopularTier(pricing: FunnelPricingTier[]): FunnelPricingTier | undefined {
  return pricing.find((tier) => tier.isMostPopular);
}

// ---------------------------------------------------------------------------
// Step utilities
// ---------------------------------------------------------------------------

/** Extract the ordered step sequence from a funnel */
export function getStepsFromFunnel(funnel: BuilderFunnelContent): FunnelStep[] {
  return funnel?.data?.steps ?? [];
}
