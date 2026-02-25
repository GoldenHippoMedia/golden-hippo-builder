import React, { useState, useCallback, useMemo } from 'react';
import { BuilderFunnelSplitTestContent } from '@goldenhippo/builder-funnel-schemas';
import { PageHeader, Section, FormField, EmptyState, StatusBadge, LoadingSection } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import SplitTestDetailPage from './split-test-detail.page';

interface SplitTestsPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

const SplitTestsPage: React.FC<SplitTestsPageProps> = ({ data, context, onRefresh }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDestinationId, setFormDestinationId] = useState('');
  const [formVariantIds, setFormVariantIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return data.splitTests.find((t) => t.id === selectedId) ?? null;
  }, [data.splitTests, selectedId]);

  if (selectedItem) {
    return (
      <SplitTestDetailPage
        item={selectedItem}
        data={data}
        context={context}
        onBack={() => setSelectedId(null)}
        onRefresh={onRefresh}
      />
    );
  }

  const selectedDestination = data.destinations.find((d) => d.id === formDestinationId);
  const primaryFunnelId = selectedDestination?.data?.primaryFunnel?.id ?? '';

  const availableFunnels = (() => {
    if (!selectedDestination) return [];
    const offerId = selectedDestination.data?.offer?.id;
    if (!offerId) return [];
    return data.funnels.filter((f) => f.data?.offer?.id === offerId);
  })();

  // All selected variant IDs = primary funnel (locked) + user-selected extras
  const allVariantIds = primaryFunnelId
    ? [primaryFunnelId, ...formVariantIds.filter((id) => id !== primaryFunnelId)]
    : formVariantIds;

  const hasActiveTest = (destId: string) => {
    const dest = data.destinations.find((d) => d.id === destId);
    return !!dest?.data?.activeSplitTest?.id;
  };

  const getDestinationName = (test: BuilderFunnelSplitTestContent) => {
    const destId = test.data?.destination?.id;
    if (!destId) return 'Unknown';
    const dest = data.destinations.find((d) => d.id === destId);
    return dest?.data?.name ?? 'Unknown';
  };

  const getDestinationSlug = (test: BuilderFunnelSplitTestContent) => {
    const destId = test.data?.destination?.id;
    if (!destId) return '';
    const dest = data.destinations.find((d) => d.id === destId);
    return dest?.data?.slug ?? '';
  };

  const toggleVariant = (funnelId: string) => {
    // Can't toggle the primary funnel
    if (funnelId === primaryFunnelId) return;
    setFormVariantIds((prev) => (prev.includes(funnelId) ? prev.filter((id) => id !== funnelId) : [...prev, funnelId]));
  };

  const handleDestinationChange = (destId: string) => {
    setFormDestinationId(destId);
    setFormVariantIds([]);
  };

  const handleCreateSplitTest = async () => {
    if (!formName.trim() || !formDestinationId || allVariantIds.length < 2) return;
    try {
      setCreating(true);
      const api = new BuilderApi(context);
      const variants = allVariantIds.map((funnelId) => {
        const funnel = data.funnels.find((f) => f.id === funnelId);
        const isPrimary = funnelId === primaryFunnelId;
        return {
          funnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: funnelId },
          label: isPrimary ? 'Primary' : funnel?.data?.isControl ? 'Control' : (funnel?.data?.name ?? 'Variant'),
        };
      });
      const newContent = await api.createContent('funnel-split-test', formName.trim(), {
        name: formName.trim(),
        destination: { '@type': '@builder.io/core:Reference', model: 'funnel-destination', id: formDestinationId },
        status: 'draft',
        variants,
      });
      const newId = newContent.id ?? null;
      setShowCreateForm(false);
      setFormName('');
      setFormDestinationId('');
      setFormVariantIds([]);
      await onRefresh();
      setTimeout(() => {
        setCreating(false);
        setSelectedId(newId);
      }, 0);
    } catch (err) {
      console.error('[Hippo Funnels] Error creating split test', err);
      setCreating(false);
      await context.dialogs.alert('Failed to create split test. Please try again.');
    }
  };

  const canCreate = data.destinations.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Split Tests"
        actions={
          <>
            <button className="btn btn-ghost" onClick={onRefresh}>
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={!canCreate}
              title={!canCreate ? 'Create a destination first' : undefined}
            >
              + New Split Test
            </button>
          </>
        }
      />

      {showCreateForm && (
        <Section
          title="Create New Split Test"
          subtitle="Split traffic across funnel variants on a destination. Select at least 2 funnel variants."
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Test Name" required>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder='e.g., "Pricing Test Jan 2026"'
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </FormField>
            <FormField label="Destination" required>
              <select
                className="select select-bordered w-full"
                value={formDestinationId}
                onChange={(e) => handleDestinationChange(e.target.value)}
              >
                <option value="">Select a destination...</option>
                {data.destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.data?.name ?? 'Untitled'} (/fst/{dest.data?.slug ?? '...'})
                    {hasActiveTest(dest.id!) ? ' \u2014 has active test' : ''}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {formDestinationId && availableFunnels.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-base-content/80 mb-3 block">
                Funnel Variants<span className="text-error ml-0.5">*</span>{' '}
                <span className="text-base-content/50 font-normal">(select at least 1 additional variant)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFunnels.map((funnel) => {
                  const isPrimary = funnel.id === primaryFunnelId;
                  const isSelected = isPrimary || formVariantIds.includes(funnel.id!);
                  return (
                    <label
                      key={funnel.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                        isPrimary
                          ? 'border-primary bg-primary/10 cursor-default'
                          : isSelected
                            ? 'border-primary bg-primary/10 cursor-pointer'
                            : 'border-base-300 hover:border-base-content/30 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={isSelected}
                        onChange={() => toggleVariant(funnel.id!)}
                        disabled={isPrimary}
                      />
                      <span className="font-medium">{funnel.data?.name ?? 'Untitled'}</span>
                      {isPrimary && <span className="badge badge-primary badge-xs">Primary</span>}
                      {!isPrimary && funnel.data?.isControl && (
                        <span className="badge badge-primary badge-xs">Control</span>
                      )}
                      <StatusBadge status={funnel.data?.status ?? 'draft'} className="ml-auto" />
                    </label>
                  );
                })}
              </div>
              {allVariantIds.length < 2 && (
                <p className="text-sm text-warning mt-2">Select at least one additional variant</p>
              )}
            </div>
          )}

          {formDestinationId && availableFunnels.length === 0 && (
            <div className="alert alert-warning mt-6">
              <span>No funnels available for this destination&apos;s offer.</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowCreateForm(false);
                setFormName('');
                setFormDestinationId('');
                setFormVariantIds([]);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!formName.trim() || !formDestinationId || allVariantIds.length < 2 || creating}
              onClick={handleCreateSplitTest}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </Section>
      )}

      {creating && !showCreateForm ? (
        <LoadingSection message="Creating split test..." />
      ) : data.splitTests.length === 0 && !showCreateForm ? (
        <EmptyState
          message={
            canCreate
              ? 'No split tests yet. Create a split test to A/B test funnel variants on a destination.'
              : 'Create a destination first, then set up split tests.'
          }
          action={
            canCreate ? { label: '+ Create First Split Test', onClick: () => setShowCreateForm(true) } : undefined
          }
        />
      ) : !showCreateForm ? (
        <Section>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Variants</th>
                </tr>
              </thead>
              <tbody>
                {data.splitTests.map((test) => (
                  <tr
                    key={test.id}
                    className="hover:bg-base-300/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(test.id ?? null)}
                  >
                    <td className="font-medium">{test.data?.name ?? 'Untitled'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-base-content/70">{getDestinationName(test)}</span>
                        {getDestinationSlug(test) && (
                          <code className="text-xs bg-base-300 px-2 py-1 rounded">/fst/{getDestinationSlug(test)}</code>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={test.data?.status ?? 'draft'} />
                    </td>
                    <td>{test.data?.variants?.length ?? 0} variant(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}
    </div>
  );
};

export default SplitTestsPage;
