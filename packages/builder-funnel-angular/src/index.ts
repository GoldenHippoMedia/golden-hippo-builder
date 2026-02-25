// Configuration
export { initBuilderFunnel, getBuilderFunnelConfig, type BuilderFunnelConfig } from './config';

// Generic content fetching
export { fetchEntries, fetchOneEntry, fetchAllEntries } from './content';
export type { ContentQueryOptions } from './content';

// Business utilities — lookups
export {
  FUNNEL_MODELS,
  getOfferById,
  getOfferBySlug,
  getDefaultOffer,
  getFunnelById,
  getFunnelByIdOrGEP,
  getDestinationBySlug,
  getFunnelPage,
} from './content';

// Business utilities — resolution
export { getFunnelFromDestination, getFunnelFromSplitTest, type ResolvedFunnel } from './content';

// Business utilities — pricing & steps
export { getPricingFromFunnel, getMostPopularTier, getStepsFromFunnel, type ResolvedPricingTier } from './content';

// Routing
export { isFunnelPreviewPath, isBuilderEditRequest } from './routing';

// Re-export types from funnel-schemas for consumer convenience
export type {
  BuilderFunnelOfferContent,
  FunnelOfferPricingTier,
  OfferType,
  BuilderFunnelContent,
  FunnelPricingTier,
  FunnelStep,
  FunnelStepType,
  FunnelStatus,
  BuilderFunnelDestinationContent,
  FunnelDestinationStatus,
  BuilderFunnelSplitTestContent,
  FunnelSplitTestStatus,
  FunnelSplitTestVariant,
  BuilderFunnelPageContent,
  FunnelPageType,
  BuilderProductContent,
  BuilderProductCategoryContent,
  BuilderProductTagContent,
  BuilderIngredientContent,
  BuilderProductUseCaseContent,
  SubscriptionFrequency,
  DestinationConfig,
} from '@goldenhippo/builder-funnel-schemas';

// Re-export utilities from funnel-schemas
export {
  resolveDestinationConfig,
  getFunnelIdFromPage,
  SUBSCRIPTION_FREQUENCIES,
  FREQUENCY_LABELS,
  calculateSubscriptionFrequency,
} from '@goldenhippo/builder-funnel-schemas';
