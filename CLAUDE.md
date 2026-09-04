# CLAUDE.md

Hebrew/RTL pipeline CCTV inspection report generator. Vue 3 + Vite, no backend, no tests.

- [docs/VERSIONING.md](docs/VERSIONING.md) — **read before any deploy**
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it works, data model, print pipeline
- [docs/REVIEW.md](docs/REVIEW.md) — known defects and the agreed refactor order

## Which branch is checked out matters

- `master` — the v2 rewrite (`version: 2.0.0-dev`). All current work happens here.
- `v1` — the tagged v1.0.0 source plus deploy tooling. Note this is **not** what the live
  site serves (see below), so it is a reference branch more than a hotfix branch.

## Deploying

Two versions are served simultaneously: `/matzlema/` is the live app used for real report
work, `/matzlema/v2/` is the rewrite, `/matzlema/v1/` is a rebuild of tag `v1.0.0`.

- `npm run deploy` deliberately does **not** deploy — it prints usage. Don't "fix" this.
- `npm run deploy:v2` publishes to `/matzlema/v2/` and is safe to run freely.
- **`/matzlema/` is not a deploy target and must stay that way.** The owner wants it
  untouched indefinitely: it is in daily use, and its build is not reproducible from this
  source tree (built from an uncommitted state predating `36615a9`, bundling TipTap that
  was never in `package.json`, with print CSS in no commit). A `prod` target existed and
  was removed on purpose. Do not re-add one, do not publish to the site root, and do not
  treat the `v1` branch as a like-for-like replacement for what is live.
- Append `-- --dry-run` to any target to build and verify without publishing. Prefer it.

`gh-pages` commits _before_ it pushes, so a failed deploy leaves a finished commit in
`node_modules/.cache/gh-pages/`. Push that commit; do not re-run the deploy.

## Traps

- **Git Bash mangles absolute-path arguments.** `--base=/matzlema/v2/` becomes
  `/Program Files/Git/matzlema/v2/` under MSYS, producing a silently broken build. Use
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
