# @goldenhippo/builder-funnel-angular

Angular integration SDK for Golden Hippo's Builder.io funnel system. Provides typed business utilities for looking up offers, resolving funnels (including split test logic), extracting pricing, and routing — plus re-exported types from `@goldenhippo/builder-funnel-schemas` for single-import convenience.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [BuilderFunnelConfig](#builderfunnelconfig)
  - [SSR configuration](#ssr-configuration)
- [Offer Lookups](#offer-lookups)
- [Funnel Lookups](#funnel-lookups)
- [Destination Lookups](#destination-lookups)
- [Funnel Resolution](#funnel-resolution)
  - [From a destination](#from-a-destination)
  - [From a split test](#from-a-split-test)
- [Pricing Utilities](#pricing-utilities)
- [Step Utilities](#step-utilities)
- [Page Lookups](#page-lookups)
- [Routing](#routing)
- [Generic Fetchers](#generic-fetchers)
- [Exports](#exports)
  - [Entry points](#entry-points)
  - [Business utilities](#business-utilities)
  - [Types](#types)
  - [Re-exported utilities](#re-exported-utilities)
  - [Model name constants](#model-name-constants)
- [Angular Integration Patterns](#angular-integration-patterns)
  - [App initialization](#app-initialization)
  - [Destination route flow](#destination-route-flow)
  - [Using with Builder.io SDK Angular](#using-with-builderio-sdk-angular)
- [Development](#development)

## Installation

```bash
npm install @goldenhippo/builder-funnel-angular
```

This transitively installs `@goldenhippo/builder-funnel-schemas`, `@goldenhippo/builder-shared-schemas`, and `@goldenhippo/builder-types`.

## Quick Start

```typescript
import {
  initBuilderFunnel,
  getOfferById,
  getDestinationBySlug,
  getFunnelFromDestination,
  getPricingFromFunnel,
} from '@goldenhippo/builder-funnel-angular';

// 1. Initialize once at app startup
initBuilderFunnel({ apiKey: 'YOUR_BUILDER_PUBLIC_API_KEY' });

// 2. Look up a destination by its URL slug
const destination = await getDestinationBySlug('summer-sale-2026');

// 3. Resolve which funnel to serve (handles split test logic)
const result = await getFunnelFromDestination(destination!);

// 4. Extract enriched pricing tiers
const pricing = getPricingFromFunnel(result!.funnel);
pricing.forEach((tier) => {
  console.log(`${tier.quantity}x — $${tier.unitPrice}/unit (save ${tier.savingsPercent}%)`);
});
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
initBuilderFunnel({
  apiKey: environment.builderApiKey,
  enrich: true,
  fetch: customFetchWithTransferState,
});
```

The SDK uses the standard `fetch` API internally — works in both browser and Node.js/Edge runtimes (Node 18+).

## Offer Lookups

```typescript
import { getOfferById, getOfferBySlug, getDefaultOffer } from '@goldenhippo/builder-funnel-angular';

// By Builder entry ID
const offer = await getOfferById('abc123');

// By GEP slug (data.gh.slug) — for /o/[slug] routes
const offer = await getOfferBySlug('weight-loss-starter');

// The global default offer (isDefaultOffer: true)
const fallback = await getDefaultOffer();

// All return BuilderFunnelOfferContent | null
offer?.data?.displayName;
offer?.data?.products;
offer?.data?.defaultPricing;
```

## Funnel Lookups

```typescript
import { getFunnelById, getFunnelByIdOrGEP } from '@goldenhippo/builder-funnel-angular';

// By Builder entry ID
const funnel = await getFunnelById('abc123');

// By ID or GEP slug — for /fp/[idOrSlug] routes
// Tries ID first, falls back to data.gh.slug
const funnel = await getFunnelByIdOrGEP('pricing-test-v2');

// Returns BuilderFunnelContent | null
funnel?.data?.pricing;
funnel?.data?.steps;
funnel?.data?.status;
```

## Destination Lookups

```typescript
import { getDestinationBySlug } from '@goldenhippo/builder-funnel-angular';

// By URL slug (data.slug) — for /d/[slug] routes
const destination = await getDestinationBySlug('summer-sale-2026');

// Returns BuilderFunnelDestinationContent | null
destination?.data?.offer;
destination?.data?.primaryFunnel;
destination?.data?.activeSplitTest;
```

## Funnel Resolution

The core value of this SDK — resolving which funnel to serve based on destinations and split tests.

### From a destination

`getFunnelFromDestination` implements the full resolution pipeline:

1. Checks for an active split test with enriched variants
2. If found, picks a random variant (even distribution)
3. Otherwise falls back to the primary funnel
4. Fetches the resolved funnel by ID (enriched)

```typescript
import {
  getDestinationBySlug,
  getFunnelFromDestination,
  type ResolvedFunnel,
} from '@goldenhippo/builder-funnel-angular';

const destination = await getDestinationBySlug('summer-sale-2026');
if (!destination) throw new Error('Destination not found');

const result: ResolvedFunnel | null = await getFunnelFromDestination(destination);
if (result) {
  console.log(result.funnel); // BuilderFunnelContent
  console.log(result.offerId); // for order context
  console.log(result.funnelId); // for cookie persistence
  console.log(result.splitTestId); // set if resolved via split test
}
```

**Cookie persistence:** The caller is responsible for persisting the resolved variant (e.g., in a cookie keyed by `${destinationSlug}:${splitTestId}`) so the same user sees the same funnel within a session. On subsequent requests, use `getFunnelById(persistedFunnelId)` to skip re-randomization.

### From a split test

Same randomization logic, starting from a split test ID:

```typescript
import { getFunnelFromSplitTest } from '@goldenhippo/builder-funnel-angular';

// Fetches the split test (enriched), picks a random variant, fetches the funnel
const funnel = await getFunnelFromSplitTest('split-test-entry-id');
funnel?.data?.pricing;
```

## Pricing Utilities

`getPricingFromFunnel` extracts pricing tiers and computes per-unit prices and savings:

```typescript
import {
  getPricingFromFunnel,
  getMostPopularTier,
  type ResolvedPricingTier,
} from '@goldenhippo/builder-funnel-angular';

const tiers: ResolvedPricingTier[] = getPricingFromFunnel(funnel);

tiers.forEach((tier) => {
  console.log(`${tier.quantity}x`);
  console.log(`  Total: $${tier.standardPrice}`);
  console.log(`  Per unit: $${tier.unitPrice}`);
  console.log(`  Save: ${tier.savingsPercent}%`);
  if (tier.subscriptionUnitPrice) {
    console.log(`  Sub/unit: $${tier.subscriptionUnitPrice}`);
  }
});

// Find the "Most Popular" tier
const popular = getMostPopularTier(tiers);
```

### ResolvedPricingTier

Extends `FunnelPricingTier` with computed fields:

| Field                                 | Type                  | Description                                                                         |
| ------------------------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `unitPrice`                           | `number`              | `standardPrice / quantity`                                                          |
| `savingsPercent`                      | `number`              | Percentage saved vs the single-unit tier (0 for base)                               |
| `subscriptionUnitPrice`               | `number \| undefined` | `subscriptionPrice / quantity` (if subscription available)                          |
| _(plus all FunnelPricingTier fields)_ |                       | `quantity`, `label`, `standardPrice`, `subscriptionPrice`, `checkoutFeatures`, etc. |

## Step Utilities

```typescript
import { getStepsFromFunnel } from '@goldenhippo/builder-funnel-angular';

const steps = getStepsFromFunnel(funnel);
steps.forEach((step) => {
  console.log(step.stepType, step.label, step.page?.id);
});
```

## Page Lookups

```typescript
import { getFunnelPage } from '@goldenhippo/builder-funnel-angular';

// Fetch by URL path (uses Builder.io userAttributes.urlPath targeting)
const page = await getFunnelPage('/f/preview/weight-loss-step-1');
page?.data?.title;
```

## Routing

```typescript
import {
  isFunnelPreviewPath,
  isBuilderEditRequest,
  resolveDestinationConfig,
  getFunnelIdFromPage,
} from '@goldenhippo/builder-funnel-angular/routing';

// Check if a URL is a funnel preview path
isFunnelPreviewPath('/f/preview/my-page'); // true
isFunnelPreviewPath('/about'); // false

// Check if a request is from the Builder.io visual editor
isBuilderEditRequest('https://example.com/page?builder.preview=true'); // true

// Low-level resolution (returns IDs only, no fetching)
const config = resolveDestinationConfig(enrichedDestination);
// { offerId, funnelId, splitTestId? }

// Extract funnel ID from a funnel-page entry
const funnelId = getFunnelIdFromPage(page);
```

All routing functions are SSR-safe and work in both browser and Node.js.

## Generic Fetchers

For custom models or one-off queries, use the generic fetchers directly:

```typescript
import { fetchEntries, fetchOneEntry, fetchAllEntries } from '@goldenhippo/builder-funnel-angular';

// Fetch with explicit model name and type parameter
const entries = await fetchEntries<MyCustomType>('my-custom-model', {
  limit: 10,
  sort: { 'data.title': 1 },
});

// Fetch all (auto-paginates past Builder.io's 100-item limit)
const all = await fetchAllEntries<MyCustomType>('my-custom-model');

// Fetch one
const single = await fetchOneEntry<MyCustomType>('my-custom-model', {
  query: { 'data.slug': 'foo' },
});
```

## Exports

### Entry points

| Entry Point                                   | Description                                   |
| --------------------------------------------- | --------------------------------------------- |
| `@goldenhippo/builder-funnel-angular`         | Everything: config, utilities, routing, types |
| `@goldenhippo/builder-funnel-angular/content` | Content utilities, fetchers, model constants  |
| `@goldenhippo/builder-funnel-angular/routing` | Routing helpers and low-level resolution      |

### Business utilities

| Function                   | Returns                                   | Description                                      |
| -------------------------- | ----------------------------------------- | ------------------------------------------------ |
| `getOfferById`             | `BuilderFunnelOfferContent \| null`       | Look up offer by Builder entry ID                |
| `getOfferBySlug`           | `BuilderFunnelOfferContent \| null`       | Look up offer by GEP slug (`data.gh.slug`)       |
| `getDefaultOffer`          | `BuilderFunnelOfferContent \| null`       | Fetch the global default offer                   |
| `getFunnelById`            | `BuilderFunnelContent \| null`            | Look up funnel by Builder entry ID               |
| `getFunnelByIdOrGEP`       | `BuilderFunnelContent \| null`            | Look up funnel by ID or GEP slug                 |
| `getDestinationBySlug`     | `BuilderFunnelDestinationContent \| null` | Look up destination by URL slug                  |
| `getFunnelPage`            | `BuilderFunnelPageContent \| null`        | Fetch funnel page by URL path                    |
| `getFunnelFromDestination` | `ResolvedFunnel \| null`                  | Resolve destination → funnel (split test aware)  |
| `getFunnelFromSplitTest`   | `BuilderFunnelContent \| null`            | Resolve split test → funnel variant              |
| `getPricingFromFunnel`     | `ResolvedPricingTier[]`                   | Extract pricing with per-unit prices and savings |
| `getMostPopularTier`       | `FunnelPricingTier \| undefined`          | Find the tier marked as most popular             |
| `getStepsFromFunnel`       | `FunnelStep[]`                            | Extract ordered step sequence                    |

### Types

Re-exported from `@goldenhippo/builder-funnel-schemas` for single-import convenience:

| Type                              | Source Package           |
| --------------------------------- | ------------------------ |
| `BuilderFunnelOfferContent`       | `builder-funnel-schemas` |
| `BuilderFunnelContent`            | `builder-funnel-schemas` |
| `BuilderFunnelDestinationContent` | `builder-funnel-schemas` |
| `BuilderFunnelSplitTestContent`   | `builder-funnel-schemas` |
| `BuilderFunnelPageContent`        | `builder-funnel-schemas` |
| `BuilderProductContent`           | `builder-shared-schemas` |
| `FunnelPricingTier`               | `builder-funnel-schemas` |
| `FunnelStep`, `FunnelStepType`    | `builder-funnel-schemas` |
| `FunnelStatus`                    | `builder-funnel-schemas` |
| `DestinationConfig`               | `builder-funnel-schemas` |
| `ResolvedFunnel`                  | This package             |
| `ResolvedPricingTier`             | This package             |
| `ContentQueryOptions`             | This package             |
| `BuilderFunnelConfig`             | This package             |

### Re-exported utilities

From `@goldenhippo/builder-funnel-schemas`:

| Utility                          | Description                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| `resolveDestinationConfig`       | Low-level destination resolution (returns IDs, no fetching) |
| `getFunnelIdFromPage`            | Extract funnel ID from a funnel-page content entry          |
| `calculateSubscriptionFrequency` | Calculate subscription frequency from product data          |
| `SUBSCRIPTION_FREQUENCIES`       | Available subscription frequency values                     |
| `FREQUENCY_LABELS`               | Human-readable labels for subscription frequencies          |

### Model name constants

`FUNNEL_MODELS` provides the Builder.io model name strings:

```typescript
import { FUNNEL_MODELS } from '@goldenhippo/builder-funnel-angular';

FUNNEL_MODELS.OFFER; // 'funnel-offer'
FUNNEL_MODELS.FUNNEL; // 'funnel'
FUNNEL_MODELS.DESTINATION; // 'funnel-destination'
FUNNEL_MODELS.SPLIT_TEST; // 'funnel-split-test'
FUNNEL_MODELS.FUNNEL_PAGE; // 'funnel-page'
FUNNEL_MODELS.PRODUCT; // 'product'
```

## Angular Integration Patterns

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
  providers: [{ provide: APP_INITIALIZER, useFactory: initBuilder, multi: true }],
};
```

### Destination route flow

The full `/d/[slug]` resolution in an Angular resolver:

```typescript
// destination.resolver.ts
import { ResolveFn } from '@angular/router';
import {
  getDestinationBySlug,
  getFunnelFromDestination,
  getFunnelById,
  getPricingFromFunnel,
  type ResolvedFunnel,
  type ResolvedPricingTier,
} from '@goldenhippo/builder-funnel-angular';

interface DestinationRouteData {
  result: ResolvedFunnel;
  pricing: ResolvedPricingTier[];
}

export const destinationResolver: ResolveFn<DestinationRouteData | null> = async (route) => {
  const slug = route.paramMap.get('slug');
  if (!slug) return null;

  const destination = await getDestinationBySlug(slug);
  if (!destination) return null;

  // Check for a persisted funnel ID from a previous split test resolution
  const cookieKey = `funnel:${slug}:${destination.data?.activeSplitTest?.id ?? 'primary'}`;
  const persistedFunnelId = getCookie(cookieKey); // your cookie utility

  let result: ResolvedFunnel | null;
  if (persistedFunnelId) {
    const funnel = await getFunnelById(persistedFunnelId);
    result = funnel ? { funnel, offerId: destination.data!.offer!.id!, funnelId: persistedFunnelId } : null;
  } else {
    result = await getFunnelFromDestination(destination);
    if (result) {
      setCookie(cookieKey, result.funnelId); // persist for session
    }
  }

  if (!result) return null;
  return { result, pricing: getPricingFromFunnel(result.funnel) };
};
```

### Using with Builder.io SDK Angular

The content entries returned by this SDK are compatible with Builder.io's `Content` component:

```typescript
import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Content } from '@builder.io/sdk-angular';
import { getFunnelPage, type BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-angular';

@Component({
  selector: 'app-funnel-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [Content],
  template: `
    @if (page) {
      <builder-content [model]="'funnel-page'" [content]="page" [apiKey]="apiKey"> </builder-content>
    } @else {
      <app-not-found />
    }
  `,
})
export class FunnelPageComponent {
  @Input() page: BuilderFunnelPageContent | null = null;
  apiKey = environment.builderApiKey;
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
