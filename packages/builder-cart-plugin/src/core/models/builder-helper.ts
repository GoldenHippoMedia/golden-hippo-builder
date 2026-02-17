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
  createPageModel,
} from '@goldenhippo/builder-cart-schemas';

class BuilderHelper {
  // Static data models (no dependencies)
  ingredientsModel = createIngredientsModel();
  categoryModel = createCategoryModel();
  productTagModel = createProductTagModel();
  useCaseModel = createProductUseCaseModel();
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

  productGroupModel(productModelId: string): ModelShape {
    return createProductGroupModel(productModelId);
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

  pageModel(props: {
    productModelId: string;
    productGroupModelId: string;
    categoryModelId: string;
    bannerModelId: string;
    blogCategoryModelId: string;
    editUrl: string;
  }): ModelShape {
    return createPageModel(props);
  }

  blogCommentModel(pageModelId: string): ModelShape {
    return createBlogCommentModel(pageModelId);
  }
}

export default new BuilderHelper();
