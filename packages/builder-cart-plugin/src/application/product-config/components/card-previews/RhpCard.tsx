import React from 'react';
import type { CardPreviewProps } from './types';
import { CardShell, ProductImage, TagBadges, NameOrPlaceholder, btnPrimary, btnOutline, GOLD_DARK } from './shared';

/**
 * RHP — boxed white card (p-9, rounded), centered. Tags stack top-left, large
 * contain-fit image, big capitalized name, then an in-card flavor dropdown,
 * big price, a member-price + savings badge, and full-width CTAs.
 */
const RhpCard: React.FC<CardPreviewProps> = ({ product, sample }) => {
  // RHP shows the Grid Description as its sub-heading (not the tagline/subHeading).
  const description = product.gridDescription;
  const oos = Boolean(product.outOfStock || product.cartOutOfStock);

  return (
    <CardShell
      product={product}
      className="relative mx-auto flex w-full max-w-[340px] flex-col items-center rounded-lg bg-white p-7 text-center text-[#1a1a1a] shadow-lg"
    >
      <TagBadges
        tags={product.tags}
        mode="image"
        className="absolute left-7 top-7 z-10 flex flex-col items-start gap-2"
      />

      <figure className="relative aspect-square max-h-44 w-full">
        <ProductImage
          src={product.featuredImage}
          alt={product.displayName}
          fit="contain"
          className="absolute inset-0 m-auto h-full w-full"
        />
      </figure>

      <h2 className="mt-3 text-2xl font-bold capitalize">
        <NameOrPlaceholder name={product.displayName} />
      </h2>

      {description && <p className="mt-1 line-clamp-2 max-w-[75%]">{description}</p>}

      <div className="mt-auto flex w-full flex-col items-center pt-4">
        <label className="mb-1 block w-full text-left text-sm font-semibold text-neutral-800">Select Flavor</label>
        <div className="relative mb-3 w-full">
          <select
            className="w-full appearance-none rounded-full border-2 border-black bg-white py-1.5 pl-3.5 pr-10 text-base text-[#1a1a1a]"
            style={{ colorScheme: 'light' }}
            defaultValue="0"
          >
            {sample.flavors.map((f, i) => (
              <option key={f} value={i}>
                {f}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs">▾</span>
        </div>

        <p className="m-0 text-[32px] font-semibold leading-none">{sample.guestPrice}</p>
        <span
          className="mt-2 inline-block rounded-full border-2 px-1.5 py-[3px] text-[13px] font-bold leading-none"
          style={{ borderColor: GOLD_DARK, color: GOLD_DARK }}
        >
          {sample.memberPrice} Member Price
        </span>

        {oos ? (
          <div className="mt-4 w-full rounded-md bg-[#d4d4d4] px-[30px] py-3 text-center text-xl font-bold uppercase leading-none text-[#737373]">
            Out of Stock
          </div>
        ) : (
          <button className={`${btnPrimary} mt-4 w-full rounded-md px-[30px] py-3 text-xl leading-none`}>
            Add to Cart
          </button>
        )}
        <a className={`${btnOutline} mt-4 w-full rounded-md px-[30px] py-3 text-xl leading-none`}>Learn More</a>
      </div>
    </CardShell>
  );
};

export default RhpCard;
