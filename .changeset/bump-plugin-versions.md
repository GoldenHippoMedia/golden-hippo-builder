---
'@goldenhippo/builder-cart-plugin': minor
'@goldenhippo/builder-funnel-plugin': minor
---

Bump plugin versions to align with schema package updates (0.8.0).

builder-cart-plugin:

- Move default-website-section creation earlier in model provisioning (Phase 3) so product group and page models can reference it
- Wire `sectionModelId` through to productGroupModel and pageModel

builder-funnel-plugin:

- Depends on updated funnel-schemas
