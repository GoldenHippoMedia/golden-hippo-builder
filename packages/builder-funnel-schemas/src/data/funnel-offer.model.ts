import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderProductContent } from '@goldenhippo/builder-shared-schemas';
import { SUBSCRIPTION_FREQUENCIES, SubscriptionFrequency } from './subscription-frequency';

export const createFunnelOfferModel = (productModelId: string): ModelShape => {
  return {
    name: 'funnel-offer',
    displayName: 'Funnel Offer',
    kind: 'data',
    helperText: 'Groups products with default pricing tiers for funnel offers',
    contentTitleField: 'name',
    fields: [
      {
        name: 'offerType',
        friendlyName: 'Offer Type',
        type: 'select',
        required: true,
        defaultCollapsed: true,
        enum: ['standard', 'bundle'],
        helperText: 'Standard: single product, quantity 1. Bundle: one or more products with custom quantities.',
      },
      {
        name: 'displayName',
        friendlyName: 'Display Name',
        type: 'text',
        required: true,
        localized: true,
        defaultCollapsed: true,
        helperText: 'Customer-facing offer name',
      },
      {
        name: 'featuredImage',
        friendlyName: 'Featured Image',
        type: 'file',
        defaultCollapsed: true,
        showTemplatePicker: true,
        allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
        helperText: 'Primary image for the offer',
      },
      {
        name: 'description',
        friendlyName: 'Description',
        type: 'longText',
        required: false,
        localized: true,
        defaultCollapsed: true,
        helperText: 'Offer description',
      },
      {
        name: 'products',
        friendlyName: 'Products',
        type: 'list',
        required: true,
        localized: false,
        defaultCollapsed: true,
        helperText: 'One or more products included in this offer',
        subFields: [
          {
            type: 'reference',
            modelId: productModelId,
            name: 'product',
            friendlyName: 'Product',
            copyOnAdd: false,
            defaultCollapsed: true,
          },
          {
            name: 'quantity',
            friendlyName: 'Quantity',
            type: 'number',
            defaultValue: 1,
            required: true,
            defaultCollapsed: true,
            helperText: 'Number of this product included in the offer (e.g., 2x for bundles)',
          },
          {
            name: 'displayName',
            friendlyName: 'Override Display Name',
            type: 'text',
            required: false,
            localized: true,
            defaultCollapsed: true,
            helperText: 'Override the product name in this offer context (e.g., flavor name)',
          },
        ],
      },
      {
        name: 'selectionLabel',
        friendlyName: 'Selection Label',
        type: 'text',
        required: false,
        localized: true,
        defaultCollapsed: true,
        helperText: 'Label for product chooser when multiple products are available (e.g., "Choose your flavor")',
      },
      {
        name: 'defaultPricing',
        friendlyName: 'Default Pricing',
        type: 'list',
        required: true,
        localized: false,
        defaultCollapsed: true,
        helperText: 'Default pricing tiers copied to new funnels for this offer',
        subFields: [
          {
            name: 'quantity',
            friendlyName: 'Quantity',
            type: 'number',
            defaultValue: 1,
            required: true,
            defaultCollapsed: true,
            helperText: 'Purchase quantity (e.g., 1, 3, 6)',
          },
          {
            name: 'label',
            friendlyName: 'Label',
            type: 'text',
            required: false,
            localized: true,
            defaultCollapsed: true,
            helperText: 'Tier label (e.g., "Best Value", "Most Popular")',
          },
          {
            name: 'isMostPopular',
            friendlyName: 'Most Popular',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Highlights this tier in the UI',
          },
          {
            name: 'standardPrice',
            friendlyName: 'Standard Price',
            type: 'number',
            defaultValue: undefined,
            required: true,
            defaultCollapsed: true,
            helperText: 'One-time purchase price',
          },
          {
            name: 'subscriptionAvailable',
            friendlyName: 'Subscription Available',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Whether this tier can be purchased as a subscription (defaults to true)',
          },
          {
            name: 'subscriptionPrice',
            friendlyName: 'Subscription Price',
            type: 'number',
            defaultValue: undefined,
            required: false,
            defaultCollapsed: true,
            helperText: 'Subscription price (only applies when subscriptionAvailable is true)',
          },
          {
            name: 'subscriptionFrequency',
            friendlyName: 'Subscription Frequency',
            type: 'select',
            required: false,
            defaultCollapsed: true,
            enum: [...SUBSCRIPTION_FREQUENCIES],
            helperText: 'Subscription renewal frequency for this tier',
          },
        ],
      },
      {
        name: 'isDefaultOffer',
        friendlyName: 'Default Offer',
        type: 'boolean',
        required: false,
        defaultCollapsed: true,
        helperText:
          'When true, this is the global default offer used as fallback for not-found scenarios.' +
          ' First flagged offer wins if multiple are set.',
      },
      {
        name: 'name',
        friendlyName: 'Name',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'Internal name for the offer, used for identification in the CMS',
      },
      {
        name: 'gh',
        friendlyName: 'Golden Hippo Integration Data',
        helperText: 'Stores integration data for Golden Hippo. Do not modify any of these values.',
        type: 'object',
        defaultCollapsed: true,
        localized: false,
        subFields: [
          {
            name: 'slug',
            friendlyName: 'Generic End Point',
            type: 'text',
            required: true,
            localized: false,
            defaultCollapsed: true,
            helperText: 'URL path segment for this offer (accessible at /o/[slug])',
          },
        ],
      },
    ],
  };
};

export type FunnelOfferPricingTier = {
  quantity: number;
  label?: string;
  isMostPopular?: boolean;
  standardPrice: number;
  subscriptionAvailable?: boolean;
  subscriptionPrice?: number;
  subscriptionFrequency?: SubscriptionFrequency;
};

export type OfferType = 'standard' | 'bundle';

export type BuilderFunnelOfferContent = BuilderContent &
  Partial<{
    data: {
      name: string;
      offerType: OfferType;
      displayName: string;
      featuredImage?: string;
      description?: string;
      products: {
        product: BuilderContentReference<BuilderProductContent>;
        quantity: number;
        displayName?: string;
      }[];
      selectionLabel?: string;
      defaultPricing: FunnelOfferPricingTier[];
      isDefaultOffer?: boolean;
      gh?: {
        slug?: string;
      };
    } & BuilderResponseBaseData;
  }>;
