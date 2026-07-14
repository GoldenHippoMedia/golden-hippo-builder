# @goldenhippo/builder-cart-plugin

## 0.13.0

### Minor Changes

- [`9fcb890`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/9fcb890962c1e8ffa07814af8fc5d41014988346) - Add `featuredIconLabels` object field to the `product` model. Optional; wraps a repeatable `featuredIconLabel` list, each item with `featuredIconImage` (file), `featuredIconTitle` (text), and `altText` (text). Used to showcase featured icons with titles on the product detail page. — [@vbhavsargh](https://github.com/vbhavsargh)

## 0.12.0

### Minor Changes

- [`d482317`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/d482317ea25703c53ec5d590979568b8c6238c42) - add two new feature flags to configure passwordless login — [@dkidwell999](https://github.com/dkidwell999)

## 0.11.0

### Minor Changes

- [#56](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/56) [`95fe60f`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/95fe60f46f08973755225dbe0a6bd66de41af127) - Add context to the Admin Model Sync panel. A green banner lists the package-defined models that will be added by the sync (those not yet on the brand), and a yellow banner warns when a brand has models that aren't defined by this package — these unmanaged models sit outside the sync's managed set and risk being orphaned. Native Builder.io models such as `symbol` are excluded from the warning. A field-level diff also previews, per existing model, which fields the sync will add (green) or remove (red) — recursing into subfields (reported as dotted paths) and surfacing field removals before they drop the field and its stored content. — [@dkidwell999](https://github.com/dkidwell999)

## 0.10.1

### Patch Changes

- [`888768e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/888768e9fe2f0afc21087935909606705a7ab2a8) - Bump to include latest cart schemas — [@steven-t-h](https://github.com/steven-t-h)

## 0.10.0

### Minor Changes

- [#46](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/46) [`8d1b59d`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/8d1b59d7e65171274e523f2757bbe4705294eb36) - Add a global `recommendationConfig` reference to the brand config `features` section. It points to a `recommendation-config` data model entry, letting brands select the recommendation config used to generate product recommendations site-wide. The brand-config model-sync now depends on `recommendation-config` to guarantee creation order. — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- Updated dependencies [[`8d1b59d`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/8d1b59d7e65171274e523f2757bbe4705294eb36), [`74a3329`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/74a3329fa6a96c71a3237c987e292d576e109b97)]:
  - @goldenhippo/builder-cart-schemas@0.18.0

## 0.9.0

### Minor Changes

- [#44](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/44) [`2fde187`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2fde1871fb009a514e71c00a2edd499dea6f3f54) - Add `recommendationBlurb` text field to the `product` model. Optional, localized; used as a short blurb when the product is surfaced as a recommendation. — [@dkidwell999](https://github.com/dkidwell999)

- [#44](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/44) [`2fde187`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2fde1871fb009a514e71c00a2edd499dea6f3f54) - Add `recommendation-config` data model — a sibling of `profile-reference-rule` that defines how product recommendations are generated. Each entry in the `recommendations` list represents one recommendation slot with optional `requiredTags` and `excludedTags` (references to `product-tag`). The number of items in the list is the recommendation count. Registered in the cart plugin admin model-sync (phase 1). — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- Updated dependencies [[`2fde187`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2fde1871fb009a514e71c00a2edd499dea6f3f54), [`2fde187`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/2fde1871fb009a514e71c00a2edd499dea6f3f54)]:
  - @goldenhippo/builder-cart-schemas@0.17.0

## 0.8.0

### Minor Changes

- [#42](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/42) [`5a16bc2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/5a16bc2347007963c443ba896b537ddd723f5aac) - Add `promotional-card` section model for promotional card content blocks, with `rank` (number) and `product` (proreference) fields for positioning. — [@vbhavsargh](https://github.com/vbhavsargh)

### Patch Changes

- Updated dependencies [[`5a16bc2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/5a16bc2347007963c443ba896b537ddd723f5aac)]:
  - @goldenhippo/builder-cart-schemas@0.16.0

## 0.7.0

### Minor Changes

- [#39](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/39) [`93ad2b3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/93ad2b35f64f110bae7f97cda7cd857bd4aabaf4) - Add `subscription-cancellation-panel` section model for the subscription cancellation flow. Exposes a `panelType` text field and is auto-provisioned by the cart plugin on save. — [@dkidwell999](https://github.com/dkidwell999)

- [#39](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/39) [`93ad2b3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/93ad2b35f64f110bae7f97cda7cd857bd4aabaf4) - Add `upsell-template` section model for the upsell offer page template. Auto-provisioned by the cart plugin on save. — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- [#38](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/38) [`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267) - Added new models to admin sync panel — [@vbhavsargh](https://github.com/vbhavsargh)

- [#39](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/39) [`93ad2b3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/93ad2b35f64f110bae7f97cda7cd857bd4aabaf4) - Remove auto-sync when setting plugin settings — [@dkidwell999](https://github.com/dkidwell999)

- Updated dependencies [[`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267), [`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267), [`c72d963`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c72d9630dabc68c271c5168051df006add07e267), [`93ad2b3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/93ad2b35f64f110bae7f97cda7cd857bd4aabaf4), [`93ad2b3`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/93ad2b35f64f110bae7f97cda7cd857bd4aabaf4)]:
  - @goldenhippo/builder-cart-schemas@0.15.0

## 0.6.0

### Minor Changes

- [#34](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/34) [`f652aa7`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/f652aa7fb3f9e11add533ea1f4e6d6383bf8d0d4) - Register the new profile-reference-rule model in the cart plugin model-sync and auto-provisioning flow. — [@steven-t-h](https://github.com/steven-t-h)

### Patch Changes

- Updated dependencies [[`95b5374`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/95b53743220e6e83456589dba955a326e2aa4192), [`4393201`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/4393201e3ac2ae97a8e87540d9c073bb7c4a7db3), [`f652aa7`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/f652aa7fb3f9e11add533ea1f4e6d6383bf8d0d4)]:
  - @goldenhippo/builder-cart-schemas@0.14.0

## 0.5.0

### Minor Changes

- [#32](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/32) [`1b2e6e4`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/1b2e6e45cf4c722ab9e83050b9d6dd3d294dbd16) - Add new fields to product model — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- Updated dependencies [[`1b2e6e4`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/1b2e6e45cf4c722ab9e83050b9d6dd3d294dbd16)]:
  - @goldenhippo/builder-cart-schemas@0.13.0

## 0.4.2

### Patch Changes

- [#29](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/29) [`b46249f`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/b46249fe89053d5ca770f5dede876ff87a04bf63) - fix form binding for two feature flags - group cart by purchase type and enable cart freq toggle — [@dkidwell999](https://github.com/dkidwell999)

## 0.4.1

### Patch Changes

- [#26](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/26) [`b93cbbc`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/b93cbbcec16d7d29dcb183c469b937d4dbad89a8) - move two new cart settings up one level in the schema — [@dkidwell999](https://github.com/dkidwell999)

- Updated dependencies [[`b93cbbc`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/b93cbbcec16d7d29dcb183c469b937d4dbad89a8)]:
  - @goldenhippo/builder-cart-schemas@0.11.0

## 0.4.0

### Minor Changes

- [#24](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/24) [`870c21c`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/870c21cdfc3f25cb583562e62e8d70f5d730b391) - Adds feature flags for groupCartContentsByPurchaseType and enabledCartFrequencyToggle — [@dkidwell999](https://github.com/dkidwell999)

### Patch Changes

- Updated dependencies [[`870c21c`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/870c21cdfc3f25cb583562e62e8d70f5d730b391)]:
  - @goldenhippo/builder-cart-schemas@0.10.0

## 0.3.1

### Patch Changes

- [`91d7717`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/91d771738aad5112f9cd6ea4d5acf2f8c003c1e5) - Updated page schema — [@steven-t-h](https://github.com/steven-t-h)

## 0.3.0

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
  - @goldenhippo/builder-cart-schemas@0.9.0
  - @goldenhippo/builder-ui@0.2.0

## 0.2.0

### Minor Changes

- [`5dc4aa7`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/5dc4aa74d29cf19875ff1aaa1e66beccf7155f6d) - Bump plugin versions to align with schema package updates (0.8.0). — [@steven-t-h](https://github.com/steven-t-h)

  builder-cart-plugin:
  - Move default-website-section creation earlier in model provisioning (Phase 3) so product group and page models can reference it
  - Wire `sectionModelId` through to productGroupModel and pageModel

  builder-funnel-plugin:
  - Depends on updated funnel-schemas
