import React, { useState, useCallback, useMemo } from 'react';
import {
  BuilderFunnelOfferContent,
  SUBSCRIPTION_FREQUENCIES,
  FREQUENCY_LABELS,
  SubscriptionFrequency,
  OfferType,
} from '@goldenhippo/builder-funnel-schemas';
import { DetailHeader, Section, FormField } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';

interface OfferDetailProps {
  item: BuilderFunnelOfferContent;
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

interface ProductForm {
  productId: string;
  quantity: number;
  displayName: string;
}

interface PricingTierForm {
  quantity: number;
  label: string;
  isMostPopular: boolean;
  standardPrice: number;
  subscriptionAvailable: boolean;
  subscriptionPrice: number;
  subscriptionFrequency: SubscriptionFrequency;
}

const emptyPricingTier = (): PricingTierForm => ({
  quantity: 1,
  label: '',
  isMostPopular: false,
  standardPrice: 0,
  subscriptionAvailable: true,
  subscriptionPrice: 0,
  subscriptionFrequency: 'Monthly',
});

const OfferDetailPage: React.FC<OfferDetailProps> = ({ item, data, context, onBack, onRefresh }) => {
  const d = item.data;
  const [offerType, setOfferType] = useState<OfferType>(d?.offerType ?? 'standard');
  const [name, setName] = useState<string>(d?.name ?? '');
  const [displayName, setDisplayName] = useState<string>(d?.displayName ?? '');
  const [description, setDescription] = useState<string>(d?.description ?? '');
  const [featuredImage, setFeaturedImage] = useState<string>(d?.featuredImage ?? '');
  const [selectionLabel, setSelectionLabel] = useState<string>(d?.selectionLabel ?? '');
  const [isDefaultOffer, setIsDefaultOffer] = useState<boolean>(d?.isDefaultOffer ?? false);
  const [ghSlug, setGhSlug] = useState<string>(d?.gh?.slug ?? '');
  const [products, setProducts] = useState<ProductForm[]>(
    (d?.products ?? []).map((p) => ({
      productId: p.product?.id ?? '',
      quantity: p.quantity ?? 1,
      displayName: p.displayName ?? '',
    })),
  );
  const isStandard = offerType === 'standard';
  const [pricing, setPricing] = useState<PricingTierForm[]>(
    (d?.defaultPricing ?? []).map((t) => ({
      quantity: t.quantity ?? 1,
      label: t.label ?? '',
      isMostPopular: t.isMostPopular ?? false,
      standardPrice: t.standardPrice ?? 0,
      subscriptionAvailable: t.subscriptionAvailable ?? true,
      subscriptionPrice: t.subscriptionPrice ?? 0,
      subscriptionFrequency: t.subscriptionFrequency ?? 'Monthly',
    })),
  );
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Funnels linked to this offer
  const offerFunnels = useMemo(
    () => data.funnels.filter((f) => f.data?.offer?.id === item.id),
    [data.funnels, item.id],
  );
  const currentControlId = useMemo(
    () => offerFunnels.find((f) => f.data?.isControl)?.id ?? '',
    [offerFunnels],
  );
  const [controlFunnelId, setControlFunnelId] = useState<string>(currentControlId);

  const addedProductIds = useMemo(() => new Set(products.map((p) => p.productId)), [products]);
  const availableProducts = useMemo(
    () => data.products.filter((p) => !addedProductIds.has(p.id!)),
    [data.products, addedProductIds],
  );
  const getProductName = (productId: string) => {
    const product = data.products.find((p) => p.id === productId);
    return product?.data?.name ?? product?.name ?? productId;
  };
  const addProduct = (productId: string) => {
    if (!productId) return;
    if (isStandard) {
      setProducts([{ productId, quantity: 1, displayName: '' }]);
    } else {
      if (addedProductIds.has(productId)) return;
      setProducts((prev) => [...prev, { productId, quantity: 1, displayName: '' }]);
    }
  };
  const removeProduct = (index: number) => setProducts((prev) => prev.filter((_, i) => i !== index));
  const updateProduct = (index: number, field: keyof ProductForm, value: string | number) => {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPricingTier = () => setPricing((prev) => [...prev, emptyPricingTier()]);
  const removePricingTier = (index: number) => {
    setPricing((prev) => prev.filter((_, i) => i !== index));
    if (expandedTier === index) setExpandedTier(null);
  };
  const updatePricingTier = (index: number, field: keyof PricingTierForm, value: any) => {
    setPricing((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const handleSave = useCallback(async () => {
    if (!name.trim() || !displayName.trim() || !ghSlug.trim()) return;
    try {
      setSaving(true);
      const api = new BuilderApi(context);
      await api.updateContent('funnel-offer', item.id!, {
        ...d,
        name: name.trim(),
        offerType,
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        featuredImage: featuredImage.trim() || undefined,
        selectionLabel: !isStandard && selectionLabel.trim() ? selectionLabel.trim() : undefined,
        isDefaultOffer,
        gh: { slug: ghSlug.trim() },
        products: products
          .filter((p) => p.productId)
          .map((p) => ({
            product: { '@type': '@builder.io/core:Reference', model: 'product', id: p.productId },
            quantity: isStandard ? 1 : p.quantity,
            displayName: p.displayName.trim() || undefined,
          })),
        defaultPricing: pricing.map((t) => ({
          quantity: t.quantity,
          label: t.label.trim() || undefined,
          isMostPopular: t.isMostPopular || undefined,
          standardPrice: t.standardPrice,
          subscriptionAvailable: t.subscriptionAvailable,
          subscriptionPrice: t.subscriptionAvailable ? t.subscriptionPrice || undefined : undefined,
          subscriptionFrequency: t.subscriptionAvailable ? t.subscriptionFrequency : undefined,
        })),
      });

      // Always publish offers so they're available to consuming apps
      await api.patchContent('funnel-offer', item.id!, { published: 'published' });

      // Update control funnel if changed
      if (controlFunnelId !== currentControlId) {
        // Remove control from the old funnel
        if (currentControlId) {
          const oldControl = offerFunnels.find((f) => f.id === currentControlId);
          if (oldControl) {
            await api.updateContent('funnel', currentControlId, { ...oldControl.data, isControl: false });
          }
        }
        // Set control on the new funnel
        if (controlFunnelId) {
          const newControl = offerFunnels.find((f) => f.id === controlFunnelId);
          if (newControl) {
            await api.updateContent('funnel', controlFunnelId, { ...newControl.data, isControl: true });
          }
        }
      }

      onRefresh();
    } catch (err) {
      console.error('[Hippo Funnels] Error saving offer', err);
      await context.dialogs.alert('Failed to save offer. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [item, d, context, offerType, isStandard, name, displayName, description, featuredImage, selectionLabel, isDefaultOffer, ghSlug, products, pricing, controlFunnelId, currentControlId, offerFunnels, onRefresh]);

  const handleDelete = useCallback(async () => {
    const funnelCount = data.funnels.filter((f) => f.data?.offer?.id === item.id).length;
    const warning = funnelCount > 0 ? ` This offer is used by ${funnelCount} funnel(s).` : '';
    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Delete Offer',
        text: `Type "DELETE" to confirm deleting "${displayName}".${warning}`,
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
      // user cancelled
    } finally {
      setDeleting(false);
    }
  }, [context, item, displayName, data.funnels, onBack, onRefresh]);

  const isValid = name.trim() && displayName.trim() && ghSlug.trim();

  return (
    <div className="max-w-5xl mx-auto">
      <DetailHeader
        title={d?.displayName ?? 'Offer'}
        onBack={onBack}
        badges={d?.isDefaultOffer ? [{ label: 'Default', variant: 'warning' }] : undefined}
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

      <div className="space-y-6">
        <Section title="Basic Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Internal Name" required helper="Used for identification in the CMS">
              <input type="text" className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label="Display Name" required helper="Customer-facing offer name">
              <input type="text" className="input input-bordered w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea className="textarea textarea-bordered w-full" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>
            <FormField label="Featured Image URL">
              <input type="text" className="input input-bordered w-full" placeholder="https://..." value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} />
            </FormField>
            {!isStandard && products.length > 1 && (
              <FormField label="Selection Label" helper="Label for the product chooser when multiple products are available">
                <input type="text" className="input input-bordered w-full" placeholder='e.g., "Choose your flavor"' value={selectionLabel} onChange={(e) => setSelectionLabel(e.target.value)} />
              </FormField>
            )}
            <FormField label="Generic End Point" required helper={`Accessible at /o/${ghSlug.trim() || '...'}`}>
              <input type="text" className="input input-bordered w-full" placeholder="e.g., standard-offer" value={ghSlug} onChange={(e) => setGhSlug(e.target.value)} />
            </FormField>
            <FormField label="Default Offer">
              <label className="flex items-center gap-3 cursor-pointer mt-1">
                <input type="checkbox" className="checkbox" checked={isDefaultOffer} onChange={(e) => setIsDefaultOffer(e.target.checked)} />
                <span className="text-sm">Global fallback when no matching offer is found</span>
              </label>
            </FormField>
            <FormField label="Control Funnel" helper={offerFunnels.length === 0 ? 'No funnels linked to this offer yet' : undefined}>
              <select
                className="select select-bordered w-full"
                value={controlFunnelId}
                onChange={(e) => setControlFunnelId(e.target.value)}
                disabled={offerFunnels.length === 0}
              >
                <option value="">{offerFunnels.length === 0 ? 'No funnels available' : 'None (no control)'}</option>
                {offerFunnels.map((funnel) => (
                  <option key={funnel.id} value={funnel.id}>
                    {funnel.data?.name ?? 'Untitled'}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </Section>

        <Section
          title={isStandard ? 'Product' : 'Products'}
          actions={
            !isStandard ? (
              <select
                className="select select-bordered select-sm"
                value=""
                onChange={(e) => {
                  addProduct(e.target.value);
                  e.target.value = '';
                }}
                disabled={availableProducts.length === 0}
              >
                <option value="" disabled>
                  {availableProducts.length === 0
                    ? data.products.length === 0
                      ? 'No products in system'
                      : 'All products added'
                    : '+ Add Product...'}
                </option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.data?.name ?? p.name ?? 'Untitled'}
                  </option>
                ))}
              </select>
            ) : undefined
          }
        >
          {isStandard ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Product" required>
                <select
                  className="select select-bordered w-full"
                  value={products[0]?.productId ?? ''}
                  onChange={(e) => addProduct(e.target.value)}
                >
                  <option value="">Select a product...</option>
                  {data.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.data?.name ?? p.name ?? 'Untitled'}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Display Name Override">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Optional — overrides product name in this offer"
                  value={products[0]?.displayName ?? ''}
                  onChange={(e) => {
                    if (products.length > 0) updateProduct(0, 'displayName', e.target.value);
                  }}
                  disabled={!products[0]?.productId}
                />
              </FormField>
            </div>
          ) : products.length === 0 ? (
            <p className="text-base-content/50">No products added. Use the dropdown above to add products to this offer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Display Name Override</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr key={product.productId || i}>
                      <td className="font-medium">{getProductName(product.productId)}</td>
                      <td>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-20"
                          min={1}
                          value={product.quantity}
                          onChange={(e) => updateProduct(i, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input input-bordered input-sm w-full"
                          placeholder="Optional — overrides product name in this offer"
                          value={product.displayName}
                          onChange={(e) => updateProduct(i, 'displayName', e.target.value)}
                        />
                      </td>
                      <td>
                        <button className="btn btn-sm btn-ghost text-error" onClick={() => removeProduct(i)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section
          title="Default Pricing Tiers"
          subtitle="Copied to new funnels"
          actions={
            <button className="btn btn-sm btn-ghost" onClick={addPricingTier}>
              + Add Tier
            </button>
          }
        >
          {pricing.length === 0 ? (
            <p className="text-base-content/50">No pricing tiers. Add tiers that will be copied to new funnels for this offer.</p>
          ) : (
            <div className="space-y-3">
              {pricing.map((tier, i) => (
                <div key={i} className="border border-base-300 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-300/30 transition-colors"
                    onClick={() => setExpandedTier(expandedTier === i ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {tier.label || `Tier ${i + 1}`} &mdash; Qty {tier.quantity} &mdash; ${tier.standardPrice.toFixed(2)}
                        {tier.subscriptionAvailable && (
                          <span className="text-base-content/50 font-normal"> / ${tier.subscriptionPrice.toFixed(2)} sub</span>
                        )}
                      </span>
                      {tier.isMostPopular && <span className="badge badge-accent badge-sm">Most Popular</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePricingTier(i);
                        }}
                      >
                        Remove
                      </button>
                      <span className="text-xs text-base-content/40">{expandedTier === i ? '\u25B2' : '\u25BC'}</span>
                    </div>
                  </div>
                  {expandedTier === i && (
                    <div className="p-4 border-t border-base-300 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormField label="Quantity">
                          <input type="number" className="input input-bordered input-sm w-full" min={1} value={tier.quantity} onChange={(e) => updatePricingTier(i, 'quantity', parseInt(e.target.value) || 1)} />
                        </FormField>
                        <FormField label="Label">
                          <input type="text" className="input input-bordered input-sm w-full" value={tier.label} onChange={(e) => updatePricingTier(i, 'label', e.target.value)} />
                        </FormField>
                        <FormField label="Standard Price">
                          <input type="number" className="input input-bordered input-sm w-full" step="0.01" min={0} value={tier.standardPrice} onChange={(e) => updatePricingTier(i, 'standardPrice', parseFloat(e.target.value) || 0)} />
                        </FormField>
                        <FormField label="Subscription">
                          <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              className="toggle toggle-sm toggle-primary"
                              checked={tier.subscriptionAvailable}
                              onChange={(e) => updatePricingTier(i, 'subscriptionAvailable', e.target.checked)}
                            />
                            <span className="text-sm">{tier.subscriptionAvailable ? 'Enabled' : 'Disabled'}</span>
                          </label>
                        </FormField>
                        {tier.subscriptionAvailable && (
                          <>
                            <FormField label="Subscription Price">
                              <input type="number" className="input input-bordered input-sm w-full" step="0.01" min={0} value={tier.subscriptionPrice} onChange={(e) => updatePricingTier(i, 'subscriptionPrice', parseFloat(e.target.value) || 0)} />
                            </FormField>
                            <FormField label="Subscription Frequency">
                              <select
                                className="select select-bordered select-sm w-full"
                                value={tier.subscriptionFrequency}
                                onChange={(e) => updatePricingTier(i, 'subscriptionFrequency', e.target.value)}
                              >
                                {SUBSCRIPTION_FREQUENCIES.map((freq) => (
                                  <option key={freq} value={freq}>
                                    {FREQUENCY_LABELS[freq]}
                                  </option>
                                ))}
                              </select>
                            </FormField>
                          </>
                        )}
                        <FormField label="Most Popular">
                          <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input type="checkbox" className="checkbox checkbox-sm" checked={tier.isMostPopular} onChange={(e) => updatePricingTier(i, 'isMostPopular', e.target.checked)} />
                            <span className="text-sm">Highlight this tier</span>
                          </label>
                        </FormField>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default OfferDetailPage;
