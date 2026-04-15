import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createProductTagModel = (): ModelShape => ({
  name: 'product-tag',
  kind: 'data',
  displayName: 'Product Tag',
  helperText: 'Provides a link between products across categories.',
  contentTitleField: 'name',
  fields: [
    {
      name: 'name',
      friendlyName: 'Tag',
      type: 'text',
      required: true,
      defaultCollapsed: true,
      localized: true,
      makeEntryTitle: true,
      helperText: 'The display name of this tag (e.g. "Favorites", "New", "Best Seller")',
    },
    {
      name: 'tagColor',
      friendlyName: 'Color',
      type: 'color',
      required: true,
      defaultCollapsed: true,
      localized: false,
      defaultValue: 'gba(255, 233, 214, 1)',
      helperText: 'The background color shown behind the tag label on product cards',
    },
    {
      name: 'hidden',
      friendlyName: 'Hide Tag',
      type: 'boolean',
      required: false,
      localized: true,
      defaultCollapsed: true,
      helperText: 'When true, this tag will not be displayed in product grids or search results for this locale',
    },
    {
      name: 'image',
      friendlyName: 'Tag Image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
      required: false,
      localized: true,
      defaultCollapsed: true,
      helperText: 'For product grids that support tag images, you may provide the image here.',
    },
    {
      name: 'pluralDisplayName',
      friendlyName: 'Plural Display Name',
      defaultCollapsed: true,
      type: 'text',
      helperText:
        'This is used when grouping/filtering. Allows us to display "Favorites" instead of "Fave", for example.',
      required: false,
      localized: true,
    },
  ],
});

export type BuilderProductTagContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      name: string;
      tagColor: string;
      hidden?: boolean;
      image?: string;
      pluralDisplayName?: string;
    };
  }>;
