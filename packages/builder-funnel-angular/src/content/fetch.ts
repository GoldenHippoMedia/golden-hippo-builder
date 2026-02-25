import { getBuilderFunnelConfig, type BuilderFunnelConfig } from '../config';
import type { ContentQueryOptions } from './types';

const DEFAULT_API_HOST = 'https://cdn.builder.io';
const MAX_PER_PAGE = 100;

function buildUrl(model: string, options: ContentQueryOptions, config: BuilderFunnelConfig): string {
  const host = config.apiHost || DEFAULT_API_HOST;
  const url = new URL(`/api/v3/content/${model}`, host);

  url.searchParams.set('apiKey', config.apiKey);

  if (options.limit != null) url.searchParams.set('limit', String(options.limit));
  if (options.offset != null) url.searchParams.set('offset', String(options.offset));
  if (options.fields) url.searchParams.set('fields', options.fields);
  if (options.omit) url.searchParams.set('omit', options.omit);
  if (options.locale) url.searchParams.set('locale', options.locale);
  if (options.includeUnpublished) url.searchParams.set('includeUnpublished', 'true');

  const enrich = options.enrich ?? config.enrich ?? true;
  if (enrich) url.searchParams.set('enrich', 'true');

  const cache = options.cacheSeconds ?? config.cacheSeconds;
  if (cache != null) url.searchParams.set('cacheSeconds', String(cache));

  if (options.userAttributes) {
    for (const [key, value] of Object.entries(options.userAttributes)) {
      url.searchParams.set(`userAttributes.${key}`, value);
    }
  }

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      url.searchParams.set(`query.${key}`, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }

  if (options.sort) {
    for (const [key, value] of Object.entries(options.sort)) {
      url.searchParams.set(`sort.${key}`, String(value));
    }
  }

  return url.toString();
}

/**
 * Fetch content entries from the Builder.io Content API.
 * For typed funnel content, use the business utilities (getOfferById, getFunnelByIdOrGEP, etc.).
 *
 * @param model - Builder.io model name (e.g., 'funnel-offer')
 * @param options - Query options (filters, pagination, sorting)
 * @returns Array of content entries typed as T
 */
export async function fetchEntries<T = Record<string, any>>(
  model: string,
  options: ContentQueryOptions = {},
): Promise<T[]> {
  const config = getBuilderFunnelConfig();
  const fetchFn = options.fetch ?? config.fetch ?? globalThis.fetch;
  const url = buildUrl(model, options, config);

  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`Builder.io API error: ${response.status} ${response.statusText} (model: ${model})`);
  }

  const data = (await response.json()) as { results: T[] };
  return data.results;
}

/**
 * Fetch a single content entry. Returns null if not found.
 *
 * @param model - Builder.io model name
 * @param options - Query options (filters, targeting)
 * @returns A single content entry typed as T, or null
 */
export async function fetchOneEntry<T = Record<string, any>>(
  model: string,
  options: ContentQueryOptions = {},
): Promise<T | null> {
  const results = await fetchEntries<T>(model, { ...options, limit: 1 });
  return results[0] ?? null;
}

/**
 * Fetch all content entries, automatically paginating through results.
 * Builder.io limits responses to 100 items — this function issues sequential
 * requests until all matching content is retrieved.
 *
 * @param model - Builder.io model name
 * @param options - Query options (filters, sorting — limit/offset handled internally)
 * @returns All matching content entries typed as T
 */
export async function fetchAllEntries<T = Record<string, any>>(
  model: string,
  options: Omit<ContentQueryOptions, 'limit' | 'offset'> = {},
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;

  while (true) {
    const batch = await fetchEntries<T>(model, { ...options, limit: MAX_PER_PAGE, offset });
    all.push(...batch);

    if (batch.length < MAX_PER_PAGE) break;
    offset += MAX_PER_PAGE;
  }

  return all;
}
