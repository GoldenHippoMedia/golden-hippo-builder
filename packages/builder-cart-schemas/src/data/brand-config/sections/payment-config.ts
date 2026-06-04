import { BuilderIOFieldTypes } from '@goldenhippo/builder-types';

export const createPaymentConfig = (paymentConfigModelId: string): BuilderIOFieldTypes => {
  return {
    name: 'paymentConfig',
    friendlyName: 'Payment Config',
    type: 'reference',
    modelId: paymentConfigModelId,
    copyOnAdd: false,
    defaultCollapsed: true,
    helperText: 'Configure payment settings for the brand',
  };
};
