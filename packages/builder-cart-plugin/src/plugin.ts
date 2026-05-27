import {Builder} from '@builder.io/react';
import appState, {ApplicationContext, Model} from '@builder.io/app-context';
import HippoCMSBrandConfiguration from '@application/HippoCMSBrandConfiguration';
import HippoCMSAdmin from '@application/HippoCMSAdmin';
import {adminIcon, configIcon, pluginId} from './constants';
import {AppActions, ModelShape, OnSaveActions} from '@goldenhippo/builder-types';
import UserManagementService from '@services/user-management';
import {ExtendedApplicationContext} from './interfaces/application-context.interface';
import {captureTriggerSettingsDialog} from './plugin-actions';

function getModel(name: string, models: Model[]) {
  const match = models.find((model) => model.name === name);
  console.log(`[Hippo Commerce - CART] Retrieved model "${name}" --->`, match?.id);
  return match;
}

async function setModel(
  shape: ModelShape,
  current: Model | undefined,
  currentState: ApplicationContext,
): Promise<string | undefined> {
  const randomId = crypto.randomUUID().toString();
  try {
    // @ts-expect-error incomplete types
    await currentState.models.update({
      ...shape,
      id: current ? current.id : randomId,
    });
    const id = current ? current.id : randomId;
    console.log('[Hippo Commerce - CART] Model update complete --->', shape.name, id);
    return id;
  } catch (e) {
    console.error(
      '[Hippo Commerce - CART] Set model error',
      e instanceof Error ? { message: e.message, name: e.name, stack: e.stack } : e,
    );
    console.error('[Hippo Commerce - CART] Failed model shape:', shape.name);
  }
  return current ? current.id : shape.name;
}

function getEditUrl(state: ApplicationContext): string {
  // @ts-expect-error not yet typed
  const pluginSettings = state.user.organization.value.settings.plugins?.get(pluginId);
  const editUrl = pluginSettings?.get('editUrl');
  return (editUrl as string) ?? '';
}

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
  ctaText: 'Save & Create Models',
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
