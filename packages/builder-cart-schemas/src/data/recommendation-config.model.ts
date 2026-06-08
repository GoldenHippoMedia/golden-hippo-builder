import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderProductTagContent } from '@goldenhippo/builder-shared-schemas';

export const createRecommendationConfigModel = (): ModelShape => {
  return {
    name: 'recommendation-config',
    displayName: 'Recommendation Config',
    kind: 'data',
    helperText: 'Configuration for how product recommendations are generated.',
    contentTitleField: 'displayName',
    fields: [
      {
        name: 'displayName',
        friendlyName: 'Display Name',
        type: 'text',
        required: true,
        defaultCollapsed: false,
        localized: false,
        helperText: 'The name of this recommendation config.',
        makeEntryTitle: true,
      },
      {
        name: 'recommendations',
        friendlyName: 'Recommendations',
        type: 'list',
        required: true,
        defaultCollapsed: false,
        helperText:
          'Each item defines a single recommendation slot. The number of items determines how many recommendations are generated.',
        subFields: [
          {
            name: 'label',
            friendlyName: 'Label',
            type: 'text',
            required: false,
            localized: true,
            defaultCollapsed: false,
            helperText: 'Label for this recommendation slot.',
          },
          {
            name: 'showResult',
            friendlyName: 'Show Result',
            type: 'boolean',
            required: false,
            defaultValue: true,
            defaultCollapsed: false,
            helperText: 'When true, the result of this recommendation is displayed.',
          },
          {
            name: 'requiredTags',
            friendlyName: 'Required Tags',
            type: 'list',
            required: false,
            defaultCollapsed: false,
            helperText: 'Tags that the recommended product must have. Leave empty to allow any tag.',
            subFields: [
              {
                name: 'tag',
                friendlyName: 'Tag',
                type: 'reference',
                model: 'product-tag',
                required: true,
                copyOnAdd: true,
                defaultCollapsed: false,
                helperText: 'Select a tag the recommendation must have.',
              },
            ],
          },
          {
            name: 'excludedTags',
            friendlyName: 'Excluded Tags',
            type: 'list',
            required: false,
            defaultCollapsed: false,
            helperText: 'Tags that the recommended product must NOT have.',
            subFields: [
              {
                name: 'tag',
                friendlyName: 'Tag',
                type: 'reference',
                model: 'product-tag',
                required: true,
                copyOnAdd: true,
                defaultCollapsed: false,
                helperText: 'Select a tag the recommendation must not have.',
              },
            ],
          },
        ],
      },
    ],
  };
};

export type BuilderRecommendationConfigContent = BuilderContent & {
  data: BuilderResponseBaseData &
    Partial<{
      displayName: string;
      recommendations: Array<{
        label?: string;
        showResult?: boolean;
        requiredTags?: { tag: BuilderContentReference<BuilderProductTagContent['data']> }[];
        excludedTags?: { tag: BuilderContentReference<BuilderProductTagContent['data']> }[];
      }>;
    }>;
};
