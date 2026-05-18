# Flatten Repo Structure — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

## Problem

The `huddle-app` repo has the Next.js app nested one level deep inside a `huddle/` subfolder. This forces an extra `cd huddle` step every time you work in the repo and adds friction for running `npm` commands, opening the project in an IDE, and running tests.

## Goal

Move all Next.js app files from `huddle/` to the repo root so the project can be used directly from `huddle-app/` without any subfolder navigation.

## Approach

Option A — Delete and re-add. Remove `huddle/` from git tracking entirely, copy its contents to the repo root, commit as a single atomic change. Per-file git history is not preserved (accepted trade-off).

## Resulting Structure

```
huddle-app/
├── .claude/                  # Claude Code config — unchanged
├── .github/                  # GitHub config — unchanged
├── .notebook/                # Notebook files — unchanged
├── docs/                     # Specs and plans — unchanged
├── src/                      # Next.js app source — moved from huddle/src/
├── __tests__/                # Jest tests — moved from huddle/__tests__/
├── .gitignore                # Moved from huddle/.gitignore
├── .env.local                # Copied from huddle/.env.local (gitignored)
├── .env.local.example        # Moved from huddle/
├── .eslintrc.json
├── jest.config.ts
├── jest.setup.ts
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── staticwebapp.config.json
├── tailwind.config.ts
├── tsconfig.json
└── push-to-github.ps1        # Updated to reference huddle-app repo
```

## Key Details

**No code changes required.** Next.js, TypeScript, Jest, and Tailwind all resolve paths relative to their config file locations. Moving configs to the root keeps all internal references valid.

**`.gitignore` coverage.** The existing `huddle/.gitignore` already ignores `node_modules/`, `.next/`, `.env*.local`, `next-env.d.ts`, etc. Moving it to root applies those rules at the correct level.

**`.env.local` handling.** This file is gitignored and exists only on disk. It will be copied to the root as part of the flatten so the dev environment continues working without manual intervention.

**`push-to-github.ps1` update.** The current script references a stale worktree path from the Intelligent-Automation-Studio project. It will be updated to point to the `huddle-app` repo and `main` branch.

## Commit Strategy

Single commit on `main`:
```
Flatten repo: move Next.js app from huddle/ to root
```

## Steps

1. Copy `huddle/.env.local` to repo root (gitignored file — not in git)
2. Copy all tracked files from `huddle/` to repo root using PowerShell
3. Run `git rm -r huddle/` to remove the subfolder from git tracking
4. Stage all new files at root with `git add`
5. Update `push-to-github.ps1` to reference `huddle-app`
6. Commit

## Out of Scope

- Restructuring `src/` internals
- Moving or renaming `docs/`
- Any changes to app logic, components, or API routes
