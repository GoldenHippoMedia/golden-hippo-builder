# Brand Config Management Page — Design Spec

## Purpose

Replace the clunky Builder.io native content editor for `gh-brand-config` with a custom tabbed form UI inside the cart plugin's "Hippo Config" tab. The model has one entry per brand. The page fetches or creates that entry, presents its fields organized by section tabs, and saves all changes in a single action.

## Data Flow

### Service: `src/services/builder-api.ts`

New `BuilderApi` class (mirrors the funnel plugin pattern):

- `fetchContent<T>(request)` — paginated fetch from `https://cdn.builder.io/api/v3/content/{model}` using `context.user.authHeaders` and `context.user.apiKey`. Includes `includeUnpublished=true` and `omit=data.blocks`.
- `getBrandConfig()` — calls `fetchContent<BuilderBrandConfigContent>({ modelName: 'gh-brand-config', limit: 1 })`.
- `createContent(modelName, entryName, data)` — delegates to `context.createContent(modelName, { name, published: 'draft', data })`.

### Save mechanism

Uses `context.content.update(contentEntry)` — the authenticated Builder.io session, no private API key required.

### Load sequence

1. Fetch `gh-brand-config` entries (limit 1).
2. Zero entries: show EmptyState with "Create Brand Configuration" button.
3. One entry: load `entry.data` into MobX observable store, enter edit mode.
4. Multiple entries: use the first (defensive, shouldn't happen).

### Save sequence

1. User clicks "Save" (enabled when `dirty === true`).
2. Merge working `data` back into the content entry object.
3. Call `context.content.update(entry)`.
4. Success: reset `dirty`, show confirmation via `context.dialogs.alert()`.
5. Error: show error message, keep `dirty = true` for retry.

## State Management

MobX observable store via `useLocalStore` in the page component:

```ts
{
  config: BuilderBrandConfigContent | null,  // raw Builder.io entry
  data: Record<string, any>,                 // mutable working copy of config.data
  loading: boolean,
  saving: boolean,
  error: string | null,
  dirty: boolean,                            // true on any field change, reset on save
  activeTab: string,                         // current section tab
}
```

Dirty tracking: flipped `true` in the `onChange` handler, reset to `false` on successful save. No deep comparison needed.

## Component Structure

### File organization

All under `src/application/brand-config/`:

```
brand-config.page.tsx              — main page: store, fetch, tab bar, save button
sections/general.section.tsx       — brand name, images, links, banners
sections/header.section.tsx        — headerType select + conditional configs
sections/footer.section.tsx        — footerType select
sections/features.section.tsx      — toggles, selects, filter config
sections/support.section.tsx       — email, phone, address
sections/pages.section.tsx         — accordion for cart/checkout/account/etc
sections/cookie.section.tsx        — popup banner config
sections/seo.section.tsx           — description, tags
```

### Component tree

```
HippoCMSBrandConfiguration
  AppShell (header + theme toggle)
    BrandConfigPage
      LoadingSection              (while fetching)
      EmptyState + Create button  (if no entry)
      BrandConfigEditor           (when entry exists)
        Tab bar: General | Header | Footer | Features | Support | Pages | Cookies | SEO
        Save button (top-right, enabled when dirty)
        Active section component
```

### Section components

Each receives:

- The relevant slice of `data` (e.g., `data.header`, `data.support`)
- An `onChange(path: string, value: any)` callback that sets the nested field and flips `dirty`

### Pages section

Uses DaisyUI collapse/accordion within the tab for sub-sections: Account Details, Cart, Checkout, Order Details, Reset Password, Subscription Cancel, Subscription Edit, Upsell.

## Shared UI Components (builder-ui)

Use existing components from `@goldenhippo/builder-ui` wherever possible to maintain parity with the funnel plugin:

**Already available:**

- `FormField` — label + helper text + error wrapper (wraps any input child)
- `EmptyState` — message + optional action button (used for "no config found" state)
- `LoadingSection` — spinner with message (used during data fetch)
- `Section` — titled card with optional actions (used to group fields within tabs)
- `PageHeader` — title + subtitle + actions slot (used for page title + save button)

**To add to builder-ui if needed during implementation:**

- `TagInput` — comma-separated tag entry with badge display (if the pattern is needed by both plugins)
- `CollapsibleSection` — if the DaisyUI collapse pattern needs a reusable wrapper beyond what `Section` provides

All new shared components go in `packages/builder-ui/src/components/` and are exported from the package index.

## Form Field Rendering

### FormField usage

The existing `FormField` from builder-ui handles label, helper text, required indicator, and error display. Each section component wraps its inputs with `FormField` and passes the appropriate DaisyUI input component as children.

### Field type mapping

| Schema type     | UI control       | DaisyUI class                                       |
| --------------- | ---------------- | --------------------------------------------------- |
| `text`          | Text input       | `input input-bordered`                              |
| `url`           | Text input       | `input input-bordered`                              |
| `longText`      | Textarea         | `textarea textarea-bordered`                        |
| `number`        | Number input     | `input input-bordered` type=number                  |
| `boolean`       | Toggle           | `toggle toggle-primary`                             |
| `select` / enum | Dropdown         | `select select-bordered`                            |
| `color`         | Color picker     | Native `<input type="color">` + hex text            |
| `file`          | Image URL        | Thumbnail preview + text input for URL              |
| `html`          | Textarea         | `textarea textarea-bordered` (raw HTML)             |
| `Tags`          | Tag input        | Comma-separated input, displayed as badges          |
| `list`          | Repeatable group | Card per item, add/remove buttons                   |
| `object`        | Grouped fields   | DaisyUI `collapse` (collapsible section)            |
| `reference`     | Placeholder      | Disabled badge: "Reference — managed in Builder.io" |

### showIf handling

Header section only. Conditional rendering based on `headerType` value:

- `headerType === 'BASIC'` → show `basicHeaderConfig`
- `headerType === 'MEDIUM'` → show `mediumHeaderConfig`
- `headerType === 'MEGA'` → show `megaMenuConfig`
- `headerType === 'DMP'` → show `dmpHeaderConfig`

Implemented as React conditionals, not a generic evaluator.

### Enums

Imported directly from `@goldenhippo/builder-cart-schemas`:

- `HeaderType`, `FooterType`, `ProductGridFilterType`, `ProductLinkPrefix`
- `BasicHeaderCTAType`, `MediumHeaderDropdownType`, `MediumHeaderDesktopContentType`
- `SubscriptionCancelReasons`, `SubscriptionCancelButtonType`

## Reference fields (placeholder)

Two reference-type fields get placeholder treatment for now:

- `banners[].banner` — reference to `site-banner` model
- `features.productGridFilterGroups[].filterConfig` — reference to `product-grid-filter-group` model

Rendered as a disabled indicator showing the reference type and a note that it's managed through Builder.io's native UI. Will be built out in a follow-up.

## Files changed

All paths relative to `packages/builder-cart-plugin/`.

- **New:** `src/services/builder-api.ts`
- **New:** `src/application/brand-config/brand-config.page.tsx`
- **New:** `src/application/brand-config/sections/general.section.tsx`
- **New:** `src/application/brand-config/sections/header.section.tsx`
- **New:** `src/application/brand-config/sections/footer.section.tsx`
- **New:** `src/application/brand-config/sections/features.section.tsx`
- **New:** `src/application/brand-config/sections/support.section.tsx`
- **New:** `src/application/brand-config/sections/pages.section.tsx`
- **New:** `src/application/brand-config/sections/cookie.section.tsx`
- **New:** `src/application/brand-config/sections/seo.section.tsx`
- **Modified:** `src/application/HippoCMSBrandConfiguration.tsx` — render `BrandConfigPage` instead of placeholder

Shared UI components (`FormField`, `EmptyState`, `LoadingSection`, `Section`, `PageHeader`) imported from `@goldenhippo/builder-ui`. New shared components added to `packages/builder-ui/` if needed.
