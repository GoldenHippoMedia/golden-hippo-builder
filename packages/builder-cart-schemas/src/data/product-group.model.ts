import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export enum ProductGroupType {
  FlavorOptionGroup = 'Flavor/Option Group',
  TrialGroup = 'Trial Group',
}

export const createProductGroupModel = (productModelId: string): ModelShape => {
  return {
    name: 'product-group',
    displayName: 'Product Group',
    kind: 'data',
    helperText: 'Groups related products together (e.g. flavors, trial sizes).',
    contentTitleField: 'displayName',
    fields: [
      {
        name: 'displayName',
        friendlyName: 'Display Name',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: true,
        helperText: 'The display name of this product group.',
      },
      {
        name: 'featuredImage',
        friendlyName: 'Featured Image',
        type: 'file',
        defaultCollapsed: true,
        showTemplatePicker: true,
        allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
        helperText: 'The primary image of this product group.',
      },
      {
        name: 'subHeading',
        friendlyName: 'Sub Heading',
        type: 'text',
        required: false,
        defaultCollapsed: true,
        localized: true,
        helperText: 'A short tagline displayed beneath the group name.',
      },
      {
        name: 'gridTagline',
        friendlyName: 'Grid Tagline',
        type: 'text',
        required: false,
        defaultCollapsed: true,
        localized: true,
        helperText: 'A short tagline displayed on product grid cards.',
      },
      {
        name: 'shortDescription',
        friendlyName: 'Short Description',
        type: 'longText',
        required: false,
        defaultCollapsed: true,
        localized: true,
        helperText: 'A short description of the product group.',
      },
      {
        name: 'products',
        friendlyName: 'Products',
        type: 'list',
        defaultCollapsed: true,
        helperText: 'The products in this group.',
        subFields: [
          {
            name: 'product',
            friendlyName: 'Product',
            type: 'reference',
            defaultCollapsed: false,
            modelId: productModelId,
            copyOnAdd: false,
          },
          {
            name: 'displayName',
            friendlyName: 'Display Name',
            type: 'text',
            defaultCollapsed: false,
            localized: true,
            helperText: 'Override display name for this product in the group context.',
          },
          {
            name: 'isTrialSize',
            friendlyName: 'Is Trial Size',
            type: 'boolean',
            defaultCollapsed: false,
            helperText: 'Whether this product is a trial size variant.',
          },
        ],
      },
      {
        name: 'selectionLabel',
        friendlyName: 'Selection Label',
        type: 'text',
        required: false,
        defaultCollapsed: true,
        localized: true,
        helperText: 'Label for the product selector (e.g. "Choose your flavor").',
      },
      {
        name: 'hidden',
        friendlyName: 'Hide Group',
        type: 'boolean',
        required: false,
        defaultCollapsed: true,
        localized: true,
        helperText: 'When true, this product group will not be displayed.',
      },
      {
        name: 'gh',
        friendlyName: 'Golden Hippo',
        type: 'object',
        defaultCollapsed: true,
        subFields: [
          {
            name: 'productionId',
            friendlyName: 'Production ID',
            type: 'text',
            defaultCollapsed: false,
            helperText: 'The production environment content ID for this product group.',
          },
          {
            name: 'slug',
            friendlyName: 'Slug',
            type: 'text',
            defaultCollapsed: false,
            helperText: 'URL slug for this product group.',
          },
        ],
      },
      {
        name: 'groupType',
        friendlyName: 'Group Type',
        type: 'select',
        defaultCollapsed: true,
        enum: [ProductGroupType.FlavorOptionGroup, ProductGroupType.TrialGroup],
        helperText: 'The type of product grouping.',
      },
      {
        name: 'name',
        friendlyName: 'Group Name',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'The internal name for this product group.',
      },
    ],
  };
};

export type BuilderProductGroupContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      displayName: string;
      featuredImage?: string;
      subHeading?: string;
      gridTagline?: string;
      shortDescription?: string;
      products: {
        product: string; // Reference to product ID
        displayName?: string;
        isTrialSize?: boolean;
      }[];
      selectionLabel?: string;
      hidden?: boolean;
      gh?: {
        productionId?: string;
        slug?: string;
      };
      groupType?: ProductGroupType;
      name: string;
    };
  }>;
