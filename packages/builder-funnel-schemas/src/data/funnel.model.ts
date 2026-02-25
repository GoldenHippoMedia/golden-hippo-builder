import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderFunnelOfferContent } from './funnel-offer.model';
import { BuilderFunnelPageContent } from '../page/funnel-page.model';
import { SUBSCRIPTION_FREQUENCIES, SubscriptionFrequency } from './subscription-frequency';

export const createFunnelModel = (offerModelId: string, funnelPageModelId: string): ModelShape => {
  return {
    name: 'funnel',
    displayName: 'Funnel',
    kind: 'data',
    helperText: 'A specific sequence of pages tied to an offer, with resolved pricing and steps',
    contentTitleField: 'name',
    fields: [
      {
        name: 'name',
        friendlyName: 'Name',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'Funnel name (e.g., "Control", "Pricing Test v2")',
      },
      {
        name: 'offer',
        friendlyName: 'Offer',
        type: 'reference',
        modelId: offerModelId,
        required: true,
        copyOnAdd: false,
        defaultCollapsed: true,
        helperText: 'The offer this funnel belongs to',
      },
      {
        name: 'isControl',
        friendlyName: 'Control Funnel',
        type: 'boolean',
        required: false,
        defaultCollapsed: true,
        helperText: 'Whether this is the control funnel for its offer',
      },
      {
        name: 'status',
        friendlyName: 'Status',
        type: 'select',
        required: true,
        defaultCollapsed: true,
        enum: ['draft', 'active', 'paused', 'archived'],
        defaultValue: 'draft',
        helperText: 'Current status of the funnel',
      },
      {
        name: 'pricing',
        friendlyName: 'Pricing',
        type: 'list',
        required: true,
        localized: false,
        defaultCollapsed: true,
        helperText: 'Resolved pricing tiers for this funnel (initialized from offer defaults, then customized)',
        subFields: [
          {
            name: 'quantity',
            friendlyName: 'Quantity',
            type: 'number',
            defaultValue: 1,
            required: true,
            defaultCollapsed: true,
            helperText: 'Purchase quantity',
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
          {
            name: 'checkoutFeatures',
            friendlyName: 'Checkout Features',
            type: 'object',
            defaultCollapsed: true,
            helperText: 'Per-tier checkout configuration',
            subFields: [
              {
                name: 'tryBeforeYouBuy',
                friendlyName: 'Try Before You Buy',
                type: 'object',
                defaultCollapsed: true,
                subFields: [
                  {
                    name: 'enabled',
                    friendlyName: 'Enabled',
                    type: 'boolean',
                    required: false,
                    defaultCollapsed: true,
                    helperText: 'Whether Try Before You Buy is available for this tier',
                  },
                  {
                    name: 'upfrontCost',
                    friendlyName: 'Upfront Cost',
                    type: 'number',
                    defaultValue: undefined,
                    required: false,
                    defaultCollapsed: true,
                    helperText: 'Upfront charge for Try Before You Buy',
                  },
                ],
              },
              {
                name: 'installmentPayments',
                friendlyName: 'Installment Payments',
                type: 'object',
                defaultCollapsed: true,
                subFields: [
                  {
                    name: 'enabled',
                    friendlyName: 'Enabled',
                    type: 'boolean',
                    required: false,
                    defaultCollapsed: true,
                    helperText: 'Whether installment payments are available for this tier',
                  },
                  {
                    name: 'numberOfInstallments',
                    friendlyName: 'Number of Installments',
                    type: 'number',
                    defaultValue: undefined,
                    required: false,
                    defaultCollapsed: true,
                    helperText: 'Number of installment payments',
                  },
                  {
                    name: 'installmentAmount',
                    friendlyName: 'Installment Amount',
                    type: 'number',
                    defaultValue: undefined,
                    required: false,
                    defaultCollapsed: true,
                    helperText: 'Per-installment charge amount',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'steps',
        friendlyName: 'Steps',
        type: 'list',
        required: true,
        localized: false,
        defaultCollapsed: true,
        helperText: 'Ordered funnel step sequence',
        subFields: [
          {
            name: 'stepType',
            friendlyName: 'Step Type',
            type: 'select',
            required: true,
            defaultCollapsed: true,
            enum: ['landing', 'survey', 'vsl', 'coupon', 'offer-selector'],
            helperText: 'The type of funnel step',
          },
          {
            name: 'label',
            friendlyName: 'Label',
            type: 'text',
            required: false,
            localized: true,
            defaultCollapsed: true,
            helperText: 'Display label for this step',
          },
          {
            name: 'page',
            friendlyName: 'Page',
            type: 'reference',
            modelId: funnelPageModelId,
            required: false,
            copyOnAdd: false,
            defaultCollapsed: true,
            helperText: 'Builder.io page for this step',
          },
        ],
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
            required: false,
            localized: false,
            defaultCollapsed: true,
            helperText:
              'Optional URL path segment (accessible at /fp/[slug]). All funnels are also accessible at /fp/[id].',
          },
        ],
      },
    ],
  };
};

export type FunnelPricingTier = {
  quantity: number;
  label?: string;
  isMostPopular?: boolean;
  standardPrice: number;
  subscriptionAvailable?: boolean;
  subscriptionPrice?: number;
  subscriptionFrequency?: SubscriptionFrequency;
  checkoutFeatures?: {
    tryBeforeYouBuy?: {
      enabled?: boolean;
      upfrontCost?: number;
    };
    installmentPayments?: {
      enabled?: boolean;
      numberOfInstallments?: number;
      installmentAmount?: number;
    };
  };
};

export type FunnelStepType = 'landing' | 'survey' | 'vsl' | 'coupon' | 'offer-selector';

export type FunnelStep = {
  stepType: FunnelStepType;
  label?: string;
  page?: BuilderContentReference<BuilderFunnelPageContent>;
};

export type FunnelStatus = 'draft' | 'active' | 'paused' | 'archived';

export type BuilderFunnelContent = BuilderContent &
  Partial<{
    data: {
      name: string;
      offer: BuilderContentReference<BuilderFunnelOfferContent>;
      isControl?: boolean;
      status: FunnelStatus;
      pricing: FunnelPricingTier[];
      steps: FunnelStep[];
      gh?: {
        slug?: string;
      };
    } & BuilderResponseBaseData;
  }>;
