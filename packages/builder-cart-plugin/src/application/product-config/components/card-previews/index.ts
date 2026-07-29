import type React from 'react';
import type { CardPreviewProps } from './types';
import GmdCard from './GmdCard';
import DmpCard from './DmpCard';
import RhpCard from './RhpCard';
import BrpCard from './BrpCard';
import SimpleStackedCard from './SimpleStackedCard';
import SimpleHorizontalCard from './SimpleHorizontalCard';

export type CardVariantKey = 'gmd' | 'dmp' | 'rhp' | 'brp' | 'simpleStacked' | 'simpleHorizontal';

export interface CardVariant {
  key: CardVariantKey;
  label: string;
  Component: React.FC<CardPreviewProps>;
}

/** GMD is the default storefront card; it leads the list. */
export const CARD_VARIANTS: CardVariant[] = [
  { key: 'gmd', label: 'Standard (GMD)', Component: GmdCard },
  { key: 'dmp', label: 'Centered (DMP)', Component: DmpCard },
  { key: 'rhp', label: 'Boxed + Flavor (RHP)', Component: RhpCard },
  { key: 'brp', label: 'Quantity Select (BRP)', Component: BrpCard },
  { key: 'simpleStacked', label: 'Simple — Stacked', Component: SimpleStackedCard },
  { key: 'simpleHorizontal', label: 'Simple — Horizontal', Component: SimpleHorizontalCard },
];

/** Card layout that best matches each configured brand's real storefront. */
export const FALLBACK_CARD_KEY: CardVariantKey = 'simpleStacked';

/**
 * Maps a plugin brand-setting display name (see plugin.ts `brand` enum) to the
 * card variant that resembles that brand's storefront. Brands without a
 * dedicated card (and any unconfigured/unknown value) fall back to
 * FALLBACK_CARD_KEY.
 */
export const BRAND_CARD_VARIANTS: Record<string, CardVariantKey> = {
  'Gundry MD': 'gmd',
  'Dr. Marty': 'dmp',
  'Roundhouse Provisions': 'rhp',
  'Badlands Ranch': 'brp',
};

export const brandToCardKey = (brand?: string): CardVariantKey =>
  (brand && BRAND_CARD_VARIANTS[brand]) || FALLBACK_CARD_KEY;

export * from './types';
