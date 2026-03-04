import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderFunnelContent } from '../data';

export const createFunnelPageModel = (editUrl: string, funnelModelId: string): ModelShape => {
  const fields: ModelShape['fields'] = [
    {
      name: 'title',
      friendlyName: 'Title',
      type: 'text',
      required: true,
      localized: true,
      defaultCollapsed: true,
      helperText: 'Page title',
    },
    {
      name: 'funnel',
      friendlyName: 'Funnel',
      type: 'reference',
      modelId: funnelModelId,
      required: false,
      copyOnAdd: false,
      defaultCollapsed: true,
      helperText: 'The funnel this page belongs to',
    },
  ];

  return {
    name: 'funnel-page',
    displayName: 'Funnel Page',
    kind: 'page',
    helperText: 'A visual page within a funnel',
    contentTitleField: undefined,
    fields: [
      ...fields,
      {
        name: 'seo',
        friendlyName: 'SEO',
        type: 'object',
        defaultCollapsed: true,
        helperText: 'SEO configuration for this page',
        subFields: [
          {
            name: 'heading',
            friendlyName: 'Heading',
            type: 'text',
            required: false,
            localized: true,
            defaultCollapsed: true,
            helperText: 'Override page title for SEO',
          },
          {
            name: 'description',
            friendlyName: 'Description',
            type: 'longText',
            required: false,
            localized: true,
            defaultCollapsed: true,
            helperText: 'Meta description',
          },
          {
            name: 'image',
            friendlyName: 'Image',
            type: 'file',
            defaultCollapsed: true,
            showTemplatePicker: true,
            allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
            helperText: 'Open Graph image',
          },
        ],
      },
      {
        name: 'robotsMeta',
        friendlyName: 'Robots Meta',
        type: 'object',
        defaultCollapsed: true,
        helperText: 'Robots directives for search engines',
        subFields: [
          {
            name: 'noIndex',
            friendlyName: 'No Index',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Prevent indexing',
          },
          {
            name: 'noFollow',
            friendlyName: 'No Follow',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Prevent link following',
          },
        ],
      },
    ],
    editingUrlLogic:
      'return `' + editUrl + '/fp/preview${targeting.urlPath}?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderFunnelPageContent = BuilderContent &
  Partial<{
    data: {
      title: string;
      funnel?: BuilderContentReference<BuilderFunnelContent['data']>;
      seo?: {
        heading?: string;
        description?: string;
        image?: string;
      };
      robotsMeta?: {
        noIndex?: boolean;
        noFollow?: boolean;
      };
    } & BuilderResponseBaseData;
  }>;
