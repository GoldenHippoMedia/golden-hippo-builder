import { HippoFunnel, HippoDestination } from './types';
import { HippoUser } from '../user-management';

class HippoApi {
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;

  constructor(user: HippoUser) {
    this.apiUrl = user.hippoApi.url;
    this.apiUser = user.hippoApi.user;
    this.apiPassword = user.hippoApi.password;
  }

  async getFunnelById(id: string, brandName: string): Promise<HippoFunnel> {
    const url = this.buildRequestUrl(`funnel/${id}`);
    const funnel = await fetch(url, {
      headers: this.headersWithBrand(brandName),
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
    throw new Error(`Failed to retrieve funnel - ID: ${id}. Check your plugin settings!`);
  }

  async getFunnelByGEP(gep: string, brandName: string): Promise<HippoFunnel> {
    const url = this.buildRequestUrl(`funnel/gep/${gep}`);
    const funnel = await fetch(url, {
      headers: this.headersWithBrand(brandName),
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
    throw new Error(`Failed to retrieve funnel for - GEP: ${gep}. Check your plugin settings!`);
  }

  async getDestinationById(id: string, brandName: string): Promise<HippoDestination> {
    const url = this.buildRequestUrl(`destination/${id}`);
    const destination = await fetch(url, {
      headers: this.headersWithBrand(brandName),
      credentials: 'include',
    });
    if (destination.ok) {
      return destination.json();
    }
    throw new Error(`Failed to retrieve destination - ID: ${id}. Check your plugin settings!`);
  }

  async getDestinationByGEP(gep: string, brandName: string): Promise<HippoDestination> {
    const url = this.buildRequestUrl(`destination/gep/${gep}`);
    const destination = await fetch(url, {
      headers: this.headersWithBrand(brandName),
      credentials: 'include',
    });
    if (destination.ok) {
      return destination.json();
    }
    throw new Error(`Failed to retrieve destination - GEP: ${gep}. Check your plugin settings!`);
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

export default HippoApi;
