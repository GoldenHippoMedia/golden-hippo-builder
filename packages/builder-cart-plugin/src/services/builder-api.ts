import { BuilderContent } from '@builder.io/sdk';
import { BuilderBrandConfigContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';

interface FetchContentRequest {
  modelName: string;
  limit: number;
  bustCache?: boolean;
}

class BuilderApi {
  private readonly authHeaders: Record<string, string>;
  private readonly apiKey: string;
  private readonly context: ExtendedApplicationContext;

  constructor(context: ExtendedApplicationContext) {
    this.authHeaders = context.user.authHeaders as Record<string, string>;
    this.apiKey = context.user.apiKey;
    this.context = context;
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

  async saveContent(content: BuilderContent): Promise<void> {
    await this.context.content.update(content);
  }

  private async fetchContent<T extends BuilderContent = BuilderContent>(request: FetchContentRequest): Promise<T[]> {
    const { modelName, limit = 20, bustCache = false } = request;
    const content: T[] = [];
    let offset = 0;
    let baseUrl = `https://cdn.builder.io/api/v3/content/${modelName}?apiKey=${this.apiKey}&includeUnpublished=true&omit=data.blocks&limit=${Math.min(limit, 100)}`;
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
