import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createPromotionalCardModel = (editUrl: string): ModelShape => {
  return {
    name: 'promotional-card',
    kind: 'component',
    displayName: 'Promotional Card',
    helperText: 'Create a promotional card to display in product grid page and more.',
    contentTitleField: undefined,
    fields: [],
    editingUrlLogic: 'return `' + editUrl + '/builder-promotional-card?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderPromotionalCardContent = BuilderContent & {
  data: BuilderResponseBaseData;
};
