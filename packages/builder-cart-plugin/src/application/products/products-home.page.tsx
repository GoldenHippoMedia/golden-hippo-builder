import React, { useState, useMemo } from 'react';
import { IProduct } from '@services/commerce-api/types';
import { LoadingSection } from '@goldenhippo/builder-ui';
import { ProductDetailsModal } from '@components/product-details-modal.component';
import { HiMagnifyingGlass } from 'react-icons/hi2';

interface ProductsHomePageProps {
  products: IProduct[];
  loading: boolean;
}

const ProductsHomePage: React.FC<ProductsHomePageProps> = ({ products, loading }) => {
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.group?.name ?? '').toLowerCase().includes(q),
    );
  }, [products, search]);

  const groupNames = [...new Set(products.map((p) => p.group?.name ?? 'Ungrouped'))].sort();

  if (loading) {
    return <LoadingSection message="Loading products..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Catalog</h2>
          <p className="text-base-content/70">
            {products.length} products across {groupNames.length} groups
          </p>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
        <input
          type="text"
          placeholder="Search products..."
          className="input input-bordered w-full pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p className="text-sm text-base-content/60 mb-3">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Group</th>
              <th>Slug</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="cursor-pointer hover" onClick={() => setSelectedProduct(product)}>
                <td>
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <div className="avatar">
                        <div className="mask mask-squircle h-10 w-10">
                          <img src={product.image} alt={product.name} />
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm">{product.name}</div>
                      <div className="text-xs text-base-content/50">{product.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-ghost badge-sm">{product.group?.name ?? 'N/A'}</span>
                </td>
                <td className="text-sm">{product.slug}</td>
                <td className="text-sm">${product.retailPrice.toFixed(2)}</td>
                <td>
                  {product.outOfStock ? (
                    <span className="badge badge-error badge-sm">Out of Stock</span>
                  ) : (
                    <span className="badge badge-success badge-sm">In Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-lg">No products found.</p>
          <p className="text-sm">
            {search ? 'Try adjusting your search.' : 'Check your commerce API configuration in plugin settings.'}
          </p>
        </div>
      )}

      <ProductDetailsModal
        product={selectedProduct}
        open={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default ProductsHomePage;
