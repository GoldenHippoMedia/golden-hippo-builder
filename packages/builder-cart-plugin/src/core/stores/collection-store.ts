import { makeAutoObservable, runInAction } from 'mobx';
import type BuilderApi from '@services/builder-api';

export class CollectionStore<T extends { id?: string }> {
  items: T[] = [];
  loading = false;
  refreshing = false;
  error: string | null = null;
  loaded = false;

  constructor(private readonly fetcher: (api: BuilderApi) => Promise<T[]>) {
    makeAutoObservable<this, 'fetcher'>(this, { fetcher: false }, { autoBind: true });
  }

  get count(): number {
    return this.items.length;
  }

  /** Fetch on first use and keep in memory; a no-op once loaded or while a load is in flight. */
  async ensureLoaded(api: BuilderApi): Promise<void> {
    if (this.loaded || this.loading) return;
    await this.fetch(api, 'loading');
  }

  /** Explicit re-fetch (e.g. a Refresh button); current items stay visible until it resolves. */
  async refresh(api: BuilderApi): Promise<void> {
    if (this.refreshing) return;
    await this.fetch(api, 'refreshing');
  }

  /** Optimistically show a freshly created entry — the CDN list is eventually consistent. */
  prepend(item: T): void {
    this.items = [item, ...this.items];
  }

  setError(message: string | null): void {
    this.error = message;
  }

  getById(id: string | null | undefined): T | null {
    if (!id) return null;
    return this.items.find((item) => item.id === id) ?? null;
  }

  private async fetch(api: BuilderApi, flag: 'loading' | 'refreshing'): Promise<void> {
    this[flag] = true;
    this.error = null;
    try {
      const results = await this.fetcher(api);
      runInAction(() => {
        this.items = results;
        this.loaded = true;
        this[flag] = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : String(e);
        this[flag] = false;
      });
    }
  }
}
