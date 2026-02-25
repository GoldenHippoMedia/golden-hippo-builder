import type {
  BuilderFunnelOfferContent,
  BuilderFunnelContent,
  BuilderFunnelDestinationContent,
  BuilderFunnelSplitTestContent,
  BuilderFunnelPageContent,
  BuilderProductContent,
} from '@goldenhippo/builder-funnel-schemas';
import type { BuilderContentEntry, ContentQueryOptions } from './types';
import { fetchContent, fetchOneContent, fetchAllContent } from './fetch';

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

// --- Funnel Offers ---

export function fetchFunnelOffers(
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelOfferContent>[]> {
  return fetchAllContent(FUNNEL_MODELS.OFFER, options);
}

export function fetchFunnelOffer(
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelOfferContent> | null> {
  return fetchOneContent(FUNNEL_MODELS.OFFER, options);
}

// --- Funnels ---

export function fetchFunnels(options?: ContentQueryOptions): Promise<BuilderContentEntry<BuilderFunnelContent>[]> {
  return fetchAllContent(FUNNEL_MODELS.FUNNEL, options);
}

export function fetchFunnel(options?: ContentQueryOptions): Promise<BuilderContentEntry<BuilderFunnelContent> | null> {
  return fetchOneContent(FUNNEL_MODELS.FUNNEL, options);
}

// --- Destinations ---

export function fetchFunnelDestinations(
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelDestinationContent>[]> {
  return fetchAllContent(FUNNEL_MODELS.DESTINATION, options);
}

export function fetchFunnelDestination(
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelDestinationContent> | null> {
  return fetchOneContent(FUNNEL_MODELS.DESTINATION, options);
}

// --- Split Tests ---

export function fetchFunnelSplitTests(
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelSplitTestContent>[]> {
  return fetchAllContent(FUNNEL_MODELS.SPLIT_TEST, options);
}

export function fetchFunnelSplitTest(
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelSplitTestContent> | null> {
  return fetchOneContent(FUNNEL_MODELS.SPLIT_TEST, options);
}

// --- Funnel Pages ---

export function fetchFunnelPages(
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelPageContent>[]> {
  return fetchContent(FUNNEL_MODELS.FUNNEL_PAGE, options);
}

/**
 * Fetch a funnel page by URL path.
 * Uses Builder.io's `userAttributes.urlPath` targeting to match the page.
 *
 * @param urlPath - The URL path to match (e.g., '/f/preview/my-page')
 * @param options - Additional query options
 */
export function fetchFunnelPage(
  urlPath: string,
  options?: ContentQueryOptions,
): Promise<BuilderContentEntry<BuilderFunnelPageContent> | null> {
  return fetchOneContent(FUNNEL_MODELS.FUNNEL_PAGE, {
    ...options,
    userAttributes: { urlPath, ...options?.userAttributes },
  });
}

// --- Products ---

export function fetchProducts(options?: ContentQueryOptions): Promise<BuilderContentEntry<BuilderProductContent>[]> {
  return fetchAllContent(FUNNEL_MODELS.PRODUCT, options);
}
