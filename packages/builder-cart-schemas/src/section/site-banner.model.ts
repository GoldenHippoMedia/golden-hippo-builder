import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

enum BannerPosition {
  AboveHeader = 'Above Header',
  BelowHeader = 'Below Header',
}

export const createSiteBannerModel = (editUrl: string): ModelShape => {
  return {
    name: 'banner',
    kind: 'component',
    displayName: 'Banner / Announcement',
    helperText: 'Banners / Announcements to display on your website',
    contentTitleField: undefined,
    fields: [
      {
        name: 'position',
        friendlyName: 'Banner Position',
        type: 'select',
        enum: [BannerPosition.AboveHeader, BannerPosition.BelowHeader],
        defaultValue: 'Above Header',
        helperText: 'Select where this banner should appear on the page',
        defaultCollapsed: true,
      },
    ],
    editingUrlLogic: 'return `' + editUrl + '/builder-banner-section?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderSiteBannerModelContent = BuilderContent & {
  data: BuilderResponseBaseData & {
    position: BannerPosition;
  };
};
