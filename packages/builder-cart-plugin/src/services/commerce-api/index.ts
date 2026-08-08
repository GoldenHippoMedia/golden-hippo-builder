import { HippoUser } from '../user-management';
import { CommerceOffer } from './types';
import { MOCK_OFFERS, findMockOffer } from './mock-offers';

/** Serve mock offers until the commerce offers endpoint exists. */
const USE_MOCK_OFFERS = true;

class CommerceApi {
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;

  constructor(user: HippoUser) {
    this.apiUrl = user.hippoApi.url;
    this.apiUser = user.hippoApi.user;
    this.apiPassword = user.hippoApi.password;
  }

  async getOffers(brandName: string): Promise<CommerceOffer[]> {
    if (USE_MOCK_OFFERS) {
      return Promise.resolve(MOCK_OFFERS);
    }

    const url = this.buildRequestUrl('offers');
    const res = await fetch(url, {
      headers: this.headersWithBrand(brandName),
      credentials: 'include',
    });
    if (res.ok) {
      return res.json();
    }
    const body = await res.text();
    console.error('[Hippo Commerce] Offers Error', {
      res: body,
      status: res.status,
      statusText: res.statusText,
    });
    throw new Error('Failed to retrieve offers. Check your plugin settings!');
  }

  async getOfferById(id: string, brandName: string): Promise<CommerceOffer | undefined> {
    if (USE_MOCK_OFFERS) {
      return Promise.resolve(findMockOffer(id));
    }

    const url = this.buildRequestUrl(`offers/${id}`);
    const res = await fetch(url, {
      headers: this.headersWithBrand(brandName),
      credentials: 'include',
    });
    if (res.ok) {
      return res.json();
    }
    if (res.status === 404) {
      return undefined;
    }
    const body = await res.text();
    console.error('[Hippo Commerce] Offer Error', {
      res: body,
      status: res.status,
      statusText: res.statusText,
    });
    throw new Error(`Failed to retrieve offer - ID: ${id}. Check your plugin settings!`);
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
export { MOCK_OFFERS, findMockOffer } from './mock-offers';
