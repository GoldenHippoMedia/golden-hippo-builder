import { observable } from 'mobx';
import { BuilderFunnelContent, BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-schemas';
import type { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import BuilderApi from '../services/builder-api';

const state = observable({
  funnels: [] as BuilderFunnelContent[],
  funnelPages: [] as BuilderFunnelPageContent[],
  loading: true,
  error: null as string | null,
  loaded: false,
});

export const funnelDataStore = {
  get funnels() {
    return state.funnels;
  },
  get funnelPages() {
    return state.funnelPages;
  },
  get loading() {
    return state.loading;
  },
  get error() {
    return state.error;
  },

  async load(context: ExtendedApplicationContext): Promise<void> {
    if (state.loaded) return;
    state.loading = true;
    state.error = null;
    try {
      const api = new BuilderApi(context);
      const [funnels, funnelPages] = await Promise.all([api.getFunnels(true), api.getFunnelPages(true)]);
      state.funnels = funnels;
      state.funnelPages = funnelPages;
      state.loaded = true;
    } catch (err: any) {
      state.error = err.message ?? 'An error occurred loading data.';
      console.error('[Hippo Funnels] Error loading data', err);
    } finally {
      state.loading = false;
    }
  },

  async refresh(context: ExtendedApplicationContext): Promise<void> {
    state.loaded = false;
    await funnelDataStore.load(context);
  },
};
