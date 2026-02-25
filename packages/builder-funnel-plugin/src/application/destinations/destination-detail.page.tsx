import React, { useState, useMemo, useCallback } from 'react';
import { BuilderFunnelDestinationContent } from '@goldenhippo/builder-funnel-schemas';
import { DetailHeader, Section, FormField, StatusBadge } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';

interface DestinationDetailProps {
  item: BuilderFunnelDestinationContent;
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

const DestinationDetailPage: React.FC<DestinationDetailProps> = ({ item, data, context, onBack, onRefresh }) => {
  const d = item.data;
  const [name, setName] = useState<string>(d?.name ?? '');
  const [slug, setSlug] = useState<string>(d?.slug ?? '');
  const [offerId, setOfferId] = useState<string>(d?.offer?.id ?? '');
  const [primaryFunnelId, setPrimaryFunnelId] = useState<string>(d?.primaryFunnel?.id ?? '');
  const [followControl, setFollowControl] = useState<boolean>(d?.followControlUpdates ?? false);
  const [status, setStatus] = useState<string>(d?.status ?? 'active');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [slugError, setSlugError] = useState('');

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const availableFunnels = useMemo(() => {
    if (!offerId) return [];
    return data.funnels.filter((f) => f.data?.offer?.id === offerId);
  }, [data.funnels, offerId]);

  const validateSlug = (value: string) => {
    if (!value) { setSlugError(''); return; }
    if (!slugPattern.test(value)) {
      setSlugError('Slug must be lowercase letters, numbers, and hyphens only');
      return;
    }
    const existing = data.destinations.find((dest) => dest.data?.slug === value && dest.id !== item.id);
    if (existing) {
      setSlugError('This slug is already in use by another destination');
      return;
    }
    setSlugError('');
  };

  const handleSlugChange = (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(normalized);
    validateSlug(normalized);
  };

  const handleOfferChange = (newOfferId: string) => {
    setOfferId(newOfferId);
    setPrimaryFunnelId('');
  };

  const handleSave = useCallback(async () => {
    if (!name.trim() || !slug.trim() || !offerId || !primaryFunnelId || slugError) return;
    try {
      setSaving(true);
      const api = new BuilderApi(context);
      await api.updateContent('funnel-destination', item.id!, {
        ...d,
        name: name.trim(),
        slug: slug.trim(),
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: offerId },
        primaryFunnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: primaryFunnelId },
        followControlUpdates: followControl,
        status,
      });

      // Publish the destination entry
      await api.patchContent('funnel-destination', item.id!, { published: 'published' });

      // When destination is active, activate the referenced funnel and publish its pages
      if (status === 'active' && primaryFunnelId) {
        const funnel = data.funnels.find((f) => f.id === primaryFunnelId);
        if (funnel) {
          await api.mergeContentData('funnel', primaryFunnelId, { status: 'active' }, { published: 'published' });
          const pageIds = (funnel.data?.steps ?? []).map((s) => s.page?.id).filter(Boolean) as string[];
          if (pageIds.length > 0) {
            await Promise.all(pageIds.map((id) => api.patchContent('funnel-page', id, { published: 'published' })));
          }
        }
      }

      onRefresh();
    } catch (err) {
      console.error('[Hippo Funnels] Error saving destination', err);
      await context.dialogs.alert('Failed to save destination. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [item, d, context, name, slug, offerId, primaryFunnelId, followControl, status, slugError, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Delete Destination',
        text: `Type "DELETE" to confirm deleting "${name}".`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      if (confirmed !== 'DELETE') return;
      setDeleting(true);
      const api = new BuilderApi(context);
      await api.removeContent(item);
      onRefresh();
      onBack();
    } catch {
      // user cancelled prompt
    } finally {
      setDeleting(false);
    }
  }, [context, item, name, onBack, onRefresh]);

  const activeTestId = d?.activeSplitTest?.id;
  const activeTest = useMemo(() => {
    if (!activeTestId) return null;
    return data.splitTests.find((t) => t.id === activeTestId) ?? null;
  }, [data.splitTests, activeTestId]);

  const isValid = name.trim() && slug.trim() && offerId && primaryFunnelId && !slugError;

  return (
    <div className="max-w-4xl mx-auto">
      <DetailHeader
        title={d?.name ?? 'Destination'}
        onBack={onBack}
        actions={
          <>
            <button className="btn btn-error btn-outline" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid || saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      />

      {activeTest && (
        <Section title="Active Split Test">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium">{activeTest.data?.name ?? 'Untitled'}</span>
              <StatusBadge status="active" />
              <span className="text-sm text-base-content/50">
                {activeTest.data?.variants?.length ?? 0} variant(s)
              </span>
            </div>
            <p className="text-sm text-base-content/50">Manage from the Split Tests section</p>
          </div>
        </Section>
      )}

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Destination Name" required>
            <input type="text" className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="URL Slug" required error={slugError}>
            <div className="join w-full">
              <span className="join-item btn btn-disabled no-animation">/d/</span>
              <input
                type="text"
                className={`input input-bordered join-item w-full ${slugError ? 'input-error' : ''}`}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
            </div>
          </FormField>
          <FormField label="Offer" required>
            <select className="select select-bordered w-full" value={offerId} onChange={(e) => handleOfferChange(e.target.value)}>
              <option value="">Select an offer...</option>
              {data.offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.data?.displayName ?? offer.data?.name ?? 'Untitled'}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Primary Funnel" required>
            <select className="select select-bordered w-full" value={primaryFunnelId} onChange={(e) => setPrimaryFunnelId(e.target.value)} disabled={!offerId}>
              <option value="">{offerId ? 'Select a funnel...' : 'Select an offer first'}</option>
              {availableFunnels.map((funnel) => (
                <option key={funnel.id} value={funnel.id}>
                  {funnel.data?.name ?? 'Untitled'}
                  {funnel.data?.isControl ? ' (Control)' : ''}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status">
            <select className="select select-bordered w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          {/* Follow Control Updates — hidden until feature is ready
          <FormField label="Follow Control Updates">
            <label className="flex items-center gap-3 cursor-pointer mt-1">
              <input type="checkbox" className="checkbox" checked={followControl} onChange={(e) => setFollowControl(e.target.checked)} />
              <span className="text-sm">Auto-swap primary funnel when the offer&apos;s control changes</span>
            </label>
          </FormField>
          */}
        </div>
      </Section>
    </div>
  );
};

export default DestinationDetailPage;
