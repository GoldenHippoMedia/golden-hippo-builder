# @goldenhippo/builder-funnel-plugin

## 0.2.0

### Minor Changes

- [`5dc4aa7`](https://github.com/GoldenHippoMedia/golden-hippo-builder/commit/5dc4aa74d29cf19875ff1aaa1e66beccf7155f6d) - Bump plugin versions to align with schema package updates (0.8.0). — [@steven-t-h](https://github.com/steven-t-h)

  builder-cart-plugin:
  - Move default-website-section creation earlier in model provisioning (Phase 3) so product group and page models can reference it
  - Wire `sectionModelId` through to productGroupModel and pageModel

  builder-funnel-plugin:
  - Depends on updated funnel-schemas
