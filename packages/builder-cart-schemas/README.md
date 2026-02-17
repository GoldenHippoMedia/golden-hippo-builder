# @goldenhippo/builder-cart-schemas

Shared TypeScript types and Builder.io model definitions for Golden Hippo's cart/commerce Builder.io integration. This package provides factory functions for creating Builder.io content models and corresponding TypeScript content types for consuming model data.

## Installation

```bash
npm install @goldenhippo/builder-cart-schemas
```

## Exports

The package provides multiple entry points for granular imports:

| Entry Point                                 | Description                                        |
| ------------------------------------------- | -------------------------------------------------- |
| `@goldenhippo/builder-cart-schemas`         | All model creators and content types               |
| `@goldenhippo/builder-cart-schemas/data`    | Data model creators and content types              |
| `@goldenhippo/builder-cart-schemas/page`    | Page model creator and content types               |
| `@goldenhippo/builder-cart-schemas/section` | Section/component model creators and content types |

Core types (`ModelShape`, `BuilderIOFieldTypes`, etc.) are available from `@goldenhippo/builder-types`.

## Models

### Data Models

| Model                     | Creator                                                    | Content Type                           |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| Product                   | `createProductModel(props)`                                | `BuilderProductContent`                |
| Product Category          | `createCategoryModel()`                                    | `BuilderProductCategoryContent`        |
| Product Tag               | `createProductTagModel()`                                  | `BuilderProductTagContent`             |
| Product Ingredient        | `createIngredientsModel()`                                 | `BuilderIngredientContent`             |
| Product Use Case          | `createProductUseCaseModel()`                              | `BuilderProductUseCaseContent`         |
| Product Grid Filter Group | `createProductGridConfigModel(models)`                     | `BuilderProductGridFilterGroupContent` |
| Blog Category             | `createBlogCategoryModel()`                                | `BuilderBlogCategoryContent`           |
| Blog Comment              | `createBlogCommentModel(pageModelId)`                      | `BuilderBlogCommentContent`            |
| Brand Config              | `createBrandConfigModel(gridFilterModelId, bannerModelId)` | `BuilderBrandConfigContent`            |

### Page Models

| Model | Creator                  | Content Type                                                                                                   |
| ----- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Page  | `createPageModel(props)` | `BuilderPageContent` (union of `BuilderPdpPageContent`, `BuilderBlogPageContent`, `BuilderGeneralPageContent`) |

### Section Models

| Model                   | Creator                                     | Content Type                          |
| ----------------------- | ------------------------------------------- | ------------------------------------- |
| Site Banner             | `createSiteBannerModel(editUrl)`            | `BuilderSiteBannerModelContent`       |
| Default Website Section | `createDefaultWebsiteSectionModel(editUrl)` | `BuilderDefaultWebsiteSectionContent` |

## Usage

### Creating model definitions

Model creators return a `ModelShape` object suitable for registration with Builder.io's API. Some models require IDs of other models they reference.

```typescript
import { createCategoryModel, createProductModel, createPageModel } from '@goldenhippo/builder-cart-schemas';

// Simple model (no dependencies)
const categoryModel = createCategoryModel();

// Model with dependencies (requires other model IDs)
const productModel = createProductModel({
  ingredientsModelId: '<builder-model-id>',
  categoryModelId: '<builder-model-id>',
  tagModelId: '<builder-model-id>',
  useCaseModelId: '<builder-model-id>',
});

// Page model (references multiple models)
const pageModel = createPageModel({
  productModelId: '<builder-model-id>',
  productGroupModelId: '<builder-model-id>',
  categoryModelId: '<builder-model-id>',
  bannerModelId: '<builder-model-id>',
  blogCategoryModelId: '<builder-model-id>',
  editUrl: 'https://your-dev-site.com',
});
```

### Using content types

Content types extend `BuilderContent` from `@builder.io/sdk` and represent the shape of data returned from Builder.io's Content API.

```typescript
import type { BuilderProductContent, BuilderPageContent } from '@goldenhippo/builder-cart-schemas';

// Type-safe access to product content
function getProductName(product: BuilderProductContent): string {
  return product?.data?.displayName ?? product?.data?.name ?? '';
}

// Page content is a union type based on page type
function handlePage(page: BuilderPageContent) {
  if (page?.data?.pageType === 'Product') {
    // TypeScript narrows to BuilderPdpPageContent
  }
}
```

### Using core types

```typescript
import type { ModelShape, BuilderIOFieldTypes } from '@goldenhippo/builder-types';
```

## Model Dependencies

Models that reference other models require their Builder.io model IDs at creation time:

```
createProductModel          → ingredients, category, tag, useCase
createProductGridConfigModel → category, useCase, ingredient, tag
createBlogCommentModel      → page
createBrandConfigModel      → gridFilter, banner
createPageModel             → product, productGroup, category, banner, blogCategory
createSiteBannerModel       → editUrl
createDefaultWebsiteSectionModel → editUrl
```

## Development

```bash
npm run build        # Build with tsup (CJS + ESM + declarations)
npm run dev          # Watch mode
npm run typecheck    # Type-check with tsc
npm run test         # Run tests with vitest
npm run lint         # Lint with eslint
```

## Build Output

Built with [tsup](https://tsup.egoist.dev/) producing:

- **CJS** (`.cjs`) — CommonJS for Node.js / legacy bundlers
- **ESM** (`.js`) — ES modules for modern bundlers
- **Declarations** (`.d.ts`, `.d.cts`) — TypeScript type definitions
- **Source maps** (`.map`) — for debugging
