import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderFunnelOfferContent } from './funnel-offer.model';
import { BuilderFunnelContent } from './funnel.model';
import { BuilderFunnelSplitTestContent } from './funnel-split-test.model';

export const createFunnelDestinationModel = (
  offerModelId: string,
  funnelModelId: string,
  splitTestModelId?: string,
): ModelShape => {
  const fields: ModelShape['fields'] = [
    {
      name: 'name',
      friendlyName: 'Name',
      type: 'text',
      required: true,
      defaultCollapsed: true,
      localized: false,
      helperText: 'Destination name',
    },
    {
      name: 'slug',
      friendlyName: 'URL Slug',
      type: 'text',
      required: true,
      defaultCollapsed: true,
      localized: false,
      helperText: 'Unique URL slug — used in /d/[slug]',
      regex: {
        pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
        message: 'Slug must be lowercase letters, numbers, and hyphens only (e.g., "my-offer-2026")',
      },
    },
    {
      name: 'offer',
      friendlyName: 'Offer',
      type: 'reference',
      modelId: offerModelId,
      required: true,
      copyOnAdd: false,
      defaultCollapsed: true,
      helperText: 'The offer for this destination',
    },
    {
      name: 'primaryFunnel',
      friendlyName: 'Primary Funnel',
      type: 'reference',
      modelId: funnelModelId,
      required: true,
      copyOnAdd: false,
      defaultCollapsed: true,
      helperText: 'Default funnel used when no split test is active (typically the control)',
    },
    {
      name: 'followControlUpdates',
      friendlyName: 'Follow Control Updates',
      type: 'boolean',
      required: false,
      defaultCollapsed: true,
      helperText: "Auto-swap primary funnel when the offer's control funnel changes",
    },
    {
      name: 'status',
      friendlyName: 'Status',
      type: 'select',
      required: true,
      defaultCollapsed: true,
      enum: ['active', 'inactive'],
      defaultValue: 'active',
      helperText: 'Current status of the destination',
    },
  ];

  if (splitTestModelId) {
    fields.push({
      name: 'activeSplitTest',
      friendlyName: 'Active Split Test',
      type: 'reference',
      modelId: splitTestModelId,
      required: false,
      copyOnAdd: false,
      defaultCollapsed: true,
      helperText: 'The currently active split test on this destination (at most one)',
    });
  }

  return {
    name: 'funnel-destination',
    displayName: 'Funnel Destination',
    kind: 'data',
    helperText: 'URL entry point for a funnel — users land on /d/[slug]',
    contentTitleField: 'name',
    fields,
  };
};

export type FunnelDestinationStatus = 'active' | 'inactive';

export type BuilderFunnelDestinationContent = BuilderContent &
  Partial<{
    data: {
      name: string;
      slug: string;
      offer: BuilderContentReference<BuilderFunnelOfferContent>;
      primaryFunnel: BuilderContentReference<BuilderFunnelContent>;
      activeSplitTest?: BuilderContentReference<BuilderFunnelSplitTestContent>;
      followControlUpdates?: boolean;
      status: FunnelDestinationStatus;
    } & BuilderResponseBaseData;
  }>;
