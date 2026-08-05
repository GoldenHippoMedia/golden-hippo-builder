# Offer Flow Configuration — Design & Plan

**Status:** Draft / for review
**Branch:** `feat/upsell-config`
**Scope:** Cart only (funnels explicitly out of scope for this effort)
**Author:** David Kidwell (with Claude)

> **Terminology:** We are standardizing on **"offer"** (formerly "upsell"). The post-checkout sequence is an **offer flow**; a single item is an **offer**; the render surface is an **offer template**. Existing code names in the cart app (`Upsell[]`, `upsell.effects.ts`, etc.) still use the old term and are quoted as-is when describing the current state.

---

## 1. Goal

Let designers and marketers configure **post-checkout offer flows** and **offer templates** in Builder.io, without engineering involvement.

- **Offer flow** — the ordered series of offer _steps_ a customer walks _after_ checkout. The marketer orders the steps; the customer moves through them in sequence. A step can present one offer or several (e.g. a product at multiple quantities, or two products pitted against each other). There is no automatic branching — the flow order is the logic.
- **Offer template** — the Builder component/content used to _render_ a single offer. Designers can create as many template variants as they want; a flow pairs each offer with a template.
- **Default + conditional flows** — a brand has a default flow; marketers can create additional flows targeted to specific carts (e.g. "if they just bought Product A, show this flow").

This document scopes the **authoring experience in Builder** (this repo) in detail, and describes the **downstream API and cart-app work** at the contract level.

---

## 2. How post-checkout offers work today

Understanding the current runtime matters, because the design deliberately preserves most of it.

### Cart app (`hippo-builder-cart`, Angular 21 + NgRx)

- On checkout success, `checkout.effects.ts` dispatches `LoadUpsellsEffect({ orderId })`.
- `UpsellEffects.loadUpsellsEffect$` calls `GET {commerceApiUrl}/offer/upsells/:orderId`, which returns a **flat, pre-ordered `Upsell[]`** built by the commerce API. The whole sequence is baked into that array by the backend.
- The client walks the array by index (`activeUpsellIndex`, persisted to localStorage). **Accept/decline branching is hardcoded** in `goToNextOffer$`: decline an upsell → next downsell; accept, or after a downsell → next upsell; exhausted → `/order-confirmation`.
- The current offer shape carries a product ref + pricing, but **no template reference**.
- **One** Builder `page` at route `/offer` renders _every_ offer. The active offer is injected via the `[data]` binding and rendered by two registered components (`OfferSummaryComponent`, `OfferActionButtonGroupComponent`) that read the active offer from the store.
- `@goldenhippo/builder-cart-schemas` is currently consumed only for blog types.
- An orphaned `upsell-content` model + preview route exists in the cart app but is unused by the live flow.

### Builder side (this repo)

- A **blank** section model exists: `packages/builder-cart-schemas/src/section/upsell-template.model.ts` (`kind: 'component'`, `fields: []`, canvas at `/builder-upsell-template`). Registered via `BuilderHelper.upsellTemplate(editUrl)`, provisioned at **phase 3** in `MODEL_DEFINITIONS`. **This is the model we rename to `offer-template`** (§4.1) — it is effectively unused, so renaming is low-risk.
- Models are provisioned declaratively: `MODEL_DEFINITIONS` + `syncAllModels()` in `packages/builder-cart-plugin/src/application/admin/model-sync.ts`, driven from the Admin tab. Each definition declares a `phase` + `dependencies`; a test enforces dependencies sit in earlier phases.
- Canonical patterns to copy:
  - **List of `{ … + reference }`** — `data/product-group.model.ts` (`products` list).
  - **Discriminated union** (`select` + `showIf`-gated sub-objects + TS union) — `page/page.model.ts` (the pattern for extensible `conditions`).
  - **`gh` integration object** (`productionId`, `slug`) — `product.model.ts`, the cross-system sync key.
- Custom tab UIs are master-detail, gated by tab-access — richest example is `application/product-config/product-config.page.tsx`.

---

## 3. Decisions (confirmed)

| #   | Decision                           | Choice                                                                                                                                                                                                                                                                                                                                               | Rationale                                                                                                                                                                                                                                                             |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Flow ownership**                 | Builder is the authoring source of truth for flows and templates.                                                                                                                                                                                                                                                                                    | Marketers author flows.                                                                                                                                                                                                                                               |
| D2  | **Runtime pattern**                | The **API periodically ingests the Builder config** and produces a pre-ordered list of **steps** (each = a template key + its offers), which the cart iterates in order, loading each template.                                                                                                                                                      | Preserves "the API hands the cart an easy ordered list," but the cart's sequencing logic is replaced (see D3, §6.2) — a larger cart change than a flat offer array.                                                                                                   |
| D3  | **Progression**                    | **Linear step sequence — no accept/decline branching.** The flow is an ordered list of steps walked in order. Within a step the customer may purchase any number of the presented offers (or select one), then advance. Replaces the old upsell→downsell→upsell rule.                                                                                | Supports the observed multi-offer designs (buy-one-then-stay-for-others; pick-one-of-two). Trade-off: no automatic "downsell only on decline" — a downsell is just a placed step, or the losing side of a pick-one step. Per-step skip conditions can be added later. |
| D4  | **Offers source**                  | **Offers come from an external datasource**, wired into Builder as a data connection (in progress, assumed working). We do **not** author offer records (product/price/qty) in Builder.                                                                                                                                                              | Offer catalog + pricing stay in the commerce system; Builder only _pairs_ offers with templates and _orders_ them.                                                                                                                                                    |
| D5  | **Templates**                      | Reuse the existing bare section model, **renamed `offer-template`**. Mostly a Builder canvas; minimal config from our side. Each content entry = one selectable template variant.                                                                                                                                                                    | "The template is mostly just a template."                                                                                                                                                                                                                             |
| D6  | **Flow ↔ offer reference**         | Each flow entry = `{ offer, template }`. The **exact `offer` field type is deferred** until the offers datasource is proven; we design around the pair now.                                                                                                                                                                                          | Avoids coupling the schema to unconfirmed datasource internals.                                                                                                                                                                                                       |
| D7  | **Targeting (v1)**                 | Default flow + "purchased product/bundle is X" trigger (optionally narrowed by **quantity** and **order type** — subscription / one-time / both), priority tiebreak. **Extensible** (typed condition list) so category / cart-value can be added later.                                                                                              | Covers the stated example; additive by design.                                                                                                                                                                                                                        |
| D8  | **Multi-offer templates**          | A template declares an **`offerCount`** (how many offers it presents). The flow's unit becomes a **step** = one template + an ordered pool of **at least** `offerCount` offers (extras are backups, D13); the cart renders the first `offerCount` survivors. Enforced in the plugin UI + ingest validation (not schema-level).                       | Frequently requested; lets one screen present e.g. a 2-up or 3-up choice.                                                                                                                                                                                             |
| D9  | **Progression via action buttons** | Each accept/decline button (a registered cart component) carries a **`stepIncrement`** input: `0` = stay on the current step (keep purchasing other offers), `1` = next step, `N` = jump. Marketers wire progression per-button on the template canvas — no template-level "advance mode" field.                                                     | Fully general; subsumes the earlier `advanceBehavior` idea and the stay-vs-advance question. `stepIncrement` lives on the cart-app button component (downstream).                                                                                                     |
| D10 | **No hardcoded branching**         | The cart no longer needs any upsell→downsell logic. It **just follows the flow**: present the current step's offer(s) via its template, and move the step index by the tapped button's `stepIncrement`. The marketer's ordering + button increments are the entire sequencing logic.                                                                 | Removes `goToNextOffer$` branching outright; flow authoring replaces it.                                                                                                                                                                                              |
| D11 | **Offer type for metrics**         | Each offer entry in a step's `offers` list carries a **`type`** (`Upsell` \| `Downsell`), set by the marketer, so analytics label purchases/declines consistently regardless of the datasource. Metadata only — does not affect progression.                                                                                                         | Keeps existing upsell/downsell metrics intact under the linear model; a pick-one step can pit an upsell vs a downsell and label each.                                                                                                                                 |
| D12 | **Audience exclusions**            | Flow-level toggles: **`excludeSubscribedProducts`** and **`excludePreviouslyPurchased`** (+ `previousPurchaseLookback`: 1/2/3/6/12/24 months … Ever). OOS + restricted products are filtered **unconditionally** (no toggle). All filtering runs in the cart app with per-customer history.                                                          | Marketers control relevance; OOS/restricted are non-negotiable so need no UI.                                                                                                                                                                                         |
| D13 | **Filter resiliency**              | **Over-provision + show first N.** Ordered lists are configured longer than shown; the cart filters, then takes the first N survivors in order — the tail entries are automatic backups. `stepTarget` sets N at the flow level; a step's `offers` pool (≥ template `offerCount`) does the same at the offer level. When a list exhausts, show fewer. | One rule at both levels; "replace vs skip" collapses into it. Matches the "configure 9, show 6" instinct.                                                                                                                                                             |
| D14 | **Partial steps**                  | If filtering (after the step's offer backups) leaves fewer than the template's `offerCount`, the **whole step is dropped**; step-level backfill promotes a later step. Templates always render exactly N.                                                                                                                                            | No responsive/empty-slot design needed; the shown count stays predictable.                                                                                                                                                                                            |

---

## 4. Proposed Builder model

Two models. Offers themselves are **not** a Builder model — they come from the datasource (D4).

```
offer-flow (data)                          ← NEW
  ├─ steps: list of { template: ref → offer-template,
  │                   offers: [ { offer, type: Upsell|Downsell }, … ] }  # pool ≥ offerCount
  │         # over-provision; cart shows the first stepTarget surviving steps in order
  ├─ stepTarget                                                  # how many surviving steps to show (D13)
  ├─ excludeSubscribedProducts / excludePreviouslyPurchased(+lookback)  # audience filters (D12)
  ├─ conditions: list of typed conditions (extensible)           # flow targeting (D7)
  ├─ isDefault, priority, active, brand, gh{}
  └─ (progression = tapped button's stepIncrement — D9/D10)

offer-template (component)                 ← RENAMED from upsell-template
  ├─ offerCount: number of offer slots the template presents (D8)
  └─ designers build the layout; binds offers by index from runtime [data]
     (accept/decline buttons carry stepIncrement — cart component input, D9)

offers                                     ← external DATASOURCE (not a Builder model)
```

### 4.1 `offer-template` (rename of the existing `upsell-template` component)

- Rename: model `name` `upsell-template` → `offer-template`; `displayName` → `Offer Template`; file `upsell-template.model.ts` → `offer-template.model.ts`; factory `createUpsellTemplateModel` → `createOfferTemplateModel`; content type `BuilderUpsellTemplateContent` → `BuilderOfferTemplateContent`.
- `editingUrlLogic` route `/builder-upsell-template` → `/builder-offer-template` (**requires a matching preview route in the cart app** — see §6.2).
- **One config field, otherwise near-bare** (the value is the canvas):
  - **`offerCount`** (number, required, default `1`): how many offer slots this template presents (D8). The template binds offers **by index** from the runtime `[data]` contract (`offers[0]`, `offers[1]`, …), so the same contract covers 1-up and N-up templates.
- Progression is **not** a template field — it's driven by the accept/decline button components the designer places, each carrying a **`stepIncrement`** (D9): `0` keeps the customer on the step (e.g. a multi-offer "buy any" screen), `1` advances. Those components live in the cart app (§6.2).
- **Migration:** since Builder keys models by `name`, provisioning creates a _new_ `offer-template` model; the old unused `upsell-template` becomes orphaned and can be removed via the Admin tab's unmanaged-model tooling.

### 4.2 `offer-flow` (new `data` model)

Factory: `createOfferFlowModel(offerTemplateModelId: string /*, productModelId for conditions */): ModelShape`

| Field                        | Type                                   | Notes                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                       | text (required)                        | Internal name; `contentTitleField`.                                                                                                                                                                                                                                                                                                                                                                                           |
| `brand`                      | text (required)                        | Scopes the flow to a brand.                                                                                                                                                                                                                                                                                                                                                                                                   |
| `active`                     | boolean                                | Only active flows are ingested.                                                                                                                                                                                                                                                                                                                                                                                               |
| `isDefault`                  | boolean                                | The fallback flow for the brand when no conditional flow matches.                                                                                                                                                                                                                                                                                                                                                             |
| `priority`                   | number                                 | Tiebreak among matching conditional flows (higher wins).                                                                                                                                                                                                                                                                                                                                                                      |
| `stepTarget`                 | number (optional)                      | How many surviving **steps** (not offers) to present (D13). Configure **more** steps than this as backups; blank = show all surviving steps.                                                                                                                                                                                                                                                                                  |
| `steps`                      | list of `{ template, offers }`         | **Ordered** = the sequence. Each step: `template` = reference → `offer-template`; `offers` = an **ordered pool of at least** the template's `offerCount` (D8) — extras beyond N are backups (D13). Each offer entry = `{ offer, type }`, where `type` = `Upsell \| Downsell` (metrics, D11) and `offer` field type = **the datasource offer selector, finalized once the datasource is wired (D6)** — placeholder until then. |
| `conditions`                 | list of `{ conditionType: select, … }` | **Extensible targeting (D7).** v1: `conditionType: 'Purchased Product'` + a `products` list, `showIf`-gated. Each entry = `{ product, quantity?, orderType? }` — `quantity` blank = any quantity; `orderType` = `Subscription \| One-time Purchase \| Both` (default `Both`) so a flow can target e.g. "bought Product A as a one-time purchase". New types added as enum values + gated fields — additive.                   |
| `excludeSubscribedProducts`  | boolean                                | Cart drops offers whose product the customer already subscribes to (D12).                                                                                                                                                                                                                                                                                                                                                     |
| `excludePreviouslyPurchased` | boolean                                | Cart drops offers whose product the customer purchased within the lookback window (D12).                                                                                                                                                                                                                                                                                                                                      |
| `previousPurchaseLookback`   | select `1/2/3/6/12/24 mo … Ever`       | Lookback window, `showIf` `excludePreviouslyPurchased`. `Ever` = any past purchase.                                                                                                                                                                                                                                                                                                                                           |
| `gh`                         | object `{ productionId, slug }`        | Cross-system sync key.                                                                                                                                                                                                                                                                                                                                                                                                        |

**Content type** `BuilderOfferFlowContent` — `steps[].template` typed as `BuilderContentReference<BuilderOfferTemplateContent['data']>`; each `steps[].offers[]` entry carries `type: 'Upsell' | 'Downsell'` plus the `offer` selector (typed once the datasource shape is known).

> **`offerCount` ↔ `steps[].offers` coupling:** Builder can't enforce the count in-schema. The plugin's Offers tab requires **at least** the template's `offerCount` offers per step (extras beyond N are backups, D13); the API re-validates at ingest and flags steps that can't reach `offerCount`.

> **On the `offer` field (D6):** candidates are (a) a stored offer id/key (text/select), or (b) a datasource-bound field resolving the offer inline. Deferred until the datasource connection is confirmed; the rest of the model does not depend on the choice.

### 4.3 Wiring into schemas + provisioning

1. **`builder-cart-schemas`**
   - Rename `src/section/upsell-template.model.ts` → `offer-template.model.ts`; add `src/data/offer-flow.model.ts`.
   - Update barrels: `src/section/index.ts` (offer-template export), `src/data/index.ts` (offer-flow export), `src/index.ts`.
   - Changeset (schema packages share a linked version).
2. **`BuilderHelper`** (`builder-cart-plugin/src/core/models/builder-helper.ts`)
   - Rename `upsellTemplate(editUrl)` → `offerTemplate(editUrl)`; add `offerFlow(offerTemplateModelId)`.
3. **`MODEL_DEFINITIONS`** (`builder-cart-plugin/src/application/admin/model-sync.ts`)
   - `offer-template` — **phase 3** (component, editUrl), replacing the `upsell-template` def.
   - `offer-flow` — **phase 4**, `dependencies: ['offer-template']` (add `'product'` when purchased-product conditions land).
   - Provisioned automatically by the Admin sync UI; `model-definitions.test.ts` enforces phase ordering.

### 4.4 Filtering & resiliency (runtime contract)

All filtering runs in the cart app with the customer's subscription + purchase history (D12). The config is interpreted by **one rule applied at two levels — over-provision, then take the first N survivors in order** (D13):

1. **Filter offers.** Remove any offer whose product is OOS or restricted (always); subscribed (if `excludeSubscribedProducts`); or purchased within `previousPurchaseLookback` (if `excludePreviouslyPurchased`).
2. **Resolve each step.** Take the first `template.offerCount` surviving offers from the step's ordered pool. If fewer than `offerCount` survive, **drop the step** (D14).
3. **Resolve the flow.** Present the first `stepTarget` surviving (non-dropped) steps in order. If fewer survive, show fewer — the cart never pads beyond what's configured.

Authoring implication: to reliably show N steps, configure more than N (backups at the tail); to guarantee a 3-up step fills, add backup offers to its pool.

The cart guarantees the customer's subscription + order history are loaded before the offer step via a **route resolver**, so all of this filtering runs client-side (confirmed — the cart repo owns this).

---

## 5. Authoring UX (cart plugin)

New **"Offers"** appTab, gated by tab-access, master-detail after `product-config.page.tsx`. Two sections:

1. **Flows** (landing) — list flows grouped by brand with status (active / default / # offers). Flow detail:
   - Name, brand, active, **default** toggle, priority.
   - **Audience & resiliency** — `stepTarget` (how many steps to show), exclude-subscribed toggle, exclude-recently-purchased toggle + lookback. Helper text explains over-provisioning (configure extra steps/offers as backups; earlier = higher priority).
   - **Ordered step list** — add / reorder (drag) / remove steps. Each step = a template + its offers; picking a template with `offerCount = N` reveals N required offer slots **plus** the option to add backup offers, each filled with an offer (from the datasource) + a `type` (Upsell/Downsell) for metrics. Shows a template thumbnail and "Edit template in Builder" deep link.
   - **Conditions** editor — v1: "Purchased Product" picker, each product optionally narrowed by quantity + order type. Structured so more condition types slot in later.
   - Validation: warn if a flow has no steps, a step has **fewer** offers than its template's `offerCount`, a step has no template, `stepTarget` exceeds the configured step count (no backups), or a brand has two default flows.
2. **Templates** — list `offer-template` entries; "Create template" opens the Builder canvas (`/builder-offer-template`); preview + rename.

> Authoring-first: Builder is the source, the API reads it — no create-missing reconciliation like the funnel detail page needs.

---

## 6. Downstream work (not in this repo — scope next)

### 6.1 Commerce / cart API (`hippo-cart-api`)

- **Ingestion (periodic):** fetch `offer-flow` config from the Builder content API; cache a normalized snapshot. Offers resolve to concrete catalog offers via the datasource.
- **Flow selection (per order):** given the order's contents, pick the flow — highest-priority flow whose conditions match (v1: purchased-product), else the brand default. Evaluated per-order at request time against the cached snapshot.
- **Response change:** `GET /offer/upsells/:orderId` returns a pre-ordered list of **steps**, each with a **`templateKey`** (`{ model: 'offer-template', entryId }`) + its resolved offers. The order is authoritative — the cart presents steps exactly in sequence.

### 6.2 Cart app (`hippo-builder-cart`)

- **Remove** the `goToNextOffer$` accept/decline branching entirely (D10). Replace it with **button-driven step progression**: move the current step index by the `stepIncrement` of whichever accept/decline button the customer taps (`0` = stay, `1` = next, `N` = jump); the flow ends when the index passes the last step.
- **Add a `stepIncrement` input** to the accept/decline button components (`OfferActionButtonGroupComponent` et al.), and log purchases/declines with the offer's `type` (D11) so upsell/downsell metrics stay intact.
- **Apply audience filtering + resiliency** (§4.4): filter offers (OOS/restricted always; subscribed / recently-purchased per the flow toggles, using the customer's history), take the first `offerCount` per step (drop partial steps), and present the first `stepTarget` surviving steps. Add a **route resolver** guaranteeing subscription + order history are loaded before the offer step.
- **Change rendering:** for each step, load the referenced **template** (via `builder.service.ts` `fetchOneBuilderEntry(model: 'offer-template', id: templateEntryId)`) instead of the single `/offer` page; inject the step's offers via `[data]` as an indexed `offers[]`.
- Add the `/builder-offer-template` preview route (matches the renamed `editingUrlLogic`).
- Consume the new `builder-cart-schemas` offer types.
- Retire the single-page `/offer` fallback and the orphaned `upsell-content` model once templates are live.

---

## 7. Open questions

1. **`offer` field type (D6)** — resolve once the offers datasource connection is confirmed: stored id/key vs datasource-bound field.
2. **Conditional progression (deferred)** — v1 is purely linear (every customer walks every step). Do we need per-step skip conditions (e.g. "skip this step if the previous offer was purchased") to recover the old "downsell only on decline" behavior? Deferred; the `conditions` pattern extends to per-step gates when needed.
3. **Template addressing** — confirm `templateKey = { model: 'offer-template', entryId }`.
4. **`stepIncrement` bounds** — confirm allowed values (only `0`/`1` for v1, or arbitrary/negative for jumps and back-navigation) and end-of-flow behavior when an increment overshoots the last step.
5. **Template ↔ offer data contract** — confirm the runtime `[data]` payload a template can rely on — now an indexed `offers[]` (each with pricing, savings, etc.) plus shared context (account, MBG assets).
6. **Localization** — do flows/templates need per-locale variants, or is brand-level enough for v1?
7. **Canvas preview** — how do designers preview a template against sample offer data (N offers) in the Builder editor?

> **Resolved:** ~~Customer history availability~~ — the cart repo (owned by us) has subscription + order history at offer time; a route resolver will guarantee it's loaded, so §4.4 filtering stays client-side.

---

## 8. Milestones

| Phase | Where                  | Deliverable                                                                                                                                                                                                                                                                    |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0     | —                      | This doc + alignment on §7.                                                                                                                                                                                                                                                    |
| 1     | `builder-cart-schemas` | Rename `upsell-template` → `offer-template`; add `offer-flow` model (offer field placeholder per D6); BuilderHelper + `MODEL_DEFINITIONS` wiring; changeset; build/typecheck green.                                                                                            |
| 2     | `builder-cart-plugin`  | "Offers" tab (flows + templates master-detail) + tab-access; validation.                                                                                                                                                                                                       |
| 3     | `hippo-cart-api`       | Builder ingestion + per-order flow selection + `templateKey` in the offer response.                                                                                                                                                                                            |
| 4     | `hippo-builder-cart`   | Step rendering per template; audience filtering + over-provision/drop-partial resiliency (§4.4); `stepIncrement` on action buttons + `type`-aware metrics; `/builder-offer-template` route; consume new schema types; retire single-page fallback + orphaned `upsell-content`. |
| 5     | —                      | Rollout: seed a default flow per brand, QA step progression + within-step purchase paths, analytics parity.                                                                                                                                                                    |

Phases 1–2 are this repo and can proceed now (the `offer` field lands when the datasource is wired). Phases 3–4 are the endpoint/runtime scoping this design unblocks.
