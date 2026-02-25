# Funnel Architecture

Design document for the Golden Hippo funnel management system: Builder.io schemas, plugin, and Angular integration points.

## Problem Statement

Golden Hippo manages multiple sales funnels for product "offers" across brands. These funnels are combinations of landing pages, video sales letters, coupon pages, surveys, and offer selectors. Funnel configuration currently lives in Salesforce, and linking pages/settings to funnels in the Angular commerce app is tedious, error-prone, and leads to extensive content duplication. Even basic changes require long development cycles.

This system moves funnel configuration into Builder.io, where:

- Content teams manage funnel pages visually
- Offers, pricing, and funnel structure are defined as structured data models
- A/B testing is built in via split tests on destinations
- The Angular app queries Builder.io for everything it needs to render a funnel

## Domain Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            FUNNEL SYSTEM                                │
│                                                                         │
│  Product ──┐                                                            │
│  Product ──┼──▶ Offer ──▶ Funnel (control) ──▶ Destination ◀── Split   │
│  Product ──┘      │       Funnel (variant A)        │          Test     │
│                   │       Funnel (variant B) ◀──────┘                   │
│                   │                │                                     │
│                   │          ┌─────┴──────┐                             │
│                   │          │   Steps    │                             │
│                   │          │ 1. Survey  │──▶ Funnel Page              │
│                   │          │ 2. VSL     │──▶ Funnel Page              │
│                   │          │ 3. Coupon  │──▶ Funnel Page              │
│                   │          │ 4. Offer   │──▶ Funnel Page              │
│                   │          └────────────┘                             │
│                   │                                                     │
│  Offer.isDefaultOffer = true                                            │
│  (fallback for not-found)                                               │
└──────────────────────────────────────────────────────────────────────────┘
```

### Entities

| Entity      | Builder.io Model     | Kind | Purpose                                                                   |
| ----------- | -------------------- | ---- | ------------------------------------------------------------------------- |
| Product     | `product`            | data | Shared with cart — the same product catalog                               |
| Offer       | `funnel-offer`       | data | Groups 1+ products with default pricing tiers                             |
| Funnel      | `funnel`             | data | A specific path through pages for an offer, with pricing and steps        |
| Funnel Page | `funnel-page`        | page | A visual page within a funnel (survey, VSL, coupon, offer selector, etc.) |
| Destination | `funnel-destination` | data | URL entry point (`/d/[slug]`) that routes to a funnel                     |
| Split Test  | `funnel-split-test`  | data | A/B test splitting traffic across funnel variants on a destination        |

> **Default offer fallback:** Instead of a separate config model, the `funnel-offer` model includes an `isDefaultOffer` boolean. The app queries for the first offer with this flag set. Plugin validation is best-effort — if multiple are flagged, the first one found wins.

## Shared Product Models (`builder-shared-schemas`)

Product-related models live in `@goldenhippo/builder-shared-schemas` — a published npm package that both `builder-cart-schemas` and `builder-funnel-schemas` depend on. Products are the same entities across cart and funnel contexts, so a single source of truth avoids duplication.

**Models in `builder-shared-schemas`** (5 models):

| Model                | Factory                       | Purpose                 |
| -------------------- | ----------------------------- | ----------------------- |
| `product`            | `createProductModel(...)`     | Product catalog entries |
| `product-category`   | `createCategoryModel()`       | Product categories      |
| `product-tag`        | `createProductTagModel()`     | Product tags            |
| `product-ingredient` | `createIngredientsModel()`    | Product ingredients     |
| `product-use-case`   | `createProductUseCaseModel()` | Product use cases       |

Both `builder-cart-schemas` and `builder-funnel-schemas` re-export these factories and content types for consumer convenience. The cart plugin continues to `import { createProductModel } from '@goldenhippo/builder-cart-schemas'` with no changes. The funnel plugin imports from `@goldenhippo/builder-funnel-schemas`.

**Same-instance compatibility:** When cart and funnel plugins are installed in the same Builder.io instance, both use the same `product` model (and its dependencies). The funnel plugin's model creation checks for existing models before creating:

```
if model "product" exists → use existing ID
else → create product model (and its dependencies)
```

All funnel-specific models use a `funnel-` prefix to avoid any naming collision with cart models.

### Product Model Addition: `servingsPerUnit`

The product model gains a new field:

| Field             | Type   | Required | Notes                                                                                                                                                                                                    |
| ----------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `servingsPerUnit` | number | no       | Typical number of servings (or doses, days of supply, etc.) per unit. Used to auto-calculate default subscription frequency: `servingsPerUnit * quantity` days. Falls back to 30 days when not provided. |

This field lives in `builder-shared-schemas` and is available to both scopes. Example: a 30-serving jar has `servingsPerUnit: 30`. An offer with quantity 3 auto-suggests a subscription frequency of 90 days.

## Data Models

### `funnel-offer`

An Offer represents a purchasable product (or product selection) with default pricing tiers. Most offers are 1:1 with a product. Multi-product offers (e.g., three flavors) let the customer choose.

**Fields:**

| Field                                               | Type                  | Required | Notes                                                                                                                                             |
| --------------------------------------------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `displayName`                                       | text                  | yes      | Customer-facing offer name                                                                                                                        |
| `featuredImage`                                     | file                  | no       | Primary image for the offer                                                                                                                       |
| `description`                                       | longText              | no       | Offer description                                                                                                                                 |
| `products`                                          | list                  | yes      | One or more product references                                                                                                                    |
| `products[].product`                                | reference → `product` | yes      | Link to product model                                                                                                                             |
| `products[].displayName`                            | text                  | no       | Override name in offer context (e.g., flavor name)                                                                                                |
| `selectionLabel`                                    | text                  | no       | Label for product chooser (e.g., "Choose your flavor")                                                                                            |
| `defaultPricing`                                    | list                  | yes      | Pricing tiers copied to new funnels                                                                                                               |
| `defaultPricing[].quantity`                         | number                | yes      | Purchase quantity (e.g., 1, 3, 6)                                                                                                                 |
| `defaultPricing[].label`                            | text                  | no       | Tier label (e.g., "Best Value", "Most Popular")                                                                                                   |
| `defaultPricing[].isMostPopular`                    | boolean               | no       | Highlights this tier in UI                                                                                                                        |
| `defaultPricing[].standardPrice`                    | number                | yes      | One-time purchase price                                                                                                                           |
| `defaultPricing[].subscriptionPrice`                | number                | no       | Subscription price                                                                                                                                |
| `defaultPricing[].defaultSubscriptionFrequencyDays` | number                | no       | Default frequency in days. Auto-calculated from `product.servingsPerUnit * quantity` when available, otherwise defaults to 30. Can be overridden. |
| `isDefaultOffer`                                    | boolean               | no       | When true, this is the global default offer used as fallback for not-found scenarios. First flagged offer wins if multiple are set.               |
| `name`                                              | text                  | yes      | Internal name (not localized)                                                                                                                     |
| `gh`                                                | object                | no       | Integration data                                                                                                                                  |
| `gh.slug`                                           | text                  | no       | Unique slug for cross-environment sync                                                                                                            |

**Factory:** `createFunnelOfferModel(productModelId: string): ModelShape`

### `funnel`

A Funnel is a specific sequence of pages tied to an Offer. Each Offer has one control funnel and zero or more variant funnels. Pricing on the funnel is the complete, resolved pricing (initialized from the offer's defaults or copied from the control, then customized).

**Fields:**

| Field                                                                 | Type                       | Required | Notes                                                                        |
| --------------------------------------------------------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------- |
| `name`                                                                | text                       | yes      | Funnel name (e.g., "Control", "Pricing Test v2")                             |
| `offer`                                                               | reference → `funnel-offer` | yes      | The offer this funnel belongs to                                             |
| `isControl`                                                           | boolean                    | no       | Whether this is the control funnel for its offer                             |
| `status`                                                              | select                     | yes      | `draft`, `active`, `paused`, `archived`                                      |
| `pricing`                                                             | list                       | yes      | Resolved pricing tiers for this funnel                                       |
| `pricing[].quantity`                                                  | number                     | yes      | Purchase quantity                                                            |
| `pricing[].label`                                                     | text                       | no       | Tier label                                                                   |
| `pricing[].isMostPopular`                                             | boolean                    | no       | Highlighted tier                                                             |
| `pricing[].standardPrice`                                             | number                     | yes      | One-time purchase price                                                      |
| `pricing[].subscriptionPrice`                                         | number                     | no       | Subscription price                                                           |
| `pricing[].defaultSubscriptionFrequencyDays`                          | number                     | no       | Default subscription frequency (days)                                        |
| `pricing[].availableSubscriptionFrequencies`                          | list                       | no       | All frequency options offered to customer                                    |
| `pricing[].availableSubscriptionFrequencies[].frequencyDays`          | number                     | yes      | Frequency option in days                                                     |
| `pricing[].checkoutFeatures`                                          | object                     | no       | Per-tier checkout configuration                                              |
| `pricing[].checkoutFeatures.tryBeforeYouBuy`                          | object                     | no       | TBYB settings                                                                |
| `pricing[].checkoutFeatures.tryBeforeYouBuy.enabled`                  | boolean                    | no       | Whether TBYB is available                                                    |
| `pricing[].checkoutFeatures.tryBeforeYouBuy.upfrontCost`              | number                     | no       | Upfront charge for TBYB                                                      |
| `pricing[].checkoutFeatures.installmentPayments`                      | object                     | no       | Installment settings                                                         |
| `pricing[].checkoutFeatures.installmentPayments.enabled`              | boolean                    | no       | Whether installments are available                                           |
| `pricing[].checkoutFeatures.installmentPayments.numberOfInstallments` | number                     | no       | Number of payments                                                           |
| `pricing[].checkoutFeatures.installmentPayments.installmentAmount`    | number                     | no       | Per-installment charge                                                       |
| `steps`                                                               | list                       | yes      | Ordered funnel step sequence                                                 |
| `steps[].stepType`                                                    | select                     | yes      | `landing`, `survey`, `vsl`, `coupon`, `offer-selector`, `checkout`, `custom` |
| `steps[].label`                                                       | text                       | no       | Display label for this step                                                  |
| `steps[].page`                                                        | reference → `funnel-page`  | no       | Builder.io page for this step                                                |
| `gh`                                                                  | object                     | no       | Integration data                                                             |
| `gh.slug`                                                             | text                       | no       | Funnel GEP — direct access at `/f/[slug]`                                    |

**Factory:** `createFunnelModel(offerModelId: string, funnelPageModelId: string): ModelShape`

### `funnel-page`

A visual page within a funnel. Uses Builder.io's page model (`kind: 'page'`) so content is edited in the visual editor. Each funnel step references one of these pages. When creating a funnel variant from a control, the plugin copies each page.

**Fields:**

| Field                 | Type     | Required | Notes                                                            |
| --------------------- | -------- | -------- | ---------------------------------------------------------------- |
| `title`               | text     | yes      | Page title                                                       |
| `pageType`            | select   | yes      | `landing`, `survey`, `vsl`, `coupon`, `offer-selector`, `custom` |
| `seo`                 | object   | no       | SEO configuration                                                |
| `seo.heading`         | text     | no       | Override page title for SEO                                      |
| `seo.description`     | longText | no       | Meta description                                                 |
| `seo.image`           | file     | no       | Open Graph image                                                 |
| `robotsMeta`          | object   | no       | Robots directives                                                |
| `robotsMeta.noIndex`  | boolean  | no       | Prevent indexing                                                 |
| `robotsMeta.noFollow` | boolean  | no       | Prevent link following                                           |

**Factory:** `createFunnelPageModel(editUrl: string): ModelShape`

**Editing URL logic:** `return \`${editUrl}/f/preview${targeting.urlPath}?builder.preview=true&builder.frameEditing=true\``

### `funnel-destination`

A Destination is the URL entry point for the Angular app. Users land on `/fst/[slug]` and the app loads the destination's primary funnel (or randomly assigns a funnel via split test).

**Fields:**

| Field                  | Type                       | Required | Notes                                                 |
| ---------------------- | -------------------------- | -------- | ----------------------------------------------------- |
| `name`                 | text                       | yes      | Destination name                                      |
| `slug`                 | text                       | yes      | URL slug — unique, used in `/fst/[slug]`              |
| `offer`                | reference → `funnel-offer` | yes      | The offer for this destination                        |
| `primaryFunnel`        | reference → `funnel`       | yes      | Default funnel (typically the control)                |
| `followControlUpdates` | boolean                    | no       | Auto-swap primary funnel when offer's control changes |
| `status`               | select                     | yes      | `active`, `inactive`                                  |

**Factory:** `createFunnelDestinationModel(offerModelId: string, funnelModelId: string): ModelShape`

### `funnel-split-test`

A Split Test assigns multiple funnel variants to a Destination for A/B testing. Traffic is evenly split. Only one split test can be active per destination at a time. When a visitor lands on a destination with an active split test, a funnel is randomly selected and stored in a session cookie so subsequent visits use the same funnel.

**Fields:**

| Field               | Type                             | Required | Notes                                        |
| ------------------- | -------------------------------- | -------- | -------------------------------------------- |
| `name`              | text                             | yes      | Test name (e.g., "Pricing Test Jan 2026")    |
| `destination`       | reference → `funnel-destination` | yes      | The destination running this test            |
| `status`            | select                           | yes      | `draft`, `running`, `completed`, `cancelled` |
| `variants`          | list                             | yes      | Funnel variants in the test                  |
| `variants[].funnel` | reference → `funnel`             | yes      | A funnel variant                             |
| `variants[].label`  | text                             | no       | Label (e.g., "Control", "Variant A")         |

**Factory:** `createFunnelSplitTestModel(destinationModelId: string, funnelModelId: string): ModelShape`

## Model Creation Phases

The funnel plugin provisions models in dependency order on first save, mirroring the cart plugin's phase pattern. In a same-instance installation, phases 1-2 detect existing cart models and skip creation.

```
Phase 1 — Independent (check-or-create, shared with cart)
  ├── product-ingredient
  ├── product-category
  ├── product-tag
  └── product-use-case

Phase 2 — Product (depends on Phase 1, shared with cart)
  └── product

Phase 3 — Funnel Page (independent of product)
  └── funnel-page

Phase 4 — Offer (depends on Phase 2: product)
  └── funnel-offer

Phase 5 — Funnel (depends on Phase 3 + 4: funnel-page, funnel-offer)
  └── funnel

Phase 6 — Destination (depends on Phase 4 + 5: funnel-offer, funnel)
  └── funnel-destination

Phase 7 — Split Test (depends on Phase 5 + 6: funnel, funnel-destination)
  └── funnel-split-test
```

## Package Responsibilities

### `@goldenhippo/builder-shared-schemas`

Shared product-related model factories and content types. Published to npm with linked versioning alongside the other schema packages.

- **`src/data/`** — 5 models: product, product-category, product-tag, product-ingredient, product-use-case
- Built with **tsup** → dual CJS/ESM + declarations
- **2 export subpaths:** `.`, `./data`
- Tags: `scope:shared`, `type:schema`
- Dependencies: `@goldenhippo/builder-types`

### `@goldenhippo/builder-funnel-schemas`

All funnel model factory functions and TypeScript content types. Depends on `@goldenhippo/builder-shared-schemas` for product models (not cart-schemas).

**New exports:**

| Export Subpath | Contents                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `./data`       | `createFunnelOfferModel`, `createFunnelModel`, `createFunnelDestinationModel`, `createFunnelSplitTestModel` + all `Builder*Content` types |
| `./page`       | `createFunnelPageModel`, `BuilderFunnelPageContent`                                                                                       |
| `.`            | Re-exports all of the above + re-exports product factories from shared-schemas                                                            |

### `@goldenhippo/builder-funnel-plugin`

The Builder.io editor plugin. Handles model provisioning, provides the management UI, and orchestrates funnel operations (copy control, page duplication, etc.).

**Plugin settings:**

| Setting       | Type     | Purpose                           |
| ------------- | -------- | --------------------------------- |
| `editUrl`     | text     | Funnel site URL for page previews |
| `apiUrl`      | text     | Hippo Commerce API URL            |
| `apiUser`     | text     | API credentials                   |
| `apiPassword` | password | API credentials                   |

**CTA:** "Save & Create Models" (triggers model provisioning)

## Plugin UI Sections

### Dashboard (Home)

Overview stats: total offers, active funnels, active destinations, running split tests. Quick links to recent items.

### Offers

CRUD for offers. Each offer card shows linked products, pricing tier count, and number of funnels. Editing an offer lets you manage the product list, set default pricing tiers, and view all funnels for the offer.

### Funnels

Filtered by offer. Shows control badge and status for each funnel. The primary workflow for creating a variant:

```
1. Select Offer
2. "Create Funnel" → "Copy from Control?" (default: Yes)
   ├── Yes → Name the variation
   │         → "Retain Control Pricing?" (default: Yes)
   │         │   ├── Yes → Confirm steps/pages list → Create
   │         │   └── No  → Configure pricing & checkout features → Confirm → Create
   │         └── Plugin copies control pages and creates funnel with references
   └── No  → Full funnel builder flow (select pages, configure steps)
```

On creation, the plugin:

1. Creates the `funnel` content entry with pricing and steps
2. For each step with a page reference in the source funnel, duplicates the `funnel-page` content via the Builder.io API
3. Updates the new funnel's step references to point to the duplicated pages
4. Navigates to the funnel detail view

### Funnel Detail

Shows funnel metadata, pricing table with checkout features, and an ordered list of steps. Each step shows its type, label, and page link. Clicking a page opens it in the Builder.io visual editor.

### Destinations

CRUD for destinations. Each destination shows its slug, linked offer, primary funnel, and whether a split test is running. Creating a destination:

1. Name the destination
2. Provide the slug (validated for uniqueness)
3. Select the offer
4. Primary funnel defaults to the offer's control (option to select another)
5. Toggle "Follow Control Updates" (off by default)

### Split Tests

Managed from the destination detail view or a dedicated section. Creating a split test:

1. Select destination
2. Add funnel variants (must belong to the same offer as the destination)
3. Traffic is evenly split (no weight configuration for now)
4. Start test → status moves to `running`

Only one split test per destination can be `running` at a time.

### Settings

Plugin connection settings (editUrl, API credentials). The default offer is managed directly on the offer via the `isDefaultOffer` toggle in the Offers section.

## Angular App Integration

The Angular funnel app (future) consumes `@goldenhippo/builder-funnel-schemas` for type-safe Builder.io queries.

### Request Flow

```
User hits /fst/my-offer-gep
         │
         ▼
Query funnel-destination where slug = "my-offer-gep"
         │
         ├── No destination found → query funnel-offer where isDefaultOffer = true
         │                          → load control funnel for that offer
         │
         ▼
Has active split test?
  ├── No  → use destination.primaryFunnel
  └── Yes → check session cookie for existing assignment
            ├── Found → use stored funnel ID
            └── Not found → randomly select from variants
                            → store funnel ID in session cookie
         │
         ▼
Load funnel content (pricing, steps, checkout features)
         │
         ▼
For each step: load funnel-page content
         │
         ▼
Render funnel flow: step 1 → step 2 → ... → checkout
```

### Direct Funnel Access

Users can also land on `/f/[funnel-slug]`, which bypasses destination and split test logic:

```
User hits /f/pricing-test-v2
         │
         ▼
Query funnel where gh.slug = "pricing-test-v2"
         │
         ▼
Load funnel + pages → render
```

### Session Cookie

When a split test assigns a funnel, the app stores a cookie:

```
Key:    gh_funnel_[destination-content-id]
Value:  [funnel-content-id]
Scope:  session
```

This ensures visitors see the same funnel variant across page refreshes and return visits within the session.

## Implementation Plan

### Phase 1: Shared Schemas Extraction

Create `@goldenhippo/builder-shared-schemas` and move product models out of cart-schemas:

1. Scaffold `packages/builder-shared-schemas/` (package.json, tsconfig.json, tsup.config.ts)
2. Move from `builder-cart-schemas/src/data/` → `builder-shared-schemas/src/data/`:
   - `product.model.ts` (add `servingsPerUnit` field)
   - `product-category.model.ts`
   - `product-tag.model.ts`
   - `product-ingredient.model.ts`
   - `product-use-case.model.ts`
3. Set up barrel exports (`src/data/index.ts`, `src/index.ts`)
4. Update `builder-cart-schemas`:
   - Add `@goldenhippo/builder-shared-schemas` dependency
   - Replace moved files with re-exports from shared-schemas in `src/data/index.ts`
   - Add `@goldenhippo/builder-shared-schemas` to `tsup.config.ts` externals
5. Update `builder-funnel-schemas`:
   - Add `@goldenhippo/builder-shared-schemas` dependency
   - Remove `@goldenhippo/builder-cart-schemas` dependency (if present)
   - Add `@goldenhippo/builder-shared-schemas` to `tsup.config.ts` externals
6. Add `@goldenhippo/builder-shared-schemas` to changesets linked versions
7. Verify `npm run build && npm run typecheck && npm run lint` pass

### Phase 2: Funnel Schemas

Create funnel model factory functions and content types in `builder-funnel-schemas`:

1. `src/data/funnel-offer.model.ts` — Offer model + `BuilderFunnelOfferContent`
2. `src/data/funnel.model.ts` — Funnel model + `BuilderFunnelContent`
3. `src/data/funnel-destination.model.ts` — Destination model + `BuilderFunnelDestinationContent`
4. `src/data/funnel-split-test.model.ts` — Split test model + `BuilderFunnelSplitTestContent`
5. `src/page/funnel-page.model.ts` — Funnel page model + `BuilderFunnelPageContent`
6. Update barrel exports (`src/data/index.ts`, `src/page/index.ts`, `src/index.ts`)
7. Re-export product-related factories from shared-schemas through `src/index.ts`

### Phase 3: Funnel Plugin — Model Provisioning

Wire up model creation in `builder-funnel-plugin`:

1. Create `src/core/models/funnel-builder-helper.ts` — Model factory registry (mirrors cart's `BuilderHelper`)
2. Update `src/plugin.ts` — Add plugin settings (apiUrl, apiUser, apiPassword), implement `setHippoFunnelModels()` with the 7-phase creation
3. Add `getModel` / `setModel` utilities (extract shared pattern or duplicate from cart plugin)

### Phase 4: Funnel Plugin — Core UI

Build the plugin's management interface:

1. `src/application/` — App shell with MobX state and routing (Dashboard, Offers, Funnels, Destinations, Split Tests, Settings)
2. `src/services/builder-api/` — Builder.io content CRUD for funnel models
3. `src/services/commerce-api/` — Hippo Commerce API integration (if needed for product data)

### Phase 5: Funnel Plugin — Workflows

Implement the key user workflows:

1. **Create funnel from control** — Copy pricing, duplicate pages, create funnel entry
2. **Mark funnel as control** — Unset previous control, update destinations with `followControlUpdates`
3. **Create split test** — Validate same-offer constraint, enforce single active test per destination
4. **Set default offer** — Toggle `isDefaultOffer` on an offer (best-effort uniqueness — first flagged offer wins)

### Phase 6: Testing & Documentation

1. Unit tests for model factories (validate field structures)
2. Integration tests for plugin workflows (mock Builder.io API)
3. Update CLAUDE.md with funnel package descriptions
4. Update wiki with consuming guides for Angular teams

## Open Questions

1. **Pricing data source:** Should funnel pricing be queryable from the commerce API to auto-populate offer defaults, or is manual entry sufficient for now?

2. **Page duplication API:** Builder.io's content API supports duplicating entries. Need to verify the exact API call and whether visual blocks are deep-copied or reference-linked.

3. **Split test analytics:** The current design tracks assignment only. Analytics (conversion rates, statistical significance) likely live in a separate system. Confirm whether any analytics metadata should be stored on the split test model.

4. **Multi-locale support:** Funnel pages and offers will likely need localization. The model fields support `localized: true` — confirm which fields need it based on brand requirements.
