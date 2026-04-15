import React, { useCallback, useEffect } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { useCookies } from 'react-cookie';
import appState from '@builder.io/app-context';
import {
  BuilderFunnelContent,
  BuilderFunnelDestinationContent,
  BuilderFunnelPageContent,
} from '@goldenhippo/builder-funnel-schemas';
import './styles.css';
import { LoadingSection } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from './interfaces/application-context.interface';
import BuilderApi from './services/builder-api';
import DashboardPage from './application/dashboard.page';
import FunnelsPage from './application/funnels/funnels.page';
import DestinationsPage from './application/destinations/destinations.page';
import AdminPage from './application/admin/admin.page';

export enum PageOption {
  DASHBOARD = 'dashboard',
  FUNNELS = 'funnels',
  DESTINATIONS = 'destinations',
  ADMIN = 'admin',
}

export interface FunnelAppData {
  funnels: BuilderFunnelContent[];
  funnelPages: BuilderFunnelPageContent[];
  destinations: BuilderFunnelDestinationContent[];
}

const App: React.FC = () => {
  const context = appState as ExtendedApplicationContext;
  const [cookies, setCookie] = useCookies(['hippo-funnel-page']);
  const currentPage = (cookies['hippo-funnel-page'] as PageOption) ?? PageOption.DASHBOARD;

  const store = useLocalStore(() => ({
    funnels: [] as BuilderFunnelContent[],
    funnelPages: [] as BuilderFunnelPageContent[],
    destinations: [] as BuilderFunnelDestinationContent[],
    loading: true,
    error: null as string | null,
  }));

  const setPage = useCallback(
    (page: PageOption) => {
      setCookie('hippo-funnel-page', page, { path: '/' });
    },
    [setCookie],
  );

  const loadData = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) store.loading = true;
      try {
        const builderApi = new BuilderApi(context);
        const [funnels, funnelPages, destinations] = await Promise.all([
          builderApi.getFunnels(true),
          builderApi.getFunnelPages(true),
          builderApi.getDestinations(true),
        ]);
        store.funnels = funnels;
        store.funnelPages = funnelPages;
        store.destinations = destinations;
        store.error = null;
      } catch (err: any) {
        console.error('[Hippo Funnels] Error loading data', err);
        if (showLoading) store.error = err.message ?? 'An error occurred loading data.';
      } finally {
        store.loading = false;
      }
    },
    [context, store],
  );

  const refresh = useCallback(() => loadData(false), [loadData]);

  useEffect(() => {
    loadData(true);
  }, []);

  return useObserver(() => {
    const isDark = context.config.darkMode;
    const theme = isDark ? 'ghippo' : 'ghippolight';

    const toggleTheme = () => {
      context.config.darkMode = !context.config.darkMode;
    };

    if (store.loading) {
      return (
        <div id="hippo-app" className="min-h-screen bg-base-100 flex items-center justify-center" data-theme={theme}>
          <LoadingSection message="Loading Hippo Funnels..." size="lg" />
        </div>
      );
    }

    if (store.error) {
      return (
        <div id="hippo-app" className="min-h-screen bg-base-100 flex items-center justify-center" data-theme={theme}>
          <div className="card bg-error/10 max-w-lg">
            <div className="card-body text-center">
              <h2 className="card-title text-error justify-center">Error</h2>
              <p>{store.error}</p>
              <button className="btn btn-error btn-sm mt-4" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    const data: FunnelAppData = {
      funnels: store.funnels,
      funnelPages: store.funnelPages,
      destinations: store.destinations,
    };

    const renderPage = () => {
      switch (currentPage) {
        case PageOption.FUNNELS:
          return <FunnelsPage data={data} context={context} onRefresh={refresh} />;
        case PageOption.DESTINATIONS:
          return <DestinationsPage data={data} context={context} onRefresh={refresh} />;
        case PageOption.ADMIN:
          return <AdminPage data={data} context={context} onRefresh={refresh} />;
        case PageOption.DASHBOARD:
        default:
          return <DashboardPage data={data} setPage={setPage} />;
      }
    };

    return (
      <div id="hippo-app" className="min-h-screen bg-base-100" data-theme={theme}>
        {/* Navigation */}
        <div className="navbar bg-base-200 shadow-sm px-6">
          <div className="navbar-start gap-2">
            <button
              className={`btn btn-sm ${currentPage === PageOption.DASHBOARD ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.DASHBOARD)}
            >
              Home
            </button>
            <button
              className={`btn btn-sm ${currentPage === PageOption.FUNNELS ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.FUNNELS)}
            >
              Funnels
            </button>
            <button
              className={`btn btn-sm ${currentPage === PageOption.DESTINATIONS ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.DESTINATIONS)}
            >
              Destinations
            </button>
          </div>
          <div className="navbar-end gap-2">
            <button
              className="btn btn-sm btn-ghost"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13ZM18,22A10.11,10.11,0,0,1,4.46,10.28,8.11,8.11,0,0,0,17.09,4.73a10.16,10.16,0,0,1,2.28,8.71A10,10,0,0,1,18,22Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                </svg>
              )}
            </button>
            {context.user.can('admin') && (
              <button
                className={`btn btn-sm ${currentPage === PageOption.ADMIN ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPage(PageOption.ADMIN)}
              >
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">{renderPage()}</div>
      </div>
    );
  });
};

export default App;
