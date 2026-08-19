import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type BuilderProductContent } from '@goldenhippo/builder-cart-schemas';

interface ProductPickerProps {
  products: BuilderProductContent[];
  /** Builder entry id of the selected product, or '' when nothing is picked. */
  valueId: string;
  onSelect: (id: string) => void;
  /** Entry ids already used by sibling rows — listed but not selectable again. */
  excludeIds?: string[];
  /** Catalog fetch in flight — distinguishes "still loading" from "brand has no products". */
  loading?: boolean;
  /** Catalog fetch failed — distinguishes a broken request from an empty catalog. */
  error?: string | null;
  disabled?: boolean;
  /** Name cached on the stored reference, shown when the entry is missing from the catalog. */
  fallbackName?: string;
}

interface ProductOption {
  id: string;
  name: string;
  /** Salesforce product family id — what the cart matches an order's line items against. */
  productionId: string;
  type: string;
  /** Drafts are pickable (the editor lists them too) but flagged so it's a deliberate choice. */
  draft: boolean;
}

/** A brand can carry hundreds of products; the search box is the way through, not a long list. */
const MAX_VISIBLE = 50;

const toOption = (product: BuilderProductContent): ProductOption => ({
  id: product.id ?? '',
  name: product.name || product.id || 'Untitled product',
  productionId: product.data?.gh?.productionId ?? '',
  type: product.data?.gh?.type ?? '',
  draft: product.published !== 'published',
});

const matchesQuery = (option: ProductOption, q: string): boolean =>
  option.name.toLowerCase().includes(q) || option.productionId.toLowerCase().includes(q);

const ProductPicker: React.FC<ProductPickerProps> = ({
  products,
  valueId,
  onSelect,
  excludeIds = [],
  loading = false,
  error = null,
  disabled = false,
  fallbackName,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => products.map(toOption).sort((a, b) => a.name.localeCompare(b.name)), [products]);
  const selected = useMemo(() => options.find((option) => option.id === valueId), [options, valueId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((option) => matchesQuery(option, q)) : options;
  }, [options, query]);
  const matches = useMemo(() => filtered.slice(0, MAX_VISIBLE), [filtered]);

  const taken = useMemo(() => new Set(excludeIds.filter((id) => id && id !== valueId)), [excludeIds, valueId]);

  // Reset the highlight whenever the visible set changes under it.
  useEffect(() => setActiveIndex(0), [query, open]);

  const choose = (option: ProductOption) => {
    if (taken.has(option.id)) return;
    onSelect(option.id);
    setOpen(false);
    setQuery('');
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const next = Math.max(0, Math.min(matches.length - 1, activeIndex + (e.key === 'ArrowDown' ? 1 : -1)));
      setActiveIndex(next);
      listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter' && open && matches[activeIndex]) {
      e.preventDefault();
      choose(matches[activeIndex]);
    }
  };

  const placeholder = loading
    ? 'Loading products…'
    : error
      ? 'Products unavailable'
      : options.length
        ? 'Search products…'
        : 'No products available';

  const displayName = selected?.name ?? (valueId ? (fallbackName ?? 'Unknown product') : '');
  const missingProductionId = Boolean(selected && !selected.productionId);

  return (
    <div className="relative min-w-[200px] flex-1">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        className="hippo-input pr-8!"
        placeholder={placeholder}
        value={open ? query : displayName}
        disabled={disabled || (!options.length && !valueId)}
        title={selected?.productionId ? `Family ID: ${selected.productionId}` : undefined}
        onFocus={() => setOpen(true)}
        // Delayed so a click on an option lands before the list unmounts.
        onBlur={() => setTimeout(close, 150)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {valueId && !open && !disabled && (
        <button
          type="button"
          aria-label="Clear product"
          onClick={() => onSelect('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded px-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          ✕
        </button>
      )}

      {missingProductionId && !open && (
        <p className="mt-1 text-[11px] text-[var(--warning)]">
          This product has no Production ID, so the cart can never match it to an order.
        </p>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)] shadow-lg">
          <div ref={listRef} className="max-h-64 overflow-y-auto">
            {matches.map((option, index) => {
              const isTaken = taken.has(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isTaken}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(option);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs ${
                    isTaken ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                  } ${index === activeIndex && !isTaken ? 'bg-[var(--bg-glass-hover)]' : ''} ${
                    option.id === valueId ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <span className="flex-1 truncate">{option.name}</span>
                  {option.draft && (
                    <span
                      className="shrink-0 rounded bg-[var(--warning)]/15 px-1.5 text-[10px] text-[var(--warning)]"
                      title="Unpublished draft"
                    >
                      draft
                    </span>
                  )}
                  {option.type && <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{option.type}</span>}
                  <span
                    className={`shrink-0 font-mono text-[10px] ${
                      option.productionId ? 'text-[var(--text-muted)]' : 'text-[var(--warning)]'
                    }`}
                    title={
                      option.productionId ? 'Product family id' : 'No Production ID — this product can never match'
                    }
                  >
                    {option.productionId || 'no id'}
                  </span>
                  {isTaken && <span className="shrink-0 text-[10px] text-[var(--text-muted)]">added</span>}
                </button>
              );
            })}

            {!matches.length && (
              <div className="px-3 py-6 text-center text-xs text-[var(--text-muted)]">
                {loading
                  ? 'Loading products…'
                  : error
                    ? error
                    : options.length
                      ? 'No products match your search.'
                      : 'This space has no products yet.'}
              </div>
            )}
          </div>

          {filtered.length > matches.length && (
            <div className="border-t border-[var(--border-glass)] px-3 py-1.5 text-[10px] text-[var(--text-muted)]">
              Showing {matches.length} of {filtered.length} — keep typing to narrow.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPicker;
