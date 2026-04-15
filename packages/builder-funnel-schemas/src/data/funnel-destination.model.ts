import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderFunnelContent } from './funnel.model';

export const createFunnelDestinationModel = (funnelModelId: string): ModelShape => {
  const fields: ModelShape['fields'] = [
    {
      name: 'name',
      friendlyName: 'Name',
      type: 'text',
      required: true,
      defaultCollapsed: false,
      localized: false,
      helperText: 'Destination name',
    },
    {
      name: 'type',
      friendlyName: 'Type',
      type: 'select',
      required: true,
      defaultCollapsed: false,
      localized: false,
      enum: ['Pre-purchase', 'Post-purchase'],
      helperText: 'The type of destination',
    },
    {
      name: 'slug',
      friendlyName: 'URL Slug',
      type: 'text',
      required: true,
      defaultCollapsed: false,
      localized: false,
      helperText: 'Unique URL slug — used in /d/[slug]',
    },
    {
      name: 'productionId',
      friendlyName: 'Production ID',
      type: 'text',
      required: true,
      defaultCollapsed: false,
      localized: false,
      helperText: 'ID of the destination in the production environment (for syncing purposes)',
    },
    {
      name: 'description',
      friendlyName: 'Description (Internal)',
      type: 'longText',
      required: false,
      defaultCollapsed: true,
      localized: false,
      helperText: 'Optional description of the destination',
    },
    {
      name: 'defaultFunnel',
      friendlyName: 'Default Funnel ID',
      type: 'reference',
      modelId: funnelModelId,
      required: true,
      defaultCollapsed: true,
      localized: false,
      helperText: 'The production ID of the main funnel for this destination.',
      copyOnAdd: false,
    },
    {
      name: 'splitTest',
      friendlyName: 'Split Test',
      type: 'object',
      required: false,
      defaultCollapsed: true,
      localized: false,
      helperText: 'Optional split test configuration for this destination',
      subFields: [
        {
          name: 'name',
          friendlyName: 'Split Test Name',
          type: 'text',
          required: false,
          defaultCollapsed: false,
          localized: false,
          helperText: 'Name of the split test (e.g. "ST-00000123")',
        },
        {
          name: 'productionId',
          friendlyName: 'Split Test Production ID',
          type: 'text',
          required: false,
          defaultCollapsed: false,
          localized: false,
          helperText: 'ID of the split test in the production environment (for syncing purposes)',
        },
        {
          name: 'slug',
          friendlyName: 'Split Test Slug',
          type: 'text',
          required: false,
          defaultCollapsed: false,
          localized: false,
          helperText: 'Unique slug for the split test',
        },
        {
          name: 'options',
          friendlyName: 'Split Test Options',
          type: 'list',
          required: false,
          defaultCollapsed: false,
          copyOnAdd: false,
          localized: false,
          helperText: 'The different options for the split test, each with its own funnel and traffic allocation',
          subFields: [
            {
              name: 'funnel',
              friendlyName: 'Funnel',
              type: 'reference',
              modelId: funnelModelId,
              required: true,
              copyOnAdd: false,
              defaultCollapsed: true,
              helperText: 'The funnel to use for this split test option',
            },
            {
              name: 'trafficAllocation',
              friendlyName: 'Traffic Allocation (%)',
              type: 'number',
              required: true,
              defaultCollapsed: true,
              localized: false,
              helperText: 'The percentage of traffic to allocate to this option (must sum to 100%)',
              min: 1,
              max: 100,
              defaultValue: 100,
            },
            {
              name: 'isControl',
              friendlyName: 'Is Control',
              type: 'boolean',
              required: false,
              defaultCollapsed: true,
              localized: false,
              helperText: 'Whether this option is the control group (i.e. the original funnel without changes)',
            },
          ],
        },
      ],
    },
  ];

  return {
    name: 'funnel-destination',
    displayName: 'Funnel Destination',
    kind: 'data',
    helperText: 'URL entry point for a funnel — users land on /d/[slug]',
    contentTitleField: 'name',
    fields,
  };
};

export type BuilderDestinationSplitTestOption = {
  funnel: BuilderContentReference<BuilderFunnelContent['data']>;
  trafficAllocation: number;
  isControl?: boolean;
};

export type BuilderFunnelDestinationContent = BuilderContent &
  Partial<{
    data: {
      name: string;
      slug: string;
      productionId: string;
      description?: string;
      defaultFunnel: BuilderContentReference<BuilderFunnelContent['data']>;
      defaultFunnelSlug: string;
      active?: boolean;
      splitTest?: {
        productionId: string;
        name: string;
        slug: string;
        options: BuilderDestinationSplitTestOption[];
      };
    } & BuilderResponseBaseData;
  }>;
