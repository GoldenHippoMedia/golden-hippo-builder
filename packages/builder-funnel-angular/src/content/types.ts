/** A Builder.io content entry with strongly-typed data */
export interface BuilderContentEntry<T = Record<string, any>> {
  id: string;
  name: string;
  published: 'published' | 'draft' | 'archived';
  data: T;
  modelId: string;
  createdDate: number;
  lastUpdated: number;
  rev?: string;
  meta?: Record<string, any>;
  variations?: Record<string, { data: Partial<T>; [key: string]: any }>;
  testRatio?: number;
  query?: Array<{ property: string; operator: string; value: any }>;
}

/** Raw API response from Builder.io Content API */
export interface BuilderContentResponse<T = Record<string, any>> {
  results: BuilderContentEntry<T>[];
}

/** Options for querying Builder.io content */
export interface ContentQueryOptions {
  /** MongoDB-style query filter (e.g., { 'data.status': 'active' }) */
  query?: Record<string, any>;
  /** Maximum entries to return (Builder.io max: 100) */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Comma-separated fields to include (e.g., 'data,name,id') */
  fields?: string;
  /** Comma-separated fields to exclude */
  omit?: string;
  /** Sort order (e.g., { 'data.name': 1 } for ascending) */
  sort?: Record<string, 1 | -1>;
  /** Enrich references inline (default: uses config value) */
  enrich?: boolean;
  /** Locale for localized content */
  locale?: string;
  /** Cache duration in seconds */
  cacheSeconds?: number;
  /** Include unpublished/draft content */
  includeUnpublished?: boolean;
  /** User attributes for targeting (e.g., { urlPath: '/some/path' }) */
  userAttributes?: Record<string, string>;
  /** Custom fetch function override */
  fetch?: typeof globalThis.fetch;
}
