---
'@goldenhippo/builder-shared-schemas': patch
---

Add product detail page content fields to the product model:

- `featuredIngredients` — an optional object with a `featuredIngredientsHeading` (text) and a `featuredIngredient` list, where each item has a `featuredIngredientImage` (file), `featuredIngredientTitle` (text), and `featuredIngredientDescription` (HTML). All inner fields are localized. Used to showcase hero ingredients on the PDP.
- `whatsInside` — an optional object containing a `whatsInsideItems` list, where each item has a `title` (text) and `description` (HTML). Both inner fields are localized. Used to render "What's Inside" accordion items on the PDP.
- `faqs` — an optional object containing a `faqItem` list, where each item has a `faqTitle` (text) and `faqDescription` (HTML). Both inner fields are localized. Used to render an FAQ accordion on the PDP.
