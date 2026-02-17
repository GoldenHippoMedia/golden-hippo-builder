import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createIngredientsModel = (): ModelShape => ({
  name: 'product-ingredient',
  displayName: 'Product Ingredient',
  kind: 'data',
  helperText: 'Ingredients used in products',
  contentTitleField: 'name',
  fields: [
    {
      '@type': '@builder.io/core:Field',
      name: 'name',
      friendlyName: 'Ingredient',
      type: 'text',
      required: true,
      defaultCollapsed: true,

      localized: true,
      defaultValue: {
        '@type': '@builder.io/core:LocalizedValue',
      },
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'description',
      friendlyName: 'Description',
      type: 'longText',
      required: false,
      defaultCollapsed: true,

      localized: true,
      defaultValue: {
        '@type': '@builder.io/core:LocalizedValue',
      },
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'image',
      friendlyName: 'Image',
      type: 'file',
      showTemplatePicker: true,
      defaultCollapsed: true,

      allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'shortDescription',
      friendlyName: 'Short Description',
      type: 'longText',
      required: false,
      defaultCollapsed: true,

      localized: true,
      defaultValue: {
        '@type': '@builder.io/core:LocalizedValue',
      },
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'searchKeys',
      friendlyName: 'Search Keys',
      type: 'Tags',
      defaultCollapsed: true,
      helperText: 'Used when building links (e.g. "products?category=[Search Key]")',
      required: false,
      localized: false,
    },
  ],
});

export type BuilderIngredientContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      name: string;
      description?: string;
      image?: string;
      shortDescription?: string;
      searchKeys?: string[];
    };
  }>;
