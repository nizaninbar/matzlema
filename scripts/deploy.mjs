/**
 * Deploy a build of this app to a versioned path on the gh-pages branch.
 *
 *   node scripts/deploy.mjs staging       -> /matzlema/next/   (v2 work in progress)
 *   node scripts/deploy.mjs v1           -> /matzlema/v1/     (v1 archive copy)
 *   node scripts/deploy.mjs prod --yes   -> /matzlema/        (the main URL)
 *
 * `base` is passed to vite on the command line rather than read from
 * vite.config.js. That is deliberate: it means any past tag or branch can be
 * built for any path without editing its source, so v1 stays frozen and still
 * deployable anywhere.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const SITE = 'https://nizaninbar.github.io/matzlema'
const ROOT = process.cwd()

const TARGETS = {
  staging: {
    dest: 'next',
    base: '/matzlema/next/',
    label: 'staging (v2 in progress)',
  },
  v1: {
    dest: 'v1',
    base: '/matzlema/v1/',
    label: 'v1 archive',
  },
  prod: {
    dest: '.',
    base: '/matzlema/',
    label: 'PRODUCTION — the URL people actually use',
    confirm: true,
    // Publishing to the branch root with gh-pages' default `remove: '.'` would
    // delete the sibling version directories. `add` never deletes, so next/ and
    // v1/ survive a promote. The cost is that superseded hashed asset files
    // linger at the root; they are inert and small.
    add: true,
  },
}

function usage(message) {
  if (message) console.error(`\n  ${message}`)
  console.error(`
  Usage: node scripts/deploy.mjs <target> [--yes] [--dry-run]

    staging   build the current working tree -> ${SITE}/next/
    v1        build the current working tree -> ${SITE}/v1/
    prod      build the current working tree -> ${SITE}/   (needs --yes)

    --dry-run   build and report, but publish nothing

  Whatever is checked out right now is what gets deployed. To redeploy v1:

    git switch v1 && npm ci && npm run deploy:v1
`)
  process.exit(1)
}

const [name, ...flags] = process.argv.slice(2)
if (!name) usage('No target given.')

const target = TARGETS[name]
if (!target) usage(`Unknown target "${name}". Expected one of: ${Object.keys(TARGETS).join(', ')}.`)

const dryRun = flags.includes('--dry-run')

if (target.confirm && !dryRun && !flags.includes('--yes')) {
  usage(`"${name}" overwrites ${SITE}/ for every user. Re-run as: npm run deploy:${name} -- --yes`)
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const describe = git('describe', '--tags', '--always', '--dirty')
const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
const dirty = git('status', '--porcelain') !== ''

const url = `${SITE}/${target.dest === '.' ? '' : target.dest + '/'}`

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
      dest: target.dest,
      add: Boolean(target.add),
      message: `Deploy ${name} from ${branch} @ ${describe}`,
    },
    (err) => (err ? reject(err) : resolve()),
  )
})

console.log(`  Done: ${url}\n`)
