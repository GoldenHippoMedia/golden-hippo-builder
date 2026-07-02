// ---------------------------------------------------------------------------
// Shared types + sample data for the product-card / offer-selector previews.
//
// These previews are *representative* mockups of how the live storefront cards
// render a product. They are rendered in a single gold/black company theme
// rather than each brand's real palette — the goal is to show WHERE and WHAT
// each product setting affects, not to be pixel-accurate per brand.
//
// Fields sourced from the product config form (image, tagline, tags, reviews,
// stock flags) are real. Prices, flavors and quantities are sample data — they
// are configured elsewhere (commerce feed / offers), not on this page.
// ---------------------------------------------------------------------------

export interface PreviewTag {
  id: string;
  label: string;
  /** tagColor from the product-tag model — an editable setting, so honored. */
  color?: string;
  /** Optional badge image; some cards only show tags that have one. */
  image?: string;
}

/** Storefront cards never show more than three tags. */
export const MAX_CARD_TAGS = 3;

/** The editable, product-driven inputs the previews visualize. */
export interface PreviewProduct {
  displayName: string;
  subHeading?: string;
  gridTagline?: string;
  gridDescription?: string;
  featuredImage?: string;
  secondaryImage?: string;
  packagingSingular?: string;
  emojis?: string[];
  hidden?: boolean;
  outOfStock?: boolean;
  cartOutOfStock?: boolean;
  averageRating?: number;
  reviewCount?: number;
  tags: PreviewTag[];
}

/** Representative pricing/options — made-up, identical across variants. */
export interface SampleData {
  guestPrice: string;
  memberPrice: string;
  perUnit: string;
  packageSingular: string;
  savingsPercent: string;
  savingsAmount: string;
  flavors: string[];
  quantities: { label: string; price: string }[];
}

export const SAMPLE: SampleData = {
  guestPrice: '$49.95',
  memberPrice: '$39.95',
  perUnit: '$1.33',
  packageSingular: 'bottle',
  savingsPercent: '20%',
  savingsAmount: '$10.00',
  flavors: ['Original', 'Berry Blast', 'Citrus'],
  quantities: [
    { label: '1 Bottle', price: '$39.95' },
    { label: '3 Bottles', price: '$107.85' },
    { label: '6 Bottles', price: '$203.70' },
  ],
};

export interface CardPreviewProps {
  product: PreviewProduct;
  sample: SampleData;
}
