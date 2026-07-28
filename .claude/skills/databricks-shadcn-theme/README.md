# databricks-shadcn-theme

A Claude Code skill that maps the **Databricks DuBois design system** onto **shadcn/ui**,
so AI-assisted ("vibe coded") UIs automatically look like Databricks products.

## What's in this repo

```
databricks-shadcn-theme/
├── SKILL.md                      ← Claude skill entry point (read this first)
├── plan.md                       ← Full build plan for the Designer Starter Kit
├── references/
│   ├── globals.css               ← Drop-in DuBois-themed CSS variables for shadcn
│   ├── tailwind-extend.js        ← Tailwind config extensions (colors, spacing, shadows)
│   ├── component-overrides.md    ← Per-component styling guide (P0/P1/P2 priority)
│   └── icons.md                  ← DuBois→Lucide mapping + extraction strategies
└── scripts/
    └── extract-dubois-icons.js   ← Extracts DuBois SVGs as standalone React components
```

---

## Quick Start — Use as a Claude Code Skill

### Option A: Copy into an existing project

```bash
mkdir -p your-project/.claude/skills
cp -r databricks-shadcn-theme your-project/.claude/skills/databricks-shadcn-theme
```

Then add to your project's `CLAUDE.md`:

```markdown
All UI must follow the DuBois design system.
Read `.claude/skills/databricks-shadcn-theme/SKILL.md` before generating any UI.
```

### Option B: Build a fresh Designer Starter Kit

Follow the step-by-step guide in [`plan.md`](./plan.md).
It walks through creating a full Next.js + shadcn/ui project with:
- DuBois theme applied
- Core shadcn components installed and overridden
- DuBois icons extracted
- A living `/design-system` reference page
- Dark mode support

---

## Key DuBois → shadcn Differences

| Property | shadcn default | DuBois override |
|----------|---------------|-----------------|
| Base font size | 16px | **13px** |
| Bold weight | 700 | **600** |
| Button/input radius | 6px (`rounded-md`) | **4px** (`rounded`) |
| Card/modal radius | 8px | **8px** (same ✓) |
| Primary color | blue | **#2272B4** (blue600) |
| Danger color | red | **#C82D4C** (red600) |
| Focus ring | offset ring | **inset ring, no offset** |

---

## Using the Reference Files

### globals.css

Drop into `src/app/globals.css`. Maps every shadcn CSS variable to DuBois tokens.
Includes light + dark mode, AI gradient utilities, and DuBois typography base styles.

### tailwind-extend.js

Merge into `tailwind.config.ts`:

```ts
import duboisExtend from "./.claude/skills/databricks-shadcn-theme/references/tailwind-extend";

const config: Config = {
  theme: {
    extend: {
      ...duboisExtend,
    },
  },
};
```

Adds: DuBois primitive colors, 9 secondary badge colors, 13px base font scale,
8px spacing system, DuBois shadow scale, 4px default border radius.

### component-overrides.md

Apply after `npx shadcn@latest add <component>`. Covers:
- **P0**: button, input, badge
- **P1**: dialog, table, alert
- **P2**: tabs, tooltip, card

Ask Claude Code: *"Apply DuBois overrides to button.tsx using component-overrides.md"*

### icons.md

Three strategies for integrating DuBois icons with shadcn/ui:
- **Strategy A**: Lucide mapping (fastest, 80% parity)
- **Strategy B**: Extract all DuBois SVGs as standalone components
- **Strategy C**: Hybrid — Lucide for generic + DuBois for Databricks-specific (recommended)

### sync-icons.mjs

```bash
# Sync all 445 DuBois icons from the local universe monorepo
node scripts/sync-icons.mjs
# Source: ~/universe/design-system/src/design-system/Icon/__generated/icons
# Output: src/components/icons/
```

---

## Design Token Quick Reference

### Colors
| Token | Hex | Use |
|-------|-----|-----|
| blue600 | `#2272B4` | Primary actions |
| blue700 | `#0E538B` | Primary hover |
| grey800 | `#11171C` | Text primary |
| grey500 | `#5F7281` | Text secondary |
| grey100 | `#E8ECF0` | Borders |
| grey050 | `#F6F7F9` | Background secondary |
| red600 | `#C82D4C` | Danger |
| green600 | `#277C43` | Success |
| yellow600 | `#BE501E` | Warning |

### Typography
- Base: 13px / 20px line-height / weight 400
- Bold: weight **600** (never 700+)
- Headings: h1=32px, h2=22px, h3=18px, h4=15px

### Spacing (8px grid)
xs=4px · sm=8px · md=16px · lg=24px · xl=32px

### AI Gradient
```css
background: linear-gradient(135deg, #4299E0 20.5%, #CA42E0 46.91%, #FF5F46 79.5%);
```

---

## Contributing

See the [DuBois design system](https://databricks.com) for the source of truth on tokens.
When DuBois updates, update `references/globals.css` and `references/tailwind-extend.js` to match.
