import { ModelShape } from '@goldenhippo/builder-types';
import {
  createIngredientsModel,
  createCategoryModel,
  createProductTagModel,
  createProductUseCaseModel,
  createProductModel,
  createFunnelOfferModel,
  createFunnelModel,
  createFunnelDestinationModel,
  createFunnelSplitTestModel,
  createFunnelPageModel,
} from '@goldenhippo/builder-funnel-schemas';

class FunnelBuilderHelper {
  // Static data models (no dependencies, shared with cart)
  ingredientsModel = createIngredientsModel();
  categoryModel = createCategoryModel();
  productTagModel = createProductTagModel();
  useCaseModel = createProductUseCaseModel();

  // Factory models (require model IDs from cascading creation)
  productModel(request: {
    ingredientsModelId: string;
    categoryModelId: string;
    tagModelId: string;
    useCaseModelId: string;
  }): ModelShape {
    return createProductModel(request);
  }

  funnelPageModel(editUrl: string, funnelModelId?: string): ModelShape {
    return createFunnelPageModel(editUrl, funnelModelId);
  }

  funnelOfferModel(productModelId: string): ModelShape {
    return createFunnelOfferModel(productModelId);
  }

  funnelModel(offerModelId: string, funnelPageModelId: string): ModelShape {
    return createFunnelModel(offerModelId, funnelPageModelId);
  }

  funnelDestinationModel(offerModelId: string, funnelModelId: string, splitTestModelId?: string): ModelShape {
    return createFunnelDestinationModel(offerModelId, funnelModelId, splitTestModelId);
  }

  funnelSplitTestModel(destinationModelId: string, funnelModelId: string): ModelShape {
    return createFunnelSplitTestModel(destinationModelId, funnelModelId);
  }
}

export default new FunnelBuilderHelper();
