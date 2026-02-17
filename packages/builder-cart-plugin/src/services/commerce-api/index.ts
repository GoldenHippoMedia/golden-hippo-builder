import { IBrandSettings, IProduct } from './types';
import { HippoUser } from '@services/user-management';

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

  async getProductFeed(): Promise<IProduct[]> {
    const url = this.buildRequestUrl('product/feed');
    console.info(`Getting products for ${url}`);
    const products = await fetch(url, {
      headers: this.headers,
      credentials: 'include',
    });
    if (products.ok) {
      return products.json();
    }
    throw new Error(`Failed to retrieve products for ${this.brandName}. Check your plugin settings!`);
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
