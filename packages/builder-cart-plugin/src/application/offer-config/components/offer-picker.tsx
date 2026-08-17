import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { type CommerceOffer } from '@services/commerce-api';
import OfferSummary, { offerName } from './offer-summary';

interface OfferPickerProps {
  step: any;
  stepLabel: string;
  offers: CommerceOffer[];
  /** Catalog fetch in flight — distinguishes "still loading" from "brand has no offers". */
  loading: boolean;
  /** Catalog fetch failed — distinguishes a broken request from an empty catalog. */
  error: string | null;
  onToggle: (offerId: string) => void;
  onClose: () => void;
}

type Filter = 'all' | 'Upsell' | 'Downsell';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Upsell', label: 'Upsell' },
  { key: 'Downsell', label: 'Downsell' },
];

const OfferPicker: React.FC<OfferPickerProps> = observer(
  ({ step, stepLabel, offers, loading, error, onToggle, onClose }) => {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');

    const poolIds = new Set<string>((step.offers ?? []).map((e: any) => e.offer).filter(Boolean));

    const matches = offers.filter((offer) => {
      if (filter !== 'all' && offer.type !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!offerName(offer).toLowerCase().includes(q) && !(offer.product?.name ?? '').toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });

    return (
      <>
        <div className="fixed inset-0 z-[55] bg-black/50" onClick={onClose} />
        <aside className="fixed right-0 top-0 z-[60] flex h-full w-[440px] max-w-[92vw] flex-col border-l border-[var(--border-glass)] bg-[var(--bg-secondary)] shadow-2xl">
          <div className="border-b border-[var(--border-glass)] p-5">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Add offers</h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">to {stepLabel}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <input
              className="hippo-input mt-4"
              placeholder="Search offers by product name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-3 inline-flex gap-1 rounded-lg border border-[var(--border-glass)] bg-[var(--input-bg)] p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    filter === f.key
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {!loading && !error && (
            <div className="px-5 py-2 text-[11px] tabular-nums text-[var(--text-muted)]">
              Showing {matches.length} of {offers.length} offers
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {error && (
              <div className="m-2 rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3">
                <div className="text-sm font-semibold text-[var(--error)]">Couldn’t load offers</div>
                <div className="mt-1 break-words text-xs text-[var(--error)]">{error}</div>
                <div className="mt-2 text-[11px] text-[var(--text-muted)]">
                  Check the API URL, credentials, and brand in the plugin settings. The browser console has the full
                  response.
                </div>
              </div>
            )}
            {loading && !error && (
              <div className="py-12 text-center text-sm text-[var(--text-muted)]">Loading offers…</div>
            )}
            {!loading && !error && matches.length === 0 && (
              <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                {offers.length === 0 ? 'This brand has no offers in the catalog.' : 'No offers match your search.'}
              </div>
            )}
            {matches.map((offer) => {
              const added = poolIds.has(offer.id);
              return (
                <div
                  key={offer.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                    added
                      ? 'border-[var(--accent)]/30 bg-[var(--accent-subtle)]'
                      : 'border-transparent hover:bg-[var(--bg-glass)]'
                  }`}
                >
                  <OfferSummary offer={offer} showProduct />
                  <button
                    onClick={() => onToggle(offer.id)}
                    aria-label={added ? 'Remove from step' : 'Add to step'}
                    className={`grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg ${
                      added
                        ? 'bg-[var(--accent)] text-[#1a1300]'
                        : 'border border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {added ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 border-t border-[var(--border-glass)] p-4">
            <span className="flex-1 text-xs text-[var(--text-secondary)]">
              <b className="text-[var(--accent)]">{(step.offers ?? []).length}</b> in this step’s pool
            </span>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#1a1300] hover:brightness-110"
            >
              Done
            </button>
          </div>
        </aside>
      </>
    );
  },
);

OfferPicker.displayName = 'OfferPicker';

export default OfferPicker;
