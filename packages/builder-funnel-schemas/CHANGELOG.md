# @goldenhippo/builder-funnel-schemas

## 0.12.0

### Minor Changes

- [#30](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/30) [`6d5448e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/6d5448e1cf2e8ff25ded85cfba77721d016dbff2) - Support for page level meta pixel tracking — [@steven-t-h](https://github.com/steven-t-h)

## 0.11.0

### Minor Changes

- [#28](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/28) [`4eb0759`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/4eb07596a2caba2e2d59bd7cf4bf7037fc506e26) - Update funnel model with required brand field, funnel-destination model updates, funnel-page model improvements, and new resolve-destination-config utility — [@steven-t-h](https://github.com/steven-t-h)

## 0.9.3

### Patch Changes

- [`787e6cc`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/787e6cc8b34ec0b564146a1a48f8a73f2f39a941) - bump to latest shared schemas — [@steven-t-h](https://github.com/steven-t-h)

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

## 0.2.0

### Minor Changes

- [#1](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/1) [`39adda2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/39adda296dc6ea54273176797b66e001787deda8) Thanks [@steven-t-h](https://github.com/steven-t-h)! - update README files for better navigation

### Patch Changes

- Updated dependencies [[`39adda2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/39adda296dc6ea54273176797b66e001787deda8)]:
  - @goldenhippo/builder-types@0.2.0
