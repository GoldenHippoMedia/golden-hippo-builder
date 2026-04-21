# @goldenhippo/builder-shared-schemas

## 0.9.2

### Patch Changes

- [`5155f49`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/5155f4993ca8c84e9f7a4c40ac16469554a80a1e) - - adds a new field `globalFiveStarReviews` to the product schema in `@goldenhippo/builder-shared-schemas`. This field is intended to store the total count of five-star reviews for a brand, aggregated across all platforms. — [@steven-t-h](https://github.com/steven-t-h)
  - updates the funnel plugin to allow setting the brand properly

## 0.9.0

### Minor Changes

- [#17](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/17) [`11d3134`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/11d31347ff6aaee1a8c63563e75a773d5108c1ed) - ### @goldenhippo/builder-cart-plugin — [@steven-t-h](https://github.com/steven-t-h)

  Complete rebuild of the cart plugin with a custom glassmorphic design system and two full-featured tabs.

  **Hippo Config tab — Brand Configuration Management:**
  - 8-tab form UI covering the entire `gh-brand-config` model schema (General, Header, Footer, Features, Support, Pages, Cookies, SEO)
  - Header sub-configs (BASIC, MEDIUM, MEGA, DMP) with full list management for links, CTAs, menus, and nested dropdown content
  - Pages sub-sections with all fields including subscription cancel reasons list with nested buttons
  - Tiptap-based rich text editor (HtmlEditor) for all 27 HTML fields across header, pages, and cookie sections
  - TagInput (Enter-to-add) for CSS class and SEO topic fields
  - ImagePicker wired to Builder.io media library via GraphQL Admin API with search, thumbnail grid, and selection
  - Reference pickers for banners (site-banner model) and product grid filter groups using `@builder.io/core:Reference` format
  - Save via Builder.io Write API with private API key (new `privateApiKey` plugin setting)
  - MobX observable store with `useLocalStore`, all section components wrapped in `observer` for proper reactivity

  **Hippo Admin tab — Admin Dashboard:**
  - Space Info: org name, user email, brand, API key (masked), private key status
  - API Connection Status: test Builder.io CDN, Hippo Commerce API (`/config` with Basic auth + X-Brand), Builder.io Write API (GraphQL Admin)
  - Plugin Settings Overview: read-only display of all settings with quick Open Settings button
  - Model Sync: all 13 models in 7 dependency phases, per-model sync with prerequisite checks, sync-all with progress feedback
  - Extracted model sync logic to shared `model-sync.ts` module with `MODEL_DEFINITIONS`, `syncAllModels`, `syncSingleModel`, `getModelStatuses`

  **Design System & Infrastructure:**
  - Custom glassmorphic CSS variable theme replacing DaisyUI — dark-first with Golden Hippo gold accent (#C8A951)
  - Sticky frosted-glass header with radial gradient background, dark/light theme toggle
  - Glass card sections, gold focus rings, custom toggle pills, pill-style tabs
  - `hippo-input`, `hippo-toggle`, `hippo-spinner` utility classes
  - Distinct gold SVG icons for Config (gear) and Admin (shield) tabs
  - `BuilderApi` service: paginated content fetch, brand config CRUD, asset listing (GraphQL Admin), model entry fetching
  - `plugin-actions.ts`: captured `triggerSettingsDialog` for use across components
  - Removed DaisyUI and `postcss-prefix-selector` from PostCSS config

  ### @goldenhippo/builder-ui

  **New design system replacing DaisyUI:**
  - Custom CSS variables scoped to `#hippo-app` with `data-theme="dark"` (default) and `data-theme="light"` variants
  - Dark theme: `#0a0e1a` base, `rgba(255,255,255,0.05)` glass, `#C8A951` gold accent
  - Light theme: `#f8f9fc` base, `rgba(0,0,0,0.02)` glass, `#B8993D` gold accent
  - Custom `hippo-input` (text/textarea/select), `hippo-toggle` (pill switch), `hippo-spinner` (loading) CSS classes
  - Base font, antialiasing, and color-scheme scoped to `#hippo-app`

  **Restyled existing components:**
  - `Section` — glassmorphic card with `backdrop-blur-sm`, increased padding (`p-8`)
  - `FormField` — updated label typography (`text-xs font-semibold tracking-wide`), increased label-to-input spacing (`space-y-2.5`)
  - `EmptyState` — dashed border glass card with accent action button
  - `LoadingSection` — custom CSS spinner replacing DaisyUI loading classes, simplified props to `message` and `size`
  - `PageHeader` — updated to `text-xl font-bold tracking-tight`
  - `StatusBadge` — new typed interface (`status: 'success' | 'warning' | 'error' | 'info' | 'neutral'`, `label: string`) with CSS variable-based color mapping

  **New components:**
  - `HtmlEditor` — Tiptap-based rich text editor with bold/italic/underline/link toolbar, glassmorphic styling with gold accent active states, inline link styling for visibility, `value`/`onChange` controlled interface
  - `TagInput` — Enter-to-add tag management with gold-accented badge display, click-to-remove (X button), backspace-to-delete-last, duplicate prevention, `value: string[]`/`onChange` interface
  - `ImagePicker` — Fixed-size thumbnail tiles (w-40 h-32) with hover overlay (Change/Remove buttons), empty state with dashed border and gold plus icon, media library modal with search filter/thumbnail grid/selection highlight/loading/error states, `fetchAssets` prop for API integration, `MediaAsset` type export

  **New dependencies:** `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/pm`

  ### @goldenhippo/builder-cart-schemas
  - Export all brand config enums from `brand-config/sections` through the barrel chain (`brand-config/index.ts` → `data/index.ts` → package root `index.ts`):
    - `HeaderType` (BASIC, MEDIUM, MEGA, LINKLESS, NONE, DMP)
    - `FooterType` (BASIC, MEGA, NONE)
    - `BasicHeaderCTAType` (primary, secondary, outline, link)
    - `MediumHeaderDropdownType` (search, links, accountLinks, html, timedHtml)
    - `MediumHeaderDesktopContentType` (links, logo, accountLinks, cartCount, html)
    - `ProductGridFilterType` (Dropdown, Stacked List)
    - `ProductLinkPrefix` (/p, /product)
    - `SubscriptionCancelReasons` (DoNotLike, NotWorking, NoBenefits, etc.)
    - `SubscriptionCancelButtonType` (link, update, keep, continue, cancel)

  ### @goldenhippo/builder-funnel-plugin
  - Removed DaisyUI plugin and `postcss-prefix-selector` from PostCSS config to match the new design system approach (compile-only change — funnel plugin UI rebuild is a separate project)

  ### @goldenhippo/builder-shared-schemas
  - No direct changes — version bumped as part of the linked schema versioning group to stay in sync with builder-cart-schemas

  ### @goldenhippo/builder-types
  - No direct changes — version bumped as part of the linked schema versioning group to stay in sync with builder-cart-schemas

### Patch Changes

- Updated dependencies [[`11d3134`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/11d31347ff6aaee1a8c63563e75a773d5108c1ed)]:
  - @goldenhippo/builder-types@0.9.0

## 0.8.0

### Minor Changes

- [#14](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/14) [`bc767f5`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/bc767f52374947ade09722ab3c6f569b5df406de) - Sync Builder.io model definitions with production and improve field usability. — [@steven-t-h](https://github.com/steven-t-h)

  Model sync (production parity):
  - Product: add `components` list field for Bundle type products (slug, displayName, description)
  - Product Group: change `shortDescription` to html, add `informationCallout` reference, accept `sectionModelId`
  - Brand Config: add `LINKLESS` header type, `subscriptionExperience`/`useDefaultFrequencies` features, `seo` object
  - Page: add `Multi-Group` PDP type with pdpTitle, pdpDescription, multiProductGroup; add `Bundle Group` offer selector type, `Slider Zoom` slider, `quantitySelector` label, `desktopSliderOverride` reference

  Plugin (builder-cart-plugin):
  - Move default-website-section creation earlier in model provisioning (Phase 3) so product group and page models can reference it
  - Wire `sectionModelId` through to productGroupModel and pageModel

  helperText & displayName improvements:
  - Add missing helperText to ~50 fields across all models for non-developer usability
  - Replace empty helperText values with meaningful guidance
  - Fix display name casing (Youtube → YouTube, Tiktok → TikTok, Twitter → Twitter / X)
  - Rename jargon-heavy labels (OOS → Out of Stock, Type → Product Page Type / Footer Type)
  - Add friendlyName to unlabeled fields (Bundle Components, Product Groups, Offer Options, etc.)

### Patch Changes

- Updated dependencies [[`bc767f5`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/bc767f52374947ade09722ab3c6f569b5df406de)]:
  - @goldenhippo/builder-types@0.8.0

## 0.7.0

### Minor Changes

- [#12](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/12) [`2c369e5`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2c369e5b312a76ce808f8fe3607866cd366b351e) - **`builder-funnel-schemas` — Breaking: major restructure to ERP-sync model** — [@steven-t-h](https://github.com/steven-t-h)

  The funnel schema package has been redesigned around a new architecture where the ERP system (Hippo) is the source of truth for funnel structure and pricing. Builder.io holds lightweight lookup references (synced from the ERP) and the visual funnel pages.

  Removed models and types:
  - `createFunnelOfferModel` / `BuilderFunnelOfferContent` / `FunnelOfferPricingTier` / `OfferType` — `funnel-offer` model removed; offers are managed in the ERP
  - `createFunnelSplitTestModel` / `BuilderFunnelSplitTestContent` / `FunnelSplitTestStatus` / `FunnelSplitTestVariant` — `funnel-split-test` model removed; split test configuration is now embedded in the destination
  - `SUBSCRIPTION_FREQUENCIES` / `FREQUENCY_LABELS` / `calculateSubscriptionFrequency` / `SubscriptionFrequency` — subscription frequency utilities removed
  - `FunnelPricingTier` / `FunnelStep` / `FunnelStepType` / `FunnelStatus` — pricing and step types removed from funnel model

  Changed:
  - `funnel` model simplified to an ERP sync reference with fields: `name`, `type` (`Pre-purchase` | `Post-purchase`), `active`, `slug`, `productionId`
  - `BuilderFunnelContent` updated: added `type?: 'Pre-purchase' | 'Post-purchase'`; removed offer reference, pricing tiers, steps, and status fields
  - `funnel-destination` model updated: `defaultFunnel` replaces the previous offer-based routing; `splitTest` is now an embedded object (not a separate model reference)
  - Added `BuilderDestinationSplitTestOption` type

  **`builder-cart-schemas` — New enum exports and richer page types**
  - Exported enums from `page.model.ts`: `PageTypes`, `PdpTypes`, `OfferSelectorTypes`, `OfferSelectorSliderTypes`, `OfferSelectorDefaultPurchaseType`, `OfferSelectorSavingsType`
  - Exported `ProductGroupType` enum from `product-group.model`
  - Exported `FilterApplicationType` enum from `product-grid-filter-group.model`
  - `BuilderPageContent` discriminated union types updated with richer references to product, category, product group, and site banner content types
  - Brand config model updated with new configuration sections
  - Blog comment model field updates

  **`builder-shared-schemas` — Fixed content reference types**
  - `BuilderProductContent` reference fields (`tag`, `category`, `ingredient`, `useCase`) now correctly typed as `BuilderContentReference<T['data']>` instead of the previous double-wrapped `{ id: string; value: BuilderContentReference<T> }` shape

  **`builder-types` — `friendlyName` is now optional**
  - `friendlyName` on `BaseBuilderIOField` changed from required to optional, allowing field definitions without a display name override

### Patch Changes

- Updated dependencies [[`2c369e5`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2c369e5b312a76ce808f8fe3607866cd366b351e)]:
  - @goldenhippo/builder-types@0.7.0

## 0.5.0

### Minor Changes

- [#7](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/7) [`c6dcd3e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c6dcd3e5552d4a7c25d9682f8fcd003291f7fd05) Thanks [@steven-t-h](https://github.com/steven-t-h)! - Add funnel plugin MVP with full model management
  - **builder-shared-schemas** (new): Extract shared product models (product, category, tag, ingredient, use-case) into dedicated package for reuse across cart and funnel scopes
  - **builder-funnel-schemas**: Add funnel data models (funnel-offer, funnel, funnel-destination, funnel-split-test), funnel-page model, subscription frequency utilities, and consumer utility functions (resolveDestinationConfig, getFunnelIdFromPage)
  - **builder-cart-schemas**: Migrate shared product models to builder-shared-schemas; re-export for backward compatibility
