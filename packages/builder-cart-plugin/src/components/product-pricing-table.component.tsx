import React from 'react';
import { IProductVariant, IPurchaseType, IStandardPriceLevel } from '@services/commerce-api/types';

export interface ProductPricingTableProps {
  variants: IProductVariant[];
  currencyCode?: string;
}

function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function groupVariants(variants: IProductVariant[]) {
  const groups: Record<string, Record<string, IProductVariant[]>> = {};

  for (const variant of variants) {
    const purchaseType = variant.purchaseType;
    const priceLevel = variant.priceLevel;

    if (!groups[purchaseType]) groups[purchaseType] = {};
    if (!groups[purchaseType][priceLevel]) groups[purchaseType][priceLevel] = [];
    groups[purchaseType][priceLevel].push(variant);
  }

  return groups;
}

export function ProductPricingTable({ variants, currencyCode = 'USD' }: ProductPricingTableProps) {
  if (variants.length === 0) {
    return <p className="text-sm text-base-content/50">No pricing data available.</p>;
  }

  const grouped = groupVariants(variants);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([purchaseType, levels]) => (
        <div key={purchaseType}>
          <h4 className="font-semibold text-sm mb-2">{purchaseType}</h4>
          {Object.entries(levels).map(([priceLevel, items]) => (
            <div key={priceLevel} className="mb-3">
              <span className="text-xs badge badge-ghost mb-1">{priceLevel}</span>
              <div className="overflow-x-auto">
                <table className="table table-xs w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Qty</th>
                      <th>Price</th>
                      {items.some((v) => v.savings !== null) && <th>Savings</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .sort((a, b) => a.quantity - b.quantity)
                      .map((variant) => (
                        <tr key={variant.variantId}>
                          <td className="font-medium">{variant.name}</td>
                          <td className="text-base-content/60">{variant.sku}</td>
                          <td>{variant.quantity}</td>
                          <td>{formatPrice(variant.price, currencyCode)}</td>
                          {items.some((v) => v.savings !== null) && (
                            <td>
                              {variant.savings !== null ? (
                                <span className="text-success">{formatPrice(variant.savings, currencyCode)}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
