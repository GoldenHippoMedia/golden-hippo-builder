import React, { useCallback, useState, useMemo } from 'react';
import { PageHeader, Section, FormField, EmptyState, LoadingSection } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import OfferDetailPage from './offer-detail.page';

interface OffersPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

const OffersPage: React.FC<OffersPageProps> = ({ data, context, onRefresh }) => {
  const offers = data.offers;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [creating, setCreating] = useState(false);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return offers.find((o) => o.id === selectedId) ?? null;
  }, [offers, selectedId]);

  if (selectedItem) {
    return (
      <OfferDetailPage
        item={selectedItem}
        data={data}
        context={context}
        onBack={() => setSelectedId(null)}
        onRefresh={onRefresh}
      />
    );
  }

  const getFunnelCount = (offerId: string) => {
    return data.funnels.filter((f) => f.data?.offer?.id === offerId).length;
  };

  const handleCreateOffer = async () => {
    if (!formName.trim() || !formDisplayName.trim()) return;
    try {
      setCreating(true);
      const api = new BuilderApi(context);
      const newContent = await api.createContent('funnel-offer', formName.trim(), {
        name: formName.trim(),
        displayName: formDisplayName.trim(),
      });
      // Always publish offers so they're available to consuming apps
      if (newContent.id) {
        await api.patchContent('funnel-offer', newContent.id, { published: 'published' });
      }
      setShowCreateForm(false);
      setFormName('');
      setFormDisplayName('');
      await onRefresh();
      setTimeout(() => {
        setCreating(false);
        setSelectedId(newContent.id ?? null);
      }, 0);
    } catch (err) {
      console.error('[Hippo Funnels] Error creating offer', err);
      setCreating(false);
      await context.dialogs.alert('Failed to create offer. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Offers"
        actions={
          <>
            <button className="btn btn-ghost" onClick={onRefresh}>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              + New Offer
            </button>
          </>
        }
      />

      {showCreateForm && (
        <Section
          title="Create New Offer"
          subtitle="After creation, you can configure products and pricing tiers."
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Internal Name" required helper="Used for identification in the CMS">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g., summer-sale-offer"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </FormField>
            <FormField label="Display Name" required helper="Customer-facing offer name">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g., Summer Sale Offer"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowCreateForm(false);
                setFormName('');
                setFormDisplayName('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!formName.trim() || !formDisplayName.trim() || creating}
              onClick={handleCreateOffer}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </Section>
      )}

      {creating && !showCreateForm ? (
        <LoadingSection message="Creating offer..." />
      ) : offers.length === 0 && !showCreateForm ? (
        <EmptyState
          message="No offers yet. Create your first offer to get started."
          action={{ label: '+ Create First Offer', onClick: () => setShowCreateForm(true) }}
        />
      ) : !showCreateForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-base-200 rounded-2xl p-5 hover:bg-base-300/50 transition-colors cursor-pointer"
              onClick={() => setSelectedId(offer.id ?? null)}
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold">{offer.data?.displayName ?? offer.data?.name ?? 'Untitled'}</h2>
                {offer.data?.isDefaultOffer && <span className="badge badge-warning badge-sm">Default</span>}
              </div>
              <p className="text-sm text-base-content/60 line-clamp-2 mb-3">
                {offer.data?.description || 'No description'}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-ghost badge-sm">{offer.data?.products?.length ?? 0} product(s)</span>
                <span className="badge badge-ghost badge-sm">{offer.data?.defaultPricing?.length ?? 0} tier(s)</span>
                <span className="badge badge-ghost badge-sm">{getFunnelCount(offer.id!)} funnel(s)</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default OffersPage;
