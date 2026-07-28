---
name: databricks-shadcn-theme
description: >
  Apply Databricks DuBois design system styling to shadcn/ui components. Use this skill whenever
  building UI with shadcn/ui for Databricks projects, theming shadcn components to match DuBois,
  creating new pages or features that should follow Databricks visual identity, or when a user
  mentions "DuBois", "Databricks design system", "DB theme", or asks to style shadcn to match
  Databricks brand. Also trigger when the user is working on any Databricks internal tool,
  dashboard, or app that uses React + Tailwind + shadcn/ui.
---

# Databricks DuBois → shadcn/ui Theme Skill

## Overview

This skill maps the **DuBois Design System** (`@databricks/design-system`) tokens and conventions
onto **shadcn/ui** CSS variables and Tailwind config, so that AI-assisted ("vibe coded") UIs
automatically look like Databricks products.

DuBois is built on Ant Design (antd) + Emotion CSS-in-JS. shadcn/ui is built on Radix UI + Tailwind CSS.
This skill bridges the two so teams can use shadcn/ui's composable, copy-paste components while
staying on-brand with Databricks visual identity.

## When to Use

- Creating new React UI with shadcn/ui for a Databricks project
- Theming an existing shadcn/ui app to match DuBois
- Building internal tools, dashboards, or apps at Databricks
- Generating `globals.css`, `tailwind.config`, or component wrappers
- Answering "how do I make shadcn look like Databricks?"

---

## Step 1: Apply the Theme — globals.css

Copy the themed CSS variables from `references/globals.css` into the project's `globals.css` (or
`app/globals.css` in Next.js). This file maps every shadcn CSS variable to DuBois semantic and
primitive color tokens for both light and dark modes.

**Read `references/globals.css` before generating any themed CSS.**

Key mapping principles:
- `--background` → DuBois `backgroundPrimary` (white / grey800)
- `--foreground` → DuBois `textPrimary` (grey800 / grey100)
- `--primary` → DuBois `actionPrimaryBackgroundDefault` (blue600 / blue500)
- `--destructive` → DuBois `actionDangerPrimaryBackgroundDefault` (red600 / red500)
- `--muted` → DuBois `backgroundSecondary` (grey050 / grey700)
- `--border` → DuBois `border` (grey100 / grey700)
- `--ring` → DuBois `actionDefaultBorderFocus` (blue600 / blue400)
- `--radius` → DuBois `borderRadiusSm` = 4px (shadcn default is 0.5rem = 8px, DuBois is tighter)

## Step 2: Extend Tailwind Config

Read `references/tailwind-extend.js` for the recommended Tailwind theme extensions. This adds:
- DuBois primitive color palette as utility classes (`blue-600`, `grey-800`, etc.)
- Semantic aliases (`brand`, `surface-elevated`, `text-muted`)
- DuBois spacing scale (base unit = 8px)
- DuBois shadow scale (xs through xl, light/dark aware)
- DuBois border radius tokens

## Step 3: Customize Key Components

After theming, these shadcn components need the most attention to match DuBois:

### Button
DuBois buttons differ from shadcn defaults:
- **Height**: 32px (`h-8`, `sm`, this is the DuBois default), 24px (`h-6`, `xs`). **No 40px size in DuBois.**
- **Border radius**: 4px (`rounded`), not shadcn's default `rounded-md`
- **Font**: 13px base, `font-semibold` (600) for labels
- **Variants**: Map DuBois `primary` → shadcn `default`, DuBois `default` → shadcn `outline`,
  DuBois `tertiary` → shadcn `ghost`, DuBois `danger` → shadcn `destructive`, DuBois `link` → shadcn `link`
- **Default size**: `sm` (32px) — override `defaultVariants` in `buttonVariants`

### Input / Form Fields
- Height: 32px (`h-8`), 4px radius
- Border: `grey100` default, `blue600` on focus
- Font size: 13px
- Focus ring: inset (`ring-offset-0`), no gap between ring and element

### Dialog / Modal
- Padding: 40px
- Corner radius: 8px (`rounded-md`) — same as cards/panels
- No header/footer borders (DuBois removes them)
- Header padding: `40px 40px 20px`
- Body padding: `0 40px`

### Tabs
- Use `variant="line"` for DuBois underline style (blue bottom indicator, active tab = `font-semibold`)
- Default (no variant) renders as pill/contained tabs

### Table
- Row hover: `rgba(68, 83, 95, 0.04)` light / `rgba(189, 205, 219, 0.04)` dark
- Selected row: `rgba(68, 83, 95, 0.08)` light / `rgba(189, 205, 219, 0.08)` dark
- Border between rows: `grey100` / `grey700`

### Tag / Badge
DuBois has a rich secondary color palette for tags: brown, coral, indigo, lemon, lime, pink,
purple, teal, turquoise. Map these as additional badge variants.

---

## Design Tokens Quick Reference

### Primitive Colors (use for extending Tailwind, NOT for direct component styling)

| Token       | Hex       | Usage                    |
|-------------|-----------|--------------------------|
| blue600     | `#2272B4` | Primary actions           |
| blue700     | `#0E538B` | Primary hover             |
| blue800     | `#04355D` | Primary press             |
| grey800     | `#11171C` | Text primary (light mode) |
| grey050     | `#F6F7F9` | Background secondary      |
| grey100     | `#E8ECF0` | Borders                   |
| grey500     | `#5F7281` | Text secondary            |
| red600      | `#C82D4C` | Danger actions            |
| green600    | `#277C43` | Success                   |
| yellow600   | `#BE501E` | Warning                   |
| white       | `#FFFFFF` | Background primary        |

### Typography

| Property      | Value                    |
|---------------|--------------------------|
| Font family   | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` (= SF Pro on macOS/iOS). **In Figma: use "SF Pro" — never Inter.** |
| Base size     | 13px — set on `body` only. **Never set `font-size` on `html`** (breaks Tailwind rem scale). |
| Hint size     | 12px / 16px line-height — use `text-hint` class |
| SM size       | 12px                     |
| LG size       | 18px                     |
| XL size       | 22px                     |
| XXL size      | 32px                     |
| Line height (base) | 20px                |
| Regular weight | 400                     |
| Bold weight    | 600                     |

### Spacing (base unit: 8px)

| Token | Value |
|-------|-------|
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |

### Border Radius

| Token         | Value |
|---------------|-------|
| borderRadius0 | 0     |
| borderRadiusSm | 4px  |
| borderRadiusMd | 8px  |
| borderRadiusLg | 12px |
| borderRadiusFull | 999px |

### Shadows (Light Mode)

| Token | Value |
|-------|-------|
| xs    | `0px 1px 0px 0px rgba(0,0,0,0.05)` |
| sm    | `0px 2px 3px -1px rgba(0,0,0,0.05), 0px 1px 0px 0px rgba(0,0,0,0.02)` |
| md    | `0px 3px 6px 0px rgba(0,0,0,0.05)` |
| lg    | `0px 2px 16px 0px rgba(0,0,0,0.08)` |
| xl    | `0px 8px 40px 0px rgba(0,0,0,0.13)` |

### AI Branded Gradient

```css
background: linear-gradient(135deg, #4299E0 20.5%, #CA42E0 46.91%, #FF5F46 79.5%);
```
Use for AI-related features and indicators.

---

## Do's and Don'ts

### DO
- Use semantic color tokens (`--primary`, `--muted`, etc.) not raw hex values
- Use the 8px spacing grid
- Use 13px as your base font size (set `font-size: 13px` on body or root)
- Use `font-weight: 600` for bold/emphasis (not 700)
- Use `rounded` (4px) as the default border radius for interactive elements
- Use DuBois secondary colors (coral, teal, indigo, etc.) for categorical color coding
- Support both light and dark modes — DuBois has full dark mode tokens

### DON'T
- Don't use Databricks brand orange (`#FF3621`) for UI actions — it's for brand/marketing only
- Don't use `font-weight: 700` or `800` — DuBois caps at 600
- Don't use `rounded-lg` (8px) as default for buttons/inputs — use `rounded` (4px)
- Don't hardcode light mode colors — always use CSS variables for dark mode support
- Don't invent new semantic colors — use the DuBois palette
- Don't use the deprecated tag color tokens — use the secondary color palette directly

---

## Step 4: Integrate DuBois Icons

DuBois ships **445 custom 16×16 SVG icons**. shadcn/ui defaults to **Lucide React** (24×24).

**Read `references/icons.md` for the full integration guide.**

Three strategies (from simplest to most complete):

### A. Lucide Mapping (Simplest)
~100 DuBois icons have direct Lucide equivalents. Use Lucide imports with `size={16}`.
See the mapping table in `references/icons.md`.

### B. Sync DuBois SVGs (Most Complete)
Run the sync script to pull all icons from the local universe monorepo:

```bash
# Sync all 445 icons from universe into src/components/icons/
node scripts/sync-icons.mjs
# Source: ~/universe/design-system/src/design-system/Icon/__generated/icons
```

### C. Hybrid (Recommended)
Use Lucide for generic icons (arrows, check, close, etc.) and extracted DuBois icons
for Databricks-specific concepts (Catalog, Notebook, Pipeline, Schema, etc.).
See the `DbIcon` unified wrapper component in `references/icons.md`.

### Icon Sizing Convention
| Context          | Size | Class        |
|------------------|------|--------------|
| Inline with text | 16px | `h-4 w-4`   |
| Button icon      | 16px | `h-4 w-4`   |
| Navigation       | 20px | `h-5 w-5`   |
| Page header      | 24px | `h-6 w-6`   |

---

## Bundled References

| File | Purpose |
|------|---------|
| `references/globals.css` | Drop-in themed CSS variables for shadcn |
| `references/tailwind-extend.js` | Tailwind config extensions with DuBois tokens |
| `references/component-overrides.md` | Detailed per-component styling guidance |
| `references/icons.md` | DuBois→Lucide mapping, extraction strategies, DB-specific icon list |
| `scripts/extract-dubois-icons.js` | Extracts DuBois SVGs into standalone React components |

Read the appropriate reference file before generating code.
