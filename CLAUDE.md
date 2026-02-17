# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install                    # Install all workspace dependencies
npm run build                  # Build all packages (Nx dependency order: schemas → ui → plugins)
npm run build:schemas          # Build only builder-cart-schemas
npm run build:funnel-schemas   # Build only builder-funnel-schemas
npm run build:plugin           # Build only builder-cart-plugin (auto-builds deps)
npm run build:funnel-plugin    # Build only builder-funnel-plugin (auto-builds deps)
npm run dev:plugin             # Start cart plugin dev server (http://localhost:1268)
npm run dev:funnel-plugin      # Start funnel plugin dev server (http://localhost:1269)
npm run typecheck              # Type-check all packages
npm run lint                   # Lint all packages
npm run test                   # Run tests across all packages (vitest)
npm run format                 # Format all files (prettier)
npm run format:check           # Check formatting without writing
npx changeset                  # Add a changeset (interactive)
npm run version-packages       # Apply changeset version bumps (CI does this)
npm run release                # Build + publish to npm (CI does this)
```

Nx caches build/typecheck/lint/test results. Build targets respect `dependsOn: ["^build"]`. No `project.json` files — Nx configuration lives in each package's `package.json` under the `"nx"` key.

## Architecture

**Nx monorepo with npm workspaces** for Golden Hippo's Builder.io integration. Six packages across two product scopes (cart and funnel) plus shared libraries (types and UI).

### Dependency Flow

```
builder-cart-plugin    → builder-cart-schemas + builder-types + builder-ui
builder-funnel-plugin  → builder-funnel-schemas + builder-cart-schemas + builder-ui
builder-cart-schemas   → builder-types
builder-funnel-schemas → builder-types
Angular apps           → builder-cart-schemas (npm install)
```

ESLint enforces module boundaries via Nx tags:

- `scope:cart` can depend on `scope:cart` + `scope:shared`
- `scope:funnel` can depend on `scope:funnel` + `scope:shared`
- `scope:shared` can only depend on `scope:shared`
- `type:plugin` can depend on `type:schema` + `type:ui`
- `type:schema` and `type:ui` can only depend on their own type

### `@goldenhippo/builder-types` (publishable to npm, shared)

Shared Builder.io type definitions used by both schema packages. Extracted to deduplicate `ModelShape`, `BuilderResponseBaseData`, and `BuilderIOFieldTypes`.

- **`src/builder.types.ts`** — `ModelShape`, `BuilderResponseBaseData`, `BuilderIOFieldTypes` (field type union with interfaces for text, file, reference, list, object, number, select, tags, uiBlocks)
- Built with **tsup** → dual CJS/ESM + declarations
- **1 export subpath:** `.`
- Tags: `scope:shared`, `type:schema`

### `@goldenhippo/builder-cart-schemas` (publishable to npm)

Builder.io model definitions and TypeScript content types for all 13 cart/commerce models. Each model exports a **factory function** (`createXxxModel(...)`) returning a `ModelShape` object (Builder.io field definitions for the API) plus an inferred **TypeScript content type** (`BuilderXxxContent`).

- **`src/data/`** — 10 data models: product, product-category, product-tag, product-ingredient, product-use-case, product-group, product-grid-filter-group, blog-category, blog-comment, brand-config (composed from `brand-config/sections/`: general, header, footer, feature, support, page, cookie configs)
- **`src/section/`** — 2 component models: default-website-section, site-banner
- **`src/page/`** — 1 page model with discriminated union types: `BuilderPageContent` (union of `BuilderGeneralPageContent`, `BuilderPdpPageContent`, `BuilderBlogPageContent`)
- **`src/types/`** — Re-exports from `@goldenhippo/builder-types` (internal convenience for model files)
- Built with **tsup** → dual CJS/ESM + declarations
- **4 export subpaths:** `.`, `./data`, `./section`, `./page`
- Tags: `scope:cart`, `type:schema`

### `@goldenhippo/builder-funnel-schemas` (publishable to npm)

Builder.io model definitions and TypeScript content types for funnel models. Same structure and build setup as builder-cart-schemas but scoped to funnel workflows.

- **`src/data/`**, **`src/section/`**, **`src/page/`** — Placeholder directories (models will be added as funnel features are implemented)
- **`src/types/`** — Re-exports from `@goldenhippo/builder-types` (internal convenience for model files)
- Built with **tsup** → dual CJS/ESM + declarations
- **4 export subpaths:** `.`, `./data`, `./section`, `./page`
- Tags: `scope:funnel`, `type:schema`

### `@goldenhippo/builder-ui` (private, shared)

React component library with Tailwind v4 + DaisyUI v5 styling. Shared across all Builder.io plugins.

- **`src/components/`** — 7 components: LoadingSection, StatGridCard, StatGridContainer, StarRating, Slider, PageCard, PageNotFound
- **`src/styles/styles.css`** — Tailwind v4 + DaisyUI with custom `ghippo` (dark) and `ghippolight` (light) themes, scoped to `#hippo-app`
- Built with **tsup** → ESM only + declarations. No CSS processing — consuming apps run Tailwind.
- **2 export subpaths:** `.` (components), `./styles` (raw CSS)
- Tags: `scope:shared`, `type:ui`

### `@goldenhippo/builder-cart-plugin` (private)

React 18 plugin running inside Builder.io's editor iframe. Manages pages, products, blogs, comments, and brand config for cart/commerce sites.

- **`src/plugin.ts`** — Entry point: registers plugin settings (brand, editUrl, apiUrl, credentials), appTab, 8-phase model auto-creation on save
- **`src/application/`** — App shell (`AppCore` with MobX state + cookie routing, `HippoCMSManager` wrapper) and page components: Home (dashboard), PageManager (pages with search/filter/validation), Products (catalog table), Blogs (blog grid), Comments (comment management with approve/reject), Settings (user profile), Admin (placeholder)
- **`src/components/`** — PageDetailsDialog, PageDetailsComponent, ProductDetailsModal, ProductPricingTable, BlogCommentList, CommentReplyModal
- **`src/core/models/`** — `BuilderHelper` singleton orchestrating all 13 model definitions. Factory functions are imported from builder-cart-schemas.
- **`src/services/`** — `BuilderApi` (paginated Builder.io content fetching), `CommerceApi` (product feed + brand settings via Hippo Commerce API), `UserManagementService` (extracts user context from Builder.io)
- **`src/utils/`** — `Utils` class (page/comment parsing, product lookup), `Validator` class (general/blog/PDP validation with issue/warning enums)
- **`src/interfaces/`** — `ExtendedApplicationContext` extending Builder.io's `ApplicationContext` with plugin-specific types
- Built with **Webpack 5** → `plugin.system.js` (SystemJS format, port 1268). Externals: react, mobx, @builder.io/\*, @material-ui/\*
- Tags: `scope:cart`, `type:plugin`

**Path Aliases:** `@application/*`, `@components/*`, `@core/*`, `@services/*`, `@utils/*` — configured in both `tsconfig.json` and `webpack.config.js`.

### `@goldenhippo/builder-funnel-plugin` (private)

React 18 plugin for funnel websites inside Builder.io. Early stage — placeholder UI with "Coming Soon" cards for funnel pages and configuration.

- **`src/plugin.ts`** — Entry point: registers plugin settings (editUrl), appTab ("Hippo Funnels")
- **`src/App.tsx`** — Single-file app with placeholder UI (no sub-directories yet)
- **`src/styles.css`** — Imports builder-ui styles, Tailwind v4 `@source` directives
- Built with **Webpack 5** → `plugin.system.js` (SystemJS format, port 1269). Same externals as cart plugin.
- Tags: `scope:funnel`, `type:plugin`

## Adding a New Builder.io Model

### In a schema package (e.g., builder-cart-schemas)

1. Create `src/data/<model-name>.model.ts` (or `src/section/` for component models, `src/page/` for page models)
   - Export a factory function (`createXxxModel(...)`) returning a `ModelShape` object
   - Export a TypeScript content type (`BuilderXxxContent`)
2. Re-export from the appropriate barrel: `src/data/index.ts`, `src/section/index.ts`, or `src/page/index.ts`
3. Re-export from `src/index.ts`

### In the plugin (e.g., builder-cart-plugin)

1. Import the factory function from the schema package in `src/core/models/builder-helper.ts`
2. Add the model to the `BuilderHelper` class
3. Wire into the model creation phases in `src/plugin.ts` (`setHippoModels()`)

## Publishing & Versioning

Uses **Changesets** for versioning and **public npm** for distribution. All packages except `builder-ui` are published.

- **Schema packages** (`builder-types`, `builder-cart-schemas`, `builder-funnel-schemas`) are installed via `npm install`
- **Plugin packages** (`builder-cart-plugin`, `builder-funnel-plugin`) are published to npm and served via **jsdelivr CDN** for Builder.io to load:
  - `https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@<version>/dist/plugin.system.js`
- **Linked versions**: schema packages (`builder-types`, `builder-cart-schemas`, `builder-funnel-schemas`) share the same version number
- CI workflow: merge to `main` → changesets action creates "Version Packages" PR → merge that PR → publishes to npm
- Full docs: `wiki/versioning-and-publishing.md`

## Tech Stack

- **Node >=20**, **npm 10**, **TypeScript 5.7** (ES2022 target)
- **Nx 22.5** for monorepo orchestration and caching
- **Changesets** for versioning and npm publishing
- **React 18.3** + **MobX 6** (mobx-react) in plugins
- **Webpack 5** with SystemJS output for plugins
- **tsup** for library builds (schema packages, builder-ui)
- **Tailwind CSS v4** + **DaisyUI v5** for styling
- **ESLint 9** (flat config) with Nx module boundary enforcement
- **Prettier 3.8** (singleQuote, trailingComma: all, printWidth: 120)
- **react-icons** (hi2 set) for icons
- **Vitest** for testing

## Plugin Development Workflow

1. `npm run dev:plugin` — starts cart plugin dev server on port 1268
2. `npm run dev:funnel-plugin` — starts funnel plugin dev server on port 1269
3. In Builder.io: Settings → Plugins → Add Plugin → `http://localhost:<port>/plugin.system.js`
4. Cart plugin settings: brand name, editUrl, apiUrl, apiUser, apiPassword
5. Funnel plugin settings: editUrl
6. Saving settings auto-provisions models via Builder.io API
