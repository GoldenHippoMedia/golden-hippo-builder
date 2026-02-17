import React from 'react';
import { HiOutlineShoppingCart, HiOutlineTag, HiOutlineBeaker, HiOutlineSquares2X2 } from 'react-icons/hi2';
import { IProduct } from '@services/commerce-api/types';
import { ProductPricingTable } from './product-pricing-table.component';

export interface ProductDetailsModalProps {
  product: IProduct | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({ product, open, onClose }: ProductDetailsModalProps) {
  if (!open || !product) return null;

  const allVariants = [
    ...product.products.oneTime.standard,
    ...product.products.oneTime.myAccount,
    ...product.products.oneTime.sample,
    ...product.products.subscription.standard,
    ...product.products.subscription.myAccount,
    ...product.products.subscription.sample,
  ];

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
          ) : (
            <div className="w-24 h-24 bg-base-200 rounded-lg flex items-center justify-center">
              <HiOutlineShoppingCart className="h-8 w-8 text-base-content/30" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-base-content/60">{product.id}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-semibold">${product.retailPrice.toFixed(2)}</span>
              {product.outOfStock ? (
                <span className="badge badge-error badge-sm">Out of Stock</span>
              ) : (
                <span className="badge badge-success badge-sm">In Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && <p className="mt-4 text-sm text-base-content/70">{product.description}</p>}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <span className="text-base-content/60">Brand:</span> <span className="font-medium">{product.brand}</span>
          </div>
          <div>
            <span className="text-base-content/60">Slug:</span> <span className="font-medium">{product.slug}</span>
          </div>
          {product.group.name && (
            <div>
              <span className="text-base-content/60">Group:</span>{' '}
              <span className="font-medium">{product.group.name}</span>
            </div>
          )}
          {product.category && (
            <div>
              <span className="text-base-content/60">Category:</span>{' '}
              <span className="font-medium">{product.category}</span>
            </div>
          )}
          <div>
            <span className="text-base-content/60">Country:</span> <span>{product.countryCode}</span>
          </div>
          <div>
            <span className="text-base-content/60">Currency:</span> <span>{product.currencyCode}</span>
          </div>
          {product.upc && (
            <div>
              <span className="text-base-content/60">UPC:</span> <span>{product.upc}</span>
            </div>
          )}
          {product.taxCode && (
            <div>
              <span className="text-base-content/60">Tax Code:</span> <span>{product.taxCode}</span>
            </div>
          )}
        </div>

        {/* Packaging */}
        {product.packaging && (
          <div className="mt-3 text-sm">
            <span className="text-base-content/60">Packaging:</span>{' '}
            <span>
              {product.packaging.singular} / {product.packaging.plural}
            </span>
          </div>
        )}

        {/* CMS Data */}
        {product.cms && (
          <div className="mt-4">
            <div className="divider text-xs text-base-content/50">CMS Details</div>

            {product.cms.categories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <HiOutlineSquares2X2 className="h-4 w-4 text-base-content/50" />
                {product.cms.categories.map((c) => (
                  <span key={c.id} className="badge badge-ghost badge-xs">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {product.cms.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <HiOutlineTag className="h-4 w-4 text-base-content/50" />
                {product.cms.tags.map((t) => (
                  <span
                    key={t.id}
                    className="badge badge-xs"
                    style={t.color ? { backgroundColor: t.color, color: '#fff' } : undefined}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}

            {product.cms.ingredients.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <HiOutlineBeaker className="h-4 w-4 text-base-content/50" />
                {product.cms.ingredients.map((ing) => (
                  <span key={ing.id} className="badge badge-ghost badge-xs">
                    {ing.name}
                  </span>
                ))}
              </div>
            )}

            {product.cms.reviews.count > 0 && (
              <div className="text-sm mt-2">
                <span className="text-base-content/60">Reviews:</span>{' '}
                <span className="font-medium">{product.cms.reviews.average.toFixed(1)}</span>
                <span className="text-base-content/50"> ({product.cms.reviews.count})</span>
              </div>
            )}
          </div>
        )}

        {/* Pricing Table */}
        {allVariants.length > 0 && (
          <div className="mt-4">
            <div className="divider text-xs text-base-content/50">Pricing</div>
            <ProductPricingTable variants={allVariants} currencyCode={product.currencyCode} />
          </div>
        )}

        {/* Restricted Countries */}
        {product.restrictedCountries.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-base-content/60">
              Restricted in: {product.restrictedCountries.map((c) => c.name).join(', ')}
            </span>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
