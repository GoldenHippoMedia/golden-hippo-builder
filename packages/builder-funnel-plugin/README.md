# @goldenhippo/builder-funnel-plugin

React 18 plugin for funnel websites inside Builder.io. Early stage with placeholder UI — funnel features will be implemented as the product scope expands.

## Table of Contents

- [Installation in Builder.io](#installation-in-builderio)
  - [Development](#development)
  - [Production (CDN)](#production-cdn)
- [Plugin Settings](#plugin-settings)
- [Current Status](#current-status)
- [Development Commands](#development-commands)

## Installation in Builder.io

### Development

1. Start the dev server:
   ```bash
   npm run dev:funnel-plugin    # http://localhost:1269
   ```
2. In Builder.io: **Settings > Plugins > Add Plugin**
3. Enter URL: `http://localhost:1269/plugin.system.js`

### Production (CDN)

After publishing, use the jsdelivr CDN URL:

```
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-funnel-plugin@<version>/dist/plugin.system.js
```

## Plugin Settings

| Setting  | Description                         |
| -------- | ----------------------------------- |
| Edit URL | Frontend site URL for page previews |

## Current Status

This plugin is scaffolded with placeholder UI displaying "Coming Soon" cards for:

- Funnel pages management
- Funnel configuration

The plugin registers an app tab ("Hippo Funnels") in Builder.io. Full funnel management features will be added as the product scope expands. See `@goldenhippo/builder-cart-plugin` for reference on the plugin architecture pattern.

## Development Commands

```bash
npm run dev:funnel-plugin   # Start dev server on port 1269
npm run build:funnel-plugin # Production build
npm run typecheck           # Type-check with tsc
npm run lint                # Lint with eslint
```
