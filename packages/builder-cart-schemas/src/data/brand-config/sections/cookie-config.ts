import { BuilderIOFieldTypes } from '@goldenhippo/builder-types';

export const createCookieConfig = (): BuilderIOFieldTypes => {
  return {
    name: 'cookieConfig',
    friendlyName: 'Cookie Configuration',
    type: 'object',
    defaultCollapsed: true,
    subFields: [
      {
        name: 'popupBanner',
        friendlyName: 'Cookie Policy Popup Banner',
        type: 'object',
        defaultCollapsed: true,
        helperText: 'Configure the cookie policy popup banner',
        subFields: [
          {
            name: 'content',
            friendlyName: 'Content',
            type: 'html',
            localized: true,
            defaultCollapsed: true,
            helperText: 'Content for the cookie policy popup banner',
          },
          {
            name: 'bannerStyles',

            friendlyName: 'Banner Styles',
            type: 'object',
            defaultCollapsed: true,
            subFields: [
              {
                name: 'backgroundColor',
                friendlyName: 'Background Color',
                type: 'color',
                required: false,
                defaultCollapsed: true,
              },
              {
                name: 'borderRadius',
                friendlyName: 'Border Radius',
                type: 'text',
                required: false,
                defaultCollapsed: true,
              },
            ],
          },
          {
            name: 'buttonStyles',

            friendlyName: 'Button Styles',
            type: 'object',
            defaultCollapsed: true,
            subFields: [
              {
                name: 'backgroundColor',
                friendlyName: 'Background Color',
                type: 'color',
                required: false,
                defaultCollapsed: true,
              },
              {
                name: 'color',
                friendlyName: 'Color',
                type: 'color',
                required: false,
                defaultCollapsed: true,
              },
            ],
          },
        ],
      },
    ],
  };
};
