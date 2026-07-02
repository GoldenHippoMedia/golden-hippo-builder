import React from 'react';
import { StarRating } from '@goldenhippo/builder-ui';
import type { PreviewProduct, PreviewTag } from './types';
import { MAX_CARD_TAGS } from './types';

// ---------------------------------------------------------------------------
// Gold / black company theme. The real cards use per-brand palettes
// (brand1-800, brandPrimary, …) that don't exist in this plugin; we render
// every variant in this unified palette so structure is what differs.
// ---------------------------------------------------------------------------

export const INK = '#1a1a1a';
export const GOLD = '#c9a227';
export const GOLD_DARK = '#8a6d1b';
export const GOLD_SOFT = '#fbf4dd';
export const GOLD_BORDER = '#e6d49b';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 font-semibold uppercase bg-[#c9a227] text-[#1a1a1a] transition-colors hover:brightness-95';
export const btnOutline =
  'inline-flex items-center justify-center gap-2 font-semibold uppercase border-2 border-[#1a1a1a] text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-white';
export const oosClasses =
  'inline-flex items-center justify-center font-semibold uppercase bg-[#d4d4d4] text-[#737373] cursor-not-allowed';

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/** Product image with a graceful placeholder when no featuredImage is set. */
export const ProductImage: React.FC<{
  src?: string;
  alt: string;
  className?: string;
  fit?: 'cover' | 'contain';
}> = ({ src, alt, className, fit = 'cover' }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} object-center ${className ?? ''}`}
    />
  ) : (
    <div className={`flex items-center justify-center bg-[#f3f0e6] text-[#b6ad93] ${className ?? ''}`}>
      <span className="text-[10px] font-medium uppercase tracking-wider">No image</span>
    </div>
  );

/**
 * Tags on storefront cards, capped at three (matching the templates' slice).
 * `mode` mirrors each variant's real rule:
 *  - 'text'        → colored text pills (GMD)
 *  - 'image'       → only tags that have a badge image; others are skipped (RHP/DMP)
 *  - 'imageOrText' → badge image when present, else a colored text pill (BRP)
 */
export const TagBadges: React.FC<{
  tags: PreviewTag[];
  mode: 'text' | 'image' | 'imageOrText';
  className?: string;
  itemClassName?: string;
  imageClassName?: string;
}> = ({ tags, mode, className, itemClassName, imageClassName }) => {
  const capped = tags.slice(0, MAX_CARD_TAGS);

  const pill = (t: PreviewTag) => (
    <span
      key={t.id}
      className={`inline-flex items-center rounded-full text-[10px] font-semibold uppercase tracking-wide ${itemClassName ?? 'px-3 py-1'}`}
      style={t.color ? { backgroundColor: t.color, color: INK } : { backgroundColor: GOLD_SOFT, color: GOLD_DARK }}
    >
      {t.label}
    </span>
  );
  const badge = (t: PreviewTag) =>
    t.image ? (
      <img
        key={t.id}
        src={t.image}
        alt={t.label}
        className={imageClassName ?? 'max-h-14 max-w-[85px] object-contain'}
      />
    ) : null;

  const rendered = capped
    .map((t) => (mode === 'text' ? pill(t) : mode === 'image' ? badge(t) : t.image ? badge(t) : pill(t)))
    .filter(Boolean);

  if (!rendered.length) return null;
  return <div className={className}>{rendered}</div>;
};

/**
 * Star rating + review count. Mirrors the storefront rule: reviews only show
 * when there is a rating above 3 and at least one review.
 */
export const ReviewStars: React.FC<{
  product: PreviewProduct;
  className?: string;
  countLabel?: (n: number) => string;
}> = ({ product, className, countLabel }) => {
  const rating = product.averageRating ?? 0;
  const count = product.reviewCount ?? 0;
  if (!(rating > 3 && count > 0)) return null;
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <StarRating rating={rating} />
      <span className="text-xs text-[#525252]">
        {countLabel ? countLabel(count) : `${count.toLocaleString()} reviews`}
      </span>
    </div>
  );
};

/**
 * Wraps a card. Dims + flags the card when hidden, and shows an out-of-stock
 * ribbon — both are editable states this preview is meant to demonstrate.
 */
export const CardShell: React.FC<{
  product: PreviewProduct;
  className?: string;
  children: React.ReactNode;
}> = ({ product, className, children }) => {
  const oos = Boolean(product.outOfStock || product.cartOutOfStock);
  const siteOnly = Boolean(product.cartOutOfStock && !product.outOfStock);
  return (
    <div className="relative">
      {(product.hidden || oos) && (
        <div className="absolute -top-2 -right-2 z-30 flex flex-col items-end gap-1">
          {product.hidden && (
            <span className="rounded-full bg-[#1a1a1a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
              Hidden
            </span>
          )}
          {oos && (
            <span className="rounded-full bg-[#c9a227] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1a1a1a] shadow">
              {siteOnly ? 'OOS · Site' : 'Out of stock'}
            </span>
          )}
        </div>
      )}
      <div className={`${product.hidden ? 'opacity-40 grayscale' : ''} ${className ?? ''}`}>{children}</div>
    </div>
  );
};

/** Display name, or a muted placeholder when empty. */
export const NameOrPlaceholder: React.FC<{ name: string; className?: string }> = ({ name, className }) =>
  name ? (
    <span className={className}>{name}</span>
  ) : (
    <span className={`italic text-[#9b9580] ${className ?? ''}`}>Untitled product</span>
  );
