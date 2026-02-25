import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createProductUseCaseModel = (): ModelShape => ({
  name: 'product-use-case',
  kind: 'data',
  displayName: 'Product Use Case',
  helperText: 'Provides a link between products used for the same goal.',
  contentTitleField: 'name',
  fields: [
    {
      name: 'name',
      defaultCollapsed: true,

      friendlyName: 'Use Case',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      friendlyName: 'Description',
      type: 'longText',
      defaultCollapsed: true,
      required: false,
      localized: true,
    },
    {
      name: 'searchKeys',
      friendlyName: 'Search Keys',
      type: 'Tags',
      defaultCollapsed: true,
      helperText: 'Used when building links (e.g. "products?category=[Search Key]")',
      required: false,
      localized: false,
    },
    {
      name: 'image',
      friendlyName: 'Image',
      defaultCollapsed: true,
      type: 'file',
      showTemplatePicker: true,
      allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
    },
    {
      name: 'hidden',
      friendlyName: 'Hide Use Case',
      type: 'boolean',
      required: false,
      localized: true,
      defaultCollapsed: true,
      helperText: 'When true, this use case will not be displayed in product grids or search results for this locale',
    },
  ],
});

export type BuilderProductUseCaseContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      name: string;
      description?: string;
      searchKeys?: string[];
      image?: string;
      hidden?: boolean;
    };
  }>;
