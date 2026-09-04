# Versioning and parallel deployment

The goal: **`/matzlema/` stays exactly as it is, indefinitely.** It is in daily use for
real report work. The new version lives at its own URL and is never promoted over it.

## URL layout

| URL                                         | Serves | Purpose                                                                     |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `https://nizaninbar.github.io/matzlema/`    | v1     | **Untouched, permanently.** Not a deploy target. Do not change it.          |
| `https://nizaninbar.github.io/matzlema/v2/` | v2     | The new version. Deploy here as often as you like.                          |
| `https://nizaninbar.github.io/matzlema/v1/` | v1.0.0 | Rebuild of tag `v1.0.0`. **Not** the production build — see the note below. |

All three live on the single `gh-pages` branch, as sibling directories.

**There is no deploy target for `/matzlema/`.** Every target writes only inside its own
subdirectory, because gh-pages' `remove` default is relative to `dest` — so no
`npm run deploy:*` can reach the site root. `deploy:prod` was removed on purpose; running
it, or the old `deploy:staging`, now fails with an explanation rather than doing something.

If you ever genuinely need to change the site root, that is a deliberate manual act, not a
script: check out `deploy/v1.0.0` (the actual production bytes) or your intended content and
publish it with `npx gh-pages -d <dir> --add`. Read the warning below first.

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

- **This is why `/matzlema/` is not a deploy target.** Publishing any branch over it would
  replace it with never-deployed code and drop those print refinements. The `show-on-print`
  pair swaps a textarea for a static `white-space: pre-wrap` div when printing, so long
  multi-line text prints in full rather than clipped — losing it is a real regression.
- **Tag `deploy/v1.0.0` is the only record of what is actually in production.** If the site
  root is ever damaged, restoring those bytes is the only faithful repair; rebuilding the
  `v1` branch is not.
- `/matzlema/v1/` is a rebuild of tag `v1.0.0`, which was **never deployed**. It is a
  reference copy of the tagged source, not a mirror of production. Do not treat it as a
  fallback for what users currently see.
- Recovering the uncommitted print CSS from the deployed bundle, so git finally describes
  production, remains unfinished. It matters mainly as a requirement for the v2 print
  rework, which must not print worse than what is live today.

## Git layout

| Ref                 | What it is                                                                         |
| ------------------- | ---------------------------------------------------------------------------------- |
| tag `v1.0.0`        | The v1 **source** exactly as it shipped (commit `36615a9`). Never moves.           |
| tag `deploy/v1.0.0` | The v1 **built bytes** exactly as served (gh-pages commit `c16edf0`). Never moves. |
| branch `v1`         | `v1.0.0` source + deploy tooling. Reference only — not what the live site serves.  |
| branch `master`     | The v2 rewrite. All current work.                                                  |

`v1.0.0` is the pristine tagged app; the `v1` branch adds only deploy tooling on top of it,
no application changes. Having both means the frozen artifact is unambiguous and the branch
is still buildable — but neither reproduces the live site, so treat `v1` as a historical
reference rather than a hotfix line.

## Deploying

`npm run deploy` on its own **errors with usage** instead of publishing, so old muscle
memory cannot do anything by accident. There are exactly two targets:

```bash
npm run deploy:v2   # current working tree -> /matzlema/v2/
npm run deploy:v1   # current working tree -> /matzlema/v1/
```

Add `-- --dry-run` to either to build and check the output without publishing anything. The
dry run asserts that every absolute asset path in the built `index.html` starts with the
expected base and fails loudly if not:

```bash
npm run deploy:v2 -- --dry-run
```

Whatever is checked out is what gets built. The `base` path is passed to Vite on the
command line, so no version needs its own `vite.config.js` — that is what lets a frozen tag
be rebuilt for a different path without editing it.

### Day-to-day

```bash
git switch master
npm run deploy:v2   # then check https://nizaninbar.github.io/matzlema/v2/
```

`/matzlema/` is untouched by this, always. Repeat as often as you want.

### Hotfixing v1

Only if the live site actually needs a change — remember it is not reproducible from source,
so a rebuild is **not** a like-for-like replacement. Read the warning above first, decide
deliberately, and publish the site root by hand rather than through a script.

## If the site root is ever damaged

Restore the real production bytes from the `deploy/v1.0.0` tag. This is the only faithful
repair — rebuilding the `v1` branch gives you never-deployed code instead:

```bash
git switch --detach deploy/v1.0.0
npx gh-pages -d . --add       # --add so /v1/ and /v2/ survive
```

`--add` matters: gh-pages otherwise wipes the destination first, which at the site root
would delete the sibling `v1/` and `v2/` directories. In add-only mode nothing is deleted;
the cost is that superseded hashed assets linger at the root, which is harmless.

This route needs nothing but the tag and gh-pages — not Vite, not a working v1 source tree.
That is the whole reason the tag exists.

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
$ node node_modules/vite/bin/vite.js build --base=/matzlema/v2/
# produces href="/Program Files/Git/matzlema/v2/assets/..."   <- broken
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
