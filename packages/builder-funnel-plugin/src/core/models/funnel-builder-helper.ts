import { ModelShape } from '@goldenhippo/builder-types';
import {
  createCategoryModel,
  createFunnelModel,
  createFunnelPageModel,
  createIngredientsModel,
  createProductModel,
  createProductTagModel,
  createProductUseCaseModel,
} from '@goldenhippo/builder-funnel-schemas';

class FunnelBuilderHelper {
  // Static data models (no dependencies, shared with cart)
  ingredientsModel = createIngredientsModel();
  categoryModel = createCategoryModel();
  productTagModel = createProductTagModel();
  useCaseModel = createProductUseCaseModel();
  funnelModel = createFunnelModel();

  // Factory models (require model IDs from cascading creation)
  productModel(request: {
    ingredientsModelId: string;
    categoryModelId: string;
    tagModelId: string;
    useCaseModelId: string;
  }): ModelShape {
    return createProductModel(request);
  }

  funnelPageModel(editUrl: string, funnelModelId: string): ModelShape {
    return createFunnelPageModel(editUrl, funnelModelId);
  }

}

export default new FunnelBuilderHelper();
