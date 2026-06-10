// Re-export shared models for backward compatibility
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

// Cart-specific models
export {
  createBrandConfigModel,
  type BuilderBrandConfigContent,
  HeaderType,
  FooterType,
  BasicHeaderCTAType,
  MediumHeaderDropdownType,
  MediumHeaderDesktopContentType,
  ProductGridFilterType,
  ProductLinkPrefix,
  SubscriptionCancelReasons,
  SubscriptionCancelButtonType,
} from './brand-config';
export { createBlogCategoryModel, type BuilderBlogCategoryContent } from './blog-category.model';
export { createBlogCommentModel, type BuilderBlogCommentContent } from './blog-comment.model';
export { createProductGroupModel, type BuilderProductGroupContent, ProductGroupType } from './product-group.model';
export {
  createProfileReferenceRuleModel,
  type BuilderProfileReferenceRuleContent,
  ProfileFieldReference,
  ProfileReferenceApplicationType,
} from './profile-reference-rule.model';
export {
  createRecommendationConfigModel,
  type BuilderRecommendationConfigContent,
} from './recommendation-config.model';
export {
  createProductGridConfigModel,
  type BuilderProductGridFilterGroupContent,
  FilterApplicationType,
} from './product-grid-filter-group.model';
export {
  createPaymentConfigModel,
  type BuilderPaymentConfigContent,
  type BuilderPaymentConfig,
} from './payment-config.model';
