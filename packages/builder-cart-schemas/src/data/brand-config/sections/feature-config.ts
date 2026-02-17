import { BuilderIOFieldTypes } from '@goldenhippo/builder-types';

export enum ProductGridFilterType {
  DROPDOWN = 'Dropdown',
  STACKED_LIST = 'Stacked List',
}

export enum ProductLinkPrefix {
  P = '/p',
  PRODUCT = '/product',
}

export const createFeatureConfig = (gridFilterModelId: string): BuilderIOFieldTypes => {
  return {
    name: 'features',
    friendlyName: 'Features',
    type: 'object',
    defaultCollapsed: true,
    subFields: [
      {
        name: 'productGridFilterType',
        friendlyName: 'Product Grid Filter Type',
        type: 'select',
        defaultCollapsed: true,
        helperText: `Select the type of filters to use. 'Dropdown' will display a drop down of categories, ingredients, use cases, and tags. 
        'Stacked List' allows you to create your own filter groupings from amongst those four filter types.`,
        enum: [ProductGridFilterType.DROPDOWN, ProductGridFilterType.STACKED_LIST],
        defaultValue: 'Dropdown',
      },
      {
        name: 'productGridFilterGroups',
        friendlyName: 'Product Grid Filter Groups',
        type: 'list',
        defaultCollapsed: true,
        helperText: 'Select the filter groups to use. They will be presented in the order entered',
        subFields: [
          {
            name: 'filterConfig',
            friendlyName: 'Product Grid Filter',
            type: 'reference',
            defaultCollapsed: true,
            modelId: gridFilterModelId,
            helperText: 'Select a product grid filter group to display',
            copyOnAdd: false,
          },
        ],
        showIf: `return options.get('productGridFilterType') === 'Custom'`,
      },
      {
        name: 'productGridHideRestricted',
        friendlyName: 'Hide Restricted Products',
        helperText: `Hide restricted products from your product grid based on the user's selected country`,
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
      },
      {
        name: 'productLinkPrefix',
        friendlyName: 'Product Link Prefix',
        helperText:
          'Set the prefix to append before product slugs throughout your site. For example, if you enter' +
          ' "p", all links from the product grid will be {website}/p/{product-slug}',
        type: 'select',
        enum: [ProductLinkPrefix.P, ProductLinkPrefix.PRODUCT],
        localized: false,
        defaultCollapsed: true,
        defaultValue: '/p',
      },
      {
        name: 'subscriptionAddOnsEnabled',
        friendlyName: 'Subscription Add-Ons Enabled',
        helperText: 'Enable or disable subscription add-ons for the brand',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
      },
      {
        name: 'shippingThresholdNotificationEnabled',
        friendlyName: 'Shipping Threshold Notification Enabled',
        helperText: 'Enable or disable shipping threshold notifications for the brand',
        type: 'boolean',
        localized: true,
        defaultCollapsed: true,
      },
      {
        name: 'bundlingEnabled',
        friendlyName: 'Enable Bundling Experience',
        helperText: 'Enable or disable the bundling experience for the brand',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
      },
    ],
  };
};
