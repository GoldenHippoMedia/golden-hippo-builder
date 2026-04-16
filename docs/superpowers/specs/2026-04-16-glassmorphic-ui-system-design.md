# Glassmorphic UI System — Design Spec

## Purpose

Replace DaisyUI with a custom Tailwind-only design system using CSS custom properties and glassmorphism. Dark-first, with Golden Hippo gold (`#C8A951`) as the accent. Applies to builder-ui shared components and the cart plugin. The funnel plugin compiles but won't be restyled (it's being rebuilt).

## Theme System

CSS custom properties defined in `builder-ui/src/styles/styles.css`, scoped to `#hippo-app`, toggled via `data-theme="dark"` (default) / `data-theme="light"`.

### Dark theme (default)

```
--bg-primary: #0a0e1a
--bg-secondary: #111827
--bg-glass: rgba(255, 255, 255, 0.03)
--bg-glass-hover: rgba(255, 255, 255, 0.06)
--border-glass: rgba(255, 255, 255, 0.06)
--border-glass-focus: rgba(200, 169, 81, 0.3)
--text-primary: rgba(255, 255, 255, 0.92)
--text-secondary: rgba(255, 255, 255, 0.55)
--text-muted: rgba(255, 255, 255, 0.30)
--accent: #C8A951
--accent-glow: rgba(200, 169, 81, 0.15)
--accent-subtle: rgba(200, 169, 81, 0.08)
--input-bg: rgba(255, 255, 255, 0.04)
--input-border: rgba(255, 255, 255, 0.08)
--input-focus-border: rgba(200, 169, 81, 0.4)
--input-focus-glow: rgba(200, 169, 81, 0.08)
--toggle-bg: rgba(255, 255, 255, 0.1)
--toggle-active: #C8A951
--success: #34d399
--error: #f87171
--warning: #fbbf24
```

### Light theme

```
--bg-primary: #f8f9fc
--bg-secondary: #ffffff
--bg-glass: rgba(0, 0, 0, 0.02)
--bg-glass-hover: rgba(0, 0, 0, 0.04)
--border-glass: rgba(0, 0, 0, 0.06)
--border-glass-focus: rgba(184, 153, 61, 0.3)
--text-primary: rgba(0, 0, 0, 0.87)
--text-secondary: rgba(0, 0, 0, 0.55)
--text-muted: rgba(0, 0, 0, 0.30)
--accent: #B8993D
--accent-glow: rgba(184, 153, 61, 0.15)
--accent-subtle: rgba(184, 153, 61, 0.08)
--input-bg: rgba(0, 0, 0, 0.03)
--input-border: rgba(0, 0, 0, 0.08)
--input-focus-border: rgba(184, 153, 61, 0.4)
--input-focus-glow: rgba(184, 153, 61, 0.08)
--toggle-bg: rgba(0, 0, 0, 0.12)
--toggle-active: #B8993D
--success: #059669
--error: #dc2626
--warning: #d97706
```

### Radius and sizing tokens

```
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
```

## Removals

- DaisyUI plugin from both `postcss.config.mjs` files
- All `@plugin "daisyui"` and `@plugin "daisyui/theme"` blocks from styles
- `@custom-variant dark` line
- `postcss-prefix-selector` from both postcss configs and its import
- All DaisyUI class names throughout components (`btn`, `toggle`, `select`, `input`, `textarea`, `tabs`, `tab`, `collapse`, `badge`, `card`, `divider`, `loading-*`, `alert`, etc.)

## Component Restyling

All components keep existing props/interfaces. Styling only changes.

### Section

Glass card: `bg-[var(--bg-glass)] border border-[var(--border-glass)] rounded-2xl p-7 backdrop-blur-sm`. Title in `text-[var(--text-primary)]`, subtitle in `text-[var(--text-muted)]`.

### FormField

Label: `text-xs font-semibold text-[var(--text-secondary)] tracking-wide`. Required asterisk in `text-[var(--accent)]`. Helper in `text-[var(--text-muted)]`. Error in `text-[var(--error)]`.

### EmptyState

Glass card with dashed border: `border border-dashed border-[var(--border-glass)]`. Action button styled as accent pill.

### LoadingSection

Custom CSS spinner keyframe animation with `border-[var(--accent)]`. No DaisyUI loading classes.

### PageHeader

Title: `text-xl font-bold tracking-tight text-[var(--text-primary)]`.

### StatusBadge

Custom pill: semi-transparent background with colored text. No DaisyUI badge classes.

### New: ImagePicker

Props: `value?: string`, `label: string`, `onChange: (url: string | undefined) => void`, `onPickRequest: () => void`.

**Filled state:** Square thumbnail (`aspect-square`) showing the image with `object-contain`. On hover, dark overlay with "Change" and "Remove" buttons.

**Empty state:** Dashed border square with gold `+` icon and "Select Image" text. Clicking calls `onPickRequest`.

Label rendered below the picker tile.

## AppShell

- Background: radial gradient overlay on `var(--bg-primary)` for depth
- Header: sticky, `backdrop-blur-xl`, semi-transparent bg, bottom border
- Brand title in `var(--accent)`, subtitle in `var(--text-muted)` uppercase
- Theme toggle: glass button with sun/moon icon

## Brand Config Page

### Tabs

Pill-style tabs inside a glass container: `bg-[var(--bg-glass)] border border-[var(--border-glass)] rounded-xl p-1`. Active tab: `bg-[var(--accent-subtle)] text-[var(--accent)]`.

### Save button

Solid accent: `bg-[var(--accent)] text-[#1a1a2e] font-semibold`. Hover: brightness boost + glow shadow. Disabled: `opacity-40`.

### Input fields

`bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg`. Focus: `border-[var(--input-focus-border)] shadow-[0_0_0_3px_var(--input-focus-glow)]`.

### Select fields

Same as input with custom chevron SVG via `background-image`.

### Textarea

Same as input, `resize-y`.

### Toggle rows

Horizontal layout: label+helper on left, custom toggle pill on right. Toggle: `w-10 h-[22px] rounded-full` with sliding dot. Active state uses `var(--toggle-active)`.

### Section dividers

Labeled line: `flex items-center gap-3` with `::before`/`::after` flex-1 lines. Text in uppercase `text-[var(--text-muted)]`.

### Accordion (Pages section)

Bordered panels with clickable full-width header. Chevron rotates on open. Body conditionally rendered via React state. No DaisyUI collapse.

### Color fields

`<input type="color">` swatch (36x36, rounded) paired with text input for hex value.

### Image fields (General section)

Uses the new `ImagePicker` component in a responsive grid. Clicking opens a placeholder modal (to be wired to Builder's media library later).

### Placeholder sections

Dashed border card: `border border-dashed border-[var(--border-glass)]` with centered muted text.

## Files Changed

### builder-ui

- Modify: `src/styles/styles.css`
- Modify: `src/components/section.tsx`
- Modify: `src/components/form-field.tsx`
- Modify: `src/components/empty-state.tsx`
- Modify: `src/components/loading-section.tsx`
- Modify: `src/components/page-header.tsx`
- Modify: `src/components/status-badge.tsx`
- Create: `src/components/image-picker.tsx`
- Modify: `src/index.ts`

### builder-cart-plugin

- Modify: `postcss.config.mjs`
- Modify: `src/application/styles.css`
- Modify: `src/application/components/AppShell.tsx`
- Modify: `src/application/HippoCMSAdmin.tsx`
- Modify: `src/application/brand-config/brand-config.page.tsx`
- Modify: `src/application/brand-config/sections/general.section.tsx`
- Modify: `src/application/brand-config/sections/header.section.tsx`
- Modify: `src/application/brand-config/sections/footer.section.tsx`
- Modify: `src/application/brand-config/sections/features.section.tsx`
- Modify: `src/application/brand-config/sections/support.section.tsx`
- Modify: `src/application/brand-config/sections/pages.section.tsx`
- Modify: `src/application/brand-config/sections/cookie.section.tsx`
- Modify: `src/application/brand-config/sections/seo.section.tsx`

### builder-funnel-plugin (compile-only)

- Modify: `postcss.config.mjs`
- Modify: `src/styles.css`
