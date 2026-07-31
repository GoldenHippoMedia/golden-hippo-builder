import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createOfferTemplateModel = (editUrl: string): ModelShape => {
  return {
    name: 'offer-template',
    kind: 'component',
    displayName: 'Offer Template',
    helperText: 'A post-checkout offer template. Designers build the layout; it presents one or more offers.',
    contentTitleField: undefined,
    fields: [
      {
        name: 'offerCount',
        friendlyName: 'Offer Count',
        type: 'number',
        required: true,
        defaultValue: 1,
        defaultCollapsed: false,
        helperText: 'How many offers this template presents (e.g. 1 for a single offer, 3 for a 3-up layout).',
      },
    ],
    editingUrlLogic: 'return `' + editUrl + '/builder-offer-template?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderOfferTemplateContent = BuilderContent & {
  data: BuilderResponseBaseData & {
    offerCount?: number;
  };
};
