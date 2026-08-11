import { observable } from 'mobx';
import type BuilderApi from '@services/builder-api';

export class CollectionStore<T extends { id?: string }> {
  private readonly state = observable({
    items: [] as T[],
    loading: false,
    refreshing: false,
    error: null as string | null,
    loaded: false,
  });

  constructor(private readonly fetcher: (api: BuilderApi) => Promise<T[]>) {}

  get items(): T[] {
    return this.state.items;
  }
  get loading(): boolean {
    return this.state.loading;
  }
  get refreshing(): boolean {
    return this.state.refreshing;
  }
  get error(): string | null {
    return this.state.error;
  }
  get loaded(): boolean {
    return this.state.loaded;
  }
  get count(): number {
    return this.state.items.length;
  }

  /** Fetch on first use and keep in memory; a no-op once loaded or while a load is in flight. */
  async ensureLoaded(api: BuilderApi): Promise<void> {
    if (this.state.loaded || this.state.loading) return;
    await this.fetch(api, 'loading');
  }

  /** Explicit re-fetch (e.g. a Refresh button); current items stay visible until it resolves. */
  async refresh(api: BuilderApi): Promise<void> {
    if (this.state.refreshing) return;
    await this.fetch(api, 'refreshing');
  }

  /** Optimistically show a freshly created entry — the CDN list is eventually consistent. */
  prepend(item: T): void {
    this.state.items = [item, ...this.state.items];
  }

  /** Replace an entry by id in place (e.g. after a save), or prepend it if not present. */
  upsert(item: T): void {
    const index = this.state.items.findIndex((existing) => existing.id && existing.id === item.id);
    this.state.items =
      index === -1
        ? [item, ...this.state.items]
        : this.state.items.map((existing, i) => (i === index ? item : existing));
  }

  setError(message: string | null): void {
    this.state.error = message;
  }

  getById(id: string | null | undefined): T | null {
    if (!id) return null;
    return this.state.items.find((item) => item.id === id) ?? null;
  }

  private async fetch(api: BuilderApi, flag: 'loading' | 'refreshing'): Promise<void> {
    this.state[flag] = true;
    this.state.error = null;
    try {
      this.state.items = await this.fetcher(api);
      this.state.loaded = true;
    } catch (e) {
      this.state.error = e instanceof Error ? e.message : String(e);
    } finally {
      this.state[flag] = false;
    }
  }
}
