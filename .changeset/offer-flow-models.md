---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': minor
---

Add post-checkout offer-flow configuration models. Introduces a new `offer-flow` data model (ordered steps pairing offer templates with offers, plus targeting conditions, audience exclusions, and step-target resiliency) and renames the bare `upsell-template` component to `offer-template` (now with an `offerCount` field for multi-offer layouts). Wires both into the plugin's model provisioning.

Purchased-product conditions can be narrowed by `quantity` and `orderType` (`Subscription` / `One-time Purchase` / `Both`, defaulting to `Both`). `quantity` matches exactly, because each quantity of a product is its own SKU — this is what lets a flow target one variant of a product family, preserving SKU-level offer targeting.

Also exports `selectOfferFlow(items, flows)` and `doesFlowMatchOrder(items, flow)` from `./utils`, so the commerce API, cart app, and plugin share one implementation of flow selection instead of reimplementing the matching rules per consumer.
