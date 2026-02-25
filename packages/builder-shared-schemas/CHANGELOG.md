# @goldenhippo/builder-shared-schemas

## 0.5.0

### Minor Changes

- [#7](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/7) [`c6dcd3e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c6dcd3e5552d4a7c25d9682f8fcd003291f7fd05) Thanks [@steven-t-h](https://github.com/steven-t-h)! - Add funnel plugin MVP with full model management
  - **builder-shared-schemas** (new): Extract shared product models (product, category, tag, ingredient, use-case) into dedicated package for reuse across cart and funnel scopes
  - **builder-funnel-schemas**: Add funnel data models (funnel-offer, funnel, funnel-destination, funnel-split-test), funnel-page model, subscription frequency utilities, and consumer utility functions (resolveDestinationConfig, getFunnelIdFromPage)
  - **builder-cart-schemas**: Migrate shared product models to builder-shared-schemas; re-export for backward compatibility
