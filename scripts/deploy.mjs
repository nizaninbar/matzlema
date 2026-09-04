/**
 * Deploy a build of this app to a versioned path on the gh-pages branch.
 *
 *   node scripts/deploy.mjs v2   -> /matzlema/v2/   (the new version)
 *   node scripts/deploy.mjs v1   -> /matzlema/v1/   (rebuild of tag v1.0.0)
 *
 * There is deliberately NO target for /matzlema/ itself. That URL is in daily
 * use for real report work, its build is not reproducible from this source tree
 * (see docs/VERSIONING.md), and it is to stay exactly as it is. Every target
 * here writes only into its own subdirectory, so no deploy can reach it.
 *
 * `base` is passed to vite on the command line rather than read from
 * vite.config.js. That is deliberate: it means any past tag or branch can be
 * built for any path without editing its source.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const SITE = 'https://nizaninbar.github.io/matzlema'
const ROOT = process.cwd()

const TARGETS = {
  v2: {
    dest: 'v2',
    base: '/matzlema/v2/',
    label: 'v2 — the new version',
  },
  v1: {
    dest: 'v1',
    base: '/matzlema/v1/',
    // Not what production serves: production was built from an uncommitted tree
    // that predates tag v1.0.0. This is a rebuild of the tagged source.
    label: 'v1.0.0 rebuild (NOT the production build)',
  },
}

function usage(message) {
  if (message) console.error(`\n  ${message}`)
  console.error(`
  Usage: node scripts/deploy.mjs <target> [--dry-run]

    v2        build the current working tree -> ${SITE}/v2/
    v1        build the current working tree -> ${SITE}/v1/

    --dry-run   build and report, but publish nothing

  ${SITE}/ is intentionally NOT a target. It is in daily use and stays as it is.
  Every target above writes only inside its own subdirectory.

  Whatever is checked out right now is what gets deployed.
`)
  process.exit(1)
}

const [name, ...flags] = process.argv.slice(2)
if (!name) usage('No target given.')

if (name === 'prod' || name === 'staging') {
  usage(
    name === 'prod'
      ? `The "prod" target was removed on purpose: ${SITE}/ is to stay untouched. ` +
          `Deploy to "v2" instead. See docs/VERSIONING.md if you truly need to change ${SITE}/.`
      : `"staging" was renamed to "v2" - the new version has a permanent home, not a staging slot.`,
  )
}

const target = TARGETS[name]
if (!target) usage(`Unknown target "${name}". Expected one of: ${Object.keys(TARGETS).join(', ')}.`)

const dryRun = flags.includes('--dry-run')

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const describe = git('describe', '--tags', '--always', '--dirty')
const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
const dirty = git('status', '--porcelain') !== ''

const url = `${SITE}/${target.dest}/`

console.log(`\n  target   ${name} — ${target.label}${dryRun ? '  [DRY RUN]' : ''}`)
console.log(`  url      ${url}`)
console.log(`  source   ${branch} @ ${describe}`)

if (dirty) {
  console.log(`\n  Note: the working tree has uncommitted changes, so this build`)
  console.log(`  will not correspond to any commit. Continuing anyway.`)
}

const vite = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
if (!existsSync(vite)) {
  console.error(`\n  vite not found at ${vite} — run "npm ci" first.\n`)
  process.exit(1)
}

console.log(`\n  Building with base=${target.base} ...\n`)
execFileSync(process.execPath, [vite, 'build', `--base=${target.base}`], { stdio: 'inherit' })

if (dryRun) {
  const html = readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8')
  const refs = [...html.matchAll(/(?:src|href)="([^"]*)"/g)].map((m) => m[1])
  console.log(`\n  Built dist/index.html references:`)
  for (const ref of refs) console.log(`    ${ref}`)

  const wrong = refs.filter((r) => r.startsWith('/') && !r.startsWith(target.base))
  if (wrong.length) {
    console.error(`\n  FAIL: ${wrong.length} reference(s) do not start with ${target.base}.\n`)
    process.exit(1)
  }
  console.log(`\n  Dry run OK. Nothing published. Would have gone to ${url}\n`)
  process.exit(0)
}

console.log(`\n  Publishing dist/ to gh-pages:${target.dest} ...\n`)
const { default: ghpages } = await import('gh-pages')
await new Promise((resolve, reject) => {
  ghpages.publish(
    path.join(ROOT, 'dist'),
    {
      // gh-pages' `remove` default of '.' is relative to `dest`, so a deploy
      // wipes and replaces only its own subdirectory. Sibling versions - and
      // the site root - are untouchable from here.
      dest: target.dest,
      message: `Deploy ${name} from ${branch} @ ${describe}`,
    },
    (err) => (err ? reject(err) : resolve()),
  )
})

console.log(`  Done: ${url}\n`)
