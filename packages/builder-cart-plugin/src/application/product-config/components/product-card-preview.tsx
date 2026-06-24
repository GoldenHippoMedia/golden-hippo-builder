import React from 'react';
import { StarRating } from '@goldenhippo/builder-ui';
import type { ChipOption } from './chip-multi-select';

interface ProductCardPreviewProps {
  displayName: string;
  subHeading?: string;
  gridTagline?: string;
  featuredImage?: string;
  hidden?: boolean;
  outOfStock?: boolean;
  cartOutOfStock?: boolean;
  averageRating?: number;
  reviewCount?: number;
  tagChips: ChipOption[];
  categoryChips: ChipOption[];
}

const StatusFlag: React.FC<{ label: string; variant: 'muted' | 'warning' }> = ({ label, variant }) => (
  <span
    className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider z-10 ${
      variant === 'warning'
        ? 'bg-[var(--warning)]/90 text-[#1a1a2e]'
        : 'bg-[var(--text-muted)]/80 text-[var(--bg-primary)]'
    }`}
  >
    {label}
  </span>
);

const ProductCardPreview: React.FC<ProductCardPreviewProps> = ({
  displayName,
  subHeading,
  gridTagline,
  featuredImage,
  hidden,
  outOfStock,
  cartOutOfStock,
  averageRating,
  reviewCount,
  tagChips,
  categoryChips,
}) => {
  const tagline = gridTagline || subHeading;

  return (
    <div className="sticky top-24">
      <div className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-3">
        Live Preview
      </div>

      <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-glass)] overflow-hidden">
        <div className="relative aspect-square bg-[var(--bg-primary)] flex items-center justify-center">
          {hidden && <StatusFlag label="Hidden" variant="muted" />}
          {(outOfStock || cartOutOfStock) && !hidden && (
            <StatusFlag label={cartOutOfStock ? 'OOS (Site)' : 'Out of Stock'} variant="warning" />
          )}

          {featuredImage ? (
            <img
              src={featuredImage}
              alt={displayName || 'Product preview'}
              className={`w-full h-full object-cover transition-opacity ${hidden ? 'opacity-40' : ''}`}
            />
          ) : (
            <div className="text-[var(--text-muted)] text-xs">No featured image</div>
          )}

          {tagChips.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
              {tagChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide shadow-sm"
                  style={
                    chip.color
                      ? { background: chip.color, color: '#1a1a2e' }
                      : { background: 'var(--accent)', color: '#1a1a2e' }
                  }
                >
                  {chip.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
            {displayName || <span className="italic text-[var(--text-muted)]">Untitled product</span>}
          </div>
          {tagline && <div className="text-xs text-[var(--text-secondary)] leading-snug">{tagline}</div>}

          {(averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              <StarRating rating={averageRating ?? 0} />
              {reviewCount ? (
                <span className="text-[11px] text-[var(--text-muted)]">({reviewCount.toLocaleString()})</span>
              ) : null}
            </div>
          )}

          {categoryChips.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-[var(--border-glass)]">
              {categoryChips
                .map((chip) => (
                  <span key={chip.id} className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    {chip.label}
                  </span>
                ))
                .reduce<React.ReactNode[]>((acc, el, i) => {
                  if (i > 0)
                    acc.push(
                      <span key={`sep-${i}`} className="text-[var(--text-muted)]">
                        ·
                      </span>,
                    );
                  acc.push(el);
                  return acc;
                }, [])}
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed">
        Approximation of how this product appears on grid cards. The actual rendering on your site may vary by template.
      </p>
    </div>
  );
};

export default ProductCardPreview;
