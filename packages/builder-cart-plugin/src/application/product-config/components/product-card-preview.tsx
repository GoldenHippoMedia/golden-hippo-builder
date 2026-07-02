import React, { useState } from 'react';
import { CARD_VARIANTS, type CardVariantKey, type PreviewProduct, SAMPLE } from './card-previews';

interface ProductCardPreviewProps {
  product: PreviewProduct;
}

const ProductCardPreview: React.FC<ProductCardPreviewProps> = ({ product }) => {
  const [cardKey, setCardKey] = useState<CardVariantKey>('gmd');

  const CardComponent = (CARD_VARIANTS.find((v) => v.key === cardKey) ?? CARD_VARIANTS[0]).Component;

  return (
    <div className="sticky top-24">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Live Preview
      </div>

      {/* Card variant switcher */}
      <div className="mb-3">
        <select
          value={cardKey}
          onChange={(e) => setCardKey(e.target.value as CardVariantKey)}
          className="w-full rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)]/50 focus:outline-none"
        >
          {CARD_VARIANTS.map((v) => (
            <option key={v.key} value={v.key}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rendered card on a neutral backdrop so the white card reads clearly */}
      <div className="rounded-2xl border border-[var(--border-glass)] bg-[#e9e7df] p-5">
        <CardComponent product={product} sample={SAMPLE} />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Representative preview in a neutral company theme — real storefronts vary by brand. Prices and quantities use
        sample data; they are set outside this page. Image, tagline, description, tags, reviews, and stock state reflect
        your edits, and the rendering changes by card style.
      </p>
    </div>
  );
};

export default ProductCardPreview;
