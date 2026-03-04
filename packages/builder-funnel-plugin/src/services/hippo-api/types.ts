export interface HippoFunnel {
  id: string;
  type: 'Pre-purchase' | 'Post-purchase' | string | null | undefined;
  name: string;
  active: boolean;
  slug: string | null | undefined;
  steps: {
    stepNumber: number;
    slug: string;
    pageType: string;
    name: string;
    active: boolean;
    gep: string | null | undefined;
    orderForm: UpsellOrderForm | null;
  }[];
  prePurchaseOptions: PrePurchaseOption[] | null; // Pre-Purchase Only
  purchaseDetails: BaseOrderForm | null; // Post-Purchase Only
  bumpOffers: BumpOfferOrderForm[]; // Post-Purchase Only
}

interface BumpOfferOrderForm {
  orderFormId: string;
  sku: string;
  productId: string;
  productName: string;
  familyOrBundleId: string | null;
  groupId: string | null;
  unitOfMeasure: string;
  quantity: number;
  purchasePrice: number;
  listPrice: number | null;
  restrictedCountryCodes: string[];
  outOfStock: boolean;
}

interface UpsellOrderForm extends BumpOfferOrderForm {
  upsellType: 'Upsell' | 'Downsell';
}

interface BaseOrderForm extends BumpOfferOrderForm {
  trial: boolean;
  subscription: boolean;
  subscriptionFrequency: {
    scale: 'day' | 'week' | 'month' | 'year';
    publicScale: 'day' | 'week' | 'month' | 'year';
    publicCount: number;
    description: string;
    count: number;
  } | null;
  subscriptionConversionPrice: number | null;
  postTrialSubscriptionPrice: number | null;
  offerSubscriptionConversion: boolean;
  shipping: {
    domestic: number;
    international: number;
    freeShippingThreshold: number | null;
    freeShippingExclusionRule: string | null;
    enableFreeShippingReimbursement: boolean;
  };
  description: string | null;
  checkoutType: string | null;
  bannerImage: string | null;
}

interface PrePurchaseOption extends BaseOrderForm {
  destinationId: string;
}

export interface HippoDestination {
  id: string;
  type: 'Pre-purchase' | 'Post-purchase' | string | null | undefined;
  slug: string | null | undefined;
  name: string;
  description: string | null | undefined;
  defaultFunnel: {
    id: string;
  };
  splitTest: {
    id: string;
    name: string;
    slug: string | null | undefined;
    funnelOptions: {
      id: string;
      trafficAllocation: number;
      isControl: boolean;
    }[];
  } | null;
}
