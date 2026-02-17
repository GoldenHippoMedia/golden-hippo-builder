import { BuilderContent } from '@builder.io/sdk';
import { BlogComment, PageDetails } from '@utils/utils.interfaces';
import Utils from '@utils/index';

interface FetchContentRequest {
  modelName: string;
  limit: number;
  additionalParamsString?: string;
  bustCache: boolean;
}

class BuilderApi {
  private readonly authHeaders: { [p: string]: string };
  private readonly apiKey: string;

  constructor(authHeaders: { [p: string]: string }, apiKey: string) {
    this.authHeaders = authHeaders;
    this.apiKey = apiKey;
  }

  async getPages(bustCache?: boolean): Promise<PageDetails[]> {
    const allPages = await this.fetchContent({
      modelName: 'page',
      bustCache: !!bustCache,
      limit: 10000,
    });
    return Utils.parsePages(allPages);
  }

  async getBlogComments(): Promise<BlogComment[]> {
    const allComments = await this.fetchContent({
      modelName: 'blog-comment',
      limit: 3000,
      bustCache: true,
    });
    return Utils.parseBlogComments(allComments);
  }

  async fetchContent(request: FetchContentRequest): Promise<BuilderContent[]> {
    const { modelName, limit = 20, additionalParamsString, bustCache = false } = request;
    const content: BuilderContent[] = [];
    let offset = 0;
    let requestUrl = `https://cdn.builder.io/api/v3/content/${modelName}?locale=en-US&enrich=true&apiKey=${this.apiKey}&omit=data.blocks&enrichOptions.model.page.omit=data.blocks`;
    if (additionalParamsString) {
      requestUrl += `&${additionalParamsString}`;
    }
    if (bustCache) {
      requestUrl += `&cachebust=${bustCache}`;
    }
    console.info(`[BuilderApi] MODEL -- ${modelName.toUpperCase()}; LIMIT -- ${limit}`);
    const initialRequest = await fetch(requestUrl + `&limit=${limit > 100 ? 100 : limit}`, {
      headers: this.authHeaders,
    });
    const initialJson = await initialRequest.json();
    const initialResults: BuilderContent[] = Array.isArray(initialJson) ? initialJson : (initialJson?.results ?? []);
    initialResults.forEach((item) => content.push(item));
    let lastLoopCount = content.length;
    while (content.length < limit && lastLoopCount > 0) {
      offset = content.length;
      const data = await fetch(`${requestUrl}&limit=${limit}&offset=${offset}`, {
        headers: this.authHeaders,
      });
      const responseJson = await data.json();
      const pageResults: BuilderContent[] = Array.isArray(responseJson) ? responseJson : (responseJson?.results ?? []);
      pageResults.forEach((item) => {
        content.push(item);
      });
      lastLoopCount = pageResults.length;
      console.info(`[BuilderApi] POST LOOP -- MODEL -- ${modelName.toUpperCase()}; LIMIT -- ${limit}`, {
        contentCount: content.length,
      });
    }

    return content;
  }
}

export default BuilderApi;
