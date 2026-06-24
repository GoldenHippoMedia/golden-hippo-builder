import React, { useMemo, useState } from 'react';
import { EmptyState } from '@goldenhippo/builder-ui';
import type { BuilderProductContent, BuilderProductTagContent } from '@goldenhippo/builder-shared-schemas';

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

const ProductRow: React.FC<{
  product: BuilderProductContent;
  tagLabels: string[];
  onSelect: () => void;
}> = ({ product, tagLabels, onSelect }) => {
  const data = product.data;
  const displayName = data?.displayName || data?.name || '(Untitled product)';
  const image = data?.featuredImage;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-glass)] flex-shrink-0">
        {image ? (
          <img src={image} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[10px]">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{displayName}</div>
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

      <button
        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] hover:text-[var(--accent)] transition-colors flex-shrink-0"
        onClick={onSelect}
      >
        View details →
      </button>
    </div>
  );
};

const ProductList: React.FC<ProductListProps> = ({ products, tagsById, onSelect }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = (p.data?.displayName || p.data?.name || '').toLowerCase();
      return name.includes(q);
    });
  }, [products, query]);

  const resolveTagLabels = (product: BuilderProductContent): string[] => {
    const refs = product.data?.tags ?? [];
    return refs
      .map((ref) => {
        const tagId = (ref?.tag as { id?: string } | undefined)?.id;
        if (!tagId) return null;
        const entry = tagsById.get(tagId);
        return entry?.data?.name || entry?.name || null;
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
