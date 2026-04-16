import { BuilderContent } from '@builder.io/sdk';
import { BuilderBrandConfigContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import { pluginId } from '../constants';

interface FetchContentRequest {
  modelName: string;
  limit: number;
  bustCache?: boolean;
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

    // @ts-expect-error incomplete types — organization is a MobX observable, plugins is a Map
    const pluginSettings = context.user.organization?.value?.settings?.plugins?.get(pluginId);
    this.privateApiKey = (pluginSettings?.get('privateApiKey') as string) ?? '';
  }

  async getBrandConfig(): Promise<BuilderBrandConfigContent[]> {
    return this.fetchContent<BuilderBrandConfigContent>({
      modelName: 'gh-brand-config',
      limit: 10,
      bustCache: true,
    });
  }

  async createBrandConfig(name: string): Promise<BuilderContent> {
    return this.context.createContent('gh-brand-config', {
      name,
      published: 'draft',
      data: {},
    } as Partial<BuilderContent>);
  }

  async saveBrandConfig(entryId: string, data: Record<string, any>): Promise<void> {
    const resp = await fetch(`https://builder.io/api/v1/write/gh-brand-config/${entryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.privateApiKey}`,
      },
      body: JSON.stringify({ data }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Failed to save brand config: ${resp.status} ${body}`);
    }
  }

  async listAssets(limit = 50): Promise<{ id: string; name: string; url: string; type: string }[]> {
    const query = `{ assets(query: { type: { $in: ["image/jpeg","image/png","image/webp","image/svg+xml","image/gif"] } }, limit: ${limit}) { id name url type } }`;
    const resp = await fetch('https://cdn.builder.io/api/v2/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.privateApiKey}`,
      },
      body: JSON.stringify({ query }),
    });
    if (!resp.ok) {
      throw new Error(`Failed to fetch assets: ${resp.status}`);
    }
    const json = await resp.json();
    return json?.data?.assets ?? [];
  }

  async getModelEntries(modelName: string): Promise<BuilderContent[]> {
    return this.fetchContent({ modelName, limit: 100 });
  }

  private async fetchContent<T extends BuilderContent = BuilderContent>(request: FetchContentRequest): Promise<T[]> {
    const { modelName, limit = 20, bustCache = false } = request;
    const content: T[] = [];
    let offset = 0;
    let baseUrl = `https://cdn.builder.io/api/v3/content/${modelName}?apiKey=${this.apiKey}&includeUnpublished=true&omit=data.blocks&limit=${Math.min(limit, 100)}&locale=en-US`;
    if (bustCache) {
      baseUrl += `&cachebust=true`;
    }

    console.info(`[Hippo Commerce] Fetching ${modelName}`);
    const initialResp = await fetch(baseUrl, { headers: this.authHeaders });
    const initialJson = await initialResp.json();
    const initialResults: T[] = Array.isArray(initialJson) ? initialJson : (initialJson?.results ?? []);
    content.push(...initialResults);

    let lastCount = initialResults.length;
    while (content.length < limit && lastCount > 0) {
      offset = content.length;
      const resp = await fetch(`${baseUrl}&offset=${offset}`, { headers: this.authHeaders });
      const json = await resp.json();
      const results: T[] = Array.isArray(json) ? json : (json?.results ?? []);
      content.push(...results);
      lastCount = results.length;
    }

    console.info(`[Hippo Commerce] Fetched ${content.length} ${modelName} entries`);
    return content;
  }
}

export default BuilderApi;
