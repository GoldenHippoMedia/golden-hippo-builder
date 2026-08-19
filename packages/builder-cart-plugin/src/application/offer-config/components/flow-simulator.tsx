import React, { useState } from 'react';
import {
  BuilderOfferFlowContent,
  BuilderProductContent,
  countMatchedProducts,
  OfferFlowConditionType,
  OfferFlowOrderType,
  selectOfferFlow,
  type PurchasedLineItem,
} from '@goldenhippo/builder-cart-schemas';
import ProductPicker from './product-picker';
import Select from './select';
import { contentRef, productRefId } from '../refs';

const ORDER_TYPE_OPTIONS = [
  { value: 'one', label: 'One-time' },
  { value: 'sub', label: 'Subscription' },
];

type OfferFlowConditions = NonNullable<BuilderOfferFlowContent['data']>['conditions'];

interface FlowSimulatorProps {
  flows: BuilderOfferFlowContent[];
  products: BuilderProductContent[];
  productsLoading: boolean;
  productsError: string | null;
  onOpenFlow: (id: string) => void;
  onCreateFromCart: (name: string, conditions: OfferFlowConditions) => void;
}

interface CartRow {
  productId: string;
  /** Units the purchased SKU ships (maps to a condition's "represents quantity"); blank = any. */
  units: string;
  subscription: boolean;
}

/**
 * The plugin fetches flows without resolving references, but `selectOfferFlow` matches on each
 * condition product's `gh.productionId`. Inject that family id from the loaded product catalog so
 * the authoritative selector runs exactly as it does in the cart app.
 */
const hydrateFlow = (
  flow: BuilderOfferFlowContent,
  familyByEntry: Map<string, string | undefined>,
): BuilderOfferFlowContent =>
  ({
    ...flow,
    data: flow.data && {
      ...flow.data,
      conditions: flow.data.conditions?.map((condition) => ({
        ...condition,
        products: condition.products?.map((pr: any) => {
          const productionId = familyByEntry.get(productRefId(pr));
          return {
            ...pr,
            product: {
              ...(pr.product ?? {}),
              value: {
                ...(pr.product?.value ?? {}),
                data: {
                  ...(pr.product?.value?.data ?? {}),
                  gh: { ...(pr.product?.value?.data?.gh ?? {}), productionId },
                },
              },
            },
          };
        }),
      })),
    },
  }) as BuilderOfferFlowContent;

const rowToLineItem = (row: CartRow, familyByEntry: Map<string, string | undefined>): PurchasedLineItem => ({
  familyId: familyByEntry.get(row.productId) ?? '',
  representsQuantity: row.units.trim() === '' ? undefined : Number(row.units),
  isSubscription: row.subscription,
});

const iconButtonClass =
  'shrink-0 rounded-md border border-[var(--border-glass)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] cursor-pointer transition-colors hover:border-[var(--error)]/40 hover:text-[var(--error)] disabled:cursor-not-allowed disabled:opacity-40';

const FlowSimulator: React.FC<FlowSimulatorProps> = ({
  flows,
  products,
  productsLoading,
  productsError,
  onOpenFlow,
  onCreateFromCart,
}) => {
  const [open, setOpen] = useState(true);
  const [rows, setRows] = useState<CartRow[]>([{ productId: '', units: '', subscription: false }]);

  const familyByEntry = new Map<string, string | undefined>(
    products.map((p) => [p.id ?? '', p.data?.gh?.productionId]),
  );
  const nameByEntry = new Map<string, string>(products.map((p) => [p.id ?? '', p.name || p.id || 'Untitled product']));

  const activeRows = rows.filter((r) => r.productId);
  const cartItems = activeRows.map((r) => rowToLineItem(r, familyByEntry));
  const hydrated = flows.map((f) => hydrateFlow(f, familyByEntry));

  const winner = cartItems.length ? selectOfferFlow(cartItems, hydrated) : null;
  const winnerCoverage = winner ? countMatchedProducts(cartItems, winner) : 0;
  const isDefaultFallback = Boolean(winner) && winnerCoverage === 0;

  // Conditional contenders (coverage > 0), ranked the same way the selector ranks them.
  const contenders = hydrated
    .filter((f) => f.data?.active !== false)
    .map((f) => ({ flow: f, coverage: countMatchedProducts(cartItems, f) }))
    .filter((x) => x.coverage > 0)
    .sort((a, b) => b.coverage - a.coverage || (b.flow.data?.priority ?? 0) - (a.flow.data?.priority ?? 0))
    .slice(0, 5);

  const setRow = (index: number, patch: Partial<CartRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const addRow = () => setRows((prev) => [...prev, { productId: '', units: '', subscription: false }]);
  const removeRow = (index: number) =>
    setRows((prev) =>
      prev.length === 1 ? [{ productId: '', units: '', subscription: false }] : prev.filter((_, i) => i !== index),
    );

  const usedIds = activeRows.map((r) => r.productId);

  // Each cart line becomes a condition-product entry, mirroring the cart's quantity + order type.
  const cartConditions = (): OfferFlowConditions =>
    [
      {
        conditionType: OfferFlowConditionType.PurchasedProduct,
        products: activeRows.map((r) => ({
          product: contentRef('product', r.productId),
          representsQuantity: r.units.trim() === '' ? undefined : Number(r.units),
          orderType: r.subscription ? OfferFlowOrderType.Subscription : OfferFlowOrderType.OneTimePurchase,
        })),
      },
    ] as unknown as OfferFlowConditions;

  const cartFlowName = (): string => {
    const names = activeRows.map((r) => nameByEntry.get(r.productId) || 'product');
    const shown = names.slice(0, 2).join(', ');
    const extra = names.length - Math.min(2, names.length);
    return `Targets ${shown}${extra > 0 ? ` +${extra}` : ''}`;
  };

  const createButton = (
    <button
      type="button"
      onClick={() => onCreateFromCart(cartFlowName(), cartConditions())}
      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#1a1300] transition hover:brightness-110"
    >
      + Create a targeted flow for this cart
    </button>
  );

  return (
    <div className="mb-5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left"
      >
        <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--accent-subtle)] text-[13px] text-[var(--accent)]">
          🧪
        </span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Test a cart</span>
        <span className="text-xs text-[var(--text-muted)]">See which flow would run</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-auto text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-5 border-t border-[var(--border-glass)] p-4 lg:grid-cols-2">
          {/* cart builder */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Cart contents
            </div>
            <div className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <ProductPicker
                    products={products}
                    valueId={row.productId}
                    onSelect={(id) => setRow(i, { productId: id })}
                    excludeIds={usedIds}
                    loading={productsLoading}
                    error={productsError}
                  />
                  <input
                    type="number"
                    min={1}
                    className="hippo-input w-20!"
                    placeholder="Units"
                    title="Units the purchased SKU ships — matches a condition's Represents Quantity. Blank = any."
                    value={row.units}
                    onChange={(e) => setRow(i, { units: e.target.value })}
                  />
                  <Select
                    title="Order type"
                    options={ORDER_TYPE_OPTIONS}
                    value={row.subscription ? 'sub' : 'one'}
                    onChange={(value) => setRow(i, { subscription: value === 'sub' })}
                  />
                  <button
                    type="button"
                    className={iconButtonClass}
                    onClick={() => removeRow(i)}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--accent)]/40 px-3 py-1.5 cursor-pointer text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)]"
            >
              + Add product
            </button>
          </div>

          {/* result */}
          <div className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-secondary)] p-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Selected flow
            </div>

            {cartItems.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">
                Add a product to your test cart to see which flow runs.
              </p>
            ) : !winner ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--warning)]">No flow would run</span>
                </div>
                <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                  No active flow targets this cart and no default flow is set — the customer would see no post-checkout
                  offers.
                </p>
                {createButton}
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => winner.id && onOpenFlow(winner.id)}
                    className="cursor-pointer text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
                  >
                    {winner.data?.name || 'Untitled flow'}
                  </button>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isDefaultFallback
                        ? 'border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)]'
                        : 'border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]'
                    }`}
                  >
                    {isDefaultFallback ? 'Default fallback' : 'Conditional match'}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-[var(--text-secondary)]">
                  {isDefaultFallback
                    ? "No targeted flow matched this cart, so the brand's default flow runs."
                    : `This flow's targeting matched ${winnerCoverage} of your ${cartItems.length} cart product${
                        cartItems.length === 1 ? '' : 's'
                      }.`}
                </p>

                {isDefaultFallback && createButton}

                {contenders.length > 1 && (
                  <div className="mt-3 border-t border-[var(--border-glass)] pt-3">
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Ranked matches
                    </div>
                    <div className="flex flex-col gap-1">
                      {contenders.map(({ flow, coverage }) => {
                        const isWinner = flow.id === winner.id;
                        return (
                          <div key={flow.id} className="flex items-center gap-2 text-[12px]">
                            <span className={isWinner ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}>
                              {isWinner ? '▸' : '·'}
                            </span>
                            <span
                              className={`truncate ${isWinner ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                            >
                              {flow.data?.name || 'Untitled flow'}
                            </span>
                            <span className="ml-auto shrink-0 text-[var(--text-muted)]">
                              {coverage} matched · priority {flow.data?.priority ?? 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowSimulator;
