import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createCategoryModel = (): ModelShape => ({
  name: 'product-category',
  kind: 'data',
  displayName: 'Product Category',
  helperText: 'Categories for products',
  contentTitleField: 'name',
  fields: [
    {
      name: 'name',
      friendlyName: 'Category',
      type: 'text',
      required: true,
      defaultCollapsed: true,
      localized: true,
    },
    {
      name: 'description',
      friendlyName: 'Description',
      type: 'longText',
      required: false,
      defaultCollapsed: true,
      localized: true,
    },
    {
      name: 'desktopImage',
      friendlyName: 'Desktop Image',
      type: 'file',
      defaultCollapsed: true,
      showTemplatePicker: true,
      allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
    },
    {
      name: 'mobileImage',
      defaultCollapsed: true,
      friendlyName: 'Mobile Image',
      type: 'file',
      showTemplatePicker: true,
      allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
    },
    {
      name: 'hidden',
      friendlyName: 'Hide Category',
      type: 'boolean',
      required: false,
      localized: true,
      defaultCollapsed: true,
      helperText: 'When true, this category will not be displayed in product grids or search results for this locale',
    },
    {
      name: 'slug',
      friendlyName: 'Page Slug',
      type: 'text',
      defaultCollapsed: true,
      helperText:
        'If this category has a specific web page, provide the path here without a leading slash (e.g. "shop/supplements") for use in breadcrumb navigation. By default, the path "shop" will be used.',
      required: false,
      localized: false,
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
  ],
});

export type BuilderProductCategoryContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      name: string;
      description?: string;
      desktopImage?: string;
      mobileImage?: string;
      hidden?: boolean;
      slug?: string;
      searchKeys?: string[];
    };
  }>;
