# @goldenhippo/builder-cart-schemas

Builder.io model definitions and TypeScript content types for Golden Hippo's cart/commerce integration. Provides factory functions for creating Builder.io content models and strongly-typed interfaces for consuming model data.

## Table of Contents

- [Installation](#installation)
- [Using Content Types](#using-content-types)
  - [Fetching typed content in Angular](#fetching-typed-content-in-angular)
  - [Working with page types](#working-with-page-types)
  - [Using core types](#using-core-types)
- [Exports](#exports)
- [Models](#models)
  - [Data Models](#data-models)
  - [Page Models](#page-models)
  - [Section Models](#section-models)
- [Creating Model Definitions](#creating-model-definitions)
- [Model Dependencies](#model-dependencies)
- [Development](#development)

## Installation

```bash
npm install @goldenhippo/builder-cart-schemas
```

## Using Content Types

Content types represent the shape of data returned from Builder.io's Content API. Use them to get type-safe access to model fields when fetching content.

### Fetching typed content in Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { fetchOneEntry, fetchEntries } from '@builder.io/sdk-angular';
import type { BuilderProductContent, BuilderBlogCategoryContent } from '@goldenhippo/builder-cart-schemas';
import type { BuilderPageContent } from '@goldenhippo/builder-cart-schemas/page';

@Component({ selector: 'app-product', templateUrl: './product.component.html' })
export class ProductComponent implements OnInit {
  product: BuilderProductContent | null = null;

  async ngOnInit() {
    const result = await fetchOneEntry({
      model: 'product',
      apiKey: environment.builderApiKey,
      query: { 'data.gh.slug': 'example-product' },
    });

    this.product = result as BuilderProductContent;
  }

  get displayName(): string {
    return this.product?.data?.displayName ?? '';
  }

  get featuredImage(): string {
    return this.product?.data?.featuredImage ?? '';
  }

  get averageRating(): number {
    return this.product?.data?.reviews?.averageRating ?? 0;
  }
}
```

```typescript
// Fetching multiple entries
const categories = (await fetchEntries({
  model: 'blog-category',
  apiKey: environment.builderApiKey,
})) as BuilderBlogCategoryContent[];

categories.forEach((cat) => {
  console.log(cat?.data?.name, cat?.data?.displayName);
});
```

### Working with page types

Page content uses a discriminated union based on `pageType`. TypeScript narrows the type automatically:

```typescript
import type {
  BuilderPageContent,
  BuilderPdpPageContent,
  BuilderBlogPageContent,
} from '@goldenhippo/builder-cart-schemas/page';

function renderPage(page: BuilderPageContent) {
  const pageType = page?.data?.pageType;

  if (pageType === 'Product') {
    const pdp = page as BuilderPdpPageContent;
    console.log(pdp?.data?.pdp?.product?.name);
    console.log(pdp?.data?.pdp?.offerSelector?.osType);
  }

  if (pageType === 'Blog') {
    const blog = page as BuilderBlogPageContent;
    console.log(blog?.data?.blog?.author);
    console.log(blog?.data?.blog?.publicationDate);
  }
}
```

### Using core types

Core types like `ModelShape` and `BuilderIOFieldTypes` are available from the `@goldenhippo/builder-types` package:

```typescript
import type { ModelShape, BuilderIOFieldTypes } from '@goldenhippo/builder-types';
```

## Exports

The package provides multiple entry points for granular imports:

| Entry Point                                 | Description                                        |
| ------------------------------------------- | -------------------------------------------------- |
| `@goldenhippo/builder-cart-schemas`         | All model creators and content types               |
| `@goldenhippo/builder-cart-schemas/data`    | Data model creators and content types              |
| `@goldenhippo/builder-cart-schemas/page`    | Page model creator and content types               |
| `@goldenhippo/builder-cart-schemas/section` | Section/component model creators and content types |

## Models

### Data Models

| Model                     | Creator                                                    | Content Type                           |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| Product                   | `createProductModel(props)`                                | `BuilderProductContent`                |
| Product Group             | `createProductGroupModel(props)`                           | `BuilderProductGroupContent`           |
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

## Creating Model Definitions

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
