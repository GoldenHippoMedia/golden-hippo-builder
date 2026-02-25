// Re-export shared product models for consumer convenience
export {
  createProductModel,
  createCategoryModel,
  createProductTagModel,
  createIngredientsModel,
  createProductUseCaseModel,
  type BuilderProductContent,
  type BuilderProductCategoryContent,
  type BuilderProductTagContent,
  type BuilderIngredientContent,
  type BuilderProductUseCaseContent,
} from '@goldenhippo/builder-shared-schemas';

// Subscription frequency utilities
export {
  SUBSCRIPTION_FREQUENCIES,
  FREQUENCY_LABELS,
  calculateSubscriptionFrequency,
  type SubscriptionFrequency,
} from './data';

// Data models
export {
  createFunnelOfferModel,
  type BuilderFunnelOfferContent,
  type FunnelOfferPricingTier,
  type OfferType,
  createFunnelModel,
  type BuilderFunnelContent,
  type FunnelPricingTier,
  type FunnelStep,
  type FunnelStepType,
  type FunnelStatus,
  createFunnelDestinationModel,
  type BuilderFunnelDestinationContent,
  type FunnelDestinationStatus,
  createFunnelSplitTestModel,
  type BuilderFunnelSplitTestContent,
  type FunnelSplitTestStatus,
  type FunnelSplitTestVariant,
} from './data';

// Page models
export { createFunnelPageModel, type BuilderFunnelPageContent, type FunnelPageType } from './page';

// Utilities
export { resolveDestinationConfig, type DestinationConfig, getFunnelIdFromPage } from './utils';
