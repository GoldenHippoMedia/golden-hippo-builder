import React, { useMemo, useState } from 'react';
import { EmptyState } from '@goldenhippo/builder-ui';
import type { BuilderProductContent, BuilderProductTagContent } from '@goldenhippo/builder-shared-schemas';
import { localize } from '../localization';
import { builderContentUrl } from '../builder-urls';

// The list shows the Default locale; the per-locale editor lives in the detail view.
const text = (v: unknown): string => localize<string>(v) ?? '';

const normalize = (v: string): string => v.toLowerCase().replace(/[^a-z0-9]/g, '');

interface ProductListProps {
  products: BuilderProductContent[];
  tagsById: Map<string, BuilderProductTagContent>;
  onSelect: (productId: string) => void;
}

const TagChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20">
    {label}
  </span>
);

/**
 * Renders the product image exactly as the storefront `cart-line` component
 * does — a 64px white, bordered, object-cover box — so images that crop badly
 * or vanish on the cart's white background are obvious here, not in production.
 * Mirrors cart-line.component.html's imageContainerTemplate (white is the
 * default cart background; brands can override imageContainerBGColor).
 */
const CartLineThumb: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => (
  <div
    className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-[#d1d5db] bg-white"
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
);

const ProductRow: React.FC<{
  product: BuilderProductContent;
  tagLabels: string[];
  onSelect: () => void;
}> = ({ product, tagLabels, onSelect }) => {
  const data = product.data;
  const displayName = text(data?.displayName) || data?.name || '(Untitled product)';
  const image = data?.featuredImage;

  const internalName = data?.name;
  const showInternalName = Boolean(internalName) && internalName !== displayName;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors">
      <CartLineThumb src={image} alt={displayName} />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{displayName}</div>
        {showInternalName && <div className="text-[11px] text-[var(--text-muted)] truncate">{internalName}</div>}
        {tagLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {tagLabels.map((label, i) => (
              <TagChip key={`${label}-${i}`} label={label} />
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-[var(--text-muted)] mt-1.5 italic">No tags assigned</div>
        )}
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

const ProductList: React.FC<ProductListProps> = ({ products, tagsById, onSelect }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return products;
    return products.filter((p) => {
      //Combined display name and product name as search key so both are findable.
      const haystack = normalize(`${text(p.data?.displayName)} ${p.data?.name ?? ''}`);
      return haystack.includes(q);
    });
  }, [products, query]);

  const resolveTagLabels = (product: BuilderProductContent): string[] => {
    // The tags list is itself localized; resolve to Default, then resolve each
    // referenced tag's (localized) name.
    const refs = localize<NonNullable<BuilderProductContent['data']>['tags']>(product.data?.tags) ?? [];
    return refs
      .map((ref) => {
        const tagId = (ref?.tag as { id?: string } | undefined)?.id;
        if (!tagId) return null;
        const entry = tagsById.get(tagId);
        return text(entry?.data?.name) || entry?.name || null;
      })
      .filter((label): label is string => Boolean(label));
  };

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
          {filtered.length} of {products.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={query ? `No products match "${query}"` : 'No products are configured for this brand yet.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              tagLabels={resolveTagLabels(product)}
              onSelect={() => product.id && onSelect(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
