---
'@goldenhippo/builder-cart-schemas': patch
'@goldenhippo/builder-cart-plugin': patch
---

Point the `offer-template` model's `editingUrlLogic` at the cart app's `/builder-offer-template-editor` route (previously the non-existent `/builder-offer-template`). The bare `offerTemplate` query param flips that route into offer-template mode, so Builder edits the template in the offer-page context; the cart app renders a specific saved template when the param carries an id (`?offerTemplate=<id>`), which the plugin's template gallery uses for live previews. Requires the matching `builder-offer-template-editor` route in the consuming cart app.
