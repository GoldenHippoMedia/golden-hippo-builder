import React, { useMemo, useState } from 'react';
import { EmptyState } from '@goldenhippo/builder-ui';
import type {
  BuilderProductContent,
  BuilderProductTagContent,
  BuilderProductCategoryContent,
  BuilderIngredientContent,
  BuilderProductUseCaseContent,
} from '@goldenhippo/builder-shared-schemas';
import type { BuilderProductGroupContent } from '@goldenhippo/builder-cart-schemas';
import { localize } from '../localization';
import { builderContentUrl } from '../builder-urls';
import {
  buildListItems,
  filterListItems,
  isItemHidden,
  itemDisplayName,
  itemInternalName,
  groupProductCount,
  resolveGroupChildren,
  type ProductListItem,
} from '../list-items';

// The list shows the Default locale; the per-locale editor lives in the detail view.
const text = (v: unknown): string => localize<string>(v) ?? '';

/** Minimal shape every taxonomy content type shares for label resolution. */
type LabeledRef = { name?: string; data?: { name?: unknown } };

/**
 * Resolve a product's localized reference list (e.g. `data.tags`) to display
 * labels via an id→entry map. The list is itself localized, and each entry's
 * `name` is localized too. `refKey` is the wrapper field on each ref
 * (`tag`, `category`, `ingredient`, `useCase`).
 */
const resolveRefLabels = <T extends LabeledRef>(rawRefs: unknown, refKey: string, byId: Map<string, T>): string[] => {
  const refs = localize<Array<Record<string, { id?: string } | undefined>>>(rawRefs) ?? [];
  return refs
    .map((ref) => {
      const id = ref?.[refKey]?.id;
      if (!id) return null;
      const entry = byId.get(id);
      return text(entry?.data?.name) || entry?.name || null;
    })
    .filter((label): label is string => Boolean(label));
};

interface ProductListProps {
  products: BuilderProductContent[];
  groups?: BuilderProductGroupContent[];
  tagsById: Map<string, BuilderProductTagContent>;
  categoriesById: Map<string, BuilderProductCategoryContent>;
  ingredientsById: Map<string, BuilderIngredientContent>;
  useCasesById: Map<string, BuilderProductUseCaseContent>;
  onSelect: (productId: string) => void;
}

type ChipVariant = 'tag' | 'category' | 'ingredient' | 'useCase';

// Each taxonomy type gets its own color so the groups read as distinct at a
// glance (colors defined per-theme in builder-ui styles.css).
const CHIP_STYLES: Record<ChipVariant, string> = {
  tag: 'bg-[var(--tag)]/10 text-[var(--tag)] border-[var(--tag)]/30',
  category: 'bg-[var(--category)]/10 text-[var(--category)] border-[var(--category)]/30',
  ingredient: 'bg-[var(--ingredient)]/10 text-[var(--ingredient)] border-[var(--ingredient)]/30',
  useCase: 'bg-[var(--use-case)]/10 text-[var(--use-case)] border-[var(--use-case)]/30',
};

const TagChip: React.FC<{ label: string; variant?: ChipVariant }> = ({ label, variant = 'tag' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${CHIP_STYLES[variant]}`}
  >
    {label}
  </span>
);

/**
 * A labeled row of chips ("Categories: [a] [b]") with a shared empty-state
 * placeholder, so categories and tags render through the same markup.
 */
const ChipGroup: React.FC<{
  label: string;
  labels: string[];
  emptyText: string;
  variant: ChipVariant;
}> = ({ label, labels, emptyText, variant }) => (
  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
    <span className="text-[11px] font-medium text-[var(--text-muted)]">{label}:</span>
    {labels.length > 0 ? (
      labels.map((l, i) => <TagChip key={`${l}-${i}`} label={l} variant={variant} />)
    ) : (
      <span className="text-[11px] text-[var(--text-muted)] italic">{emptyText}</span>
    )}
  </div>
);

const HiddenPill: React.FC = () => (
  <span
    className="inline-flex items-center gap-1 rounded-md border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--warning)]"
    title="Hidden — not shown in product grids or search"
  >
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
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
    Hidden
  </span>
);

/**
 * Renders the product image exactly as the storefront `cart-line` component
 * does — a 64px white, bordered, object-cover box — so images that crop badly
 * or vanish on the cart's white background are obvious here, not in production.
 * Mirrors cart-line.component.html's imageContainerTemplate (white is the
 * default cart background; brands can override imageContainerBGColor).
 */
const CartLineThumb: React.FC<{ src?: string; alt: string; caption?: string; hidden?: boolean }> = ({
  src,
  alt,
  caption,
  hidden,
}) => (
  <div className="flex flex-shrink-0 flex-col items-center gap-1">
    {hidden && <HiddenPill />}
    <div
      className="flex h-16 w-16 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-[#d1d5db] bg-white"
      title="Shown exactly as it renders in the cart line"
    >
      {src ? (
        <figure className="h-full w-full">
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        </figure>
      ) : (
        <span className="text-[10px] text-[#9ca3af]">No image</span>
      )}
    </div>
    {caption && <span className="font-bold text-sm text-xs tracking-wide uppercase">{caption}</span>}
  </div>
);

const ProductRow: React.FC<{
  product: BuilderProductContent;
  hidden: boolean;
  tagLabels: string[];
  categoryLabels: string[];
  ingredientLabels: string[];
  useCaseLabels: string[];
  onSelect: () => void;
}> = ({ product, hidden, tagLabels, categoryLabels, ingredientLabels, useCaseLabels, onSelect }) => {
  const data = product.data;
  const displayName = text(data?.displayName) || data?.name || '(Untitled product)';
  const image = data?.featuredImage;

  const internalName = data?.name;
  const showInternalName = Boolean(internalName) && internalName !== displayName;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors ${hidden ? 'opacity-50' : ''}`}
    >
      <CartLineThumb src={image} alt={displayName} hidden={hidden} />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{displayName}</div>
        {showInternalName && <div className="text-[11px] text-[var(--text-muted)] truncate">{internalName}</div>}
        <ChipGroup label="Tags" labels={tagLabels} emptyText="No tags assigned" variant="tag" />
        <ChipGroup label="Categories" labels={categoryLabels} emptyText="No categories assigned" variant="category" />
        <ChipGroup
          label="Ingredients"
          labels={ingredientLabels}
          emptyText="No ingredients assigned"
          variant="ingredient"
        />
        <ChipGroup label="Use Cases" labels={useCaseLabels} emptyText="No use cases assigned" variant="useCase" />
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {product.id && (
          <a
            href={builderContentUrl(product.id)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open this product in the Builder.io content editor"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--accent)]"
          >
            Builder
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
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] hover:text-[var(--accent)] transition-colors"
          onClick={onSelect}
        >
          View details →
        </button>
      </div>
    </div>
  );
};

const GroupRow: React.FC<{ group: BuilderProductGroupContent; li: ProductListItem }> = ({ group, li }) => {
  const data = group.data;
  const displayName = itemDisplayName(li);
  const image = data?.featuredImage;
  const hidden = isItemHidden(li);
  const count = groupProductCount(li);

  const internalName = itemInternalName(li);
  const showInternalName = Boolean(internalName) && internalName !== displayName;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors ${hidden ? 'opacity-50' : ''}`}
    >
      <CartLineThumb src={image} alt={displayName} caption="GROUP" hidden={hidden} />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{displayName}</div>
        {showInternalName && <div className="text-[11px] text-[var(--text-muted)] truncate">{internalName}</div>}
        <div className="mt-1.5 text-[11px] text-[var(--text-muted)]">
          {count} product{count === 1 ? '' : 's'}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {group.id && (
          <a
            href={builderContentUrl(group.id)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open this product group in the Builder.io content editor"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--accent)]"
          >
            Builder
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
      </div>
    </div>
  );
};

const ProductList: React.FC<ProductListProps> = ({
  products,
  groups = [],
  tagsById,
  categoriesById,
  ingredientsById,
  useCasesById,
  onSelect,
}) => {
  const [query, setQuery] = useState('');

  const productsById = useMemo(() => {
    const map = new Map<string, BuilderProductContent>();
    products.forEach((p) => {
      if (p.id) map.set(p.id, p);
    });
    return map;
  }, [products]);

  const items = useMemo(() => buildListItems(products, groups), [products, groups]);
  const filtered = useMemo(() => filterListItems(items, query, productsById), [items, query, productsById]);

  // Products (top-level or nested under a group) all render through the same row.
  const renderProductRow = (product: BuilderProductContent, key: string) => (
    <ProductRow
      key={key}
      product={product}
      hidden={isItemHidden({ kind: 'product', item: product })}
      tagLabels={resolveRefLabels(product.data?.tags, 'tag', tagsById)}
      categoryLabels={resolveRefLabels(product.data?.categories, 'category', categoriesById)}
      ingredientLabels={resolveRefLabels(product.data?.ingredients, 'ingredient', ingredientsById)}
      useCaseLabels={resolveRefLabels(product.data?.useCases, 'useCase', useCasesById)}
      onSelect={() => product.id && onSelect(product.id)}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products by name..."
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50"
        />
        <span className="text-xs text-[var(--text-muted)] tabular-nums">
          {filtered.length} of {items.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={query ? `No products match "${query}"` : 'No products are configured for this brand yet.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((li, i) => {
            if (li.kind !== 'group') return renderProductRow(li.item, li.item.id ?? `product-row-${i}`);
            const children = resolveGroupChildren(li.item, productsById);
            return (
              <div key={li.item.id ?? `group-row-${i}`} className="space-y-2">
                <GroupRow group={li.item} li={li} />
                {children.map((child, j) => {
                  const childKey = child.id ?? `group-${i}-child-${j}`;
                  const isLast = j === children.length - 1;
                  return (
                    // Tree connectors: a vertical line down the indent gutter (extended up
                    // 0.5rem to bridge the row gap) with an elbow to each child; the last
                    // child stops the vertical at the elbow to close the branch (└ vs ├).
                    <div key={childKey} className="relative ml-4 pl-6">
                      <span
                        aria-hidden="true"
                        className={`absolute left-2 top-[-0.5rem] w-px bg-[var(--border-glass)] ${
                          isLast ? 'h-[calc(50%_+_0.5rem)]' : 'h-[calc(100%_+_0.5rem)]'
                        }`}
                      />
                      <span aria-hidden="true" className="absolute left-2 top-1/2 h-px w-4 bg-[var(--border-glass)]" />
                      {renderProductRow(child, childKey)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
