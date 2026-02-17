import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

interface ProductFilterModels {
  categoryId: string;
  useCaseId: string;
  ingredientId: string;
  tagId: string;
}

enum FilterApplicationType {
  Inclusive = 'Inclusive',
  Exclusive = 'Exclusive',
}

export const createProductGridConfigModel = (models: ProductFilterModels): ModelShape => {
  return {
    name: 'product-grid-filter-group',
    displayName: 'Product Grid Filter Group',
    kind: 'data',
    helperText: 'Build filter group configurations. These can be applied in the brand configuration',
    contentTitleField: 'displayName',
    fields: [
      {
        name: 'displayName',
        friendlyName: 'Display Name/Label',
        type: 'text',
        localized: true,
        defaultCollapsed: false,
        helperText: 'Provide a name to display for this grouping',
        makeEntryTitle: true,
      },
      {
        name: 'categories',
        friendlyName: 'Categories',
        helperText: 'Categories for this group',
        type: 'list',
        defaultCollapsed: true,
        subFields: [
          {
            name: 'category',
            friendlyName: 'Category',
            type: 'reference',
            modelId: models.categoryId,
            required: true,
            localized: false,
            copyOnAdd: true,
            defaultCollapsed: false,
            // makeEntryTitle: true,
          },
        ],
      },
      {
        name: 'ingredients',
        friendlyName: 'Ingredients',
        helperText: 'Ingredients for this group',
        type: 'list',
        defaultCollapsed: true,
        subFields: [
          {
            name: 'ingredient',
            friendlyName: 'Ingredient',
            type: 'reference',
            modelId: models.ingredientId,
            required: true,
            localized: false,
            copyOnAdd: true,
            defaultCollapsed: false,
            // makeEntryTitle: true,
          },
        ],
      },
      {
        name: 'useCases',
        friendlyName: 'Use Cases',
        helperText: 'Use Cases for this group',
        type: 'list',
        defaultCollapsed: true,
        subFields: [
          {
            name: 'useCase',
            friendlyName: 'Use Case',
            type: 'reference',
            modelId: models.useCaseId,
            required: true,
            localized: false,
            copyOnAdd: true,
            defaultCollapsed: false,
            // makeEntryTitle: true,
          },
        ],
        copyOnAdd: false,
      },
      {
        name: 'tags',
        friendlyName: 'Tags',
        helperText: 'Tags for this group',
        type: 'list',
        defaultCollapsed: true,
        subFields: [
          {
            name: 'tag',
            friendlyName: 'Tag',
            type: 'reference',
            modelId: models.tagId,
            required: true,
            localized: false,
            copyOnAdd: true,
            defaultCollapsed: false,
            // makeEntryTitle: true,
          },
        ],
        copyOnAdd: false,
      },
      {
        name: 'filterApplicationType',
        friendlyName: 'Filter Application Type',
        type: 'select',
        enum: [FilterApplicationType.Inclusive, FilterApplicationType.Exclusive],
        defaultValue: 'Inclusive',
        required: false,
        defaultCollapsed: true,
        helperText:
          'Select how this filter is applied in relation to other filters. When set to Exclusive, ALL results must' +
          ' match a selected filter of this group.',
      },
    ],
  };
};

export type BuilderProductGridFilterGroupContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      displayName: string;
      categories: {
        category: {
          id: string;
        } & Record<string, any>;
      }[];
      ingredients: {
        ingredient: {
          id: string;
        } & Record<string, any>;
      }[];
      useCases: {
        useCase: {
          id: string;
        } & Record<string, any>;
      }[];
      tags: {
        tag: {
          id: string;
        } & Record<string, any>;
      }[];
      filterApplicationType: FilterApplicationType;
    };
  }>;
