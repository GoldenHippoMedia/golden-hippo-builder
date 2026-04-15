# Funnel Architecture

Design document for the Golden Hippo funnel management system: Builder.io schemas, plugin, and Angular integration points.

## Problem Statement

Golden Hippo manages multiple sales funnels for product "offers" across brands. Funnel configuration (offers, pricing, steps) lives in the internal ERP/CRM system. This plugin bridges that system with Builder.io so designers and developers can build and preview funnel pages without needing ERP access.

The key design principle: **the ERP is the source of truth for funnel structure and pricing**. Builder.io holds the visual pages and acts as a lookup reference (synced from the ERP). The plugin provides tooling to manage the Builder pages that correspond to each funnel step.

## Domain Overview

```
ERP System (Hippo)                      Builder.io
──────────────────                      ──────────
Funnel (Pre-purchase)   ──sync──▶  funnel (data model, lookup reference)
  └── Steps                             └── funnel-page (page model per step)
        step 1 /fp/step-slug-1 ◀──────────── Builder page at /fp/step-slug-1
        step 2 /fp/step-slug-2 ◀──────────── Builder page at /fp/step-slug-2
        ...

Destination             ──sync──▶  funnel-destination (data model)
  └── Default Funnel ref
  └── Optional Split Test
```

### Entities

| Entity      | Builder.io Model     | Kind | Source of Truth | Purpose                                             |
| ----------- | -------------------- | ---- | --------------- | --------------------------------------------------- |
| Funnel      | `funnel`             | data | ERP (synced)    | Lookup reference for funnel metadata + productionId |
| Funnel Page | `funnel-page`        | page | Builder.io      | Visual page for a funnel step at `/fp/[step-slug]`  |
| Destination | `funnel-destination` | data | ERP (synced)    | URL entry point (`/d/[slug]`) routing to a funnel   |

> **Sync job:** An external process syncs `funnel` and `funnel-destination` records from the ERP into Builder.io on a schedule. The plugin does not create these records — it only reads them and uses the `productionId` to fetch full detail from the Hippo API.

> **Pre-purchase only (current):** Post-purchase funnel flow is not yet defined. The plugin currently filters to Pre-purchase funnels only.

## Data Models

### `funnel` (synced from ERP)

A lightweight lookup reference for a funnel. The full step data (including pricing and step structure) is fetched on demand from the Hippo API using `productionId`.

**Fields:**

| Field          | Type    | Required | Notes                                                    |
| -------------- | ------- | -------- | -------------------------------------------------------- |
| `name`         | text    | yes      | Funnel name (e.g., "Control", "Pricing Test v2")         |
| `type`         | select  | yes      | `Pre-purchase` or `Post-purchase`                        |
| `active`       | boolean | no       | Whether the funnel is currently live                     |
| `slug`         | text    | yes      | URL slug (e.g., "control")                               |
| `productionId` | text    | yes      | ERP ID used to fetch full funnel data from the Hippo API |

**Factory:** `createFunnelModel(): ModelShape`

### `funnel-page`

A visual page within a funnel. Matched to funnel steps by URL path: a step with `slug` maps to the Builder page at `/fp/${slug}`. Pages are created by the plugin when needed and edited in the visual editor.

**Fields:**

| Field                 | Type      | Required | Notes                                           |
| --------------------- | --------- | -------- | ----------------------------------------------- |
| `title`               | text      | yes      | Page title                                      |
| `funnel`              | reference | no       | The funnel this page belongs to (optional link) |
| `seo`                 | object    | no       | SEO configuration                               |
| `seo.heading`         | text      | no       | Override page title for SEO                     |
| `seo.description`     | longText  | no       | Meta description                                |
| `seo.image`           | file      | no       | Open Graph image                                |
| `robotsMeta`          | object    | no       | Robots directives                               |
| `robotsMeta.noIndex`  | boolean   | no       | Prevent indexing                                |
| `robotsMeta.noFollow` | boolean   | no       | Prevent link following                          |

**Factory:** `createFunnelPageModel(editUrl: string, funnelModelId: string): ModelShape`

**URL pattern:** Pages are created with `urlPath = /fp/${step.slug}`. The editing URL logic previews at `${editUrl}/fp/preview${targeting.urlPath}`.

### `funnel-destination` (synced from ERP)

The URL entry point for a funnel. Users land on `/d/[slug]` and the app routes to the appropriate funnel.

**Fields:**

| Field                    | Type      | Required | Notes                                                            |
| ------------------------ | --------- | -------- | ---------------------------------------------------------------- |
| `name`                   | text      | yes      | Destination name                                                 |
| `type`                   | select    | yes      | `Pre-purchase` or `Post-purchase`                                |
| `slug`                   | text      | yes      | URL slug — used in `/d/[slug]`                                   |
| `productionId`           | text      | yes      | ERP ID for this destination                                      |
| `description`            | longText  | no       | Optional internal description                                    |
| `defaultFunnel`          | reference | yes      | Reference to the primary funnel for this destination             |
| `splitTest`              | object    | no       | Optional split test configuration                                |
| `splitTest.name`         | text      | no       | Split test name                                                  |
| `splitTest.productionId` | text      | no       | ERP ID of the split test                                         |
| `splitTest.slug`         | text      | no       | Split test slug                                                  |
| `splitTest.options`      | list      | no       | Split test variants with funnel reference and traffic allocation |

**Factory:** `createFunnelDestinationModel(funnelModelId: string): ModelShape`

## Shared Product Models (`builder-shared-schemas`)

Product-related models live in `@goldenhippo/builder-shared-schemas` — a published npm package that both `builder-cart-schemas` and `builder-funnel-schemas` depend on.

**Models in `builder-shared-schemas`** (5 models):

| Model                | Factory                       | Purpose                 |
| -------------------- | ----------------------------- | ----------------------- |
| `product`            | `createProductModel(...)`     | Product catalog entries |
| `product-category`   | `createCategoryModel()`       | Product categories      |
| `product-tag`        | `createProductTagModel()`     | Product tags            |
| `product-ingredient` | `createIngredientsModel()`    | Product ingredients     |
| `product-use-case`   | `createProductUseCaseModel()` | Product use cases       |

## Model Creation Phases

The funnel plugin provisions models on first save (settings dialog → "Save & Sync Models").

```
Phase 1 — Independent shared models (check-or-create)
  ├── product-ingredient
  ├── product-category
  ├── product-tag
  └── product-use-case

Phase 2 — Product (depends on Phase 1)
  └── product

Phase 3 — Funnel Page (independent)
  └── funnel-page

Phase 4 — Funnel (independent)
  └── funnel

Phase 5 — Destination (depends on Phase 4: funnel)
  └── funnel-destination
```

## Plugin Settings

| Setting                   | Type     | Purpose                                                       |
| ------------------------- | -------- | ------------------------------------------------------------- |
| `editUrl`                 | text     | Funnel site URL for page preview links                        |
| `apiUrl`                  | text     | Hippo Commerce API base URL                                   |
| `apiUser`                 | text     | API credentials                                               |
| `apiPassword`             | password | API credentials                                               |
| `privateApiKey`           | password | Builder.io private API key for write operations               |
| `builderCartPublicApiKey` | text     | Cart space public key for cross-space product sync (advanced) |

## Plugin UI

### Dashboard (Home)

Overview stats: active pre-purchase funnels, destinations, and funnel pages. Quick links to the Funnels and Destinations sections.

### Funnels (Pre-Purchase)

The main developer workflow. Shows all Pre-purchase funnels synced from Hippo.

**Search:** Filter by name, slug, or production ID.

**Funnel list columns:**

- Name, Slug, Production ID, Page count (pages linked to this funnel), Active status

**Selecting a funnel → Funnel Detail view:**

1. Fetches full funnel data from the Hippo API (steps, pricing, purchase options) using `productionId`
2. Shows a summary: slug, production ID, step count, Builder page count
3. Shows purchase options table (SKU, product name, price, quantity, subscription type)
4. Shows the steps table with Builder page status

**Steps table columns:**

- Step number, Step name (+ GEP if set), Page type, URL (`/fp/[slug]`), Builder Page status, Action

**Builder Page status:**

- `Created` (green badge) — a `funnel-page` with `urlPath = /fp/[step.slug]` exists
- `Missing` (yellow badge) — no Builder page exists for this step yet

**Actions (role-aware):**

| Role      | Funnel Status | Step has page                      | Step missing page        |
| --------- | ------------- | ---------------------------------- | ------------------------ |
| Admin     | Any           | "Edit Page" → opens Builder editor | "Create Page" button     |
| Non-admin | Inactive      | "Edit Page" → opens Builder editor | "Create Page" button     |
| Non-admin | Active        | "View Page" → opens Builder editor | — (read-only, no create) |

**"Create All Missing Pages" / "Create Missing Pages" button:**

- Appears in the header and steps section when there are missing pages and `canEdit = true`
- Requires typing "CREATE" to confirm
- Creates all missing pages sequentially, then refreshes

**Read-only warning:**

- Non-admins viewing an active funnel see an alert: "This funnel is active in production. Pages are shown in read-only mode."

### Destinations

Lists all synced destinations with name, slug, default funnel, active status, and split test info. Click to view/edit a destination record.

## Hippo API Integration

The plugin calls the Hippo Commerce API to retrieve full funnel details on demand. Authentication uses Basic auth (configured in plugin settings).

**Endpoints used:**

| Method | Path                     | Purpose                                |
| ------ | ------------------------ | -------------------------------------- |
| GET    | `/funnel/{id}`           | Get full funnel with steps and pricing |
| GET    | `/funnel/gep/{gep}`      | Get funnel by GEP slug                 |
| GET    | `/destination/{id}`      | Get destination details                |
| GET    | `/destination/gep/{gep}` | Get destination by GEP slug            |

The `HippoFunnel` response includes:

- `id`, `name`, `type`, `active`, `slug`
- `steps[]` — ordered step list with `stepNumber`, `slug`, `pageType`, `name`, `gep`
- `prePurchaseOptions[]` — purchase options with SKU, pricing, subscription info (Pre-purchase funnels only)

## Angular App Integration

The Angular funnel app consumes `@goldenhippo/builder-funnel-schemas` for type-safe Builder.io queries.

### Request Flow

```
User hits /d/my-destination-slug
         │
         ▼
Query funnel-destination where slug = "my-destination-slug"
         │
         ▼
Has split test?
  ├── No  → use destination.defaultFunnel
  └── Yes → check session cookie for existing assignment
            ├── Found → use stored funnel ID
            └── Not found → randomly select from split test options
                            → store funnel ID in session cookie
         │
         ▼
Fetch full funnel from Hippo API (or Builder content for step-page mapping)
         │
         ▼
For each step: load funnel-page content at /fp/[step.slug]
         │
         ▼
Render funnel flow: step 1 → step 2 → ... → checkout
```

### Direct Funnel Access

Developers can preview funnels directly at `/fp/preview/[step-slug]`:

```
Builder funnel-page editingUrlLogic:
return `${editUrl}/fp/preview${targeting.urlPath}?builder.preview=true&builder.frameEditing=true`
```

## Package Responsibilities

### `@goldenhippo/builder-funnel-schemas`

All funnel model factory functions and TypeScript content types.

| Export Subpath | Contents                                                                      |
| -------------- | ----------------------------------------------------------------------------- |
| `./data`       | `createFunnelModel`, `createFunnelDestinationModel` + `Builder*Content` types |
| `./page`       | `createFunnelPageModel`, `BuilderFunnelPageContent`                           |
| `.`            | Re-exports all of the above + product factories from shared-schemas           |

### `@goldenhippo/builder-funnel-plugin`

The Builder.io editor plugin tab. Handles model provisioning and provides the funnel page management UI.

**Core services:**

- `BuilderApi` — Builder.io content CRUD (fetches funnels, destinations, funnel-pages; creates pages)
- `HippoApi` — Hippo Commerce API calls (fetches full funnel data with steps and pricing)
- `UserManagementService` — extracts user context and API credentials from Builder.io plugin settings
- `ModelSyncService` — provisions all models on plugin settings save

## Open Questions

1. **Post-purchase flow:** Post-purchase funnel step URLs and page structure not yet defined. Plugin currently hides post-purchase funnels. Will need a similar step → Builder page workflow when ready.

2. **Funnel page ↔ funnel reference:** Pages are currently created without an explicit `funnel` reference field. The link is implied by URL path. Should we populate the `funnel` reference field on creation for easier filtering in Builder's content list?

3. **Split test analytics:** Assignment tracking only. Confirm whether analytics metadata should be stored on split test records or sourced entirely from an external analytics system.

4. **Multi-locale support:** Funnel pages support localized fields. Confirm which fields need localization for brand requirements.
