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

/** UX groupings rendered as separate `Section`s, in this order, by the form. */
export type FieldSection = 'display' | 'packaging' | 'stock' | 'taxonomy';

/** Input widget used for a field. Drives both rendering and read/save coercion. */
export type FieldControl = 'text' | 'textarea' | 'tags' | 'toggle' | 'refs';

export interface ProductFormField {
  /** Stable, form-facing key. Also the value-bag key and per-field locale key. */
  key: string;
  /** Schema field path (dot-path for object subfields), used for localization + save. */
  modelField: string;
  control: FieldControl;
  section: FieldSection;
  label: string;
  helper?: string;
  placeholder?: string;
  /** Render the text input in a monospace font (e.g. for URLs). */
  mono?: boolean;
  /** Lay this field out at half width so two sit side-by-side in a row. */
  width?: 'half';
  /** `refs` only — the Builder model and wrapper key for each reference entry. */
  refModel?: string;
  refKey?: string;
}

export const PRODUCT_FORM_FIELDS: ProductFormField[] = [
  {
    key: 'displayName',
    modelField: 'displayName',
    control: 'text',
    section: 'display',
    label: 'Display Name',
    helper: 'The customer-facing name',
  },
  {
    key: 'subHeading',
    modelField: 'subHeading',
    control: 'text',
    section: 'display',
    label: 'Product Headline (subheading)',
    helper: 'Tagline shown on product cards',
  },
  {
    key: 'gridTagline',
    modelField: 'gridTagline',
    control: 'text',
    section: 'display',
    label: 'Grid Tagline',
    helper: 'Optional override for the tagline shown on product grids. Falls back to Headline.',
  },
  {
    key: 'gridDescription',
    modelField: 'gridDescription',
    control: 'text',
    section: 'display',
    label: 'Grid Description',
    helper: 'Extra sub-heading shown on some cards (e.g. Centered / Boxed). Separate from the tagline.',
  },
  {
    key: 'shortDescription',
    modelField: 'shortDescription',
    control: 'textarea',
    section: 'display',
    label: 'Short Description (HTML)',
    helper: 'Typically shown on the PDP. HTML allowed.',
  },
  {
    key: 'featuredImage',
    modelField: 'featuredImage',
    control: 'text',
    section: 'display',
    label: 'Featured Image URL',
    helper: 'Displayed on product cards. Paste a builder.io asset URL.',
    placeholder: 'https://cdn.builder.io/api/v1/image/...',
    mono: true,
  },
  {
    key: 'secondaryImage',
    modelField: 'secondaryImage',
    control: 'text',
    section: 'display',
    label: 'Secondary Image URL',
    helper: 'Shown on card hover for grids that support it.',
    placeholder: 'https://cdn.builder.io/api/v1/image/...',
    mono: true,
  },
  {
    key: 'packagingSingular',
    modelField: 'packagingLabels.singular',
    control: 'text',
    section: 'packaging',
    label: 'Packaging (singular)',
    helper: 'e.g. "bottle" — used for "per bottle" on cards/offer selector',
    placeholder: 'bottle',
    width: 'half',
  },
  {
    key: 'packagingPlural',
    modelField: 'packagingLabels.plural',
    control: 'text',
    section: 'packaging',
    label: 'Packaging (plural)',
    helper: 'e.g. "bottles" — used for multi-quantity options',
    placeholder: 'bottles',
    width: 'half',
  },
  {
    key: 'emojis',
    modelField: 'emojis',
    control: 'tags',
    section: 'packaging',
    label: 'Emojis',
    helper: "Shown on the offer selector's flavor options and used for the add-to-cart confetti.",
    placeholder: 'Add emoji...',
  },
  {
    key: 'hidden',
    modelField: 'hidden',
    control: 'toggle',
    section: 'stock',
    label: 'Hide product',
    helper: 'Excludes this product from grids and search results for the selected locale.',
  },
  {
    key: 'outOfStock',
    modelField: 'outOfStock',
    control: 'toggle',
    section: 'stock',
    label: 'Out of Stock',
    helper: 'Marks this product as out of stock everywhere; blocks purchase.',
  },
  {
    key: 'cartOutOfStock',
    modelField: 'cartOutOfStock',
    control: 'toggle',
    section: 'stock',
    label: 'Out of Stock (Site only)',
    helper: 'Presents as out of stock on the site only — useful when still purchasable elsewhere.',
  },
  {
    key: 'tagIds',
    modelField: 'tags',
    control: 'refs',
    section: 'taxonomy',
    label: 'Tags',
    helper: 'Used to cross-reference products and enable filtering (e.g. "New", "Best Seller")',
    placeholder: 'Add tag...',
    refModel: 'product-tag',
    refKey: 'tag',
  },
  {
    key: 'categoryIds',
    modelField: 'categories',
    control: 'refs',
    section: 'taxonomy',
    label: 'Categories',
    helper: 'Categories this product belongs to — used for navigation and filtering',
    placeholder: 'Add category...',
    refModel: 'product-category',
    refKey: 'category',
  },
  {
    key: 'ingredientIds',
    modelField: 'ingredients',
    control: 'refs',
    section: 'taxonomy',
    label: 'Ingredients',
    helper: 'Key ingredients in this product',
    placeholder: 'Add ingredient...',
    refModel: 'product-ingredient',
    refKey: 'ingredient',
  },
  {
    key: 'useCaseIds',
    modelField: 'useCases',
    control: 'refs',
    section: 'taxonomy',
    label: 'Use Cases',
    helper: 'Goals or health benefits this product supports',
    placeholder: 'Add use case...',
    refModel: 'product-use-case',
    refKey: 'useCase',
  },
];

export const PRODUCT_FORM_FIELD_BY_KEY = new Map(PRODUCT_FORM_FIELDS.map((f) => [f.key, f]));

export const EDITED_PRODUCT_FIELDS = PRODUCT_FORM_FIELDS.map((f) => f.modelField);
