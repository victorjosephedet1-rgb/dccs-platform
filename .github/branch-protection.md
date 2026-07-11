# Branch Protection Configuration

This document specifies the required GitHub branch protection rules for `main`.
Apply these settings at: Repository Settings → Branches → Add rule → `main`

## Required Rules

| Setting | Value |
|---|---|
| Require a pull request before merging | ENABLED |
| Required approvals | 1 |
| Dismiss stale pull request approvals when new commits are pushed | ENABLED |
| Require status checks to pass before merging | ENABLED |
| Require branches to be up to date before merging | ENABLED |
| Require conversation resolution before merging | ENABLED |
| Do not allow bypassing the above settings | ENABLED |
| Allow force pushes | DISABLED |
| Allow deletions | DISABLED |

## Required Status Checks

Add all of the following checks (they come from the `ci.yml` workflow):

- `Install`
- `Lint`
- `Type Check`
- `Dependency Audit`
- `Build`

## Recommended Additional Settings (Repository Settings)

- **Automatically delete head branches** — ENABLED (keeps repo clean after merge)
- **Allow squash merging** — ENABLED (clean linear history)
- **Allow merge commits** — DISABLED (enforce squash or rebase only)
- **Allow rebase merging** — ENABLED

## Secret Scanning

Enable at: Repository Settings → Security → Secret scanning → ENABLED
This prevents accidentally committing API keys.

## Dependabot

Enable at: Repository Settings → Security → Dependabot alerts → ENABLED
Automated PRs for dependency security updates.

## GitHub Environments

Create a `production` environment at: Repository Settings → Environments
- Set required reviewers if desired for extra protection
- Restrict to `main` branch only
