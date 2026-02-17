# Development Workflow

## Prerequisites

- Node.js >= 20
- npm >= 10
- Access to the GitHub repository

## Initial Setup

```bash
git clone <repo-url>
cd golden-hippo-builder
npm install
npm run build        # Build all packages (required before typecheck)
```

## Day-to-Day Development

### 1. Create a branch

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

Branch naming conventions:

- `feat/description` — new features
- `fix/description` — bug fixes
- `refactor/description` — code restructuring
- `docs/description` — documentation changes

### 2. Develop

```bash
# Start a plugin dev server (choose one)
npm run dev:plugin           # Cart plugin on http://localhost:1268
npm run dev:funnel-plugin    # Funnel plugin on http://localhost:1269

# Build everything
npm run build

# Build specific packages
npm run build:schemas        # Cart schemas only
npm run build:funnel-schemas # Funnel schemas only
npm run build:plugin         # Cart plugin (auto-builds deps)
npm run build:funnel-plugin  # Funnel plugin (auto-builds deps)
```

### 3. Validate

Run all checks before committing:

```bash
npm run typecheck       # Type-check all packages
npm run lint            # ESLint (includes module boundary enforcement)
npm run format:check    # Prettier formatting check
npm run test            # Run tests
```

Or fix formatting automatically:

```bash
npm run format          # Auto-fix formatting
```

### 4. Add a changeset

**Every PR that changes publishable packages must include a changeset.** This is how the team communicates what changed and how it affects the version number.

```bash
npx changeset
```

This interactive prompt will ask:

1. **Which packages changed?** — Select all affected packages
2. **Bump type?** — `patch` (bug fix), `minor` (new feature), `major` (breaking change)
3. **Summary** — A short description of the change (this becomes the CHANGELOG entry)

This creates a file in `.changeset/` (e.g., `.changeset/happy-dogs-fly.md`). **Commit this file with your PR.**

#### When to use each bump type

| Bump    | When                                       | Example                                                                   |
| ------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `patch` | Bug fixes, internal refactors, doc updates | Fixed a field name typo in product model                                  |
| `minor` | New features, new models, new exports      | Added `createReviewModel()` to cart-schemas                               |
| `major` | Breaking changes to public API             | Renamed `BuilderProductContent` type, changed factory function signatures |

#### What if my change doesn't affect published packages?

If you only changed `builder-ui` (private) or non-code files, you don't need a changeset. The PR can be merged without one.

### 5. Open a pull request

Push your branch and open a PR against `main`:

```bash
git push -u origin feat/your-feature-name
```

The CI workflow will automatically:

- Install dependencies
- Build all packages
- Run typecheck, lint, and format checks

All checks must pass before merging.

### 6. After merge

Once your PR is merged to `main`, the release workflow handles everything:

- If changesets exist: creates/updates a **"Version Packages"** PR
- When that PR is merged: publishes new versions to npm

See [Versioning & Publishing](./versioning-and-publishing.md) for details.

## Adding a New Builder.io Model

### In a schema package (e.g., builder-cart-schemas)

1. Create `src/data/<model-name>.model.ts` (or `src/section/` for component models, `src/page/` for page models)
   - Import types from `../types` (re-exports from `@goldenhippo/builder-types`)
   - Export a factory function (`createXxxModel(...)`) returning a `ModelShape`
   - Export a TypeScript content type (`BuilderXxxContent`)
2. Re-export from the appropriate barrel: `src/data/index.ts`, `src/section/index.ts`, or `src/page/index.ts`
3. Re-export from `src/index.ts`
4. Add a changeset: `npx changeset` → select the schema package → `minor` bump

### In the plugin (e.g., builder-cart-plugin)

1. Import the factory function in `src/core/models/builder-helper.ts`
2. Add the model to the `BuilderHelper` class
3. Wire into the model creation phases in `src/plugin.ts` (`setHippoModels()`)
4. Add a changeset: `npx changeset` → select the plugin package → `minor` bump

## Plugin Development with Builder.io

1. Run `npm run dev:plugin` (or `dev:funnel-plugin`)
2. In Builder.io, go to **Settings > Plugins > Add Plugin**
3. Enter `http://localhost:1268/plugin.system.js` (or `:1269` for funnel)
4. Fill in required settings and save

For production, use the CDN URL instead of localhost. See [Consuming Plugins](./consuming-plugins.md).
