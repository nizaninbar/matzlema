# Versioning and parallel deployment

The goal: **v1 keeps working at the URL people already use, for real report work,
while v2 is rewritten in parallel.** The main URL never shows a half-built app.

## URL layout

| URL                                           | Version | Purpose                                                                |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `https://nizaninbar.github.io/matzlema/`      | v1      | **Production.** Frozen. Do not deploy here casually.                   |
| `https://nizaninbar.github.io/matzlema/next/` | v2      | Staging. Deploy here as often as you like.                             |
| `https://nizaninbar.github.io/matzlema/v1/`   | v1      | Archive copy. **Already published** — a working fallback exists today. |

All three live on the single `gh-pages` branch, as sibling directories.

## ⚠ Production is not reproducible from source

**What is live at `/matzlema/` was built from an uncommitted working tree and does not
correspond to any commit in this repo.** Established by diffing the deployed bundle
against a rebuild of `v1.0.0`:

- The live JS is **272 KB vs 77 KB** — it bundles ~195 KB of TipTap/ProseMirror, which was
  never in `package.json` or the lockfile in any commit. An abandoned rich-text experiment.
- The live DOM has two `show-on-print`/`hide-on-print` element pairs and two extra
  `textarea`s that `v1.0.0` does not have.
- Its print CSS contains `.grid-cell div{font-weight:400!important}` and a
  `.section-grid textarea` rule that exist in **no commit** (`git log --all -S` finds none).
- `.show-on-print` only gained `!important` at `36615a9`, and the live build lacks it, so
  the live build **predates `36615a9`** — the commit tagged `v1.0.0`, which has never been
  deployed.

Consequences:

- **`npm run deploy:prod` from the `v1` branch is not a no-op.** It would replace the live
  site with never-deployed code and drop those print refinements. The `show-on-print` pair
  swaps a textarea for a static `white-space: pre-wrap` div when printing, so long
  multi-line text prints in full rather than clipped — losing it is a real regression.
- **Tag `deploy/v1.0.0` is the only record of what is actually in production.** Rollback
  route 3 below (restoring those bytes) is therefore the _accurate_ rollback, not route 2.
- Reconciling this — recovering the uncommitted print CSS from the deployed bundle and
  committing it so git finally describes production — is unfinished work.

## Git layout

| Ref                 | What it is                                                                         |
| ------------------- | ---------------------------------------------------------------------------------- |
| tag `v1.0.0`        | The v1 **source** exactly as it shipped (commit `36615a9`). Never moves.           |
| tag `deploy/v1.0.0` | The v1 **built bytes** exactly as served (gh-pages commit `c16edf0`). Never moves. |
| branch `v1`         | v1 source + deploy tooling. Where a v1 hotfix would go.                            |
| branch `master`     | The v2 rewrite.                                                                    |

`v1.0.0` is the pristine app; the `v1` branch adds only this deploy tooling on top of
it, no application changes. Having both means the frozen artifact is unambiguous and the
branch is still buildable.

## Deploying

`npm run deploy` on its own now **errors with usage** instead of publishing. Every deploy
names its target explicitly, so old muscle memory cannot overwrite production.

```bash
npm run deploy:staging        # current working tree -> /matzlema/next/
npm run deploy:v1             # current working tree -> /matzlema/v1/
npm run deploy:prod -- --yes  # current working tree -> /matzlema/   (guarded)
```

Add `-- --dry-run` to any of them to build and check the output without publishing
anything. The dry run asserts that every absolute asset path in the built `index.html`
starts with the expected base and fails loudly if not — worth running before a promote:

```bash
npm run deploy:prod -- --dry-run
```

Whatever is checked out is what gets built. The `base` path is passed to Vite on the
command line, so no version needs its own `vite.config.js` — that is what lets the frozen
v1 be rebuilt for a different path without editing it.

### Day-to-day, during the rewrite

```bash
git switch master
npm run deploy:staging        # review at /matzlema/next/
```

Production is untouched. Repeat as often as you want.

### Rebuilding or hotfixing v1

```bash
git switch v1
npm ci
# ... fix ...
git commit -am "v1 hotfix: ..."
git tag v1.0.1
npm run deploy:prod -- --yes  # v1 owns the main URL right now
```

### Promoting v2 to the main URL

Only when you are satisfied with `/next/`. Order matters — archive v1 first, so there is a
working fallback before production changes.

```bash
# 1. Park a copy of v1 at /v1/ so it stays reachable
git switch v1
npm ci
npm run deploy:v1                     # -> /matzlema/v1/
# (already published once; re-run only if v1 has taken hotfixes since)

# 2. Verify https://nizaninbar.github.io/matzlema/v1/ actually works

# 3. Promote v2
git switch master
npm ci
npm run deploy:prod -- --yes          # -> /matzlema/
git tag v2.0.0
```

`/next/` keeps working after the promote and stays the staging slot for v2.x work.

## Rolling back to v1

Three routes, cheapest first:

1. **Point users at the archive.** `/matzlema/v1/` is already live, so just send people
   there. Zero risk, instant, no build needed.
2. **Redeploy v1 over production.**
   ```bash
   git switch v1 && npm ci && npm run deploy:prod -- --yes
   ```
3. **Restore the original bytes** without building anything, from the `deploy/v1.0.0` tag:
   ```bash
   git switch --detach deploy/v1.0.0
   git switch -c restore-v1 && npm ci   # (only gh-pages is needed)
   npx gh-pages -d . --add
   ```
   This is the last resort — it does not need Node, npm, or Vite to still work with the v1
   source, only the tag.

## Why `prod` uses `add` mode

gh-pages defaults to wiping the destination before publishing. Publishing to the branch
root with that default would delete the sibling `next/` and `v1/` directories. The `prod`
target therefore publishes in add-only mode: nothing is ever deleted, so the other versions
survive a promote.

The tradeoff: superseded hashed asset files (`assets/index-OLD.js`) accumulate at the root.
They are inert and a few hundred KB. If you want to tidy them up, wipe the branch root and
redeploy all three targets in the promote order above.

## Report file compatibility

The saved report JSON is the real long-lived data format — reports saved from v1 must open
in v2, and v1 files exist on customers' disks already.

**v1 emits no version field.** Its shape is documented in
[ARCHITECTURE.md](ARCHITECTURE.md#data-model). Rules for v2:

- A report JSON with **no `schemaVersion`** is a v1 file. v2 must read it.
- v2 must stamp `"schemaVersion": 2` on everything it writes.
- v2 should **not** write files that v1 can't open, unless you have accepted that reports
  become one-way once they are touched by v2. If you want two-way compatibility during the
  transition, keep the v1 field names and only add fields.

One known v1 quirk to handle on import: `images` in a v1 file contains `blob:` URLs, which
are dead on arrival (see [REVIEW.md](REVIEW.md) finding #1). v2's importer should detect a
non-`data:` image entry and drop it with a warning rather than rendering a broken image.

## Gotcha: don't pass `--base` by hand in Git Bash

`scripts/deploy.mjs` invokes Vite through `execFileSync` with an argument array, so no
shell touches the base path. But if you run the build manually **in Git Bash / MSYS on
Windows**, the shell rewrites a leading-slash argument into a Windows path:

```bash
$ node node_modules/vite/bin/vite.js build --base=/matzlema/next/
# produces href="/Program Files/Git/matzlema/next/assets/..."   <- broken
```

Use PowerShell for manual builds, or just use the `npm run deploy:*` scripts, which are
immune because the base is a literal inside the script.

## Troubleshooting: a deploy that fails at the push step

`gh-pages` does its work in a cached clone under
`node_modules/.cache/gh-pages/https!github.com!nizaninbar!matzlema`. It copies the files,
commits, and only then pushes — so if the push fails (expired credentials, no network, a
terminal that can't prompt), **the commit already exists locally** and the deploy is one
command from done. Don't re-run the deploy; inspect and push:

```bash
D='node_modules/.cache/gh-pages/https!github.com!nizaninbar!matzlema'
git -C "$D" log --oneline -2                      # is the Deploy commit there?
git -C "$D" diff --name-only origin/gh-pages HEAD # confirm it only touches the expected dir
git -C "$D" push origin gh-pages
```

The middle command is the one that matters before a `prod` deploy — it tells you exactly
what is about to change on the live site, and confirms the version subdirectories were not
touched.

If the cache clone gets into a confusing state, delete the whole
`node_modules/.cache/gh-pages` directory; the next deploy re-clones it.

## Notes

- `dist.zip` at the repo root is an old committed build. The `deploy/v1.0.0` tag now covers
  that job properly, so it can be deleted as part of the v2 cleanup.
- The pre-existing tags named `1` and `2` point at early commits (`c1d9a44`, `84a0d55`) and
  are not version markers. Safe to delete; left alone for now.
