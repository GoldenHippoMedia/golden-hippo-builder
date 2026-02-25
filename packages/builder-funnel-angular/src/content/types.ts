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
