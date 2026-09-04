# CLAUDE.md

Hebrew/RTL pipeline CCTV inspection report generator. Vue 3 + Vite, no backend, no tests.

- [docs/VERSIONING.md](docs/VERSIONING.md) — **read before any deploy**
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it works, data model, print pipeline
- [docs/REVIEW.md](docs/REVIEW.md) — known defects and the agreed refactor order

## Which branch is checked out matters

- `master` — the v2 rewrite (`version: 2.0.0-dev`).
- `v1` — frozen production. Hotfixes only, never features.

The deploy commands mean different things on each: `deploy:prod` from `v1` is a routine
hotfix, from `master` it is the promote of the whole rewrite.

## Deploying

Two versions are live simultaneously: `/matzlema/` is production (v1, used for real report
work), `/matzlema/next/` is v2 staging, `/matzlema/v1/` is the v1 fallback.

- `npm run deploy` deliberately does **not** deploy — it prints usage. Don't "fix" this.
- `npm run deploy:staging` (from `master`) is the only target that is safe to run freely.
- `npm run deploy:prod` overwrites the URL people depend on. Run it only when the user asks
  for it in that same session, never as a step inferred from "deploy this".
- **The live site is not reproducible from source.** It was built from an uncommitted tree
  that predates `36615a9`, bundles TipTap (never in `package.json`), and has print CSS in
  no commit. So `deploy:prod` is never a no-op "refresh" — from any branch it _changes_
  what users get. See docs/VERSIONING.md.
- Append `-- --dry-run` to any target to build and verify without publishing. Prefer it.

`gh-pages` commits _before_ it pushes, so a failed deploy leaves a finished commit in
`node_modules/.cache/gh-pages/`. Push that commit; do not re-run the deploy.

## Traps

- **Git Bash mangles absolute-path arguments.** `--base=/matzlema/next/` becomes
  `/Program Files/Git/matzlema/next/` under MSYS, producing a silently broken build. Use
  PowerShell for manual builds, or the npm scripts (immune — the base is a literal in
  `scripts/deploy.mjs`).
- **All UI text is Hebrew and the layout is RTL.** Don't translate labels, and don't
  "correct" `direction: rtl` or the LTR overrides on phone/email/signature fields.
- **PDF export is `window.print()`**, shaped by the `@media print` block in
  [src/style.css](src/style.css). Pagination depends on hard-coded pixel spacers
  (`margin-bottom: 620px`, `min-height: 1020px`) tuned by eye for A4 — changing header
  height silently breaks page breaks. Verify against real printed output, not the screen.
- **The report JSON is the long-lived data format.** v1 files exist on customers' disks and
  carry no version field. v2 must keep reading them: absent `schemaVersion` means v1.

## Verification

There is no test suite, linter, or typechecking. `npm run build` and
`npm run deploy:<target> -- --dry-run` are the only automated checks — don't claim more
verification than that.
