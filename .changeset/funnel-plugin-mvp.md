---
'@goldenhippo/builder-shared-schemas': minor
'@goldenhippo/builder-funnel-schemas': minor
'@goldenhippo/builder-cart-schemas': minor
---

Add funnel plugin MVP with full model management

- **builder-shared-schemas** (new): Extract shared product models (product, category, tag, ingredient, use-case) into dedicated package for reuse across cart and funnel scopes
- **builder-funnel-schemas**: Add funnel data models (funnel-offer, funnel, funnel-destination, funnel-split-test), funnel-page model, subscription frequency utilities, and consumer utility functions (resolveDestinationConfig, getFunnelIdFromPage)
- **builder-cart-schemas**: Migrate shared product models to builder-shared-schemas; re-export for backward compatibility
