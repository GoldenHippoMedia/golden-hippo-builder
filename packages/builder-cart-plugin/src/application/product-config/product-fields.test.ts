import { describe, it, expect } from 'vitest';
import { PRODUCT_FORM_FIELDS, isProductFieldLocalized, productFieldExists } from './product-fields';

describe('product config form ↔ schema sync', () => {
  it('edits only fields that exist in the product model', () => {
    const missing = PRODUCT_FORM_FIELDS.filter((f) => !productFieldExists(f.modelField)).map((f) => f.modelField);
    expect(missing, `form edits fields absent from the schema: ${missing.join(', ')}`).toEqual([]);
  });

  it('matches the schema localized flags the save logic relies on', () => {
    // Pinned expectations — update intentionally alongside the form/save logic.
    const expected: Record<string, boolean> = {
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

    const actual = Object.fromEntries(
      PRODUCT_FORM_FIELDS.map((f) => [f.modelField, isProductFieldLocalized(f.modelField)]),
    );
    expect(actual).toEqual(expected);
  });

  it('uses a unique key per field', () => {
    const keys = PRODUCT_FORM_FIELDS.map((f) => f.key);
    expect(new Set(keys).size, 'duplicate form-field keys').toBe(keys.length);
  });

  it('gives every reference field the metadata its save path needs', () => {
    const bad = PRODUCT_FORM_FIELDS.filter((f) => f.control === 'refs' && (!f.refModel || !f.refKey)).map((f) => f.key);
    expect(bad, `ref fields missing refModel/refKey: ${bad.join(', ')}`).toEqual([]);
  });
});
