import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createDefaultWebsiteSectionModel = (editUrl: string): ModelShape => {
  return {
    name: 'default-website-section',
    kind: 'component',
    displayName: 'Default Website Section',
    helperText: 'Default section for the website',
    contentTitleField: undefined,
    fields: [
      {
        name: 'sectionType',
        friendlyName: 'Section Type',
        type: 'select',
        required: true,
        localized: false,
        defaultCollapsed: true,
        enum: [
          'cartPageAboveSummaryContent',
          'cartPageBelowSummaryContent',
          'cartPageEmptyCartContent',
          'cartPageTopSectionContent',
          'gdprContent',
          'mainFooter',
          'offerSelectorAboveCTAContent',
          'offerSelectorBelowCTAContent',
          'subscriptionManagementNoSubsContent',
        ],
        helperText: 'Choose where this content section appears on the website',
      },
    ],
    editingUrlLogic:
      'return `' + editUrl + '/builder-default-website-section?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderDefaultWebsiteSectionContent = BuilderContent & {
  data: BuilderResponseBaseData & {
    sectionType:
      | 'cartPageAboveSummaryContent'
      | 'cartPageBelowSummaryContent'
      | 'cartPageEmptyCartContent'
      | 'cartPageTopSectionContent'
      | 'gdprContent'
      | 'mainFooter'
      | 'offerSelectorAboveCTAContent'
      | 'offerSelectorBelowCTAContent'
      | 'subscriptionManagementNoSubsContent';
  };
};
