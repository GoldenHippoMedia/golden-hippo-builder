---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': minor
---

Add `recommendation-config` data model — a sibling of `profile-reference-rule` that defines how product recommendations are generated. Each entry in the `recommendations` list represents one recommendation slot with optional `requiredTags` and `excludedTags` (references to `product-tag`). The number of items in the list is the recommendation count. Registered in the cart plugin admin model-sync (phase 1).
