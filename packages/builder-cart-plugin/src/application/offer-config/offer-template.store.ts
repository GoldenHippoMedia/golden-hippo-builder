import { BuilderOfferTemplateContent } from '@goldenhippo/builder-cart-schemas';
import { CollectionStore } from '@core/stores/collection-store';

export const offerTemplateStore = new CollectionStore<BuilderOfferTemplateContent>((api) =>
  api.getModelEntries<BuilderOfferTemplateContent>('offer-template', { bustCache: true, limit: 200 }),
);
