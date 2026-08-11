import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { DetailHeader, type DetailHeaderBadge } from '@goldenhippo/builder-ui';
import { BuilderOfferFlowContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../../../interfaces/application-context.interface';
import BuilderApi from '@services/builder-api';
import { resolveCurrentUserTabLevel } from '@services/tab-access';
import { offerFlowStore } from '../offer-flow.store';
import { productStore } from '../../product-config/product-data.store';
import FlowSettings from './flow-settings';
import FlowTargeting from './flow-targeting';
import FlowAudience from './flow-audience';

interface OfferFlowEditorProps {
  context: ExtendedApplicationContext;
  flow: BuilderOfferFlowContent;
  onBack: () => void;
}

const OfferFlowEditor: React.FC<OfferFlowEditorProps> = ({ context, flow, onBack }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  // A local editable draft of the flow's data. Cloned so edits don't touch the shared
  // store until Save. `steps` is carried through untouched (its editor lands in step 3).
  const store = useLocalStore(() => ({
    data: JSON.parse(JSON.stringify(flow.data ?? {})) as Record<string, any>,
    dirty: false,
    saving: false,
    canWrite: true,
  }));

  useEffect(() => {
    void productStore.ensureLoaded(api);
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
    const isActive = data.active !== false;
    const badges: DetailHeaderBadge[] = [
      { label: isActive ? 'Active' : 'Inactive', variant: isActive ? 'success' : 'ghost' },
    ];
    if (data.isDefault) badges.push({ label: 'Default', variant: 'primary' });

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
        <DetailHeader
          title={data.name || 'Untitled flow'}
          onBack={onBack}
          backLabel="All flows"
          badges={badges}
          actions={saveButton}
        />

        {!store.canWrite && (
          <div className="mb-6 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--warning)]">
            You have read-only access to Offer Config. Changes can be viewed but not saved.
          </div>
        )}

        <div className="flex flex-col gap-6">
          <FlowSettings data={data} set={set} disabled={!store.canWrite} />
          <FlowTargeting data={data} products={productStore.items} markDirty={markDirty} disabled={!store.canWrite} />
          <FlowAudience data={data} set={set} disabled={!store.canWrite} />
        </div>
      </div>
    );
  });
};

export default OfferFlowEditor;
