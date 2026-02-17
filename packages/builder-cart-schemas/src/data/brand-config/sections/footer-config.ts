import { BuilderIOFieldTypes } from '@goldenhippo/builder-types';

export enum FooterType {
  BASIC = 'BASIC',
  MEGA = 'MEGA',
  NONE = 'NONE',
}

export const createFooterConfig = (): BuilderIOFieldTypes => {
  return {
    name: 'footer',
    '@type': '@builder.io/core:Field',
    friendlyName: 'Footer',
    type: 'object',
    defaultCollapsed: true,
    subFields: [
      {
        name: 'footerType',
        friendlyName: 'Type',
        type: 'select',
        enum: [FooterType.BASIC, FooterType.MEGA, FooterType.NONE],
        defaultValue: FooterType.BASIC,
        defaultCollapsed: true,
      },
    ],
  };
};
