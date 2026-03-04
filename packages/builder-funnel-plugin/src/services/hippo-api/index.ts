import { HippoFunnel, HippoDestination } from './types';
import { HippoUser } from '../user-management';

class HippoApi {
  private readonly brandName: string;
  private readonly headers: Headers;
  private readonly apiUrl: string;

  constructor(user: HippoUser) {
    this.brandName = user.brand;
    this.apiUrl = user.hippoApi.url;
    this.headers = this.buildHeaders(user.hippoApi.user, user.hippoApi.password);
  }

  async getFunnelById(id: string): Promise<HippoFunnel> {
    const url = this.buildRequestUrl(`funnel/${id}`);
    const funnel = await fetch(url, {
      headers: this.headers,
      credentials: 'include',
    });
    if (funnel.ok) {
      return funnel.json();
    }
    const res = await funnel.text();
    console.error('[Hippo Commerce] Funnel Error', {
      res: res,
      status: funnel.status,
      statusText: funnel.statusText,
    });
    throw new Error(`Failed to retrieve funnel for ${this.brandName} - ID: ${id}. Check your plugin settings!`);
  }

  async getFunnelByGEP(gep: string): Promise<HippoFunnel> {
    const url = this.buildRequestUrl(`funnel/gep/${gep}`);
    const funnel = await fetch(url, {
      headers: this.headers,
      credentials: 'include',
    });
    if (funnel.ok) {
      return funnel.json();
    }
    const res = await funnel.text();
    console.error('[Hippo Commerce] Funnel Error', {
      res: res,
      status: funnel.status,
      statusText: funnel.statusText,
    });
    throw new Error(`Failed to retrieve funnel for ${this.brandName} - GEP: ${gep}. Check your plugin settings!`);
  }

  async getDestinationById(id: string): Promise<HippoDestination> {
    const url = this.buildRequestUrl(`destination/${id}`);
    const destination = await fetch(url, {
      headers: this.headers,
      credentials: 'include',
    });
    if (destination.ok) {
      return destination.json();
    }
    throw new Error(`Failed to retrieve destination for ${this.brandName} - ID: ${id}. Check your plugin settings!`);
  }

  async getDestinationByGEP(gep: string): Promise<HippoDestination> {
    const url = this.buildRequestUrl(`destination/gep/${gep}`);
    const destination = await fetch(url, {
      headers: this.headers,
      credentials: 'include',
    });
    if (destination.ok) {
      return destination.json();
    }
    throw new Error(`Failed to retrieve destination for ${this.brandName} - GEP: ${gep}. Check your plugin settings!`);
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

export default HippoApi;
