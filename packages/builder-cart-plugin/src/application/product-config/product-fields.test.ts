import { describe, it, expect } from 'vitest';
import { EDITED_PRODUCT_FIELDS, isProductFieldLocalized, productFieldExists } from './product-fields';

// Guards against the product config form drifting out of sync with the product
// model schema. If a field is renamed/removed in the schema, or its localized
// flag flips (which changes how the form must save it), these fail for review.

describe('product config form ↔ schema sync', () => {
  it('edits only fields that exist in the product model', () => {
    const missing = EDITED_PRODUCT_FIELDS.filter((f) => !productFieldExists(f));
    expect(missing, `form edits fields absent from the schema: ${missing.join(', ')}`).toEqual([]);
  });

  it('matches the schema localized flags the save logic relies on', () => {
    // Pinned expectations — update intentionally alongside the form/save logic.
    const expected: Record<(typeof EDITED_PRODUCT_FIELDS)[number], boolean> = {
      displayName: true,
      subHeading: true,
      gridTagline: true,
      gridDescription: true,
      shortDescription: true,
      featuredImage: false,
      secondaryImage: false,
      'packagingLabels.singular': true,
      'packagingLabels.plural': true,
      emojis: false,
      hidden: true,
      outOfStock: false,
      cartOutOfStock: false,
      tags: true,
      categories: true,
      ingredients: true,
      useCases: true,
    };

    const actual = Object.fromEntries(EDITED_PRODUCT_FIELDS.map((f) => [f, isProductFieldLocalized(f)]));
    expect(actual).toEqual(expected);
  });
});
