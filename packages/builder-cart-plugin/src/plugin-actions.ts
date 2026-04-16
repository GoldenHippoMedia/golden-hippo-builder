import { pluginId } from './constants';

type TriggerSettingsDialog = (pluginId: string) => Promise<void>;

let _triggerSettingsDialog: TriggerSettingsDialog | null = null;

export function captureTriggerSettingsDialog(fn: TriggerSettingsDialog) {
  _triggerSettingsDialog = fn;
}

export function openPluginSettings() {
  return _triggerSettingsDialog?.(pluginId);
}
