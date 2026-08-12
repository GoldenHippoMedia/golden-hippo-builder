import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../../../interfaces/application-context.interface';
import BuilderApi from '@services/builder-api';
import { resolveCurrentUserTabLevel } from '@services/tab-access';
import { offerFlowStore } from '../offer-flow.store';
import { offerTemplateStore } from '../offer-template.store';
import { productStore } from '../../product-config/product-data.store';
import FlowSettingsBar from './flow-settings';
import FlowTargeting from './flow-targeting';
import FlowAudience from './flow-audience';
import FlowSteps from './flow-steps';

interface OfferFlowEditorProps {
  context: ExtendedApplicationContext;
  flow: BuilderOfferFlowContent;
  onBack: () => void;
}

const OfferFlowEditor: React.FC<OfferFlowEditorProps> = ({ context, flow, onBack }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  // A local editable draft of the flow's data. Cloned so edits don't touch the shared
  // store until Save, then persisted whole (settings, targeting, audience, and steps).
  const store = useLocalStore(() => ({
    data: JSON.parse(JSON.stringify(flow.data ?? {})) as Record<string, any>,
    dirty: false,
    saving: false,
    canWrite: true,
  }));

  useEffect(() => {
    void productStore.ensureLoaded(api);
    void offerTemplateStore.ensureLoaded(api);
    void resolveCurrentUserTabLevel(context, 'gh/offer-config').then((level) => {
      store.canWrite = level === 'write';
    });
  }, [api, context, store]);

  const set = useCallback(
    (key: string, value: unknown) => {
      store.data[key] = value;
      store.dirty = true;
    },
    [store],
  );

  const markDirty = useCallback(() => {
    store.dirty = true;
  }, [store]);

  const save = useCallback(async () => {
    if (!store.canWrite || !flow.id || !store.dirty) return;
    store.saving = true;
    try {
      const clean = JSON.parse(JSON.stringify(store.data));
      await api.saveOfferFlow(flow.id, clean);
      offerFlowStore.upsert({ ...flow, data: clean } as BuilderOfferFlowContent);
      store.dirty = false;
      await context.dialogs.alert('Offer flow saved.', 'Success');
    } catch (e) {
      await context.dialogs.alert(`Save failed: ${e instanceof Error ? e.message : String(e)}`, 'Error');
    } finally {
      store.saving = false;
    }
  }, [api, context, flow, store]);

  return useObserver(() => {
    const data = store.data;

    const saveButton = store.canWrite ? (
      <button
        disabled={!store.dirty || store.saving}
        onClick={save}
        className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[#1a1300] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
      >
        {store.saving ? 'Saving...' : 'Save'}
      </button>
    ) : (
      <span className="rounded-full bg-[var(--warning)]/15 px-3 py-1.5 text-xs font-medium text-[var(--warning)]">
        Read-only access
      </span>
    );

    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          All flows
        </button>

        {/* settings bar */}
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[var(--border-glass)] pb-5">
          <FlowSettingsBar data={data} set={set} disabled={!store.canWrite} />
          <div className="flex-1" />
          {saveButton}
        </div>

        {!store.canWrite && (
          <div className="mb-6 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--warning)]">
            You have read-only access to Offer Config. Changes can be viewed but not saved.
          </div>
        )}

        {/* flow-level config, side by side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FlowTargeting data={data} products={productStore.items} markDirty={markDirty} disabled={!store.canWrite} />
          <FlowAudience data={data} set={set} disabled={!store.canWrite} />
        </div>

        {/* step sequence */}
        <div className="mt-6">
          <FlowSteps
            data={data}
            templates={offerTemplateStore.items}
            markDirty={markDirty}
            disabled={!store.canWrite}
          />
        </div>
      </div>
    );
  });
};

export default OfferFlowEditor;
