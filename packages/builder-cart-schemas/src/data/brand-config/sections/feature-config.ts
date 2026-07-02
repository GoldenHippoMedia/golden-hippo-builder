import { BuilderIOFieldTypes } from '@goldenhippo/builder-types';

export enum ProductGridFilterType {
  DROPDOWN = 'Dropdown',
  STACKED_LIST = 'Stacked List',
  HORIZONTAL_LIST = 'Horizontal List',
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
    helperText: 'Enable or disable site-wide features and behaviors',
    subFields: [
      {
        name: 'productGridFilterType',
        friendlyName: 'Product Grid Filter Type',
        type: 'select',
        defaultCollapsed: true,
        helperText: `Select the type of filters to use. 'Dropdown' will display a drop down of categories, ingredients, use cases, and tags. 
        'Stacked List' allows you to create your own filter groupings from amongst those four filter types.
        'Horizontal List' displays Product Categories only horizontally; click to filter on page or navigate option available.`,
        enum: [
          ProductGridFilterType.DROPDOWN,
          ProductGridFilterType.STACKED_LIST,
          ProductGridFilterType.HORIZONTAL_LIST,
        ],
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
        //showIf: `return options.get('productGridFilterType') === ('Custom' || '${ProductGridFilterType.STACKED_LIST}')`,
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
      {
        name: 'cartDrawerEnabled',
        friendlyName: 'Enable Cart Drawer',
        helperText: 'Enable or disable the cart drawer experience for the brand',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
      },
      {
        name: 'passwordlessLoginEnabled',
        friendlyName: 'Enable Passwordless Login',
        helperText: 'Enable or disable passwordless login for the brand',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
      },
      {
        name: 'passwordlessLoginDefault',
        friendlyName: 'Passwordless Login is Default',
        helperText: 'When enabled, passwordless login is presented as the default login method',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
        showIf: `return options.get('passwordlessLoginEnabled') === true`,
      },
      {
        name: 'subscriptionExperience',
        friendlyName: 'Subscription Experience',
        type: 'select',
        enum: ['Classic', 'Version 2'],
        defaultValue: 'Classic',
        defaultCollapsed: false,
        helperText: 'Select the subscription management experience for customers',
      },
      {
        name: 'useDefaultFrequencies',
        friendlyName: 'Use Default Frequencies',
        type: 'boolean',
        helperText:
          'When enabled, the selected frequency on an Offer Selector is calculated based on the product and quantity selected.',
        defaultCollapsed: false,
      },
      {
        name: 'recommendationConfig',
        friendlyName: 'Recommendation Config',
        type: 'reference',
        model: 'recommendation-config',
        localized: false,
        defaultCollapsed: false,
        copyOnAdd: false,
        helperText: 'Select the global recommendation config used to generate product recommendations site-wide.',
      },
      {
        name: 'dynamicBrowserTab',
        friendlyName: 'Dynamic Browser Tab',
        type: 'object',
        defaultCollapsed: true,
        helperText:
          'When enabled, the browser tab title blinks to a custom message after the user switches away from the tab.',
        subFields: [
          {
            name: 'enabled',
            friendlyName: 'Enabled',
            type: 'boolean',
            required: false,
            localized: false,
            defaultCollapsed: true,
            helperText: 'Turn the dynamic browser tab on or off.',
          },
          {
            name: 'awayTitle',
            friendlyName: 'Away Title',
            type: 'text',
            required: true,
            localized: true,
            defaultCollapsed: true,
            helperText: 'Tab title that blinks when the user switches away from the tab. Emoji go inline here.',
          },
          {
            name: 'defaultTitle',
            friendlyName: 'Default Title',
            type: 'text',
            required: false,
            localized: true,
            defaultCollapsed: true,
            helperText: 'Optional. Overrides the page title on load.',
          },
        ],
      },
    ],
  };
};
