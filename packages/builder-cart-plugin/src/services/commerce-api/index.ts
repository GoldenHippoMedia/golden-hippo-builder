import { HippoUser } from '@services/user-management';

interface IBrandSettings {
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

class CommerceApi {
  private readonly brandName: string;
  private readonly headers: Headers;
  private readonly apiUrl: string;

  constructor(user: HippoUser) {
    this.brandName = user.brand;
    this.apiUrl = user.hippoApi.url;
    this.headers = this.buildHeaders(user.hippoApi.user, user.hippoApi.password);
  }

  async getBrandSettings(): Promise<IBrandSettings> {
    const url = this.buildRequestUrl('config');
    const setting = await fetch(url, {
      headers: this.headers,
      credentials: 'include',
    });
    if (setting.ok) {
      return setting.json();
    }
    const res = await setting.text();
    console.error('[Hippo Commerce] Setting Error', {
      res: res,
      status: setting.status,
      statusText: setting.statusText,
    });
    throw new Error(`Failed to retrieve brand settings for ${this.brandName}. Check your plugin settings!`);
  }

  private buildHeaders(user: string, password: string): Headers {
    const credentials = btoa(`${user}:${password}`);
    return new Headers({
      'X-Brand': this.brandName,
      Authorization: `Basic ${credentials}`,
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
    });
  }

  private buildRequestUrl = (path: string) => {
    return `${this.apiUrl}/${path}`;
  };
}

export default CommerceApi;
