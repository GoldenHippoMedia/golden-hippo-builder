import React, { useState, useCallback, useMemo } from 'react';
import { PageHeader, Section } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { syncFunnelModels } from '../../services/model-sync';
import { openPluginSettings } from '../../plugin';

interface AdminPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

interface SeedLog {
  message: string;
  type: 'info' | 'success' | 'error';
}

const MOCK_PRODUCTS = [
  {
    name: 'NeuroPure',
    displayName: 'NeuroPure Brain Support',
    subHeading: 'Advanced Cognitive Support Formula',
    shortDescription: 'A premium nootropic supplement designed to support memory, focus, and mental clarity.',
    gh: { slug: 'neuropure', productionId: 'mock-neuropure-001', type: 'Product' as const },
  },
  {
    name: 'MindGuard Pro',
    displayName: 'MindGuard Pro',
    subHeading: 'Daily Neuroprotection Complex',
    shortDescription: 'Comprehensive brain health supplement with antioxidant-rich botanicals.',
    gh: { slug: 'mindguard-pro', productionId: 'mock-mindguard-001', type: 'Product' as const },
  },
  {
    name: 'SleepMax Ultra',
    displayName: 'SleepMax Ultra',
    subHeading: 'Natural Sleep Support',
    shortDescription: 'Fall asleep faster and wake up refreshed with our melatonin-free sleep formula.',
    gh: { slug: 'sleepmax-ultra', productionId: 'mock-sleepmax-001', type: 'Product' as const },
  },
];

const AdminPage: React.FC<AdminPageProps> = ({ data, context, onRefresh }) => {
  const [logs, setLogs] = useState<SeedLog[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const isAdmin = context.user.can('admin');
  const cartApiKey = useMemo(() => BuilderApi.getPluginSetting(context, 'builderCartPublicApiKey'), [context]);

  const log = useCallback((message: string, type: SeedLog['type'] = 'info') => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  const clearLogs = () => setLogs([]);

  const seedProducts = useCallback(async () => {
    setRunning('products');
    try {
      const api = new BuilderApi(context);
      for (const product of MOCK_PRODUCTS) {
        const existing = data.products.find((p) => p.data?.gh?.slug === product.gh.slug);
        if (existing) {
          log(`Skipped "${product.name}" — already exists (slug: ${product.gh.slug})`, 'info');
          continue;
        }
        await api.createContent('product', product.name, product);
        log(`Created product "${product.name}"`, 'success');
      }
      await onRefresh();
      log('Products seeded successfully', 'success');
    } catch (err: any) {
      log(`Error seeding products: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, data.products, log, onRefresh]);

  const seedOffers = useCallback(async () => {
    setRunning('offers');
    try {
      if (data.products.length === 0) {
        log('No products found. Seed products first.', 'error');
        setRunning(null);
        return;
      }
      const api = new BuilderApi(context);
      const singleProductRef = [
        {
          product: { '@type': '@builder.io/core:Reference', model: 'product', id: data.products[0].id! },
          displayName: undefined,
        },
      ];

      const standardOffer = await api.createContent('funnel-offer', 'Standard Offer', {
        name: 'Standard Offer',
        offerType: 'standard',
        displayName: 'Standard Offer',
        description: 'Our standard direct-to-consumer offer with tiered pricing.',
        isDefaultOffer: true,
        products: singleProductRef,
        defaultPricing: [
          { quantity: 1, label: '1 Bottle', standardPrice: 49.95, subscriptionPrice: 39.95, subscriptionFrequency: 'Monthly' },
          { quantity: 3, label: '3 Bottles', standardPrice: 119.85, isMostPopular: true, subscriptionPrice: 99.85, subscriptionFrequency: 'Monthly' },
          { quantity: 6, label: '6 Bottles', standardPrice: 199.7, subscriptionPrice: 179.7, subscriptionFrequency: 'BiMonthly' },
        ],
        gh: { slug: 'standard-offer' },
      });
      log(`Created offer "Standard Offer" (id: ${standardOffer.id})`, 'success');

      const secondProductRef = data.products.length > 1
        ? [{ product: { '@type': '@builder.io/core:Reference', model: 'product', id: data.products[1].id! }, displayName: undefined }]
        : singleProductRef;
      await api.createContent('funnel-offer', 'Sleep Support Offer', {
        name: 'Sleep Support Offer',
        offerType: 'standard',
        displayName: 'Sleep Support Offer',
        description: 'Targeted sleep support offer with subscription-friendly pricing.',
        products: secondProductRef,
        defaultPricing: [
          { quantity: 1, label: '1 Bottle', standardPrice: 39.95, subscriptionPrice: 34.95, subscriptionFrequency: 'Monthly' },
          { quantity: 3, label: '3 Bottles', standardPrice: 99.85, isMostPopular: true, subscriptionPrice: 89.85, subscriptionFrequency: 'Quarterly' },
        ],
        gh: { slug: 'sleep-support' },
      });
      log('Created offer "Sleep Support Offer"', 'success');

      // Bundle offers not yet supported in the UI
      // const allProductRefs = data.products.map((p) => ({
      //   product: { '@type': '@builder.io/core:Reference', model: 'product', id: p.id! },
      //   displayName: undefined,
      // }));
      // await api.createContent('funnel-offer', 'Premium Bundle', {
      //   name: 'Premium Bundle',
      //   offerType: 'bundle',
      //   displayName: 'Premium Bundle',
      //   description: 'All-in-one premium health bundle with special pricing.',
      //   selectionLabel: 'Select Your Bundle',
      //   products: allProductRefs,
      //   defaultPricing: [
      //     { quantity: 1, label: '1 Month Supply', standardPrice: 89.95, subscriptionPrice: 74.95, subscriptionFrequency: 'Monthly' },
      //     { quantity: 3, label: '3 Month Supply', standardPrice: 239.85, isMostPopular: true, subscriptionPrice: 199.85, subscriptionFrequency: 'Quarterly' },
      //   ],
      //   gh: { slug: 'premium-bundle' },
      // });
      // log('Created offer "Premium Bundle"', 'success');

      await onRefresh();
      log('Offers seeded successfully', 'success');
    } catch (err: any) {
      log(`Error seeding offers: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, data.products, log, onRefresh]);

  const seedFunnels = useCallback(async () => {
    setRunning('funnels');
    try {
      if (data.offers.length === 0) {
        log('No offers found. Seed offers first.', 'error');
        setRunning(null);
        return;
      }
      const api = new BuilderApi(context);
      const offer = data.offers[0];
      const offerRef = { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: offer.id! };
      const pricingFromOffer = (offer.data?.defaultPricing ?? []).map((t) => ({
        quantity: t.quantity,
        label: t.label,
        isMostPopular: t.isMostPopular,
        standardPrice: t.standardPrice,
        subscriptionPrice: t.subscriptionPrice,
        subscriptionFrequency: t.subscriptionFrequency,
      }));
      const baseSteps = [
        { stepType: 'landing', label: 'Landing Page' },
        { stepType: 'checkout', label: 'Checkout' },
      ];

      const controlFunnel = await api.createContent('funnel', 'Control Funnel', {
        name: 'Control Funnel',
        offer: offerRef,
        isControl: true,
        status: 'active',
        steps: baseSteps,
        pricing: pricingFromOffer,
        gh: { slug: 'control' },
      });
      log(`Created funnel "Control Funnel" (id: ${controlFunnel.id})`, 'success');

      await api.createContent('funnel', 'Variant A — VSL Flow', {
        name: 'Variant A — VSL Flow',
        offer: offerRef,
        isControl: false,
        status: 'draft',
        steps: [
          { stepType: 'landing', label: 'Landing Page' },
          { stepType: 'vsl', label: 'Video Sales Letter' },
          { stepType: 'checkout', label: 'Checkout' },
        ],
        pricing: pricingFromOffer,
        gh: { slug: 'variant-a-vsl' },
      });
      log('Created funnel "Variant A — VSL Flow"', 'success');

      await api.createContent('funnel', 'Variant B — Survey Flow', {
        name: 'Variant B — Survey Flow',
        offer: offerRef,
        isControl: false,
        status: 'draft',
        steps: [
          { stepType: 'survey', label: 'Health Survey' },
          { stepType: 'offer-selector', label: 'Choose Product' },
          { stepType: 'checkout', label: 'Checkout' },
        ],
        pricing: pricingFromOffer.map((t) => ({
          ...t,
          standardPrice: t.standardPrice * 0.9,
          subscriptionPrice: t.subscriptionPrice ? t.subscriptionPrice * 0.9 : undefined,
        })),
        gh: { slug: 'variant-b-survey' },
      });
      log('Created funnel "Variant B — Survey Flow"', 'success');

      await onRefresh();
      log('Funnels seeded successfully', 'success');
    } catch (err: any) {
      log(`Error seeding funnels: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, data.offers, log, onRefresh]);

  const seedDestinations = useCallback(async () => {
    setRunning('destinations');
    try {
      if (data.offers.length === 0 || data.funnels.length === 0) {
        log('Need at least one offer and one funnel. Seed those first.', 'error');
        setRunning(null);
        return;
      }
      const api = new BuilderApi(context);
      const offer = data.offers[0];
      const funnelsForOffer = data.funnels.filter((f) => f.data?.offer?.id === offer.id);
      const controlFunnel = funnelsForOffer.find((f) => f.data?.isControl) ?? funnelsForOffer[0];
      if (!controlFunnel) {
        log("No funnels found for the first offer.", 'error');
        setRunning(null);
        return;
      }

      await api.createContent('funnel-destination', 'Main Entry', {
        name: 'Main Entry',
        slug: 'main',
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: offer.id! },
        primaryFunnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: controlFunnel.id! },
        followControlUpdates: false,
        status: 'active',
      });
      log('Created destination "Main Entry" → /fst/main', 'success');

      await api.createContent('funnel-destination', 'Promo Campaign', {
        name: 'Promo Campaign',
        slug: 'promo-jan',
        offer: { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: offer.id! },
        primaryFunnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: controlFunnel.id! },
        followControlUpdates: false,
        status: 'active',
      });
      log('Created destination "Promo Campaign" → /fst/promo-jan', 'success');

      await onRefresh();
      log('Destinations seeded successfully', 'success');
    } catch (err: any) {
      log(`Error seeding destinations: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, data.offers, data.funnels, log, onRefresh]);

  const seedSplitTests = useCallback(async () => {
    setRunning('split-tests');
    try {
      if (data.destinations.length === 0 || data.funnels.length < 2) {
        log('Need at least one destination and two funnels. Seed those first.', 'error');
        setRunning(null);
        return;
      }
      const api = new BuilderApi(context);
      const dest = data.destinations[0];
      const offerId = dest.data?.offer?.id;
      const funnelsForOffer = data.funnels.filter((f) => f.data?.offer?.id === offerId);
      if (funnelsForOffer.length < 2) {
        log("Need at least 2 funnels for the destination's offer to create a split test.", 'error');
        setRunning(null);
        return;
      }

      const variants = funnelsForOffer.slice(0, 2).map((f) => ({
        funnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: f.id! },
        label: f.data?.isControl ? 'Control' : f.data?.name ?? 'Variant',
      }));

      await api.createContent('funnel-split-test', 'Landing Page A/B Test', {
        name: 'Landing Page A/B Test',
        destination: { '@type': '@builder.io/core:Reference', model: 'funnel-destination', id: dest.id! },
        status: 'draft',
        variants,
      });
      log('Created split test "Landing Page A/B Test"', 'success');

      await onRefresh();
      log('Split tests seeded successfully', 'success');
    } catch (err: any) {
      log(`Error seeding split tests: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, data.destinations, data.funnels, log, onRefresh]);

  const seedAll = useCallback(async () => {
    setRunning('all');
    try {
      log('--- Seeding all mock data ---', 'info');
      const api = new BuilderApi(context);

      for (const product of MOCK_PRODUCTS) {
        const existing = data.products.find((p) => p.data?.gh?.slug === product.gh.slug);
        if (existing) {
          log(`Skipped product "${product.name}" — already exists`, 'info');
          continue;
        }
        await api.createContent('product', product.name, product);
        log(`Created product "${product.name}"`, 'success');
      }
      await onRefresh();

      const freshProducts = await api.getProducts(true);
      const singleProductRef = [
        {
          product: { '@type': '@builder.io/core:Reference', model: 'product', id: freshProducts[0].id! },
          displayName: undefined,
        },
      ];

      const standardOffer = await api.createContent('funnel-offer', 'Standard Offer', {
        name: 'Standard Offer',
        offerType: 'standard',
        displayName: 'Standard Offer',
        description: 'Our standard direct-to-consumer offer with tiered pricing.',
        isDefaultOffer: true,
        products: singleProductRef,
        defaultPricing: [
          { quantity: 1, label: '1 Bottle', standardPrice: 49.95, subscriptionPrice: 39.95, subscriptionFrequency: 'Monthly' },
          { quantity: 3, label: '3 Bottles', standardPrice: 119.85, isMostPopular: true, subscriptionPrice: 99.85, subscriptionFrequency: 'Monthly' },
          { quantity: 6, label: '6 Bottles', standardPrice: 199.7, subscriptionPrice: 179.7, subscriptionFrequency: 'BiMonthly' },
        ],
        gh: { slug: 'standard-offer' },
      });
      log('Created offer "Standard Offer"', 'success');

      const secondProductRef = freshProducts.length > 1
        ? [{ product: { '@type': '@builder.io/core:Reference', model: 'product', id: freshProducts[1].id! }, displayName: undefined }]
        : singleProductRef;
      await api.createContent('funnel-offer', 'Sleep Support Offer', {
        name: 'Sleep Support Offer',
        offerType: 'standard',
        displayName: 'Sleep Support Offer',
        description: 'Targeted sleep support offer with subscription-friendly pricing.',
        products: secondProductRef,
        defaultPricing: [
          { quantity: 1, label: '1 Bottle', standardPrice: 39.95, subscriptionPrice: 34.95, subscriptionFrequency: 'Monthly' },
          { quantity: 3, label: '3 Bottles', standardPrice: 99.85, isMostPopular: true, subscriptionPrice: 89.85, subscriptionFrequency: 'Quarterly' },
        ],
        gh: { slug: 'sleep-support' },
      });
      log('Created offer "Sleep Support Offer"', 'success');

      const offerRef = { '@type': '@builder.io/core:Reference', model: 'funnel-offer', id: standardOffer.id! };
      const pricing = [
        { quantity: 1, label: '1 Bottle', standardPrice: 49.95, subscriptionPrice: 39.95, subscriptionFrequency: 'Monthly' },
        { quantity: 3, label: '3 Bottles', standardPrice: 119.85, isMostPopular: true, subscriptionPrice: 99.85, subscriptionFrequency: 'Monthly' },
        { quantity: 6, label: '6 Bottles', standardPrice: 199.7, subscriptionPrice: 179.7, subscriptionFrequency: 'BiMonthly' },
      ];

      const controlFunnel = await api.createContent('funnel', 'Control Funnel', {
        name: 'Control Funnel',
        offer: offerRef,
        isControl: true,
        status: 'active',
        steps: [
          { stepType: 'landing', label: 'Landing Page' },
          { stepType: 'checkout', label: 'Checkout' },
        ],
        pricing,
        gh: { slug: 'control' },
      });
      log('Created funnel "Control Funnel"', 'success');

      const variantA = await api.createContent('funnel', 'Variant A — VSL Flow', {
        name: 'Variant A — VSL Flow',
        offer: offerRef,
        isControl: false,
        status: 'draft',
        steps: [
          { stepType: 'landing', label: 'Landing' },
          { stepType: 'vsl', label: 'VSL' },
          { stepType: 'checkout', label: 'Checkout' },
        ],
        pricing,
        gh: { slug: 'variant-a-vsl' },
      });
      log('Created funnel "Variant A — VSL Flow"', 'success');

      const mainDest = await api.createContent('funnel-destination', 'Main Entry', {
        name: 'Main Entry',
        slug: 'main',
        offer: offerRef,
        primaryFunnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: controlFunnel.id! },
        followControlUpdates: false,
        status: 'active',
      });
      log('Created destination "Main Entry" → /fst/main', 'success');

      await api.createContent('funnel-destination', 'Promo Campaign', {
        name: 'Promo Campaign',
        slug: 'promo-jan',
        offer: offerRef,
        primaryFunnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: controlFunnel.id! },
        followControlUpdates: false,
        status: 'active',
      });
      log('Created destination "Promo Campaign" → /fst/promo-jan', 'success');

      await api.createContent('funnel-split-test', 'Landing Page A/B Test', {
        name: 'Landing Page A/B Test',
        destination: { '@type': '@builder.io/core:Reference', model: 'funnel-destination', id: mainDest.id! },
        status: 'draft',
        variants: [
          { funnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: controlFunnel.id! }, label: 'Control' },
          { funnel: { '@type': '@builder.io/core:Reference', model: 'funnel', id: variantA.id! }, label: 'Variant A' },
        ],
      });
      log('Created split test "Landing Page A/B Test"', 'success');

      await onRefresh();
      log('--- All mock data seeded successfully ---', 'success');
    } catch (err: any) {
      log(`Error during seed all: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, data.products, log, onRefresh]);

  const [deleteSelection, setDeleteSelection] = useState<Record<string, boolean>>({
    products: false,
    offers: false,
    funnels: false,
    destinations: false,
    splitTests: false,
  });

  const toggleDeleteModel = (key: string) => {
    setDeleteSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedDeleteCount = Object.values(deleteSelection).filter(Boolean).length;

  const handleDeleteSelected = useCallback(async () => {
    const modelLabels: Record<string, string> = {
      splitTests: 'split tests',
      destinations: 'destinations',
      funnels: 'funnels',
      offers: 'offers',
      products: 'products',
    };
    const selected = Object.entries(deleteSelection)
      .filter(([, v]) => v)
      .map(([k]) => modelLabels[k]);
    if (selected.length === 0) return;

    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Delete Selected Model Data',
        text: `This will permanently delete ALL entries for: ${selected.join(', ')}. Type "DELETE" to confirm.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      if (confirmed !== 'DELETE') return;

      setRunning('delete-selected');
      const api = new BuilderApi(context);

      // Delete in dependency order: split tests → destinations → funnels → offers → products
      if (deleteSelection.splitTests) {
        log('Deleting split tests...', 'info');
        for (const item of data.splitTests) {
          await api.removeContent(item);
          log(`Deleted split test "${item.data?.name ?? item.id}"`, 'info');
        }
      }
      if (deleteSelection.destinations) {
        log('Deleting destinations...', 'info');
        for (const item of data.destinations) {
          await api.removeContent(item);
          log(`Deleted destination "${item.data?.name ?? item.id}"`, 'info');
        }
      }
      if (deleteSelection.funnels) {
        log('Deleting funnels...', 'info');
        for (const item of data.funnels) {
          await api.removeContent(item);
          log(`Deleted funnel "${item.data?.name ?? item.id}"`, 'info');
        }
      }
      if (deleteSelection.offers) {
        log('Deleting offers...', 'info');
        for (const item of data.offers) {
          await api.removeContent(item);
          log(`Deleted offer "${item.data?.displayName ?? item.data?.name ?? item.id}"`, 'info');
        }
      }
      if (deleteSelection.products) {
        log('Deleting products...', 'info');
        for (const item of data.products) {
          await api.removeContent(item);
          log(`Deleted product "${item.data?.name ?? item.id}"`, 'info');
        }
      }

      setDeleteSelection({ products: false, offers: false, funnels: false, destinations: false, splitTests: false });
      await onRefresh();
      log(`--- Deleted all ${selected.join(', ')}. ---`, 'success');
    } catch {
      // user cancelled prompt
    } finally {
      setRunning(null);
    }
  }, [context, data, deleteSelection, log, onRefresh]);

  const handleSyncModels = useCallback(async () => {
    setRunning('sync-models');
    clearLogs();
    try {
      log('Starting model sync...', 'info');
      await syncFunnelModels(context, (progress) => {
        log(`[${progress.current}/${progress.total}] Synced ${progress.phase} model`, 'success');
      });
      log('--- All models synced successfully ---', 'success');
    } catch (err: any) {
      log(`Error syncing models: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, log]);

  const handleSyncProducts = useCallback(async () => {
    if (!cartApiKey) return;
    setRunning('sync-products');
    clearLogs();
    try {
      const api = new BuilderApi(context);
      log('Fetching products from cart space...', 'info');
      const remoteProducts = await api.fetchRemoteProducts(cartApiKey);
      log(`Found ${remoteProducts.length} product(s) in cart space`, 'info');

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const remote of remoteProducts) {
        const rd = remote.data;
        if (!rd?.name) {
          log(`Skipped entry (no name) — id: ${remote.id}`, 'info');
          skipped++;
          continue;
        }

        const slug = rd.gh?.slug;
        const local = slug ? data.products.find((p) => p.data?.gh?.slug === slug) : null;

        // Extract the fields we want to sync
        const productData: Record<string, any> = {
          name: rd.name,
          displayName: rd.displayName,
          featuredImage: rd.featuredImage,
          secondaryImage: rd.secondaryImage,
          subHeading: rd.subHeading,
          gridTagline: rd.gridTagline,
          gridDescription: rd.gridDescription,
          shortDescription: rd.shortDescription,
          quote: rd.quote,
          packagingLabels: rd.packagingLabels,
          hidden: rd.hidden,
          outOfStock: rd.outOfStock,
          cartOutOfStock: rd.cartOutOfStock,
          upc: rd.upc,
          servingsPerUnit: rd.servingsPerUnit,
          reviews: rd.reviews,
          gh: rd.gh,
        };

        if (local) {
          await api.updateContent('product', local.id!, productData);
          log(`Updated "${rd.name}" (slug: ${slug})`, 'success');
          updated++;
        } else {
          await api.createContent('product', rd.name, productData);
          log(`Created "${rd.name}" (slug: ${slug ?? 'none'})`, 'success');
          created++;
        }
      }

      await onRefresh();
      log(`--- Sync complete: ${created} created, ${updated} updated, ${skipped} skipped ---`, 'success');
    } catch (err: any) {
      log(`Error syncing products: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [cartApiKey, context, data.products, log, onRefresh]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Admin" />
        <Section>
          <p className="text-base-content/60 text-center py-8">You need admin permissions to access this page.</p>
        </Section>
      </div>
    );
  }

  const counts = {
    products: data.products.length,
    offers: data.offers.length,
    funnels: data.funnels.length,
    destinations: data.destinations.length,
    splitTests: data.splitTests.length,
  };
  const totalEntries = counts.offers + counts.funnels + counts.destinations + counts.splitTests;

  const SeedRow = ({
    title,
    description,
    onClick,
    runKey,
    disabled,
    primary,
  }: {
    title: string;
    description: string;
    onClick: () => void;
    runKey: string;
    disabled?: boolean;
    primary?: boolean;
  }) => (
    <div className="flex items-center justify-between border border-base-300 rounded-xl p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-base-content/50 mt-0.5">{description}</p>
      </div>
      <button
        className={`btn ${primary ? 'btn-primary' : 'btn-ghost'}`}
        onClick={onClick}
        disabled={!!running || disabled}
      >
        {running === runKey ? 'Running...' : primary ? 'Run All' : 'Seed'}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Admin" />

      <div className="space-y-6">
        <Section title="Current Data">
          <div className="flex flex-wrap gap-6 text-sm">
            <span>
              <span className="text-2xl font-bold">{counts.products}</span>{' '}
              <span className="text-base-content/60">products</span>
            </span>
            <span>
              <span className="text-2xl font-bold">{counts.offers}</span>{' '}
              <span className="text-base-content/60">offers</span>
            </span>
            <span>
              <span className="text-2xl font-bold">{counts.funnels}</span>{' '}
              <span className="text-base-content/60">funnels</span>
            </span>
            <span>
              <span className="text-2xl font-bold">{counts.destinations}</span>{' '}
              <span className="text-base-content/60">destinations</span>
            </span>
            <span>
              <span className="text-2xl font-bold">{counts.splitTests}</span>{' '}
              <span className="text-base-content/60">split tests</span>
            </span>
          </div>
        </Section>

        <Section title="Model Management">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sync Models</p>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Push the latest model schemas (fields, types, references) to Builder.io. Creates any missing models and updates existing ones.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSyncModels}
                disabled={!!running}
              >
                {running === 'sync-models' ? 'Syncing...' : 'Sync Models'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Plugin Settings</p>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Open the plugin settings dialog to configure URLs, API keys, and advanced options.
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => openPluginSettings().catch(() => {})}
              >
                Open Settings
              </button>
            </div>
          </div>
        </Section>

        {cartApiKey && (
          <Section title="Product Sync" subtitle="Sync product data from the cart Builder.io space into this funnel space.">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sync Products from Cart Space</p>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Fetches all products from the cart space and creates or updates them here. Matches by GH slug.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSyncProducts}
                disabled={!!running}
              >
                {running === 'sync-products' ? 'Syncing...' : 'Sync Products'}
              </button>
            </div>
          </Section>
        )}

        <Section
          title="Seed Mock Data"
          subtitle="Create sample data for testing. Scripts should be run in order (products → offers → funnels → destinations → split tests)."
        >
          <div className="space-y-3">
            <SeedRow
              title="Seed All"
              description="Creates products, offers, funnels, destinations, and a split test in one go."
              onClick={seedAll}
              runKey="all"
              primary
            />
            <div className="divider text-xs text-base-content/40 my-2">or run individually</div>
            <SeedRow
              title="Create Mock Products"
              description="3 health supplement products (NeuroPure, MindGuard Pro, SleepMax Ultra). Skips duplicates."
              onClick={seedProducts}
              runKey="products"
            />
            <SeedRow
              title="Create Mock Offers"
              description="2 standard offers: Standard Offer (3 tiers) + Sleep Support Offer (2 tiers)."
              onClick={seedOffers}
              runKey="offers"
              disabled={counts.products === 0}
            />
            <SeedRow
              title="Create Mock Funnels"
              description="3 funnels (Control, VSL Variant, Survey Variant) linked to the first offer."
              onClick={seedFunnels}
              runKey="funnels"
              disabled={counts.offers === 0}
            />
            <SeedRow
              title="Create Mock Destinations"
              description="2 destinations (/fst/main, /fst/promo-jan) pointing to the control funnel."
              onClick={seedDestinations}
              runKey="destinations"
              disabled={counts.offers === 0 || counts.funnels === 0}
            />
            <SeedRow
              title="Create Mock Split Tests"
              description="1 A/B test on the first destination with 2 funnel variants."
              onClick={seedSplitTests}
              runKey="split-tests"
              disabled={counts.destinations === 0 || counts.funnels < 2}
            />
          </div>
        </Section>

        <Section title="Danger Zone" variant="danger">
          <p className="text-sm text-base-content/60 mb-4">
            Select model(s) to delete all their entries. Deletions are permanent and run in dependency order.
          </p>
          <div className="space-y-2 mb-4">
            {([
              { key: 'products', label: 'Products', count: counts.products },
              { key: 'offers', label: 'Offers', count: counts.offers },
              { key: 'funnels', label: 'Funnels', count: counts.funnels },
              { key: 'destinations', label: 'Destinations', count: counts.destinations },
              { key: 'splitTests', label: 'Split Tests', count: counts.splitTests },
            ] as const).map(({ key, label, count }) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                  deleteSelection[key]
                    ? 'border-error bg-error/10 cursor-pointer'
                    : 'border-base-300 hover:border-base-content/30 cursor-pointer'
                } ${count === 0 ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-error"
                  checked={deleteSelection[key]}
                  onChange={() => toggleDeleteModel(key)}
                  disabled={count === 0}
                />
                <span className="font-medium">{label}</span>
                <span className="text-sm text-base-content/50 ml-auto">{count} entries</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="btn btn-error btn-outline"
              onClick={handleDeleteSelected}
              disabled={!!running || selectedDeleteCount === 0}
            >
              {running === 'delete-selected' ? 'Deleting...' : `Delete Selected (${selectedDeleteCount})`}
            </button>
          </div>
        </Section>

        {logs.length > 0 && (
          <Section
            title="Log"
            actions={
              <button className="btn btn-sm btn-ghost" onClick={clearLogs}>
                Clear
              </button>
            }
          >
            <div className="bg-base-300 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((entry, i) => (
                <div
                  key={i}
                  className={
                    entry.type === 'success'
                      ? 'text-success'
                      : entry.type === 'error'
                        ? 'text-error'
                        : 'text-base-content/70'
                  }
                >
                  {entry.message}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
