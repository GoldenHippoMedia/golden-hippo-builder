import React from 'react';
import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import { CookiesProvider } from 'react-cookie';
import App from './App';
import { pluginId, pluginIcon } from './constants';
import { OnSaveActions, AppActions } from '@goldenhippo/builder-types';
import { ExtendedApplicationContext } from './interfaces/application-context.interface';
import { syncFunnelModels } from './services/model-sync';

Builder.register('plugin', {
  id: pluginId,
  name: 'Hippo Funnels',
  settings: [
    {
      type: 'text',
      name: 'editUrl',
      friendlyName: 'Funnel Site URL',
      helperText: 'Provide the URL to your funnel site.',
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
      type: 'password',
      name: 'privateApiKey',
      friendlyName: 'Builder Private API Key',
      helperText:
        'Private API key with write access. Found in Builder.io → Account → Space Settings → Developer → API Keys.',
      required: true,
    },
    {
      type: 'text',
      name: 'builderCartPublicApiKey',
      friendlyName: 'Cart Space Public API Key',
      helperText:
        'Public API key from the Builder.io cart/commerce space. Used to sync product data into this funnel space.',
      advanced: true,
    },
  ],
  ctaText: 'Save & Sync Models',
  async onSave(actions: OnSaveActions) {
    await actions.updateSettings({
      hasConnected: true,
    });
    await syncFunnelModels(appState as ExtendedApplicationContext);
    // @ts-expect-error types are not complete
    await appState.dialogs.alert('Hippo Funnels settings saved and models synced.');
  },
});

let _triggerSettingsDialog: ((pluginId: string) => Promise<void>) | null = null;

export function openPluginSettings(): Promise<void> {
  if (!_triggerSettingsDialog) {
    return Promise.reject(new Error('Settings dialog not available yet'));
  }
  return _triggerSettingsDialog(pluginId);
}

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  _triggerSettingsDialog = triggerSettingsDialog;
  // @ts-expect-error incomplete types
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pluginId);
  const hasConnected = pluginSettings?.get('hasConnected');
  const apiUser = pluginSettings?.get('apiUser');
  const apiPassword = pluginSettings?.get('apiPassword');
  const apiUrl = pluginSettings?.get('apiUrl');
  const editUrl = pluginSettings?.get('editUrl');
  const privateApiKey = pluginSettings?.get('privateApiKey');
  if (!hasConnected || !apiUser || !apiPassword || !apiUrl || !editUrl || !privateApiKey) {
    await triggerSettingsDialog(pluginId);
  }
});

Builder.register('appTab', {
  name: 'Hippo Funnels',
  path: 'hippo-funnels',
  icon: pluginIcon,
  component: () => React.createElement(CookiesProvider, null, React.createElement(App)),
});
