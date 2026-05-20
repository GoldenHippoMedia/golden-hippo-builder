import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export const createSubscriptionCancellationPanelModel = (editUrl: string): ModelShape => {
  return {
    name: 'subscription-cancellation-panel',
    kind: 'component',
    displayName: 'Subscription Cancellation Panel',
    helperText: 'Panel that is available as part of the subscription cancellation flow',
    contentTitleField: undefined,
    fields: [
      {
        name: 'panelType',
        friendlyName: 'The type of panel',
        type: 'text',
        required: false,
        localized: false,
        defaultCollapsed: true,
      },
    ],
    editingUrlLogic:
      'return `' +
      editUrl +
      '/builder-subscription-cancellation-panel-section?builder.preview=true&builder.frameEditing=true`',
  };
};

export type BuilderSubscriptionCancellationPanelContent = BuilderContent & {
  data: BuilderResponseBaseData & {
    panelType?: string;
  };
};
