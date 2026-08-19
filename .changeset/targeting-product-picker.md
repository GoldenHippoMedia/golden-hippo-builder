---
'@goldenhippo/builder-cart-plugin': patch
---

Replace the targeting-condition product `<select>` with a searchable combobox. A brand's catalog can run
to hundreds of products, which a native dropdown handles badly: it also filters by Production ID, marks
products already used elsewhere in the same condition as unselectable, and supports arrow-key/Enter
navigation. Because the cart matches a condition on the product's `gh.productionId`, that id is shown
next to each option and a product missing one is flagged inline as unmatchable.

Product and product-group fetches raise their page budget to 500. The previous 100-entry default
truncated a large catalog silently — a product would simply be absent from the picker with nothing
to indicate the list was partial.

Also fixes invisible `<select>` options in the Hippo panels: `.hippo-input` paints a translucent
background that the native option popup can't composite, so options rendered near-white text on the
platform's white popup. Options now get an opaque `--bg-secondary` background in both themes.
