---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-funnel-schemas': minor
'@goldenhippo/builder-shared-schemas': minor
'@goldenhippo/builder-types': minor
---

### builder-cart-schemas

- Export all brand config enums: `HeaderType`, `FooterType`, `BasicHeaderCTAType`, `MediumHeaderDropdownType`, `MediumHeaderDesktopContentType`, `ProductGridFilterType`, `ProductLinkPrefix`, `SubscriptionCancelReasons`, `SubscriptionCancelButtonType`
- Re-export enums from `brand-config/sections` through `brand-config/index.ts`, `data/index.ts`, and the package root `index.ts`
- These enums are used by the cart plugin's brand config management UI to populate select dropdowns and enforce type-safe values

### builder-types

- No direct changes — version bumped as part of the linked group to stay in sync with cart-schemas

### builder-shared-schemas

- No direct changes — version bumped as part of the linked group to stay in sync with cart-schemas

### builder-funnel-schemas

- No direct changes — version bumped as part of the linked group to stay in sync with cart-schemas
