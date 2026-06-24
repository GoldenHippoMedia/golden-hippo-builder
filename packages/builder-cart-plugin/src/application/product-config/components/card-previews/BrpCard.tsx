import React from 'react';
import type { CardPreviewProps } from './types';
import {
  CardShell,
  ProductImage,
  TagBadges,
  ReviewStars,
  NameOrPlaceholder,
  btnPrimary,
  GOLD_SOFT,
  GOLD_DARK,
  GOLD_BORDER,
} from './shared';

/**
 * BRP — stacked card with tags top-right, contain-fit rounded image, centered
 * title, a member-price banner, and a two-column price / quantity-selector row
 * above a full-width Add to Cart.
 */
const BrpCard: React.FC<CardPreviewProps> = ({ product, sample }) => {
  const oos = Boolean(product.outOfStock || product.cartOutOfStock);

  return (
    <CardShell product={product} className="mx-auto flex w-full max-w-[320px] flex-col text-[#1a1a1a]">
      <div className="relative mb-3 block">
        <figure className="relative mx-auto aspect-square max-h-72">
          <TagBadges
            tags={product.tags}
            mode="imageOrText"
            className="absolute right-4 top-0 z-10 flex flex-col items-end gap-2"
            itemClassName="px-2 py-1"
            imageClassName="max-h-14 max-w-[68px] object-contain"
          />
          <ProductImage
            src={product.featuredImage}
            alt={product.displayName}
            fit="contain"
            className="h-full w-full overflow-hidden rounded-2xl"
          />
        </figure>
      </div>

      <ReviewStars product={product} className="mb-2 justify-center" />

      <h3 className="mb-4 flex-1 text-center text-xl font-semibold leading-snug">
        <NameOrPlaceholder name={product.displayName} />
      </h3>

      <p className="mb-4 flex justify-center">
        <strong
          className="rounded border px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest"
          style={{ borderColor: GOLD_BORDER, color: GOLD_DARK, backgroundColor: GOLD_SOFT }}
        >
          Member Price Activated
        </strong>
      </p>

      <div className="mb-5 grid grid-cols-2 items-center gap-5">
        <div>
          <p className="text-lg font-bold">{sample.memberPrice}</p>
          <p className="flex items-baseline gap-1.5">
            <strong className="text-sm">{sample.perUnit}</strong>
            <small className="text-xs">per {product.packagingSingular || sample.packageSingular}</small>
          </p>
          <p className="text-[10px] font-semibold" style={{ color: GOLD_DARK }}>
            Save {sample.savingsPercent}
          </p>
        </div>

        {/* Static stand-in for the quantity <select> (see RhpCard note). */}
        <div className="relative rounded-lg border border-neutral-600 bg-white pb-1 pl-4 pr-[30px] pt-4 text-xs text-[#1a1a1a] shadow">
          <label className="absolute left-4 top-1 text-[10px] leading-none text-neutral-500">Quantity</label>
          <span>{sample.quantities[0].label}</span>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            ▾
          </span>
        </div>
      </div>

      {oos ? (
        <button disabled className="w-full rounded-md bg-[#d4d4d4] px-4 py-2 font-semibold uppercase text-[#737373]">
          Out of Stock
        </button>
      ) : (
        <button className={`${btnPrimary} w-full rounded-md px-4 py-2`}>Add to Cart</button>
      )}

      <a className="mt-4 text-center text-sm font-semibold" style={{ color: GOLD_DARK }}>
        View Product
      </a>
    </CardShell>
  );
};

export default BrpCard;
