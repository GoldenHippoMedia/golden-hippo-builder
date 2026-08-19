import { describe, expect, it } from 'vitest';
import {
  countMatchedProducts,
  doesFlowMatchOrder,
  selectOfferFlow,
  isOfferAllowed,
  filterOffers,
  resolveOfferFlow,
  nextResolvedStep,
  stepBranchAccepted,
  canAdvanceStep,
  type PurchasedLineItem,
  type FlowOffer,
  type ResolvedOfferStep,
} from './apply-offer-flow-rules';
import {
  BuilderOfferFlowContent,
  OfferFlowConditionType,
  OfferFlowOrderType,
  PreviousPurchaseLookback,
} from '../data/offer-flow.model';

type ConditionProduct = NonNullable<
  NonNullable<NonNullable<BuilderOfferFlowContent['data']>['conditions']>[number]['products']
>[number];

/** Minimal enriched product reference — only `gh.productionId` (the family id) is read by the matcher. */
const productRef = (productionId: string): ConditionProduct['product'] =>
  ({
    id: `ref-${productionId}`,
    value: { id: `entry-${productionId}`, data: { gh: { productionId } } },
  }) as ConditionProduct['product'];

const flow = (
  data: Partial<NonNullable<BuilderOfferFlowContent['data']>>,
  meta: Partial<BuilderOfferFlowContent> = {},
) => ({ id: 'flow-1', ...meta, data: { name: 'Flow', ...data } }) as BuilderOfferFlowContent;

const purchasedProduct = (products: ConditionProduct[]) => ({
  conditionType: OfferFlowConditionType.PurchasedProduct,
  products,
});

const item = (over: Partial<PurchasedLineItem> = {}): PurchasedLineItem => ({
  familyId: 'a19FAM000van',
  representsQuantity: 1,
  isSubscription: false,
  ...over,
});

describe('doesFlowMatchOrder', () => {
  it('matches on the product reference alone', () => {
    const f = flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] });
    expect(doesFlowMatchOrder([item()], f)).toBe(true);
    expect(doesFlowMatchOrder([item({ familyId: 'a19FAM000choc' })], f)).toBe(false);
  });

  // `representsQuantity` is the units the SKU ships, not the line quantity: buying one 3-jar SKU
  // is representsQuantity 3. A 3-jar condition must not fire for the 6-jar SKU.
  it('matches representsQuantity exactly, not as a threshold', () => {
    const f = flow({
      conditions: [purchasedProduct([{ product: productRef('a19FAM000van'), representsQuantity: 3 }])],
    });
    expect(doesFlowMatchOrder([item({ representsQuantity: 3 })], f)).toBe(true);
    expect(doesFlowMatchOrder([item({ representsQuantity: 6 })], f)).toBe(false);
    expect(doesFlowMatchOrder([item({ representsQuantity: 2 })], f)).toBe(false);
  });

  it('ignores an unset or non-positive representsQuantity', () => {
    const unset = flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] });
    const zero = flow({
      conditions: [purchasedProduct([{ product: productRef('a19FAM000van'), representsQuantity: 0 }])],
    });
    expect(doesFlowMatchOrder([item({ representsQuantity: 6 })], unset)).toBe(true);
    expect(doesFlowMatchOrder([item({ representsQuantity: 6 })], zero)).toBe(true);
  });

  // A caller that cannot resolve the SKU's pack size or rebill flag still matches family-only
  // conditions, but must not satisfy one that narrows on the fact it is missing.
  it('fails closed when the line lacks the narrowed fact', () => {
    const bare: PurchasedLineItem = { familyId: 'a19FAM000van' };
    const familyOnly = flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] });
    const needsQty = flow({
      conditions: [purchasedProduct([{ product: productRef('a19FAM000van'), representsQuantity: 3 }])],
    });
    const needsSub = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van'), orderType: OfferFlowOrderType.Subscription }]),
      ],
    });

    expect(doesFlowMatchOrder([bare], familyOnly)).toBe(true);
    expect(doesFlowMatchOrder([bare], needsQty)).toBe(false);
    expect(doesFlowMatchOrder([bare], needsSub)).toBe(false);
  });

  it('compares family ids exactly (case-sensitive)', () => {
    const f = flow({ conditions: [purchasedProduct([{ product: productRef('A19FAM000VAN') }])] });
    expect(doesFlowMatchOrder([item({ familyId: 'A19FAM000VAN' })], f)).toBe(true);
    expect(doesFlowMatchOrder([item({ familyId: 'a19fam000van' })], f)).toBe(false);
  });

  // Flavor lives at the family level, so each flavor is its own family and must be listed
  // separately — there is no way to target a whole family group from one product entry.
  it('treats flavors of one product as separate families', () => {
    const vanillaOnly = flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] });
    expect(doesFlowMatchOrder([item({ familyId: 'a19FAM000van' })], vanillaOnly)).toBe(true);
    expect(doesFlowMatchOrder([item({ familyId: 'a19FAM000choc' })], vanillaOnly)).toBe(false);
  });

  it('matches distinct SKUs of one family to distinct flows', () => {
    const threePack = flow({
      conditions: [purchasedProduct([{ product: productRef('a19FAM000van'), representsQuantity: 3 }])],
    });
    const sixPack = flow({
      conditions: [purchasedProduct([{ product: productRef('a19FAM000van'), representsQuantity: 6 }])],
    });
    const order = [item({ representsQuantity: 6 })];

    expect(doesFlowMatchOrder(order, threePack)).toBe(false);
    expect(doesFlowMatchOrder(order, sixPack)).toBe(true);
  });

  it('narrows by order type, with Either ignoring purchase type', () => {
    const sub = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van'), orderType: OfferFlowOrderType.Subscription }]),
      ],
    });
    const otp = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van'), orderType: OfferFlowOrderType.OneTimePurchase }]),
      ],
    });
    const either = flow({
      conditions: [purchasedProduct([{ product: productRef('a19FAM000van'), orderType: OfferFlowOrderType.Either }])],
    });

    expect(doesFlowMatchOrder([item({ isSubscription: true })], sub)).toBe(true);
    expect(doesFlowMatchOrder([item({ isSubscription: false })], sub)).toBe(false);
    expect(doesFlowMatchOrder([item({ isSubscription: false })], otp)).toBe(true);
    expect(doesFlowMatchOrder([item({ isSubscription: true })], otp)).toBe(false);
    expect(doesFlowMatchOrder([item({ isSubscription: true })], either)).toBe(true);
    expect(doesFlowMatchOrder([item({ isSubscription: false })], either)).toBe(true);
  });

  it('requires representsQuantity and order type to hold on the same line item', () => {
    const f = flow({
      conditions: [
        purchasedProduct([
          { product: productRef('a19FAM000van'), representsQuantity: 3, orderType: OfferFlowOrderType.Subscription },
        ]),
      ],
    });
    // Two items each satisfy half the entry; neither satisfies both.
    const items = [
      item({ representsQuantity: 3, isSubscription: false }),
      item({ representsQuantity: 1, isSubscription: true }),
    ];
    expect(doesFlowMatchOrder(items, f)).toBe(false);
    expect(doesFlowMatchOrder([item({ representsQuantity: 3, isSubscription: true })], f)).toBe(true);
  });

  it('ORs across products within a condition and across conditions', () => {
    const withinCondition = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van') }, { product: productRef('a19FAM000choc') }]),
      ],
    });
    const acrossConditions = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van') }]),
        purchasedProduct([{ product: productRef('a19FAM000choc') }]),
      ],
    });

    for (const f of [withinCondition, acrossConditions]) {
      expect(doesFlowMatchOrder([item({ familyId: 'a19FAM000choc' })], f)).toBe(true);
      expect(doesFlowMatchOrder([item({ familyId: 'a19FAM000other' })], f)).toBe(false);
    }
  });

  it('never matches a flow with no usable conditions', () => {
    expect(doesFlowMatchOrder([item()], flow({}))).toBe(false);
    expect(doesFlowMatchOrder([item()], flow({ conditions: [] }))).toBe(false);
    expect(doesFlowMatchOrder([item()], flow({ conditions: [purchasedProduct([])] }))).toBe(false);
  });

  it('matches on an empty order never, even with conditions configured', () => {
    const f = flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] });
    expect(doesFlowMatchOrder([], f)).toBe(false);
  });

  it('fails closed on an unrecognized condition type but honors an unset one', () => {
    const unknown = flow({
      conditions: [
        { ...purchasedProduct([{ product: productRef('a19FAM000van') }]), conditionType: 'Cart Value' as never },
      ],
    });
    const unset = flow({ conditions: [{ products: [{ product: productRef('a19FAM000van') }] }] });

    expect(doesFlowMatchOrder([item()], unknown)).toBe(false);
    expect(doesFlowMatchOrder([item()], unset)).toBe(true);
  });

  it('skips products whose reference was not enriched', () => {
    const f = flow({ conditions: [{ ...purchasedProduct([]), products: [{ product: undefined as never }] }] });
    expect(doesFlowMatchOrder([item()], f)).toBe(false);
  });
});

describe('countMatchedProducts', () => {
  const order = [item({ familyId: 'a19FAM000van' }), item({ familyId: 'a19FAM000choc' })];

  it('counts the distinct purchased products a flow targets', () => {
    const one = flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] });
    const two = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van') }, { product: productRef('a19FAM000choc') }]),
      ],
    });

    expect(countMatchedProducts(order, one)).toBe(1);
    expect(countMatchedProducts(order, two)).toBe(2);
  });

  it('ignores products the order does not contain', () => {
    const f = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van') }, { product: productRef('a19FAM000none') }]),
      ],
    });
    expect(countMatchedProducts(order, f)).toBe(1);
  });

  it('scores the same whether products are split across conditions or listed in one', () => {
    const grouped = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van') }, { product: productRef('a19FAM000choc') }]),
      ],
    });
    const split = flow({
      conditions: [
        purchasedProduct([{ product: productRef('a19FAM000van') }]),
        purchasedProduct([{ product: productRef('a19FAM000choc') }]),
      ],
    });

    expect(countMatchedProducts(order, grouped)).toBe(2);
    expect(countMatchedProducts(order, split)).toBe(2);
  });

  // Otherwise a family-wide condition would outrank a SKU-specific one just by spanning more lines.
  it('counts two SKUs of one family as a single product covered', () => {
    const twoSkusOfOneFamily = [item({ representsQuantity: 3 }), item({ representsQuantity: 6 })];
    const familyWide = flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] });
    const skuSpecific = flow({
      conditions: [purchasedProduct([{ product: productRef('a19FAM000van'), representsQuantity: 6 }])],
    });

    expect(countMatchedProducts(twoSkusOfOneFamily, familyWide)).toBe(1);
    expect(countMatchedProducts(twoSkusOfOneFamily, skuSpecific)).toBe(1);
  });

  it('is zero for a flow that matches nothing', () => {
    expect(countMatchedProducts(order, flow({}))).toBe(0);
    expect(
      countMatchedProducts([], flow({ conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])] })),
    ).toBe(0);
  });
});

describe('selectOfferFlow', () => {
  const matching = purchasedProduct([{ product: productRef('a19FAM000van') }]);

  it('prefers a matching conditional flow over the default', () => {
    const conditional = flow({ conditions: [matching] }, { id: 'conditional' });
    const fallback = flow({ isDefault: true }, { id: 'fallback' });
    expect(selectOfferFlow([item()], [fallback, conditional])?.id).toBe('conditional');
  });

  it('falls back to the default flow when nothing matches', () => {
    const conditional = flow({ conditions: [matching] }, { id: 'conditional' });
    const fallback = flow({ isDefault: true }, { id: 'fallback' });
    expect(selectOfferFlow([item({ familyId: 'a19FAM000none' })], [conditional, fallback])?.id).toBe('fallback');
  });

  it('prefers the flow covering more of the order, even over a higher priority', () => {
    const order = [item({ familyId: 'a19FAM000van' }), item({ familyId: 'a19FAM000choc' })];
    const coversOne = flow(
      { conditions: [purchasedProduct([{ product: productRef('a19FAM000van') }])], priority: 99 },
      { id: 'covers-one' },
    );
    const coversBoth = flow(
      {
        conditions: [
          purchasedProduct([{ product: productRef('a19FAM000van') }, { product: productRef('a19FAM000choc') }]),
        ],
        priority: 0,
      },
      { id: 'covers-both' },
    );

    expect(selectOfferFlow(order, [coversOne, coversBoth])?.id).toBe('covers-both');
  });

  it('falls back to priority when two flows cover the order equally', () => {
    const order = [item({ familyId: 'a19FAM000van' }), item({ familyId: 'a19FAM000choc' })];
    const both = [{ product: productRef('a19FAM000van') }, { product: productRef('a19FAM000choc') }];
    const low = flow({ conditions: [purchasedProduct(both)], priority: 1 }, { id: 'low' });
    const high = flow({ conditions: [purchasedProduct(both)], priority: 5 }, { id: 'high' });

    expect(selectOfferFlow(order, [low, high])?.id).toBe('high');
  });

  it('breaks ties among matching flows by priority, then recency, then id', () => {
    const low = flow({ conditions: [matching], priority: 1 }, { id: 'low' });
    const high = flow({ conditions: [matching], priority: 5 }, { id: 'high' });
    expect(selectOfferFlow([item()], [low, high])?.id).toBe('high');

    const older = flow({ conditions: [matching], priority: 5 }, { id: 'older', lastUpdated: 1 });
    const newer = flow({ conditions: [matching], priority: 5 }, { id: 'newer', lastUpdated: 2 });
    expect(selectOfferFlow([item()], [older, newer])?.id).toBe('newer');

    const a = flow({ conditions: [matching] }, { id: 'aaa' });
    const b = flow({ conditions: [matching] }, { id: 'bbb' });
    expect(selectOfferFlow([item()], [b, a])?.id).toBe('aaa');
  });

  it('treats a missing priority as 0', () => {
    const unset = flow({ conditions: [matching] }, { id: 'unset' });
    const negative = flow({ conditions: [matching], priority: -1 }, { id: 'negative' });
    expect(selectOfferFlow([item()], [negative, unset])?.id).toBe('unset');
  });

  it('excludes inactive flows, including an inactive default', () => {
    const inactiveMatch = flow({ conditions: [matching], active: false }, { id: 'inactive-match' });
    const fallback = flow({ isDefault: true }, { id: 'fallback' });
    expect(selectOfferFlow([item()], [inactiveMatch, fallback])?.id).toBe('fallback');

    const inactiveDefault = flow({ isDefault: true, active: false }, { id: 'inactive-default' });
    expect(selectOfferFlow([item()], [inactiveMatch, inactiveDefault])).toBeNull();
  });

  it('treats a flow with no active field as active', () => {
    const f = flow({ conditions: [matching] }, { id: 'no-active-field' });
    expect(selectOfferFlow([item()], [f])?.id).toBe('no-active-field');
  });

  it('returns null when there is no match and no default', () => {
    expect(selectOfferFlow([item()], [])).toBeNull();
    expect(selectOfferFlow([item({ familyId: 'a19FAM000none' })], [flow({ conditions: [matching] })])).toBeNull();
  });

  it('does not reorder the caller’s array', () => {
    const low = flow({ conditions: [matching], priority: 1 }, { id: 'low' });
    const high = flow({ conditions: [matching], priority: 5 }, { id: 'high' });
    const flows = [low, high];
    selectOfferFlow([item()], flows);
    expect(flows.map((f) => f.id)).toEqual(['low', 'high']);
  });
});

// --- Offer filtering & step resolution ---

const offer = (id: string, familyId: string): FlowOffer => ({ id, product: { familyId } });
const offersMap = (offers: FlowOffer[]) => new Map(offers.map((o) => [o.id, o]));

type FlowStep = NonNullable<NonNullable<BuilderOfferFlowContent['data']>['steps']>[number];
const template = (offerCount: number) => ({ value: { data: { offerCount } } }) as FlowStep['template'];
const step = (over: {
  offerCount?: number;
  offerIds?: string[];
  acc?: number;
  dec?: number;
  min?: number;
}): FlowStep => ({
  template: template(over.offerCount ?? 1),
  offers: (over.offerIds ?? []).map((id) => ({ offer: id })),
  stepCountOnAccept: over.acc,
  stepCountOnDecline: over.dec,
  minResponses: over.min,
});

describe('isOfferAllowed', () => {
  const o = offer('off-1', 'a19FAM000van');

  it('allows any offer when no exclusions are configured', () => {
    expect(isOfferAllowed(o, flow({}))).toBe(true);
    expect(isOfferAllowed(o, flow({}), { subscribedFamilyIds: ['a19FAM000van'] })).toBe(true);
  });

  it('drops an offer whose product the customer already subscribes to', () => {
    const f = flow({ excludeSubscribedProducts: true });
    expect(isOfferAllowed(o, f, { subscribedFamilyIds: ['a19FAM000van'] })).toBe(false);
    expect(isOfferAllowed(o, f, { subscribedFamilyIds: ['a19FAM000choc'] })).toBe(true);
  });

  it('matches the excluded family exactly (case-sensitive)', () => {
    const f = flow({ excludeSubscribedProducts: true });
    expect(isOfferAllowed(offer('off-1', 'a19FAM000van'), f, { subscribedFamilyIds: ['a19FAM000van'] })).toBe(false);
    expect(isOfferAllowed(offer('off-1', 'a19FAM000van'), f, { subscribedFamilyIds: ['A19FAM000VAN'] })).toBe(true);
  });

  it('drops an offer purchased within the lookback window but keeps older ones', () => {
    const now = Date.parse('2026-06-01T00:00:00Z');
    const f = flow({
      excludePreviouslyPurchased: true,
      previousPurchaseLookback: PreviousPurchaseLookback.ThreeMonths,
    });
    const recent = { familyId: 'a19FAM000van', purchasedAt: Date.parse('2026-05-01T00:00:00Z') };
    const old = { familyId: 'a19FAM000van', purchasedAt: Date.parse('2026-01-01T00:00:00Z') };
    expect(isOfferAllowed(o, f, { previousPurchases: [recent], now })).toBe(false);
    expect(isOfferAllowed(o, f, { previousPurchases: [old], now })).toBe(true);
  });

  it('excludes any past purchase when the lookback is "Ever"', () => {
    const now = Date.parse('2026-06-01T00:00:00Z');
    const f = flow({ excludePreviouslyPurchased: true, previousPurchaseLookback: PreviousPurchaseLookback.Ever });
    const ancient = { familyId: 'a19FAM000van', purchasedAt: Date.parse('2000-01-01T00:00:00Z') };
    expect(isOfferAllowed(o, f, { previousPurchases: [ancient], now })).toBe(false);
  });

  it('defaults the lookback to three months when unset', () => {
    const now = Date.parse('2026-06-01T00:00:00Z');
    const f = flow({ excludePreviouslyPurchased: true });
    const withinThree = { familyId: 'a19FAM000van', purchasedAt: Date.parse('2026-04-15T00:00:00Z') };
    const beforeThree = { familyId: 'a19FAM000van', purchasedAt: Date.parse('2026-02-15T00:00:00Z') };
    expect(isOfferAllowed(o, f, { previousPurchases: [withinThree], now })).toBe(false);
    expect(isOfferAllowed(o, f, { previousPurchases: [beforeThree], now })).toBe(true);
  });

  it('allows an offer with no family id to key an exclusion on', () => {
    const f = flow({ excludeSubscribedProducts: true });
    expect(isOfferAllowed(offer('off-1', ''), f, { subscribedFamilyIds: [''] })).toBe(true);
  });

  // Stepping back a month from a day the target month doesn't have used to overflow forward
  // ("Feb 31" → 3 Mar), shortening the window and letting a just-purchased product be offered again.
  it('clamps the lookback to the target month instead of overflowing past it', () => {
    const f = flow({
      excludePreviouslyPurchased: true,
      previousPurchaseLookback: PreviousPurchaseLookback.OneMonth,
    });
    const purchased = (iso: string) => [{ familyId: 'a19FAM000van', purchasedAt: Date.parse(iso) }];

    // 31 Mar − 1 month is 28 Feb, so a 1 Mar purchase is inside the window.
    const endOfMarch = Date.parse('2026-03-31T00:00:00Z');
    expect(isOfferAllowed(o, f, { previousPurchases: purchased('2026-03-01T00:00:00Z'), now: endOfMarch })).toBe(false);
    expect(isOfferAllowed(o, f, { previousPurchases: purchased('2026-02-27T00:00:00Z'), now: endOfMarch })).toBe(true);

    // 31 May − 1 month is 30 Apr, not 1 May.
    const endOfMay = Date.parse('2026-05-31T00:00:00Z');
    expect(isOfferAllowed(o, f, { previousPurchases: purchased('2026-04-30T00:00:00Z'), now: endOfMay })).toBe(false);
    expect(isOfferAllowed(o, f, { previousPurchases: purchased('2026-04-29T00:00:00Z'), now: endOfMay })).toBe(true);
  });

  it('keeps the boundary purchase inside the window and the one before it outside', () => {
    const f = flow({
      excludePreviouslyPurchased: true,
      previousPurchaseLookback: PreviousPurchaseLookback.ThreeMonths,
    });
    const now = Date.parse('2026-06-15T12:00:00Z');
    const at = (iso: string) => [{ familyId: 'a19FAM000van', purchasedAt: Date.parse(iso) }];

    expect(isOfferAllowed(o, f, { previousPurchases: at('2026-03-15T12:00:00Z'), now })).toBe(false);
    expect(isOfferAllowed(o, f, { previousPurchases: at('2026-03-15T11:59:59Z'), now })).toBe(true);
  });

  it('steps back across a year boundary', () => {
    const f = flow({
      excludePreviouslyPurchased: true,
      previousPurchaseLookback: PreviousPurchaseLookback.ThreeMonths,
    });
    const now = Date.parse('2026-01-31T00:00:00Z');
    const at = (iso: string) => [{ familyId: 'a19FAM000van', purchasedAt: Date.parse(iso) }];

    // 31 Jan 2026 − 3 months is 31 Oct 2025.
    expect(isOfferAllowed(o, f, { previousPurchases: at('2025-11-01T00:00:00Z'), now })).toBe(false);
    expect(isOfferAllowed(o, f, { previousPurchases: at('2025-10-30T00:00:00Z'), now })).toBe(true);
  });
});

describe('filterOffers', () => {
  it('keeps allowed offers in input order', () => {
    const f = flow({ excludeSubscribedProducts: true });
    const offers = [offer('a', 'famA'), offer('b', 'famB'), offer('c', 'famC')];
    expect(filterOffers(offers, f, { subscribedFamilyIds: ['famB'] }).map((o) => o.id)).toEqual(['a', 'c']);
  });
});

describe('resolveOfferFlow', () => {
  const offers = offersMap([offer('o1', 'famA'), offer('o2', 'famB'), offer('o3', 'famC'), offer('o4', 'famD')]);

  it('keeps a fillable step and preserves offer order — shown first, backups after', () => {
    const f = flow({ steps: [step({ offerCount: 2, offerIds: ['o1', 'o2', 'o3'] })] });
    const [resolved] = resolveOfferFlow(f, offers);
    expect(resolved.offerCount).toBe(2);
    expect(resolved.offers.map((o) => o.id)).toEqual(['o1', 'o2', 'o3']);
  });

  it('drops a step that cannot fill its template after filtering', () => {
    const f = flow({ excludeSubscribedProducts: true, steps: [step({ offerCount: 2, offerIds: ['o1', 'o2'] })] });
    expect(resolveOfferFlow(f, offers, { subscribedFamilyIds: ['famA'] })).toEqual([]);
  });

  it('preserves the authored index of survivors when a middle step drops', () => {
    const f = flow({
      excludeSubscribedProducts: true,
      steps: [step({ offerIds: ['o1'] }), step({ offerIds: ['o2'] }), step({ offerIds: ['o3'] })],
    });
    const resolved = resolveOfferFlow(f, offers, { subscribedFamilyIds: ['famB'] });
    expect(resolved.map((s) => s.authoredIndex)).toEqual([0, 2]);
  });

  // Repeating an offer in one step is never intentional, so the repeat is dropped rather than
  // allowed to occupy a second slot of the same template.
  it('counts a repeated offer once within a step', () => {
    const f = flow({ steps: [step({ offerCount: 2, offerIds: ['o1', 'o1', 'o2'] })] });
    const [resolved] = resolveOfferFlow(f, offers);
    expect(resolved.offers.map((o) => o.id)).toEqual(['o1', 'o2']);
  });

  it('drops a step that only reaches its offer count by repeating an offer', () => {
    const f = flow({ steps: [step({ offerCount: 2, offerIds: ['o1', 'o1'] })] });
    expect(resolveOfferFlow(f, offers)).toEqual([]);
  });

  it('still allows the same offer in different steps', () => {
    const f = flow({ steps: [step({ offerIds: ['o1'] }), step({ offerIds: ['o1'] })] });
    const resolved = resolveOfferFlow(f, offers);
    expect(resolved.map((s) => s.offers.map((o) => o.id))).toEqual([['o1'], ['o1']]);
  });

  it('ignores offer ids not present in the lookup', () => {
    const f = flow({ steps: [step({ offerCount: 1, offerIds: ['o1', 'missing'] })] });
    const [resolved] = resolveOfferFlow(f, offers);
    expect(resolved.offers.map((o) => o.id)).toEqual(['o1']);
  });

  it('defaults routing to +1 and clamps minResponses to the offer count', () => {
    const f = flow({ steps: [step({ offerCount: 2, offerIds: ['o1', 'o2'], min: 5 })] });
    const [resolved] = resolveOfferFlow(f, offers);
    expect(resolved.stepCountOnAccept).toBe(1);
    expect(resolved.stepCountOnDecline).toBe(1);
    expect(resolved.minResponses).toBe(2);
  });

  it('treats a missing template offer count as 1', () => {
    const f = flow({ steps: [{ offers: [{ offer: 'o1' }] } as FlowStep] });
    const [resolved] = resolveOfferFlow(f, offers);
    expect(resolved.offerCount).toBe(1);
    expect(resolved.offers.map((o) => o.id)).toEqual(['o1']);
  });
});

describe('nextResolvedStep', () => {
  const rstep = (authoredIndex: number, acc = 1, dec = 1): ResolvedOfferStep => ({
    authoredIndex,
    template: undefined,
    offers: [offer('x', 'famX')],
    offerCount: 1,
    stepCountOnAccept: acc,
    stepCountOnDecline: dec,
    minResponses: 1,
  });

  it('advances one step on both accept and decline by default', () => {
    const steps = [rstep(0), rstep(1), rstep(2)];
    expect(nextResolvedStep(steps, steps[0], true)?.authoredIndex).toBe(1);
    expect(nextResolvedStep(steps, steps[0], false)?.authoredIndex).toBe(1);
  });

  it('jumps by the accept count while decline shows the next step', () => {
    // Step 0 accepts → +2 (skip the downsell at index 1); declines → +1 (show it).
    const steps = [rstep(0, 2, 1), rstep(1), rstep(2)];
    expect(nextResolvedStep(steps, steps[0], true)?.authoredIndex).toBe(2);
    expect(nextResolvedStep(steps, steps[0], false)?.authoredIndex).toBe(1);
  });

  it('skips a dropped step by resolving to the next surviving authored index', () => {
    // Authored index 1 was dropped in resolution — a +1 jump lands on index 2.
    const steps = [rstep(0), rstep(2), rstep(3)];
    expect(nextResolvedStep(steps, steps[0], true)?.authoredIndex).toBe(2);
  });

  it('ends the flow when the jump lands past the last step', () => {
    const steps = [rstep(0), rstep(1, 5, 5)];
    expect(nextResolvedStep(steps, steps[1], true)).toBeNull();
  });
});

describe('stepBranchAccepted', () => {
  it('takes the accept path when at least one offer is accepted', () => {
    expect(stepBranchAccepted(1)).toBe(true);
    expect(stepBranchAccepted(3)).toBe(true);
    expect(stepBranchAccepted(0)).toBe(false);
  });
});

describe('canAdvanceStep', () => {
  const s = { minResponses: 2 } as ResolvedOfferStep;

  it('advances only once enough offers have been answered', () => {
    expect(canAdvanceStep(s, 1)).toBe(false);
    expect(canAdvanceStep(s, 2)).toBe(true);
    expect(canAdvanceStep(s, 3)).toBe(true);
  });
});
