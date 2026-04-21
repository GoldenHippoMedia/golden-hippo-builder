---
'@goldenhippo/builder-shared-schemas': patch
'@goldenhippo/builder-funnel-plugin': patch
---

- adds a new field `globalFiveStarReviews` to the product schema in `@goldenhippo/builder-shared-schemas`. This field is intended to store the total count of five-star reviews for a brand, aggregated across all platforms.
- updates the funnel plugin to allow setting the brand properly
