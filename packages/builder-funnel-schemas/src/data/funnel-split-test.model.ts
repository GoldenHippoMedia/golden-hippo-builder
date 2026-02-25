import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderFunnelDestinationContent } from './funnel-destination.model';
import { BuilderFunnelContent } from './funnel.model';

export const createFunnelSplitTestModel = (destinationModelId: string, funnelModelId: string): ModelShape => {
  return {
    name: 'funnel-split-test',
    displayName: 'Funnel Split Test',
    kind: 'data',
    helperText: 'A/B test splitting traffic across funnel variants on a destination',
    contentTitleField: 'name',
    fields: [
      {
        name: 'name',
        friendlyName: 'Name',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'Test name (e.g., "Pricing Test Jan 2026")',
      },
      {
        name: 'destination',
        friendlyName: 'Destination',
        type: 'reference',
        modelId: destinationModelId,
        required: true,
        copyOnAdd: false,
        defaultCollapsed: true,
        helperText: 'The destination running this test',
      },
      {
        name: 'status',
        friendlyName: 'Status',
        type: 'select',
        required: true,
        defaultCollapsed: true,
        enum: ['draft', 'active', 'completed', 'cancelled'],
        defaultValue: 'draft',
        helperText: 'Current status of the split test',
      },
      {
        name: 'variants',
        friendlyName: 'Variants',
        type: 'list',
        required: true,
        localized: false,
        defaultCollapsed: true,
        helperText: 'Funnel variants included in this test — traffic is evenly split',
        subFields: [
          {
            name: 'funnel',
            friendlyName: 'Funnel',
            type: 'reference',
            modelId: funnelModelId,
            required: true,
            copyOnAdd: false,
            defaultCollapsed: true,
            helperText: 'A funnel variant',
          },
          {
            name: 'label',
            friendlyName: 'Label',
            type: 'text',
            required: false,
            localized: false,
            defaultCollapsed: true,
            helperText: 'Variant label (e.g., "Control", "Variant A")',
          },
        ],
      },
    ],
  };
};

export type FunnelSplitTestStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export type FunnelSplitTestVariant = {
  funnel: BuilderContentReference<BuilderFunnelContent>;
  label?: string;
};

export type BuilderFunnelSplitTestContent = BuilderContent &
  Partial<{
    data: {
      name: string;
      destination: BuilderContentReference<BuilderFunnelDestinationContent>;
      status: FunnelSplitTestStatus;
      variants: FunnelSplitTestVariant[];
    } & BuilderResponseBaseData;
  }>;
