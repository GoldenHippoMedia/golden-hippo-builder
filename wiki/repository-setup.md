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

## 2. npm Automation Token

Create an npm token for CI publishing:

1. Log in to https://www.npmjs.com
2. Go to **Access Tokens > Generate New Token**
3. Select **Automation** type (bypasses 2FA for CI)
4. Copy the token

## 3. GitHub Repository Settings

### Secrets

Add the npm token as a GitHub repository secret:

1. Go to **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: the npm automation token from step 2

The `GITHUB_TOKEN` is automatically provided by GitHub Actions — no setup needed.

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

## 4. Changeset Configuration

The `.changeset/config.json` file references the GitHub repo for changelog links:

```json
{
  "changelog": ["@changesets/changelog-github", { "repo": "your-org/your-repo" }]
}
```

Update `"repo"` to match your actual GitHub `org/repo` (e.g., `"goldenhippo/builder-workspace"`).

## 5. First Publish

The very first publish must be done manually since there are no prior versions:

```bash
# Authenticate with npm
npm login

# Build all packages
npm run build

# Publish all public packages
npx changeset publish
```

After this, all subsequent releases go through the automated CI workflow.

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
9. Verify CDN URLs work:
   ```
   https://cdn.jsdelivr.net/npm/@goldenhippo/builder-cart-plugin@0.1.0/dist/plugin.system.js
   ```
