---
'@goldenhippo/builder-cart-schemas': minor
---

Remove the authorable `type` field from `offer-flow` step offers. Upsell/downsell is a property of the
offer in the catalog, not an authoring choice — marketers order offers within a step but cannot
relabel an upsell as a downsell. `OfferType` remains exported as the shared vocabulary for the
read-only authoring display and the API's resolved-offer response.
