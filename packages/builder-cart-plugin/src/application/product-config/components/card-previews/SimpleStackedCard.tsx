import React from 'react';
import type { CardPreviewProps } from './types';
import { CardShell, ProductImage, NameOrPlaceholder, btnPrimary, GOLD_DARK } from './shared';

/**
 * Simple — Stacked. Minimal centered card: image, bold name, subheading, a
 * single price, Add to Cart and an underlined Learn More. This variant does not
 * render tags or reviews — useful to show those settings have no effect here.
 */
const SimpleStackedCard: React.FC<CardPreviewProps> = ({ product, sample }) => {
  const oos = Boolean(product.outOfStock || product.cartOutOfStock);

  return (
    <CardShell product={product} className="mx-auto flex w-full max-w-[280px] flex-col text-[#1a1a1a]">
      <div className="flex-grow">
        <figure className="relative m-auto aspect-square max-h-44">
          <ProductImage
            src={product.featuredImage}
            alt={product.displayName}
            className="absolute inset-0 m-auto h-full w-full max-h-56"
          />
        </figure>
        <div className="mx-auto w-fit px-4 text-center text-2xl font-bold">
          <NameOrPlaceholder name={product.displayName} />
        </div>
        {product.subHeading && <div className="mx-auto line-clamp-2 max-w-[75%] text-center">{product.subHeading}</div>}
      </div>

      <div className="mx-auto mt-auto w-fit text-center">
        <div className="mx-auto mb-2 w-fit text-xl font-semibold" style={{ color: GOLD_DARK }}>
          {sample.guestPrice}
        </div>
        {oos ? (
          <span className="block rounded-md bg-[#d4d4d4] px-4 py-2 text-sm font-semibold uppercase text-[#737373]">
            Out of Stock
          </span>
        ) : (
          <button className={`${btnPrimary} rounded-md px-4 py-2 text-sm`}>Add to Cart</button>
        )}
        <div className="mx-auto mt-2 w-fit">
          <a href="#" onClick={(e) => e.preventDefault()} className="cursor-pointer text-sm underline" style={{ color: GOLD_DARK }}>
            Learn More
          </a>
        </div>
      </div>
    </CardShell>
  );
};

export default SimpleStackedCard;
