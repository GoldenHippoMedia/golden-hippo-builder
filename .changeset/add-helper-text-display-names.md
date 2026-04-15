---
'@goldenhippo/builder-shared-schemas': minor
'@goldenhippo/builder-cart-schemas': minor
---

Sync Builder.io model definitions with production and improve field usability.

Model sync (production parity):

- Product: add `components` list field for Bundle type products (slug, displayName, description)
- Product Group: change `shortDescription` to html, add `informationCallout` reference, accept `sectionModelId`
- Brand Config: add `LINKLESS` header type, `subscriptionExperience`/`useDefaultFrequencies` features, `seo` object
- Page: add `Multi-Group` PDP type with pdpTitle, pdpDescription, multiProductGroup; add `Bundle Group` offer selector type, `Slider Zoom` slider, `quantitySelector` label, `desktopSliderOverride` reference

helperText & displayName improvements:

- Add missing helperText to ~50 fields across all models for non-developer usability
- Replace empty helperText values with meaningful guidance
- Fix display name casing (Youtube → YouTube, Tiktok → TikTok, Twitter → Twitter / X)
- Rename jargon-heavy labels (OOS → Out of Stock, Type → Product Page Type / Footer Type)
- Add friendlyName to unlabeled fields (Bundle Components, Product Groups, Offer Options, etc.)
