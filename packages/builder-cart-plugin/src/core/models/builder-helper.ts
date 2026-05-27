import { ModelShape } from '@goldenhippo/builder-types';
import {
  createIngredientsModel,
  createCategoryModel,
  createProductTagModel,
  createProductUseCaseModel,
  createProductModel,
  createProductGroupModel,
  createProductGridConfigModel,
  createBlogCategoryModel,
  createBlogCommentModel,
  createBrandConfigModel,
  createSiteBannerModel,
  createDefaultWebsiteSectionModel,
  createSubscriptionCancellationPanelModel,
  createUpsellTemplateModel,
  createPageModel,
  createProfileReferenceRuleModel,
  createHeaderModel,
  createFooterModel,
  createOfferSelectorContentModel,
} from '@goldenhippo/builder-cart-schemas';

class BuilderHelper {
  // Static data models (no dependencies)
  ingredientsModel = createIngredientsModel();
  categoryModel = createCategoryModel();
  productTagModel = createProductTagModel();
  useCaseModel = createProductUseCaseModel();
  profileReferenceRuleModel = createProfileReferenceRuleModel();
  blogCategoryModel = createBlogCategoryModel();

  // Factory models (require model IDs from cascading creation)
  productModel(request: {
    ingredientsModelId: string;
    categoryModelId: string;
    tagModelId: string;
    useCaseModelId: string;
  }): ModelShape {
    return createProductModel(request);
  }

  productGroupModel(productModelId: string, sectionModelId: string): ModelShape {
    return createProductGroupModel(productModelId, sectionModelId);
  }

  productGridConfigModel(models: {
    categoryId: string;
    useCaseId: string;
    ingredientId: string;
    tagId: string;
  }): ModelShape {
    return createProductGridConfigModel(models);
  }

  brandConfig(gridFilterModelId: string, bannerModelId: string): ModelShape {
    return createBrandConfigModel(gridFilterModelId, bannerModelId);
  }

  siteBanner(editUrl: string): ModelShape {
    return createSiteBannerModel(editUrl);
  }

  defaultWebsiteSection(editUrl: string): ModelShape {
    return createDefaultWebsiteSectionModel(editUrl);
  }

  subscriptionCancellationPanel(editUrl: string): ModelShape {
    return createSubscriptionCancellationPanelModel(editUrl);
  }

  upsellTemplate(editUrl: string): ModelShape {
    return createUpsellTemplateModel(editUrl);
  }

  headerModel(editUrl: string): ModelShape {
    return createHeaderModel(editUrl);
  }

  footerModel(editUrl: string): ModelShape {
    return createFooterModel(editUrl);
  }

  offerSelectorContentModel(editUrl: string): ModelShape {
    return createOfferSelectorContentModel(editUrl);
  }

  pageModel(props: {
    productModelId: string;
    productGroupModelId: string;
    categoryModelId: string;
    bannerModelId: string;
    blogCategoryModelId: string;
    sectionModelId: string;
    editUrl: string;
  }): ModelShape {
    return createPageModel(props);
  }

  blogCommentModel(pageModelId: string): ModelShape {
    return createBlogCommentModel(pageModelId);
  }
}

export default new BuilderHelper();
