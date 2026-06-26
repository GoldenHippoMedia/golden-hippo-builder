import React from 'react';
import type { CardPreviewProps } from './types';
import {
  CardShell,
  ProductImage,
  TagBadges,
  ReviewStars,
  NameOrPlaceholder,
  btnPrimary,
  btnOutline,
  GOLD_SOFT,
  GOLD_DARK,
} from './shared';

/**
 * GMD — the default storefront card. Tall white card with large radius, tags
 * overlaid top-left on the image, then title / reviews / tagline / guest+member
 * price split / Learn More / Add to Cart.
 */
const GmdCard: React.FC<CardPreviewProps> = ({ product, sample }) => {
  // GMD binds the Product Headline (subHeading) only — gridTagline has no effect here.
  const tagline = product.subHeading;
  const oos = Boolean(product.outOfStock || product.cartOutOfStock);

  return (
    <CardShell
      product={product}
      className="mx-auto flex w-full max-w-[360px] flex-col overflow-hidden rounded-[32px] bg-white text-[#1a1a1a] shadow-lg"
    >
      <div className="relative h-[240px]">
        <TagBadges
          tags={product.tags}
          mode="text"
          className="absolute left-5 top-5 z-10 flex gap-1"
          itemClassName="px-4 py-1.5"
        />
        <ProductImage src={product.featuredImage} alt={product.displayName} className="h-full w-full" />
      </div>

      <div className="flex flex-col gap-2 px-6 pb-7 pt-4">
        <div className="text-xl font-semibold leading-tight">
          <NameOrPlaceholder name={product.displayName} />
        </div>

        <ReviewStars product={product} className="h-6" />

        {tagline && <p className="line-clamp-2 max-h-16 font-semibold text-[#3f3f46]">{tagline}</p>}

        <div className="mt-3 flex justify-between">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="rounded-full bg-gray-200 px-3 py-1.5 text-[10px] font-semibold uppercase">Guest Price</p>
            <p className="text-xl font-semibold">{sample.guestPrice}</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p
              className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase"
              style={{ backgroundColor: GOLD_SOFT, color: GOLD_DARK }}
            >
              Member Price
            </p>
            <p className="text-xl font-semibold" style={{ color: GOLD_DARK }}>
              {sample.memberPrice}
            </p>
          </div>
        </div>

        <a href="#" onClick={(e) => e.preventDefault()} className={`${btnOutline} mt-3 w-full rounded-full px-4 py-2 text-sm`}>
          Learn More
        </a>
        {oos ? (
          <p className="text-center text-sm font-semibold uppercase text-[#b91c1c]">Out of Stock</p>
        ) : (
          <button className={`${btnPrimary} w-full rounded-full px-4 py-2 text-sm`}>Add to Cart</button>
        )}
      </div>
    </CardShell>
  );
};

export default GmdCard;
