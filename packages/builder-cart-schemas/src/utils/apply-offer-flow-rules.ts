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

export const doesFlowMatchOrder = (orderItems: PurchasedLineItem[], flow: BuilderOfferFlowContent): boolean => {
  const conditions = flow.data?.conditions;
  if (!conditions?.length || !orderItems.length) return false;

  return conditions.some((condition) => {
    if (condition.conditionType && condition.conditionType !== OfferFlowConditionType.PurchasedProduct) return false;

    return (
      condition.products?.some((entry) => orderItems.some((item) => doesItemMatchConditionProduct(item, entry))) ??
      false
    );
  });
};

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

  const matched = active.filter((flow) => doesFlowMatchOrder(orderItems, flow));
  if (matched.length) return matched.sort(byPrecedence)[0];

  return active.filter((flow) => flow.data?.isDefault === true).sort(byPrecedence)[0] ?? null;
};

// TODO: offer filtering (audience exclusions, OOS/restricted) and step resolution
// (first `offerCount` survivors per step, drop partial steps, first `stepTarget` steps)
// land here once the offers datasource is wired
