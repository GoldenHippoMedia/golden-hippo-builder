import { BuilderDestinationSplitTestOption, BuilderFunnelDestinationContent } from '../data';

export interface DestinationConfig {
  /** The resolved funnel ID (from split test variant or primary funnel) */
  funnelId: string;
  funnelSlug: string;
  /** The active split test ID, if one is running */
  splitTestId?: string;
  splitTestSlug?: string;
}

export function resolveDestinationConfig(destination: BuilderFunnelDestinationContent): DestinationConfig | undefined {
  const dest = destination.data;
  if (!dest) return undefined;

  // Check for an active split test with enriched variant data
  const splitTest = dest.splitTest;
  const splitTestId: string | undefined = splitTest?.productionId;
  const splitTestSlug: string | undefined = splitTest?.slug;
  const variants: BuilderDestinationSplitTestOption[] = splitTest?.options ?? [];

  if (splitTestId && splitTestSlug && variants.length > 0) {
    const variantFunnelId = getRandomVariant(variants);
    const idx = variants.findIndex((option) => option.funnel.id === variantFunnelId);
    const funnelId = variants[idx].funnel.id;
    const funnelSlug = variants[idx].funnel.value.data?.slug;
    if (funnelId && funnelSlug) {
      return { funnelId, funnelSlug, splitTestId, splitTestSlug };
    }
  }

  // Fall back to primary funnel
  const funnelId = dest.defaultFunnel.value.data?.productionId;
  const funnelSlug = dest.defaultFunnel.value.data?.slug;
  if (!funnelId || !funnelSlug) return undefined;

  return { funnelId, funnelSlug };
}

function getRandomVariant(variants: BuilderDestinationSplitTestOption[]): string {
  const totalAllocation = variants.reduce((sum, option) => sum + option.trafficAllocation, 0);
  const rand = Math.random() * totalAllocation;
  let cumulative = 0;
  for (const option of variants) {
    cumulative += option.trafficAllocation;
    if (rand < cumulative) {
      return option.funnel.id;
    }
  }
  return variants[variants.length - 1].funnel.id; // Fallback in case of rounding issues
}
