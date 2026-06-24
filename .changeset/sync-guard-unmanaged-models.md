---
'@goldenhippo/builder-cart-plugin': minor
---

Add at-a-glance sync context to the Admin Model Sync panel. A green banner lists the package-defined models that will be added by the sync (those not yet on the brand), and a yellow banner warns when a brand has models that aren't defined by this package — these unmanaged models sit outside the sync's managed set and risk being orphaned, so they're listed (with their Builder.io kind) so admins can relocate any content worth keeping before re-provisioning. Native Builder.io models such as `symbol` are excluded from the warning.
