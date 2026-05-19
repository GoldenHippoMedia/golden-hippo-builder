import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createHeaderModel = (editUrl: string): ModelShape => {
  return {
    name: 'header',
    kind: 'component',
    displayName: 'Header',
    helperText: 'CMS controlled global header',
    contentTitleField: undefined,
    fields: [
      {
        name: 'backgroundColor',
        friendlyName: 'Background Color',
        type: 'color',
        defaultValue: 'transparent',
        helperText: 'Select the background color for the header',
        defaultCollapsed: false,
      },
    ],
    editingUrlLogic: 'return `' + editUrl + '/builder-header-section?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderHeaderModelContent = BuilderContent & {
  data: BuilderResponseBaseData & {
    backgroundColor: string;
  };
};
