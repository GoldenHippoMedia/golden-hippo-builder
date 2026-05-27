import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createUpsellTemplateModel = (editUrl: string): ModelShape => {
  return {
    name: 'upsell-template',
    kind: 'component',
    displayName: 'Upsell Template',
    helperText: 'Upsell offer page template',
    contentTitleField: undefined,
    fields: [],
    editingUrlLogic: 'return `' + editUrl + '/builder-upsell-template?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderUpsellTemplateContent = BuilderContent & {
  data: BuilderResponseBaseData;
};
