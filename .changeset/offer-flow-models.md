---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': minor
---

Add post-checkout offer-flow configuration models. Introduces a new `offer-flow` data model (ordered steps pairing offer templates with offers, plus targeting conditions, audience exclusions, and step-target resiliency) and renames the bare `upsell-template` component to `offer-template` (now with an `offerCount` field for multi-offer layouts). Wires both into the plugin's model provisioning.

Purchased-product conditions can be narrowed to a specific SKU by `representsQuantity` (the units the purchased SKU ships — 3 for the 3-jar SKU, not the line quantity) and `orderType` (`Subscription` / `One-time Purchase` / `Either`, defaulting to `Either`). Both are optional and match exactly. `isSubscription` is read from the order item's own flag rather than inferred from whether the purchased SKU is a rebill SKU, and is evaluated per item since one order can mix subscription and one-time lines.

Also exports `selectOfferFlow(orderItems, flows)`, `doesFlowMatchOrder(orderItems, flow)`, and `countMatchedProducts(orderItems, flow)` from `./utils`, so consumers share one implementation of flow selection instead of reimplementing the matching rules. Matching joins the condition product's `gh.productionId` against the line's `familyId`, compared case-insensitively. Selection prefers the flow matching the most of the order's product families — most specific wins — using `priority` only to break ties. Lines that omit `representsQuantity` or `isSubscription` still match family-only conditions but never satisfy one narrowing on the missing fact.
