# Admin Page — Design Spec

## Purpose

Build the admin page for the cart plugin with four features: Space Info, API Connection Status, Plugin Settings Overview, and Model Sync. Accessible only to admin users via the "Hippo Admin" tab.

## Layout

Four glassmorphic card sections stacked vertically:

1. **Space Info** — org name, space ID (masked), API key (masked), plugin version, brand, private key status
2. **API Connection Status** — Builder.io CDN, Hippo Commerce API, Builder.io Write API. Each with test button, status indicator, response time
3. **Plugin Settings Overview** — read-only display of current settings with "Open Settings" button
4. **Model Sync** — 13 models in phased table with status, per-model sync, and sync-all

## API Connection Tests

**Builder.io CDN:** GET `https://cdn.builder.io/api/v3/content/gh-brand-config?apiKey={apiKey}&limit=1` with auth headers.

**Hippo Commerce API:** GET `{apiUrl}/config` with `Authorization: Basic {base64(apiUser:apiPassword)}` and `X-Brand: {brand}` headers.

**Builder.io Write API:** GET `https://builder.io/api/v1/write/gh-brand-config?apiKey={apiKey}&limit=0` with `Authorization: Bearer {privateApiKey}`.

Each shows: connected/error status, response time in ms, error message on failure. Run on demand via "Test" buttons only.

## Model Sync

13 models in 7 phases:

| Phase | Model Name | Dependencies |
|---|---|---|
| 1 | product-ingredient | none |
| 1 | product-category | none |
| 1 | product-tag | none |
| 1 | product-use-case | none |
| 2 | product | ingredient, category, tag, useCase |
| 3 | banner | none (needs editUrl) |
| 3 | blog-category | none |
| 3 | default-website-section | none (needs editUrl) |
| 3b | product-group | product, section |
| 4 | page | product, productGroup, category, banner, blogCategory, section |
| 5 | blog-comment | page |
| 6 | product-grid-filter-group | category, useCase, ingredient, tag |
| 7 | gh-brand-config | gridFilterGroup, banner |

**Status detection:** Read `context.models.result` on mount, check which model names exist. Mark "Synced" or "Missing".

**Per-model sync:** Disabled if dependencies missing (tooltip shows which). Enabled models call `setModel()` with correct factory function and dependency IDs.

**Sync All:** Runs full phased sync flow. Shows spinner per model during sync, success/error per model on completion.

## Files

- Create: `src/application/admin/admin.page.tsx` — main admin page component
- Create: `src/application/admin/model-sync.ts` — extracted sync logic shared with plugin.ts
- Modify: `src/application/HippoCMSAdmin.tsx` — render AdminPage
- Modify: `src/plugin.ts` — use shared sync function
- Modify: `src/services/builder-api.ts` — add connection test methods
