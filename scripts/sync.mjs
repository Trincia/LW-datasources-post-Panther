/**
 * npm run sync — pull the latest DuBois tokens, components, and icons
 *                from the upstream starter kit into your project.
 *
 * Safe to run at any time. Only overwrites design system files —
 * never touches src/app/ (your pages) or package.json.
 *
 * Usage:
 *   npm run sync
 */

import { execSync } from "child_process"
import readline from "readline"

const UPSTREAM_URL = "https://github.com/gioa/db-starter-kit.git"
const REMOTE = "starter-kit"
const BRANCH = "main"

// Files and folders synced from upstream. Your pages (src/app/) are never touched.
const SYNC_TARGETS = [
  "src/app/globals.css",
  "src/components/ui/",
  "src/components/shell/",
  "src/components/icons/",
  "CLAUDE.md",
  "docs/",
  "scripts/",
]

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((res) => rl.question(q, res))

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: opts.silent ? "pipe" : "inherit", ...opts })
}

function tryRun(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe" })
  } catch {
    return null
  }
}

function hasRemote() {
  const remotes = tryRun("git remote") || ""
  return remotes.split("\n").map((r) => r.trim()).includes(REMOTE)
}

async function main() {
  console.log("\nDatabricks UI Starter Kit — sync\n")

  // Add upstream remote if missing
  if (!hasRemote()) {
    console.log(`Adding remote '${REMOTE}' → ${UPSTREAM_URL}`)
    run(`git remote add ${REMOTE} ${UPSTREAM_URL}`)
  }

  // Fetch
  process.stdout.write(`Fetching ${REMOTE}/${BRANCH}... `)
  run(`git fetch ${REMOTE} ${BRANCH} --quiet`)
  console.log("done\n")

  // Show what changed
  const diffStat = tryRun(
    `git diff --stat HEAD ${REMOTE}/${BRANCH} -- ${SYNC_TARGETS.join(" ")}`
  )

  if (!diffStat || !diffStat.trim()) {
    console.log("Already up to date. Nothing to sync.")
    rl.close()
    return
  }

  console.log("Changes in design system files:\n")
  console.log(diffStat)

  const answer = await ask("Apply these changes? [y/N] ")
  rl.close()

  if (answer.trim().toLowerCase() !== "y") {
    console.log("Aborted.")
    return
  }

  // Checkout each target from upstream
  for (const target of SYNC_TARGETS) {
    const result = tryRun(
      `git checkout ${REMOTE}/${BRANCH} -- ${target} 2>&1`
    )
    if (result !== null) {
      process.stdout.write(`  ✓  ${target}\n`)
    } else {
      process.stdout.write(`  –  ${target} (not found upstream, skipped)\n`)
    }
  }

  console.log(`
Sync complete. Run \`npm run dev\` to verify everything looks right.
Your pages in src/app/ were not touched.
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
