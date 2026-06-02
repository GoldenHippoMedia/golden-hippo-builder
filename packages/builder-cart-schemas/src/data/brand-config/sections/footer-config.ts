import { BuilderIOFieldTypes } from '@goldenhippo/builder-types';

export enum FooterType {
  BASIC = 'BASIC',
  MEGA = 'MEGA',
  NONE = 'NONE',
  CMS = 'CMS',
}

export const createFooterConfig = (): BuilderIOFieldTypes => {
  return {
    name: 'footer',
    '@type': '@builder.io/core:Field',
    friendlyName: 'Footer',
    type: 'object',
    defaultCollapsed: true,
    helperText: 'Footer layout and content settings',
    subFields: [
      {
        name: 'footerType',
        friendlyName: 'Footer Type',
        type: 'select',
        enum: [FooterType.BASIC, FooterType.MEGA, FooterType.NONE, FooterType.CMS],
        defaultValue: FooterType.BASIC,
        defaultCollapsed: true,
        helperText: 'Choose the footer layout style for the website',
      },
      {
        '@type': '@builder.io/core:Field',
        name: 'cmsFooterConfig',
        showIf: "return options.get('footerType') === 'CMS'",
        friendlyName: 'CMS Footer Config',
        helperText: 'Reference a footer created in Builder CMS to use as the website footer.',
        type: 'reference',
        model: 'footer',
        copyOnAdd: false,
        localized: false,
        required: true,
        defaultCollapsed: true,
      } as BuilderIOFieldTypes,
    ],
  };
};
