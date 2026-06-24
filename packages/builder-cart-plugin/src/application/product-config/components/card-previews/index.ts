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

export * from './types';
