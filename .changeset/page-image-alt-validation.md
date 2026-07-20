---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-types': minor
---

Add an image `altText` validation hook to the cart `page` model. On save, Builder.io warns when any Image block (including nested blocks) is missing accessible alt text. Adds an optional `hooks` property to `ModelShape` to support model-level Builder.io hooks.
