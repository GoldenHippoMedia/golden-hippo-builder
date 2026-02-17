# Versioning & Publishing

## Overview

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing. The workflow is:

```
Developer adds changeset --> PR merged to main --> CI creates "Version Packages" PR
                                                --> Merge that PR --> CI publishes to npm
```

## How Changesets Work

### The changeset file

A changeset is a markdown file in `.changeset/` that describes a change. Example:

```markdown
---
'@goldenhippo/builder-cart-schemas': minor
'@goldenhippo/builder-cart-plugin': patch
---

Added new createReviewModel() factory function to cart schemas. Updated plugin to register the review model.
```

This tells the release system:

- Bump `builder-cart-schemas` by a **minor** version (e.g., 0.1.0 → 0.2.0)
- Bump `builder-cart-plugin` by a **patch** version (e.g., 0.1.0 → 0.1.1)
- Use the description as the CHANGELOG entry

### Linked packages

The schema packages (`builder-types`, `builder-cart-schemas`, `builder-funnel-schemas`) are **linked** in `.changeset/config.json`. This means when any of them gets a version bump, they all get bumped to the same version. This keeps their versions in sync since they're tightly coupled.

### Ignored packages

`builder-ui` is **ignored** in the changeset config because it's private and never published.

## CI/CD Pipeline

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and PR to `main`:

1. `npm ci` — install dependencies
2. `npm run build` — build all packages
3. `npm run typecheck` — type-check
4. `npm run lint` — lint
5. `npm run format:check` — formatting

### Release Workflow (`.github/workflows/release.yml`)

Runs on push to `main` only. Uses the [changesets/action](https://github.com/changesets/action) GitHub Action:

**When there are unreleased changesets:**

- Creates (or updates) a PR titled **"chore: version packages"**
- This PR contains the version bumps in `package.json` files and updated `CHANGELOG.md` files
- The team reviews and merges this PR when ready to release

**When the "Version Packages" PR is merged (no remaining changesets):**

- Runs `npm run build`
- Runs `changeset publish` which publishes all bumped packages to npm

### Authentication

Publishing uses **npm trusted publishers** (OIDC) — no long-lived npm tokens are needed.

| Credential      | Source                          | Purpose                                 |
| ---------------- | ------------------------------- | --------------------------------------- |
| OIDC token       | Generated automatically by GitHub Actions | Authenticates with npm via trusted publishers |
| `GITHUB_TOKEN`   | Provided automatically by GitHub | Used by changesets action to create PRs |

The release workflow has `id-token: write` permission, which allows GitHub Actions to generate OIDC tokens. Each package has `publishConfig.provenance: true`, which enables provenance attestations (cryptographic proof the package was built from this repo).

See [Repository Setup](./repository-setup.md) for how to configure trusted publishers on npm.

## The Release Lifecycle

```
1. Developer works on feature branch
        |
2. Runs `npx changeset` to describe the change
        |
3. Commits changeset file + code changes
        |
4. Opens PR --> CI validates (build, typecheck, lint)
        |
5. PR merged to main
        |
6. Release workflow detects changesets
        |
7. Creates/updates "Version Packages" PR
   - Bumps versions in package.json
   - Updates CHANGELOG.md files
   - Removes consumed changeset files
        |
8. Team reviews and merges "Version Packages" PR
        |
9. Release workflow runs again (no changesets remain)
        |
10. `changeset publish` runs
    - Publishes to npm
    - Creates git tags (e.g., @goldenhippo/builder-cart-schemas@1.0.0)
        |
11. Packages are live on npm and CDN
```

## Manual Publishing (Escape Hatch)

If CI is down or you need to publish manually:

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Authenticate with npm
npm login

# Apply version bumps
npx changeset version

# Review changes, then commit
git add .
git commit -m "chore: version packages"

# Build and publish
npm run release

# Push tags and changes
git push origin main --follow-tags
```

## Version Strategy

### Pre-1.0 (current)

All packages start at `0.1.0`. During pre-1.0 development:

- **Minor** bumps (0.1.0 → 0.2.0) are used for new features AND breaking changes
- **Patch** bumps (0.1.0 → 0.1.1) are used for bug fixes

### Post-1.0

Once the packages are stable and in production, follow strict semver:

- **Major** (1.0.0 → 2.0.0) — breaking changes to public API
- **Minor** (1.0.0 → 1.1.0) — new features, backwards-compatible
- **Patch** (1.0.0 → 1.0.1) — bug fixes

### When to go 1.0

Consider releasing 1.0 when:

- The cart schemas are consumed by production Angular apps
- The plugin is running in production Builder.io spaces
- The public API surface is stable and well-documented
