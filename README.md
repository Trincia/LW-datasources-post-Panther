# Databricks UI Starter Kit

Vibe coding Databricks UIs. Next.js + shadcn/ui pre-configured with the **DuBois design system** — so you never have to rebuild the shell, tokens, or components from scratch.

---

## What is this?

A ready-to-clone frontend starter for PMs, designers, and engineers building **Databricks internal tools or prototypes**. It includes:

- The full **DuBois design system** applied to shadcn/ui (colors, typography, spacing, radius)
- A working **app shell** — TopBar, collapsible Sidebar, page routing
- **445 Databricks-specific icons** extracted from the DuBois Figma
- A live **component reference** at `/design-system`
- Example pages you can fork and iterate on

The goal: open the repo, run it, describe what you want to Claude Code, and get on-brand Databricks UI without fighting design tokens.

---

## Quick start

```bash
git clone https://github.com/gioa/db-starter-kit.git
cd db-starter-kit
pnpm install
pnpm dev
```

| Route | What you'll see |
|---|---|
| [`/`](http://localhost:3000) | Landing page |
| [`/workspace`](http://localhost:3000/workspace) | App shell demo — workspace home |
| [`/jobs`](http://localhost:3000/jobs) | Jobs & Pipelines page example |
| [`/compute`](http://localhost:3000/compute) | Compute clusters page example |
| [`/dashboards`](http://localhost:3000/dashboards) | Dashboards card grid example |
| [`/catalog`](http://localhost:3000/catalog) | Table detail: columns, lineage, metadata sidebar |
| [`/sql`](http://localhost:3000/sql) | SQL editor: multi-tab, query tree, output panel |
| [`/design-system`](http://localhost:3000/design-system) | Full component reference |

---

## How to build new pages with Claude Code

1. **Clone and run** the repo locally
2. **Open Claude Code** inside the project directory (`claude` in your terminal)
3. The `CLAUDE.md` file is loaded automatically — Claude knows the DuBois rules
4. **Describe the page** you want to build

**Example prompts:**
```
"Build a Clusters page with a data table, status badges, and a Create cluster button"
"Create a Catalog explorer with a sidebar tree and a detail panel on the right"
"Add a SQL editor page with a query input, run button, and results table below"
"Build a Model serving page with endpoint cards and latency metrics"
"Create a Settings page with grouped form sections, toggles, and a save button"
```

Claude will use the existing `AppShell`, `PageHeader`, `Breadcrumb`, `Button`, `Table`, `Badge`, and other DuBois-themed components automatically.

---

## What's included

### App shell

```tsx
import { AppShell, PageHeader } from "@/components/shell"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export default function MyPage() {
  return (
    <AppShell activeItem="catalog" workspace="Production">
      <div className="p-6">
        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/shell">Workspace</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Catalog</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title="main"
          actions={<Button size="sm">Create table</Button>}
        />
        {/* your page content */}
      </div>
    </AppShell>
  )
}
```

### DuBois-themed shadcn/ui components

| Component | DuBois override |
|---|---|
| `Button` | 4px radius · `sm` 32px (default) · `xs` 24px · `icon-sm` / `icon-xs` |
| `Input` / `Select` | 32px height · 4px radius · inset focus ring |
| `Badge` | Rectangular · 9 secondary palette variants (`coral` `teal` `indigo` `lime` …) |
| `Alert` | Full border + tinted background · 4 severity variants |
| `Dialog` | 40px padding · no dividers · `DialogBody` slot |
| `Tabs` | `variant="line"` for DuBois underline style |
| `Tooltip` | Dark background in light mode |
| `Card` | 8px radius · subtle shadow |
| `Breadcrumb` | `text-primary` links · muted separator |

### 445 DuBois icons

```tsx
// Databricks-specific icons
import { NotebookIcon, CatalogIcon, PipelineIcon, WorkflowsIcon } from "@/components/icons"
<CatalogIcon size={16} />

// AI gradient icon
import { DbIcon } from "@/components/ui/db-icon"
import { SparkleIcon } from "@/components/icons"
<DbIcon icon={SparkleIcon} color="ai" size={16} />
```

### Adding a page to the sidebar nav

In `src/components/shell/Sidebar.tsx`, add an `href` to any nav item:

```ts
{ id: "catalog", label: "Catalog", icon: CatalogIcon, href: "/catalog" }
```

Then create `src/app/catalog/page.tsx` with `activeItem="catalog"` passed to `AppShell`.

### AI right-side panel

`GenieCodePanel` is a right-side AI assistant panel toggled by the TopBar sparkle button. It's already wired into `AppShell` — `genieOpen` state is owned by the shell and adjusts the main content margin automatically. Import and use `SuggestionPill` for prompt chips with the speech-bubble pointer style and AI gradient hover.

---

## Design system rules (always enforced via `CLAUDE.md`)

| Rule | Value |
|---|---|
| Base font | SF Pro (macOS/iOS) · system sans on other platforms · 13px · 20px line-height |
| Bold weight | `font-semibold` (600) — never `font-bold` (700) |
| Button/input radius | `rounded` (4px) |
| Card/modal radius | `rounded-md` (8px) |
| Primary color | `bg-primary` → `#2272B4` |
| Spacing unit | 8px — `gap-2` · `gap-4` · `gap-6` · `gap-8` |
| Colors | CSS variables only — never raw hex |

---

## Project structure

```
src/
├── app/
│   ├── globals.css           ← DuBois theme (Tailwind v4 @theme)
│   ├── layout.tsx            ← ThemeProvider + TooltipProvider
│   ├── page.tsx              ← Landing page
│   └── (demo)/               ← Demo pages (delete this folder to start fresh)
│       ├── workspace/        ← Workspace home (/workspace)
│       ├── jobs/             ← Jobs & Pipelines (/jobs)
│       ├── compute/          ← Compute clusters (/compute)
│       ├── dashboards/       ← Dashboards (/dashboards)
│       ├── catalog/          ← Table detail (/catalog)
│       ├── sql/              ← SQL editor (/sql)
│       └── design-system/    ← Component reference (/design-system)
├── components/
│   ├── ui/                   ← shadcn/ui components (DuBois-overridden)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── db-icon.tsx       ← Unified icon wrapper (use color="ai" for gradient)
│   │   ├── suggestion-pill.tsx ← AI prompt chip with pointer corner + gradient hover
│   │   └── ...
│   ├── icons/                ← 445 DuBois SVG components
│   └── shell/
│       ├── AppShell.tsx      ← Layout wrapper (owns sidebar + genie panel state)
│       ├── TopBar.tsx        ← 48px top navigation bar
│       ├── Sidebar.tsx       ← Collapsible left nav (add href to link pages)
│       ├── GenieCodePanel.tsx ← Right-side AI assistant panel
│       ├── NewButton.tsx     ← Brand-tinted "+ New" button
│       ├── PageHeader.tsx    ← Page header: breadcrumbs + title + actions
│       ├── DatabricksLogo.tsx
│       └── index.ts
├── scripts/
│   └── sync-icons.mjs        ← Re-sync icons from DuBois source
└── lib/utils.ts
```

---

## Figma writeback

Sync your code changes back to Figma as real component instances using the `figma-match-code` skill. Import the **"Databricks UI starter kit"** Figma library into your file first, then describe what you want to Claude Code:

```
"Create a Figma component for the GenieCodePanel in the Shell page"
"Rebuild the /jobs Figma frame to match the current code"
```

See [`docs/getting-started.md`](docs/getting-started.md#3-writing-designs-back-to-figma) for the full workflow.

---

## Dark mode

All DuBois tokens are defined for both light and dark in `globals.css`. Toggle with the sun/moon icon on the design system page.

---

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (CSS-first config in `globals.css`, no `tailwind.config.ts`)
- **shadcn/ui** (New York style, DuBois-overridden)
- **next-themes** (dark mode)
- **Radix UI** primitives via shadcn
- **Claude Code** + `CLAUDE.md` + DuBois skill for AI-assisted page building
