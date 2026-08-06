import { describe, expect, it } from 'vitest';
import {
  countMatchedProducts,
  doesFlowMatchOrder,
  selectOfferFlow,
  type PurchasedLineItem,
} from './apply-offer-flow-rules';
import { BuilderOfferFlowContent, OfferFlowConditionType, OfferFlowOrderType } from '../data/offer-flow.model';

type ConditionProduct = NonNullable<
  NonNullable<NonNullable<BuilderOfferFlowContent['data']>['conditions']>[number]['products']
>[number];

/** Minimal enriched product reference — only `gh.productionId` is read by the matcher. */
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
  productionId: 'PROD-A',
  quantity: 1,
  isSubscription: false,
  ...over,
});

describe('doesFlowMatchOrder', () => {
  it('matches on the product reference alone', () => {
    const f = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A') }])] });
    expect(doesFlowMatchOrder([item()], f)).toBe(true);
    expect(doesFlowMatchOrder([item({ productionId: 'PROD-B' })], f)).toBe(false);
  });

  // Quantity identifies a SKU within the product family, so a 3-pack condition must not
  // fire for the 6-pack — that separation is the whole point of exposing the field.
  it('matches quantity exactly, not as a threshold', () => {
    const f = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A'), quantity: 3 }])] });
    expect(doesFlowMatchOrder([item({ quantity: 3 })], f)).toBe(true);
    expect(doesFlowMatchOrder([item({ quantity: 6 })], f)).toBe(false);
    expect(doesFlowMatchOrder([item({ quantity: 2 })], f)).toBe(false);
  });

  it('ignores an unset or non-positive quantity', () => {
    const unset = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A') }])] });
    const zero = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A'), quantity: 0 }])] });
    expect(doesFlowMatchOrder([item({ quantity: 6 })], unset)).toBe(true);
    expect(doesFlowMatchOrder([item({ quantity: 6 })], zero)).toBe(true);
  });

  it('matches distinct SKUs of one family to distinct flows', () => {
    const threePack = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A'), quantity: 3 }])] });
    const sixPack = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A'), quantity: 6 }])] });
    const order = [item({ quantity: 6 })];

    expect(doesFlowMatchOrder(order, threePack)).toBe(false);
    expect(doesFlowMatchOrder(order, sixPack)).toBe(true);
  });

  it('narrows by order type, with Both matching either', () => {
    const sub = flow({
      conditions: [purchasedProduct([{ product: productRef('PROD-A'), orderType: OfferFlowOrderType.Subscription }])],
    });
    const otp = flow({
      conditions: [
        purchasedProduct([{ product: productRef('PROD-A'), orderType: OfferFlowOrderType.OneTimePurchase }]),
      ],
    });
    const both = flow({
      conditions: [purchasedProduct([{ product: productRef('PROD-A'), orderType: OfferFlowOrderType.Both }])],
    });

    expect(doesFlowMatchOrder([item({ isSubscription: true })], sub)).toBe(true);
    expect(doesFlowMatchOrder([item({ isSubscription: false })], sub)).toBe(false);
    expect(doesFlowMatchOrder([item({ isSubscription: false })], otp)).toBe(true);
    expect(doesFlowMatchOrder([item({ isSubscription: true })], otp)).toBe(false);
    expect(doesFlowMatchOrder([item({ isSubscription: true })], both)).toBe(true);
    expect(doesFlowMatchOrder([item({ isSubscription: false })], both)).toBe(true);
  });

  it('requires quantity and order type to hold on the same line item', () => {
    const f = flow({
      conditions: [
        purchasedProduct([{ product: productRef('PROD-A'), quantity: 3, orderType: OfferFlowOrderType.Subscription }]),
      ],
    });
    // Two items each satisfy half the entry; neither satisfies both.
    const items = [item({ quantity: 3, isSubscription: false }), item({ quantity: 1, isSubscription: true })];
    expect(doesFlowMatchOrder(items, f)).toBe(false);
    expect(doesFlowMatchOrder([item({ quantity: 3, isSubscription: true })], f)).toBe(true);
  });

  it('ORs across products within a condition and across conditions', () => {
    const withinCondition = flow({
      conditions: [purchasedProduct([{ product: productRef('PROD-A') }, { product: productRef('PROD-B') }])],
    });
    const acrossConditions = flow({
      conditions: [
        purchasedProduct([{ product: productRef('PROD-A') }]),
        purchasedProduct([{ product: productRef('PROD-B') }]),
      ],
    });

    for (const f of [withinCondition, acrossConditions]) {
      expect(doesFlowMatchOrder([item({ productionId: 'PROD-B' })], f)).toBe(true);
      expect(doesFlowMatchOrder([item({ productionId: 'PROD-C' })], f)).toBe(false);
    }
  });

  it('never matches a flow with no usable conditions', () => {
    expect(doesFlowMatchOrder([item()], flow({}))).toBe(false);
    expect(doesFlowMatchOrder([item()], flow({ conditions: [] }))).toBe(false);
    expect(doesFlowMatchOrder([item()], flow({ conditions: [purchasedProduct([])] }))).toBe(false);
  });

  it('matches on an empty order never, even with conditions configured', () => {
    const f = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A') }])] });
    expect(doesFlowMatchOrder([], f)).toBe(false);
  });

  it('fails closed on an unrecognized condition type but honors an unset one', () => {
    const unknown = flow({
      conditions: [{ ...purchasedProduct([{ product: productRef('PROD-A') }]), conditionType: 'Cart Value' as never }],
    });
    const unset = flow({ conditions: [{ products: [{ product: productRef('PROD-A') }] }] });

    expect(doesFlowMatchOrder([item()], unknown)).toBe(false);
    expect(doesFlowMatchOrder([item()], unset)).toBe(true);
  });

  it('skips products whose reference was not enriched', () => {
    const f = flow({ conditions: [{ ...purchasedProduct([]), products: [{ product: undefined as never }] }] });
    expect(doesFlowMatchOrder([item()], f)).toBe(false);
  });
});

describe('countMatchedProducts', () => {
  const order = [item({ productionId: 'PROD-A' }), item({ productionId: 'PROD-B' })];

  it('counts the distinct purchased products a flow targets', () => {
    const one = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A') }])] });
    const two = flow({
      conditions: [purchasedProduct([{ product: productRef('PROD-A') }, { product: productRef('PROD-B') }])],
    });

    expect(countMatchedProducts(order, one)).toBe(1);
    expect(countMatchedProducts(order, two)).toBe(2);
  });

  it('ignores products the order does not contain', () => {
    const f = flow({
      conditions: [purchasedProduct([{ product: productRef('PROD-A') }, { product: productRef('PROD-Z') }])],
    });
    expect(countMatchedProducts(order, f)).toBe(1);
  });

  it('scores the same whether products are split across conditions or listed in one', () => {
    const grouped = flow({
      conditions: [purchasedProduct([{ product: productRef('PROD-A') }, { product: productRef('PROD-B') }])],
    });
    const split = flow({
      conditions: [
        purchasedProduct([{ product: productRef('PROD-A') }]),
        purchasedProduct([{ product: productRef('PROD-B') }]),
      ],
    });

    expect(countMatchedProducts(order, grouped)).toBe(2);
    expect(countMatchedProducts(order, split)).toBe(2);
  });

  // Otherwise a family-wide condition would outrank a SKU-specific one just by spanning more lines.
  it('counts two SKUs of one family as a single product covered', () => {
    const twoSkusOfOneFamily = [item({ quantity: 3 }), item({ quantity: 6 })];
    const familyWide = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A') }])] });
    const skuSpecific = flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A'), quantity: 6 }])] });

    expect(countMatchedProducts(twoSkusOfOneFamily, familyWide)).toBe(1);
    expect(countMatchedProducts(twoSkusOfOneFamily, skuSpecific)).toBe(1);
  });

  it('is zero for a flow that matches nothing', () => {
    expect(countMatchedProducts(order, flow({}))).toBe(0);
    expect(
      countMatchedProducts([], flow({ conditions: [purchasedProduct([{ product: productRef('PROD-A') }])] })),
    ).toBe(0);
  });
});

describe('selectOfferFlow', () => {
  const matching = purchasedProduct([{ product: productRef('PROD-A') }]);

  it('prefers a matching conditional flow over the default', () => {
    const conditional = flow({ conditions: [matching] }, { id: 'conditional' });
    const fallback = flow({ isDefault: true }, { id: 'fallback' });
    expect(selectOfferFlow([item()], [fallback, conditional])?.id).toBe('conditional');
  });

  it('falls back to the default flow when nothing matches', () => {
    const conditional = flow({ conditions: [matching] }, { id: 'conditional' });
    const fallback = flow({ isDefault: true }, { id: 'fallback' });
    expect(selectOfferFlow([item({ productionId: 'PROD-Z' })], [conditional, fallback])?.id).toBe('fallback');
  });

  it('prefers the flow covering more of the order, even over a higher priority', () => {
    const order = [item({ productionId: 'PROD-A' }), item({ productionId: 'PROD-B' })];
    const coversOne = flow(
      { conditions: [purchasedProduct([{ product: productRef('PROD-A') }])], priority: 99 },
      { id: 'covers-one' },
    );
    const coversBoth = flow(
      {
        conditions: [purchasedProduct([{ product: productRef('PROD-A') }, { product: productRef('PROD-B') }])],
        priority: 0,
      },
      { id: 'covers-both' },
    );

    expect(selectOfferFlow(order, [coversOne, coversBoth])?.id).toBe('covers-both');
  });

  it('falls back to priority when two flows cover the order equally', () => {
    const order = [item({ productionId: 'PROD-A' }), item({ productionId: 'PROD-B' })];
    const both = [{ product: productRef('PROD-A') }, { product: productRef('PROD-B') }];
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
    expect(selectOfferFlow([item({ productionId: 'PROD-Z' })], [flow({ conditions: [matching] })])).toBeNull();
  });

  it('does not reorder the caller’s array', () => {
    const low = flow({ conditions: [matching], priority: 1 }, { id: 'low' });
    const high = flow({ conditions: [matching], priority: 5 }, { id: 'high' });
    const flows = [low, high];
    selectOfferFlow([item()], flows);
    expect(flows.map((f) => f.id)).toEqual(['low', 'high']);
  });
});
