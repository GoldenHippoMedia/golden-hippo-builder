import type {
  BuilderProductContent,
  BuilderProductTagContent,
  BuilderProductCategoryContent,
  BuilderIngredientContent,
  BuilderProductUseCaseContent,
} from '@goldenhippo/builder-shared-schemas';
import type { BuilderProductGroupContent } from '@goldenhippo/builder-cart-schemas';
import type BuilderApi from '@services/builder-api';
import { CollectionStore } from '@core/stores/collection-store';

// Raw (unresolved) so localized fields stay as LocalizedValue objects — required to edit per-locale.
const RAW = { bustCache: true, raw: true } as const;

export const productStore = new CollectionStore<BuilderProductContent>((api) =>
  api.getModelEntries<BuilderProductContent>('product', RAW),
);
export const productGroupStore = new CollectionStore<BuilderProductGroupContent>((api) =>
  api.getModelEntries<BuilderProductGroupContent>('product-group', RAW),
);
export const productTagStore = new CollectionStore<BuilderProductTagContent>((api) =>
  api.getModelEntries<BuilderProductTagContent>('product-tag', RAW),
);
export const productCategoryStore = new CollectionStore<BuilderProductCategoryContent>((api) =>
  api.getModelEntries<BuilderProductCategoryContent>('product-category', RAW),
);
export const productIngredientStore = new CollectionStore<BuilderIngredientContent>((api) =>
  api.getModelEntries<BuilderIngredientContent>('product-ingredient', RAW),
);
export const productUseCaseStore = new CollectionStore<BuilderProductUseCaseContent>((api) =>
  api.getModelEntries<BuilderProductUseCaseContent>('product-use-case', RAW),
);

const stores = [
  productStore,
  productGroupStore,
  productTagStore,
  productCategoryStore,
  productIngredientStore,
  productUseCaseStore,
];

// Facade to load/refresh all six together and expose one combined loaded/error view.
export const productData = {
  ensureLoaded: (api: BuilderApi): Promise<unknown> => Promise.all(stores.map((s) => s.ensureLoaded(api))),
  refresh: (api: BuilderApi): Promise<unknown> => Promise.all(stores.map((s) => s.refresh(api))),
  get loaded(): boolean {
    return stores.every((s) => s.loaded);
  },
  get refreshing(): boolean {
    return stores.some((s) => s.refreshing);
  },
  get error(): string | null {
    return stores.map((s) => s.error).find((e): e is string => Boolean(e)) ?? null;
  },
};
