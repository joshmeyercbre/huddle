# Flatten Repo Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all Next.js app files from `huddle/` to the repo root so the project works directly from `huddle-app/` without subfolder navigation.

**Architecture:** Copy all tracked files (and the gitignored `.env.local`) from `huddle/` to the repo root, remove the `huddle/` subfolder from git, update `push-to-github.ps1`, and land a single commit on `main`. No code changes — only structural file moves.

**Tech Stack:** PowerShell, Git

---

### Task 1: Copy gitignored `.env.local` to repo root

`.env.local` is never tracked by git, so it must be copied manually before any git operations.

**Files:**
- Copy: `huddle/.env.local` → `.env.local` (gitignored at destination)

- [ ] **Step 1: Check the file exists, then copy it**

Run in PowerShell from `C:\Users\Josh\Documents\huddle-app`:
```powershell
if (Test-Path "huddle\.env.local") {
    Copy-Item "huddle\.env.local" ".env.local"
    Write-Host "Copied .env.local"
} else {
    Write-Host "No .env.local found — skipping"
}
```
Expected: "Copied .env.local" (or "skipping" if it doesn't exist — both are fine)

---

### Task 2: Copy all tracked app files from `huddle/` to repo root

Copy `src/`, `__tests__/`, and all config/root files. Skip `.next/` and `node_modules/` — those are gitignored build artifacts and will be regenerated.

**Files:**
- Copy: `huddle/src/` → `src/`
- Copy: `huddle/__tests__/` → `__tests__/`
- Copy: all individual files listed below

- [ ] **Step 1: Copy source and test directories**

Run from `C:\Users\Josh\Documents\huddle-app`:
```powershell
Copy-Item "huddle\src" "src" -Recurse
Copy-Item "huddle\__tests__" "__tests__" -Recurse
```
Expected: no output, no errors

- [ ] **Step 2: Copy all root-level app files**

```powershell
$files = @(
    ".eslintrc.json",
    ".gitignore",
    ".env.local.example",
    "jest.config.ts",
    "jest.setup.ts",
    "next.config.mjs",
    "package.json",
    "package-lock.json",
    "postcss.config.mjs",
    "README.md",
    "staticwebapp.config.json",
    "tailwind.config.ts",
    "tsconfig.json"
)
foreach ($f in $files) {
    Copy-Item "huddle\$f" $f
    Write-Host "Copied $f"
}
```
Expected: 13 lines of "Copied <filename>"

- [ ] **Step 3: Verify the key files exist at root**

```powershell
@("package.json", "src", "__tests__", ".gitignore", "next.config.mjs", "tsconfig.json") | ForEach-Object {
    if (Test-Path $_) { Write-Host "OK: $_" } else { Write-Host "MISSING: $_" }
}
```
Expected: all six lines show "OK"

---

### Task 3: Remove `huddle/` from git tracking

- [ ] **Step 1: Run `git rm -r huddle/`**

Run from `C:\Users\Josh\Documents\huddle-app`:
```powershell
git rm -r huddle/
```
Expected: a list of `rm 'huddle/...'` lines for every tracked file. No errors.

- [ ] **Step 2: Confirm huddle/ is gone from git status**

```powershell
git status --short | Select-String "huddle"
```
Expected: lines beginning with `D ` (deleted/staged) — none beginning with `?? huddle` or ` M huddle`

---

### Task 4: Update `push-to-github.ps1`

The existing script references a stale Intelligent-Automation-Studio worktree. Replace it with a simple push for the `huddle-app` repo.

**Files:**
- Modify: `push-to-github.ps1`

- [ ] **Step 1: Replace the script contents**

Open `push-to-github.ps1` and replace all content with:
```powershell
cd "C:\Users\Josh\Documents\huddle-app"
git push origin main
```

- [ ] **Step 2: Verify the file looks correct**

```powershell
Get-Content "push-to-github.ps1"
```
Expected output:
```
cd "C:\Users\Josh\Documents\huddle-app"
git push origin main
```

---

### Task 5: Stage new root files and commit

- [ ] **Step 1: Stage all new files at the repo root**

Run from `C:\Users\Josh\Documents\huddle-app`:
```powershell
git add src __tests__ .gitignore .env.local.example .eslintrc.json jest.config.ts jest.setup.ts next.config.mjs package.json package-lock.json postcss.config.mjs README.md staticwebapp.config.json tailwind.config.ts tsconfig.json push-to-github.ps1
```
Expected: no output, no errors

- [ ] **Step 2: Check staged files look right**

```powershell
git status --short
```
Expected: lines beginning with `A ` (added) for all new root files, and `D ` (deleted) for all `huddle/` files. No untracked `??` lines for app files.

- [ ] **Step 3: Commit**

```powershell
git commit -m @'
Flatten repo: move Next.js app from huddle/ to root

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
'@
```
Expected: `[main <sha>] Flatten repo: move Next.js app from huddle/ to root`

---

### Task 6: Smoke test the app still works

- [ ] **Step 1: Install dependencies from the new root location**

Run from `C:\Users\Josh\Documents\huddle-app`:
```powershell
npm install
```
Expected: completes without errors, `node_modules/` appears at root

- [ ] **Step 2: Run the test suite**

```powershell
npm test -- --passWithNoTests
```
Expected: all tests pass (or "no tests found" — both are acceptable)

- [ ] **Step 3: Verify the dev server starts**

```powershell
npm run dev
```
Expected: output includes `▲ Next.js` and `Local: http://localhost:3000` within a few seconds. Kill with Ctrl+C once confirmed.
