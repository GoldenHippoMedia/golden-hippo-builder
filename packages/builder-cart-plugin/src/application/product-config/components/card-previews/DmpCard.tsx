import React from 'react';
import type { CardPreviewProps } from './types';
import { CardShell, ProductImage, ReviewStars, NameOrPlaceholder, btnPrimary, GOLD_SOFT, GOLD_DARK } from './shared';

/**
 * DMP — center-aligned card. Square image, centered reviews, italic tagline,
 * bold name, then a centered price with a rounded "member" price pill, and a
 * stacked Add to Cart / Learn More.
 */
const DmpCard: React.FC<CardPreviewProps> = ({ product, sample }) => {
  const tagline = product.gridTagline || product.subHeading;
  const oos = Boolean(product.outOfStock || product.cartOutOfStock);

  return (
    <CardShell
      product={product}
      className="mx-auto flex w-full max-w-[300px] flex-col items-center gap-2.5 text-center text-[#1a1a1a]"
    >
      <figure className="group relative m-auto aspect-square max-h-56 w-full">
        <ProductImage
          src={product.featuredImage}
          alt={product.displayName}
          className={`absolute inset-0 m-auto h-full w-full max-h-56 transition-opacity duration-300 ${product.secondaryImage ? 'group-hover:opacity-0' : ''}`}
        />
        {product.secondaryImage && (
          <img
            src={product.secondaryImage}
            alt={`${product.displayName} alternate`}
            className="absolute inset-0 m-auto h-full max-h-56 w-full object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </figure>

      <ReviewStars product={product} className="justify-center text-[#2c2c2c]" countLabel={(n) => `${n} Reviews`} />

      {tagline && <p className="line-clamp-2 text-xs font-normal italic text-[#6d7278]">{tagline}</p>}

      <h2 className="flex-1 text-base font-bold text-[#4e5d74]">
        <NameOrPlaceholder name={product.displayName} />
      </h2>

      {product.gridDescription && (
        <p className="mx-auto line-clamp-2 max-w-72 text-sm text-[#6d7278]">{product.gridDescription}</p>
      )}

      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-bold" style={{ color: GOLD_DARK }}>
          {sample.guestPrice}
        </span>
        <span
          className="relative flex min-w-40 items-center justify-center rounded-full p-1"
          style={{ backgroundColor: GOLD_SOFT, color: GOLD_DARK }}
        >
          {/* Subscription icon, pinned left like the storefront card */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-1 h-6 w-6"
            aria-hidden
          >
            <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          <span className="text-center leading-none">
            <span className="block text-lg font-bold">{sample.memberPrice}</span>
            <span className="mt-1 block text-[9px] font-bold uppercase text-[#4e5d74]">Subscribe &amp; Save</span>
          </span>
        </span>
      </div>

      <div className="mt-2 flex w-full flex-col gap-2">
        {oos ? (
          <span className="w-full rounded-md bg-[#d4d4d4] px-4 py-2 text-sm font-semibold uppercase text-[#737373]">
            Out of Stock
          </span>
        ) : (
          <button className={`${btnPrimary} w-full rounded-md px-4 py-2 text-sm`}>Add to My Cart</button>
        )}
        <a className="w-full rounded-md border-2 border-[#1a1a1a] px-4 py-2 text-sm font-semibold uppercase text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-white">
          Learn More
        </a>
      </div>
    </CardShell>
  );
};

export default DmpCard;
