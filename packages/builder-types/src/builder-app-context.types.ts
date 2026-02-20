export interface OnSaveActions {
  updateSettings(partial: Record<string, any>): Promise<void>;
}

export interface AppActions {
  triggerSettingsDialog(pluginId: string): Promise<void>;
}
