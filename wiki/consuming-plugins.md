# Consuming Plugins in Builder.io

This guide is for Builder.io space administrators who need to install the Golden Hippo plugins.

## Plugin URLs

After a version is published to npm, the plugin files are available via CDN:

### Cart Plugin (Hippo Commerce)

```
# Specific version (recommended for production)
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@0.1.0/dist/plugin.system.js

# Latest version (auto-updates — use for staging/dev)
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@latest/dist/plugin.system.js
```

### Funnel Plugin (Hippo Funnels)

```
# Specific version
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-funnel-plugin@0.1.0/dist/plugin.system.js

# Latest version
https://cdn.jsdelivr.net/npm/@goldenhippo/builder-funnel-plugin@latest/dist/plugin.system.js
```

### Alternative CDN (unpkg)

```
https://unpkg.com/@goldenhippo/builder-cart-plugin@0.1.0/dist/plugin.system.js
https://unpkg.com/@goldenhippo/builder-funnel-plugin@0.1.0/dist/plugin.system.js
```

## Installation in Builder.io

### Cart Plugin

1. Log in to your Builder.io space
2. Go to **Settings > Plugins > Add Plugin**
3. Enter the plugin URL (see above)
4. Fill in the required settings:
   - **Brand** — Select your brand (Gundry MD, Dr. Marty, Driven Entrepreneur, or Other)
   - **Development Site URL** — Your development site URL
   - **API URL** — Your Hippo Commerce API URL
   - **API User** — Your API username
   - **API Password** — Your API password
5. Click **Save & Create Models**
6. The plugin will auto-provision all 13 Builder.io models

### Funnel Plugin

1. Log in to your Builder.io space
2. Go to **Settings > Plugins > Add Plugin**
3. Enter the plugin URL (see above)
4. Fill in the required settings:
   - **Development Site URL** — Your development site URL
5. Save

## Updating Plugins

### Option A: Pinned version (recommended for production)

When using a pinned version URL (e.g., `@0.1.0`), the plugin won't change until you manually update the URL:

1. Check for new versions: look at the repo releases or run `npm view @goldenhippo/builder-cart-plugin versions`
2. Review the changelog for breaking changes
3. Update the URL in Builder.io settings to the new version
4. Save settings

### Option B: Latest version (for staging/dev)

When using `@latest`, the CDN will serve the newest version automatically. jsdelivr caches for ~24 hours, so updates propagate within a day.

To force-refresh the CDN cache, purge the jsdelivr cache:

```
https://purge.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@latest/dist/plugin.system.js
```

## Local Development

For local plugin development and testing, use the dev server instead of CDN URLs:

```
# Cart plugin
http://localhost:1268/plugin.system.js

# Funnel plugin
http://localhost:1269/plugin.system.js
```

See [Development Workflow](./development-workflow.md) for how to run the dev servers.

## Troubleshooting

### Plugin not loading

1. Check that the URL is correct and accessible (open it directly in a browser — you should see JavaScript)
2. Ensure the version exists on npm: `npm view @goldenhippo/builder-cart-plugin@<version>`
3. jsdelivr may take a few minutes to pick up a newly published version

### Plugin loads but models aren't created

1. Verify all required settings are filled in (brand, editUrl, apiUrl, credentials)
2. Check the browser console for `[Hippo Commerce]` log messages
3. Ensure your API credentials are valid

### Stale plugin version on CDN

jsdelivr caches aggressively. To get the freshest version:

- Use a specific version number in the URL
- Or purge the cache: `https://purge.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@latest/dist/plugin.system.js`
