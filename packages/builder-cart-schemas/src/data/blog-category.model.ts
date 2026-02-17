import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createBlogCategoryModel = (): ModelShape => ({
  name: 'blog-category',
  displayName: 'Blog Category',
  kind: 'data',
  helperText: 'Category for blog categorization',
  contentTitleField: undefined,
  fields: [
    {
      name: 'name',
      friendlyName: 'Name',
      helperText: 'Name of the category',
      type: 'text',
      defaultCollapsed: false,
      localized: true,
      required: true,
    },
    {
      name: 'description',
      friendlyName: 'Category Description',
      helperText: 'Provide a description of the category. This may be used in components.',
      type: 'html',
      defaultCollapsed: false,
      localized: true,
      required: false,
    },
    {
      name: 'slug',
      friendlyName: 'Slug',
      helperText: 'Path to use for linking to this category',
      type: 'text',
      defaultCollapsed: false,
      localized: false,
      required: true,
    },
    {
      name: 'parentId',
      friendlyName: 'Parent Category Id',
      helperText: 'If this category is a child, provide the Id of the parent category',
      type: 'text',
      required: false,
      defaultCollapsed: true,
      localized: false,
    },
  ],
});

export type BuilderBlogCategoryContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      name: string;
      description?: string;
      slug: string;
      parentId?: string;
    };
  }>;
