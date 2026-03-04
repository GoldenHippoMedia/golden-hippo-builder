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

// Data models
export {
  createFunnelModel,
  type BuilderFunnelContent,
  createFunnelDestinationModel,
  type BuilderFunnelDestinationContent,
} from './data';

// Page models
export { createFunnelPageModel, type BuilderFunnelPageContent } from './page';

// Utilities
export {
  resolveDestinationConfig,
  type DestinationConfig,
  getFunnelProductionIdFromPage,
  getFunnelSlugFromPage,
} from './utils';
