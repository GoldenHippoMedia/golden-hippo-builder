import { describe, it, expect } from 'vitest';
import { createPageModel } from './page.model';

const minimalProps = {
  productModelId: 'product-id',
  productGroupModelId: 'product-group-id',
  categoryModelId: 'category-id',
  bannerModelId: 'banner-id',
  blogCategoryModelId: 'blog-category-id',
  sectionModelId: 'section-id',
  editUrl: 'https://example.com',
};

describe('createPageModel', () => {
  it('includes a canonicalURL field of type url', () => {
    const model = createPageModel(minimalProps);
    const field = model.fields?.find((f) => f.name === 'canonicalURL');
    expect(field).toBeDefined();
    expect(field?.type).toBe('url');
    expect(field?.required).toBe(false);
  });

  it('places canonicalURL immediately after heading', () => {
    const model = createPageModel(minimalProps);
    const fields = model.fields ?? [];
    const headingIdx = fields.findIndex((f) => f.name === 'heading');
    const canonicalIdx = fields.findIndex((f) => f.name === 'canonicalURL');
    expect(headingIdx).toBeGreaterThanOrEqual(0);
    expect(canonicalIdx).toBe(headingIdx + 1);
  });
});
