# CLAUDE.md — Databricks Designer Starter Kit

You are building UI for a **Databricks internal tool** using this Next.js + shadcn/ui starter kit.
The DuBois design system rules below are **always active** — apply them to every component you generate.

---

## Code Quality

- After editing any TypeScript file, run `tsc --noEmit` (or the project's typecheck command) to verify no type errors were introduced. Do not commit until the check passes.

## Environment

- Before running `npm install` or `yarn install`, check if network access is restricted. If installs fail with registry errors, stop retrying and ask the user to run the install manually or provide proxy config.

## Local Development

- Before starting a dev server, check for existing processes on the target port (`lsof -i :<port>`) and kill them if needed. Always report the correct localhost URL to the user.

## UI Development

- Prefer established component library patterns (e.g., shadcn `Sheet` for mobile drawers, DuBois design system tokens) over custom CSS hacks. Ask the user which pattern to use if unsure.
- **Never use raw `<button>`, `<a>`, or `<div onClick>` in page files.** Always use `Button` or a named pattern component from `@/components/ui` or `@/components/shell`.
- Icon-only interactive elements: always `Button variant="ghost" size="icon-xs"` or `size="icon-sm"`.
- **Never nest a `<Button>` or `<button>` inside another `<button>` or clickable container that renders as a button** — this is invalid HTML and causes a React hydration error. When a clickable row/tab needs an inner action (e.g. close button), make the outer container a `<div role="tab" onClick>` with `cursor-pointer`, and keep the inner action as a `<button>` or `<Button>`.
- Every new visual pattern that appears 2+ times across pages must become a named component with a matching Figma component and Code Connect mapping before it ships.

## Figma Component Creation

**Always** use existing design system resources — never hardcode raw values or draw placeholder shapes when a proper token/style/component exists.

- **Variables (colors, spacing, radii)** — bind via `figma.variables.importVariableByKeyAsync`. Use `search_design_system` with `includeVariables: true` to discover available variables. Never pass raw hex colors or pixel numbers as fill/stroke values.
- **Typography** — apply existing text styles via `importStyleByKeyAsync`. Never set `fontName`, `fontSize`, or `lineHeight` manually.
- **Icons** — always import and instantiate the actual icon component (`importComponentByKeyAsync`) instead of drawing a placeholder frame or square. Find the icon key by searching the Icons page before writing any icon-related code.
- **Primitive components** — import and instantiate existing components (`importComponentByKeyAsync` / `importComponentSetByKeyAsync`) instead of recreating shapes. Inspect existing screens first to discover what's available.

Violation examples (never do these):
- `fills = [{ type: "SOLID", color: { r: 34/255, g: 114/255, b: 180/255 } }]` → use a variable instead
- `fontSize = 13` → apply a text style instead
- Drawing a 14×14 frame as an icon placeholder → import the real icon component

## Code Editing Principles

- Make targeted edits to specific cells/sections only. Never rewrite an entire file when only a small change is requested.

---

## DuBois Design System Rules

### Typography
- Base font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif` (resolves to SF Pro on macOS/iOS). **In Figma, use "SF Pro" — never Inter.**
- Base size: **13px** — already set on `body` in `globals.css`. Do not set `font-size` on `html`.
- Bold weight: **`font-semibold` (600)** — never use `font-bold` (700)
- Line height base: 20px
- Hint/helper text: **12px / 16px** — use `text-hint` class. System font (same as body). In Figma: `body/hint` style (SF Pro Regular 12px/16px).
- **Never hardcode font sizes, colors, or spacing** — always use Tailwind utilities (`text-hint`, `text-foreground`, `gap-2`) and CSS variables. In Figma, always bind to text styles and variable tokens.

### Sizing & Spacing
- Spacing grid: **8px base unit** — use `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- Button heights: **32px** (sm `h-8`, default), **24px** (xs `h-6`) — no 40px size in DuBois
- Input/Select height: **32px** (`h-8`)

### Border Radius
- Buttons, inputs, badges, dropdowns: **`rounded`** (4px)
- Cards, modals, panels: **`rounded-md`** (8px)
- Never use `rounded-lg` or `rounded-xl` for interactive elements

### Colors — always use CSS variables, never raw hex
| Element | Class | Value |
|---|---|---|
| Primary action | `bg-primary` / `text-primary` | blue-600 #2272B4 |
| Primary hover | `hover:bg-blue-700` | #0E538B |
| Body text | `text-foreground` | grey-800 #11171C |
| Secondary text | `text-muted-foreground` | grey-500 #5F7281 |
| Page background | `bg-background` | white / grey-800 dark |
| Subtle background | `bg-secondary` / `bg-muted` | grey-050 #F6F7F9 |
| Borders | `border-border` | grey-100 #E8ECF0 |
| Danger | `bg-destructive` / `text-destructive` | red-600 #C82D4C |
| Success | `text-[var(--success)]` | green-600 #277C43 |
| Warning | `text-[var(--warning)]` | yellow-600 #BE501E |

### List & Table Text Colors — common mistake
- **Data cell content** (dates, types, statuses, numeric values, names): always `text-foreground`
- **Secondary annotations** (namespace paths, descriptions, sub-labels below a primary value): `text-muted-foreground`
- **Never** use `text-muted-foreground` for a standalone data column — if it's a data value the user needs to read, it's `text-foreground`
- Examples: timestamp column → `text-foreground` · type badge label → `text-foreground` · path below item name → `text-muted-foreground` · column header → `text-foreground font-semibold`

### Component Overrides Already Applied
These shadcn components have DuBois overrides — use them as-is:
- **`Button`** — 4px radius, sizes: `sm` 32px (default) · `xs` 24px · `icon-sm` 32px · `icon-xs` 24px, semibold, variants: `primary` `default` `ghost` `destructive` `link`
- **`Input`** — 32px height (`h-8`), 4px radius, inset focus ring (no offset)
- **`Select`** / **`SelectTrigger`** — 32px height (`h-8`), 4px radius, no size variants
- **`Badge`** — rectangular (4px radius), variants: `default` `secondary` `destructive` `default_tag` `charcoal` `coral` `brown` `indigo` `lemon` `lime` `pink` `purple` `teal` `turquoise`
- **`Dialog`** / **`DialogHeader`** / **`DialogFooter`** / **`DialogBody`** — 40px padding, no dividers
- **`Table`** / **`TableRow`** — DuBois hover/selected row colors
- **`Alert`** — variants: `default` `info` `warning` `success` `destructive` — full border with light tinted bg, 4px radius. CSS tokens: `--border-danger` `--border-warning` `--border-success` `--background-danger` `--background-warning` `--background-success`
- **`Tabs`** / **`TabsList`** — use `variant="line"` for DuBois underline style
- **`Tooltip`** — grey-800 background (dark in light mode)
- **`Card`** — 8px radius, subtle shadow
- **`Breadcrumb`** — `BreadcrumbLink` uses `text-primary` · `BreadcrumbPage` uses `text-muted-foreground` · separator is ChevronRight at `size-3`
- **`SegmentedControl`** / **`SegmentedItem`** — segmented toggle button group. `value`+`onValueChange` on root; each `SegmentedItem` takes a `value`. Active item: `bg-primary/5 border-primary text-primary font-semibold`. Import from `@/components/ui/segmented-control`.
- **`ListItem`** — selectable panel row (32px). Props: `selected` `icon` `actions` `onClick`. Active: `bg-primary/10 text-primary`. Actions hidden until hover/selected. Import from `@/components/ui/list-item`.

### Icons
- **Generic icons** → `lucide-react`, always `className="h-4 w-4"` (16px)
- **Databricks-specific icons** → `@/components/icons` (**445 DuBois icons**)
- **AI gradient icons** → `<DbIcon icon={SparkleIcon} color="ai" size={16} />` from `@/components/ui/db-icon`
- **Icon color in shell/UI chrome** → always `text-muted-foreground` (grey-500) unless active/primary
- **Genie / AI Assistant nav item** → use `AssistantIcon`, never the colored sparkle variant

Key Databricks icons available:
`NotebookIcon` `CatalogIcon` `PipelineIcon` `WorkflowsIcon` `SchemaIcon`
`AssistantIcon` `ModelsIcon` `SparkleDoubleFillIcon` `SparkleFillIcon`
`BranchIcon` `QueryEditorIcon` `WorkspacesIcon` `DataIcon` `ErdIcon`
`SidebarCollapseIcon` `SidebarExpandIcon` `AppIcon` `StorefrontIcon`

### AI Gradient
```css
background: linear-gradient(135deg, #4299E0 20.5%, #CA42E0 46.91%, #FF5F46 79.5%);
```
- Use `className="bg-ai-gradient"` for gradient backgrounds
- Use `className="text-ai-gradient"` for gradient text
- Use `<DbIcon icon={SparkleIcon} color="ai" size={16} />` for AI icons

### Do's and Don'ts
✅ Use semantic CSS variables (`text-foreground`, `bg-primary`, `border-border`)
✅ Use `font-semibold` for emphasis
✅ Use `rounded` (4px) for interactive elements
✅ Use DuBois icons from `@/components/icons` for Databricks concepts
✅ Support dark mode — all tokens are already defined in `globals.css`

❌ Never hardcode hex colors
❌ Never use `font-bold` (700) — use `font-semibold` (600)
❌ Never use `rounded-lg` for buttons/inputs
❌ Never use Databricks brand orange (`#FF3621`) for UI — it's marketing only
❌ Never set `font-size` on `html` element (breaks Tailwind rem scale)

---

## Project Structure

```
src/
├── app/
│   ├── globals.css           ← DuBois theme (Tailwind v4 @theme)
│   ├── layout.tsx            ← ThemeProvider + TooltipProvider
│   ├── page.tsx              ← Home
│   ├── shell/                ← Full shell demo at /shell
│   └── design-system/        ← Component reference at /design-system
├── components/
│   ├── ui/                   ← shadcn components (DuBois-overridden)
│   │   └── db-icon.tsx       ← DbIcon wrapper for Lucide + DuBois icons
│   ├── icons/                ← 445 DuBois SVG components + index.ts
│   ├── shell/
│   │   ├── AppShell.tsx      ← Layout wrapper (owns sidebar open/close state)
│   │   ├── TopBar.tsx        ← 48px top navigation bar
│   │   ├── Sidebar.tsx       ← Collapsible left nav (200px / hidden)
│   │   ├── NewButton.tsx     ← Brand-tinted "+ New" sidebar button (32px, rounded-md)
│   │   ├── PageHeader.tsx    ← Page-level header: breadcrumbs + title + actions
│   │   ├── DatabricksLogo.tsx← SVG lockup, dark-mode aware
│   │   └── index.ts          ← Barrel export
│   └── theme-toggle.tsx
├── scripts/
│   └── sync-icons.mjs        ← Bulk icon sync from DuBois source
└── lib/utils.ts
```

---

## Shell Architecture

### AppShell
Wraps every page. Owns sidebar collapsed/expanded state.

```tsx
import { AppShell } from "@/components/shell"

<AppShell activeItem="workspace" workspace="Production" userInitial="N">
  {/* page content */}
</AppShell>
```

Props: `activeItem` `onNavigate` `workspace` `userInitial`

### Layout rules
| Zone | Background | Notes |
|---|---|---|
| Full shell (outer) | `bg-secondary` | grey-050 — TopBar + Sidebar blend in, no dividing borders |
| TopBar | `bg-secondary` | No `border-b` |
| Sidebar | `bg-secondary` | No `border-r` |
| Main content | `bg-background` + `border border-border` + `rounded-md` | White card · `mb-2 mr-2` · `ml-2` added when sidebar is closed |

### TopBar rules
- Height: `h-12` (48px)
- Logo: `<DatabricksLogo height={18} />` — brickwork `#FF3621`, wordmark `currentColor` (dark-mode aware)
- Search: `h-8 rounded bg-background border-border` (white on grey topbar), `⌘P` kbd hint
- All chrome icons: `text-muted-foreground` — sidebar toggle, AppIcon
- App switcher: `AppIcon` from `@/components/icons` (never `CustomAppIcon` or lucide `LayoutGrid`)
- AI button: `<DbIcon icon={SparkleIcon} color="ai" size={16} />` — always AI gradient, not muted

### Sidebar rules
- Width: `w-[200px]` expanded / `w-0 overflow-hidden` collapsed (fully hidden, never icon-only)
- When collapsed, main content gets `ml-2` for equal left/right spacing (both 8px)
- `+ New` button: `NewButton` component — `h-8` (32px), `rounded-md` (8px), brand-red tint `rgba(255,54,33,…)`
- NewButton and nav scroll together in a single `overflow-y-auto` container
- Active nav item: `bg-primary/10 text-primary font-semibold`
- Inactive nav item: `text-foreground hover:bg-muted-foreground/10`
- Section labels: `text-xs font-normal text-muted-foreground` — collapsible, ChevronRight next to label
- Chevron: `opacity-0` when expanded (shows on `group-hover`), `opacity-100` when collapsed, `rotate-90` when expanded

### Nav sections
| Section | Items |
|---|---|
| (top, unlabelled) | Workspace · Recents · Catalog · Workflows · Compute · Marketplace |
| SQL | SQL Editor · Queries · Dashboards · Genie · Alerts · Query History · SQL Warehouses |
| Data Engineering | Job Runs · Data Ingestion · Pipelines |
| Machine Learning | Playground · Experiments · Features · Models · Serving |

### PageHeader
Page-level header. Place at the top of page content, inside `p-6`.

```tsx
import { PageHeader } from "@/components/shell"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

<PageHeader
  breadcrumbs={
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="#">Workspace</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Catalog</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  }
  title="main"
  titleIcons={
    <Button variant="ghost" size="icon-xs" aria-label="Copy link">
      <Copy className="h-4 w-4" />
    </Button>
  }
  badge={<Badge variant="purple">Preview</Badge>}
  description="Unity Catalog schema in the production metastore."
  actions={
    <>
      <Button variant="ghost" size="icon-xs"><MoreVertical className="h-4 w-4" /></Button>
      <Button variant="default" size="sm">Share</Button>
      <Button size="sm">Create table</Button>
    </>
  }
/>
```

Props: `breadcrumbs` `title` `avatar` `titleIcons` `badge` `description` `actions` `className`

---

## Tailwind v4 Notes
- No `tailwind.config.ts` — all theme config is in `globals.css`
- DuBois primitive colors are Tailwind utilities: `bg-blue-600`, `text-grey-800`, etc.
- DuBois secondary badge colors: `bg-coral-100`, `text-teal-700`, etc.
- Custom shadows: `shadow-[var(--shadow-db-sm)]`, `shadow-[var(--shadow-db-lg)]`

---

## Sync / Migration Notes

When a user runs `sync.mjs` to pull component updates from this starter kit into an existing project, watch for these breaking changes and offer to apply the find-replace automatically.

### Button variant rename (breaking)
The DuBois Button diverges from shadcn defaults. If syncing `button.tsx` into a project that used the old shadcn names, every callsite must be updated:

| Old (shadcn / pre-DuBois) | New (DuBois) | Visual result |
|---|---|---|
| `variant="default"` | `variant="primary"` | Filled blue button |
| `variant="outline"` | `variant="default"` | Bordered button |
| `variant="secondary"` | _(removed)_ | No DuBois equivalent — use `variant="default"` |

**How to fix:** Run a project-wide search and replace in the consuming repo:
1. `variant="default"` → `variant="primary"` (filled blue, primary action)
2. `variant="outline"` → `variant="default"` (bordered, secondary action)
3. `variant="secondary"` → `variant="default"` (closest equivalent)

Also check `buttonVariants({ variant: "default" })` and `buttonVariants({ variant: "outline" })` calls in utility helpers.

### Badge variant removals (breaking)
`outline`, `ghost`, and `link` variants were removed from `Badge` — they are not part of the DuBois tag spec. Replace any usage with a valid tag variant (`default_tag`, `charcoal`, `coral`, etc.) or a semantic variant (`default`, `secondary`, `destructive`).
