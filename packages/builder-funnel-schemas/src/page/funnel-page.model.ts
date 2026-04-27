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
    {
      name: 'favicon',
      friendlyName: 'Fav Icon',
      type: 'file',
      allowedFileTypes: ['jpeg', 'png', 'svg', 'webp', 'gif'],
      required: false,
      defaultCollapsed: true,
      localized: false,
      helperText: 'Set the favicon icon for this page (appears in browser tab)',
    },
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
          defaultValue: true,
        },
        {
          name: 'noFollow',
          friendlyName: 'No Follow',
          type: 'boolean',
          required: false,
          defaultCollapsed: true,
          helperText: 'Prevent link following',
          defaultValue: true,
        },
      ],
    },
  ];

  return {
    name: 'funnel-page',
    displayName: 'Funnel Page',
    kind: 'page',
    helperText: 'A visual page within a funnel',
    contentTitleField: undefined,
    fields: [...fields],
    editingUrlLogic: 'return `' + editUrl + '${targeting.urlPath}?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderFunnelPageContent = BuilderContent &
  Partial<{
    data: {
      title: string;
      funnel?: BuilderContentReference<BuilderFunnelContent['data']>;
      favicon?: string;
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
