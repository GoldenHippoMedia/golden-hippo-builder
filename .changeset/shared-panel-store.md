---
'@goldenhippo/builder-cart-plugin': patch
---

Add a shared in-memory store so panel data loads once and survives tab switches instead of refetching on every mount. A new module-scoped `CollectionStore` (MobX) holds each dataset for the life of the plugin, with a guarded `ensureLoaded` (no-op once loaded) and an explicit `refresh` for a cache-busted re-fetch.

The Offer Config, Product Config, SEO Config, and Accessibility panels now read from these store singletons, so revisiting a tab renders instantly from memory rather than re-hitting the Builder CDN. Behavior is otherwise unchanged: Refresh still forces a fresh fetch, and edits (e.g. saving a product) update the cached entry in place. Brand Config and Hippo Admin are unchanged for now (small/heterogeneous data).
