import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSection, PageHeader, Section } from '@goldenhippo/builder-ui';
import type {
  BuilderProductContent,
  BuilderProductTagContent,
  BuilderProductCategoryContent,
  BuilderIngredientContent,
  BuilderProductUseCaseContent,
} from '@goldenhippo/builder-shared-schemas';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { resolveCurrentUserTabLevel } from '../../services/tab-access';
import ProductList from './components/product-list';
import ProductDetail from './components/product-detail';
import { collectLocales } from './localization';

interface ProductConfigPageProps {
  context: ExtendedApplicationContext;
}

type View = { kind: 'list' } | { kind: 'detail'; productId: string };

const ProductConfigPage: React.FC<ProductConfigPageProps> = ({ context }) => {
  const api = useMemo(() => new BuilderApi(context), [context]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<BuilderProductContent[]>([]);
  const [tags, setTags] = useState<BuilderProductTagContent[]>([]);
  const [categories, setCategories] = useState<BuilderProductCategoryContent[]>([]);
  const [ingredients, setIngredients] = useState<BuilderIngredientContent[]>([]);
  const [useCases, setUseCases] = useState<BuilderProductUseCaseContent[]>([]);
  const [view, setView] = useState<View>({ kind: 'list' });
  const [canWrite, setCanWrite] = useState(false);

  // Tracks whether the component is still mounted so an in-flight load doesn't
  // set state after unmount
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(
    async (initial: boolean) => {
      if (initial) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        // Fetch raw (unresolved) so localized fields stay as LocalizedValue
        // objects — required to edit per-locale and to discover locales.
        const [productResults, tagResults, categoryResults, ingredientResults, useCaseResults] = await Promise.all([
          api.getModelEntries<BuilderProductContent>('product', { bustCache: true, raw: true }),
          api.getModelEntries<BuilderProductTagContent>('product-tag', { bustCache: true, raw: true }),
          api.getModelEntries<BuilderProductCategoryContent>('product-category', { bustCache: true, raw: true }),
          api.getModelEntries<BuilderIngredientContent>('product-ingredient', { bustCache: true, raw: true }),
          api.getModelEntries<BuilderProductUseCaseContent>('product-use-case', { bustCache: true, raw: true }),
        ]);
        if (!mounted.current) return;
        setProducts(productResults);
        setTags(tagResults);
        setCategories(categoryResults);
        setIngredients(ingredientResults);
        setUseCases(useCaseResults);
      } catch (e) {
        if (!mounted.current) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted.current) {
          if (initial) setLoading(false);
          else setRefreshing(false);
        }
      }
    },
    [api],
  );

  useEffect(() => {
    void load(true);
  }, [load]);

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

  const selectedProduct = useMemo(() => {
    if (view.kind !== 'detail') return null;
    return products.find((p) => p.id === view.productId) ?? null;
  }, [view, products]);

  // Locales discovered across all fetched content (Default first).
  const availableLocales = useMemo(
    () => collectLocales([...products, ...tags, ...categories, ...ingredients, ...useCases]),
    [products, tags, categories, ingredients, useCases],
  );

  const handleProductSaved = useCallback((updated: BuilderProductContent) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const refreshAction = (
    <button
      onClick={() => load(false)}
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
      subtitle={`${products.length} product${products.length === 1 ? '' : 's'} • ${tags.length} tag${tags.length === 1 ? '' : 's'}`}
      actions={refreshAction}
    />
  );

  if (loading) {
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

  if (error) {
    return (
      <div>
        <PageHeader
          title="Product Configuration"
          subtitle="Manage product tags, categories, ingredients, and use cases"
        />
        <Section title="Failed to load products">
          <div className="text-sm text-[var(--error)] bg-[var(--error)]/10 rounded-lg px-4 py-3 break-all">{error}</div>
        </Section>
      </div>
    );
  }

  if (view.kind === 'detail' && selectedProduct) {
    return (
      <div>
        {header}
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
      <ProductList
        products={products}
        tagsById={tagsById}
        onSelect={(productId) => setView({ kind: 'detail', productId })}
      />
    </div>
  );
};

export default ProductConfigPage;
