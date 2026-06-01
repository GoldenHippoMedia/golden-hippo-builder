import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderProductContent } from '@goldenhippo/builder-shared-schemas';

export const createPromotionalCardModel = (productModelId: string, editUrl: string): ModelShape => {
  return {
    name: 'promotional-card',
    kind: 'component',
    displayName: 'Promotional Card',
    helperText: 'Create a promotional card to display in product grid page and more.',
    contentTitleField: undefined,
    fields: [
      {
        name: 'rank',
        friendlyName: 'Rank',
        type: 'number',
        defaultValue: undefined,
        required: false,
        localized: false,
        defaultCollapsed: false,
        helperText:
          'Lower shows first. Only used when no Product is set, or to order multiple cards on the same product.',
      },
      {
        name: 'product',
        friendlyName: 'Product',
        type: 'reference',
        modelId: productModelId,
        required: false,
        copyOnAdd: false,
        defaultCollapsed: false,
        helperText: 'Places this card right after the chosen product. Leave empty to position by Rank.',
      },
    ],
    editingUrlLogic: 'return `' + editUrl + '/builder-promotional-card?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderPromotionalCardContent = BuilderContent & {
  data: BuilderResponseBaseData & {
    rank?: number;
    product?: BuilderContentReference<BuilderProductContent['data']>;
  };
};
