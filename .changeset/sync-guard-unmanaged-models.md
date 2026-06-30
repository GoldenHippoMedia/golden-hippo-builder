---
'@goldenhippo/builder-cart-plugin': minor
---

Add context to the Admin Model Sync panel. A green banner lists the package-defined models that will be added by the sync (those not yet on the brand), and a yellow banner warns when a brand has models that aren't defined by this package — these unmanaged models sit outside the sync's managed set and risk being orphaned. Native Builder.io models such as `symbol` are excluded from the warning. A field-level diff also previews, per existing model, which fields the sync will add (green) or remove (red) — recursing into subfields (reported as dotted paths) and surfacing field removals before they drop the field and its stored content.
