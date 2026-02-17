# @goldenhippo/builder-ui

Shared React component library with Tailwind v4 + DaisyUI v5 styling. Used internally by all Builder.io plugins. This package is **private** and not published to npm.

## Table of Contents

- [Components](#components)
- [Styles](#styles)
- [Exports](#exports)
- [Usage](#usage)
- [Development](#development)

## Components

| Component           | Description                              |
| ------------------- | ---------------------------------------- |
| `LoadingSection`    | Full-section loading spinner             |
| `StatGridCard`      | Individual stat card for dashboard grids |
| `StatGridContainer` | Grid container for stat cards            |
| `StarRating`        | Star rating display component            |
| `Slider`            | Image/content slider                     |
| `PageCard`          | Card component for page listings         |
| `PageNotFound`      | 404-style page not found display         |

## Styles

The package provides a raw CSS file with Tailwind v4 + DaisyUI configuration, including custom `ghippo` (dark) and `ghippolight` (light) themes scoped to `#hippo-app`.

## Exports

| Entry Point                      | Description                  |
| -------------------------------- | ---------------------------- |
| `@goldenhippo/builder-ui`        | All React components         |
| `@goldenhippo/builder-ui/styles` | Raw CSS (Tailwind + DaisyUI) |

Consuming plugins import styles and run their own Tailwind build — no CSS processing is done by this package.

## Usage

```typescript
import { LoadingSection, StatGridCard, StarRating } from '@goldenhippo/builder-ui';
```

```css
/* In plugin styles.css */
@import '@goldenhippo/builder-ui/styles';
```

## Development

```bash
npm run build        # Build with tsup (ESM only + declarations)
npm run dev          # Watch mode
npm run typecheck    # Type-check with tsc
npm run lint         # Lint with eslint
```
