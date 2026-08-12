import { observable } from 'mobx';
import CommerceApi, { type CommerceOffer } from '@services/commerce-api';
import UserManagementService from '@services/user-management';
import type { ExtendedApplicationContext } from '../../interfaces/application-context.interface';

// Offers come from the commerce offers datasource (mock data for now — see CommerceApi).
const state = observable({
  offers: [] as CommerceOffer[],
  loading: false,
  error: null as string | null,
  loaded: false,
});

export const offerStore = {
  get offers(): CommerceOffer[] {
    return state.offers;
  },
  get loading(): boolean {
    return state.loading;
  },
  get error(): string | null {
    return state.error;
  },
  get loaded(): boolean {
    return state.loaded;
  },
  getById(id: string | null | undefined): CommerceOffer | undefined {
    if (!id) return undefined;
    return state.offers.find((offer) => offer.id === id);
  },
  async ensureLoaded(context: ExtendedApplicationContext): Promise<void> {
    if (state.loaded || state.loading) return;
    state.loading = true;
    state.error = null;
    try {
      const user = UserManagementService.getUserDetails(context);
      state.offers = await new CommerceApi(user).getOffers(user.brand);
      state.loaded = true;
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e);
    } finally {
      state.loading = false;
    }
  },
};
