/**
 * npm run setup — scaffold a new prototype page
 *
 * Prompts for a Databricks surface and feature name, then writes
 * src/app/page.tsx as a clean starting point. Run once after cloning.
 *
 * Usage:
 *   npm run setup
 */

import fs from "fs"
import path from "path"
import readline from "readline"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const SURFACES = [
  { id: "workspace",   label: "Workspace" },
  { id: "catalog",     label: "Catalog" },
  { id: "workflows",   label: "Workflows / Jobs" },
  { id: "compute",     label: "Compute" },
  { id: "sql-editor",  label: "SQL Editor" },
  { id: "dashboards",  label: "Dashboards" },
  { id: "pipelines",   label: "Pipelines" },
  { id: "playground",  label: "Playground (ML)" },
  { id: "experiments", label: "Experiments" },
  { id: "serving",     label: "Model Serving" },
  { id: "blank",       label: "Blank (no active nav)" },
]

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((res) => rl.question(q, res))

function slugToTitle(slug) {
  return slug
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function generatePage(surfaceId, featureName, userInitial) {
  const activeItem = surfaceId === "blank" ? "" : surfaceId
  const activeItemProp = activeItem ? ` activeItem="${activeItem}"` : ""
  const title = slugToTitle(featureName)

  return `"use client"

import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <AppShell${activeItemProp} workspace="My Workspace" userInitial="${userInitial.toUpperCase()}">
      <div className="flex flex-col gap-4 p-6">
        <PageHeader
          title="${title}"
          description="Describe what this page does."
          actions={<Button size="sm">Create</Button>}
        />
        {/* Build your UI here */}
      </div>
    </AppShell>
  )
}
`
}

async function main() {
  console.log("\nDatabricks UI Starter Kit — setup\n")

  // Surface
  console.log("Which surface are you prototyping?\n")
  SURFACES.forEach((s, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${s.label}`)
  })
  console.log()

  let surfaceIndex
  while (true) {
    const raw = await ask(`Surface [1-${SURFACES.length}]: `)
    const n = parseInt(raw.trim(), 10)
    if (n >= 1 && n <= SURFACES.length) {
      surfaceIndex = n - 1
      break
    }
    console.log(`  Enter a number between 1 and ${SURFACES.length}.`)
  }
  const surface = SURFACES[surfaceIndex]

  // Feature name
  const rawName = await ask("Feature name (e.g. Data Quality Monitor): ")
  const featureName = rawName.trim() || "My Feature"

  // User initial
  const rawInitial = await ask("Your initial for the avatar [A]: ")
  const userInitial = rawInitial.trim().charAt(0) || "A"

  rl.close()

  // Write page.tsx
  const pagePath = path.join(ROOT, "src", "app", "page.tsx")
  const content = generatePage(surface.id, featureName, userInitial)
  fs.writeFileSync(pagePath, content)

  console.log(`
✓  src/app/page.tsx written
   Surface:  ${surface.label}
   Feature:  ${slugToTitle(featureName)}

Next steps:
  npm run dev   → http://localhost:3000
  Open Claude Code and start building.
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
