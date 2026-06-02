import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

export interface BuilderPaymentConfig {
  payPalGuestEnabled?: boolean;
}

export const createPaymentConfigModel = (): ModelShape => {
  return {
    name: 'gh-payment-config',
    kind: 'data',
    displayName: 'Payment Configuration',
    helperText: 'Configure payment settings for the brand',
    contentTitleField: undefined,
    fields: [
      {
        name: 'payPalGuestEnabled',
        friendlyName: 'PayPal Enabled for Guest',
        helperText: 'Shows the paypal checkout button on the cart page for all users (guest and logged in)',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
      },
    ],
  };
};

export type BuilderPaymentConfigContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & BuilderPaymentConfig;
  }>;
