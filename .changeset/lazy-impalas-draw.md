---
'@goldenhippo/builder-shared-schemas': minor
'@goldenhippo/builder-funnel-plugin': minor
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': minor
'@goldenhippo/builder-types': minor
'@goldenhippo/builder-ui': minor
---

### @goldenhippo/builder-cart-plugin

Complete rebuild of the cart plugin with a custom glassmorphic design system and two full-featured tabs.

**Hippo Config tab — Brand Configuration Management:**

- 8-tab form UI covering the entire `gh-brand-config` model schema (General, Header, Footer, Features, Support, Pages, Cookies, SEO)
- Header sub-configs (BASIC, MEDIUM, MEGA, DMP) with full list management for links, CTAs, menus, and nested dropdown content
- Pages sub-sections with all fields including subscription cancel reasons list with nested buttons
- Tiptap-based rich text editor (HtmlEditor) for all 27 HTML fields across header, pages, and cookie sections
- TagInput (Enter-to-add) for CSS class and SEO topic fields
- ImagePicker wired to Builder.io media library via GraphQL Admin API with search, thumbnail grid, and selection
- Reference pickers for banners (site-banner model) and product grid filter groups using `@builder.io/core:Reference` format
- Save via Builder.io Write API with private API key (new `privateApiKey` plugin setting)
- MobX observable store with `useLocalStore`, all section components wrapped in `observer` for proper reactivity

**Hippo Admin tab — Admin Dashboard:**

- Space Info: org name, user email, brand, API key (masked), private key status
- API Connection Status: test Builder.io CDN, Hippo Commerce API (`/config` with Basic auth + X-Brand), Builder.io Write API (GraphQL Admin)
- Plugin Settings Overview: read-only display of all settings with quick Open Settings button
- Model Sync: all 13 models in 7 dependency phases, per-model sync with prerequisite checks, sync-all with progress feedback
- Extracted model sync logic to shared `model-sync.ts` module with `MODEL_DEFINITIONS`, `syncAllModels`, `syncSingleModel`, `getModelStatuses`

**Design System & Infrastructure:**

- Custom glassmorphic CSS variable theme replacing DaisyUI — dark-first with Golden Hippo gold accent (#C8A951)
- Sticky frosted-glass header with radial gradient background, dark/light theme toggle
- Glass card sections, gold focus rings, custom toggle pills, pill-style tabs
- `hippo-input`, `hippo-toggle`, `hippo-spinner` utility classes
- Distinct gold SVG icons for Config (gear) and Admin (shield) tabs
- `BuilderApi` service: paginated content fetch, brand config CRUD, asset listing (GraphQL Admin), model entry fetching
- `plugin-actions.ts`: captured `triggerSettingsDialog` for use across components
- Removed DaisyUI and `postcss-prefix-selector` from PostCSS config

### @goldenhippo/builder-ui

**New design system replacing DaisyUI:**

- Custom CSS variables scoped to `#hippo-app` with `data-theme="dark"` (default) and `data-theme="light"` variants
- Dark theme: `#0a0e1a` base, `rgba(255,255,255,0.05)` glass, `#C8A951` gold accent
- Light theme: `#f8f9fc` base, `rgba(0,0,0,0.02)` glass, `#B8993D` gold accent
- Custom `hippo-input` (text/textarea/select), `hippo-toggle` (pill switch), `hippo-spinner` (loading) CSS classes
- Base font, antialiasing, and color-scheme scoped to `#hippo-app`

**Restyled existing components:**

- `Section` — glassmorphic card with `backdrop-blur-sm`, increased padding (`p-8`)
- `FormField` — updated label typography (`text-xs font-semibold tracking-wide`), increased label-to-input spacing (`space-y-2.5`)
- `EmptyState` — dashed border glass card with accent action button
- `LoadingSection` — custom CSS spinner replacing DaisyUI loading classes, simplified props to `message` and `size`
- `PageHeader` — updated to `text-xl font-bold tracking-tight`
- `StatusBadge` — new typed interface (`status: 'success' | 'warning' | 'error' | 'info' | 'neutral'`, `label: string`) with CSS variable-based color mapping

**New components:**

- `HtmlEditor` — Tiptap-based rich text editor with bold/italic/underline/link toolbar, glassmorphic styling with gold accent active states, inline link styling for visibility, `value`/`onChange` controlled interface
- `TagInput` — Enter-to-add tag management with gold-accented badge display, click-to-remove (X button), backspace-to-delete-last, duplicate prevention, `value: string[]`/`onChange` interface
- `ImagePicker` — Fixed-size thumbnail tiles (w-40 h-32) with hover overlay (Change/Remove buttons), empty state with dashed border and gold plus icon, media library modal with search filter/thumbnail grid/selection highlight/loading/error states, `fetchAssets` prop for API integration, `MediaAsset` type export

**New dependencies:** `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/pm`

### @goldenhippo/builder-cart-schemas

- Export all brand config enums from `brand-config/sections` through the barrel chain (`brand-config/index.ts` → `data/index.ts` → package root `index.ts`):
  - `HeaderType` (BASIC, MEDIUM, MEGA, LINKLESS, NONE, DMP)
  - `FooterType` (BASIC, MEGA, NONE)
  - `BasicHeaderCTAType` (primary, secondary, outline, link)
  - `MediumHeaderDropdownType` (search, links, accountLinks, html, timedHtml)
  - `MediumHeaderDesktopContentType` (links, logo, accountLinks, cartCount, html)
  - `ProductGridFilterType` (Dropdown, Stacked List)
  - `ProductLinkPrefix` (/p, /product)
  - `SubscriptionCancelReasons` (DoNotLike, NotWorking, NoBenefits, etc.)
  - `SubscriptionCancelButtonType` (link, update, keep, continue, cancel)

### @goldenhippo/builder-funnel-plugin

- Removed DaisyUI plugin and `postcss-prefix-selector` from PostCSS config to match the new design system approach (compile-only change — funnel plugin UI rebuild is a separate project)

### @goldenhippo/builder-shared-schemas

- No direct changes — version bumped as part of the linked schema versioning group to stay in sync with builder-cart-schemas

### @goldenhippo/builder-types

- No direct changes — version bumped as part of the linked schema versioning group to stay in sync with builder-cart-schemas
