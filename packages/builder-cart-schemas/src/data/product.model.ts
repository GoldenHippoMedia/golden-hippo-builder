import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

interface ProductModelProps {
  ingredientsModelId: string;
  categoryModelId: string;
  tagModelId: string;
  useCaseModelId: string;
}

export const createProductModel = (request: ProductModelProps): ModelShape => {
  return {
    name: 'product',
    displayName: 'Product',
    kind: 'data',
    helperText: 'Product Catalog',
    contentTitleField: 'name',
    fields: [
      {
        name: 'displayName',
        friendlyName: 'Display Name',
        type: 'text',
        required: true,
        localized: true,
        defaultCollapsed: true,
        helperText: 'This is the name that will be displayed to the customer',
      },
      {
        name: 'featuredImage',
        friendlyName: 'Featured Image',
        helperText: 'Displayed on the product card',
        defaultCollapsed: true,
        type: 'file',
        showTemplatePicker: true,
        allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
      },
      {
        name: 'secondaryImage',
        friendlyName: 'Secondary Image',
        helperText: 'Displayed on the product card hover for some grids',
        defaultCollapsed: true,
        type: 'file',
        showTemplatePicker: true,
        allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
      },
      {
        name: 'subHeading',
        defaultCollapsed: true,
        friendlyName: 'Product Headline',
        helperText: 'Subheading (tagline) for the product, displayed on the product card',
        type: 'text',
        localized: true,
      },
      {
        name: 'gridTagline',
        defaultCollapsed: true,
        friendlyName: 'Grid Tagline',
        helperText:
          'By default, we use the Product Headline field. Use this to override the tagline when' +
          ' displayed on the product grid.',
        type: 'text',
        required: false,
        localized: true,
      },
      {
        name: 'gridDescription',
        defaultCollapsed: true,
        friendlyName: 'Grid Description',
        helperText: 'A small description, used on some product grids as an additional sub-heading or tagline.',
        type: 'text',
        required: false,
        localized: true,
      },
      {
        name: 'shortDescription',
        defaultCollapsed: true,
        friendlyName: 'Short Description',
        helperText: 'Short description of the product, typically displayed on the PDP',
        type: 'html',
        required: false,
        localized: true,
      },
      {
        name: 'quote',
        friendlyName: 'Quote',
        defaultCollapsed: true,
        helperText: 'A quote provided by the brand guru or spokesperson',
        type: 'html',
        localized: true,
        required: false,
      },
      {
        name: 'packagingLabels',
        friendlyName: 'Packaging Labels',
        defaultCollapsed: true,
        type: 'object',
        subFields: [
          {
            name: 'singular',
            friendlyName: 'Singular',
            defaultCollapsed: true,
            type: 'text',
            required: true,
            localized: true,
            helperText: 'Provides the name of the packaging for single product (e.g. Unit, Jar, etc.)',
          },
          {
            name: 'plural',
            defaultCollapsed: true,
            friendlyName: 'Plural',
            type: 'text',
            required: true,
            localized: true,
            helperText:
              'Provides the name of the packaging for multiple quantities of the product (e.g. Units, Jars, etc.)',
          },
        ],
      },
      {
        name: 'hidden',
        friendlyName: 'Hide Product',
        type: 'boolean',
        required: false,
        localized: true,
        defaultCollapsed: true,
        helperText: 'When true, this product will not be displayed in product grids or search results for this locale',
      },
      {
        name: 'outOfStock',
        friendlyName: 'Out of Stock',
        type: 'boolean',
        required: false,
        defaultCollapsed: true,
        helperText:
          'Indicates whether this product is currently out of stock. When true, this product is not eligible for purchase.',
      },
      {
        name: 'cartOutOfStock',
        friendlyName: 'Out of Stock (Site)',
        type: 'boolean',
        required: false,
        defaultCollapsed: true,
        helperText:
          'Indicates that this product should be presented as out of stock on the site, even if it is not truly out of stock. ' +
          'This is used as an override for special cases where the product should not be purchasable on the site while remaining purchasable elsewhere.',
      },
      {
        name: 'upc',
        defaultCollapsed: true,
        friendlyName: 'UPC Code',
        type: 'text',
        required: false,
        helperText: 'The UPC code of this product',
      },
      {
        name: 'reviews',
        friendlyName: 'Review Data',
        helperText:
          'Stores review data for this product. These values are automatically generated and should not be modified.',
        type: 'object',
        defaultCollapsed: true,
        subFields: [
          {
            name: 'id',
            defaultCollapsed: true,
            friendlyName: 'Review ID',
            type: 'text',
            required: true,
            localized: false,
            helperText: 'ID used by the review service to identify this product. Do not modify this value.',
          },
          {
            defaultCollapsed: true,
            name: 'count',
            friendlyName: 'Review Count',
            type: 'number',
            defaultValue: 0,
            required: true,
            localized: false,
            helperText:
              'The number of reviews for this product. This value is automatically updated by the review service.',
          },
          {
            name: 'averageRating',
            friendlyName: 'Average Rating',
            type: 'number',
            defaultCollapsed: true,
            defaultValue: 0,
            required: true,
            localized: false,
            helperText:
              'The average rating for this product. This value is automatically updated by the review service.',
          },
        ],
      },
      {
        name: 'tags',
        friendlyName: 'Tags',
        type: 'list',
        localized: true,
        defaultCollapsed: true,
        subFields: [
          {
            type: 'reference',
            modelId: request.tagModelId,
            name: 'tag',
            friendlyName: 'Tag',
            copyOnAdd: false,
            defaultCollapsed: true,
          },
        ],
      },
      {
        name: 'categories',
        friendlyName: 'Categories',
        type: 'list',
        localized: true,
        defaultCollapsed: true,
        subFields: [
          {
            type: 'reference',
            modelId: request.categoryModelId,
            name: 'category',
            friendlyName: 'Category',
            copyOnAdd: false,
            defaultCollapsed: true,
          },
        ],
      },
      {
        name: 'ingredients',
        friendlyName: 'Ingredients',
        type: 'list',
        localized: true,
        defaultCollapsed: true,
        subFields: [
          {
            type: 'reference',
            modelId: request.ingredientsModelId,
            name: 'ingredient',
            friendlyName: 'Ingredient',
            copyOnAdd: false,
            defaultCollapsed: true,
          },
        ],
      },
      {
        name: 'useCases',
        defaultCollapsed: true,
        friendlyName: 'Use Cases',
        type: 'list',
        localized: true,
        subFields: [
          {
            type: 'reference',
            modelId: request.useCaseModelId,
            name: 'useCase',
            friendlyName: 'Use Case',
            copyOnAdd: false,
            defaultCollapsed: true,
          },
        ],
      },
      {
        name: 'name',
        friendlyName: 'Name',
        type: 'text',
        required: true,
        defaultCollapsed: true,
        localized: false,
        helperText: 'Internal name for the product, used for identification in the CMS',
      },
      {
        name: 'gh',
        friendlyName: 'Golden Hippo Integration Data',
        helperText: 'Stores integration data for Golden Hippo. Do not modify any of these values.',
        type: 'object',
        subFields: [
          {
            name: 'slug',
            friendlyName: 'Page Slug',
            type: 'text',
            required: true,
            localized: false,
            defaultCollapsed: true,
            helperText:
              'This is the URL slug for this product. This value is unique and required for cross-environment' +
              ' development. Do not modify this value.',
          },
          {
            name: 'productionId',
            friendlyName: 'Production ID',
            type: 'text',
            required: true,
            localized: false,
            defaultCollapsed: true,
            helperText:
              'This is the unique identifier for this product in the production environment. Do not modify this value.',
          },
          {
            name: 'type',
            friendlyName: 'Product Type',
            type: 'select',
            required: true,
            localized: false,
            defaultCollapsed: true,
            enum: ['Product', 'Bundle', 'Trial Size'],
            defaultValue: 'Product',
            helperText: 'Product Type',
          },
        ],
        defaultCollapsed: true,
        localized: false,
      },
    ],
  };
};

export type BuilderProductContent = BuilderContent &
  Partial<{
    data: {
      name: string;
      displayName: string;
      featuredImage?: string;
      secondaryImage?: string;
      subHeading?: string;
      gridTagline?: string;
      gridDescription?: string;
      shortDescription?: string;
      quote?: string;
      packagingLabels?: {
        singular: string;
        plural: string;
      };
      hidden?: boolean;
      outOfStock?: boolean;
      cartOutOfStock?: boolean;
      upc?: string;
      reviews?: {
        id: string;
        count: number;
        averageRating: number;
      };
      tags?: {
        tag: {
          name: string;
          displayName: string;
        };
      }[];
      categories?: {
        category: {
          name: string;
          displayName: string;
        };
      }[];
      ingredients?: {
        ingredient: {
          name: string;
          displayName: string;
        };
      }[];
      useCases?: {
        useCase: {
          name: string;
          displayName: string;
        };
      }[];
      gh: {
        slug: string;
        productionId: string;
        type: 'Product' | 'Bundle' | 'Trial Size';
      };
    } & BuilderResponseBaseData;
  }>;
