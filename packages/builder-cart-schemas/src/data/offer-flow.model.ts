import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderProductContent } from '@goldenhippo/builder-shared-schemas';
import { BuilderOfferTemplateContent } from '../section';

export enum OfferType {
  Upsell = 'Upsell',
  Downsell = 'Downsell',
}

/** Targeting condition type. Extensible — add new types here + a `showIf`-gated field group. */
export enum OfferFlowConditionType {
  PurchasedProduct = 'Purchased Product',
}

/** How a product was purchased, for a "Purchased Product" condition. `Both` matches either. */
export enum OfferFlowOrderType {
  Subscription = 'Subscription',
  OneTimePurchase = 'One-time Purchase',
  Both = 'Both',
}

/** Lookback window for the "exclude previously purchased" filter. `Ever` = any past purchase. */
export enum PreviousPurchaseLookback {
  OneMonth = '1 month',
  TwoMonths = '2 months',
  ThreeMonths = '3 months',
  SixMonths = '6 months',
  TwelveMonths = '12 months',
  TwentyFourMonths = '24 months',
  Ever = 'Ever',
}

/**
 * Post-checkout offer flow: an ordered list of steps the customer walks in
 * sequence. Each step pairs an offer-template with a pool of offers. Progression
 * and per-customer filtering/resiliency are handled by the cart app — see
 * `wiki/upsell-configuration.md`.
 *
 * @param offerTemplateModelId  Resolved id of the `offer-template` model (for the step template reference).
 * @param productModelId        Resolved id of the `product` model (for targeting conditions).
 */
export const createOfferFlowModel = (offerTemplateModelId: string, productModelId: string): ModelShape => {
  return {
    name: 'offer-flow',
    displayName: 'Offer Flow',
    kind: 'data',
    helperText: 'A post-checkout sequence of offer steps shown after checkout.',
    contentTitleField: 'name',
    fields: [
      {
        name: 'name',
        friendlyName: 'Name',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        helperText: 'Internal name for this offer flow.',
      },
      {
        name: 'active',
        friendlyName: 'Active',
        type: 'boolean',
        defaultValue: true,
        defaultCollapsed: true,
        helperText: 'Only active flows are ingested and shown.',
      },
      {
        name: 'isDefault',
        friendlyName: 'Default Flow',
        type: 'boolean',
        defaultValue: false,
        defaultCollapsed: true,
        helperText: 'The fallback flow for the brand when no conditional flow matches.',
      },
      {
        name: 'priority',
        friendlyName: 'Priority',
        type: 'number',
        defaultValue: 0,
        defaultCollapsed: true,
        helperText:
          'Tiebreak among matching conditional flows — higher wins. Applies only between flows that match the' +
          " same number of the order's products; a flow matching more of them wins regardless of priority.",
      },
      {
        name: 'stepTarget',
        friendlyName: 'Step Target',
        type: 'number',
        defaultValue: undefined,
        defaultCollapsed: true,
        helperText:
          'How many surviving steps to present. Configure more steps than this as backups. Blank = show all surviving steps.',
      },
      {
        name: 'steps',
        friendlyName: 'Steps',
        type: 'list',
        defaultCollapsed: true,
        helperText: 'The ordered sequence of offer steps. The customer walks these in order.',
        subFields: [
          {
            name: 'template',
            friendlyName: 'Template',
            type: 'reference',
            modelId: offerTemplateModelId,
            copyOnAdd: false,
            defaultCollapsed: false,
            helperText: 'The offer template used to render this step.',
          },
          {
            name: 'offers',
            friendlyName: 'Offers',
            type: 'list',
            defaultCollapsed: false,
            min: 1,
            helperText:
              "Ordered pool of offers for this step. Provide at least the template's Offer Count; extras are backups.",
            subFields: [
              {
                // Placeholder: becomes the offers-datasource selector once that connection is wired.
                name: 'offer',
                friendlyName: 'Offer',
                type: 'text',
                defaultCollapsed: false,
                helperText: 'Offer identifier (from the offers datasource). Placeholder until the datasource is wired.',
              },
            ],
          },
        ],
      },
      {
        name: 'conditions',
        friendlyName: 'Conditions',
        type: 'list',
        defaultCollapsed: true,
        helperText: 'Targeting conditions. When any match, this flow is preferred over the default.',
        subFields: [
          {
            name: 'conditionType',
            friendlyName: 'Condition Type',
            type: 'select',
            enum: [OfferFlowConditionType.PurchasedProduct],
            defaultValue: OfferFlowConditionType.PurchasedProduct,
            defaultCollapsed: false,
            helperText: 'The kind of condition to evaluate.',
          },
          {
            // Applies to the "Purchased Product" condition type. When more condition
            // types are added, gate this with `showIf` on conditionType.
            name: 'products',
            friendlyName: 'Products',
            type: 'list',
            defaultCollapsed: false,
            helperText: 'Match when the customer just purchased one of these products.',
            subFields: [
              {
                name: 'product',
                friendlyName: 'Product',
                type: 'reference',
                modelId: productModelId,
                copyOnAdd: false,
                defaultCollapsed: false,
                helperText: 'A product that triggers this flow.',
              },
              {
                name: 'quantity',
                friendlyName: 'Quantity',
                type: 'number',
                required: false,
                defaultValue: undefined,
                defaultCollapsed: false,
                helperText:
                  'Only match this exact quantity — each quantity is its own SKU, so 3 will not match a' +
                  ' purchase of 6. Blank = any quantity of this product.',
              },
              {
                name: 'orderType',
                friendlyName: 'Order Type',
                type: 'select',
                enum: [OfferFlowOrderType.Subscription, OfferFlowOrderType.OneTimePurchase, OfferFlowOrderType.Both],
                required: false,
                defaultValue: OfferFlowOrderType.Both,
                defaultCollapsed: false,
                helperText: 'Only match when the product was purchased this way. "Both" matches either.',
              },
            ],
          },
        ],
      },
      {
        name: 'excludeSubscribedProducts',
        friendlyName: 'Exclude Subscribed Products',
        type: 'boolean',
        defaultValue: false,
        defaultCollapsed: true,
        helperText: 'Drop offers whose product the customer already subscribes to.',
      },
      {
        name: 'excludePreviouslyPurchased',
        friendlyName: 'Exclude Previously Purchased',
        type: 'boolean',
        defaultValue: false,
        defaultCollapsed: true,
        helperText: 'Drop offers whose product the customer purchased within the lookback window.',
      },
      {
        name: 'previousPurchaseLookback',
        friendlyName: 'Previous Purchase Lookback',
        type: 'select',
        enum: [
          PreviousPurchaseLookback.OneMonth,
          PreviousPurchaseLookback.TwoMonths,
          PreviousPurchaseLookback.ThreeMonths,
          PreviousPurchaseLookback.SixMonths,
          PreviousPurchaseLookback.TwelveMonths,
          PreviousPurchaseLookback.TwentyFourMonths,
          PreviousPurchaseLookback.Ever,
        ],
        defaultValue: PreviousPurchaseLookback.ThreeMonths,
        defaultCollapsed: true,
        showIf: "return options.get('excludePreviouslyPurchased') === true",
        helperText: 'How far back to look for a previous purchase. "Ever" excludes any past purchase.',
      },
    ],
  };
};

export type BuilderOfferFlowContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      name: string;
      active?: boolean;
      isDefault?: boolean;
      priority?: number;
      stepTarget?: number;
      steps?: {
        template?: BuilderContentReference<BuilderOfferTemplateContent['data']>;
        offers?: {
          offer?: string;
        }[];
      }[];
      conditions?: {
        conditionType?: OfferFlowConditionType;
        products?: {
          product: BuilderContentReference<BuilderProductContent['data']>;
          quantity?: number;
          orderType?: OfferFlowOrderType;
        }[];
      }[];
      excludeSubscribedProducts?: boolean;
      excludePreviouslyPurchased?: boolean;
      previousPurchaseLookback?: PreviousPurchaseLookback;
    };
  }>;
