import React from 'react';
import { EmptyState, StatusBadge } from '@goldenhippo/builder-ui';
import {
  BuilderOfferFlowContent,
  BuilderOfferTemplateContent,
  BuilderProductContent,
  OfferType,
  PreviousPurchaseLookback,
} from '@goldenhippo/builder-cart-schemas';
import { type CommerceOffer } from '@services/commerce-api';
import { offerName, offerQuantityLabel } from './offer-summary';
import { productRefId, templateRefId } from '../refs';

interface OfferFlowListProps {
  flows: BuilderOfferFlowContent[];
  /** Product catalog, used to resolve targeting-condition references to names. */
  products: BuilderProductContent[];
  /** Offer templates, used to resolve each step's reference to its offer count. */
  templates: BuilderOfferTemplateContent[];
  /** Offer catalog, used to resolve each step's offer ids to names. */
  offers: CommerceOffer[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (flow: BuilderOfferFlowContent) => void;
}

/** How many offer names to show inline before collapsing the rest into a "+N". */
const MAX_OFFER_NAMES = 3;

type Step = NonNullable<NonNullable<BuilderOfferFlowContent['data']>['steps']>[number];

const productRefName = (entry: any): string | undefined => entry?.product?.value?.name;

// A tiny grid standing in for the template's layout (1-up, 2-up, 3-up grid, …),
// mirroring the glyph used in the flow editor.
const MiniGlyph: React.FC<{ count: number; empty?: boolean }> = ({ count, empty }) => {
  const n = empty ? 1 : Math.max(1, count);
  const cols = n <= 3 ? n : Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return (
    <span
      className={`grid h-9 w-9 shrink-0 gap-[2px] rounded-md border p-1.5 ${
        empty ? 'border-dashed border-[var(--border-strong)]' : 'border-[var(--border-glass)]'
      }`}
      style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` }}
    >
      {Array.from({ length: n }).map((_, k) => (
        <span
          key={k}
          className="rounded-[2px]"
          style={{
            background: empty ? 'var(--border-strong)' : 'color-mix(in srgb, var(--accent) 55%, var(--border-strong))',
          }}
        />
      ))}
    </span>
  );
};

/** Compact price: trims a whole-dollar ".00" but keeps cents when the amount has them. */
const money = (n: number | undefined): string => {
  const v = n ?? 0;
  return `$${Number.isInteger(v) ? v : v.toFixed(2)}`;
};

/** "3 bottles" or "3 bottles subscription" — quantity + packaging, flagged when it enrolls a subscription. */
const offerQtyLabel = (offer: CommerceOffer): string => {
  const base = offerQuantityLabel(offer);
  return offer.subscription ? `${base} subscription`.trim() : base;
};

// Default flows first (the brand-wide fallback), then highest priority, then name.
const byListOrder = (a: BuilderOfferFlowContent, b: BuilderOfferFlowContent): number =>
  Number(b.data?.isDefault ?? false) - Number(a.data?.isDefault ?? false) ||
  (b.data?.priority ?? 0) - (a.data?.priority ?? 0) ||
  (a.data?.name ?? '').localeCompare(b.data?.name ?? '');

// "Shows N of M steps" once a target trims the list; otherwise just the count.
const stepLabel = (flow: BuilderOfferFlowContent): string => {
  const total = flow.data?.steps?.length ?? 0;
  const target = flow.data?.stepTarget;
  if (target && target < total) return `Shows ${target} of ${total} steps`;
  return `${total} step${total === 1 ? '' : 's'}`;
};

// "Brand default" when untargeted, else the targeted products by name (first two + a count).
const targetingLabel = (flow: BuilderOfferFlowContent, nameById: Map<string, string>): string => {
  const conditions = flow.data?.conditions ?? [];
  if (conditions.length === 0) return 'Brand default';

  const names: string[] = [];
  let entries = 0;
  let unresolved = 0;
  for (const condition of conditions) {
    for (const entry of condition.products ?? []) {
      const id = productRefId(entry);
      if (!id) continue;
      entries += 1;
      const name = nameById.get(id) ?? productRefName(entry);
      if (name) {
        if (!names.includes(name)) names.push(name);
      } else {
        unresolved += 1;
      }
    }
  }

  // Conditions exist but no products are set yet — surface the half-built state.
  if (entries === 0) return `${conditions.length} condition${conditions.length === 1 ? '' : 's'}`;
  // Products are set but the catalog hasn't resolved their names — fall back to a count.
  if (names.length === 0) return `Targets ${entries} product${entries === 1 ? '' : 's'}`;

  const shown = names.slice(0, 2);
  const remaining = names.length - shown.length + unresolved;
  return `Targets ${shown.join(', ')}${remaining > 0 ? ` +${remaining}` : ''}`;
};

const exclusionChips = (flow: BuilderOfferFlowContent): string[] => {
  const chips: string[] = [];
  if (flow.data?.excludeSubscribedProducts) chips.push('Excl. subscribed');
  if (flow.data?.excludePreviouslyPurchased) {
    const lookback = flow.data?.previousPurchaseLookback;
    chips.push(
      lookback && lookback !== PreviousPurchaseLookback.Ever
        ? `Excl. purchased in ${lookback}`
        : 'Excl. previously purchased',
    );
  }
  return chips;
};

// Config problems worth flagging before a marketer clicks in.
const configWarnings = (flow: BuilderOfferFlowContent): string[] => {
  const steps: Step[] = flow.data?.steps ?? [];
  const warnings: string[] = [];
  if (steps.length === 0) {
    warnings.push('No steps configured');
    return warnings;
  }
  const noTemplate = steps.filter((s) => !templateRefId(s)).length;
  if (noTemplate) warnings.push(`${noTemplate} step${noTemplate === 1 ? '' : 's'} missing a template`);
  const noOffers = steps.filter((s) => (s.offers?.length ?? 0) === 0).length;
  if (noOffers) warnings.push(`${noOffers} step${noOffers === 1 ? '' : 's'} with no offers`);
  return warnings;
};

const OfferFlowList: React.FC<OfferFlowListProps> = ({
  flows,
  products,
  templates,
  offers,
  onSelect,
  onCreate,
  onDuplicate,
}) => {
  if (flows.length === 0) {
    return (
      <EmptyState
        message="No offer flows yet. Create one to start building a post-checkout offer sequence."
        action={{ label: '+ New flow', onClick: onCreate }}
      />
    );
  }

  const nameById = new Map<string, string>(products.map((p) => [p.id ?? '', p.name || p.id || 'Untitled product']));
  // How many offers each template presents (its "N-up" shape), by entry id.
  const offerCountById = new Map<string, number>(
    templates.map((t) => [t.id ?? '', Math.max(1, t.data?.offerCount ?? 1)]),
  );
  // Full offer record for each id in the catalog, for name + quantity + price.
  const offerById = new Map<string, CommerceOffer>(offers.map((o) => [o.id, o]));
  const sorted = [...flows].sort(byListOrder);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((flow) => {
        const isActive = flow.data?.active !== false;
        const isDefault = flow.data?.isDefault === true;
        const chips = exclusionChips(flow);
        const warnings = configWarnings(flow);
        const steps: Step[] = flow.data?.steps ?? [];
        return (
          <div
            key={flow.id}
            role="button"
            tabIndex={0}
            onClick={() => flow.id && onSelect(flow.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (flow.id) onSelect(flow.id);
              }
            }}
            className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 py-3 text-left transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--bg-glass-hover)] focus:outline-none focus-visible:border-[var(--accent)]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {flow.data?.name || 'Untitled flow'}
                </span>
                {isDefault && (
                  <span className="rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    Default
                  </span>
                )}
                <StatusBadge status={isActive ? 'active' : 'neutral'} label={isActive ? 'Active' : 'Inactive'} />
                {warnings.length > 0 && (
                  <span
                    aria-label={warnings.join('; ')}
                    title={warnings.join('\n')}
                    className="inline-flex shrink-0 cursor-help items-center gap-1 rounded border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--warning)]"
                  >
                    ⚠ {warnings.length} issue{warnings.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
                <span>{stepLabel(flow)}</span>
                <span>Priority {flow.data?.priority ?? 0}</span>
                <span className="truncate">{targetingLabel(flow, nameById)}</span>
              </div>
              {chips.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded border border-[var(--border-glass)] bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              {steps.length > 0 && (
                // Steps run left-to-right; the strip scrolls horizontally when a flow has many.
                <div className="mt-2 flex items-stretch gap-1.5 overflow-x-auto pb-1">
                  {steps.map((step, i) => {
                    const hasTemplate = Boolean(templateRefId(step));
                    const offerCount = offerCountById.get(templateRefId(step)) ?? 1;
                    const poolSize = step.offers?.length ?? 0;
                    const backups = hasTemplate ? Math.max(0, poolSize - offerCount) : 0;
                    const title = hasTemplate
                      ? `Step ${i + 1} — presents ${offerCount} offer${offerCount === 1 ? '' : 's'}, ${poolSize} in pool` +
                        (backups > 0 ? ` (${backups} backup${backups === 1 ? '' : 's'})` : '')
                      : `Step ${i + 1} — no template, ${poolSize} in pool`;
                    const entries = (step.offers ?? [])
                      .map((e) => e?.offer)
                      .filter((id): id is string => Boolean(id))
                      .map((id) => ({ id, offer: offerById.get(id) }));
                    const shown = entries.slice(0, MAX_OFFER_NAMES);
                    const more = entries.length - shown.length;
                    // The first `offerCount` offers are live; the rest are backups.
                    const backupBoundary = hasTemplate && entries.length > offerCount ? offerCount : -1;
                    const stepLabelClass =
                      'mb-1 pl-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]';
                    return (
                      <React.Fragment key={i}>
                        {i > 0 && (
                          // Matches the step column so the arrow lines up with the card, not the label.
                          <div className="flex shrink-0 flex-col" aria-hidden>
                            <span className={`${stepLabelClass} opacity-0`}>Step</span>
                            <span className="flex flex-1 items-center px-0.5 text-[var(--text-muted)]">→</span>
                          </div>
                        )}
                        <div className="flex shrink-0 flex-col">
                          <span className={stepLabelClass}>Step {i + 1}</span>
                          <div className="flex w-[200px] flex-1 flex-col rounded-lg border border-[var(--border-glass)] bg-[var(--bg-secondary)] p-2">
                            <div className="flex items-center gap-2" title={title}>
                              <MiniGlyph count={offerCount} empty={!hasTemplate} />
                              <span className="truncate text-[11px] font-medium text-[var(--text-secondary)]">
                                {hasTemplate ? `${offerCount} offer${offerCount === 1 ? '' : 's'}` : 'No template'}
                                <span className="text-[var(--text-muted)]"> · {poolSize} in pool</span>
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-col gap-1">
                              {entries.length === 0 ? (
                                <span className="text-[11px] italic text-[var(--text-muted)]">No offers</span>
                              ) : (
                                <>
                                  {shown.map(({ id, offer }, ni) => {
                                    const name = offer ? offerName(offer) : id;
                                    const isUpsell = offer?.type === OfferType.Upsell;
                                    return (
                                      <React.Fragment key={ni}>
                                        {ni === backupBoundary && (
                                          <div className="my-0.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                            <span className="h-px flex-1 bg-[var(--border-glass)]" />
                                            Backups
                                            <span className="h-px flex-1 bg-[var(--border-glass)]" />
                                          </div>
                                        )}
                                        <div className="flex items-start gap-1.5">
                                          <span
                                            className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${
                                              offer
                                                ? isUpsell
                                                  ? 'bg-[var(--success)]'
                                                  : 'bg-[#60a5fa]'
                                                : 'bg-[var(--text-muted)]'
                                            }`}
                                            title={offer ? offer.type : undefined}
                                          />
                                          <div className="min-w-0">
                                            <div
                                              className="truncate text-[11px] text-[var(--text-primary)]"
                                              title={name}
                                            >
                                              {name}
                                            </div>
                                            {offer && (
                                              <div className="text-[10px] text-[var(--text-muted)]">
                                                <span className="text-[var(--text-secondary)]">
                                                  {offerQtyLabel(offer)}
                                                </span>
                                                {' · '}
                                                <span className="line-through">{money(offer.retailPrice)}</span>{' '}
                                                <span className="font-semibold text-[var(--text-secondary)]">
                                                  {money(offer.salePrice)}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </React.Fragment>
                                    );
                                  })}
                                  {more > 0 && (
                                    <span className="pl-3 text-[10px] text-[var(--text-muted)]">+{more} more</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                title="Duplicate this flow"
                aria-label="Duplicate this flow"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(flow);
                }}
                className="cursor-pointer rounded-md p-1.5 text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)] focus-visible:opacity-100 group-hover:opacity-100"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-secondary)]"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OfferFlowList;
