# @goldenhippo/builder-funnel-schemas

Builder.io model definitions and TypeScript content types for Golden Hippo's funnel integration. Same structure as `@goldenhippo/builder-cart-schemas` but scoped to funnel workflows.

## Table of Contents

- [Installation](#installation)
- [Using Content Types](#using-content-types)
- [Exports](#exports)
- [Current Status](#current-status)
- [Development](#development)

## Installation

```bash
npm install @goldenhippo/builder-funnel-schemas
```

## Using Content Types

Once funnel models are implemented, content types will be consumed the same way as cart schemas:

```typescript
import { fetchOneEntry } from '@builder.io/sdk-angular';
// Future imports — types will be added as funnel models are implemented
// import type { BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-schemas/page';

const result = await fetchOneEntry({
  model: 'funnel-page',
  apiKey: environment.builderApiKey,
  userAttributes: { urlPath: '/funnel/step-1' },
});
```

Core types (`ModelShape`, `BuilderIOFieldTypes`, etc.) are available from `@goldenhippo/builder-types`.

## Exports

The package provides multiple entry points (currently empty, will be populated as models are added):

| Entry Point                                   | Description                                        |
| --------------------------------------------- | -------------------------------------------------- |
| `@goldenhippo/builder-funnel-schemas`         | All model creators and content types               |
| `@goldenhippo/builder-funnel-schemas/data`    | Data model creators and content types              |
| `@goldenhippo/builder-funnel-schemas/page`    | Page model creator and content types               |
| `@goldenhippo/builder-funnel-schemas/section` | Section/component model creators and content types |

## Current Status

This package is scaffolded with the same structure as `builder-cart-schemas` but does not yet contain any model definitions. Models will be added as funnel features are implemented. The directory structure is ready:

- `src/data/` — Funnel data models (empty)
- `src/section/` — Funnel section/component models (empty)
- `src/page/` — Funnel page models (empty)

See `@goldenhippo/builder-cart-schemas` for reference on the model pattern.

## Development

```bash
npm run build        # Build with tsup (CJS + ESM + declarations)
npm run dev          # Watch mode
npm run typecheck    # Type-check with tsc
npm run test         # Run tests with vitest
npm run lint         # Lint with eslint
```
