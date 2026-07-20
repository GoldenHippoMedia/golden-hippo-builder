---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': minor
---

Add per-user tab access control. Admins can now grant individual non-admin users access to specific plugin tabs (Hippo Config, Product Config, SEO Config) from a new "Tab Access" section on the Hippo Admin page. Grants are persisted in a new `gh-tab-access` data model and read at plugin load: non-admins only see the tabs they've been granted, while admins continue to see every tab (the Administration tab itself stays admin-only). This is a client-side visibility layer, not a security boundary.
