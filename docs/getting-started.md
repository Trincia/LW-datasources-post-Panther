# Getting Started

## New project

**1. Use this template**
Click **"Use this template"** on GitHub (not "Fork"). This gives you a clean repo with no git history.

**2. Clone and run setup**
```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO
pnpm install
pnpm setup
```
`setup` asks which Databricks surface you're prototyping and your feature name, then writes a clean `src/app/page.tsx`. No demo cleanup needed.

**3. Start building**
```bash
pnpm dev   # http://localhost:3000
claude        # CLAUDE.md loads automatically — DuBois rules are already wired
```

---

## Update an existing project

```bash
pnpm sync
```

Pulls the latest DuBois tokens, components, and icons from the upstream kit. Shows a diff of what changed and asks before applying. Never touches `src/app/` (your pages).

---

## Demo pages

Browse these at `http://localhost:3000` to see working patterns:

| Route | Pattern |
|---|---|
| `/workspace` | Sidebar tree nav + notebook editor |
| `/jobs` | Tabs + filter bar + table + pagination |
| `/dashboards` | Card grid + detail panel |
| `/compute` | Tabs + filter selects + table |
| `/catalog` | Table detail: columns, lineage, metadata sidebar |
| `/sql` | Multi-tab SQL editor + query tree + output panel |
| `/design-system` | All components, tokens, and icons |

---

## Writing designs back to Figma

In Claude Code, describe the frame you want:

```
"Create a Figma component for the PageHeader on /jobs"
"Sync the /catalog Figma frame to match the current code"
```

Claude uses the `figma-match-code` skill to import real component instances and bind design token variables. Prerequisites: enable the **"Databricks UI starter kit"** library in Figma (Assets → Libraries, file key `KHFOMM4oUyT9XgeeXpbzns`) and connect the Figma MCP server.

Reference docs in `.claude-plugin/skills/figma-match-code/references/` and component/variable keys in `docs/figma-node-map.md`.

---

## Contributing a demo page

1. Build in `src/app/(demo)/your-page/page.tsx` using `AppShell` + `PageHeader`
2. Add an `href` to the nav item in `src/components/shell/Sidebar.tsx`
3. Add a row to the demos table in `src/app/page.tsx`
4. Open a PR against `gioa/db-starter-kit`

---

## Syncing icons from DuBois source (internal only)

```bash
SRC_DIR=/path/to/universe/design-system/src/design-system/Icon/__generated/icons \
node scripts/sync-icons.mjs
```
