import React from 'react';
import { type CommerceOffer } from '@services/commerce-api';

const PALETTE = ['#7c3aed', '#0891b2', '#b45309', '#c2410c', '#be185d', '#15803d', '#0d9488', '#1d4ed8'];

const colorFor = (id: string): string =>
  PALETTE[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length];

const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '?';

const money = (n: number | undefined): string => `$${(n ?? 0).toFixed(2)}`;

export const offerName = (offer: CommerceOffer): string =>
  offer.product?.friendlyName || offer.product?.name || offer.id;

/** "3 bottles" — the units the offer's SKU ships. Empty when quantity/packaging are unknown. */
export const offerQuantityLabel = (offer: CommerceOffer): string =>
  [offer.product?.quantity, offer.product?.packaging].filter((part) => part !== undefined && part !== '').join(' ');

// Thumb + name + type badge + price (+ subscription pill). Shared by the pool rows and the picker.
const OfferSummary: React.FC<{ offer: CommerceOffer; showProduct?: boolean }> = ({ offer, showProduct }) => {
  const name = offerName(offer);
  const quantity = offerQuantityLabel(offer);
  const isUpsell = offer.type === 'Upsell';
  return (
    <>
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
        style={{ background: colorFor(offer.id) }}
      >
        {initialsFor(name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold text-[var(--text-primary)]">{name}</div>
        {showProduct && offer.product?.name && (
          <div className="truncate text-[11px] text-[var(--text-muted)]">{offer.product.name}</div>
        )}
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
              isUpsell ? 'bg-[var(--success)]/15 text-[var(--success)]' : 'bg-[#60a5fa]/15 text-[#60a5fa]'
            }`}
          >
            {offer.type}
          </span>
          {quantity && <span className="text-[11px] text-[var(--text-secondary)]">{quantity}</span>}
          <span className="font-mono text-[11px] tabular-nums text-[var(--text-secondary)]">
            <span className="mr-1 text-[var(--text-muted)] line-through">{money(offer.retailPrice)}</span>
            {money(offer.salePrice)}
          </span>
          {offer.subscription && (
            <span className="rounded border border-[var(--border-glass)] px-1 py-0.5 text-[9px] text-[var(--text-secondary)]">
              ↻ Sub
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default OfferSummary;
