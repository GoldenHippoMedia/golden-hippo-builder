import React from 'react';
import type { CardPreviewProps } from './types';
import { CardShell, ProductImage, NameOrPlaceholder, btnPrimary, GOLD_DARK } from './shared';

/**
 * Simple — Horizontal. Compact row: small image on the left, then stars, name,
 * a savings line and a subscription price with the one-time price struck
 * through, plus an Add to Cart. Tags are not rendered on this variant.
 */
const SimpleHorizontalCard: React.FC<CardPreviewProps> = ({ product, sample }) => {
  const oos = Boolean(product.outOfStock || product.cartOutOfStock);
  const rating = product.averageRating ?? 0;
  const count = product.reviewCount ?? 0;

  return (
    <CardShell product={product} className="mx-auto flex w-full max-w-[340px] flex-col text-[#1a1a1a]">
      <div className="mb-2 flex flex-1 gap-3">
        <figure className="flex-shrink-0">
          <ProductImage src={product.featuredImage} alt={product.displayName} className="h-auto w-24" />
        </figure>
        <div className="flex flex-col items-start">
          {rating > 3 && count > 0 && (
            <figure className="mb-1 flex items-center gap-1 text-xs" style={{ color: GOLD_DARK }}>
              {'★★★★★'.slice(0, Math.round(rating))}
              <span className="font-normal leading-none">({count})</span>
            </figure>
          )}
          <p className="mb-2 flex-1 text-base font-bold leading-5">
            <NameOrPlaceholder name={product.displayName} />
          </p>
          <p className="mb-1 text-sm font-bold uppercase leading-tight" style={{ color: GOLD_DARK }}>
            Save {sample.savingsAmount} per {product.packagingSingular || sample.packageSingular}
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <p className="w-fit text-lg font-bold leading-tight">{sample.memberPrice}</p>
            <p className="w-fit text-lg font-normal leading-tight text-neutral-400 line-through">{sample.guestPrice}</p>
          </div>
          {oos ? (
            <span className="rounded-md bg-[#d4d4d4] px-3 py-1.5 text-sm font-semibold uppercase text-[#737373]">
              Out of Stock
            </span>
          ) : (
            <button className={`${btnPrimary} w-auto rounded-md px-3 py-1.5 text-sm leading-none`}>Add to Cart</button>
          )}
        </div>
      </div>
    </CardShell>
  );
};

export default SimpleHorizontalCard;
