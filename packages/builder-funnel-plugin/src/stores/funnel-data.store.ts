import { makeAutoObservable, runInAction } from 'mobx';
import { BuilderFunnelContent, BuilderFunnelPageContent } from '@goldenhippo/builder-funnel-schemas';
import type { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import BuilderApi from '../services/builder-api';

class FunnelDataStore {
  funnels: BuilderFunnelContent[] = [];
  funnelPages: BuilderFunnelPageContent[] = [];
  loading = true;
  error: string | null = null;
  private loaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load(context: ExtendedApplicationContext): Promise<void> {
    if (this.loaded) return;
    this.loading = true;
    this.error = null;
    try {
      const api = new BuilderApi(context);
      const [funnels, funnelPages] = await Promise.all([api.getFunnels(true), api.getFunnelPages(true)]);
      runInAction(() => {
        this.funnels = funnels;
        this.funnelPages = funnelPages;
        this.loaded = true;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message ?? 'An error occurred loading data.';
      });
      console.error('[Hippo Funnels] Error loading data', err);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async refresh(context: ExtendedApplicationContext): Promise<void> {
    this.loaded = false;
    await this.load(context);
  }
}

export const funnelDataStore = new FunnelDataStore();
