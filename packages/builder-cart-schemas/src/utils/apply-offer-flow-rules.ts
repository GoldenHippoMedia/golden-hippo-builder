import { BuilderOfferFlowContent, OfferFlowConditionType, OfferFlowOrderType } from '../data/offer-flow.model';

export interface PurchasedLineItem {
  productionId: string;
  quantity: number;
  isSubscription: boolean;
}

type OfferFlowCondition = NonNullable<NonNullable<BuilderOfferFlowContent['data']>['conditions']>[number];
type OfferFlowConditionProduct = NonNullable<OfferFlowCondition['products']>[number];

/** True when a line item satisfies one condition-product entry, including its optional narrowing. */
const doesItemMatchConditionProduct = (item: PurchasedLineItem, entry: OfferFlowConditionProduct): boolean => {
  const productionId = entry.product?.value?.data?.gh?.productionId;
  if (!productionId || productionId !== item.productionId) return false;

  if (typeof entry.quantity === 'number' && entry.quantity > 0 && item.quantity !== entry.quantity) return false;

  switch (entry.orderType) {
    case OfferFlowOrderType.Subscription:
      return item.isSubscription;
    case OfferFlowOrderType.OneTimePurchase:
      return !item.isSubscription;
    default:
      // `Both`, and an unset value, match either.
      return true;
  }
};

/** The order's distinct products (by family id) that this flow's conditions target. */
const matchedProductionIds = (orderItems: PurchasedLineItem[], flow: BuilderOfferFlowContent): Set<string> => {
  const matched = new Set<string>();

  for (const condition of flow.data?.conditions ?? []) {
    if (condition.conditionType && condition.conditionType !== OfferFlowConditionType.PurchasedProduct) continue;

    for (const entry of condition.products ?? []) {
      for (const item of orderItems) {
        if (doesItemMatchConditionProduct(item, entry)) matched.add(item.productionId);
      }
    }
  }

  return matched;
};

export const doesFlowMatchOrder = (orderItems: PurchasedLineItem[], flow: BuilderOfferFlowContent): boolean =>
  matchedProductionIds(orderItems, flow).size > 0;

export const countMatchedProducts = (orderItems: PurchasedLineItem[], flow: BuilderOfferFlowContent): number =>
  matchedProductionIds(orderItems, flow).size;

/**
 * Highest priority first, then most recently updated, then id.
 */
const byPrecedence = (a: BuilderOfferFlowContent, b: BuilderOfferFlowContent): number =>
  (b.data?.priority ?? 0) - (a.data?.priority ?? 0) ||
  (b.lastUpdated ?? 0) - (a.lastUpdated ?? 0) ||
  (a.id ?? '').localeCompare(b.id ?? '');

export const selectOfferFlow = (
  orderItems: PurchasedLineItem[],
  flows: BuilderOfferFlowContent[],
): BuilderOfferFlowContent | null => {
  const active = flows.filter((flow) => flow.data?.active !== false);

  const matched = active
    .map((flow) => ({ flow, coverage: countMatchedProducts(orderItems, flow) }))
    .filter(({ coverage }) => coverage > 0)
    .sort((a, b) => b.coverage - a.coverage || byPrecedence(a.flow, b.flow));
  if (matched.length) return matched[0].flow;

  return active.filter((flow) => flow.data?.isDefault === true).sort(byPrecedence)[0] ?? null;
};

// TODO: offer filtering (audience exclusions, OOS/restricted) and step resolution
// (first `offerCount` survivors per step, drop partial steps, first `stepTarget` steps)
// land here once the offers datasource is wired
