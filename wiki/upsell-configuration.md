# Offer Flow Configuration

Post-checkout **offer flows** let marketers configure the sequence of offers a customer sees after checkout, authored in Builder.io and consumed by the commerce API + cart app. Cart scope only.

- **Offer flow** — an ordered series of **steps** a customer walks after checkout. Each step routes forward on accept vs. decline; the marketer's ordering and routing are the entire sequencing logic (no hardcoded branching).
- **Offer template** — the Builder component that renders a step's offers. Designers build the layout; each step references a template and the template declares how many offers it presents.
- **Offers** — come from the Hippo Commerce API (`GET /offer`, brand-scoped). Builder stores only an offer id per step; nothing about the offer's product/price/quantity is authored in Builder.
- **Default + conditional flows** — a brand has one default flow; additional flows target specific carts (e.g. "just bought Product A"). The best-matching flow is chosen per order, falling back to the default.

---

## Models

Two Builder models, in `@goldenhippo/builder-cart-schemas`. Offers are not a Builder model.

```
offer-flow (data)
  ├─ name, active, isDefault, priority
  ├─ stepTarget                                        # how many surviving steps to present
  ├─ steps: list of {
  │     template: ref → offer-template,
  │     offers:   [ { offer } … ],                     # ordered pool ≥ template.offerCount (extras = backups)
  │     stepCountOnAccept, stepCountOnDecline,          # forward routing
  │     minResponses }                                 # multi-offer advance gate
  ├─ conditions: list of { conditionType, products:[ { product, representsQuantity?, orderType? } ] }
  └─ excludeSubscribedProducts / excludePreviouslyPurchased (+ previousPurchaseLookback)

offer-template (component)
  └─ offerCount: how many offers the template presents (1-up, 3-up, …)
```

### `offer-flow` (data)

Factory: `createOfferFlowModel(offerTemplateModelId, productModelId)`.

| Field                                      | Type                                                   | Notes                                                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                     | text (required)                                        | Internal name; `contentTitleField`.                                                                                                                                                |
| `active`                                   | boolean (default `true`)                               | Only active flows are selected.                                                                                                                                                    |
| `isDefault`                                | boolean (default `false`)                              | The fallback flow when no conditional flow matches.                                                                                                                                |
| `priority`                                 | number (default `0`)                                   | **Tiebreak only** between flows matching the same number of the order's products (higher wins). Coverage decides first.                                                            |
| `stepTarget`                               | number (optional)                                      | How many surviving steps to present; blank = all. Configure more steps than this as backups.                                                                                       |
| `steps[]`                                  | list                                                   | Ordered = the sequence.                                                                                                                                                            |
| `steps[].template`                         | reference → `offer-template`                           | The template that renders this step.                                                                                                                                               |
| `steps[].offers[]`                         | list, min 1, of `{ offer }`                            | Ordered pool ≥ template `offerCount` (extras are backups). `offer` = commerce offer id (text).                                                                                     |
| `steps[].stepCountOnAccept` / `…OnDecline` | number (default `1`)                                   | Steps to jump forward on accept / decline. A jump past the last step ends the flow.                                                                                                |
| `steps[].minResponses`                     | number (default `1`)                                   | On a multi-offer step, how many offers must be **answered** (accepted OR declined) before advancing. Ignored for single-offer templates.                                           |
| `conditions[]`                             | list of `{ conditionType, products[] }`                | Targeting. v1 `conditionType`: `Purchased Product`. Extensible (typed list).                                                                                                       |
| `conditions[].products[]`                  | list of `{ product, representsQuantity?, orderType? }` | `product` = ref → `product`; `representsQuantity` = units the purchased SKU ships (blank = any); `orderType` = `Subscription` / `One-time Purchase` / `Either` (default `Either`). |
| `excludeSubscribedProducts`                | boolean (default `false`)                              | Drop offers whose product the customer already subscribes to.                                                                                                                      |
| `excludePreviouslyPurchased`               | boolean (default `false`)                              | Drop offers whose product the customer purchased within the lookback window.                                                                                                       |
| `previousPurchaseLookback`                 | select `1/2/3/6/12/24 mo … Ever`                       | `showIf` `excludePreviouslyPurchased`; default `3 months`. `Ever` = any past purchase.                                                                                             |

Exported enums: `OfferType` (`Upsell` / `Downsell` — a catalog property, shown read-only, not authored), `OfferFlowConditionType`, `OfferFlowOrderType`, `PreviousPurchaseLookback`.

### `offer-template` (component)

Factory: `createOfferTemplateModel(editUrl)`.

- One field: **`offerCount`** (number, required, default `1`) — how many offers the template presents. Templates bind offers by index from the runtime `[data]` contract, so one contract covers 1-up and N-up.
- `editingUrlLogic` → `${editUrl}/builder-offer-template-editor?offerTemplate&builder.preview=true&builder.frameEditing=true`. The bare `offerTemplate` param flips the cart route into template mode; `?offerTemplate=<id>` renders a specific saved template (used for the plugin's gallery previews). Requires the matching route in the cart app.

Provisioning: `offer-template` at phase 3, `offer-flow` at phase 4 (`dependencies: ['offer-template', 'product']`) in `MODEL_DEFINITIONS`.

---

## Selecting & resolving a flow

The rules live in `builder-cart-schemas` (`./utils`, re-exported from the root) so the commerce API, the cart, and the plugin's simulator all run one implementation.

**Selection** — `selectOfferFlow(orderItems, flows)`:

- Active flows only. A condition product matches an order line when the condition product's `gh.productionId` equals the line's `familyId` (exact), and — if set — `representsQuantity` and `orderType` match. A line that omits `representsQuantity` / `isSubscription` still matches family-only conditions but never satisfies that narrowing.
- **Coverage decides first:** the flow matching the most of the order's distinct product families wins (most specific). `priority` breaks ties (then `lastUpdated`, then id).
- If no conditional flow matches, the active **default** flow is used; otherwise `null`.
- `doesFlowMatchOrder` / `countMatchedProducts` are the predicate and coverage count behind it.

**Resolution** — `resolveOfferFlow(flow, offersById, context)`:

- Drops offers the audience filters exclude (`isOfferAllowed` / `filterOffers`: OOS/restricted always, plus subscribed / previously-purchased per the flow toggles + lookback), deduped by id.
- Takes the first `offerCount` survivors per step; if fewer survive, **drops the step**, preserving each survivor's `authoredIndex`.
- `nextResolvedStep` / `stepBranchAccepted` / `canAdvanceStep` walk the survivors: advance by `stepCountOnAccept` (when ≥1 offer was accepted) or `stepCountOnDecline`, gated by `minResponses`, skipping dropped steps and ending past the last. The cart honors `stepTarget` for how many steps to show.

**Input shapes** (minimal, so any representation satisfies them):

- `PurchasedLineItem` = `{ familyId, representsQuantity?, isSubscription? }`. `isSubscription` is per line (an order can mix subscription and one-time items).
- `FlowOffer` = `{ id, product: { familyId } }`.

**Resiliency model:** over-provision, then show the first N survivors — `stepTarget` at the flow level, the `offers` pool (≥ `offerCount`) at the step level. Tail entries are automatic backups.

---

## Authoring UX (Offer Config panel)

A master-detail panel (tab-access gated), backed by a shared in-memory `CollectionStore` so data loads once and survives tab switches.

**Flow list** — built for scale (hundreds of flows). Each row shows:

- Name, a **Default** badge, **Active/Inactive** status, and a **⚠ issues** badge when misconfigured (no steps, a step missing a template, or a step with no offers).
- A **targeting summary** ("Brand default", or "Targets \<product names\>") and **audience-exclusion chips**.
- A horizontal, scrollable **step strip**: per step, a template glyph + "N offers · M in pool", then each offer by name with its **quantity** and **sale / list price** (subscriptions read "3 bottles subscription"), and a **Backups** divider past `offerCount`.
- A per-row **Duplicate** action — deep-copies the flow, gives the copy a unique name, and opens it as a draft (with its default flag forced off).

Above the list: a **product filter** narrows to flows targeting a given product, and the **"Test a cart" simulator** (below).

**Flow editor** — settings (name, active, default, priority, `stepTarget`); a **targeting** editor (Purchased-Product conditions with a searchable product combobox + `representsQuantity` + `orderType`); an **audience** editor (exclusion toggles + lookback); and a drag-ordered **step sequence** (pick a template per step via a gallery with a Builder deep link, build the offer pool, set accept/decline routing and `minResponses`).

**"Test a cart" simulator** — build a mock cart (product + units + subscription/one-time) and see which flow would run and why, ranked by coverage. It calls the shared `selectOfferFlow` (hydrating each condition product's `gh.productionId` from the catalog, since fetched flows don't resolve references), so its answer matches production. It labels a **Conditional match** / **Default fallback** / **No flow**, and when a cart hits the default (or nothing), one click **creates a targeted flow pre-filled from that cart** and opens it.

Shared UI: a searchable **product combobox** (filters by name + Production ID, marks already-used products unselectable, flags products with no Production ID as unmatchable) and a custom **themed dropdown** so option lists render identically across operating systems. Product/product-group fetches page up to 500 so a large catalog is never silently truncated.

---

## Consumption contract (commerce API + cart)

- **Ingestion:** the commerce API periodically fetches active `offer-flow` config (brand-scoped) and caches a normalized snapshot.
- **Selection (per order):** reuse `selectOfferFlow` — map order lines to `PurchasedLineItem`.
- **Response:** `GET /offer/upsells/:orderId` returns pre-ordered **steps**, each with a `templateKey` (`{ model: 'offer-template', entryId }`), its resolved offers (with `type` from the catalog), and the step's `stepCountOnAccept` / `stepCountOnDecline` / `minResponses`.
- **Cart:** resolve via `resolveOfferFlow` (subscription + order history loaded before the offer step via a route resolver); for each step load the referenced template (`fetchOneBuilderEntry(model: 'offer-template', id)`) and inject its offers via `[data]` as an indexed `offers[]`; advance by the step's routing; log purchases/declines with the offer's catalog `type` for metrics.

---

## Open items

- **`offer` field type** — currently a stored offer id (text); revisit if a datasource-bound selector is wired.
- **Per-step skip conditions** — v1 routing is accept/decline only; the `conditions` pattern can extend to per-step gates later.
- **Template `[data]` contract** — confirm the runtime payload a template relies on (indexed `offers[]` with pricing/savings + shared context).
- **Localization** — whether flows/templates need per-locale variants, or brand-level is enough.
