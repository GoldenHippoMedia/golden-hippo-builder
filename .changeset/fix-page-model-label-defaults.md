---
'@goldenhippo/builder-cart-schemas': patch
---

Fix Page model PDP config defaults: offer selector toggles and labels used `{ Default: ... }` locale-map defaults without being localized, which stored raw objects and crashed Builder's HTML editor (`html.includes is not a function`). These fields are now `localized: true` with `@builder.io/core:LocalizedValue` defaults.
