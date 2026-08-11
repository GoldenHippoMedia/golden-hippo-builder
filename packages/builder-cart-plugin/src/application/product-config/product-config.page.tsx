import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import type {
  BuilderProductContent,
  BuilderProductTagContent,
  BuilderProductCategoryContent,
  BuilderIngredientContent,
  BuilderProductUseCaseContent,
} from '@goldenhippo/builder-shared-schemas';
import type { BuilderProductGroupContent } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { resolveCurrentUserTabLevel } from '../../services/tab-access';
import ProductList from './components/product-list';
import ProductDetail from './components/product-detail';
import { collectLocales } from './localization';
import {
  productData,
  productStore,
  productGroupStore,
  productTagStore,
  productCategoryStore,
  productIngredientStore,
  productUseCaseStore,
} from './product-data.store';

interface ProductConfigPageProps {
  context: ExtendedApplicationContext;
}

type View = { kind: 'list' } | { kind: 'detail'; productId: string };

const ProductConfigPage: React.FC<ProductConfigPageProps> = observer(({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  const [view, setView] = useState<View>({ kind: 'list' });
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    void productData.ensureLoaded(api);
  }, [api]);

  const products: BuilderProductContent[] = productStore.items;
  const groups: BuilderProductGroupContent[] = productGroupStore.items;
  const tags: BuilderProductTagContent[] = productTagStore.items;
  const categories: BuilderProductCategoryContent[] = productCategoryStore.items;
  const ingredients: BuilderIngredientContent[] = productIngredientStore.items;
  const useCases: BuilderProductUseCaseContent[] = productUseCaseStore.items;
  const { loaded, refreshing, error } = productData;

  useEffect(() => {
    let active = true;
    void resolveCurrentUserTabLevel(context, 'gh/product-config').then((level) => {
      if (active) setCanWrite(level === 'write');
    });
    return () => {
      active = false;
    };
  }, [context]);

  const tagsById = useMemo(() => {
    const map = new Map<string, BuilderProductTagContent>();
    tags.forEach((t) => {
      if (t.id) map.set(t.id, t);
    });
    return map;
  }, [tags]);

  const categoriesById = useMemo(() => {
    const map = new Map<string, BuilderProductCategoryContent>();
    categories.forEach((c) => {
      if (c.id) map.set(c.id, c);
    });
    return map;
  }, [categories]);

  const ingredientsById = useMemo(() => {
    const map = new Map<string, BuilderIngredientContent>();
    ingredients.forEach((i) => {
      if (i.id) map.set(i.id, i);
    });
    return map;
  }, [ingredients]);

  const useCasesById = useMemo(() => {
    const map = new Map<string, BuilderProductUseCaseContent>();
    useCases.forEach((u) => {
      if (u.id) map.set(u.id, u);
    });
    return map;
  }, [useCases]);

  const selectedProduct = useMemo(() => {
    if (view.kind !== 'detail') return null;
    return products.find((p) => p.id === view.productId) ?? null;
  }, [view, products]);

  // Locales discovered across all fetched content (Default first).
  const availableLocales = useMemo(
    () => collectLocales([...products, ...groups, ...tags, ...categories, ...ingredients, ...useCases]),
    [products, groups, tags, categories, ingredients, useCases],
  );

  const handleProductSaved = useCallback((updated: BuilderProductContent) => {
    productStore.upsert(updated);
  }, []);

  const refreshAction = (
    <button
      onClick={() => productData.refresh(api)}
      disabled={refreshing}
      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
      title="Re-fetch products and taxonomy from Builder.io (cache-busted)"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={refreshing ? 'animate-spin' : ''}
      >
        <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  );

  const header = (
    <PageHeader
      title="Product Configuration"
      subtitle={`${products.length} product${products.length === 1 ? '' : 's'} • ${groups.length} group${groups.length === 1 ? '' : 's'} • ${tags.length} tag${tags.length === 1 ? '' : 's'}`}
      actions={refreshAction}
    />
  );

  // Only shown once we have data — a failed initial load returns the error screen below instead.
  const errorBanner = error ? (
    <div className="mb-4 break-all rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">{error}</div>
  ) : null;

  if (!loaded && error) {
    return (
      <div>
        <PageHeader
          title="Product Configuration"
          subtitle="Manage product tags, categories, ingredients, and use cases"
        />
        <Section title="Failed to load products" variant="danger">
          <div className="text-sm text-[var(--error)] bg-[var(--error)]/10 rounded-lg px-4 py-3 break-all">{error}</div>
        </Section>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div>
        <PageHeader
          title="Product Configuration"
          subtitle="Manage product tags, categories, ingredients, and use cases"
        />
        <LoadingSection />
      </div>
    );
  }

  if (view.kind === 'detail' && selectedProduct) {
    return (
      <div>
        {header}
        {errorBanner}
        <ProductDetail
          product={selectedProduct}
          api={api}
          tags={tags}
          categories={categories}
          ingredients={ingredients}
          useCases={useCases}
          locales={availableLocales}
          canWrite={canWrite}
          onBack={() => setView({ kind: 'list' })}
          onSaved={handleProductSaved}
        />
      </div>
    );
  }

  return (
    <div>
      {header}
      {errorBanner}
      <ProductList
        products={products}
        groups={groups}
        tagsById={tagsById}
        categoriesById={categoriesById}
        ingredientsById={ingredientsById}
        useCasesById={useCasesById}
        onSelect={(productId) => setView({ kind: 'detail', productId })}
      />
    </div>
  );
});

ProductConfigPage.displayName = 'ProductConfigPage';

export default ProductConfigPage;
