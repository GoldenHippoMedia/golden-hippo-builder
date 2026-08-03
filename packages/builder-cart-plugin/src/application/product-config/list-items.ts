import type { BuilderProductContent } from '@goldenhippo/builder-shared-schemas';
import type { BuilderProductGroupContent } from '@goldenhippo/builder-cart-schemas';
import { localize } from './localization';

/** A single row in the Product Configuration list: a product or a group. */
export type ProductListItem =
  | { kind: 'product'; item: BuilderProductContent }
  | { kind: 'group'; item: BuilderProductGroupContent };

/** Lowercase and strip non-alphanumerics for case/punctuation-insensitive search. */
export const normalize = (v: string): string => v.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Default-locale display name, falling back to internal name then a placeholder. */
export const itemDisplayName = (li: ProductListItem): string => {
  const data = li.item.data;
  const display = localize<string>(data?.displayName);
  const fallback = li.kind === 'group' ? '(Untitled group)' : '(Untitled product)';
  return display || data?.name || fallback;
};

/** Internal (non-localized) name, or '' when unset. */
export const itemInternalName = (li: ProductListItem): string => li.item.data?.name ?? '';

/**
 * Whether the item is hidden for the Default locale. Product `hidden` is
 * localized; group `hidden` is a plain boolean (which `localize` passes through).
 */
export const isItemHidden = (li: ProductListItem): boolean => localize<boolean>(li.item.data?.hidden) === true;

/** Number of products in a group; 0 for a product (no such field). */
export const groupProductCount = (li: ProductListItem): number =>
  li.kind === 'group' ? (li.item.data?.products?.length ?? 0) : 0;

/** The ids of every product referenced by any group — these are shown nested, not top-level. */
export const getGroupedProductIds = (groups: BuilderProductGroupContent[]): Set<string> => {
  const ids = new Set<string>();
  for (const group of groups) {
    for (const entry of group.data?.products ?? []) {
      const id = entry?.product?.id;
      if (id) ids.add(id);
    }
  }
  return ids;
};

/**
 * Resolve a group's product references (in authored order) to full product
 * entries. Prefers the separately-fetched product (so taxonomy/labels resolve);
 * falls back to the reference's embedded `value.data` when the product wasn't
 * fetched; skips references that resolve to neither.
 */
export const resolveGroupChildren = (
  group: BuilderProductGroupContent,
  productsById: Map<string, BuilderProductContent>,
): BuilderProductContent[] => {
  const children: BuilderProductContent[] = [];
  for (const entry of group.data?.products ?? []) {
    const ref = entry?.product;
    const id = ref?.id;
    if (!id) continue;
    const found = productsById.get(id);
    if (found) {
      children.push(found);
    } else if (ref?.value?.data) {
      children.push({ id: ref.value.id ?? id, data: ref.value.data } as BuilderProductContent);
    }
  }
  return children;
};

/**
 * Merge groups and *ungrouped* products into one top-level list, sorted
 * case-insensitively by display name. Products referenced by any group are
 * excluded here — they render nested under their group instead.
 */
export const buildListItems = (
  products: BuilderProductContent[],
  groups: BuilderProductGroupContent[],
): ProductListItem[] => {
  const groupedIds = getGroupedProductIds(groups);
  const ungrouped = products.filter((p) => !(p.id != null && groupedIds.has(p.id)));
  const items: ProductListItem[] = [
    ...ungrouped.map((item): ProductListItem => ({ kind: 'product', item })),
    ...groups.map((item): ProductListItem => ({ kind: 'group', item })),
  ];
  return items.sort((a, b) => itemDisplayName(a).localeCompare(itemDisplayName(b), undefined, { sensitivity: 'base' }));
};

/**
 * Filter top-level items by search query against display + internal name. A
 * group is also kept when any of its nested child products match, so grouped
 * products stay findable. Empty query returns all.
 */
export const filterListItems = (
  items: ProductListItem[],
  query: string,
  productsById: Map<string, BuilderProductContent>,
): ProductListItem[] => {
  const q = normalize(query.trim());
  if (!q) return items;
  const matches = (li: ProductListItem): boolean =>
    normalize(`${itemDisplayName(li)} ${itemInternalName(li)}`).includes(q);
  return items.filter((li) => {
    if (matches(li)) return true;
    if (li.kind !== 'group') return false;
    return resolveGroupChildren(li.item, productsById).some((child) => matches({ kind: 'product', item: child }));
  });
};
