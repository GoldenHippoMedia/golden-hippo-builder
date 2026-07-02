import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Section, FormField, TagInput } from '@goldenhippo/builder-ui';
import type {
  BuilderProductContent,
  BuilderProductTagContent,
  BuilderProductCategoryContent,
  BuilderIngredientContent,
  BuilderProductUseCaseContent,
} from '@goldenhippo/builder-shared-schemas';
import BuilderApi from '../../../services/builder-api';
import ChipMultiSelect, { type ChipOption } from './chip-multi-select';
import ProductCardPreview from './product-card-preview';
import type { PreviewProduct } from './card-previews';
import { localize, setLocalized, DEFAULT_LOCALE } from '../localization';
import { isProductFieldLocalized } from '../product-fields';
import { builderContentUrl } from '../builder-urls';

interface ProductDetailProps {
  product: BuilderProductContent;
  api: BuilderApi;
  tags: BuilderProductTagContent[];
  categories: BuilderProductCategoryContent[];
  ingredients: BuilderIngredientContent[];
  useCases: BuilderProductUseCaseContent[];
  locales: string[];
  onBack: () => void;
  onSaved: (updated: BuilderProductContent) => void;
}

// ---------------------------------------------------------------------------
// Edit-state shape — kept flat for easy field-level updates
// ---------------------------------------------------------------------------

interface EditState {
  displayName: string;
  subHeading: string;
  gridTagline: string;
  gridDescription: string;
  shortDescription: string;
  featuredImage: string;
  secondaryImage: string;
  packagingSingular: string;
  packagingPlural: string;
  emojis: string[];
  hidden: boolean;
  outOfStock: boolean;
  cartOutOfStock: boolean;
  tagIds: string[];
  categoryIds: string[];
  ingredientIds: string[];
  useCaseIds: string[];
}

// Read a (possibly localized) field for the active locale, per the schema's
// localized flag. Non-localized fields are read flat.
const readField = (data: Record<string, any>, field: string, locale: string): unknown =>
  isProductFieldLocalized(field) ? localize(data[field], locale) : data[field];

const seedState = (product: BuilderProductContent, locale: string): EditState => {
  const d = (product.data ?? {}) as Record<string, any>;

  const str = (field: string): string => {
    const v = readField(d, field, locale);
    return typeof v === 'string' ? v : '';
  };
  const bool = (field: string): boolean => Boolean(readField(d, field, locale));
  const ids = (field: string, key: string): string[] => {
    const raw = readField(d, field, locale);
    return (Array.isArray(raw) ? raw : []).map((entry) => entry?.[key]?.id).filter((id): id is string => Boolean(id));
  };
  const packaging = (sub: 'singular' | 'plural'): string => {
    const v = isProductFieldLocalized(`packagingLabels.${sub}`)
      ? localize(d.packagingLabels?.[sub], locale)
      : d.packagingLabels?.[sub];
    return typeof v === 'string' ? v : '';
  };
  const emojis = readField(d, 'emojis', locale);

  return {
    displayName: str('displayName'),
    subHeading: str('subHeading'),
    gridTagline: str('gridTagline'),
    gridDescription: str('gridDescription'),
    shortDescription: str('shortDescription'),
    featuredImage: str('featuredImage'),
    secondaryImage: str('secondaryImage'),
    packagingSingular: packaging('singular'),
    packagingPlural: packaging('plural'),
    emojis: Array.isArray(emojis) ? emojis : [],
    hidden: bool('hidden'),
    outOfStock: bool('outOfStock'),
    cartOutOfStock: bool('cartOutOfStock'),
    tagIds: ids('tags', 'tag'),
    categoryIds: ids('categories', 'category'),
    ingredientIds: ids('ingredients', 'ingredient'),
    useCaseIds: ids('useCases', 'useCase'),
  };
};

// ---------------------------------------------------------------------------
// Helpers for building Builder.io reference payloads on save
// ---------------------------------------------------------------------------

const buildReference = (id: string, model: string) => ({
  '@type': '@builder.io/core:Reference',
  id,
  model,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Toggle: React.FC<{ label: string; helperText?: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  helperText,
  checked,
  onChange,
}) => (
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 rounded border-[var(--border-glass)] accent-[var(--accent)] cursor-pointer"
    />
    <div>
      <div className="text-sm text-[var(--text-primary)]">{label}</div>
      {helperText && <div className="text-[11px] text-[var(--text-muted)]">{helperText}</div>}
    </div>
  </label>
);

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  api,
  tags,
  categories,
  ingredients,
  useCases,
  locales,
  onBack,
  onSaved,
}) => {
  const [locale, setLocale] = useState<string>(locales[0] ?? DEFAULT_LOCALE);

  // Re-seed whenever the product or active locale changes.
  const initialState = useMemo(() => seedState(product, locale), [product, locale]);
  const [state, setState] = useState<EditState>(initialState);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(initialState) !== JSON.stringify(state), [initialState, state]);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  const update = useCallback(<K extends keyof EditState>(key: K, value: EditState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const changeLocale = (next: string) => {
    if (next === locale) return;
    if (dirty && !window.confirm(`Discard unsaved changes to "${locale}" and switch to "${next}"?`)) return;
    setLocale(next);
  };

  // Option lists for the chip selects -------------------------------------

  // Option labels/images are themselves localized — resolve to the active locale.
  const tagOptions = useMemo<ChipOption[]>(
    () =>
      tags
        .filter((t) => t.id)
        .map((t) => ({
          id: t.id!,
          label: localize<string>(t.data?.name, locale) || t.name || '(Untitled tag)',
          color: t.data?.tagColor, // tagColor is not localized
          image: localize<string>(t.data?.image, locale),
        })),
    [tags, locale],
  );

  const categoryOptions = useMemo<ChipOption[]>(
    () =>
      categories
        .filter((c) => c.id)
        .map((c) => ({
          id: c.id!,
          label: localize<string>((c.data as any)?.name, locale) || c.name || '(Untitled category)',
        })),
    [categories, locale],
  );

  const ingredientOptions = useMemo<ChipOption[]>(
    () =>
      ingredients
        .filter((i) => i.id)
        .map((i) => ({
          id: i.id!,
          label: localize<string>((i.data as any)?.name, locale) || i.name || '(Untitled ingredient)',
        })),
    [ingredients, locale],
  );

  const useCaseOptions = useMemo<ChipOption[]>(
    () =>
      useCases
        .filter((u) => u.id)
        .map((u) => ({
          id: u.id!,
          label: localize<string>((u.data as any)?.name, locale) || u.name || '(Untitled use case)',
        })),
    [useCases, locale],
  );

  // Resolved chip lists for the live preview ------------------------------

  const tagOptionsById = useMemo(() => new Map(tagOptions.map((o) => [o.id, o])), [tagOptions]);

  const selectedTagChips = useMemo(
    () => state.tagIds.map((id) => tagOptionsById.get(id)).filter((o): o is ChipOption => Boolean(o)),
    [state.tagIds, tagOptionsById],
  );

  // Editable, product-driven inputs handed to the live preview. (Categories are
  // intentionally excluded — storefront cards don't render them.)
  const previewProduct = useMemo<PreviewProduct>(
    () => ({
      displayName: state.displayName,
      subHeading: state.subHeading,
      gridTagline: state.gridTagline,
      gridDescription: state.gridDescription,
      featuredImage: state.featuredImage,
      secondaryImage: state.secondaryImage,
      packagingSingular: state.packagingSingular,
      emojis: state.emojis,
      hidden: state.hidden,
      outOfStock: state.outOfStock,
      cartOutOfStock: state.cartOutOfStock,
      averageRating: product.data?.reviews?.averageRating,
      reviewCount: product.data?.reviews?.count,
      tags: selectedTagChips.map((c) => ({ id: c.id, label: c.label, color: c.color, image: c.image })),
    }),
    [state, product.data?.reviews?.averageRating, product.data?.reviews?.count, selectedTagChips],
  );

  // Save ------------------------------------------------------------------

  const handleSave = async () => {
    if (!product.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const raw = (product.data ?? {}) as Record<string, any>;

      // For a localized field, merge the new value into the existing
      // LocalizedValue (preserving other locales). Otherwise write flat.
      const put = (field: string, value: unknown) =>
        isProductFieldLocalized(field) ? setLocalized(raw[field], locale, value) : value;

      const dataPatch: Record<string, any> = {
        displayName: put('displayName', state.displayName),
        subHeading: put('subHeading', state.subHeading),
        gridTagline: put('gridTagline', state.gridTagline),
        gridDescription: put('gridDescription', state.gridDescription),
        shortDescription: put('shortDescription', state.shortDescription),
        featuredImage: put('featuredImage', state.featuredImage),
        secondaryImage: put('secondaryImage', state.secondaryImage),
        packagingLabels: {
          ...(raw.packagingLabels ?? {}),
          singular: isProductFieldLocalized('packagingLabels.singular')
            ? setLocalized(raw.packagingLabels?.singular, locale, state.packagingSingular)
            : state.packagingSingular,
          plural: isProductFieldLocalized('packagingLabels.plural')
            ? setLocalized(raw.packagingLabels?.plural, locale, state.packagingPlural)
            : state.packagingPlural,
        },
        emojis: put('emojis', state.emojis),
        hidden: put('hidden', state.hidden),
        outOfStock: put('outOfStock', state.outOfStock),
        cartOutOfStock: put('cartOutOfStock', state.cartOutOfStock),
        tags: put(
          'tags',
          state.tagIds.map((id) => ({ tag: buildReference(id, 'product-tag') })),
        ),
        categories: put(
          'categories',
          state.categoryIds.map((id) => ({ category: buildReference(id, 'product-category') })),
        ),
        ingredients: put(
          'ingredients',
          state.ingredientIds.map((id) => ({ ingredient: buildReference(id, 'product-ingredient') })),
        ),
        useCases: put(
          'useCases',
          state.useCaseIds.map((id) => ({ useCase: buildReference(id, 'product-use-case') })),
        ),
      };

      await api.saveProduct(product.id, dataPatch);

      const updated: BuilderProductContent = {
        ...product,
        data: { ...product.data, ...dataPatch } as BuilderProductContent['data'],
      };
      onSaved(updated);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setState(initialState);
    setSaveError(null);
  };

  const data = product.data;
  const internalName = data?.name;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer transition-colors"
      >
        ← Back to products
      </button>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {state.displayName || <span className="italic text-[var(--text-muted)]">Untitled product</span>}
          </h2>
          {internalName && <div className="text-xs text-[var(--text-muted)] font-mono mt-1">{internalName}</div>}
        </div>
        <div className="flex items-center gap-2">
          {product.id && (
            <a
              href={builderContentUrl(product.id)}
              target="_blank"
              rel="noopener noreferrer"
              title="Open this product in the Builder.io content editor"
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--accent)]"
            >
              Open in Builder.io
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
            </a>
          )}
          <button
            onClick={handleCancel}
            disabled={!dirty || saving}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-5 py-1.5 rounded-lg bg-[var(--accent)] text-[#1a1a2e] font-semibold text-xs cursor-pointer hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Saving...' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)] break-all">
          {saveError}
        </div>
      )}

      {/* Locale selector — localized fields are edited per-locale */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 py-3">
        <label
          htmlFor="locale-select"
          className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          Editing locale
        </label>
        <select
          id="locale-select"
          value={locale}
          onChange={(e) => changeLocale(e.target.value)}
          className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)]/50 focus:outline-none"
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {l === DEFAULT_LOCALE ? 'Default' : l}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-[var(--text-muted)]">
          Localized fields save only to this locale. Images, emojis, and stock flags are global.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* ---- Editor column ---- */}
        <div className="space-y-6">
          <Section title="Display" subtitle="What customers see on grids and product cards">
            <div className="space-y-4">
              <FormField label="Display Name" helper="The customer-facing name (localized)">
                <input
                  type="text"
                  value={state.displayName}
                  onChange={(e) => update('displayName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50"
                />
              </FormField>

              <FormField label="Product Headline (subheading)" helper="Tagline shown on product cards">
                <input
                  type="text"
                  value={state.subHeading}
                  onChange={(e) => update('subHeading', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50"
                />
              </FormField>

              <FormField
                label="Grid Tagline"
                helper="Optional override for the tagline shown on product grids. Falls back to Headline."
              >
                <input
                  type="text"
                  value={state.gridTagline}
                  onChange={(e) => update('gridTagline', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50"
                />
              </FormField>

              <FormField
                label="Grid Description"
                helper="Extra sub-heading shown on some cards (e.g. Centered / Boxed). Separate from the tagline."
              >
                <input
                  type="text"
                  value={state.gridDescription}
                  onChange={(e) => update('gridDescription', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50"
                />
              </FormField>

              <FormField label="Short Description (HTML)" helper="Typically shown on the PDP. HTML allowed.">
                <textarea
                  value={state.shortDescription}
                  onChange={(e) => update('shortDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50 resize-y"
                />
              </FormField>

              <FormField label="Featured Image URL" helper="Displayed on product cards. Paste a builder.io asset URL.">
                <input
                  type="text"
                  value={state.featuredImage}
                  onChange={(e) => update('featuredImage', e.target.value)}
                  placeholder="https://cdn.builder.io/api/v1/image/..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50"
                />
              </FormField>

              <FormField label="Secondary Image URL" helper="Shown on card hover for grids that support it.">
                <input
                  type="text"
                  value={state.secondaryImage}
                  onChange={(e) => update('secondaryImage', e.target.value)}
                  placeholder="https://cdn.builder.io/api/v1/image/..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50"
                />
              </FormField>
            </div>
          </Section>

          <Section
            title="Packaging & Flavor"
            subtitle="Unit labels and flavor emojis used on cards and the offer selector"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Packaging (singular)"
                  helper='e.g. "bottle" — used for "per bottle" on cards/offer selector'
                >
                  <input
                    type="text"
                    value={state.packagingSingular}
                    onChange={(e) => update('packagingSingular', e.target.value)}
                    placeholder="bottle"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50"
                  />
                </FormField>
                <FormField label="Packaging (plural)" helper='e.g. "bottles" — used for multi-quantity options'>
                  <input
                    type="text"
                    value={state.packagingPlural}
                    onChange={(e) => update('packagingPlural', e.target.value)}
                    placeholder="bottles"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50"
                  />
                </FormField>
              </div>

              <FormField
                label="Emojis"
                helper="Shown on the offer selector's flavor options and used for the add-to-cart confetti."
              >
                <TagInput value={state.emojis} onChange={(v) => update('emojis', v)} placeholder="Add emoji..." />
              </FormField>
            </div>
          </Section>

          <Section title="Stock & Visibility">
            <div className="space-y-3">
              <Toggle
                label="Hide product"
                helperText="Excludes this product from grids and search results."
                checked={state.hidden}
                onChange={(v) => update('hidden', v)}
              />
              <Toggle
                label="Out of Stock"
                helperText="Marks this product as out of stock everywhere; blocks purchase."
                checked={state.outOfStock}
                onChange={(v) => update('outOfStock', v)}
              />
              <Toggle
                label="Out of Stock (Site only)"
                helperText="Presents as out of stock on the site only — useful when still purchasable elsewhere."
                checked={state.cartOutOfStock}
                onChange={(v) => update('cartOutOfStock', v)}
              />
            </div>
          </Section>

          <Section
            title="Taxonomy"
            subtitle="Tags, categories, ingredients, and use cases used for filtering and discovery"
          >
            <div className="space-y-5">
              <ChipMultiSelect
                label="Tags"
                helperText='Used to cross-reference products and enable filtering (e.g. "New", "Best Seller")'
                options={tagOptions}
                selectedIds={state.tagIds}
                onChange={(ids) => update('tagIds', ids)}
                placeholder="Add tag..."
              />
              <ChipMultiSelect
                label="Categories"
                helperText="Categories this product belongs to — used for navigation and filtering"
                options={categoryOptions}
                selectedIds={state.categoryIds}
                onChange={(ids) => update('categoryIds', ids)}
                placeholder="Add category..."
              />
              <ChipMultiSelect
                label="Ingredients"
                helperText="Key ingredients in this product"
                options={ingredientOptions}
                selectedIds={state.ingredientIds}
                onChange={(ids) => update('ingredientIds', ids)}
                placeholder="Add ingredient..."
              />
              <ChipMultiSelect
                label="Use Cases"
                helperText="Goals or health benefits this product supports"
                options={useCaseOptions}
                selectedIds={state.useCaseIds}
                onChange={(ids) => update('useCaseIds', ids)}
                placeholder="Add use case..."
              />
            </div>
          </Section>
        </div>

        {/* ---- Preview column ---- */}
        <div>
          <ProductCardPreview product={previewProduct} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
