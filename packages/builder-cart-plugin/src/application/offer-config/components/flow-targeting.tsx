import React from 'react';
import { observer } from 'mobx-react';
import { Section } from '@goldenhippo/builder-ui';
import {
  OfferFlowConditionType,
  OfferFlowOrderType,
  type BuilderProductContent,
} from '@goldenhippo/builder-cart-schemas';
import ProductPicker from './product-picker';

interface FlowTargetingProps {
  data: Record<string, any>;
  products: BuilderProductContent[];
  productsLoading: boolean;
  productsError: string | null;
  markDirty: () => void;
  disabled: boolean;
}

const PRODUCT_REF_TYPE = '@builder.io/core:Reference';
const ORDER_TYPES = Object.values(OfferFlowOrderType);

const productRefId = (entry: any): string => entry?.product?.value?.id ?? entry?.product?.id ?? '';

const iconButtonClass =
  'shrink-0 rounded-md border border-[var(--border-glass)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] cursor-pointer transition-colors hover:border-[var(--error)]/40 hover:text-[var(--error)] disabled:cursor-not-allowed disabled:opacity-40';

const addButtonClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--accent)]/40 px-3 py-1.5 cursor-pointer text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)] disabled:cursor-not-allowed disabled:opacity-40';

const FlowTargeting: React.FC<FlowTargetingProps> = observer(
  ({ data, products, productsLoading, productsError, markDirty, disabled }) => {
    const conditions: any[] = data.conditions ?? [];

    const addCondition = () => {
      if (!data.conditions) data.conditions = [];
      data.conditions.push({ conditionType: OfferFlowConditionType.PurchasedProduct, products: [] });
      markDirty();
    };
    const removeCondition = (ci: number) => {
      data.conditions.splice(ci, 1);
      markDirty();
    };
    const addProduct = (condition: any) => {
      if (!condition.products) condition.products = [];
      condition.products.push({ product: undefined, orderType: OfferFlowOrderType.Either });
      markDirty();
    };
    const removeProduct = (condition: any, pi: number) => {
      condition.products.splice(pi, 1);
      markDirty();
    };
    const setProduct = (entry: any, id: string) => {
      entry.product = id ? { '@type': PRODUCT_REF_TYPE, model: 'product', id } : undefined;
      markDirty();
    };

    return (
      <Section title="Shown when" subtitle="When any condition matches, this flow is preferred over the brand default">
        {conditions.length === 0 && (
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            No conditions — this flow applies only as the brand default (when marked Default).
          </p>
        )}

        <div className="flex flex-col gap-3">
          {conditions.map((condition, ci) => {
            const entries: any[] = condition.products ?? [];
            const usedIds = entries.map(productRefId).filter(Boolean);

            return (
              <div key={ci} className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">Condition {ci + 1} —</span>
                  <select
                    className="hippo-input w-auto! py-1! text-xs"
                    value={condition.conditionType ?? OfferFlowConditionType.PurchasedProduct}
                    disabled={disabled}
                    onChange={(e) => {
                      condition.conditionType = e.target.value;
                      markDirty();
                    }}
                  >
                    <option value={OfferFlowConditionType.PurchasedProduct}>
                      {OfferFlowConditionType.PurchasedProduct}
                    </option>
                  </select>
                  <div className="flex-1" />
                  <button
                    type="button"
                    className={iconButtonClass}
                    disabled={disabled}
                    onClick={() => removeCondition(ci)}
                  >
                    Remove
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {entries.map((entry: any, pi: number) => (
                    <div key={pi} className="flex flex-wrap items-start gap-2">
                      <ProductPicker
                        products={products}
                        valueId={productRefId(entry)}
                        onSelect={(id) => setProduct(entry, id)}
                        excludeIds={usedIds}
                        loading={productsLoading}
                        error={productsError}
                        disabled={disabled}
                        fallbackName={entry?.product?.value?.name}
                      />
                      <input
                        type="number"
                        min={1}
                        className="hippo-input w-24!"
                        placeholder="Qty"
                        title="Represents Quantity — the units the purchased SKU ships (blank = any)"
                        value={entry.representsQuantity ?? ''}
                        disabled={disabled}
                        onChange={(e) => {
                          entry.representsQuantity = e.target.value === '' ? undefined : Number(e.target.value);
                          markDirty();
                        }}
                      />
                      <select
                        className="hippo-input w-auto!"
                        title="Order type"
                        value={entry.orderType ?? OfferFlowOrderType.Either}
                        disabled={disabled}
                        onChange={(e) => {
                          entry.orderType = e.target.value;
                          markDirty();
                        }}
                      >
                        {ORDER_TYPES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={`${iconButtonClass} mt-2`}
                        disabled={disabled}
                        onClick={() => removeProduct(condition, pi)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={addButtonClass}
                    disabled={disabled}
                    onClick={() => addProduct(condition)}
                  >
                    + Product
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className={`${addButtonClass} mt-3`} disabled={disabled} onClick={addCondition}>
          + Add condition
        </button>
      </Section>
    );
  },
);

FlowTargeting.displayName = 'FlowTargeting';

export default FlowTargeting;
