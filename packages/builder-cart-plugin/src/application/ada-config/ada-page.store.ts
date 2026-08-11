import { CollectionStore } from '@core/stores/collection-store';
import { type PageEntry } from './ada-page';

// The audit needs the block tree, which makes responses much heavier than the SEO
// meta-only fetch — so this caps lower and stays a separate store from seoPageStore.
const PAGE_LIMIT = 1000;

export const adaPageStore = new CollectionStore<PageEntry>((api) =>
  api.getModelEntries<PageEntry>('page', { bustCache: true, limit: PAGE_LIMIT, includeBlocks: true }),
);
