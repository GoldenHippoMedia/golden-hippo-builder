# @goldenhippo/builder-funnel-angular

Angular integration SDK for Golden Hippo's Builder.io funnel system. Provides typed content fetching against the Builder.io Content API, routing helpers, and re-exported types from `@goldenhippo/builder-funnel-schemas` for single-import convenience.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [BuilderFunnelConfig](#builderfunnelconfig)
  - [SSR configuration](#ssr-configuration)
- [Content Fetching](#content-fetching)
  - [Funnel-specific fetchers](#funnel-specific-fetchers)
  - [Fetching a funnel page by URL](#fetching-a-funnel-page-by-url)
  - [Filtering and sorting](#filtering-and-sorting)
  - [Generic fetchers](#generic-fetchers)
  - [Auto-pagination](#auto-pagination)
- [Routing](#routing)
- [Exports](#exports)
  - [Entry points](#entry-points)
  - [Content fetchers](#content-fetchers)
  - [Types](#types)
  - [Re-exported utilities](#re-exported-utilities)
  - [Model name constants](#model-name-constants)
- [Angular Integration Patterns](#angular-integration-patterns)
  - [App initialization](#app-initialization)
  - [Content service](#content-service)
  - [Route resolver](#route-resolver)
  - [Using with Builder.io SDK Angular](#using-with-builderio-sdk-angular)
- [Development](#development)

## Installation

```bash
npm install @goldenhippo/builder-funnel-angular
```

This transitively installs `@goldenhippo/builder-funnel-schemas`, `@goldenhippo/builder-shared-schemas`, and `@goldenhippo/builder-types`.

## Quick Start

```typescript
import { initBuilderFunnel, fetchFunnelOffers, fetchFunnelPage } from '@goldenhippo/builder-funnel-angular';

// 1. Initialize once at app startup
initBuilderFunnel({ apiKey: 'YOUR_BUILDER_PUBLIC_API_KEY' });

// 2. Fetch typed content
const offers = await fetchFunnelOffers();
offers.forEach((entry) => {
  console.log(entry.name, entry.data.offerName, entry.data.status);
});

// 3. Fetch a page by URL path
const page = await fetchFunnelPage('/f/preview/weight-loss-offer');
if (page) {
  console.log(page.data.title, page.data.pageType);
}
```

## Configuration

Call `initBuilderFunnel()` once before making any content requests. In Angular, this is typically done in `app.config.ts` or an `APP_INITIALIZER` provider.

```typescript
import { initBuilderFunnel } from '@goldenhippo/builder-funnel-angular';

initBuilderFunnel({
  apiKey: environment.builderApiKey,
  enrich: true,
  cacheSeconds: 300,
});
```

### BuilderFunnelConfig

| Property       | Type       | Default                    | Description                                        |
| -------------- | ---------- | -------------------------- | -------------------------------------------------- |
| `apiKey`       | `string`   | _(required)_               | Builder.io public API key                          |
| `apiHost`      | `string`   | `'https://cdn.builder.io'` | Builder.io API host override                       |
| `enrich`       | `boolean`  | `true`                     | Enrich references inline (resolves linked content) |
| `cacheSeconds` | `number`   | _(none)_                   | Default CDN cache duration in seconds              |
| `fetch`        | `Function` | `globalThis.fetch`         | Custom fetch implementation for SSR or testing     |

### SSR configuration

On the server, inject a custom `fetch` to support Angular's transfer state or request-scoped context:

```typescript
import { initBuilderFunnel } from '@goldenhippo/builder-funnel-angular';

// In server.ts or an SSR-specific provider
initBuilderFunnel({
  apiKey: environment.builderApiKey,
  enrich: true,
  fetch: customFetchWithTransferState,
});
```

The SDK uses the standard `fetch` API internally, so it works in both browser and Node.js/Edge runtimes without any additional polyfills (Node 18+).

## Content Fetching

All fetch functions return `BuilderContentEntry<T>` objects with strongly-typed `data` fields. They call the Builder.io Content API v3 directly via `fetch()`.

### Funnel-specific fetchers

Each funnel model has a pair of fetchers — one for multiple entries and one for a single entry:

```typescript
import {
  fetchFunnelOffers,
  fetchFunnelOffer,
  fetchFunnels,
  fetchFunnel,
  fetchFunnelDestinations,
  fetchFunnelDestination,
  fetchFunnelSplitTests,
  fetchFunnelSplitTest,
  fetchFunnelPages,
  fetchFunnelPage,
  fetchProducts,
} from '@goldenhippo/builder-funnel-angular';

// Fetch all offers (auto-paginates past Builder.io's 100-item limit)
const offers = await fetchFunnelOffers();

// Fetch a single offer by query
const offer = await fetchFunnelOffer({
  query: { 'data.offerName': 'Summer Sale' },
});
```

### Fetching a funnel page by URL

`fetchFunnelPage()` uses Builder.io's `userAttributes.urlPath` targeting to match pages:

```typescript
import { fetchFunnelPage } from '@goldenhippo/builder-funnel-angular';

const page = await fetchFunnelPage('/f/preview/weight-loss-step-1');
if (page) {
  console.log(page.data.title);
  console.log(page.data.pageType);
}
```

### Filtering and sorting

All fetchers accept `ContentQueryOptions` for filtering, sorting, pagination, and field selection:

```typescript
import { fetchFunnelOffers } from '@goldenhippo/builder-funnel-angular';

const activeOffers = await fetchFunnelOffers({
  query: { 'data.status': 'active' },
  sort: { 'data.offerName': 1 },
  fields: 'data,name,id',
  cacheSeconds: 600,
});
```

#### ContentQueryOptions

| Option               | Type                      | Description                                                |
| -------------------- | ------------------------- | ---------------------------------------------------------- |
| `query`              | `Record<string, any>`     | MongoDB-style filter (e.g., `{ 'data.status': 'active' }`) |
| `limit`              | `number`                  | Max entries to return (Builder.io max: 100)                |
| `offset`             | `number`                  | Pagination offset                                          |
| `fields`             | `string`                  | Comma-separated fields to include (e.g., `'data,name,id'`) |
| `omit`               | `string`                  | Comma-separated fields to exclude                          |
| `sort`               | `Record<string, 1 \| -1>` | Sort order (e.g., `{ 'data.name': 1 }` for ascending)      |
| `enrich`             | `boolean`                 | Override config-level enrich setting                       |
| `locale`             | `string`                  | Locale for localized content                               |
| `cacheSeconds`       | `number`                  | Override config-level cache duration                       |
| `includeUnpublished` | `boolean`                 | Include draft/unpublished content                          |
| `userAttributes`     | `Record<string, string>`  | Targeting attributes (e.g., `{ urlPath: '/some/path' }`)   |
| `fetch`              | `Function`                | Override fetch implementation for this request             |

### Generic fetchers

For custom models or advanced use cases, use the generic fetchers directly:

```typescript
import { fetchContent, fetchOneContent, fetchAllContent } from '@goldenhippo/builder-funnel-angular';
import type { BuilderContentEntry } from '@goldenhippo/builder-funnel-angular';

// Fetch with explicit model name and type
interface MyCustomContent {
  data: { title: string; slug: string };
}

const entries = await fetchContent<MyCustomContent>('my-custom-model', {
  limit: 10,
  sort: { 'data.title': 1 },
});

// Fetch all entries (auto-paginates)
const allEntries = await fetchAllContent<MyCustomContent>('my-custom-model');
```

### Auto-pagination

`fetchAllContent()` and the multi-entry funnel fetchers (`fetchFunnelOffers`, `fetchFunnels`, etc.) automatically paginate through all results. Builder.io limits responses to 100 items per request — these functions issue sequential requests until all content is retrieved.

```typescript
// This fetches ALL offers, even if there are 250+
const allOffers = await fetchFunnelOffers();
```

Single-entry fetchers (`fetchFunnelOffer`, `fetchFunnel`, etc.) and `fetchFunnelPages` do **not** auto-paginate, giving you control over limit/offset.

## Routing

```typescript
import { isFunnelPreviewPath, isBuilderEditRequest } from '@goldenhippo/builder-funnel-angular/routing';

// Check if a URL is a funnel preview path
isFunnelPreviewPath('/f/preview/my-page'); // true
isFunnelPreviewPath('/about'); // false

// Check if a request is from the Builder.io visual editor
isBuilderEditRequest('https://example.com/page?builder.preview=true'); // true
```

| Function               | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `isFunnelPreviewPath`  | Check if a URL path starts with the funnel preview base (`/f/preview`) |
| `isBuilderEditRequest` | Check if a URL has `builder.preview` or `builder.editing` query params |

Both functions are SSR-safe and work in browser and Node.js environments.

## Exports

### Entry points

| Entry Point                                   | Description                                             |
| --------------------------------------------- | ------------------------------------------------------- |
| `@goldenhippo/builder-funnel-angular`         | Everything: config, fetchers, routing, types, utilities |
| `@goldenhippo/builder-funnel-angular/content` | Content fetchers, model constants, and query types      |
| `@goldenhippo/builder-funnel-angular/routing` | Routing helper functions                                |

### Content fetchers

| Function                   | Returns                                                        | Pagination |
| -------------------------- | -------------------------------------------------------------- | ---------- |
| `fetchFunnelOffers`        | `BuilderContentEntry<BuilderFunnelOfferContent>[]`             | Auto       |
| `fetchFunnelOffer`         | `BuilderContentEntry<BuilderFunnelOfferContent> \| null`       | Single     |
| `fetchFunnels`             | `BuilderContentEntry<BuilderFunnelContent>[]`                  | Auto       |
| `fetchFunnel`              | `BuilderContentEntry<BuilderFunnelContent> \| null`            | Single     |
| `fetchFunnelDestinations`  | `BuilderContentEntry<BuilderFunnelDestinationContent>[]`       | Auto       |
| `fetchFunnelDestination`   | `BuilderContentEntry<BuilderFunnelDestinationContent> \| null` | Single     |
| `fetchFunnelSplitTests`    | `BuilderContentEntry<BuilderFunnelSplitTestContent>[]`         | Auto       |
| `fetchFunnelSplitTest`     | `BuilderContentEntry<BuilderFunnelSplitTestContent> \| null`   | Single     |
| `fetchFunnelPages`         | `BuilderContentEntry<BuilderFunnelPageContent>[]`              | Manual     |
| `fetchFunnelPage(urlPath)` | `BuilderContentEntry<BuilderFunnelPageContent> \| null`        | Single     |
| `fetchProducts`            | `BuilderContentEntry<BuilderProductContent>[]`                 | Auto       |
| `fetchContent<T>`          | `BuilderContentEntry<T>[]`                                     | Manual     |
| `fetchOneContent<T>`       | `BuilderContentEntry<T> \| null`                               | Single     |
| `fetchAllContent<T>`       | `BuilderContentEntry<T>[]`                                     | Auto       |

### Types

Re-exported from `@goldenhippo/builder-funnel-schemas` for single-import convenience:

| Type                               | Source Package           |
| ---------------------------------- | ------------------------ |
| `BuilderFunnelOfferContent`        | `builder-funnel-schemas` |
| `BuilderFunnelContent`             | `builder-funnel-schemas` |
| `BuilderFunnelDestinationContent`  | `builder-funnel-schemas` |
| `BuilderFunnelSplitTestContent`    | `builder-funnel-schemas` |
| `BuilderFunnelPageContent`         | `builder-funnel-schemas` |
| `BuilderProductContent`            | `builder-shared-schemas` |
| `BuilderProductCategoryContent`    | `builder-shared-schemas` |
| `BuilderProductTagContent`         | `builder-shared-schemas` |
| `BuilderIngredientContent`         | `builder-shared-schemas` |
| `BuilderProductUseCaseContent`     | `builder-shared-schemas` |
| `BuilderContentEntry<T>`           | This package             |
| `BuilderContentResponse<T>`        | This package             |
| `ContentQueryOptions`              | This package             |
| `BuilderFunnelConfig`              | This package             |
| `DestinationConfig`                | `builder-funnel-schemas` |
| `SubscriptionFrequency`            | `builder-funnel-schemas` |
| `FunnelStep`, `FunnelStatus`, etc. | `builder-funnel-schemas` |

### Re-exported utilities

These are re-exported from `@goldenhippo/builder-funnel-schemas`:

| Utility                          | Description                                                        |
| -------------------------------- | ------------------------------------------------------------------ |
| `resolveDestinationConfig`       | Resolve active config for a destination (handles split test logic) |
| `getFunnelIdFromPage`            | Extract funnel ID from a funnel-page content entry                 |
| `calculateSubscriptionFrequency` | Calculate subscription frequency from product data                 |
| `SUBSCRIPTION_FREQUENCIES`       | Available subscription frequency values                            |
| `FREQUENCY_LABELS`               | Human-readable labels for subscription frequencies                 |

### Model name constants

`FUNNEL_MODELS` provides the Builder.io model name strings used internally by the fetchers:

```typescript
import { FUNNEL_MODELS } from '@goldenhippo/builder-funnel-angular';

FUNNEL_MODELS.OFFER; // 'funnel-offer'
FUNNEL_MODELS.FUNNEL; // 'funnel'
FUNNEL_MODELS.DESTINATION; // 'funnel-destination'
FUNNEL_MODELS.SPLIT_TEST; // 'funnel-split-test'
FUNNEL_MODELS.FUNNEL_PAGE; // 'funnel-page'
FUNNEL_MODELS.PRODUCT; // 'product'
FUNNEL_MODELS.PRODUCT_CATEGORY; // 'product-category'
FUNNEL_MODELS.PRODUCT_TAG; // 'product-tag'
FUNNEL_MODELS.PRODUCT_INGREDIENT; // 'product-ingredient'
FUNNEL_MODELS.PRODUCT_USE_CASE; // 'product-use-case'
```

## Angular Integration Patterns

This package provides framework-agnostic functions. Below are recommended patterns for integrating with Angular.

### App initialization

```typescript
// app.config.ts
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { initBuilderFunnel } from '@goldenhippo/builder-funnel-angular';
import { environment } from './environments/environment';

function initBuilder() {
  return () => {
    initBuilderFunnel({
      apiKey: environment.builderApiKey,
      enrich: true,
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_INITIALIZER, useFactory: initBuilder, multi: true },
    // ...other providers
  ],
};
```

### Content service

Wrap the fetchers in an Angular service for dependency injection and caching:

```typescript
// funnel-content.service.ts
import { Injectable } from '@angular/core';
import {
  fetchFunnelOffers,
  fetchFunnels,
  fetchFunnelDestinations,
  fetchFunnelPage,
  type BuilderContentEntry,
  type BuilderFunnelOfferContent,
  type BuilderFunnelContent,
  type BuilderFunnelDestinationContent,
  type BuilderFunnelPageContent,
} from '@goldenhippo/builder-funnel-angular';

@Injectable({ providedIn: 'root' })
export class FunnelContentService {
  private offersCache: BuilderContentEntry<BuilderFunnelOfferContent>[] | null = null;

  async getOffers(): Promise<BuilderContentEntry<BuilderFunnelOfferContent>[]> {
    if (!this.offersCache) {
      this.offersCache = await fetchFunnelOffers();
    }
    return this.offersCache;
  }

  async getFunnels(): Promise<BuilderContentEntry<BuilderFunnelContent>[]> {
    return fetchFunnels();
  }

  async getDestinations(): Promise<BuilderContentEntry<BuilderFunnelDestinationContent>[]> {
    return fetchFunnelDestinations();
  }

  async getPageByUrl(urlPath: string): Promise<BuilderContentEntry<BuilderFunnelPageContent> | null> {
    return fetchFunnelPage(urlPath);
  }
}
```

### Route resolver

Use with Angular's functional route resolvers for SSR/SSG:

```typescript
// funnel-page.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import {
  fetchFunnelPage,
  type BuilderContentEntry,
  type BuilderFunnelPageContent,
} from '@goldenhippo/builder-funnel-angular';

export const funnelPageResolver: ResolveFn<BuilderContentEntry<BuilderFunnelPageContent> | null> = (route) => {
  const urlPath = '/' + route.url.map((s) => s.path).join('/');
  return fetchFunnelPage(urlPath);
};

// In your route config:
// { path: 'f/preview/:slug', component: FunnelPageComponent, resolve: { page: funnelPageResolver } }
```

### Using with Builder.io SDK Angular

The `BuilderContentEntry` returned by this SDK is compatible with Builder.io's `Content` component. Pass the entry directly as the `content` input:

```typescript
import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Content } from '@builder.io/sdk-angular';
import type { BuilderContentEntry, BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-angular';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-funnel-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [Content],
  template: `
    @if (page) {
      <builder-content [model]="'funnel-page'" [content]="page" [apiKey]="apiKey" [customComponents]="customComponents">
      </builder-content>
    } @else {
      <app-not-found />
    }
  `,
})
export class FunnelPageComponent {
  @Input() page: BuilderContentEntry<BuilderFunnelPageContent> | null = null;
  apiKey = environment.builderApiKey;
  customComponents = []; // Register your custom components here
}
```

## Development

```bash
npm run build        # Build with tsup (CJS + ESM + declarations)
npm run dev          # Watch mode
npm run typecheck    # Type-check with tsc
npm run test         # Run tests with vitest
npm run lint         # Lint with eslint
```
