import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Section } from '@goldenhippo/builder-ui';
import { type BuilderOfferTemplateContent } from '@goldenhippo/builder-cart-schemas';
import { type CommerceOffer } from '@services/commerce-api';
import OfferSummary from './offer-summary';
import OfferPicker from './offer-picker';
import TemplateGallery from './template-gallery';

interface FlowStepsProps {
  data: Record<string, any>;
  templates: BuilderOfferTemplateContent[];
  offers: CommerceOffer[];
  editUrl: string;
  markDirty: () => void;
  disabled: boolean;
}

const REF_TYPE = '@builder.io/core:Reference';

const templateRefId = (step: any): string => step?.template?.value?.id ?? step?.template?.id ?? '';

// A tiny grid standing in for the template's layout (1-up, 3-up, 4-up grid, …).
const TemplateGlyph: React.FC<{ count: number; empty?: boolean }> = ({ count, empty }) => {
  const n = empty ? 1 : Math.max(1, count);
  const cols = n <= 3 ? n : Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return (
    <div
      className={`grid h-10 w-[46px] shrink-0 gap-[3px] rounded-md border bg-[var(--bg-secondary)] p-[5px] ${
        empty ? 'border-dashed border-[var(--border-glass)]' : 'border-[var(--border-glass)]'
      }`}
      style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` }}
    >
      {Array.from({ length: n }).map((_, k) => (
        <span
          key={k}
          className="rounded-[2px]"
          style={{
            background: empty ? 'var(--border-strong)' : 'color-mix(in srgb, var(--accent) 45%, var(--border-strong))',
          }}
        />
      ))}
    </div>
  );
};

const Stepper: React.FC<{ value: number; onChange: (delta: number) => void; disabled: boolean; prefix?: string }> = ({
  value,
  onChange,
  disabled,
  prefix = '',
}) => (
  <div className="inline-flex items-center overflow-hidden rounded-md border border-[var(--border-glass)] bg-[var(--bg-secondary)]">
    <button
      type="button"
      className="grid h-6 w-6 place-items-center text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] disabled:opacity-40"
      disabled={disabled}
      onClick={() => onChange(-1)}
    >
      −
    </button>
    <span className="min-w-8 text-center font-mono text-[11px] tabular-nums text-[var(--text-primary)]">
      {prefix}
      {value}
    </span>
    <button
      type="button"
      className="grid h-6 w-6 place-items-center text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] disabled:opacity-40"
      disabled={disabled}
      onClick={() => onChange(1)}
    >
      +
    </button>
  </div>
);

const FlowSteps: React.FC<FlowStepsProps> = observer(({ data, templates, offers, editUrl, markDirty, disabled }) => {
  const steps: any[] = data.steps ?? [];
  const total = steps.length;

  const [armedIndex, setArmedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const offersById = new Map(offers.map((o) => [o.id, o]));
  const templatesById = new Map(templates.map((t) => [t.id, t]));
  const templateFor = (step: any): BuilderOfferTemplateContent | undefined => templatesById.get(templateRefId(step));
  const offerCountFor = (step: any): number => Math.max(1, templateFor(step)?.data?.offerCount ?? 1);
  const destLabel = (index: number, advance: number): string =>
    index + advance >= total ? 'Ends flow' : `Step ${index + advance + 1}`;

  const addStep = () => {
    if (!data.steps) data.steps = [];
    data.steps.push({ template: undefined, offers: [], stepCountOnAccept: 1, stepCountOnDecline: 1, minResponses: 1 });
    markDirty();
  };
  const removeStep = (index: number) => {
    data.steps.splice(index, 1);
    markDirty();
  };
  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= data.steps.length || from === to) return;
    const [moved] = data.steps.splice(from, 1);
    data.steps.splice(to, 0, moved);
    markDirty();
  };
  const bumpAdvance = (step: any, index: number, field: 'stepCountOnAccept' | 'stepCountOnDecline', delta: number) => {
    const max = total - index; // lands one past the last step = "Ends flow"
    step[field] = Math.max(1, Math.min((step[field] ?? 1) + delta, max));
    markDirty();
  };
  const bumpResponses = (step: any, delta: number) => {
    const max = offerCountFor(step);
    step.minResponses = Math.max(1, Math.min((step.minResponses ?? 1) + delta, max));
    markDirty();
  };
  const setTemplate = (step: any, id: string) => {
    step.template = id ? { '@type': REF_TYPE, model: 'offer-template', id } : undefined;
    markDirty();
  };
  const toggleOffer = (step: any, offerId: string) => {
    if (!step.offers) step.offers = [];
    const idx = step.offers.findIndex((e: any) => e.offer === offerId);
    if (idx === -1) step.offers.push({ offer: offerId });
    else step.offers.splice(idx, 1);
    markDirty();
  };
  const removeOffer = (step: any, oi: number) => {
    step.offers.splice(oi, 1);
    markDirty();
  };

  const resetDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
    setArmedIndex(null);
  };

  return (
    <>
      <Section
        title="Flow sequence"
        subtitle="Steps run in order after checkout — each routes forward on accept / decline; a jump past the last step ends the flow"
      >
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const offerCount = offerCountFor(step);
            const template = templateFor(step);
            const offers: any[] = step.offers ?? [];
            const minResponses = Math.min(step.minResponses ?? 1, offerCount);
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div className="flex shrink-0 items-center px-2 text-[var(--accent)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
                <div
                  draggable={armedIndex === index && !disabled}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => {
                    if (dragIndex !== null && dragIndex !== index) {
                      e.preventDefault();
                      setOverIndex(index);
                    }
                  }}
                  onDrop={() => {
                    if (dragIndex !== null) moveStep(dragIndex, index);
                    resetDrag();
                  }}
                  onDragEnd={resetDrag}
                  className={`flex w-[300px] shrink-0 flex-col overflow-hidden rounded-xl border bg-[var(--bg-secondary)] transition-shadow ${
                    overIndex === index && dragIndex !== index
                      ? 'border-[var(--accent)] shadow-[0_0_0_3px_var(--accent-glow)]'
                      : 'border-[var(--border-glass)]'
                  } ${dragIndex === index ? 'opacity-40' : ''}`}
                >
                  {/* header */}
                  <div className="flex items-center gap-2 border-b border-[var(--border-glass)] px-3 py-2.5">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--accent-subtle)] text-xs font-bold text-[var(--accent)]">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Step {index + 1}
                    </span>
                    <span
                      role="button"
                      aria-label="Drag to reorder"
                      title="Drag to reorder"
                      onMouseDown={() => !disabled && setArmedIndex(index)}
                      className={`cursor-grab px-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] ${disabled ? 'pointer-events-none opacity-40' : ''}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.6" />
                        <circle cx="15" cy="6" r="1.6" />
                        <circle cx="9" cy="12" r="1.6" />
                        <circle cx="15" cy="12" r="1.6" />
                        <circle cx="9" cy="18" r="1.6" />
                        <circle cx="15" cy="18" r="1.6" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      aria-label="Remove step"
                      title="Remove step"
                      disabled={disabled}
                      onClick={() => removeStep(index)}
                      className="rounded px-1 text-[var(--text-muted)] hover:text-[var(--error)] disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </div>

                  {/* template */}
                  <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && setGalleryIndex(index)}
                    onKeyDown={(e) => {
                      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setGalleryIndex(index);
                      }
                    }}
                    className={`flex items-center gap-3 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] px-3.5 py-3 ${
                      disabled ? '' : 'cursor-pointer hover:bg-[var(--bg-glass-hover)]'
                    }`}
                  >
                    <TemplateGlyph count={offerCount} empty={!template} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                        {template ? template.name || template.id : 'Pick a template…'}
                      </div>
                      {template && (
                        <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                          Presents {offerCount} offer{offerCount === 1 ? '' : 's'}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-[var(--text-secondary)]">
                      {template ? 'Change ▸' : 'Choose ▸'}
                    </span>
                  </div>

                  {/* offer pool */}
                  <div className="flex flex-1 flex-col gap-1.5 p-3">
                    <div className="mb-0.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Offer pool ({offers.length})
                      </span>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setPickerIndex(index)}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--accent)]/30 bg-[var(--accent-subtle)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)] hover:brightness-110 disabled:opacity-40"
                      >
                        + Add offers
                      </button>
                    </div>
                    {offers.length === 0 && (
                      <div className="rounded-lg border border-dashed border-[var(--border-glass)] px-3 py-2 text-center text-[11px] text-[var(--text-muted)]">
                        No offers yet
                      </div>
                    )}
                    {offers.map((entry, oi) => {
                      const offer = offersById.get(entry.offer);
                      return (
                        <React.Fragment key={oi}>
                          {oi === offerCount && offers.length > offerCount && (
                            <div className="flex items-center gap-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                              <span className="h-px flex-1 bg-[var(--border-glass)]" />
                              Backups
                              <span className="h-px flex-1 bg-[var(--border-glass)]" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-2 py-1.5">
                            {offer ? (
                              <OfferSummary offer={offer} />
                            ) : (
                              <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--text-muted)]">
                                Unknown offer: {entry.offer || '(empty)'}
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label="Remove offer"
                              disabled={disabled}
                              onClick={() => removeOffer(step, oi)}
                              className="shrink-0 rounded px-1 text-[var(--text-muted)] hover:text-[var(--error)] disabled:opacity-40"
                            >
                              ✕
                            </button>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* routing */}
                  <div className="flex flex-col gap-2 border-t border-[var(--border-glass)] bg-[var(--bg-glass)] p-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="grid h-4 w-4 place-items-center rounded bg-[var(--success)]/15 text-[9px] font-extrabold text-[var(--success)]">
                        ✓
                      </span>
                      <span
                        className="font-semibold text-[var(--text-secondary)]"
                        title="Accept path = the customer accepts at least one offer on this step"
                      >
                        On accept
                      </span>
                      <Stepper
                        value={step.stepCountOnAccept ?? 1}
                        prefix="+"
                        disabled={disabled}
                        onChange={(d) => bumpAdvance(step, index, 'stepCountOnAccept', d)}
                      />
                      <span className="ml-auto font-semibold text-[var(--success)]">
                        → {destLabel(index, step.stepCountOnAccept ?? 1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="grid h-4 w-4 place-items-center rounded bg-[var(--accent)]/15 text-[9px] font-extrabold text-[var(--accent)]">
                        ✕
                      </span>
                      <span className="font-semibold text-[var(--text-secondary)]">On decline</span>
                      <Stepper
                        value={step.stepCountOnDecline ?? 1}
                        prefix="+"
                        disabled={disabled}
                        onChange={(d) => bumpAdvance(step, index, 'stepCountOnDecline', d)}
                      />
                      <span className="ml-auto font-semibold text-[var(--accent)]">
                        → {destLabel(index, step.stepCountOnDecline ?? 1)}
                      </span>
                    </div>
                    {offerCount > 1 && (
                      <div className="flex items-center gap-2 border-t border-dashed border-[var(--border-glass)] pt-2 text-[11px] text-[var(--text-secondary)]">
                        <span>
                          Advance after <span className="font-semibold text-[var(--accent)]">{minResponses}</span> of{' '}
                          {offerCount} answered
                        </span>
                        <span className="ml-auto">
                          <Stepper value={minResponses} disabled={disabled} onChange={(d) => bumpResponses(step, d)} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          <button
            type="button"
            disabled={disabled}
            onClick={addStep}
            className={`flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-strong)] text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 ${
              steps.length ? 'ml-2 w-[130px]' : 'min-h-[300px] w-[130px]'
            }`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-current text-xl">+</span>
            Add step
          </button>
        </div>
      </Section>

      {pickerIndex !== null && steps[pickerIndex] && (
        <OfferPicker
          step={steps[pickerIndex]}
          stepLabel={`Step ${pickerIndex + 1}`}
          offers={offers}
          onToggle={(offerId) => toggleOffer(steps[pickerIndex], offerId)}
          onClose={() => setPickerIndex(null)}
        />
      )}

      {galleryIndex !== null && steps[galleryIndex] && (
        <TemplateGallery
          templates={templates}
          currentId={templateRefId(steps[galleryIndex])}
          editUrl={editUrl}
          stepLabel={`Step ${galleryIndex + 1}`}
          onSelect={(id) => {
            setTemplate(steps[galleryIndex], id);
            setGalleryIndex(null);
          }}
          onClose={() => setGalleryIndex(null)}
        />
      )}
    </>
  );
});

FlowSteps.displayName = 'FlowSteps';

export default FlowSteps;
