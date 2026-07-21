# @goldenhippo/builder-cart-schemas

## 0.23.0

### Minor Changes

- [#79](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/79) [`efe4df2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/efe4df2998e8c1695a68f81d38ac7d1d702f59e6) - Add per-user tab access control. Admins can now grant individual non-admin users access to specific plugin tabs (Hippo Config, Product Config, SEO Config) from a new "Tab Access" section on the Hippo Admin page. Grants are persisted in a new `gh-tab-access` data model and read at plugin load: non-admins only see the tabs they've been granted, while admins continue to see every tab (the Administration tab itself stays admin-only). This is a client-side visibility layer, not a security boundary. — [@dkidwell999](https://github.com/dkidwell999)

## 0.22.2

### Patch Changes

- [#68](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/68) [`f586da4`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/f586da45d485501291d2b7504cd63ca483774827) - Add `disableZoom` field to PDP config — [@vbhavsargh](https://github.com/vbhavsargh)

- Updated dependencies [[`792032b`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/792032b056bf78d62ab41199c0adc62f371f1d2b)]:
  - @goldenhippo/builder-shared-schemas@0.22.2

## 0.22.1

### Patch Changes

- [#63](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/63) [`05baf1c`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/05baf1c329235c14270c64916685ba1fb4750ef1) - replace deprecated subscription toggle with two new clearer fields on the page model — [@dkidwell999](https://github.com/dkidwell999)

## 0.21.0

### Minor Changes

- [#57](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/57) [`5013c90`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/5013c90e5b60bfab525c380e958d72c8440475dd) - Adding canonical URL to the Cart Page model — [@jnuttGH](https://github.com/jnuttGH)

## 0.20.0

### Minor Changes

- [#59](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/59) [`f4ec487`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/f4ec487fb9a78641cfb66ae23632d61c7a6f9b12) - Add passwordless login feature flags to brand config: `passwordlessLoginEnabled` toggles passwordless login for the brand, and `passwordlessLoginDefault` presents it as the default login method (only shown when passwordless login is enabled). — [@dkidwell999](https://github.com/dkidwell999)

## 0.19.0

### Minor Changes

- [#52](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/52) [`0cb43dd`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/0cb43ddef3c3fbce46b52bdaae2dd4e094ada607) - Add `dynamicBrowserTab` config to the brand-config features section, controlling the blinking browser tab title shown when a user switches away from the tab (`enabled`, `awayTitle`, optional `defaultTitle`). — [@kewinnerygoldenhippo](https://github.com/kewinnerygoldenhippo)

- [#47](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/47) [`09ac981`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/09ac98180a687a3d717b9c635ca8382e0533ab70) - Add `subscriptionUpgradeModuleEnabled` boolean to the cart page config in brand-config, controlling whether the Subscription Upgrade Module is shown on the cart page. — [@kewinnerygoldenhippo](https://github.com/kewinnerygoldenhippo)

## 0.18.0

### Minor Changes

- [#46](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/46) [`8d1b59d`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/8d1b59d7e65171274e523f2757bbe4705294eb36) - Add a global `recommendationConfig` reference to the brand config `features` section. It points to a `recommendation-config` data model entry, letting brands select the recommendation config used to generate product recommendations site-wide. The brand-config model-sync now depends on `recommendation-config` to guarantee creation order. — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- [#48](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/48) [`74a3329`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/74a3329fa6a96c71a3237c987e292d576e109b97) - Updates the `applyProfileReferenceRules` utility to return the ProfileReferenceApplicationType for use in product recommendations — [@steven-t-h](https://github.com/steven-t-h)

## 0.17.0

### Minor Changes

- [#44](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/44) [`2fde187`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2fde1871fb009a514e71c00a2edd499dea6f3f54) - Add `applicationType` select field (exclusive | preferred | required, defaults to preferred) to the `profile-reference-rule` model, exposed via the new `ProfileReferenceApplicationType` enum. — [@dkidwell999](https://github.com/dkidwell999)

- [#44](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/44) [`2fde187`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2fde1871fb009a514e71c00a2edd499dea6f3f54) - Add `recommendation-config` data model — a sibling of `profile-reference-rule` that defines how product recommendations are generated. Each entry in the `recommendations` list represents one recommendation slot with optional `requiredTags` and `excludedTags` (references to `product-tag`). The number of items in the list is the recommendation count. Registered in the cart plugin admin model-sync (phase 1). — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- Updated dependencies [[`2fde187`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2fde1871fb009a514e71c00a2edd499dea6f3f54)]:
  - @goldenhippo/builder-shared-schemas@0.17.0

## 0.16.0

### Minor Changes

- [#42](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/42) [`5a16bc2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/5a16bc2347007963c443ba896b537ddd723f5aac) - Add `promotional-card` section model for promotional card content blocks, with `rank` (number) and `product` (proreference) fields for positioning. — [@vbhavsargh](https://github.com/vbhavsargh)

## 0.15.0

### Minor Changes

- [#39](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/39) [`93ad2b3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/93ad2b35f64f110bae7f97cda7cd857bd4aabaf4) - Add `subscription-cancellation-panel` section model for the subscription cancellation flow. Exposes a `panelType` text field and is auto-provisioned by the cart plugin on save. — [@dkidwell999](https://github.com/dkidwell999)

- [#39](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/39) [`93ad2b3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/93ad2b35f64f110bae7f97cda7cd857bd4aabaf4) - Add `upsell-template` section model for the upsell offer page template. Auto-provisioned by the cart plugin on save. — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- [#38](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/38) [`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267) - Updated page model to accept offer selector content and added package selector — [@vbhavsargh](https://github.com/vbhavsargh)

- [#38](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/38) [`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267) - Updated brand config to accept new header and footer types. — [@vbhavsargh](https://github.com/vbhavsargh)

- [#38](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/38) [`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267) - Added header, footer, and offer selector content models. — [@vbhavsargh](https://github.com/vbhavsargh)

- Updated dependencies [[`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267)]:
  - @goldenhippo/builder-shared-schemas@0.15.0

## 0.14.0

### Minor Changes

- [#35](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/35) [`95b5374`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/95b53743220e6e83456589dba955a326e2aa4192) - adds `Horizontal List` option to Product Grid Filter Type — [@vbhavsargh](https://github.com/vbhavsargh)

- [#36](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/36) [`4393201`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/4393201e3ac2ae97a8e87540d9c073bb7c4a7db3) - create new section type to default-website-section model — [@vbhavsargh](https://github.com/vbhavsargh)

- [#34](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/34) [`f652aa7`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/f652aa7fb3f9e11add533ea1f4e6d6383bf8d0d4) - Add profile-reference-rule model to cart schemas with conditional reference type selector (Tag / Ingredient / Category / UseCase) and per-field application rules. Extend builder-types to allow `required` as a string expression and `reference.model` to be optional. — [@steven-t-h](https://github.com/steven-t-h)

### Patch Changes

- Updated dependencies [[`f652aa7`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/f652aa7fb3f9e11add533ea1f4e6d6383bf8d0d4)]:
  - @goldenhippo/builder-shared-schemas@0.14.0
  - @goldenhippo/builder-types@0.14.0

## 0.13.0

### Minor Changes

- [#32](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/32) [`1b2e6e4`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/1b2e6e45cf4c722ab9e83050b9d6dd3d294dbd16) - Add new fields to product model: FAQ section, Featured ingredients, Ingredients accordion, Supplment facts, Featured icon labels — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- Updated dependencies [[`1b2e6e4`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/1b2e6e45cf4c722ab9e83050b9d6dd3d294dbd16)]:
  - @goldenhippo/builder-shared-schemas@0.13.0

## 0.11.0

### Patch Changes

- [#26](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/26) [`b93cbbc`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/b93cbbcec16d7d29dcb183c469b937d4dbad89a8) - move two new cart settings up one level in the schema — [@dkidwell999](https://github.com/dkidwell999)

## 0.10.0

### Minor Changes

- [#24](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/24) [`870c21c`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/870c21cdfc3f25cb583562e62e8d70f5d730b391) - Adds feature flags for groupCartContentsByPurchaseType and enabledCartFrequencyToggle — [@dkidwell999](https://github.com/dkidwell999)

## 0.9.3

### Patch Changes

- [`787e6cc`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/787e6cc8b34ec0b564146a1a48f8a73f2f39a941) - bump to latest shared schemas — [@steven-t-h](https://github.com/steven-t-h)

## 0.9.1

### Patch Changes

- [#19](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/19) [`c4b5504`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c4b5504d741f4eee4b862f212e1f5057cf1426ca) - Fixes the dynamic show/hide of global review settings on the page model and updates the related types. — [@steven-t-h](https://github.com/steven-t-h)

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
  - @goldenhippo/builder-shared-schemas@0.9.0
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
  - @goldenhippo/builder-shared-schemas@0.8.0
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
  - @goldenhippo/builder-shared-schemas@0.7.0
  - @goldenhippo/builder-types@0.7.0

## 0.6.0

### Minor Changes

- [#10](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/10) [`3165fb3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/3165fb32e49ef7bbcf898ca00ace61498b6d6a1b) - Add `cartDrawerEnabled` feature flag to brand-config schema — [@steven-t-h](https://github.com/steven-t-h)

## 0.5.0

### Minor Changes

- [#7](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/7) [`c6dcd3e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c6dcd3e5552d4a7c25d9682f8fcd003291f7fd05) Thanks [@steven-t-h](https://github.com/steven-t-h)! - Add funnel plugin MVP with full model management
  - **builder-shared-schemas** (new): Extract shared product models (product, category, tag, ingredient, use-case) into dedicated package for reuse across cart and funnel scopes
  - **builder-funnel-schemas**: Add funnel data models (funnel-offer, funnel, funnel-destination, funnel-split-test), funnel-page model, subscription frequency utilities, and consumer utility functions (resolveDestinationConfig, getFunnelIdFromPage)
  - **builder-cart-schemas**: Migrate shared product models to builder-shared-schemas; re-export for backward compatibility

### Patch Changes

- Updated dependencies [[`c6dcd3e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c6dcd3e5552d4a7c25d9682f8fcd003291f7fd05)]:
  - @goldenhippo/builder-shared-schemas@0.5.0

## 0.4.0

### Minor Changes

- [#5](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/5) [`01c6750`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/01c6750377a95bf63e91b52f825198b1e4be1645) Thanks [@steven-t-h](https://github.com/steven-t-h)! - fix: add "type": "module" to package.json to align tsup output filenames with exports map

### Patch Changes

- Updated dependencies [[`01c6750`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/01c6750377a95bf63e91b52f825198b1e4be1645)]:
  - @goldenhippo/builder-types@0.4.0

## 0.3.0

### Minor Changes

- [#3](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/3) [`bba875b`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/bba875ba2dfe5ddfda00912e7e582d8e7534927d) Thanks [@steven-t-h](https://github.com/steven-t-h)! - added child reference types

### Patch Changes

- Updated dependencies [[`bba875b`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/bba875ba2dfe5ddfda00912e7e582d8e7534927d)]:
  - @goldenhippo/builder-types@0.3.0

## 0.2.0

### Minor Changes

- [#1](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/1) [`39adda2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/39adda296dc6ea54273176797b66e001787deda8) Thanks [@steven-t-h](https://github.com/steven-t-h)! - update README files for better navigation

### Patch Changes

- Updated dependencies [[`39adda2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/39adda296dc6ea54273176797b66e001787deda8)]:
  - @goldenhippo/builder-types@0.2.0
