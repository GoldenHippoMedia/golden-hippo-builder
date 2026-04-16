import React, { useCallback, useEffect } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { BuilderBrandConfigContent } from '@goldenhippo/builder-cart-schemas';
import { LoadingSection, EmptyState, PageHeader } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import UserManagementService from '@services/user-management';
import GeneralSection from './sections/general.section';
import HeaderSection from './sections/header.section';
import FooterSection from './sections/footer.section';
import FeaturesSection from './sections/features.section';
import SupportSection from './sections/support.section';
import PagesSection from './sections/pages.section';
import CookieSection from './sections/cookie.section';
import SeoSection from './sections/seo.section';

const TABS = ['General', 'Header', 'Footer', 'Features', 'Support', 'Pages', 'Cookies', 'SEO'] as const;
type Tab = (typeof TABS)[number];

interface BrandConfigPageProps {
  context: ExtendedApplicationContext;
}

const BrandConfigPage: React.FC<BrandConfigPageProps> = ({ context }) => {
  const store = useLocalStore(() => ({
    config: null as BuilderBrandConfigContent | null,
    data: {} as Record<string, any>,
    loading: true,
    saving: false,
    error: null as string | null,
    dirty: false,
    activeTab: 'General' as Tab,
  }));

  const api = React.useMemo(() => new BuilderApi(context), [context]);
  const brand = UserManagementService.getUserDetails(context).brand;

  const loadConfig = useCallback(async () => {
    store.loading = true;
    store.error = null;
    try {
      const entries = await api.getBrandConfig();
      if (entries.length > 0) {
        store.config = entries[0];
        store.data = { ...(entries[0].data || {}) };
      }
    } catch (err: any) {
      console.error('[Hippo Commerce] Error loading brand config', err);
      store.error = err.message ?? 'Failed to load brand configuration.';
    } finally {
      store.loading = false;
    }
  }, [api, store]);

  const createConfig = useCallback(async () => {
    store.loading = true;
    try {
      await api.createBrandConfig(`${brand || 'Brand'} Configuration`);
      await loadConfig();
    } catch (err: any) {
      console.error('[Hippo Commerce] Error creating brand config', err);
      store.error = err.message ?? 'Failed to create brand configuration.';
      store.loading = false;
    }
  }, [api, brand, loadConfig, store]);

  const saveConfig = useCallback(async () => {
    if (!store.config || !store.dirty) return;
    store.saving = true;
    try {
      const updated = { ...store.config, data: { ...store.data } };
      await api.saveContent(updated as any);
      store.config = updated;
      store.dirty = false;
      await context.dialogs.alert('Brand configuration saved.', 'Success');
    } catch (err: any) {
      console.error('[Hippo Commerce] Error saving brand config', err);
      await context.dialogs.alert(`Save failed: ${err.message}`, 'Error');
    } finally {
      store.saving = false;
    }
  }, [api, context, store]);

  const markDirty = useCallback(() => {
    store.dirty = true;
  }, [store]);

  const onChange = useCallback(
    (section: string, key: string, value: any) => {
      if (!store.data[section]) {
        store.data[section] = {};
      }
      store.data[section][key] = value;
      store.dirty = true;
    },
    [store],
  );

  const onChangeRoot = useCallback(
    (key: string, value: any) => {
      store.data[key] = value;
      store.dirty = true;
    },
    [store],
  );

  useEffect(() => {
    loadConfig();
  }, []);

  return useObserver(() => {
    if (store.loading) {
      return <LoadingSection message="Loading brand configuration..." size="lg" />;
    }

    if (store.error && !store.config) {
      return (
        <div className="text-center py-16">
          <p className="text-error mb-4">{store.error}</p>
          <button className="btn btn-error btn-sm" onClick={() => loadConfig()}>
            Retry
          </button>
        </div>
      );
    }

    if (!store.config) {
      return (
        <EmptyState
          message="No brand configuration found. Create one to get started."
          action={{ label: 'Create Brand Configuration', onClick: createConfig }}
        />
      );
    }

    const renderSection = () => {
      const sectionProps = { data: store.data, onChange, onChangeRoot, markDirty };
      switch (store.activeTab) {
        case 'General':
          return <GeneralSection {...sectionProps} />;
        case 'Header':
          return <HeaderSection {...sectionProps} />;
        case 'Footer':
          return <FooterSection {...sectionProps} />;
        case 'Features':
          return <FeaturesSection {...sectionProps} />;
        case 'Support':
          return <SupportSection {...sectionProps} />;
        case 'Pages':
          return <PagesSection {...sectionProps} />;
        case 'Cookies':
          return <CookieSection {...sectionProps} />;
        case 'SEO':
          return <SeoSection {...sectionProps} />;
        default:
          return null;
      }
    };

    return (
      <div>
        <PageHeader
          title="Brand Configuration"
          actions={
            <button
              className={`btn btn-primary btn-sm ${store.saving ? 'loading' : ''}`}
              disabled={!store.dirty || store.saving}
              onClick={saveConfig}
            >
              {store.saving ? 'Saving...' : 'Save'}
            </button>
          }
        />

        <div role="tablist" className="tabs tabs-bordered mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              className={`tab ${store.activeTab === tab ? 'tab-active' : ''}`}
              onClick={() => (store.activeTab = tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {renderSection()}
      </div>
    );
  });
};

export default BrandConfigPage;
