// Configuration
export { initBuilderFunnel, getBuilderFunnelConfig, type BuilderFunnelConfig } from './config';

// Content fetching — generic
export { fetchContent, fetchOneContent, fetchAllContent } from './content';
export type { BuilderContentEntry, BuilderContentResponse, ContentQueryOptions } from './content';

// Content fetching — funnel-specific
export {
  FUNNEL_MODELS,
  fetchFunnelOffers,
  fetchFunnelOffer,
  fetchFunnels,
  fetchFunnel,
  fetchFunnelDestinations,
  fetchFunnelDestination,
  fetchFunnelSplitTests,
  fetchFunnelSplitTest,
  fetchFunnelPages,
  fetchFunnelPage,
  fetchProducts,
} from './content';

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
