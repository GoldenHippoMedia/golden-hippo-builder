import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import HippoCMSBrandConfiguration from '@application/HippoCMSBrandConfiguration';
import HippoCMSAdmin from '@application/HippoCMSAdmin';
import HippoCMSProductConfig from '@application/HippoCMSProductConfig';
import HippoCMSSeoConfig from '@application/HippoCMSSeoConfig';
import { adminIcon, configIcon, productConfigIcon, seoConfigIcon, pluginId } from './constants';
import { AppActions, OnSaveActions } from '@goldenhippo/builder-types';
import UserManagementService from '@services/user-management';
import { ExtendedApplicationContext } from './interfaces/application-context.interface';
import { captureTriggerSettingsDialog } from './plugin-actions';

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

if (user.permissions.admin) {
  Builder.register('appTab', {
    name: 'Hippo Config',
    path: 'gh/brand-config',
    icon: configIcon,
    component: HippoCMSBrandConfiguration,
  });
}

if (user.permissions.admin) {
  Builder.register('appTab', {
    name: 'Hippo Admin',
    path: 'gh/admin',
    icon: adminIcon,
    component: HippoCMSAdmin,
  });
}

if (user.permissions.admin) {
  Builder.register('appTab', {
    name: 'Product Config',
    path: 'gh/product-config',
    icon: productConfigIcon,
    component: HippoCMSProductConfig,
  });
}

// SEO Config is a read-only audit view, so it's available to all users (no admin gate).
Builder.register('appTab', {
  name: 'SEO Config',
  path: 'gh/seo-config',
  icon: seoConfigIcon,
  component: HippoCMSSeoConfig,
});
