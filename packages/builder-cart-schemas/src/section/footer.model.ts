import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createFooterModel = (editUrl: string): ModelShape => {
  return {
    name: 'footer',
    kind: 'component',
    displayName: 'Footer',
    helperText: 'CMS controlled global footer',
    contentTitleField: undefined,
    fields: [],
    editingUrlLogic: 'return `' + editUrl + '/builder-footer-section?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderFooterModelContent = BuilderContent & {
  data: BuilderResponseBaseData
};
