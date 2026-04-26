import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export enum FunnelType {
  PREPURCHASE = 'Pre-purchase',
  POSTPURCHASE = 'Post-purchase',
}

export const createFunnelModel = (): ModelShape => {
  return {
    name: 'funnel',
    displayName: 'Funnel',
    kind: 'data',
    helperText: 'A specific sequence of pages tied to an offer, with resolved pricing and steps',
    contentTitleField: 'name',
    fields: [
      {
        name: 'brand',
        friendlyName: 'Brand',
        type: 'text',
        required: true,
        defaultCollapsed: false,
        localized: false,
        helperText: 'The brand for this funnel (must match the API value)',
      },
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
        name: 'type',
        friendlyName: 'Funnel Type',
        type: 'select',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'Type of the funnel, either Pre-purchase or Post-purchase',
        enum: [FunnelType.PREPURCHASE, FunnelType.POSTPURCHASE],
        defaultValue: FunnelType.PREPURCHASE,
      },
      {
        name: 'active',
        friendlyName: 'Active',
        type: 'boolean',
        required: false,
        defaultCollapsed: true,
        localized: false,
        helperText: 'Whether the funnel is active. Inactive funnels will not be used in the live site.',
      },
      {
        name: 'slug',
        friendlyName: 'URL Slug',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'Unique URL slug for the funnel (e.g., "control", "pricing-test-v2")',
      },
      {
        name: 'productionId',
        friendlyName: 'Production ID',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'ID of the funnel in the production environment (for syncing purposes)',
      },
    ],
  };
};

export type BuilderFunnelContent = BuilderContent &
  Partial<{
    data: {
      brand: string;
      name: string;
      type?: 'Pre-purchase' | 'Post-purchase';
      active?: boolean;
      slug: string;
      productionId: string;
    } & BuilderResponseBaseData;
  }>;
