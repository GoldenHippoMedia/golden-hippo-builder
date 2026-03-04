import { BuilderFunnelPageContent } from '../page';

/**
 * Extracts the funnel ID from a funnel-page content entry.
 *
 * Works with both enriched and non-enriched content — only needs the
 * reference `id` on the `funnel` field.
 *
 * @param page - A `BuilderFunnelPageContent` entry (enriched or not).
 * @returns The funnel ID, or `undefined` if the page has no funnel reference.
 */
export function getFunnelProductionIdFromPage(page: BuilderFunnelPageContent): string | undefined {
  return page.data?.funnel?.value.data?.productionId;
}

/**
 * Extracts the funnel slug from a funnel-page content entry.
 *
 * Works with both enriched and non-enriched content — only needs the
 * reference `id` on the `funnel` field.
 *
 * @param page - A `BuilderFunnelPageContent` entry (enriched or not).
 * @returns The funnel ID, or `undefined` if the page has no funnel reference.
 */
export function getFunnelSlugFromPage(page: BuilderFunnelPageContent): string | undefined {
  return page.data?.funnel?.value.data?.slug;
}
