---
'@goldenhippo/builder-cart-plugin': minor
---

Add a Product Configuration page for browsing and editing per-product CMS fields directly in the plugin. Includes a searchable product list whose thumbnail mirrors the storefront `cart-line` rendering (so poorly-cropping or transparent images are caught early), a detail editor for the display, stock/visibility, taxonomy, packaging, and emoji fields, and a live card preview that mocks the storefront product-card variants in a neutral theme to show where each setting appears.

Editing is locale-aware: content is fetched unresolved so localized fields are saved per-locale without clobbering other locales, with a locale picker driven by the locales present in the data. Field existence and localized flags are sourced from the product model schema (with a test guarding against drift), and each product links out to its native Builder.io content entry.
