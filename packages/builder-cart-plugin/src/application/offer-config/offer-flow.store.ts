import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';
import { CollectionStore } from '@core/stores/collection-store';

export const offerFlowStore = new CollectionStore<BuilderOfferFlowContent>((api) => api.getOfferFlows());
