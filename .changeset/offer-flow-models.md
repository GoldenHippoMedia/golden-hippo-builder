---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': minor
---

Add post-checkout offer-flow configuration models. Introduces a new `offer-flow` data model (ordered steps pairing offer templates with offers, plus targeting conditions, audience exclusions, and step-target resiliency) and renames the bare `upsell-template` component to `offer-template` (now with an `offerCount` field for multi-offer layouts). Wires both into the plugin's model provisioning.
