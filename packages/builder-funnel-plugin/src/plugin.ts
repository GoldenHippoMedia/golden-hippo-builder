import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import App from './App';
import { pluginId, pluginIcon } from './constants';

interface AppActions {
  triggerSettingsDialog(pluginId: string): Promise<void>;
}

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
  ],
  ctaText: 'Save',
  async onSave(actions: { updateSettings: (settings: Record<string, any>) => Promise<void> }) {
    await actions.updateSettings({
      hasConnected: true,
    });
    // @ts-expect-error types are not complete
    await appState.dialogs.alert('Hippo Funnels settings saved.');
  },
});

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  // @ts-expect-error incomplete types
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pluginId);
  const hasConnected = pluginSettings?.get('hasConnected');
  if (!hasConnected) {
    await triggerSettingsDialog(pluginId);
  }
});

Builder.register('appTab', {
  name: 'Hippo Funnels',
  path: 'hippo-funnels',
  icon: pluginIcon,
  component: App,
});
