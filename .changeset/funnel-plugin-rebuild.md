---
'@goldenhippo/builder-funnel-schemas': minor
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-shared-schemas': minor
'@goldenhippo/builder-types': minor
---

**`builder-funnel-schemas` — Breaking: major restructure to ERP-sync model**

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
