# @goldenhippo/builder-cart-plugin

React 18 plugin running inside Builder.io's editor iframe. Manages pages, products, blogs, comments, and brand configuration for Golden Hippo cart/commerce sites.

## Table of Contents

- [Features](#features)
- [Installation in Builder.io](#installation-in-builderio)
  - [Development](#development)
  - [Production (CDN)](#production-cdn)
- [Plugin Settings](#plugin-settings)
- [Architecture](#architecture)
  - [Entry Point](#entry-point)
  - [Application](#application)
  - [Core](#core)
  - [Services](#services)
- [Path Aliases](#path-aliases)
- [Development Commands](#development-commands)

## Features

- **Dashboard** — overview of content across all models
- **Page Manager** — create, search, filter, and validate pages (General, PDP, Blog)
- **Products** — browse product catalog from Hippo Commerce API
- **Blogs** — manage blog content with category filtering
- **Comments** — approve/reject blog comments
- **Settings** — user profile and plugin configuration
- **Auto-provisioning** — automatically creates all 13 Builder.io models on settings save

## Installation in Builder.io

### Development

1. Start the dev server:
   ```bash
   npm run dev:plugin    # http://localhost:1268
   ```
2. In Builder.io: **Settings > Plugins > Add Plugin**
3. Enter URL: `http://localhost:1268/plugin.system.js`

### Production (CDN)

After publishing, use the jsdelivr CDN URL:

```
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@<version>/dist/plugin.system.js
```

## Plugin Settings

| Setting      | Description                         |
| ------------ | ----------------------------------- |
| Brand        | Brand name for multi-brand support  |
| Edit URL     | Frontend site URL for page previews |
| API URL      | Hippo Commerce API base URL         |
| API User     | Commerce API username               |
| API Password | Commerce API password               |

Saving settings triggers auto-provisioning of all 13 Builder.io models via the API.

## Architecture

### Entry Point

`src/plugin.ts` — registers plugin settings, the app tab ("Hippo CMS"), and the 8-phase model auto-creation flow on settings save.

### Application

`src/application/` — app shell and page components:

- `AppCore` — MobX state management with cookie-based routing
- `HippoCMSManager` — wrapper component
- Pages: Home, PageManager, Products, Blogs, Comments, Settings, Admin

### Core

`src/core/models/` — `BuilderHelper` singleton that orchestrates all 13 model definitions. Factory functions are imported from `@goldenhippo/builder-cart-schemas`.

### Services

`src/services/` — API clients:

- `BuilderApi` — paginated Builder.io content fetching
- `CommerceApi` — product feed and brand settings via Hippo Commerce API
- `UserManagementService` — extracts user context from Builder.io

## Path Aliases

Configured in both `tsconfig.json` and `webpack.config.js`:

| Alias            | Path               |
| ---------------- | ------------------ |
| `@application/*` | `src/application/` |
| `@components/*`  | `src/components/`  |
| `@core/*`        | `src/core/`        |
| `@services/*`    | `src/services/`    |
| `@utils/*`       | `src/utils/`       |

## Development Commands

```bash
npm run dev:plugin   # Start dev server on port 1268
npm run build:plugin # Production build
npm run typecheck    # Type-check with tsc
npm run lint         # Lint with eslint
```
