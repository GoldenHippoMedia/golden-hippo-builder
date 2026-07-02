// ---------------------------------------------------------------------------
// Schema-derived metadata for the product model.
//
// The product config form must never disagree with the canonical schema about
// which fields exist or which are localized. Rather than re-declaring that, we
// read it straight from `createProductModel` — the same factory the plugin uses
// to provision the model — and expose a lookup. A field's localized flag and
// type therefore always track the schema. The accompanying test asserts every
// field the form edits is present here.
// ---------------------------------------------------------------------------

import { createProductModel } from '@goldenhippo/builder-cart-schemas';

export interface ProductFieldMeta {
  /** Dot-path name (e.g. "packagingLabels.singular" for object subfields). */
  name: string;
  type: string;
  localized: boolean;
  friendlyName?: string;
  helperText?: string;
}

interface RawField {
  name: string;
  type: string;
  localized?: boolean;
  friendlyName?: string;
  helperText?: string;
  subFields?: RawField[];
}

const flatten = (fields: RawField[], prefix = ''): ProductFieldMeta[] =>
  fields.flatMap((f) => {
    const name = prefix ? `${prefix}.${f.name}` : f.name;
    const self: ProductFieldMeta = {
      name,
      type: f.type,
      localized: Boolean(f.localized),
      friendlyName: f.friendlyName,
      helperText: f.helperText,
    };
    // Recurse into object subfields (e.g. packagingLabels.singular/plural),
    // where localization is declared per-subfield.
    const subs = f.type === 'object' && f.subFields ? flatten(f.subFields, name) : [];
    return [self, ...subs];
  });

// Model IDs only matter for reference subfields; metadata doesn't need real ones.
const model = createProductModel({ ingredientsModelId: '', categoryModelId: '', tagModelId: '', useCaseModelId: '' });

export const PRODUCT_FIELD_META: ProductFieldMeta[] = flatten(model.fields as RawField[]);

const byName = new Map(PRODUCT_FIELD_META.map((f) => [f.name, f]));

export const getProductFieldMeta = (name: string): ProductFieldMeta | undefined => byName.get(name);

/** Whether a product field is localized, per the schema. Unknown fields → false. */
export const isProductFieldLocalized = (name: string): boolean => byName.get(name)?.localized ?? false;

export const productFieldExists = (name: string): boolean => byName.has(name);

/**
 * The product fields the config form reads and writes. This is the contract the
 * sync test enforces against the schema: every name here must exist in the
 * model, and each one's localized flag is pinned so a schema change that would
 * alter save behavior fails the test for review.
 */
export const EDITED_PRODUCT_FIELDS = [
  'displayName',
  'subHeading',
  'gridTagline',
  'gridDescription',
  'shortDescription',
  'featuredImage',
  'secondaryImage',
  'packagingLabels.singular',
  'packagingLabels.plural',
  'emojis',
  'hidden',
  'outOfStock',
  'cartOutOfStock',
  'tags',
  'categories',
  'ingredients',
  'useCases',
] as const;
