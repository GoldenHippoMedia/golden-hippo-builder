export interface IBrandSettings {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    phone: string | null;
  };
  support: {
    returnsAddress: string | null;
    phone: string | null;
    email: string | null;
    website: string;
    moneyBackGuarantee: number;
  };
  sites: {
    funnel: string;
    affiliate: string | null;
    cart: string;
  };
  logo: string | null;
  loyalty: {
    active: boolean;
    pointsPerDollar: number;
    pointValue: number;
    pointsExpiration: number;
    pendingWindow: number;
    signUp: {
      points: number;
      lookBackWindow: number;
    };
    birthday: {
      initialPoints: number;
      annualPoints: number;
    };
  };
  shipping: {
    exclusionRule: string;
    threshold: number;
    cost: {
      domestic: {
        oneTime: number;
        subscription: number;
        myAccountOneTime: number;
        myAccountSubscription: number;
      };
      international: {
        oneTime: number;
        subscription: number;
        myAccountOneTime: number;
        myAccountSubscription: number;
      };
    };
  };
  availableCountries: Array<{
    name: string;
    code: string;
    currencyCode: string;
    defaultConversionRate: number;
    regions: Array<{
      name: string;
      code: string;
    }>;
  }>;
  availableLocales: Array<{
    name: string;
    code: string;
    currencyCode: string;
    availableLanguages: string[];
    defaultLanguage: string;
  }>;
  pet: {
    dogBreeds: Array<{ value: string; label: string }>;
    catBreeds: Array<{ value: string; label: string }>;
    healthConditions: Array<{ label: string; value: string }>;
  };
  search: any | null;
  subscriptionFrequencies: string[];
  sampleConfigurations: any[];
  bundleTiers: Array<{
    itemCount: number;
    discountPercent: number;
    uniqueProducts: boolean;
    subscriptionOnly: boolean;
    loggedInOnly: boolean;
  }>;
}

export interface IProduct {
  name: string;
  id: string;
  countryCode: string;
  currencyCode: string;
  brand: string;
  retailPrice: number;
  localeRetailPrice: number;
  taxCode: string;
  description: string | null;
  packaging: IPackaging;
  group: IGroup;
  image: string | null;
  outOfStock: boolean;
  outOfStockEmailList: string | null;
  restockEta: string | null;
  trialFamilyId: string | null;
  category: string | null;
  ingredients: string[];
  concerns: string[];
  upc: string | null;
  restrictedCountries: IRestrictedCountry[];
  products: IProductPricing;
  slug: string;
  reviewId: string | null;
  cms: {
    displayName: string;
    description: string;
    subHeading: string | null;
    featuredImage: string | null;
    reviews: {
      count: number;
      average: number;
    };
    quote: string | null;
    categories: {
      id: string;
      name: string;
      slug?: string;
    }[];
    useCases: {
      id: string;
      name: string;
    }[];
    tags: {
      id: string;
      name: string;
      color?: string;
    }[];
    ingredients: {
      id: string;
      name: string;
    }[];
    hidden: boolean;
    cartOutOfStock: boolean;
    group: {
      id: string;
      displayName: string;
      description: string;
      subHeading: string | null;
      featuredImage: string | null;
      sortOrder: number;
    } | null;
    slug: string;
  } | null;
}

export interface IPackaging {
  singular: string;
  plural: string;
}

export interface IGroup {
  id: string | null;
  name: string | null;
}

export interface IRestrictedCountry {
  name: string;
  code: string;
}

export interface IProductPricing {
  subscription: ISubscriptionPricing;
  oneTime: IOneTimePricing;
}

export interface ISubscriptionPricing {
  standard: IProductVariant[];
  myAccount: IProductVariant[];
  sample: IProductVariant[];
}

export interface IOneTimePricing {
  standard: IProductVariant[];
  myAccount: IProductVariant[];
  sample: IProductVariant[];
}

export type IStandardPriceLevel = 'MyAccount' | 'Standard';
type IAlternatePriceLevel = IStandardPriceLevel | 'Sample';

export type IPurchaseType = 'One-Time' | 'Subscription';

export interface IProductVariant {
  name: string;
  productId: string;
  variantId: string;
  sku: string;
  price: number;
  localePrice: number;
  quantity: number;
  packageType: string;
  alternatePriceLevelPrice: number | null;
  alternatePriceLevelLocalePrice: number | null;
  alternatePurchaseTypePrice: number | null;
  alternatePurchaseTypeLocalePrice: number | null;
  purchaseType: IPurchaseType;
  priceLevel: IAlternatePriceLevel;
  savings: number | null;
  localeSavings: number | null;
}
