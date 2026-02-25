# @goldenhippo/builder-funnel-schemas

## 0.5.0

### Minor Changes

- [#7](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/7) [`c6dcd3e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c6dcd3e5552d4a7c25d9682f8fcd003291f7fd05) Thanks [@steven-t-h](https://github.com/steven-t-h)! - Add funnel plugin MVP with full model management
  - **builder-shared-schemas** (new): Extract shared product models (product, category, tag, ingredient, use-case) into dedicated package for reuse across cart and funnel scopes
  - **builder-funnel-schemas**: Add funnel data models (funnel-offer, funnel, funnel-destination, funnel-split-test), funnel-page model, subscription frequency utilities, and consumer utility functions (resolveDestinationConfig, getFunnelIdFromPage)
  - **builder-cart-schemas**: Migrate shared product models to builder-shared-schemas; re-export for backward compatibility

### Patch Changes

- Updated dependencies [[`c6dcd3e`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/c6dcd3e5552d4a7c25d9682f8fcd003291f7fd05)]:
  - @goldenhippo/builder-shared-schemas@0.5.0

## 0.4.0

### Minor Changes

- [#5](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/5) [`01c6750`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/01c6750377a95bf63e91b52f825198b1e4be1645) Thanks [@steven-t-h](https://github.com/steven-t-h)! - fix: add "type": "module" to package.json to align tsup output filenames with exports map

### Patch Changes

- Updated dependencies [[`01c6750`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/01c6750377a95bf63e91b52f825198b1e4be1645)]:
  - @goldenhippo/builder-types@0.4.0

## 0.2.0

### Minor Changes

- [#1](https://github.com/GoldenHippoMedia/golden-hippo-builder/pull/1) [`39adda2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/39adda296dc6ea54273176797b66e001787deda8) Thanks [@steven-t-h](https://github.com/steven-t-h)! - update README files for better navigation

### Patch Changes

- Updated dependencies [[`39adda2`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/39adda296dc6ea54273176797b66e001787deda8)]:
  - @goldenhippo/builder-types@0.2.0
