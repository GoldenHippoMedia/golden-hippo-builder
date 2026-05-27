import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createOfferSelectorContentModel = (editUrl: string): ModelShape => {
  return {
    name: 'offer-selector-content',
    kind: 'component',
    displayName: 'Offer Selector Content',
    helperText: 'Add custom content in offer selector section',
    contentTitleField: undefined,
    fields: [],
    editingUrlLogic:
      'return `' + editUrl + '/builder-offer-selector-content?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderOfferSelectorContentModelContent = BuilderContent & {
  data: BuilderResponseBaseData & {};
};
