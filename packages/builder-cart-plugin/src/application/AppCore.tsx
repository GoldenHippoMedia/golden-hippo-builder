import React, { useEffect, useState, useCallback } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { useCookies } from 'react-cookie';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import UserManagementService, { HippoUser } from '@services/user-management';
import BuilderApi from '@services/builder-api';
import CommerceApi from '@services/commerce-api';
import { PageDetails, BlogComment } from '@utils/utils.interfaces';
import { IProduct } from '@services/commerce-api/types';
import { LoadingSection } from '@goldenhippo/builder-ui';
import HomePage, { PageOption } from './home.page';
import PageManagerHomePage from './page-manager/page-manager-home.page';
import ProductsHomePage from './products/products-home.page';
import BlogHomePage from './blog/blog-home.page';
import BlogCommentPage from './blog/comments/blog-comment.page';
import AdminHomePage from './admin/admin-home.page';
import UserSettingsPage from './settings/user-settings.page';

interface AppCoreProps {
  context: ExtendedApplicationContext;
}

const AppCore: React.FC<AppCoreProps> = ({ context }) => {
  const [cookies, setCookie] = useCookies(['hippo-page', 'hippo-theme']);
  const currentPage = (cookies['hippo-page'] as PageOption) ?? PageOption.HOME;
  const theme = (cookies['hippo-theme'] as string) ?? 'ghippo';
  const isDark = theme === 'ghippo';

  const toggleTheme = useCallback(() => {
    setCookie('hippo-theme', isDark ? 'ghippolight' : 'ghippo', { path: '/' });
  }, [isDark, setCookie]);

  const store = useLocalStore(() => ({
    pages: [] as PageDetails[],
    products: [] as IProduct[],
    blogComments: [] as BlogComment[],
    loading: true,
    user: null as HippoUser | null,
    error: null as string | null,
  }));

  const setPage = useCallback(
    (page: PageOption) => {
      setCookie('hippo-page', page, { path: '/' });
    },
    [setCookie],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const user = UserManagementService.getUserDetails(context);
        store.user = user;

        const builderApi = new BuilderApi(context.user.authHeaders as Record<string, string>, context.user.apiKey);
        const commerceApi = new CommerceApi(user);

        const [pages, blogComments, products] = await Promise.all([
          builderApi.getPages(true),
          builderApi.getBlogComments(),
          commerceApi.getProductFeed().catch(() => [] as IProduct[]),
        ]);

        store.pages = pages;
        store.blogComments = blogComments;
        store.products = products;
      } catch (err: any) {
        console.error('[Hippo Commerce] Error loading data', err);
        store.error = err.message ?? 'An error occurred loading data.';
      } finally {
        store.loading = false;
      }
    };

    load();
  }, [context]);

  return useObserver(() => {
    if (store.loading) {
      return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center" data-theme={theme}>
          <LoadingSection message="Loading Hippo Commerce..." size="lg" />
        </div>
      );
    }

    if (store.error) {
      return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center" data-theme={theme}>
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

    const renderPage = () => {
      switch (currentPage) {
        case PageOption.PAGES:
          return (
            <PageManagerHomePage
              pages={store.pages}
              loading={store.loading}
              onRefresh={() => window.location.reload()}
            />
          );
        case PageOption.PRODUCTS:
          return <ProductsHomePage products={store.products} loading={store.loading} />;
        case PageOption.BLOGS:
          return <BlogHomePage pages={store.pages} loading={store.loading} />;
        case PageOption.BLOG_COMMENTS:
          return <BlogCommentPage comments={store.blogComments} loading={store.loading} />;
        case PageOption.SETTINGS:
          return <UserSettingsPage user={store.user!} context={context} />;
        case PageOption.ABOUT:
          return <AdminHomePage user={store.user!} />;
        case PageOption.HOME:
        default:
          return (
            <HomePage
              pages={store.pages}
              products={store.products}
              blogComments={store.blogComments}
              loading={store.loading}
              setPage={setPage}
            />
          );
      }
    };

    return (
      <div className="min-h-screen bg-base-100" data-theme={theme}>
        {/* Navigation */}
        <div className="navbar bg-base-200 shadow-sm px-4">
          <div className="navbar-start">
            <button
              className={`btn btn-sm ${currentPage === PageOption.HOME ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.HOME)}
            >
              Home
            </button>
            <button
              className={`btn btn-sm ${currentPage === PageOption.PAGES ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.PAGES)}
            >
              Pages
            </button>
            <button
              className={`btn btn-sm ${currentPage === PageOption.PRODUCTS ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.PRODUCTS)}
            >
              Products
            </button>
            <button
              className={`btn btn-sm ${currentPage === PageOption.BLOGS || currentPage === PageOption.BLOG_COMMENTS ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.BLOGS)}
            >
              Blogs
            </button>
          </div>
          <div className="navbar-end gap-1">
            <label className="swap swap-rotate btn btn-sm btn-ghost">
              <input type="checkbox" checked={isDark} onChange={toggleTheme} />
              <svg className="swap-on h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13ZM18,22A10.11,10.11,0,0,1,4.46,10.28,8.11,8.11,0,0,0,17.09,4.73a10.16,10.16,0,0,1,2.28,8.71A10,10,0,0,1,18,22Z" />
              </svg>
              <svg className="swap-off h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>
            </label>
            <button
              className={`btn btn-sm ${currentPage === PageOption.SETTINGS ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(PageOption.SETTINGS)}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">{renderPage()}</div>
      </div>
    );
  });
};

export default AppCore;
