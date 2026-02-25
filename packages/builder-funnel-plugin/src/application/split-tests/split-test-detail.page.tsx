import React, { useState, useMemo, useCallback } from 'react';
import { BuilderFunnelSplitTestContent } from '@goldenhippo/builder-funnel-schemas';
import { DetailHeader, Section, FormField, StatusBadge } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';

interface SplitTestDetailProps {
  item: BuilderFunnelSplitTestContent;
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

interface VariantForm {
  funnelId: string;
  label: string;
}

const SplitTestDetailPage: React.FC<SplitTestDetailProps> = ({ item, data, context, onBack, onRefresh }) => {
  const d = item.data;
  const [name, setName] = useState<string>(d?.name ?? '');
  const [destinationId, setDestinationId] = useState<string>(d?.destination?.id ?? '');
  const [variants, setVariants] = useState<VariantForm[]>(
    (d?.variants ?? []).map((v) => ({
      funnelId: v.funnel?.id ?? '',
      label: v.label ?? '',
    })),
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [launching, setLaunching] = useState(false);

  const status = d?.status ?? 'draft';

  const selectedDestination = useMemo(() => {
    return data.destinations.find((dest) => dest.id === destinationId);
  }, [data.destinations, destinationId]);

  const availableFunnels = useMemo(() => {
    if (!selectedDestination) return [];
    const offerId = selectedDestination.data?.offer?.id;
    if (!offerId) return [];
    return data.funnels.filter((f) => f.data?.offer?.id === offerId);
  }, [data.funnels, selectedDestination]);

  const primaryFunnelId = selectedDestination?.data?.primaryFunnel?.id ?? '';
  const isDraft = status === 'draft';
  const isActive = status === 'active';
  const isTerminal = status === 'completed' || status === 'cancelled';
  const variantsLocked = !isDraft;

  // Check if this destination already has an active test (different from this one)
  const existingActiveTestId = selectedDestination?.data?.activeSplitTest?.id;
  const existingActiveTest = useMemo(() => {
    if (!existingActiveTestId || existingActiveTestId === item.id) return null;
    return data.splitTests.find((t) => t.id === existingActiveTestId) ?? null;
  }, [data.splitTests, existingActiveTestId, item.id]);

  const handleDestinationChange = (destId: string) => {
    if (variantsLocked) return;
    setDestinationId(destId);
    setVariants([]);
  };

  const addVariant = () => {
    if (variantsLocked) return;
    setVariants((prev) => [...prev, { funnelId: '', label: '' }]);
  };

  const removeVariant = (index: number) => {
    if (variantsLocked) return;
    if (variants[index]?.funnelId === primaryFunnelId) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
    if (variantsLocked && field === 'funnelId') return;
    if (field === 'funnelId' && variants[index]?.funnelId === primaryFunnelId) return;
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const buildVariantsPayload = () =>
    variants.map((v) => ({
      funnel: { '@type': '@builder.io/core:Reference' as const, model: 'funnel', id: v.funnelId },
      label: v.label || undefined,
    }));

  const handleSave = useCallback(async () => {
    if (!name.trim() || !destinationId || variants.length < 2 || variants.some((v) => !v.funnelId)) return;
    try {
      setSaving(true);
      const api = new BuilderApi(context);
      await api.updateContent('funnel-split-test', item.id!, {
        ...d,
        name: name.trim(),
        destination: { '@type': '@builder.io/core:Reference', model: 'funnel-destination', id: destinationId },
        status,
        variants: buildVariantsPayload(),
      });
      await onRefresh();
    } catch (err) {
      console.error('[Hippo Funnels] Error saving split test', err);
      await context.dialogs.alert('Failed to save split test. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [item, d, context, name, destinationId, status, variants, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Delete Split Test',
        text: `Type "DELETE" to confirm deleting "${name}".`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      if (confirmed !== 'DELETE') return;
      setDeleting(true);
      const api = new BuilderApi(context);

      // If this test is the active test on the destination, clear the reference
      if (isActive && selectedDestination) {
        await api.updateContent('funnel-destination', destinationId, {
          ...selectedDestination.data,
          activeSplitTest: null,
        });
      }

      await api.removeContent(item);
      onRefresh();
      onBack();
    } catch {
      // user cancelled prompt
    } finally {
      setDeleting(false);
    }
  }, [context, item, name, isActive, selectedDestination, destinationId, onBack, onRefresh]);

  const handleLaunch = useCallback(async () => {
    if (!destinationId || !selectedDestination) return;

    // If there's already an active test on this destination, double confirm
    if (existingActiveTest) {
      const existingName = existingActiveTest.data?.name ?? 'Untitled';
      try {
        const first = await context.dialogs.prompt({
          title: 'Replace Active Test',
          text: `Destination "${selectedDestination.data?.name}" already has an active test: "${existingName}". Do you want to replace it?\n\nThe existing test will be marked as completed.`,
          confirmText: 'Yes, Replace',
          cancelText: 'Cancel',
        });
        if (first === null || first === undefined) return;

        const second = await context.dialogs.prompt({
          title: 'Confirm Launch',
          text: `This will mark "${existingName}" as completed and launch "${name}" on /fst/${selectedDestination.data?.slug}. Type "LAUNCH" to confirm.`,
          confirmText: 'Launch',
          cancelText: 'Cancel',
        });
        if (second !== 'LAUNCH') return;
      } catch {
        return; // user cancelled
      }
    } else {
      try {
        const confirmed = await context.dialogs.prompt({
          title: 'Launch Split Test',
          text: `This will launch "${name}" on destination /fst/${selectedDestination.data?.slug}. Type "LAUNCH" to confirm.`,
          confirmText: 'Launch',
          cancelText: 'Cancel',
        });
        if (confirmed !== 'LAUNCH') return;
      } catch {
        return;
      }
    }

    try {
      setLaunching(true);
      const api = new BuilderApi(context);

      // Mark existing active test as completed
      if (existingActiveTest) {
        await api.updateContent('funnel-split-test', existingActiveTest.id!, {
          ...existingActiveTest.data,
          status: 'completed',
        });
      }

      // Set this test as active
      await api.updateContent('funnel-split-test', item.id!, {
        ...d,
        name: name.trim(),
        destination: { '@type': '@builder.io/core:Reference', model: 'funnel-destination', id: destinationId },
        status: 'active',
        variants: buildVariantsPayload(),
      });

      // Update destination's activeSplitTest reference
      await api.updateContent('funnel-destination', destinationId, {
        ...selectedDestination.data,
        activeSplitTest: { '@type': '@builder.io/core:Reference', model: 'funnel-split-test', id: item.id! },
      });

      await onRefresh();
    } catch (err) {
      console.error('[Hippo Funnels] Error launching split test', err);
      await context.dialogs.alert('Failed to launch split test. Please try again.');
    } finally {
      setLaunching(false);
    }
  }, [context, item, d, name, destinationId, selectedDestination, existingActiveTest, variants, onRefresh]);

  const handleStop = useCallback(async () => {
    if (!destinationId || !selectedDestination) return;
    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Stop Split Test',
        text: `This will mark "${name}" as completed and remove it from destination /fst/${selectedDestination.data?.slug}. Type "STOP" to confirm.`,
        confirmText: 'Stop Test',
        cancelText: 'Cancel',
      });
      if (confirmed !== 'STOP') return;

      setLaunching(true);
      const api = new BuilderApi(context);

      // Mark test as completed
      await api.updateContent('funnel-split-test', item.id!, {
        ...d,
        status: 'completed',
      });

      // Clear destination's activeSplitTest reference
      await api.updateContent('funnel-destination', destinationId, {
        ...selectedDestination.data,
        activeSplitTest: null,
      });

      await onRefresh();
    } catch {
      // user cancelled
    } finally {
      setLaunching(false);
    }
  }, [context, item, d, name, destinationId, selectedDestination, onRefresh]);

  const isValid = name.trim() && destinationId && variants.length >= 2 && variants.every((v) => v.funnelId);

  const statusBadgeVariant =
    status === 'active' ? 'info' : status === 'completed' ? 'success' : status === 'cancelled' ? 'error' : 'ghost';

  return (
    <div className="max-w-4xl mx-auto">
      <DetailHeader
        title={d?.name ?? 'Split Test'}
        onBack={onBack}
        badges={[{ label: status, variant: statusBadgeVariant }]}
        actions={
          <>
            {!isTerminal && (
              <button className="btn btn-error btn-outline" onClick={handleDelete} disabled={deleting || launching}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            {isDraft && (
              <button className="btn btn-primary" onClick={handleSave} disabled={!isValid || saving || launching}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </>
        }
      />

      <div className="space-y-6">
        {/* Launch / Stop Controls */}
        {isDraft && isValid && (
          <Section>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ready to launch</p>
                <p className="text-sm text-base-content/50 mt-0.5">
                  {existingActiveTest
                    ? `This will replace the active test "${existingActiveTest.data?.name}" on ${selectedDestination?.data?.name}`
                    : `Launch this test on destination /fst/${selectedDestination?.data?.slug}`}
                </p>
              </div>
              <button className="btn btn-success" onClick={handleLaunch} disabled={launching || saving}>
                {launching ? 'Launching...' : 'Launch Test'}
              </button>
            </div>
          </Section>
        )}

        {isActive && (
          <Section>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-success">Test is live</p>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Traffic on /fst/{selectedDestination?.data?.slug} is being split across {variants.length} variants
                </p>
              </div>
              <button className="btn btn-warning btn-outline" onClick={handleStop} disabled={launching}>
                {launching ? 'Stopping...' : 'Stop Test'}
              </button>
            </div>
          </Section>
        )}

        {isTerminal && (
          <Section>
            <p className="text-base-content/50">
              This test has been marked as <strong>{status}</strong>. It can no longer be modified or relaunched.
            </p>
          </Section>
        )}

        <Section title="Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Test Name" required>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isDraft}
              />
            </FormField>
            <FormField label="Destination" required>
              <select
                className="select select-bordered w-full"
                value={destinationId}
                onChange={(e) => handleDestinationChange(e.target.value)}
                disabled={!isDraft}
              >
                <option value="">Select a destination...</option>
                {data.destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.data?.name ?? 'Untitled'} (/fst/{dest.data?.slug ?? '...'})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </Section>

        <Section
          title="Variants"
          subtitle={variantsLocked ? 'Variants are locked because the test is no longer in draft' : 'Minimum 2 required'}
          actions={
            !variantsLocked ? (
              <button className="btn btn-sm btn-ghost" onClick={addVariant} disabled={!destinationId}>
                + Add Variant
              </button>
            ) : undefined
          }
        >
          {!destinationId && (
            <p className="text-base-content/50">Select a destination first to add funnel variants.</p>
          )}

          {destinationId && variants.length === 0 && (
            <p className="text-base-content/50">No variants yet. Add at least 2 funnel variants to split traffic.</p>
          )}

          {variants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Funnel *</th>
                    <th>Label</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, i) => {
                    const isPrimary = variant.funnelId === primaryFunnelId;
                    return (
                      <tr key={i}>
                        <td>
                          <select
                            className="select select-bordered select-sm w-full"
                            value={variant.funnelId}
                            onChange={(e) => updateVariant(i, 'funnelId', e.target.value)}
                            disabled={variantsLocked || isPrimary}
                          >
                            <option value="">Select funnel...</option>
                            {availableFunnels.map((funnel) => (
                              <option key={funnel.id} value={funnel.id}>
                                {funnel.data?.name ?? 'Untitled'}
                                {funnel.data?.isControl ? ' (Control)' : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="input input-bordered input-sm w-full"
                              placeholder="e.g., Control, Variant A"
                              value={variant.label}
                              onChange={(e) => updateVariant(i, 'label', e.target.value)}
                            />
                            {isPrimary && <span className="badge badge-primary badge-xs shrink-0">Primary</span>}
                          </div>
                        </td>
                        <td>
                          {!isPrimary && !variantsLocked ? (
                            <button className="btn btn-sm btn-ghost text-error" onClick={() => removeVariant(i)}>
                              Remove
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {variants.length > 0 && variants.length < 2 && (
            <p className="text-sm text-warning mt-3">Add at least one more variant.</p>
          )}
        </Section>
      </div>
    </div>
  );
};

export default SplitTestDetailPage;
