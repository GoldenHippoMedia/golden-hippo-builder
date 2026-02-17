# Golden Hippo Builder.io Workspace

Nx monorepo for Golden Hippo's Builder.io integration. Published to [npm](https://www.npmjs.com/org/goldenhippo).

## Table of Contents

- [Packages](#packages)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Consuming Schemas](#consuming-schemas)
- [Plugin CDN URLs](#plugin-cdn-urls)
- [Making Changes](#making-changes)
- [Project Structure](#project-structure)

## Packages

| Package                               | Description                                                                    | npm             |
| ------------------------------------- | ------------------------------------------------------------------------------ | --------------- |
| `@goldenhippo/builder-types`          | Shared Builder.io type definitions (`ModelShape`, `BuilderIOFieldTypes`, etc.) | Published       |
| `@goldenhippo/builder-cart-schemas`   | Builder.io model definitions and TS content types for 13 cart/commerce models  | Published       |
| `@goldenhippo/builder-funnel-schemas` | Builder.io model definitions and TS content types for funnel models            | Published       |
| `@goldenhippo/builder-cart-plugin`    | React 18 Builder.io plugin for commerce brand management                       | Published (CDN) |
| `@goldenhippo/builder-funnel-plugin`  | React 18 Builder.io plugin for funnel websites                                 | Published (CDN) |
| `@goldenhippo/builder-ui`             | Shared React component library (Tailwind v4 + DaisyUI v5)                      | Private         |

## Documentation

Full developer documentation is in the [**wiki/**](./wiki/) folder:

- [Architecture](./wiki/architecture.md) — package overview, dependency flow, what gets published
- [Development Workflow](./wiki/development-workflow.md) — branching, coding, changesets, pull requests
- [Versioning & Publishing](./wiki/versioning-and-publishing.md) — how releases work
- [Consuming Schemas](./wiki/consuming-schemas.md) — for frontend teams installing schema packages
- [Consuming Plugins](./wiki/consuming-plugins.md) — for Builder.io admins loading plugins via CDN
- [Repository Setup](./wiki/repository-setup.md) — one-time setup for repo administrators

## Quick Start

```bash
npm install
npm run build
npm run dev:plugin           # Cart plugin on http://localhost:1268
npm run dev:funnel-plugin    # Funnel plugin on http://localhost:1269
```

## Consuming Schemas

```bash
npm install @goldenhippo/builder-cart-schemas
```

```typescript
import { fetchOneEntry } from '@builder.io/sdk-angular';
import type { BuilderProductContent } from '@goldenhippo/builder-cart-schemas';

const product = await fetchOneEntry({
  model: 'product',
  apiKey: BUILDER_API_KEY,
  userAttributes: { urlPath: '/products/example' },
});

const typed = product as BuilderProductContent;
console.log(typed?.data?.displayName);
```

## Plugin CDN URLs

Production plugins are available via jsdelivr after publishing:

```
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@<version>/dist/plugin.system.js
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-funnel-plugin@<version>/dist/plugin.system.js
```

## Making Changes

```bash
# 1. Create a branch and make your changes
# 2. Add a changeset describing the change
npx changeset

# 3. Commit, push, open PR
# 4. CI validates → merge → automated release
```

See [Development Workflow](./wiki/development-workflow.md) for the full process.

## Project Structure

```
├── .changeset/                      # Changesets config + pending changesets
├── .github/workflows/               # CI + Release automation
├── wiki/                            # Developer documentation
├── packages/
│   ├── builder-types/               # Shared Builder.io type definitions
│   ├── builder-cart-schemas/        # Cart/commerce model definitions + types
│   ├── builder-funnel-schemas/      # Funnel model definitions + types
│   ├── builder-ui/                  # Shared React component library (private)
│   ├── builder-cart-plugin/         # Builder.io editor plugin (commerce)
│   └── builder-funnel-plugin/       # Builder.io editor plugin (funnels)
├── nx.json                          # Nx workspace config
├── tsconfig.base.json               # Shared TS config + path aliases
├── eslint.config.mjs                # ESLint flat config + module boundaries
└── package.json                     # Workspace root (npm workspaces)
```
