---
'@goldenhippo/builder-cart-schemas': minor
---

Add `aboveHeaderBanner` and `belowHeaderBanner` reference fields to the `header` component model. Both reference the `banner` model and are exposed on `BuilderHeaderModelContent` as typed `BuilderContentReference<BuilderSiteBannerModelContent['data']>`, letting design engineers attach announcement banners above and below the global header.
