import {
  BuilderOfferFlowContent,
  OfferFlowConditionType,
  OfferFlowOrderType,
  PreviousPurchaseLookback,
} from '../data/offer-flow.model';

export interface PurchasedLineItem {
  /** Salesforce id of the Product Family, matched against the condition product's `gh.productionId`. */
  familyId: string;
  representsQuantity?: number;
  isSubscription?: boolean;
}

type OfferFlowCondition = NonNullable<NonNullable<BuilderOfferFlowContent['data']>['conditions']>[number];
type OfferFlowConditionProduct = NonNullable<OfferFlowCondition['products']>[number];

const sameFamily = (a: string | undefined, b: string | undefined): boolean => !!a && !!b && a === b;

/** True when a line item satisfies one condition-product entry, including its optional narrowing. */
const doesItemMatchConditionProduct = (item: PurchasedLineItem, entry: OfferFlowConditionProduct): boolean => {
  const familyId = entry.product?.value?.data?.gh?.productionId;
  if (!sameFamily(familyId, item.familyId)) return false;

  const repQty = entry.representsQuantity;
  if (typeof repQty === 'number' && repQty > 0 && item.representsQuantity !== repQty) return false;

  switch (entry.orderType) {
    case OfferFlowOrderType.Subscription:
      return item.isSubscription === true;
    case OfferFlowOrderType.OneTimePurchase:
      return item.isSubscription === false;
    default:
      return true;
  }
};

/** The order's distinct product families that this flow's conditions target. */
const matchedFamilyIds = (orderItems: PurchasedLineItem[], flow: BuilderOfferFlowContent): Set<string> => {
  const matched = new Set<string>();

  for (const condition of flow.data?.conditions ?? []) {
    if (condition.conditionType && condition.conditionType !== OfferFlowConditionType.PurchasedProduct) continue;

    for (const entry of condition.products ?? []) {
      for (const item of orderItems) {
        if (doesItemMatchConditionProduct(item, entry)) matched.add(item.familyId);
      }
    }
  }

  return matched;
};

export const doesFlowMatchOrder = (orderItems: PurchasedLineItem[], flow: BuilderOfferFlowContent): boolean =>
  matchedFamilyIds(orderItems, flow).size > 0;

export const countMatchedProducts = (orderItems: PurchasedLineItem[], flow: BuilderOfferFlowContent): number =>
  matchedFamilyIds(orderItems, flow).size;

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

type OfferFlowStep = NonNullable<NonNullable<BuilderOfferFlowContent['data']>['steps']>[number];

export interface FlowOffer {
  id: string;
  product: {
    familyId: string;
  };
}

export interface OfferAudienceContext {
  subscribedFamilyIds?: Iterable<string>;
  previousPurchases?: { familyId: string; purchasedAt: number }[];
  now?: number;
}

export interface ResolvedOfferStep<T extends FlowOffer = FlowOffer> {
  /** Original index before audience context filters */
  authoredIndex: number;
  template: OfferFlowStep['template'];
  offers: T[];
  /** How many offers the template presents. */
  offerCount: number;
  /** Steps to jump forward when the customer accepts (>= 1). */
  stepCountOnAccept: number;
  /** Steps to jump forward when the customer declines (>= 1). */
  stepCountOnDecline: number;
  /** Offers that must be answered (accepted or declined) before advancing; clamped to `offerCount`. */
  minResponses: number;
}

const LOOKBACK_MONTHS: Record<PreviousPurchaseLookback, number> = {
  [PreviousPurchaseLookback.OneMonth]: 1,
  [PreviousPurchaseLookback.TwoMonths]: 2,
  [PreviousPurchaseLookback.ThreeMonths]: 3,
  [PreviousPurchaseLookback.SixMonths]: 6,
  [PreviousPurchaseLookback.TwelveMonths]: 12,
  [PreviousPurchaseLookback.TwentyFourMonths]: 24,
  [PreviousPurchaseLookback.Ever]: Infinity,
};

const lookbackCutoff = (lookback: PreviousPurchaseLookback | undefined, now: number): number => {
  const months = LOOKBACK_MONTHS[lookback ?? PreviousPurchaseLookback.ThreeMonths] ?? 3;
  if (!Number.isFinite(months)) return -Infinity; // "Ever" — any past purchase counts

  const from = new Date(now);
  const cutoff = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - months, 1));
  const daysInCutoffMonth = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
  cutoff.setUTCDate(Math.min(from.getUTCDate(), daysInCutoffMonth));
  cutoff.setUTCHours(from.getUTCHours(), from.getUTCMinutes(), from.getUTCSeconds(), from.getUTCMilliseconds());
  return cutoff.getTime();
};

// Check offer against audience context and determine whether to include it
export const isOfferAllowed = (
  offer: FlowOffer,
  flow: BuilderOfferFlowContent,
  context: OfferAudienceContext = {},
): boolean => {
  const familyId = offer.product?.familyId;
  if (!familyId) return true; // nothing to key an exclusion on

  if (flow.data?.excludeSubscribedProducts) {
    for (const subscribed of context.subscribedFamilyIds ?? []) {
      if (sameFamily(subscribed, familyId)) return false;
    }
  }

  if (flow.data?.excludePreviouslyPurchased) {
    const cutoff = lookbackCutoff(flow.data.previousPurchaseLookback, context.now ?? Date.now());
    for (const purchase of context.previousPurchases ?? []) {
      if (sameFamily(purchase.familyId, familyId) && purchase.purchasedAt >= cutoff) return false;
    }
  }

  return true;
};

export const filterOffers = <T extends FlowOffer>(
  offers: T[],
  flow: BuilderOfferFlowContent,
  context: OfferAudienceContext = {},
): T[] => offers.filter((offer) => isOfferAllowed(offer, flow, context));

export const resolveOfferFlow = <T extends FlowOffer>(
  flow: BuilderOfferFlowContent,
  offersById: ReadonlyMap<string, T>,
  context: OfferAudienceContext = {},
): ResolvedOfferStep<T>[] => {
  const resolved: ResolvedOfferStep<T>[] = [];

  (flow.data?.steps ?? []).forEach((step, authoredIndex) => {
    const offerCount = Math.max(1, step.template?.value?.data?.offerCount ?? 1);

    const survivors: T[] = [];
    for (const ref of step.offers ?? []) {
      const offer = ref.offer ? offersById.get(ref.offer) : undefined;
      if (offer && isOfferAllowed(offer, flow, context)) survivors.push(offer);
    }

    if (survivors.length < offerCount) return; // can't fill the template — drop the step

    resolved.push({
      authoredIndex,
      template: step.template,
      offers: survivors,
      offerCount,
      stepCountOnAccept: Math.max(1, step.stepCountOnAccept ?? 1),
      stepCountOnDecline: Math.max(1, step.stepCountOnDecline ?? 1),
      minResponses: Math.min(Math.max(1, step.minResponses ?? 1), offerCount),
    });
  });

  return resolved;
};

export const stepBranchAccepted = (acceptedCount: number): boolean => acceptedCount >= 1;

export const canAdvanceStep = (step: ResolvedOfferStep, answeredCount: number): boolean =>
  answeredCount >= step.minResponses;

export const nextResolvedStep = <T extends FlowOffer>(
  steps: ResolvedOfferStep<T>[],
  current: ResolvedOfferStep<T>,
  accepted: boolean,
): ResolvedOfferStep<T> | null => {
  const advance = accepted ? current.stepCountOnAccept : current.stepCountOnDecline;
  const target = current.authoredIndex + advance;
  return steps.find((step) => step.authoredIndex >= target) ?? null;
};
