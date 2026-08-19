import { HippoUser } from '../user-management';
import { CommerceOffer } from './types';

class CommerceApi {
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;

  constructor(user: HippoUser) {
    this.apiUrl = user.hippoApi.url;
    this.apiUser = user.hippoApi.user;
    this.apiPassword = user.hippoApi.password;
  }

  //Only for use in the builder UI, there is no tax information included.
  async getOffers(brandName: string): Promise<CommerceOffer[]> {
    const url = this.buildRequestUrl('offer');
    const res = await fetch(url, {
      headers: this.headersWithBrand(brandName),
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[Hippo Commerce] Offers Error', {
        res: body,
        status: res.status,
        statusText: res.statusText,
      });
      throw new Error('Failed to retrieve offers. Check your plugin settings!');
    }
    const offers = await res.json();
    if (!Array.isArray(offers)) {
      console.error('[Hippo Commerce] Offers Error', { res: offers, expected: 'array' });
      throw new Error('Unexpected response from the offers endpoint. Check your plugin settings!');
    }
    return offers as CommerceOffer[];
  }

  private headersWithBrand(brandName: string): Headers {
    const credentials = btoa(`${this.apiUser}:${this.apiPassword}`);
    return new Headers({
      Authorization: `Basic ${credentials}`,
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
      'X-Brand': brandName,
    });
  }

  private buildRequestUrl = (path: string) => {
    return `${this.apiUrl}/${path}`;
  };
}

export default CommerceApi;
export type { CommerceOffer, CommerceOfferProduct } from './types';
