import { OfferType } from '@goldenhippo/builder-cart-schemas';

export interface CommerceOffer {
  /** Whether this is presented as an upsell or a downsell. */
  type: OfferType;
  /** Salesforce id of the offer — the identifier stored on an offer-flow step. */
  id: string;
  /** Offer description (HTML). */
  description: string;

  /** Retail (list) price before discount. */
  retailPrice: number;
  /** Retail price localized to the visitor's currency. */
  localeRetailPrice: number;
  /** The price the customer pays. */
  salePrice: number;
  /** Sale price localized to the visitor's currency. */
  localeSalePrice: number;
  /** Tax amount. */
  tax: number;
  /** Tax amount localized to the visitor's currency. */
  localeTax: number;
  /** Whether `salePrice` already includes tax (EU/AU/etc.). */
  includesTax: boolean;

  product: CommerceOfferProduct;

  /** Whether the offer enrolls the customer in a subscription. */
  subscription: boolean;
}

export interface CommerceOfferProduct {
  /** Salesforce id of the product. */
  id: string;
  /** Full product name — often not suitable for display. */
  name: string;
  description: string;
  /** Optional — not every offer product has imagery. */
  image?: {
    url: string;
    alt?: string;
  };
  /** Tax code, e.g. 'P0000000'. */
  taxCode: string;
  /** Packaging unit, e.g. 'Unit', 'Box'. Pluralized when necessary. */
  packaging: string;
  /** Number of units shipped by this offer. */
  quantity: number;
  /** Presentational name for the UI. */
  friendlyName: string;
  /** Salesforce id of the product family. */
  familyId: string;
}
