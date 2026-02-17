# Architecture

## Package Overview

This is an Nx monorepo with npm workspaces containing six packages:

| Package                               | Published to npm | Purpose                                                                        |
| ------------------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `@goldenhippo/builder-types`          | Yes              | Shared Builder.io type definitions (`ModelShape`, `BuilderIOFieldTypes`, etc.) |
| `@goldenhippo/builder-cart-schemas`   | Yes              | Model definitions and TS content types for 13 cart/commerce models             |
| `@goldenhippo/builder-funnel-schemas` | Yes              | Model definitions and TS content types for funnel models                       |
| `@goldenhippo/builder-cart-plugin`    | Yes              | Builder.io editor plugin for commerce sites                                    |
| `@goldenhippo/builder-funnel-plugin`  | Yes              | Builder.io editor plugin for funnel sites                                      |
| `@goldenhippo/builder-ui`             | No (private)     | Shared React component library, internal only                                  |

## Dependency Flow

```
builder-cart-plugin    --> builder-cart-schemas + builder-types + builder-ui
builder-funnel-plugin  --> builder-funnel-schemas + builder-cart-schemas + builder-ui
builder-cart-schemas   --> builder-types
builder-funnel-schemas --> builder-types
builder-ui             --> (no internal deps)
builder-types          --> (no internal deps)
```

## Build Order

Nx automatically resolves the build order based on dependencies:

```
1. builder-types      (no deps)
2. builder-ui         (no deps)
3. builder-cart-schemas   (depends on builder-types)
   builder-funnel-schemas (depends on builder-types)
4. builder-cart-plugin    (depends on schemas + ui)
   builder-funnel-plugin  (depends on schemas + ui)
```

## What Gets Published

### Schema packages (`builder-types`, `builder-cart-schemas`, `builder-funnel-schemas`)

These are standard npm packages consumed via `npm install`. They publish:

- **CJS** (`.cjs`) — for Node.js and legacy bundlers
- **ESM** (`.js`) — for modern bundlers
- **Type declarations** (`.d.ts`, `.d.cts`) — for TypeScript consumers

Consumers are primarily the Angular frontend apps and any other service that needs type-safe access to Builder.io model shapes.

### Plugin packages (`builder-cart-plugin`, `builder-funnel-plugin`)

These publish a single **`dist/plugin.system.js`** file — a self-contained SystemJS bundle that Builder.io loads in an iframe. The npm package exists solely to make this file available via CDN (unpkg or jsdelivr). Nobody runs `npm install` on a plugin package.

### CDN URLs

Once published, plugins are accessible at:

```
# unpkg
https://unpkg.com/@goldenhippo/builder-cart-plugin@<version>/dist/plugin.system.js
https://unpkg.com/@goldenhippo/builder-funnel-plugin@<version>/dist/plugin.system.js

# jsdelivr (recommended — faster, global CDN)
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@<version>/dist/plugin.system.js
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-funnel-plugin@<version>/dist/plugin.system.js
```

Replace `<version>` with a specific version (e.g., `1.0.0`) or use `latest` for the most recent release.

## Module Boundary Rules

ESLint enforces dependency rules via Nx tags to prevent circular or unauthorized imports:

| Source tag     | Can depend on                           |
| -------------- | --------------------------------------- |
| `scope:cart`   | `scope:cart`, `scope:shared`            |
| `scope:funnel` | `scope:funnel`, `scope:shared`          |
| `scope:shared` | `scope:shared` only                     |
| `type:plugin`  | `type:plugin`, `type:schema`, `type:ui` |
| `type:schema`  | `type:schema` only                      |
| `type:ui`      | `type:ui` only                          |

These rules are defined in `eslint.config.mjs` and enforced on every `npm run lint`.
