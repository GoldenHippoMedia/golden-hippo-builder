import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

interface PageModelInputProps {
  productModelId: string;
  productGroupModelId: string;
  categoryModelId: string;
  bannerModelId: string;
  blogCategoryModelId: string;
  editUrl: string;
}

enum PageTypes {
  GENERAL = 'General',
  PRODUCT = 'Product',
  BLOG = 'Blog',
}

enum PdpTypes {
  PRODUCT = 'Product',
  PRODUCT_GROUP = 'Product Group',
}

enum OfferSelectorTypes {
  VERTICAL = 'Vertical',
  VERTICAL__FLAVOR_DROPDOWN__TYPE_TOGGLE = 'Vertical - Flavor Dropdown - Type Toggle',
  STACKED__FLAVOR_BUTTONS__QUANTITY_TOGGLE = 'Stacked - Flavor Buttons - Quantity Toggle',
}

enum OfferSelectorSliderTypes {
  SLIDER_A = 'Slider A',
  SLIDER_B = 'Slider B',
}

enum OfferSelectorDefaultPurchaseType {
  ONE_TIME = 'One-Time Purchase',
  SUBSCRIPTION = 'Subscription',
}

enum OfferSelectorSavingsType {
  PERCENT = 'percentage',
  DOLLAR = 'dollar',
}

export const createPageModel = (props: PageModelInputProps): ModelShape => {
  const { productModelId, productGroupModelId, categoryModelId, bannerModelId, blogCategoryModelId, editUrl } = props;
  return {
    name: 'page',
    displayName: 'Page',
    kind: 'page',
    helperText: 'Default model for creating pages',
    contentTitleField: undefined,
    fields: [
      {
        name: 'title',
        friendlyName: 'Title',
        type: 'text',
        required: true,
        helperText:
          'A short title for this page. If the SEO Page Title is not provided, this field is used for SEO. This field is not localized, so it is highly suggested to use the Heading.',
        defaultCollapsed: false,
      },
      {
        name: 'pageType',
        friendlyName: 'Page Type',
        type: 'select',
        defaultValue: PageTypes.GENERAL,
        required: true,
        helperText: 'Select the type of page. This will determine which components are added automatically.',
        enum: [PageTypes.GENERAL, PageTypes.BLOG, PageTypes.PRODUCT],
        defaultCollapsed: false,
      },
      {
        name: 'pdp',
        friendlyName: 'Product Detail Page',
        type: 'object',
        required: false,
        subFields: [
          {
            name: 'type',
            friendlyName: 'Type',
            type: 'select',
            defaultValue: PdpTypes.PRODUCT,
            required: true,
            helperText: '',
            enum: [PdpTypes.PRODUCT, PdpTypes.PRODUCT_GROUP],
            defaultCollapsed: false,
          },
          {
            name: 'product',
            friendlyName: 'Product',
            type: 'reference',
            required: false,
            helperText: 'Select the product to display',
            modelId: productModelId,
            copyOnAdd: true,
            showIf: "return options.get('type') === 'Product'",
            defaultCollapsed: false,
          },
          {
            name: 'productGroup',
            friendlyName: 'Product Group',
            type: 'reference',
            required: false,
            helperText: '',
            modelId: productGroupModelId,
            copyOnAdd: true,
            showIf: "return options.get('type') === 'Product Group'",
            defaultCollapsed: false,
          },
          {
            name: 'slides',
            friendlyName: 'Product Slides',
            type: 'list',
            required: false,
            subFields: [
              {
                name: 'image',
                friendlyName: 'Image',
                type: 'file',
                required: true,
                helperText: '',
                allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
                copyOnAdd: true,
                defaultCollapsed: false,
              },
            ],
            helperText:
              "Select the image slides to display for this product. If no slides are provided, the product's default image will be used.",
            copyOnAdd: true,
            defaultCollapsed: false,
          },
          {
            name: 'slideThumbs',
            friendlyName: 'Product Slides Thumbnails',
            type: 'list',
            required: false,
            subFields: [
              {
                name: 'image',
                friendlyName: 'Image',
                type: 'file',
                required: true,
                helperText: '',
                allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
                copyOnAdd: true,
                defaultCollapsed: false,
              },
            ],
            helperText:
              'Select the image thumbnails slides to display for this product. If no slides are provided, the Product Slides will be used',
            copyOnAdd: true,
            defaultCollapsed: false,
          },
          {
            name: 'sliderComponent',
            type: 'select',
            enum: [OfferSelectorSliderTypes.SLIDER_A, OfferSelectorSliderTypes.SLIDER_B],
            friendlyName: 'Slider Component',
            defaultValue: OfferSelectorSliderTypes.SLIDER_A,
            required: false,
            helperText: 'Select the style slider component to use for the product images',
            defaultCollapsed: false,
          },
          {
            '@type': '@builder.io/core:Field',
            name: 'hideNativeOfferSelector',
            friendlyName: 'Hide Native Offer Selector',
            helperText: 'Set to true to fully hide the native Offer Selector to provide your own (e.g. via VWO)',
            type: 'boolean',
            localized: false,
            defaultCollapsed: true,
            advanced: true,
          },
          {
            name: 'offerSelector',
            friendlyName: 'Offer Selector',
            type: 'object',
            required: false,
            subFields: [
              {
                name: 'osType',
                friendlyName: 'Type',
                type: 'select',
                defaultValue: OfferSelectorTypes.VERTICAL__FLAVOR_DROPDOWN__TYPE_TOGGLE,
                required: false,
                helperText: 'Select the type of offer selector to display',
                enum: [
                  OfferSelectorTypes.VERTICAL,
                  OfferSelectorTypes.VERTICAL__FLAVOR_DROPDOWN__TYPE_TOGGLE,
                  OfferSelectorTypes.STACKED__FLAVOR_BUTTONS__QUANTITY_TOGGLE,
                ],
                defaultCollapsed: false,
              },
              {
                name: 'features',
                friendlyName: 'Features',
                type: 'object',
                required: false,
                subFields: [
                  {
                    name: 'defaultPurchaseType',
                    friendlyName: 'Default Purchase Type',
                    type: 'select',
                    defaultValue: OfferSelectorDefaultPurchaseType.ONE_TIME,
                    required: false,
                    helperText:
                      'When both purchase options are available to the customer, this is the option that will be selected by default.',
                    enum: [OfferSelectorDefaultPurchaseType.ONE_TIME, OfferSelectorDefaultPurchaseType.SUBSCRIPTION],
                    defaultCollapsed: false,
                  },
                  {
                    name: 'preferredQuantity',
                    friendlyName: 'Initial Offer Quantity',
                    type: 'number',
                    defaultValue: 3,
                    required: false,
                    helperText: `Enter the quantity you would prefer users see first. If that quantity is not available,
                    we will locate the closest quantity available (defaults to 3 if not set).`,
                    defaultCollapsed: false,
                  },
                  {
                    name: 'showSavings',
                    friendlyName: 'Show Savings?',
                    type: 'boolean',
                    defaultValue: {
                      Default: true,
                    },
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'savingsType',
                    friendlyName: 'Savings Type',
                    type: 'select',
                    defaultValue: OfferSelectorSavingsType.PERCENT,
                    required: false,
                    helperText: 'When showing savings, display as a percentage or value saved.',
                    enum: [OfferSelectorSavingsType.PERCENT, OfferSelectorSavingsType.DOLLAR],
                    defaultCollapsed: false,
                  },
                  {
                    name: 'showMemberPriceMessage',
                    friendlyName: 'Show Member Price Message',
                    type: 'boolean',
                    defaultValue: {
                      Default: true,
                    },
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'showSubscriptionPriceMessage',
                    friendlyName: 'Show Subscription Price Message',
                    type: 'boolean',
                    defaultValue: {
                      Default: true,
                    },
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'scrollToTopOffset',
                    friendlyName: 'Scroll to Top Offset (px)',
                    type: 'number',
                    defaultValue: 170,
                    required: false,
                    helperText:
                      'The number of pixels to offset the Scroll to Top button. Note: The label for this button may be set in the "Labels" section.',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'enableAnonymousSubscriptions',
                    friendlyName: 'Always Show Subscriptions',
                    type: 'boolean',
                    defaultValue: {},
                    required: false,
                    helperText:
                      'Enable this to present subscriptions (when available) to non-MyAccount visitors. By default, a user must be logged in to access this option.',
                    defaultCollapsed: false,
                    hidden: false,
                    advanced: true,
                  },
                ],
                helperText: '',
                defaultCollapsed: false,
              },
              {
                name: 'labels',
                friendlyName: 'Labels',
                type: 'object',
                defaultValue: {
                  subscriptionOffer: {
                    Default: 'Or $PRICE when you subscribe & save',
                  },
                  subscriptionToggle: {
                    Default: 'Subscribe & save',
                  },
                  scrollButton: {
                    Default: '<span class="material-icons">keyboard_arrow_up</span> Back to top',
                  },
                  actionButton: {
                    Default: 'ADD TO CART',
                  },
                  outOfStockFormSuccess: {
                    Default: '<p class="text-center">We will notify you as soon as this item is back in stock.</p>',
                  },
                  otpToggle: {
                    Default: 'Single purchase',
                  },
                  flavorSelector: {
                    Default: 'Choose a flavor',
                  },
                  outOfStock: {
                    Default: 'Sorry, we"re currently out of stock',
                  },
                  memberOffer: {
                    Default: 'Or pay member price of',
                  },
                },
                required: false,
                subFields: [
                  {
                    name: 'actionButton',
                    friendlyName: 'Action Button',
                    type: 'text',
                    defaultValue: {
                      Default: 'ADD TO CART',
                    },
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'subscriptionOffer',
                    friendlyName: 'Subscription Offer',
                    type: 'text',
                    defaultValue: {
                      Default: 'Or $PRICE when you subscribe & save',
                    },
                    required: false,
                    helperText: 'Use $PRICE to represent the price, this will be automatically replaced.',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'memberOffer',
                    friendlyName: 'Member Offer',
                    type: 'text',
                    defaultValue: {
                      Default: 'Or pay member price of',
                    },
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'subscriptionToggle',
                    friendlyName: 'Subscription Toggle',
                    type: 'text',
                    defaultValue: {
                      Default: 'Subscribe & save',
                    },
                    required: false,
                    helperText: 'The label for the button when selecting a subscription',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'otpToggle',
                    friendlyName: 'One-Time Purchase Toggle',
                    type: 'text',
                    defaultValue: {
                      Default: 'Single purchase',
                    },
                    required: false,
                    helperText: 'The label for the button when selecting a single purchase (otp).',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'outOfStock',
                    friendlyName: 'Out of Stock',
                    type: 'text',
                    defaultValue: {
                      Default: 'Sorry, we"re currently out of stock',
                    },
                    required: false,
                    helperText: 'The text to display when this product is marked as Out of Stock.',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'outOfStockFormSuccess',
                    friendlyName: 'OOS Form Success Message',
                    type: 'html',
                    defaultValue: {
                      Default: '<p class="text-center">We will notify you as soon as this item is back in stock.</p>',
                    },
                    required: false,
                    helperText:
                      'The message displayed when a user requests to be notified when this product is back in stock.',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'scrollButton',
                    friendlyName: 'Scroll Button Content',
                    type: 'html',
                    defaultValue: {
                      Default: '<span class="material-icons">keyboard_arrow_up</span> Back to top',
                    },
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'flavorSelector',
                    friendlyName: 'Flavor / Option Selector',
                    type: 'text',
                    defaultValue: {
                      Default: 'Choose a flavor',
                    },
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                ],
                helperText: 'Customize the various labels on the offer selector',
                defaultCollapsed: false,
              },
              {
                name: 'bestSellerImage',
                friendlyName: 'Best Seller Image',
                type: 'file',
                allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
                defaultValue:
                  'https://cdn.builder.io/api/v1/image/assets%2Fcf992cf7343c4ca182a884e9a45f394e%2F3805efcc18184db8bccf74d5c5aaf891?format=webp',
                required: false,
                helperText: 'The small image to display alongside the best seller offer',
                defaultCollapsed: true,
              },
              {
                name: 'bestValueImage',
                friendlyName: 'Best Value Image',
                type: 'file',
                defaultValue:
                  'https://cdn.builder.io/api/v1/image/assets%2Fcf992cf7343c4ca182a884e9a45f394e%2F82105508987e4459bc4405617d4bee33',
                required: false,
                helperText: 'The small image to display alongside the best value offer (highest quantity)',
                allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
                defaultCollapsed: true,
              },
              {
                name: 'cssOverrides',
                friendlyName: 'CSS Properties',
                type: 'object',
                defaultValue: {},
                required: false,
                subFields: [
                  {
                    name: 'signupOfferCustomCssProps',
                    friendlyName: 'Signup Offer CSS',
                    type: 'map',
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                  {
                    name: 'signupOfferPriceCustomCssProps',
                    friendlyName: 'Signup Offer Price CSS',
                    type: 'map',
                    required: false,
                    helperText: '',
                    defaultCollapsed: false,
                  },
                ],
                helperText: '',
                defaultCollapsed: true,
              },
            ],
            helperText: 'Configure the offer selector to display.',
            defaultCollapsed: true,
            showIf: "return !(options.get('hideNativeOfferSelector'))",
          },
          {
            name: 'category',
            type: 'reference',
            required: false,
            helperText: 'Provide the category to display breadcrumb navigation',
            modelId: categoryModelId,
            copyOnAdd: true,
            friendlyName: 'Category',
            defaultCollapsed: false,
          },
        ],
        helperText: 'Configure the PDP options',
        showIf: "return options.get('pageType') === 'Product'",
        defaultCollapsed: false,
      },
      {
        name: 'blog',
        friendlyName: 'Blog Configuration',
        type: 'object',
        required: false,
        subFields: [
          {
            name: 'title',
            friendlyName: 'Blog Title',
            helperText:
              'Provide a title for this blog when shown on a grid or list. If not provided, the page' +
              ' title will be used.',
            type: 'text',
            required: false,
            localized: true,
            defaultCollapsed: false,
          },
          {
            name: 'publicationDate',
            friendlyName: 'Publication Date',
            type: 'timestamp',
            helperText: 'Provide the publication date, this is used for sorting.',
            required: true,
            localized: false,
            defaultCollapsed: false,
          },
          {
            name: 'snippet',
            friendlyName: 'Blog Snippet',
            helperText:
              'Provide a snippet of the blog to display when shown on a grid or list. If not provided,' +
              ' we will attempt to use the page description or SEO description (if available)',
            type: 'longText',
            required: false,
            localized: true,
            defaultCollapsed: false,
          },
          {
            name: 'author',
            friendlyName: 'Blog Author',
            type: 'text',
            helperText: 'Provide an author for this blog to display when shown on a grid or list.',
            required: false,
            localized: false,
            defaultCollapsed: false,
          },
          {
            name: 'thumbnail',
            friendlyName: 'Blog Thumbnail',
            type: 'file',
            required: false,
            helperText:
              'Provide an image to display when shown on a grid or list. If not provided, we will' +
              ' attempt to use the SEO image (if available)',
            allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
            copyOnAdd: true,
            defaultCollapsed: false,
          },
          {
            name: 'categories',
            friendlyName: 'Blog Categories',
            type: 'list',
            required: false,
            copyOnAdd: true,
            defaultCollapsed: true,
            subFields: [
              {
                name: 'category',
                friendlyName: 'Blog Category',
                type: 'reference',
                modelId: blogCategoryModelId,
                required: true,
                defaultCollapsed: false,
                copyOnAdd: false,
              },
            ],
          },
        ],
        helperText: 'Configure the blog options',
        showIf: "return options.get('pageType') === 'Blog'",
        defaultCollapsed: true,
      },
      {
        name: 'heading',
        friendlyName: 'SEO Page Title',
        type: 'text',
        required: false,
        helperText: 'Provide an alternate page title to use for SEO purposes (if blank, the page title is used)',
        defaultCollapsed: false,
      },
      {
        name: 'description',
        friendlyName: 'SEO Description',
        type: 'longText',
        required: false,
        helperText: 'Set the page description for SEO here. This is automatically embedded in your page.',
        defaultCollapsed: true,
      },
      {
        name: 'seoImage',
        friendlyName: 'SEO Image',
        type: 'file',
        required: false,
        helperText: 'Provide an image to be used for SEO purposes',
        allowedFileTypes: ['jpeg', 'png', 'svg', 'webp'],
        copyOnAdd: true,
        defaultCollapsed: false,
      },
      {
        name: 'search',
        friendlyName: 'Search Configuration',
        type: 'object',
        required: false,
        subFields: [
          {
            name: 'title',
            friendlyName: 'Search Title',
            type: 'text',
            required: false,
            helperText:
              "Used when showing this page in your site's search function. If no value is provided, the page title will be used.",
            defaultCollapsed: false,
          },
          {
            name: 'description',
            friendlyName: 'Search Description',
            type: 'text',
            required: false,
            helperText:
              '(Optional) Provide a description to be used when showing this page in search results. If no value is provided, the SEO description is used.',
            defaultCollapsed: false,
          },
          {
            name: 'hide',
            friendlyName: 'Hide from Search',
            type: 'boolean',
            required: false,
            helperText: 'Use this to hide this page from search results. This does not prevent navigation to the page.',
            defaultCollapsed: false,
          },
          {
            name: 'content',
            friendlyName: 'Content',
            type: 'longText',
            required: false,
            helperText:
              '(Optional) Use this field to add keywords or phrases to assist in search results (e.g. related products, categories, key words, etc.)',
            defaultCollapsed: false,
          },
        ],
        helperText:
          "Configure how this page displays in your site's built-in search results. Pages will not show in search results if neither the SEO or Search information is configured. You may also elect to hide the page from search results.",
        defaultCollapsed: true,
      },
      {
        '@type': '@builder.io/core:Field',
        name: 'banners',
        friendlyName: 'Banners',
        helperText: `Select the banner(s) to display on this page. These will be displayed in the
          order provided, but always below site-wide banners.`,
        type: 'list',
        defaultCollapsed: true,
        localized: false,
        subFields: [
          {
            '@type': '@builder.io/core:Field',
            name: 'banner',
            friendlyName: 'Sitewide Banner',
            type: 'reference',
            localized: false,
            helperText: 'Select the banner to display.',
            defaultCollapsed: true,
            modelId: bannerModelId,
            copyOnAdd: false,
          },
        ],
      },
      {
        name: 'disableStickyHeader',
        friendlyName: 'Disable Sticky Header',
        helperText: 'Disable the sticky header for this page only.',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
        advanced: true,
      },
      {
        name: 'showBundleDrawer',
        friendlyName: 'Show Bundle Drawer',
        helperText: 'Enable the bundle drawer for this page.',
        type: 'boolean',
        localized: false,
        defaultCollapsed: true,
        advanced: true,
      },
      {
        name: 'robotsMeta',
        friendlyName: 'Robots Meta',
        type: 'object',
        required: false,
        helperText: 'Settings for the robots meta tag.',
        subFields: [
          {
            name: 'noIndex',
            friendlyName: 'No Index',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Prevents pages from being indexed and displayed in search engine result pages',
          },
          {
            name: 'noFollow',
            friendlyName: 'No Follow',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Prevents search engines from following links on the pages',
          },
          {
            name: 'noArchive',
            friendlyName: 'No Archive',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Prevents search engines from showing Cached links for pages',
          },
          {
            name: 'noImageIndex',
            friendlyName: 'No Image Index',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'This option prevents images on a page from being indexed by Google and other search engines',
          },
          {
            name: 'noSnippet',
            friendlyName: 'No Snippet',
            type: 'boolean',
            required: false,
            defaultCollapsed: true,
            helperText: 'Prevents a snippet from being shown in the search results',
          },
        ],
        defaultCollapsed: true,
      },
    ],
    editingUrlLogic: 'return `' + editUrl + '${targeting.urlPath}?builder.preview=true&builder.frameEditing=true`',
  };
};

type BasePageData = {
  title: string;
  pageType: 'Product' | 'Blog' | 'General';
  heading?: string;
  description?: string;
  seoImage?: string;
  search?: {
    title?: string;
    description?: string;
    hide?: boolean;
    content?: string;
  };
  banners?: {
    banner: string;
  }[];
  disableStickyHeader?: boolean;
  showBundleDrawer?: boolean;
  robotsMeta?: {
    noIndex?: boolean;
    noFollow?: boolean;
    noArchive?: boolean;
    noImageIndex?: boolean;
    noSnippet?: boolean;
  };
};

export type BuilderPdpPageContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData &
      BasePageData & {
        type: PdpTypes.PRODUCT;
        pdp?: {
          type: PdpTypes;
          product?: {
            id: string;
            name: string;
          };
          productGroup?: {
            id: string;
            name: string;
          };
          slides?: {
            image: string;
          }[];
          slideThumbs?: {
            image: string;
          }[];
          sliderComponent?: OfferSelectorSliderTypes;
          hideNativeOfferSelector?: boolean;
          offerSelector: {
            osType: OfferSelectorTypes;
            features: {
              defaultPurchaseType?: OfferSelectorDefaultPurchaseType;
              preferredQuantity?: number;
              showSavings?: boolean;
              savingsType?: OfferSelectorSavingsType;
              showMemberPriceMessage?: boolean;
              showSubscriptionPriceMessage?: boolean;
              scrollToTopOffset?: number;
              enableAnonymousSubscriptions?: boolean;
            };
            labels: {
              actionButton?: string;
              subscriptionOffer?: string;
              memberOffer?: string;
              subscriptionToggle?: string;
              otpToggle?: string;
              outOfStock?: string;
              outOfStockFormSuccess?: string;
              scrollButton?: string;
              flavorSelector?: string;
            };
            bestSellerImage?: string;
            bestValueImage?: string;
            cssOverrides?: {
              signupOfferCustomCssProps?: Record<string, string>;
              signupOfferPriceCustomCssProps?: Record<string, string>;
            };
          };
          category?: {
            id: string;
            name: string;
          };
        };
      };
  }>;

export type BuilderBlogPageContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData &
      BasePageData & {
        type: PageTypes.BLOG;
        blog?: {
          title?: string;
          publicationDate?: string;
          snippet?: string;
          author?: string;
          thumbnail?: string;
          categories?: {
            category: {
              id: string;
              name: string;
            };
          }[];
        };
      };
  }>;

export type BuilderGeneralPageContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData &
      BasePageData & {
        type: PageTypes.GENERAL | undefined;
      };
  }>;

export type BuilderPageContent = BuilderPdpPageContent | BuilderBlogPageContent | BuilderGeneralPageContent;
