---
'@goldenhippo/builder-cart-plugin': minor
'@goldenhippo/builder-ui': minor
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-funnel-schemas': minor
'@goldenhippo/builder-shared-schemas': minor
'@goldenhippo/builder-types': minor
---

### builder-cart-plugin

Complete rebuild of the cart plugin application with a new glassmorphic design system and two full-featured tabs:

**Hippo Config tab — Brand Configuration Management:**
- 8-tab form UI covering the entire `gh-brand-config` model schema (General, Header, Footer, Features, Support, Pages, Cookies, SEO)
- Header sub-configs (BASIC, MEDIUM, MEGA, DMP) with full list management for links, CTAs, menus, and nested dropdown content
- Pages sub-sections with all fields including subscription cancel reasons list with nested buttons
- Tiptap-based rich text editor (HtmlEditor) for all 27 HTML fields across header, pages, and cookie sections
- TagInput (Enter-to-add) for CSS class and SEO topic fields
- ImagePicker wired to Builder.io media library via GraphQL Admin API with search, thumbnail grid, and selection
- Reference pickers for banners (site-banner model) and product grid filter groups using `@builder.io/core:Reference` format
- Save via Builder.io Write API with private API key (new `privateApiKey` plugin setting)
- MobX observable store with `useLocalStore`, all section components wrapped in `observer`

**Hippo Admin tab — Admin Dashboard:**
- Space Info: org name, user email, brand, API key (masked), private key status
- API Connection Status: test Builder.io CDN, Hippo Commerce API (`/config` with Basic auth + X-Brand), Builder.io Write API (GraphQL Admin)
- Plugin Settings Overview: read-only display of all settings with quick Open Settings button
- Model Sync: all 13 models in 7 dependency phases, per-model sync with prerequisite checks, sync-all with progress feedback

**Design System:**
- Custom glassmorphic CSS variable theme replacing DaisyUI — dark-first with Golden Hippo gold accent (#C8A951)
- Sticky frosted-glass header with radial gradient background, dark/light theme toggle
- Glass card sections, gold focus rings, custom toggle pills, pill-style tabs
- `hippo-input`, `hippo-toggle`, `hippo-spinner` utility classes defined in builder-ui styles
- Distinct gold SVG icons for Config (gear) and Admin (shield) tabs

**Infrastructure:**
- `BuilderApi` service: paginated content fetch, brand config CRUD, asset listing (GraphQL Admin), model entry fetching
- `plugin-actions.ts`: captured `triggerSettingsDialog` for use from admin page
- `model-sync.ts`: extracted model sync logic with `MODEL_DEFINITIONS`, `syncAllModels`, `syncSingleModel`, `getModelStatuses`
- Removed DaisyUI and `postcss-prefix-selector` from PostCSS config

### builder-ui

- **New design system:** Replaced DaisyUI themes with custom CSS variables scoped to `#hippo-app` with `data-theme="dark"` (default) and `data-theme="light"` variants
- **Restyled components:** Section (glass cards), FormField (updated typography/spacing), EmptyState (dashed border), LoadingSection (custom spinner), PageHeader, StatusBadge (typed status pills)
- **New components:**
  - `HtmlEditor` — Tiptap rich text editor with bold/italic/underline/link toolbar, glassmorphic styling, gold accent active states
  - `TagInput` — Enter-to-add tag management with gold badge display, backspace-to-delete, duplicate prevention
  - `ImagePicker` — Clickable thumbnail tiles with hover overlay (Change/Remove), media library modal with search and thumbnail grid, `fetchAssets` prop for API integration
- **New exports:** `HtmlEditor`, `HtmlEditorProps`, `TagInput`, `TagInputProps`, `ImagePicker` (updated props with `fetchAssets`, `MediaAsset`), `StatusBadge` (new typed interface)
- **Dependencies added:** `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/pm`

### builder-cart-schemas

- Export all brand config enums: `HeaderType`, `FooterType`, `BasicHeaderCTAType`, `MediumHeaderDropdownType`, `MediumHeaderDesktopContentType`, `ProductGridFilterType`, `ProductLinkPrefix`, `SubscriptionCancelReasons`, `SubscriptionCancelButtonType`
- Re-export enums from `brand-config/sections` through `brand-config/index.ts`, `data/index.ts`, and the package root `index.ts`

### builder-funnel-schemas

- Removed DaisyUI and `postcss-prefix-selector` from PostCSS config (compile-only change, no functional impact — funnel plugin rebuild is a separate project)
- Version bumped as part of linked group

### builder-shared-schemas

- No direct changes — version bumped as part of the linked group

### builder-types

- No direct changes — version bumped as part of the linked group
