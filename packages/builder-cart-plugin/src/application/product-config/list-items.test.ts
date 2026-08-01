import { describe, it, expect } from 'vitest';
import type { BuilderProductContent } from '@goldenhippo/builder-shared-schemas';
import {
  buildListItems,
  filterListItems,
  getGroupedProductIds,
  groupProductCount,
  isItemHidden,
  itemDisplayName,
  resolveGroupChildren,
  type ProductListItem,
} from './list-items';

// Builder LocalizedValue wrapper (Default slice only).
const LV = (v: unknown) => ({ '@type': '@builder.io/core:LocalizedValue', Default: v });

const product = (data: Record<string, unknown> = {}, id = 'p'): any => ({ id, data });
const group = (data: Record<string, unknown> = {}, id = 'g'): any => ({ id, data });

/** A group's `products[]` entry referencing a product by id (optionally embedded). */
const ref = (id: string, embedded?: Record<string, unknown>): any => ({
  product: embedded ? { id, value: { id, data: embedded } } : { id },
});

/** Build a Map<id, product> from product entries, as the list component does. */
const byId = (products: any[]): Map<string, BuilderProductContent> => new Map(products.map((p) => [p.id, p]));

describe('itemDisplayName', () => {
  it('resolves the Default-locale displayName', () => {
    expect(itemDisplayName({ kind: 'product', item: product({ displayName: LV('Salmon Oil') }) })).toBe('Salmon Oil');
  });

  it('falls back to internal name then a kind-specific placeholder', () => {
    expect(itemDisplayName({ kind: 'product', item: product({ name: 'internal' }) })).toBe('internal');
    expect(itemDisplayName({ kind: 'group', item: group({}) })).toBe('(Untitled group)');
    expect(itemDisplayName({ kind: 'product', item: product({}) })).toBe('(Untitled product)');
  });
});

describe('isItemHidden', () => {
  it('reads a product localized hidden (Default slice)', () => {
    expect(isItemHidden({ kind: 'product', item: product({ hidden: LV(true) }) })).toBe(true);
    expect(isItemHidden({ kind: 'product', item: product({ hidden: LV(false) }) })).toBe(false);
    expect(isItemHidden({ kind: 'product', item: product({}) })).toBe(false);
  });

  it('reads a group plain boolean hidden', () => {
    expect(isItemHidden({ kind: 'group', item: group({ hidden: true }) })).toBe(true);
    expect(isItemHidden({ kind: 'group', item: group({ hidden: false }) })).toBe(false);
  });
});

describe('groupProductCount', () => {
  it('counts a group products and returns 0 for products', () => {
    expect(groupProductCount({ kind: 'group', item: group({ products: [{}, {}, {}] }) })).toBe(3);
    expect(groupProductCount({ kind: 'group', item: group({}) })).toBe(0);
    expect(groupProductCount({ kind: 'product', item: product({ displayName: LV('x') }) })).toBe(0);
  });
});

describe('getGroupedProductIds', () => {
  it('collects every product id referenced across groups', () => {
    const groups = [
      group({ products: [ref('p1'), ref('p2')] }, 'g1'),
      group({ products: [ref('p2'), ref('p3')] }, 'g2'),
      group({}, 'g3'),
    ];
    expect(getGroupedProductIds(groups)).toEqual(new Set(['p1', 'p2', 'p3']));
  });
});

describe('resolveGroupChildren', () => {
  it('resolves references to fetched products in authored order', () => {
    const p1 = product({ displayName: LV('One') }, 'p1');
    const p2 = product({ displayName: LV('Two') }, 'p2');
    const g = group({ products: [ref('p2'), ref('p1')] });
    expect(resolveGroupChildren(g, byId([p1, p2])).map((p) => p.id)).toEqual(['p2', 'p1']);
  });

  it('falls back to the embedded value.data when the product was not fetched', () => {
    const g = group({ products: [ref('p9', { displayName: LV('Embedded') })] });
    const children = resolveGroupChildren(g, byId([]));
    expect(children).toHaveLength(1);
    expect(itemDisplayName({ kind: 'product', item: children[0] })).toBe('Embedded');
  });

  it('skips references that resolve to neither a fetched nor embedded product', () => {
    const g = group({ products: [ref('missing'), { product: {} }] });
    expect(resolveGroupChildren(g, byId([]))).toHaveLength(0);
  });
});

describe('buildListItems', () => {
  it('interleaves ungrouped products and groups sorted case-insensitively by display name', () => {
    const products = [product({ displayName: LV('Gamma') }, 'p1'), product({ displayName: LV('alpha') }, 'p2')];
    const groups = [group({ displayName: LV('Beta') }, 'g1')];
    const result = buildListItems(products, groups);
    expect(result.map((li) => `${li.kind}:${li.item.id}`)).toEqual(['product:p2', 'group:g1', 'product:p1']);
  });

  it('excludes products referenced by a group from the top level', () => {
    const products = [product({ displayName: LV('Grouped') }, 'p1'), product({ displayName: LV('Loose') }, 'p2')];
    const groups = [group({ displayName: LV('Pack'), products: [ref('p1')] }, 'g1')];
    const result = buildListItems(products, groups);
    // p1 ('Grouped') is excluded; 'Loose' sorts before 'Pack'.
    expect(result.map((li) => `${li.kind}:${li.item.id}`)).toEqual(['product:p2', 'group:g1']);
  });
});

describe('filterListItems', () => {
  const p1 = product({ displayName: LV('Salmon Oil'), name: 'salmon-internal' }, 'p1');
  const child = product({ displayName: LV('Chicken Flavor'), name: 'chicken-internal' }, 'c1');
  const items: ProductListItem[] = [
    { kind: 'product', item: p1 },
    { kind: 'group', item: group({ displayName: LV('Flavor Pack'), name: 'flavor-grp', products: [ref('c1')] }, 'g1') },
  ];
  const products = byId([p1, child]);

  it('returns all items for an empty query', () => {
    expect(filterListItems(items, '   ', products)).toHaveLength(2);
  });

  it('matches on display name (punctuation-insensitive)', () => {
    expect(filterListItems(items, 'salmon oil', products).map((li) => li.item.id)).toEqual(['p1']);
  });

  it('matches on internal name', () => {
    expect(filterListItems(items, 'flavor-grp', products).map((li) => li.item.id)).toEqual(['g1']);
  });

  it('keeps a group when a nested child product matches', () => {
    expect(filterListItems(items, 'chicken flavor', products).map((li) => li.item.id)).toEqual(['g1']);
  });
});
