# Repository Setup

One-time setup steps for repo administrators.

## 1. npm Organization

The `@goldenhippo` npm scope must be claimed on [npmjs.com](https://www.npmjs.com):

1. Go to https://www.npmjs.com/org/create
2. Create the `goldenhippo` organization
3. Add team members to the org

If the scope is already taken, you'll need to either:

- Contact the current owner to transfer it
- Choose a different scope and update all `package.json` `name` fields

## 2. First Publish (Manual)

Trusted publishers require the package to exist on npm before OIDC can be configured. The very first publish must be done manually:

```bash
# Authenticate with npm
npm login

# Build all packages
npm run build

# Publish all public packages
npx changeset publish
```

This creates the initial versions on npm. After this, all subsequent releases go through the automated CI workflow with trusted publishers.

## 3. Configure Trusted Publishers on npm

After the first manual publish, configure each package for OIDC-based publishing:

1. For each public package, go to its access page on npm:
   - https://www.npmjs.com/package/@goldenhippo/builder-types/access
   - https://www.npmjs.com/package/@goldenhippo/builder-cart-schemas/access
   - https://www.npmjs.com/package/@goldenhippo/builder-funnel-schemas/access
   - https://www.npmjs.com/package/@goldenhippo/builder-cart-plugin/access
   - https://www.npmjs.com/package/@goldenhippo/builder-funnel-plugin/access
2. Under **Trusted Publishers**, click **Add trusted publisher**
3. Select **GitHub Actions** and fill in:
   - **Organization**: `GoldenHippoMedia`
   - **Repository**: `golden-hippo-builder`
   - **Workflow filename**: `release.yml`
4. Confirm the configuration

> **Important:** These fields are case-sensitive. The workflow filename must exactly match `.github/workflows/release.yml`.

### How It Works

Trusted publishing uses OpenID Connect (OIDC) to authenticate GitHub Actions with npm. When the release workflow runs:

1. GitHub generates a short-lived OIDC token identifying the workflow
2. npm verifies the token matches the trusted publisher configuration
3. The package is published without any stored secrets
4. Provenance attestations are automatically generated, providing cryptographic proof that the package was built from this repo

**No `NPM_TOKEN` secret is needed.** The `id-token: write` permission in the workflow and the `publishConfig.provenance: true` in each `package.json` handle everything.

### Requirements

- **npm CLI >= 11.5.1** — the release workflow installs the latest npm automatically
- **`repository` field in package.json** — each publishable package includes this (already configured)
- **`publishConfig.provenance: true`** — each publishable package includes this (already configured)

## 4. GitHub Repository Settings

### Branch Protection

Recommended branch protection rules for `main`:

1. Go to **Settings > Branches > Add branch ruleset**
2. Target: `main`
3. Enable:
   - **Require a pull request before merging**
   - **Require status checks to pass** — add the `validate` job from CI workflow
   - **Require branches to be up to date**
   - **Do not allow bypassing the above settings**

### Disable Outside Contributions

Since the repo is public but you don't want outside PRs:

1. Go to **Settings > General > Pull Requests**
2. Uncheck **Allow merge commits from forks** (or leave as-is — branch protection handles this)
3. Optionally, add a `CONTRIBUTING.md` stating the repo doesn't accept outside contributions
4. In **Settings > Actions > General**, set **Fork pull request workflows** to "Require approval for all outside collaborators"

### GitHub Actions Permissions

1. Go to **Settings > Actions > General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests** (required for the changesets action to create version PRs)

## 5. Changeset Configuration

The `.changeset/config.json` file references the GitHub repo for changelog links:

```json
{
  "changelog": ["@changesets/changelog-github", { "repo": "GoldenHippoMedia/golden-hippo-builder" }]
}
```

This is already configured. If the repo is ever moved, update this value.

## 6. Verify Setup

After completing all steps:

1. Push a commit to `main`
2. Verify the CI workflow runs and passes
3. Create a branch, add a changeset (`npx changeset`), push, and open a PR
4. Verify CI runs on the PR
5. Merge the PR
6. Verify the release workflow creates a "Version Packages" PR
7. Merge the "Version Packages" PR
8. Verify packages appear on https://www.npmjs.com/org/goldenhippo
9. Verify provenance badges appear on each package's npm page
10. Verify CDN URLs work:
    ```
    https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@0.1.0/dist/plugin.system.js
    ```
