import React, { useCallback, useMemo, useState } from 'react';
import { Section, FormField } from '@goldenhippo/builder-ui';
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

interface ProductDetailProps {
  product: BuilderProductContent;
  api: BuilderApi;
  tags: BuilderProductTagContent[];
  categories: BuilderProductCategoryContent[];
  ingredients: BuilderIngredientContent[];
  useCases: BuilderProductUseCaseContent[];
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
  shortDescription: string;
  featuredImage: string;
  hidden: boolean;
  outOfStock: boolean;
  cartOutOfStock: boolean;
  tagIds: string[];
  categoryIds: string[];
  ingredientIds: string[];
  useCaseIds: string[];
}

const seedState = (product: BuilderProductContent): EditState => {
  const d = product.data;
  const extractIds = (list: { [key: string]: { id?: string } | undefined }[] | undefined, key: string): string[] => {
    if (!list) return [];
    return list.map((entry) => entry?.[key]?.id).filter((id): id is string => Boolean(id));
  };

  return {
    displayName: d?.displayName ?? '',
    subHeading: d?.subHeading ?? '',
    gridTagline: d?.gridTagline ?? '',
    shortDescription: d?.shortDescription ?? '',
    featuredImage: d?.featuredImage ?? '',
    hidden: Boolean(d?.hidden),
    outOfStock: Boolean(d?.outOfStock),
    cartOutOfStock: Boolean(d?.cartOutOfStock),
    tagIds: extractIds(d?.tags as any, 'tag'),
    categoryIds: extractIds(d?.categories as any, 'category'),
    ingredientIds: extractIds(d?.ingredients as any, 'ingredient'),
    useCaseIds: extractIds(d?.useCases as any, 'useCase'),
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
  onBack,
  onSaved,
}) => {
  const initialState = useMemo(() => seedState(product), [product]);
  const [state, setState] = useState<EditState>(initialState);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(initialState) !== JSON.stringify(state), [initialState, state]);

  const update = useCallback(<K extends keyof EditState>(key: K, value: EditState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  // Option lists for the chip selects -------------------------------------

  const tagOptions = useMemo<ChipOption[]>(
    () =>
      tags
        .filter((t) => t.id)
        .map((t) => ({
          id: t.id!,
          label: t.data?.name || t.name || '(Untitled tag)',
          color: t.data?.tagColor,
        })),
    [tags],
  );

  const categoryOptions = useMemo<ChipOption[]>(
    () =>
      categories
        .filter((c) => c.id)
        .map((c) => ({
          id: c.id!,
          label: ((c.data as any)?.name as string) || c.name || '(Untitled category)',
        })),
    [categories],
  );

  const ingredientOptions = useMemo<ChipOption[]>(
    () =>
      ingredients
        .filter((i) => i.id)
        .map((i) => ({
          id: i.id!,
          label: ((i.data as any)?.name as string) || i.name || '(Untitled ingredient)',
        })),
    [ingredients],
  );

  const useCaseOptions = useMemo<ChipOption[]>(
    () =>
      useCases
        .filter((u) => u.id)
        .map((u) => ({
          id: u.id!,
          label: ((u.data as any)?.name as string) || u.name || '(Untitled use case)',
        })),
    [useCases],
  );

  // Resolved chip lists for the live preview ------------------------------

  const tagOptionsById = useMemo(() => new Map(tagOptions.map((o) => [o.id, o])), [tagOptions]);
  const categoryOptionsById = useMemo(() => new Map(categoryOptions.map((o) => [o.id, o])), [categoryOptions]);

  const selectedTagChips = useMemo(
    () => state.tagIds.map((id) => tagOptionsById.get(id)).filter((o): o is ChipOption => Boolean(o)),
    [state.tagIds, tagOptionsById],
  );
  const selectedCategoryChips = useMemo(
    () => state.categoryIds.map((id) => categoryOptionsById.get(id)).filter((o): o is ChipOption => Boolean(o)),
    [state.categoryIds, categoryOptionsById],
  );

  // Save ------------------------------------------------------------------

  const handleSave = async () => {
    if (!product.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const dataPatch: Record<string, any> = {
        displayName: state.displayName,
        subHeading: state.subHeading,
        gridTagline: state.gridTagline,
        shortDescription: state.shortDescription,
        featuredImage: state.featuredImage,
        hidden: state.hidden,
        outOfStock: state.outOfStock,
        cartOutOfStock: state.cartOutOfStock,
        tags: state.tagIds.map((id) => ({ tag: buildReference(id, 'product-tag') })),
        categories: state.categoryIds.map((id) => ({ category: buildReference(id, 'product-category') })),
        ingredients: state.ingredientIds.map((id) => ({
          ingredient: buildReference(id, 'product-ingredient'),
        })),
        useCases: state.useCaseIds.map((id) => ({ useCase: buildReference(id, 'product-use-case') })),
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
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
          <ProductCardPreview
            displayName={state.displayName}
            subHeading={state.subHeading}
            gridTagline={state.gridTagline}
            featuredImage={state.featuredImage}
            hidden={state.hidden}
            outOfStock={state.outOfStock}
            cartOutOfStock={state.cartOutOfStock}
            averageRating={data?.reviews?.averageRating}
            reviewCount={data?.reviews?.count}
            tagChips={selectedTagChips}
            categoryChips={selectedCategoryChips}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
