import { BuilderFunnelDestinationContent } from '../data/funnel-destination.model';

export interface DestinationConfig {
  /** The offer ID referenced by this destination */
  offerId: string;
  /** The resolved funnel ID (from split test variant or primary funnel) */
  funnelId: string;
  /** The active split test ID, if one is running */
  splitTestId?: string;
}

/**
 * Resolves the active configuration for a destination.
 *
 * If an active split test is present with variants, selects a funnel via
 * even randomization across variants. The caller is responsible for
 * persisting the result (e.g., in a cookie keyed by destination + split test ID)
 * to ensure the same user sees the same variant within a session.
 *
 * @param destination - An enriched `BuilderFunnelDestinationContent` from the Builder CDN.
 *   The `activeSplitTest` reference must be enriched (fetched with `enrich=true`)
 *   for split test resolution to work; otherwise falls back to the primary funnel.
 * @returns The resolved config, or `undefined` if the destination is missing required data.
 */
export function resolveDestinationConfig(destination: BuilderFunnelDestinationContent): DestinationConfig | undefined {
  const d = destination.data;
  if (!d) return undefined;

  const offerId = d.offer?.id;
  if (!offerId) return undefined;

  // Check for an active split test with enriched variant data
  const splitTest = d.activeSplitTest as any;
  const splitTestId: string | undefined = splitTest?.id;
  const variants: any[] | undefined = splitTest?.data?.variants;

  if (splitTestId && variants && variants.length > 0) {
    const idx = Math.floor(Math.random() * variants.length);
    const funnelId: string | undefined = variants[idx]?.funnel?.id;
    if (funnelId) {
      return { offerId, funnelId, splitTestId };
    }
  }

  // Fall back to primary funnel
  const funnelId = d.primaryFunnel?.id;
  if (!funnelId) return undefined;

  return { offerId, funnelId };
}
