---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': major
---

Add post-checkout offer-flow configuration — Builder models for authoring the flows, shared rules for selecting and resolving them, and a plugin panel to build and test them.

## Models & rules (`@goldenhippo/builder-cart-schemas`)

- **New `offer-flow` data model** — an ordered list of steps, each pairing an `offer-template` reference with an ordered pool of offers, plus targeting `conditions`, audience exclusions, and a `stepTarget` for resiliency. The bare `upsell-template` component is renamed to `offer-template` and gains an `offerCount` field for multi-offer (N-up) layouts.
- **Targeting** — purchased-product conditions can be narrowed by `representsQuantity` (the units the purchased SKU ships — 3 for the 3-jar SKU, not the line quantity) and `orderType` (`Subscription` / `One-time Purchase` / `Either`, default `Either`). Both are optional and match exactly; `isSubscription` is read per order line, since one order can mix subscription and one-time items. Removed the authorable `type` on step offers — upsell/downsell is a catalog property, not an authoring choice (`OfferType` stays exported for the read-only display and the API's resolved-offer response).
- **Per-step routing** — `stepCountOnAccept` / `stepCountOnDecline` (both default `1` = next step; a jump past the last step ends the flow) set how far to advance on accept vs. decline, and `minResponses` (default `1`, ignored for single-offer templates) gates advancement on multi-offer steps by how many offers were answered (accepted OR declined), so a decline-all customer is never stuck.
- **Shared selection + resolution**, exported from `./utils` so consumers don't reimplement the rules:
  - `selectOfferFlow(orderItems, flows)` / `doesFlowMatchOrder` / `countMatchedProducts` — matching joins a condition product's `gh.productionId` to the order line's `familyId` (exact). The flow matching the most of the order's product families wins (most specific), with `priority` only breaking ties; falls back to the brand default; active flows only.
  - `resolveOfferFlow(flow, offersById, context)` with `isOfferAllowed` / `filterOffers` (apply `excludeSubscribedProducts` and `excludePreviouslyPurchased` + lookback), and `nextResolvedStep` / `stepBranchAccepted` / `canAdvanceStep` to walk survivors — dropping any step that can no longer fill its template and skipping past dropped steps. Rules read only a minimal `FlowOffer` shape (`id` + `product.familyId`).
- **`offer-template` editing route** — `editingUrlLogic` points at the cart app's `/builder-offer-template-editor` route (the bare `?offerTemplate` param flips that route into template mode; `?offerTemplate=<id>` renders a specific saved template for the plugin's gallery previews). **Requires the matching route in the consuming cart app.**

## Offer Config panel (`@goldenhippo/builder-cart-plugin`)

- **Flow editor** — author a flow's settings, targeting, audience exclusions, and a drag-ordered step sequence (pick a template per step, build its offer pool, set accept/decline routing).
- **Flow list built for scale** (a brand may have hundreds of flows) — each row shows a horizontal, scrollable step strip (template shape + offer pool with names, quantity, and sale/list price, with a backups divider), a targeting summary using resolved product names, audience-exclusion chips, and inline warnings for misconfigured flows. Includes a product filter and a per-row **Duplicate** action (deep-copies everything, gives the copy a unique name, opens it as a draft with its default flag forced off).
- **"Test a cart" simulator** — build a mock cart (product + units + subscription/one-time) and see which flow would run and why, ranked by coverage. It calls the shared `selectOfferFlow`, so results match production. When a cart hits the brand default (or nothing), one click creates a targeted flow pre-filled from that cart.
- **Searchable product combobox** for targeting and the simulator — a native `<select>` handles a large catalog badly. It filters by name and Production ID, marks products already used in the same condition as unselectable, supports arrow-key/Enter navigation, and flags a product with no Production ID as unmatchable. Product / product-group fetches raise their page budget to 500 so a large catalog is never silently truncated.
- **Custom themed dropdown** replacing the remaining native `<select>`s, so the option list renders identically across operating systems (a native popup is drawn by the OS and can't be fully styled).
- **Shared in-memory store** — a module-scoped MobX `CollectionStore` loads each panel's data once and survives tab switches (Offer Config, Product Config, SEO Config, Accessibility), with a guarded `ensureLoaded` and an explicit cache-busted `refresh`. Edits update the cached entry in place.
