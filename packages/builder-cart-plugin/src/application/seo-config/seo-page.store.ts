import { CollectionStore } from '@core/stores/collection-store';
import { type PageEntry } from './seo-page';

// Meta-only page fetch (no blocks) — kept separate from the ADA store, which needs the block tree.
export const seoPageStore = new CollectionStore<PageEntry>((api) =>
  api.getModelEntries<PageEntry>('page', { bustCache: true, limit: 2000 }),
);
