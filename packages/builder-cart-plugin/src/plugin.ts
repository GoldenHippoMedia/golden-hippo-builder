import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import HippoCMSBrandConfiguration from '@application/HippoCMSBrandConfiguration';
import HippoCMSAdmin from '@application/HippoCMSAdmin';
import HippoCMSProductConfig from '@application/HippoCMSProductConfig';
import HippoCMSSeoConfig from '@application/HippoCMSSeoConfig';
import HippoCMSAdaConfig from '@application/HippoCMSAdaConfig';
import {
  adminIcon,
  configIcon,
  productConfigIcon,
  seoConfigIcon,
  adaConfigIcon,
  pluginId,
  CONTROLLABLE_TABS,
} from './constants';
import { AppActions, OnSaveActions } from '@goldenhippo/builder-types';
import { grantLevelForTab } from '@goldenhippo/builder-cart-schemas';
import UserManagementService from '@services/user-management';
import { ExtendedApplicationContext } from './interfaces/application-context.interface';
import { captureTriggerSettingsDialog } from './plugin-actions';
import BuilderApi from '@services/builder-api';

Builder.register('plugin', {
  id: pluginId,
  name: 'Hippo Commerce',
  settings: [
    {
      type: 'select',
      enum: [
        'Badlands Ranch',
        'Beverly Hills MD',
        'Dr. Marty',
        'Driven Entrepreneur',
        'Gundry MD',
        'Roundhouse Provisions',
        'Other',
      ],
      name: 'brand',
      friendlyName: 'Brand',
      helperText: "Select your brand. If you select 'Other', provide your brand under the advanced settings.",
      required: true,
    },
    {
      type: 'text',
      name: 'editUrl',
      friendlyName: 'Development Site URL',
      helperText: 'Provide the URL to your development site.',
      required: true,
    },
    {
      type: 'text',
      name: 'apiUrl',
      friendlyName: 'API URL',
      helperText: 'Provide the URL to your instance of the Hippo Commerce API.',
      required: true,
    },
    {
      type: 'text',
      name: 'apiUser',
      friendlyName: 'API User',
      helperText: 'Provide your Hippo Commerce API User.',
      required: true,
    },
    {
      type: 'password',
      name: 'apiPassword',
      friendlyName: 'API Password',
      helperText: 'Provide your Hippo Commerce API Password.',
      required: true,
    },
    {
      type: 'text',
      name: 'privateApiKey',
      friendlyName: 'Private API Key',
      helperText:
        'Your Builder.io private API key. Required for saving content from the plugin. Found in Settings → Space → Developer.',
      required: true,
    },
    {
      type: 'text',
      name: 'otherBrand',
      friendlyName: 'Custom Brand',
      helperText: 'Provide your brand exactly as it is configured in your Hippo Commerce API.',
      required: false,
      advanced: true,
    },
  ],
  ctaText: 'Save Settings',
  async onSave(actions: OnSaveActions) {
    await actions.updateSettings({
      hasConnected: true,
    });
    // await setHippoModels(appState as ApplicationContext);
    // @ts-expect-error types are not complete
    await appState.dialogs.alert('Hippo Commerce Cart settings saved.');
  },
});

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  captureTriggerSettingsDialog(triggerSettingsDialog);
  // @ts-expect-error incomplete types
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pluginId);
  const hasConnected = pluginSettings?.get('hasConnected');
  const brand = pluginSettings?.get('brand');
  const apiUser = pluginSettings?.get('apiUser');
  const apiPassword = pluginSettings?.get('apiPassword');
  const apiUrl = pluginSettings?.get('apiUrl');
  const editUrl = pluginSettings?.get('editUrl');
  if (!hasConnected || !brand || !apiUser || !apiPassword || !apiUrl || !editUrl) {
    await triggerSettingsDialog(pluginId);
  }
});

const user = UserManagementService.getUserDetails(appState as ExtendedApplicationContext);

const TAB_REGISTRY: Record<string, { name: string; icon: string; component: unknown; adminOnly?: boolean }> = {
  'gh/brand-config': { name: 'Hippo Config', icon: configIcon, component: HippoCMSBrandConfiguration },
  'gh/product-config': { name: 'Product Config', icon: productConfigIcon, component: HippoCMSProductConfig },
  'gh/seo-config': { name: 'SEO Config', icon: seoConfigIcon, component: HippoCMSSeoConfig },
  'gh/ada-config': { name: 'Accessibility', icon: adaConfigIcon, component: HippoCMSAdaConfig },
  'gh/admin': { name: 'Hippo Admin', icon: adminIcon, component: HippoCMSAdmin, adminOnly: true },
};

function registerTab(path: string): void {
  const tab = TAB_REGISTRY[path];
  if (!tab) return;
  Builder.register('appTab', { name: tab.name, path, icon: tab.icon, component: tab.component });
}

// NOTE: This is a convenience/visibility layer enforced client-side at tab
// registration time — it hides tabs a user hasn't been granted, but is not a
// security boundary (content remains reachable via the Builder API directly).
if (user.permissions.admin) {
  // Admins always see every tab.
  Object.keys(TAB_REGISTRY).forEach(registerTab);
} else {
  //For non-admins check their tab access grants
  void (async () => {
    try {
      const api = new BuilderApi(appState as ExtendedApplicationContext);
      const entry = await api.getTabAccess();
      const grant = entry?.data?.grants?.find(
        (g) => (g.userId && g.userId === user.id) || (g.email && g.email === user.email),
      );
      // A tab is visible when the user has read or write access to it.
      CONTROLLABLE_TABS.filter((t) => grantLevelForTab(grant, t.path) !== 'none').forEach((t) => registerTab(t.path));
    } catch (e) {
      console.error('[Hippo Commerce - CART] Failed to load tab access grants', e);
    }
  })();
}
