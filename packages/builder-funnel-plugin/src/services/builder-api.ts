import { BuilderContent } from '@builder.io/sdk';
import {
  BuilderFunnelContent,
  BuilderFunnelDestinationContent,
  BuilderFunnelPageContent,
  BuilderProductContent,
} from '@goldenhippo/builder-funnel-schemas';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import { pluginId } from '../constants';

interface FetchContentRequest {
  modelName: string;
  limit: number;
  additionalParamsString?: string;
  bustCache: boolean;
  enrich?: boolean;
}

class BuilderApi {
  private readonly authHeaders: Record<string, string>;
  private readonly apiKey: string;
  private readonly privateApiKey: string;
  private readonly context: ExtendedApplicationContext;

  constructor(context: ExtendedApplicationContext) {
    this.authHeaders = context.user.authHeaders as Record<string, string>;
    this.apiKey = context.user.apiKey;
    this.context = context;

    // Read the private API key from plugin settings (MobX observable map)
    // @ts-expect-error incomplete types — organization is a MobX observable, plugins is a Map
    const pluginSettings = context.user.organization?.value?.settings?.plugins?.get(pluginId);
    this.privateApiKey = (pluginSettings?.get('privateApiKey') as string) ?? '';
  }

  static getPluginSetting(context: ExtendedApplicationContext, key: string): string {
    // @ts-expect-error incomplete types — organization is a MobX observable, plugins is a Map
    const pluginSettings = context.user.organization?.value?.settings?.plugins?.get(pluginId);
    return (pluginSettings?.get(key) as string) ?? '';
  }

  async fetchRemoteProducts(remoteApiKey: string): Promise<BuilderProductContent[]> {
    const products: BuilderProductContent[] = [];
    let offset = 0;
    const limit = 100;
    const baseUrl = `https://cdn.builder.io/api/v3/content/product?apiKey=${remoteApiKey}&enrich=true&omit=data.blocks&limit=${limit}`;

    console.info('[BuilderApi:Funnel] Fetching products from remote Builder space');
    let hasMore = true;
    while (hasMore) {
      const url = offset > 0 ? `${baseUrl}&offset=${offset}` : baseUrl;
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to fetch remote products: ${resp.status} ${resp.statusText}`);
      }
      const json = await resp.json();
      const results: BuilderProductContent[] = Array.isArray(json) ? json : (json?.results ?? []);
      products.push(...results);
      hasMore = results.length >= limit;
      offset += results.length;
    }
    console.info(`[BuilderApi:Funnel] Fetched ${products.length} products from remote space`);
    return products;
  }

  async createContent(
    modelName: string,
    entryName: string,
    data: Record<string, any> = {},
    url?: string,
  ): Promise<BuilderContent> {
    return await this.context.createContent(modelName, {
      name: entryName,
      published: 'draft',
      ...(url ? { query: [{ property: 'urlPath', operator: 'is', value: url }] } : {}),
      data,
    } as Partial<BuilderContent>);
  }

  async updateContent(modelName: string, entryId: string, data: Record<string, any>): Promise<void> {
    const resp = await fetch(`https://builder.io/api/v1/write/${modelName}/${entryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.privateApiKey}`,
      },
      body: JSON.stringify({ data }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Failed to update ${modelName}/${entryId}: ${resp.status} ${body}`);
    }
  }

  async publishContent(modelName: string, entryId: string): Promise<void> {
    const resp = await fetch(`https://builder.io/api/v1/write/${modelName}/${entryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.privateApiKey}`,
      },
      body: JSON.stringify({ published: 'published' }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Failed to publish ${modelName}/${entryId}: ${resp.status} ${body}`);
    }
  }

  async removeContent(content: BuilderContent): Promise<void> {
    await this.context.content.remove(content);
  }

  async getProducts(bustCache?: boolean): Promise<BuilderProductContent[]> {
    return this.fetchContent<BuilderProductContent>({
      modelName: 'product',
      bustCache: !!bustCache,
      limit: 5000,
    });
  }

  async getFunnels(bustCache?: boolean): Promise<BuilderFunnelContent[]> {
    return this.fetchContent<BuilderFunnelContent>({
      modelName: 'funnel',
      bustCache: !!bustCache,
      limit: 1000,
    });
  }

  async getFunnelPages(bustCache?: boolean): Promise<BuilderFunnelPageContent[]> {
    return this.fetchContent<BuilderFunnelPageContent>({
      modelName: 'funnel-page',
      bustCache: !!bustCache,
      limit: 5000,
    });
  }

  async getDestinations(bustCache?: boolean): Promise<BuilderFunnelDestinationContent[]> {
    return this.fetchContent<BuilderFunnelDestinationContent>({
      modelName: 'funnel-destination',
      bustCache: !!bustCache,
      limit: 1000,
    });
  }

  async fetchContent<T extends BuilderContent = BuilderContent>(request: FetchContentRequest): Promise<T[]> {
    const { modelName, limit = 20, additionalParamsString, bustCache = false, enrich = true } = request;
    const content: T[] = [];
    let offset = 0;
    let requestUrl = `https://cdn.builder.io/api/v3/content/${modelName}?locale=en-US&enrich=${enrich}&includeUnpublished=true&apiKey=${this.apiKey}&omit=data.blocks&enrichOptions.model.funnel-page.omit=data.blocks,data.funnel`;
    if (additionalParamsString) {
      requestUrl += `&${additionalParamsString}`;
    }
    if (bustCache) {
      requestUrl += `&cachebust=${bustCache}`;
    }
    console.info(`[BuilderApi:Funnel] MODEL -- ${modelName.toUpperCase()}; LIMIT -- ${limit}`);
    const initialRequest = await fetch(requestUrl + `&limit=${limit > 100 ? 100 : limit}`, {
      headers: this.authHeaders,
    });
    const initialJson = await initialRequest.json();
    const initialResults: T[] = Array.isArray(initialJson) ? initialJson : (initialJson?.results ?? []);
    initialResults.forEach((item) => content.push(item));
    let lastLoopCount = content.length;
    while (content.length < limit && lastLoopCount > 0) {
      offset = content.length;
      const data = await fetch(`${requestUrl}&limit=${limit}&offset=${offset}`, {
        headers: this.authHeaders,
      });
      const responseJson = await data.json();
      const pageResults: T[] = Array.isArray(responseJson) ? responseJson : (responseJson?.results ?? []);
      pageResults.forEach((item) => {
        content.push(item);
      });
      lastLoopCount = pageResults.length;
      console.info(`[BuilderApi:Funnel] POST LOOP -- MODEL -- ${modelName.toUpperCase()}; LIMIT -- ${limit}`, {
        contentCount: content.length,
      });
    }

    return content;
  }
}

export default BuilderApi;
