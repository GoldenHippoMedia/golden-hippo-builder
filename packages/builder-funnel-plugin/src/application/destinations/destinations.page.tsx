import React, { useState, useCallback, useMemo } from 'react';
import { BuilderFunnelDestinationContent } from '@goldenhippo/builder-funnel-schemas';
import { PageHeader, Section, FormField, EmptyState, StatusBadge, LoadingSection } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import DestinationDetailPage from './destination-detail.page';

interface DestinationsPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

const DestinationsPage: React.FC<DestinationsPageProps> = ({ data, context, onRefresh }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formOfferId, setFormOfferId] = useState('');
  const [formFunnelId, setFormFunnelId] = useState('');
  const [formFollowControl, setFormFollowControl] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slugError, setSlugError] = useState('');

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return data.destinations.find((d) => d.id === selectedId) ?? null;
  }, [data.destinations, selectedId]);

  if (selectedItem) {
    return (
      <DestinationDetailPage
        item={selectedItem}
        data={data}
        context={context}
        onBack={() => setSelectedId(null)}
        onRefresh={onRefresh}
      />
    );
  }

  const availableFunnels = data.funnels.filter((f) => f.data?.offer?.id === formOfferId);
  const controlFunnel = availableFunnels.find((f) => f.data?.isControl);

  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError('');
      return;
    }
    if (!slugPattern.test(slug)) {
      setSlugError('Slug must be lowercase letters, numbers, and hyphens only');
      return;
    }
    const existing = data.destinations.find((d) => d.data?.slug === slug);
    if (existing) {
      setSlugError('This slug is already in use');
      return;
    }
    setSlugError('');
  };

  const handleSlugChange = (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormSlug(normalized);
    validateSlug(normalized);
  };

  const handleOfferChange = (offerId: string) => {
    setFormOfferId(offerId);
    setFormFunnelId('');
    setFormFollowControl(false);
  };

  const getOfferName = (dest: BuilderFunnelDestinationContent) => {
    const offerId = dest.data?.offer?.id;
    if (!offerId) return 'Unknown';
    const offer = data.offers.find((o) => o.id === offerId);
    return offer?.data?.displayName ?? offer?.data?.name ?? 'Unknown';
  };

  const getFunnelName = (dest: BuilderFunnelDestinationContent) => {
    const funnelId = dest.data?.primaryFunnel?.id;
    if (!funnelId) return 'Not set';
    const funnel = data.funnels.find((f) => f.id === funnelId);
    return funnel?.data?.name ?? 'Unknown';
  };

  const hasActiveSplitTest = (destId: string) => {
    const dest = data.destinations.find((d) => d.id === destId);
    return !!dest?.data?.activeSplitTest?.id;
  };

  const handleCreateDestination = async () => {
    if (!formName.trim() || !formSlug.trim() || !formOfferId || !formFunnelId || slugError) return;
    try {
      setCreating(true);
      const api = new BuilderApi(context);
      const newContent = await api.createContent('funnel-destination', formName.trim(), {
        name: formName.trim(),
        slug: formSlug.trim(),
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: formOfferId },
        primaryFunnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: formFunnelId },
        followControlUpdates: formFollowControl,
        status: 'active',
      });

      // Publish the destination entry
      if (newContent.id) {
        await api.patchContent('funnel-destination', newContent.id, { published: 'published' });
      }

      // Destinations default to active — activate the referenced funnel and publish its pages
      if (formFunnelId) {
        const funnel = data.funnels.find((f) => f.id === formFunnelId);
        if (funnel) {
          await api.mergeContentData('funnel', formFunnelId, { status: 'active' }, { published: 'published' });
          const pageIds = (funnel.data?.steps ?? []).map((s) => s.page?.id).filter(Boolean) as string[];
          if (pageIds.length > 0) {
            await Promise.all(pageIds.map((id) => api.patchContent('funnel-page', id, { published: 'published' })));
          }
        }
      }

      setShowCreateForm(false);
      setFormName('');
      setFormSlug('');
      setFormOfferId('');
      setFormFunnelId('');
      setFormFollowControl(false);
      await onRefresh();
      setTimeout(() => {
        setCreating(false);
        setSelectedId(newContent.id ?? null);
      }, 0);
    } catch (err) {
      console.error('[Hippo Funnels] Error creating destination', err);
      setCreating(false);
      await context.dialogs.alert('Failed to create destination. Please try again.');
    }
  };

  const canCreate = data.offers.length > 0 && data.funnels.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Destinations"
        actions={
          <>
            <button className="btn btn-ghost" onClick={onRefresh}>
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => canCreate && setShowCreateForm(!showCreateForm)}
              disabled={!canCreate}
              title={!canCreate ? 'Create an offer and funnel first' : undefined}
            >
              + New Destination
            </button>
          </>
        }
      />

      {showCreateForm && (
        <Section
          title="Create New Destination"
          subtitle="A destination is a URL entry point (/d/[slug]) that routes visitors to a funnel."
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Destination Name" required>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g., Summer Campaign Entry"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </FormField>
            <FormField label="URL Slug" required error={slugError}>
              <div className="join w-full">
                <span className="join-item btn btn-disabled no-animation">/d/</span>
                <input
                  type="text"
                  className={`input input-bordered join-item w-full ${slugError ? 'input-error' : ''}`}
                  placeholder="my-offer-2026"
                  value={formSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Offer" required>
              <select
                className="select select-bordered w-full"
                value={formOfferId}
                onChange={(e) => handleOfferChange(e.target.value)}
              >
                <option value="">Select an offer...</option>
                {data.offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.data?.displayName ?? offer.data?.name ?? 'Untitled'}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label="Primary Funnel"
              required
              helper={
                controlFunnel && !formFunnelId
                  ? `Tip: Control funnel "${controlFunnel.data?.name}" is recommended`
                  : undefined
              }
            >
              <select
                className="select select-bordered w-full"
                value={formFunnelId}
                onChange={(e) => setFormFunnelId(e.target.value)}
                disabled={!formOfferId}
              >
                <option value="">{formOfferId ? 'Select a funnel...' : 'Select an offer first'}</option>
                {availableFunnels.map((funnel) => (
                  <option key={funnel.id} value={funnel.id}>
                    {funnel.data?.name ?? 'Untitled'}
                    {funnel.data?.isControl ? ' (Control)' : ''}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          {/* Follow Control Updates — hidden until feature is ready
          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <input
              type="checkbox"
              className="checkbox"
              checked={formFollowControl}
              onChange={(e) => setFormFollowControl(e.target.checked)}
            />
            <div>
              <span className="text-sm font-medium">Follow Control Updates</span>
              <span className="text-xs text-base-content/50 ml-2">
                Auto-swap primary funnel when the offer&apos;s control changes
              </span>
            </div>
          </label>
          */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowCreateForm(false);
                setFormName('');
                setFormSlug('');
                setFormOfferId('');
                setFormFunnelId('');
                setFormFollowControl(false);
                setSlugError('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={
                !formName.trim() || !formSlug.trim() || !formOfferId || !formFunnelId || !!slugError || creating
              }
              onClick={handleCreateDestination}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </Section>
      )}

      {creating && !showCreateForm ? (
        <LoadingSection message="Creating destination..." />
      ) : data.destinations.length === 0 && !showCreateForm ? (
        <EmptyState
          message={
            canCreate
              ? 'No destinations yet. Create your first destination to give visitors a URL entry point.'
              : 'Create an offer and funnel first, then add destinations.'
          }
          action={
            canCreate ? { label: '+ Create First Destination', onClick: () => setShowCreateForm(true) } : undefined
          }
        />
      ) : !showCreateForm ? (
        <Section>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Offer</th>
                  <th>Primary Funnel</th>
                  <th>Status</th>
                  <th>Split Test</th>
                </tr>
              </thead>
              <tbody>
                {data.destinations.map((dest) => (
                  <tr
                    key={dest.id}
                    className="hover:bg-base-300/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(dest.id ?? null)}
                  >
                    <td className="font-medium">{dest.data?.name ?? 'Untitled'}</td>
                    <td>
                      <code className="text-xs bg-base-300 px-2 py-1 rounded">/d/{dest.data?.slug ?? '...'}</code>
                    </td>
                    <td className="text-base-content/70">{getOfferName(dest)}</td>
                    <td className="text-base-content/70">{getFunnelName(dest)}</td>
                    <td>
                      <StatusBadge status={dest.data?.status ?? 'inactive'} />
                    </td>
                    <td>
                      {hasActiveSplitTest(dest.id!) ? (
                        <StatusBadge status="active" />
                      ) : (
                        <span className="text-base-content/40 text-sm">None</span>
                      )}
                    </td>
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

export default DestinationsPage;
