---
name: Databricks DuBois
description: >
  The Databricks design system for internal product UI. A compact,
  information-dense enterprise design language built on an 8px grid,
  a blue primary action palette, and warm neutral surfaces. Named after
  W.E.B. Du Bois, honoring his pioneering data visualization work.

colors:
  # ── Semantic tokens (light mode) ──────────────────────────────────────
  background: "#ffffff"
  foreground: "#161616"
  primary: "#2272b4"
  primary-foreground: "#ffffff"
  primary-hover: "#0e538b"
  primary-press: "#04355d"
  secondary: "#f7f7f7"
  secondary-foreground: "#161616"
  muted: "#f7f7f7"
  muted-foreground: "#6f6f6f"
  accent: "#f7f7f7"
  accent-foreground: "#161616"
  border: "#ebebeb"
  input: "#cbcbcb"
  ring: "#2272b4"
  destructive: "#c82d4c"
  destructive-hover: "#9e102c"
  warning: "#be501e"
  success: "#277c43"
  card: "#ffffff"
  card-foreground: "#161616"
  popover: "#ffffff"
  popover-foreground: "#161616"
  overlay: "rgba(0, 0, 0, 0.26)"
  skeleton: "rgba(162, 162, 162, 0.16)"
  code-background: "rgba(82, 82, 82, 0.08)"
  star: "#facb66"

  # ── Alert / validation tinted borders and surfaces ────────────────────
  border-danger: "#fbd0d8"
  border-warning: "#f8d4a5"
  border-success: "#a3d9b6"
  border-info: "#bae1fc"
  background-danger: "#fff5f7"
  background-warning: "#fff9eb"
  background-success: "#f3fcf6"
  background-info: "#f0f8ff"

  # ── Brand ─────────────────────────────────────────────────────────────
  brand-red: "#ff3621"

  # ── AI gradient (135deg, start → mid → end) ───────────────────────────
  ai-gradient-start: "#4299e0"
  ai-gradient-mid: "#ca42e0"
  ai-gradient-end: "#ff5f46"
  ai-gradient: "linear-gradient(135deg, #4299e0 20.5%, #ca42e0 46.91%, #ff5f46 79.5%)"

  # ── Interaction state tints ───────────────────────────────────────────
  action-default-bg-hover: "rgba(34, 114, 180, 0.08)"
  action-default-bg-press: "rgba(34, 114, 180, 0.16)"
  action-danger-bg-hover: "rgba(200, 45, 76, 0.08)"
  action-danger-bg-press: "rgba(200, 45, 76, 0.16)"

  # ── Table row states ──────────────────────────────────────────────────
  table-row-hover: "rgba(82, 82, 82, 0.04)"
  table-row-selected: "rgba(82, 82, 82, 0.08)"
  table-row-selected-hover: "rgba(82, 82, 82, 0.12)"

  # ── NewButton brand tints ─────────────────────────────────────────────
  newbutton-bg: "rgba(255, 54, 33, 0.08)"
  newbutton-border: "rgba(255, 54, 33, 0.12)"

  # ── Primitive palette — Blue ──────────────────────────────────────────
  blue-100: "#f0f8ff"
  blue-200: "#d7edfe"
  blue-300: "#bae1fc"
  blue-400: "#8acaff"
  blue-500: "#4299e0"
  blue-600: "#2272b4"
  blue-700: "#0e538b"
  blue-800: "#04355d"

  # ── Primitive palette — Neutral (warm grey, light mode) ───────────────
  neutral-050: "#f7f7f7"
  neutral-100: "#ebebeb"
  neutral-200: "#d8d8d8"
  neutral-300: "#cbcbcb"
  neutral-350: "#a2a2a2"
  neutral-400: "#939393"
  neutral-500: "#6f6f6f"
  neutral-600: "#525252"
  neutral-650: "#424242"
  neutral-700: "#262626"
  neutral-800: "#161616"

  # ── Primitive palette — Grey (blue-tinted, dark mode semantics) ───────
  grey-050: "#f6f7f9"
  grey-100: "#e8ecf0"
  grey-200: "#d1d9e1"
  grey-300: "#c0cdd8"
  grey-350: "#92a4b3"
  grey-400: "#8396a5"
  grey-500: "#5f7281"
  grey-600: "#445461"
  grey-650: "#37444f"
  grey-700: "#1f272d"
  grey-800: "#11171c"

  # ── Primitive palette — Red ───────────────────────────────────────────
  red-100: "#fff5f7"
  red-200: "#fde2e8"
  red-300: "#fbd0d8"
  red-400: "#f792a6"
  red-500: "#e65b77"
  red-600: "#c82d4c"
  red-700: "#9e102c"
  red-800: "#630316"

  # ── Primitive palette — Green ─────────────────────────────────────────
  green-100: "#f3fcf6"
  green-200: "#d4f7df"
  green-300: "#b1ecc5"
  green-400: "#8ddda8"
  green-500: "#3ba65e"
  green-600: "#277c43"
  green-700: "#115026"
  green-800: "#093919"

  # ── Primitive palette — Yellow/Amber ──────────────────────────────────
  yellow-100: "#fff9eb"
  yellow-200: "#fceaca"
  yellow-300: "#f8d4a5"
  yellow-400: "#f2be88"
  yellow-500: "#de7921"
  yellow-600: "#be501e"
  yellow-700: "#93320b"
  yellow-800: "#5f1b02"

  # ── Categorical tag/badge palette primitives ──────────────────────────
  coral-100: "#fdece9"
  coral-500: "#e86247"
  coral-700: "#c0411e"
  brown-100: "#f3ece6"
  brown-500: "#a0694a"
  brown-700: "#7a4930"
  indigo-100: "#ebf0fd"
  indigo-500: "#5b7be8"
  indigo-700: "#3557c7"
  lemon-100: "#fdf9e6"
  lemon-500: "#d4a800"
  lemon-700: "#9c7c00"
  lime-100: "#eef9e6"
  lime-500: "#6cbf3c"
  lime-700: "#4a8c22"
  pink-100: "#fde8f8"
  pink-500: "#d966c5"
  pink-700: "#b03ea0"
  purple-100: "#f0eafd"
  purple-500: "#9b6ae8"
  purple-700: "#7040c8"
  teal-100: "#e5f7f5"
  teal-500: "#2db0a0"
  teal-700: "#1a8578"
  turquoise-100: "#e5f8fb"
  turquoise-500: "#22b8cf"
  turquoise-700: "#138b9e"

  # ── Semantic tag background tokens (light / dark) ─────────────────────
  # Background: low-opacity RGBA of the hue's dominant color
  # Text: dark legible shade for light mode, light tint for dark mode
  tag-bg-lemon-light:      "rgba(255, 191, 1, 0.18)"
  tag-bg-lemon-dark:       "rgba(255, 191, 1, 0.18)"
  tag-text-lemon-light:    "#4f3422"
  tag-text-lemon-dark:     "#ffe7b3"
  tag-bg-lime-light:       "rgba(2, 179, 2, 0.08)"
  tag-bg-lime-dark:        "rgba(2, 179, 2, 0.08)"
  tag-text-lime-light:     "#203c25"
  tag-text-lime-dark:      "#c2f0c2"
  tag-bg-teal-light:       "rgba(2, 192, 150, 0.09)"
  tag-bg-teal-dark:        "rgba(2, 192, 150, 0.12)"
  tag-text-teal-light:     "#0d3d38"
  tag-text-teal-dark:      "#adf0dd"
  tag-bg-turquoise-light:  "rgba(2, 192, 213, 0.09)"
  tag-bg-turquoise-dark:   "rgba(2, 192, 213, 0.12)"
  tag-text-turquoise-light: "#0d3c48"
  tag-text-turquoise-dark:  "#b6ecf7"
  tag-bg-indigo-light:     "rgba(1, 68, 255, 0.06)"
  tag-bg-indigo-dark:      "rgba(1, 68, 255, 0.12)"
  tag-text-indigo-light:   "#101d46"
  tag-text-indigo-dark:    "#dddffe"
  tag-bg-purple-light:     "rgba(59, 0, 255, 0.05)"
  tag-bg-purple-dark:      "rgba(59, 0, 255, 0.12)"
  tag-text-purple-light:   "#2f265f"
  tag-text-purple-dark:    "#e2ddfe"
  tag-bg-pink-light:       "rgba(240, 1, 150, 0.06)"
  tag-bg-pink-dark:        "rgba(240, 1, 150, 0.12)"
  tag-text-pink-light:     "#651249"
  tag-text-pink-dark:      "#fdd1ea"
  tag-bg-coral-light:      "rgba(240, 0, 64, 0.06)"
  tag-bg-coral-dark:       "rgba(240, 0, 64, 0.10)"
  tag-text-coral-light:    "#64172b"
  tag-text-coral-dark:     "#fed2e1"
  tag-bg-brown-light:      "rgba(171, 86, 2, 0.08)"
  tag-bg-brown-dark:       "rgba(171, 86, 2, 0.10)"
  tag-text-brown-light:    "#3e332e"
  tag-text-brown-dark:     "#f2e1ca"

typography:
  font-family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"
  font-family-figma: "SF Pro"
  font-family-mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  font-family-mono-figma: "SF Mono"
  font-smoothing: antialiased
  bold-weight: 600

  base:
    fontSize: "13px"
    lineHeight: "20px"
    fontWeight: 400
  hint:
    fontSize: "12px"
    lineHeight: "16px"
    fontWeight: 400
  h1:
    fontSize: "32px"
    lineHeight: "40px"
    fontWeight: 600
  h2:
    fontSize: "22px"
    lineHeight: "28px"
    fontWeight: 600
  h3:
    fontSize: "18px"
    lineHeight: "24px"
    fontWeight: 600
  h4:
    fontSize: "15px"
    lineHeight: "20px"
    fontWeight: 600
  h5:
    fontSize: "13px"
    lineHeight: "20px"
    fontWeight: 600
  h6:
    fontSize: "12px"
    lineHeight: "16px"
    fontWeight: 600
  code:
    fontSize: "13px"
    lineHeight: "20px"
    fontWeight: 500

spacing:
  base: "8px"
  0.5: "2px"
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"

radii:
  interactive: "4px"
  container: "8px"
  large: "12px"
  full: "9999px"

shadows:
  xs: "0px 1px 0px 0px rgba(0, 0, 0, 0.05)"
  sm: "0px 2px 3px -1px rgba(0, 0, 0, 0.05), 0px 1px 0px 0px rgba(0, 0, 0, 0.02)"
  md: "0px 3px 6px 0px rgba(0, 0, 0, 0.05)"
  lg: "0px 2px 16px 0px rgba(0, 0, 0, 0.08)"
  xl: "0px 8px 40px 0px rgba(0, 0, 0, 0.13)"

motion:
  duration-fast: "100ms"
  duration-default: "200ms"
  duration-slow: "300ms"
  easing-default: "ease"
  spinner: "steps(60, end)"

components:
  # ── Buttons ───────────────────────────────────────────────────────────
  # variant="primary" — filled blue, the default rendering
  button-primary:
    height: "32px"
    padding: "0 12px"
    fontSize: "13px"
    fontWeight: 600
    borderRadius: "4px"
    backgroundColor: "{colors.primary}"
    color: "{colors.primary-foreground}"
    hover-backgroundColor: "{colors.primary-hover}"

  # variant="default" — bordered/transparent, secondary action (e.g. Cancel, Share)
  button-default:
    height: "32px"
    padding: "0 12px"
    fontSize: "13px"
    fontWeight: 600
    borderRadius: "4px"
    backgroundColor: "transparent"
    borderColor: "{colors.input}"
    color: "{colors.foreground}"
    hover-backgroundColor: "{colors.action-default-bg-hover}"
    hover-borderColor: "{colors.primary}"
    hover-color: "{colors.primary-hover}"

  # variant="ghost" — no background, for icon-only toolbar actions and inline controls
  button-ghost:
    height: "32px"
    padding: "0 12px"
    fontSize: "13px"
    fontWeight: 600
    borderRadius: "4px"
    backgroundColor: "transparent"
    color: "{colors.foreground}"
    hover-backgroundColor: "{colors.action-default-bg-hover}"
    hover-color: "{colors.primary-hover}"

  # variant="destructive" — filled red, irreversible danger actions
  button-destructive:
    height: "32px"
    padding: "0 12px"
    fontSize: "13px"
    fontWeight: 600
    borderRadius: "4px"
    backgroundColor: "{colors.destructive}"
    color: "#ffffff"
    hover-backgroundColor: "{colors.destructive-hover}"

  button-xs:
    height: "24px"
    padding: "0 8px"
    gap: "4px"
    fontSize: "12px"
    fontWeight: 600
    borderRadius: "4px"

  button-icon-sm:
    height: "32px"
    width: "32px"
    borderRadius: "4px"

  button-icon-xs:
    height: "24px"
    width: "24px"
    borderRadius: "4px"

  button-disabled-opacity: 0.40

  # ── Input / Select ────────────────────────────────────────────────────
  input:
    height: "32px"
    padding: "0 8px"
    fontSize: "13px"
    borderRadius: "4px"
    borderColor: "{colors.input}"
    backgroundColor: "{colors.background}"
    focus-ring: "inset 0 0 0 2px {colors.ring}"

  select:
    height: "32px"
    fontSize: "13px"
    borderRadius: "4px"
    borderColor: "{colors.input}"

  # ── Badge / Tag ───────────────────────────────────────────────────────
  badge:
    fontSize: "13px"
    lineHeight: "20px"
    fontWeight: 400
    borderRadius: "4px"
    padding: "0px 4px"
    gap: "4px"

  # ── Card ──────────────────────────────────────────────────────────────
  card:
    backgroundColor: "{colors.card}"
    borderRadius: "8px"
    shadow: "{shadows.sm}"

  # ── Dialog / Modal ────────────────────────────────────────────────────
  dialog:
    backgroundColor: "{colors.background}"
    borderRadius: "8px"
    padding: "40px"
    shadow: "{shadows.xl}"

  # ── Alert ─────────────────────────────────────────────────────────────
  alert:
    borderRadius: "4px"
    padding: "8px 12px"
    borderWidth: "1px"
    gap: "8px"
    icon-size: "16px"

  # ── Tooltip ───────────────────────────────────────────────────────────
  tooltip:
    backgroundColor: "#161616"
    color: "#ffffff"
    borderRadius: "4px"
    fontSize: "12px"

  # ── Table ─────────────────────────────────────────────────────────────
  table-row:
    height: "40px"
    hover-backgroundColor: "{colors.table-row-hover}"
    selected-backgroundColor: "{colors.table-row-selected}"

  # ── Shell — TopBar ────────────────────────────────────────────────────
  topbar:
    height: "48px"
    backgroundColor: "{colors.secondary}"
    padding: "0 12px"
    gap: "8px"
    search-max-width: "500px"
    search-height: "32px"

  # ── Shell — Sidebar ───────────────────────────────────────────────────
  sidebar:
    width-expanded: "200px"
    width-collapsed: "0px"
    backgroundColor: "{colors.secondary}"
    transition: "200ms ease"

  sidebar-new-button:
    height: "32px"
    borderRadius: "8px"
    backgroundColor: "{colors.newbutton-bg}"
    borderColor: "{colors.newbutton-border}"

  sidebar-nav-item:
    height: "28px"
    padding: "0 12px"
    gap: "8px"
    borderRadius: "4px"
    fontSize: "13px"
    active-backgroundColor: "rgba(34, 114, 180, 0.10)"
    active-color: "{colors.primary}"
    active-fontWeight: 600
    inactive-color: "{colors.foreground}"
    inactive-hover-backgroundColor: "{colors.action-default-bg-hover}"
    icon-inactive-color: "{colors.muted-foreground}"
    icon-active-color: "{colors.primary}"

  sidebar-section-label:
    fontSize: "12px"
    fontWeight: 400
    color: "{colors.muted-foreground}"
    height: "24px"

  # ── Shell — Page content zone ─────────────────────────────────────────
  page-content:
    backgroundColor: "{colors.background}"
    border: "1px solid {colors.border}"
    borderRadius: "8px"
    margin: "0 8px 8px 0"
    margin-sidebar-closed: "0 8px 8px 8px"

  # ── Page Header ───────────────────────────────────────────────────────
  page-header:
    title-fontSize: "22px"
    title-lineHeight: "28px"
    title-fontWeight: 600
    description-fontSize: "12px"
    description-color: "{colors.muted-foreground}"
    avatar-size: "32px"
    avatar-borderRadius: "4px"
    avatar-backgroundColor: "{colors.primary}"
---

## Design Philosophy

DuBois is a **compact, information-dense enterprise design system** built for Databricks' internal product suite. The core principle is *clarity at density* — surfaces pack as much structured data as possible without feeling cramped, using tight 13px typography, 32px interactive element heights, and an 8px spacing grid.

The visual language is deliberately **understated and functional**. Chrome elements (sidebar, topbar) dissolve into a unified grey-050 shell, leaving a white content card as the only visual anchor. Color is used purposefully: blue signals action, warm red signals danger, and the full palette only surfaces in categorical badges or AI gradient accents.

## Color System

### Two grey palettes, one purpose

DuBois ships two grey ramps: **Neutral** (warm grey, no blue cast — default for light mode text and borders) and **Grey** (blue-tinted — primary dark mode palette). Components never reference primitives directly; they consume semantic tokens (`background`, `foreground`, `border`) that swap across modes.

### Primary blue

Blue-600 (`#2272b4`) is the single primary action color. It appears on filled buttons, active nav items, focus rings, and data chart series 1. In dark mode the primary steps up to blue-500 (`#4299e0`) to maintain contrast against dark surfaces.

### Shell uses secondary, not background

The outer shell (TopBar + Sidebar) is `secondary` (`#f7f7f7` / `#1f272d` dark), **not** `background`. This creates a deliberate two-tone contrast: the shell recedes into a muted grey plane while the main content floats on a white (or grey-800 dark) card with a subtle `border-border` stroke.

### Categorical palette

Eleven hue families (coral, brown, indigo, lemon, lime, pink, purple, teal, turquoise, charcoal, plus default) cover tag/badge coloring. Each family has a translucent RGBA background paired with a dark, legible text token. All token values are mode-aware — light mode uses very low opacity fills, dark mode lifts opacity slightly for the same perceived lightness.

### AI gradient

Genie and AI-powered features use a distinctive **three-stop diagonal gradient** — blue → purple → orange-red (`135deg, #4299e0 → #ca42e0 → #ff5f46`). It appears on AI entry points (sparkle icon in TopBar), AI badge borders, and AI assistant illustrated surfaces. It is never used for status, danger, or decorative purposes.

## Typography

The system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto…`) resolves to **SF Pro on macOS** and its platform equivalent elsewhere. This is a deliberate choice: DuBois avoids loading a web font to keep initial render fast and to match the native Electron desktop app.

The **base body size is 13px / 20px**, set on `<body>` so the Tailwind rem scale stays at 16px. This is smaller than most web conventions but appropriate for dense data tables and nav panels where every pixel matters.

**Font weight 600 (semibold) is the only bold weight.** Weight 700 (`font-bold`) does not exist in DuBois — using it introduces a visual inconsistency with the production desktop app.

**Hint text** (12px / 16px) is used for helper labels, timestamps, secondary annotations, and description rows beneath a primary value. It is always `muted-foreground`, never for standalone data cells the user needs to read at a glance.

## Spacing & Layout

Every distance is a multiple of 8px. Common values:
- `gap-1` (4px) — icon-to-text within a button or badge
- `gap-2` (8px) — between related form controls
- `gap-4` (16px) — between card sections
- `gap-6` (24px) — section padding
- `p-6` (24px) — standard page content padding

## Border Radius

DuBois uses **two radii**: `4px` for interactive elements (buttons, inputs, badges, dropdowns, tooltips, alerts) and `8px` for containers (cards, modals, panels, popovers). There is no `rounded-lg` (12px) or `rounded-xl` for UI chrome — those only appear in marketing contexts.

## Elevation & Shadow

Shadows are very subtle — nearly imperceptible at xs/sm — because the two-tone shell (grey → white card) provides inherent elevation contrast without aggressive drop shadows. The scale escalates to `xl` only for full-screen modals and overlays.

Dark mode shadows use dramatically higher opacity (e.g., `sm` goes from 5% to 45%) to compensate for reduced light contrast between dark surfaces.

## Shell Architecture

The application wraps in a **three-zone layout**: TopBar (48px) + Sidebar (200px / hidden) + Content card.

**TopBar** and **Sidebar** share the same `secondary` background — there are no dividing borders between them. The content card is the only element with a `border-border` stroke and `rounded-md` corners, creating a floating card appearance against the unified grey shell.

**Sidebar** is binary: fully expanded (200px) or fully hidden (0px, `overflow-hidden`). There is no icon-only collapsed state — collapsing fully hides the sidebar, and the content card gains a matching 8px left margin (`ml-2`) to preserve symmetric gutter spacing.

**Nav items** are 28px tall (not 32px) to allow more items to fit without scrolling. The `+ New` button above the nav uses a brand-red tinted background (`rgba(255, 54, 33, 0.08)`) and an `8px` border radius — intentionally more rounded than 4px interactive elements to make it visually distinct as a primary creation entry point.

## Component Patterns

### Buttons

**Four named variants:**
- `primary` — filled blue. The default rendering when no variant is specified. Use for the single primary CTA on a page or dialog.
- `default` — bordered transparent background, blue hover. The standard secondary action (Cancel, Share, Options, Reset). This is the most-used variant in the product.
- `ghost` — no background, blue hover. For icon-only chrome buttons (toolbar, sidebar, topbar) and inline controls inside dense layouts.
- `link` — blue underline text. For navigational inline text actions only.
- `destructive` — filled red. For irreversible danger actions (Delete, Remove).

**Four size variants:** `sm`/`default` (32px, standard), `xs` (24px, compact toolbar), `icon-sm` (32×32 square), `icon-xs` (24×24 square). Icon-only buttons always use `variant="ghost" size="icon-xs"` or `icon-sm` — never raw `<button>` elements.

**Icon placement** — icons are placed as children alongside the label text; button flex + `gap-2` handles spacing automatically:
- Leading icon: `<Button><PlusIcon /> New notebook</Button>`
- Trailing icon (menu/chevron): `<Button>Options <ChevronDownIcon /></Button>`
- Both: `<Button><PlusIcon /> New <ChevronDownIcon /></Button>`

All icons inside buttons default to 16px (`size-4`) via the `[&_svg:not([class*='size-'])]:size-4` base class.

A `<Button>` must never be nested inside another `<button>` or interactive container. When a clickable row needs an inner action (like a dismiss button), the outer container becomes a `<div role="…" onClick>` and only the inner element is a `<Button>`.

### Badges

Rectangular (4px radius), 13px/20px font (Du Bois Paragraph, same as body), normal weight (not semibold), 4px horizontal padding, 0 vertical padding. The full categorical range covers eleven hue families. Used for status labels, entity types, and feature-flag annotations. Never use filled primary badges for status — prefer the `destructive` semantic variant or a categorical hue (`default_tag`, `charcoal`, `coral`, etc.).

### Alerts

Full-width `border` + tinted `background` using the alert's semantic color family. Icon and title are grid-aligned in the same row. A dismiss `X` button (`icon-xs ghost`) optionally appears flush right.

### Tables

Row height is 40px. Data cell content (names, timestamps, types, statuses) is always `text-foreground`. Secondary annotations below a primary value (namespace paths, sub-labels) are `text-muted-foreground`. Column headers are `text-foreground font-semibold`.

### Page Header

Sits inside `p-6` at the top of the content card. Breadcrumbs → title row (22px semibold + optional star + inline icon buttons + badge) → description (12px muted). Right-aligned actions are always 32px buttons. The overflow (`⋮`) menu button precedes primary actions.

## Icons

Two icon families coexist:
- **Lucide** (`lucide-react`) for generic UI icons — always `className="h-4 w-4"` (16px)
- **DuBois icons** (`@/components/icons`) — 445 Databricks-specific SVG components for product concepts (notebooks, pipelines, catalog, etc.)

Icons in shell chrome (sidebar, topbar) are always `text-muted-foreground` when inactive and shift to `text-primary` when their item is active. AI entry points use the `color="ai"` prop on `<DbIcon>` to apply the gradient fill.

## Dark Mode

Every semantic token has a dark mode counterpart. The core inversion: `background` shifts from white to `grey-800` (`#11171c`) and `secondary` shifts from `neutral-050` to `grey-700` (`#1f272d`). The blue primary steps from blue-600 to blue-500 for contrast. Destructive shifts from red-600 to red-500. Alert background tokens use `rgba` overlays instead of light tints so they remain visible against the dark background without appearing too saturated.

## What Not To Do

- **Never hardcode hex colors** — always use the semantic CSS variable or Tailwind token.
- **Never use `font-bold` (700)** — use `font-semibold` (600).
- **Never use `rounded-lg` or larger on buttons or inputs.**
- **Never use the Databricks brand orange (`#ff3621`) for UI** — it exists only for the logo brickwork and the NewButton tint; it is a marketing color, not a UI color.
- **Never set `font-size` on `<html>`** — this breaks the Tailwind rem scale; body size is set on `<body>` only.
- **Never use `text-muted-foreground` for standalone data columns** — secondary text is for annotations beneath a primary value, not for data values themselves.
