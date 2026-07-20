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
import { localize, DEFAULT_LOCALE } from '../localization';
import {
  isProductFieldLocalized,
  PRODUCT_FORM_FIELDS,
  PRODUCT_FORM_FIELD_BY_KEY,
  type ProductFormField,
  type FieldSection,
} from '../product-fields';
import { FLAT, buildFieldPatch, readFieldValue, setByPath } from '../product-data';
import { builderContentUrl } from '../builder-urls';

interface ProductDetailProps {
  product: BuilderProductContent;
  api: BuilderApi;
  tags: BuilderProductTagContent[];
  categories: BuilderProductCategoryContent[];
  ingredients: BuilderIngredientContent[];
  useCases: BuilderProductUseCaseContent[];
  locales: string[];
  /** When false, the user has read-only access — editing controls are disabled. */
  canWrite: boolean;
  onBack: () => void;
  onSaved: (updated: BuilderProductContent) => void;
}

type ValueBag = Record<string, unknown>;

const LOCALIZED_KEYS = PRODUCT_FORM_FIELDS.filter((f) => isProductFieldLocalized(f.modelField)).map((f) => f.key);

// Per-field locale control shown in each field's label row
const FieldLocaleControl: React.FC<{
  localized: boolean;
  locales: string[];
  value?: string;
  onChange?: (locale: string) => void;
}> = ({ localized, locales, value, onChange }) => {
  if (!localized) {
    return (
      <span
        title="This field is not localized — its value applies to all locales"
        className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border-glass)]"
      >
        Global
      </span>
    );
  }
  if (locales.length <= 1) {
    return (
      <span
        title="This field is localized — only the Default locale exists so far"
        className="text-[10px] font-medium uppercase tracking-wider text-[var(--accent)] px-1.5 py-0.5 rounded border border-[var(--accent)]/30"
      >
        Localized
      </span>
    );
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      title="Locale for this field — edits save only to the selected locale"
      className="rounded-md border border-[var(--border-glass)] bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] text-[var(--text-primary)] focus:border-[var(--accent)]/50 focus:outline-none"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {l === DEFAULT_LOCALE ? 'Default' : l}
        </option>
      ))}
    </select>
  );
};

const Toggle: React.FC<{
  label: string;
  helperText?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accessory?: React.ReactNode;
}> = ({ label, helperText, checked, onChange, accessory }) => (
  <div className="flex items-start justify-between gap-3">
    <label className="flex items-start gap-3 cursor-pointer flex-1">
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
    {accessory && <div className="pt-0.5 flex-shrink-0">{accessory}</div>}
  </div>
);

// Section presentation. Descriptors declare which section a field belongs to;
// this declares how each section looks and the order they render in.
const SECTIONS: { id: FieldSection; title: string; subtitle?: string; bodyClass: string }[] = [
  {
    id: 'display',
    title: 'Display',
    subtitle: 'What customers see on grids and product cards',
    bodyClass: 'space-y-4',
  },
  {
    id: 'packaging',
    title: 'Packaging & Flavor',
    subtitle: 'Unit labels and flavor emojis used on cards and the offer selector',
    bodyClass: 'space-y-4',
  },
  { id: 'stock', title: 'Stock & Visibility', bodyClass: 'space-y-3' },
  {
    id: 'taxonomy',
    title: 'Taxonomy',
    subtitle: 'Tags, categories, ingredients, and use cases used for filtering and discovery',
    bodyClass: 'space-y-5',
  },
];

const textInputClass = (mono?: boolean): string =>
  `w-full px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50${
    mono ? ' font-mono' : ''
  }`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  api,
  tags,
  categories,
  ingredients,
  useCases,
  locales,
  canWrite,
  onBack,
  onSaved,
}) => {
  const defaultLocale = locales[0] ?? DEFAULT_LOCALE;

  const [fieldLocale, setFieldLocale] = useState<Record<string, string>>(() =>
    Object.fromEntries(LOCALIZED_KEYS.map((k) => [k, defaultLocale])),
  );

  // Pending edits, keyed [field key][locale slot]. Localized fields key by their
  // active locale; non-localized fields key by FLAT. Only entries that differ
  // from the saved value are kept — so `buffer` being empty means "not dirty",
  // and edits to one locale of a field survive switching to another and back.
  const [buffer, setBuffer] = useState<Record<string, Record<string, unknown>>>({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset when a different product is opened.
  useEffect(() => {
    setBuffer({});
    setFieldLocale(Object.fromEntries(LOCALIZED_KEYS.map((k) => [k, defaultLocale])));
    setSaveError(null);
  }, [product.id, defaultLocale]);

  const localeSlot = (d: ProductFormField): string =>
    isProductFieldLocalized(d.modelField) ? fieldLocale[d.key] : FLAT;
  const activeLocale = (d: ProductFormField): string =>
    isProductFieldLocalized(d.modelField) ? fieldLocale[d.key] : DEFAULT_LOCALE;

  // Visible values for the active per-field locales (buffered edit, else raw).
  const state = useMemo<ValueBag>(() => {
    const data = (product.data ?? {}) as any;
    const bag: ValueBag = {};
    for (const d of PRODUCT_FORM_FIELDS) {
      const slot = localeSlot(d);
      const edits = buffer[d.key];
      bag[d.key] = edits && slot in edits ? edits[slot] : readFieldValue(data, d, activeLocale(d));
    }
    return bag;
  }, [buffer, fieldLocale, product]);

  const str = (key: string): string => (typeof state[key] === 'string' ? (state[key] as string) : '');
  const arr = (key: string): string[] => (Array.isArray(state[key]) ? (state[key] as string[]) : []);
  const bool = (key: string): boolean => Boolean(state[key]);

  const dirty = useMemo(() => Object.keys(buffer).length > 0, [buffer]);

  // Update a field's value for its currently-active locale (or the global slot).
  // Values equal to the saved baseline clear their buffer entry so `dirty` stays honest.
  const update = useCallback(
    (key: string, value: unknown) => {
      // Read-only users can't stage edits — controlled inputs simply won't change.
      if (!canWrite) return;
      const d = PRODUCT_FORM_FIELD_BY_KEY.get(key);
      if (!d) return;
      const slot = localeSlot(d);
      const baseline = readFieldValue((product.data ?? {}) as any, d, activeLocale(d));
      setBuffer((prev) => {
        const fieldBuf = { ...(prev[key] ?? {}) };
        if (JSON.stringify(value) === JSON.stringify(baseline)) {
          delete fieldBuf[slot];
        } else {
          fieldBuf[slot] = value;
        }
        const next = { ...prev };
        if (Object.keys(fieldBuf).length === 0) delete next[key];
        else next[key] = fieldBuf;
        return next;
      });
    },
    [fieldLocale, product, canWrite],
  );

  const changeFieldLocale = useCallback((key: string, next: string) => {
    // No confirmation needed: edits to the current locale are preserved in the
    // buffer and reappear if the user switches back.
    setFieldLocale((prev) => ({ ...prev, [key]: next }));
  }, []);

  const localeControl = (d: ProductFormField) => (
    <FieldLocaleControl
      localized={isProductFieldLocalized(d.modelField)}
      locales={locales}
      value={fieldLocale[d.key]}
      onChange={(l) => changeFieldLocale(d.key, l)}
    />
  );

  // Option lists for the chip selects -------------------------------------

  // Option labels/images are themselves localized — resolve to the locale that
  // field is currently being edited in.
  const tagOptions = useMemo<ChipOption[]>(
    () =>
      tags
        .filter((t) => t.id)
        .map((t) => ({
          id: t.id!,
          label: localize<string>(t.data?.name, fieldLocale.tagIds) || t.name || '(Untitled tag)',
          color: t.data?.tagColor, // tagColor is not localized
          image: localize<string>(t.data?.image, fieldLocale.tagIds),
        })),
    [tags, fieldLocale.tagIds],
  );

  const categoryOptions = useMemo<ChipOption[]>(
    () =>
      categories
        .filter((c) => c.id)
        .map((c) => ({
          id: c.id!,
          label: localize<string>((c.data as any)?.name, fieldLocale.categoryIds) || c.name || '(Untitled category)',
        })),
    [categories, fieldLocale.categoryIds],
  );

  const ingredientOptions = useMemo<ChipOption[]>(
    () =>
      ingredients
        .filter((i) => i.id)
        .map((i) => ({
          id: i.id!,
          label:
            localize<string>((i.data as any)?.name, fieldLocale.ingredientIds) || i.name || '(Untitled ingredient)',
        })),
    [ingredients, fieldLocale.ingredientIds],
  );

  const useCaseOptions = useMemo<ChipOption[]>(
    () =>
      useCases
        .filter((u) => u.id)
        .map((u) => ({
          id: u.id!,
          label: localize<string>((u.data as any)?.name, fieldLocale.useCaseIds) || u.name || '(Untitled use case)',
        })),
    [useCases, fieldLocale.useCaseIds],
  );

  // Reference option lists keyed by the descriptor key that consumes them.
  const optionsByKey = useMemo<Record<string, ChipOption[]>>(
    () => ({
      tagIds: tagOptions,
      categoryIds: categoryOptions,
      ingredientIds: ingredientOptions,
      useCaseIds: useCaseOptions,
    }),
    [tagOptions, categoryOptions, ingredientOptions, useCaseOptions],
  );

  // Resolved chip lists for the live preview ------------------------------

  const tagOptionsById = useMemo(() => new Map(tagOptions.map((o) => [o.id, o])), [tagOptions]);

  const selectedTagChips = useMemo(
    () =>
      arr('tagIds')
        .map((id) => tagOptionsById.get(id))
        .filter((o): o is ChipOption => Boolean(o)),
    [state.tagIds, tagOptionsById],
  );

  const previewProduct = useMemo<PreviewProduct>(
    () => ({
      displayName: str('displayName'),
      subHeading: str('subHeading'),
      gridTagline: str('gridTagline'),
      gridDescription: str('gridDescription'),
      featuredImage: str('featuredImage'),
      secondaryImage: str('secondaryImage'),
      packagingSingular: str('packagingSingular'),
      emojis: arr('emojis'),
      hidden: bool('hidden'),
      outOfStock: bool('outOfStock'),
      cartOutOfStock: bool('cartOutOfStock'),
      averageRating: product.data?.reviews?.averageRating,
      reviewCount: product.data?.reviews?.count,
      tags: selectedTagChips.map((c) => ({ id: c.id, label: c.label, color: c.color, image: c.image })),
    }),
    [state, product.data?.reviews?.averageRating, product.data?.reviews?.count, selectedTagChips],
  );

  const handleSave = async () => {
    if (!canWrite || !product.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const raw = (product.data ?? {}) as Record<string, any>;
      const dataPatch: Record<string, any> = {};

      for (const d of PRODUCT_FORM_FIELDS) {
        const edits = buffer[d.key];
        if (!edits || Object.keys(edits).length === 0) continue;
        setByPath(dataPatch, raw, d.modelField, buildFieldPatch(d, raw, edits));
      }

      if (Object.keys(dataPatch).length === 0) {
        setSaving(false);
        return;
      }

      await api.saveProduct(product.id, dataPatch);

      const updated: BuilderProductContent = {
        ...product,
        data: { ...product.data, ...dataPatch } as BuilderProductContent['data'],
      };
      onSaved(updated);
      setBuffer({});
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBuffer({});
    setSaveError(null);
  };

  const renderField = (d: ProductFormField): React.ReactNode => {
    const accessory = localeControl(d);
    switch (d.control) {
      case 'text':
        return (
          <FormField key={d.key} label={d.label} helper={d.helper} labelAccessory={accessory}>
            <input
              type="text"
              value={str(d.key)}
              placeholder={d.placeholder}
              onChange={(e) => update(d.key, e.target.value)}
              className={textInputClass(d.mono)}
            />
          </FormField>
        );
      case 'textarea':
        return (
          <FormField key={d.key} label={d.label} helper={d.helper} labelAccessory={accessory}>
            <textarea
              value={str(d.key)}
              onChange={(e) => update(d.key, e.target.value)}
              rows={3}
              className={`${textInputClass(true)} resize-y`}
            />
          </FormField>
        );
      case 'tags':
        return (
          <FormField key={d.key} label={d.label} helper={d.helper} labelAccessory={accessory}>
            <TagInput value={arr(d.key)} onChange={(v) => update(d.key, v)} placeholder={d.placeholder} />
          </FormField>
        );
      case 'toggle':
        return (
          <Toggle
            key={d.key}
            label={d.label}
            helperText={d.helper}
            checked={bool(d.key)}
            onChange={(v) => update(d.key, v)}
            accessory={accessory}
          />
        );
      case 'refs':
        return (
          <ChipMultiSelect
            key={d.key}
            label={d.label}
            helperText={d.helper}
            options={optionsByKey[d.key] ?? []}
            selectedIds={arr(d.key)}
            onChange={(ids) => update(d.key, ids)}
            placeholder={d.placeholder}
            labelAccessory={accessory}
          />
        );
      default: {
        const _exhaustive: never = d.control;
        return _exhaustive;
      }
    }
  };

  const renderSectionBody = (sectionId: FieldSection): React.ReactNode => {
    const fields = PRODUCT_FORM_FIELDS.filter((f) => f.section === sectionId);
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < fields.length; ) {
      if (fields[i].width === 'half') {
        const run: ProductFormField[] = [];
        while (i < fields.length && fields[i].width === 'half') run.push(fields[i++]);
        nodes.push(
          <div key={`row-${run[0].key}`} className="grid grid-cols-2 gap-4">
            {run.map(renderField)}
          </div>,
        );
      } else {
        nodes.push(renderField(fields[i++]));
      }
    }
    return nodes;
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
            {str('displayName') || <span className="italic text-[var(--text-muted)]">Untitled product</span>}
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
          {canWrite ? (
            <>
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
            </>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--warning)]/15 text-[var(--warning)]">
              Read-only access
            </span>
          )}
        </div>
      </div>

      {!canWrite && (
        <div className="mb-4 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20 px-4 py-3 text-sm text-[var(--warning)]">
          You have read-only access to Product Config. Fields can be viewed but not edited.
        </div>
      )}

      {saveError && (
        <div className="mb-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)] break-all">
          {saveError}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 py-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Each field is localized individually, matching the product model. Use the selector on a{' '}
        <span className="font-semibold text-[var(--accent)]">Localized</span> field to choose which locale you're
        editing — other locales are preserved on save. Fields marked{' '}
        <span className="font-semibold text-[var(--text-secondary)]">Global</span> apply to every locale.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* ---- Editor column (generated from field descriptors) ---- */}
        <div className="space-y-6">
          {SECTIONS.map((sec) => (
            <Section key={sec.id} title={sec.title} subtitle={sec.subtitle}>
              <div className={sec.bodyClass}>{renderSectionBody(sec.id)}</div>
            </Section>
          ))}
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
