---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': minor
---

Add a global `recommendationConfig` reference to the brand config `features` section. It points to a `recommendation-config` data model entry, letting brands select the recommendation config used to generate product recommendations site-wide. The brand-config model-sync now depends on `recommendation-config` to guarantee creation order.
