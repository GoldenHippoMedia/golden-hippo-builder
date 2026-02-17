# Consuming Schema Packages

This guide is for frontend teams that need to use the Builder.io model definitions and content types in their applications (Angular, Express, etc.).

## Installation

```bash
npm install @goldenhippo/builder-cart-schemas
```

This automatically installs the dependency `@goldenhippo/builder-types`.

For funnel schemas (when available):

```bash
npm install @goldenhippo/builder-funnel-schemas
```

## Available Imports

### `@goldenhippo/builder-cart-schemas`

The main entry point exports all model creators and content types:

```typescript
import {
  createProductModel,
  createCategoryModel,
  createPageModel,
  type BuilderProductContent,
  type BuilderPageContent,
  type BuilderBlogPageContent,
} from '@goldenhippo/builder-cart-schemas';
```

### Subpath imports (for tree-shaking)

For smaller bundles, import from specific subpaths:

```typescript
// Data models only
import { createProductModel, type BuilderProductContent } from '@goldenhippo/builder-cart-schemas/data';

// Page model only
import { createPageModel, type BuilderPageContent } from '@goldenhippo/builder-cart-schemas/page';

// Section models only
import { createSiteBannerModel, type BuilderSiteBannerModelContent } from '@goldenhippo/builder-cart-schemas/section';
```

### `@goldenhippo/builder-types`

Core Builder.io type definitions used by the schema packages:

```typescript
import type { ModelShape, BuilderIOFieldTypes, BuilderResponseBaseData } from '@goldenhippo/builder-types';
```

You typically don't need to import from `builder-types` directly unless you're building custom model definitions or working with the Builder.io API at a low level.

## Usage Examples

### Typing Builder.io API responses

```typescript
import type { BuilderProductContent } from '@goldenhippo/builder-cart-schemas';

// Type-safe access to product content from Builder.io Content API
function getProductDisplayName(product: BuilderProductContent): string {
  return product?.data?.displayName ?? product?.data?.name ?? '';
}
```

### Working with page types

The page content type is a discriminated union based on `pageType`:

```typescript
import type {
  BuilderPageContent,
  BuilderPdpPageContent,
  BuilderBlogPageContent,
  BuilderGeneralPageContent,
} from '@goldenhippo/builder-cart-schemas';

function renderPage(page: BuilderPageContent) {
  switch (page?.data?.pageType) {
    case 'Product':
      // TypeScript narrows to BuilderPdpPageContent
      return renderPdp(page as BuilderPdpPageContent);
    case 'Blog':
      return renderBlog(page as BuilderBlogPageContent);
    default:
      return renderGeneral(page as BuilderGeneralPageContent);
  }
}
```

### Creating model definitions (for API integration)

```typescript
import { createProductModel, createCategoryModel } from '@goldenhippo/builder-cart-schemas';

// Simple model (no dependencies)
const categoryModel = createCategoryModel();
// categoryModel.name === 'product-category'
// categoryModel.fields === [...Builder.io field definitions]

// Model with dependencies (requires other model IDs)
const productModel = createProductModel({
  ingredientsModelId: '<builder-model-id>',
  categoryModelId: '<builder-model-id>',
  tagModelId: '<builder-model-id>',
  useCaseModelId: '<builder-model-id>',
});
```

## Pinning Versions

For production stability, pin to exact versions:

```bash
npm install @goldenhippo/builder-cart-schemas@0.2.0 --save-exact
```

Or use a range:

```jsonc
// package.json
{
  "dependencies": {
    "@goldenhippo/builder-cart-schemas": "~0.2.0", // patches only
  },
}
```

## Updating

Check for new versions:

```bash
npm outdated @goldenhippo/builder-cart-schemas
```

Update:

```bash
npm install @goldenhippo/builder-cart-schemas@latest
```

Review the [CHANGELOG](../packages/builder-cart-schemas/CHANGELOG.md) before updating to understand what changed.

## TypeScript Configuration

The packages ship with full TypeScript declarations. No additional configuration is needed. Minimum TypeScript version: 5.0.

If you use the `BuilderResponseBaseData` type from `@goldenhippo/builder-types`, you may also need `@builder.io/sdk` installed for the underlying Builder.io types it references. These are listed as optional peer dependencies.
