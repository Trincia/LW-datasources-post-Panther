# Design Tokens & Typography — Sync and Usage Guide

This guide covers: how tokens flow between code and Figma, how to verify every component is using tokens rather than hardcoded values, and how to decide when to create a new token.

---

## How the Token System Works

There are two layers:

| Layer | Code | Figma |
|---|---|---|
| **Primitives** | `@theme` block in `globals.css` (e.g. `--color-blue-600`) | `Primitives` variable collection (57 COLOR vars, single "Value" mode) |
| **Semantics** | `:root` / `.dark` CSS vars (e.g. `--primary`, `--foreground`) | `Color` variable collection (46 COLOR vars, Light + Dark modes) |
| **Spacing / radius** | Tailwind scale in `@theme` | `Spacing` variable collection (21 FLOAT vars) |
| **Typography** | `@layer base` heading rules + `font-size` utilities in `@theme` | 11 text styles: `heading/h1–h6`, `body/base`, `body/xs`, `body/hint`, `label/xs`, `body/md` |
| **Icon role** | `text-muted-foreground` / `text-primary` Tailwind utilities | `icon-role` collection (1 var, 3 modes: default / muted / primary) |

**Source of truth for primitives and semantics:** `~/universe/design-system/src/theme/tokens/`

---

## Syncing Tokens: Code ↔ Figma

### Normal flow (after DuBois token updates upstream)

```bash
# Step 1: dry-run — see what would change
node scripts/sync-tokens.mjs

# Step 2: apply changes to globals.css
node scripts/sync-tokens.mjs --apply

# Step 3: push to Figma (primitives + semantic rgba vars)
FIGMA_ACCESS_TOKEN=<token> node scripts/sync-tokens.mjs --apply --figma
```

**What `sync-tokens.mjs` does:**
- Reads `primitives.json`, `semantics.light_mode.json`, `semantics.dark_mode.json` from the DuBois source
- Patches `@theme` (primitive hex values), `:root` (light semantic vars), and `.dark` (dark semantic vars) in `globals.css`
- Pushes updated primitive hex values to Figma's `Primitives` collection via REST API
- Pushes semantic rgba tint values (hover/press/table states) to the `Color` collection

**What it does NOT sync automatically:**
- Figma `Color` semantic variables — their values reference `Primitives` variables as aliases in Figma. If primitives update, semantic colors update automatically through Figma's alias resolution. No script needed.
- Text styles — managed manually in Figma. See the typography section below.
- New tokens not yet in `SEMANTIC_MAPPING` inside the script — add them manually (see "Creating a new token").

### After editing `globals.css` directly

If you add or edit a CSS var in `globals.css` manually without updating the upstream token JSON, you must also push it to Figma manually via the Plugin API (see "Creating a new token" below).

---

## Token Inventory

### Color semantics — `Color` collection in Figma / `:root` in CSS

| CSS var | Figma variable | Tailwind utility | Purpose |
|---|---|---|---|
| `--background` | `background` | `bg-background` | Page / card surface (white / grey-800 dark) |
| `--foreground` | `foreground` | `text-foreground` | Primary body text |
| `--primary` | `primary` | `bg-primary` / `text-primary` | Blue action color |
| `--primary-foreground` | `primary-foreground` | `text-primary-foreground` | Text on primary bg |
| `--secondary` | `secondary` | `bg-secondary` | Subtle surface (topbar, sidebar, page bg) |
| `--muted` | `muted` | `bg-muted` | Same as secondary |
| `--muted-foreground` | `muted-foreground` | `text-muted-foreground` | Secondary text, inactive icons |
| `--destructive` | `destructive` | `bg-destructive` / `text-destructive` | Danger/error |
| `--border` | `border` | `border-border` | Borders everywhere |
| `--input` | `input` | (input border override) | Input element borders |
| `--ring` | `ring` | (focus ring) | Focus ring |
| `--warning` | `warning` | `text-warning` | Warning text |
| `--success` | `success` | `text-success` (via `text-[var(--success)]`) | Success text |
| `--alert/border-danger` | `alert/border-danger` | `border-[var(--border-danger)]` | Alert component |
| `--alert/border-warning` | `alert/border-warning` | `border-[var(--border-warning)]` | Alert component |
| `--alert/border-success` | `alert/border-success` | `border-[var(--border-success)]` | Alert component |
| `--newbutton-bg` | `newbutton/bg` | `bg-brand-red/8` (Tailwind) or `bg-[var(--newbutton-bg)]` | NewButton background tint |
| `--newbutton-border` | `newbutton/border` | `border-brand-red/12` (Tailwind) or `border-[var(--newbutton-border)]` | NewButton border tint |
| `--action/hover` | `action/hover` | `bg-[var(--action-default-bg-hover)]` | Button/item hover tint |
| `--action/press` | `action/press` | `bg-[var(--action-default-bg-press)]` | Button/item pressed tint |
| `--table/row-hover` | `table/row-hover` | `.row-hover:hover` utility class | Table row hover |
| `--table/row-selected` | `table/row-selected` | `.row-selected` utility class | Table row selected |

### Typography — text styles in Figma / `@layer base` in CSS

| Figma style | CSS element | Size / weight / leading |
|---|---|---|
| `heading/h1` | `h1` | 32px · Semibold · 40px |
| `heading/h2` | `h2` | 22px · Semibold · 28px |
| `heading/h3` | `h3` | 18px · Semibold · 24px |
| `heading/h4` | `h4` | 15px · Semibold · 20px |
| `heading/h5` | `h5` | 13px · Semibold · 20px |
| `heading/h6` | `h6` | 12px · Semibold · 16px |
| `body/base` | `body` default | 13px · Regular · 20px |
| `body/hint` | `.text-hint` Tailwind utility | 12px · Regular · 16px |
| `body/xs` | (same as hint, Regular) | 12px · Regular · 16px |
| `label/xs` | (12px semibold label) | 12px · Semibold · 16px |
| `body/md` | (16px body, rarely used) | 16px · Regular · 24px |

---

## Ensuring Components Use Tokens — Checklist

### In code (React / Tailwind)

**Colors — always use semantic Tailwind utilities, never raw hex:**
```tsx
// ✅ correct
<p className="text-foreground">...</p>
<div className="bg-secondary border border-border">...</div>
<span className="text-muted-foreground">hint text</span>

// ❌ wrong
<p style={{ color: "#11171c" }}>...</p>
<div className="bg-[#f7f7f7]">...</div>
```

**Typography — rely on the `body` base and heading element styles, or `text-hint`:**
```tsx
// ✅ correct — inherits 13px/20px from body
<p>Normal text</p>
// ✅ correct — 12px hint via utility
<p className="text-hint text-muted-foreground">Helper text</p>
// ✅ correct — heading uses @layer base rule
<h3>Section title</h3>

// ❌ wrong — never set raw font sizes
<p className="text-[13px]">...</p>
<p style={{ fontSize: 12 }}>...</p>
```

**Font weight — always `font-semibold` (600), never `font-bold` (700):**
```tsx
// ✅
<span className="font-semibold">Label</span>
// ❌
<span className="font-bold">Label</span>
```

**Spacing — use the 8px grid (`gap-2`, `gap-4`, `p-4`, `p-6`):**
- `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px
- `p-4` = 16px padding, `p-6` = 24px padding

**Border radius:**
- Interactive elements (buttons, inputs, badges, dropdowns): `rounded` (4px)
- Cards, modals, panels: `rounded-md` (8px)
- Never `rounded-lg` / `rounded-xl` for interactive elements

**How to audit a component for hardcoded values:**
```bash
# Search for raw hex colors in component files
grep -r '#[0-9a-fA-F]\{3,6\}' src/components/ src/app/

# Search for inline font sizes
grep -r 'font-size\|fontSize\|text-\[' src/components/ src/app/

# Search for hardcoded px values in className (anything other than DuBois scale)
grep -r 'p-\[.*px\]\|m-\[.*px\]\|h-\[.*px\]' src/components/ src/app/
```

---

### In Figma (Plugin API / `use_figma`)

**Colors — always bind to a variable, never set raw hex:**
```js
// ✅ correct
const primaryVar = await figma.variables.importVariableByKeyAsync("35a88d92b7805e99ea334c1c8f62327ab0778547");
const fill = figma.util.solidPaint("#000"); // placeholder
node.fills = [fill];
figma.variables.setBoundVariableForPaint(node.fills[0], "color", primaryVar);
node.fills = [node.fills[0]];

// ❌ wrong
node.fills = [{ type: "SOLID", color: { r: 34/255, g: 114/255, b: 180/255 } }];
```

**Typography — always apply a text style by key, never set raw properties:**
```js
// ✅ correct
const style = await figma.importStyleByKeyAsync("24ca98d883e47b42d6c9aad6dac52c467202c6b4"); // body/base
textNode.textStyleId = style.id;

// ❌ wrong
textNode.fontSize = 13;
textNode.fontName = { family: "SF Pro", style: "Regular" };
```

**How to find a variable key at runtime:**
```js
// List all Color collection variables with their keys
const vars = figma.variables.getLocalVariables("COLOR");
return vars.map(v => ({ name: v.name, key: v.key }));
```

**How to find a text style key at runtime:**
```js
const styles = figma.getLocalTextStyles();
return styles.map(s => ({ name: s.name, key: s.key }));
```

---

## Quick Reference: Variable Keys

### Color semantics (bind these in Figma components)

| Token | Variable key |
|---|---|
| `foreground` | `e3cf81e7a1b508d8c18edc820dd8d489026199bf` |
| `primary` | `35a88d92b7805e99ea334c1c8f62327ab0778547` |
| `newbutton/bg` | `d9119815aa0d51af4def9a07796d30d54506e4e4` |
| `newbutton/border` | `4b6f292d3e06d7d27193fa0a618ef915f4691a6b` |
| `destructive` | `d91301f59a4dd431497a73e828d499d8b697a02e` |
| `warning` | `babbfe2f2ce1f9a073149f19c029e90e68ad4d86` |
| `success` | `793d03a8834853c52d42e03513adec7ae1c18714` |
| `icon/fill` | `9adeeef5c1178e4c339b23d70e7d30ca44e59928` |

> For other token keys, call `figma.variables.getLocalVariables("COLOR")` at runtime — don't hardcode them since they can change after file edits.

### Text styles

| Style | Key |
|---|---|
| `heading/h1` | `ced7984836789d348c69194699119e0689b75b31` |
| `heading/h2` | `d86cd2a4d7386d5b5a145a4fdb60640b0382e1db` |
| `heading/h3` | `bb173dd8d3434da0350b6bfccf6e17eca10760e9` |
| `heading/h4` | `b082edde456476dc802f5ea0c58b5811aa7ec5cd` |
| `heading/h5` | `c2ba9600d4d8225f895d36c2d907d5cf219bd522` |
| `heading/h6` | `1c3bc8b67ddf2b517a8da06b0cb239b9827bf6d1` |
| `body/base` | `24ca98d883e47b42d6c9aad6dac52c467202c6b4` |
| `body/hint` | `6a76105288ee0c7643927180397f0b067eed1a4b` |
| `body/xs` | `798b989e6a837ddb93d1637c14e3a86f793e2f87` |
| `label/xs` | `f038c69c6ee076ed44427841b7443c114cdc4b34` |
| `body/md` | `c3255b7064f793de89f519934eaaaf67e4cd3610` |

---

## Creating a New Token

Only create a new token when the existing ones don't cover your semantic need. Ask: does this color or size have a distinct meaning that applies in multiple places? If it's used once, just use the nearest existing semantic token.

**Decision tree:**
1. **Color** → can I use `text-foreground`, `text-muted-foreground`, `bg-secondary`, `bg-primary`, `border-border`, `text-destructive`, `text-warning`, or `text-[var(--success)]`? → use it.
2. **One-off tint** → use `bg-primary/10`, `bg-destructive/10` etc. (Tailwind opacity modifier). No new token needed.
3. **Genuinely new semantic role** (e.g. a new status color) → follow the steps below.

### Steps to add a new semantic color token

**Step 1 — Add CSS vars to `globals.css`**
```css
:root {
  --my-token: #hexvalue; /* light mode */
}
.dark {
  --my-token: #hexvalue; /* dark mode */
}
```

**Step 2 — Expose as Tailwind utility via `@theme inline`**
```css
@theme inline {
  --color-my-token: var(--my-token);
}
```
This makes `text-my-token`, `bg-my-token`, `border-my-token` available.

**Step 3 — Add to Figma's `Color` collection via Plugin API**
```js
// Create the variable in both Light and Dark modes
const colorCollection = figma.variables.getLocalVariableCollections()
  .find(c => c.name === "Color");
const lightMode = colorCollection.modes.find(m => m.name === "Light");
const darkMode  = colorCollection.modes.find(m => m.name === "Dark");

const newVar = figma.variables.createVariable("my-token", colorCollection, "COLOR");

// Bind to existing primitive variables (preferred) or set raw rgba values
const lightPrim = await figma.variables.importVariableByKeyAsync("PRIMITIVE_KEY_FOR_LIGHT");
const darkPrim  = await figma.variables.importVariableByKeyAsync("PRIMITIVE_KEY_FOR_DARK");
newVar.setValueForMode(lightMode.modeId, figma.variables.createVariableAlias(lightPrim));
newVar.setValueForMode(darkMode.modeId,  figma.variables.createVariableAlias(darkPrim));
```

**Step 4 — Add to `sync-tokens.mjs` `SEMANTIC_MAPPING`** so future upstream token syncs keep it in sync.

**Step 5 — Run typecheck**
```bash
npx tsc --noEmit
```

---

### Steps to add a new text style

Only add a text style if it appears in at least 2 components and is not already covered by the 11 existing styles.

**Step 1 — Verify it doesn't exist** — check the table above. `body/hint` (12px Regular) and `label/xs` (12px Semibold) cover most sub-base needs.

**Step 2 — Add to Figma via Plugin API**
```js
const style = figma.createTextStyle();
style.name = "body/new-style";
await figma.loadFontAsync({ family: "SF Pro", style: "Regular" });
style.fontSize = 13; // match DuBois scale
style.fontName = { family: "SF Pro", style: "Regular" };
style.lineHeight = { unit: "PIXELS", value: 20 };
return style.key; // save this key
```

**Step 3 — Add the corresponding CSS rule to `globals.css`** (either a new Tailwind utility class or heading element rule in `@layer base`).

**Step 4 — Update the text styles table** in this document with the new name and key.

---

## Tokens That Exist in CSS but NOT in Figma Variables

These are intentionally not in Figma variables — they are either computed at runtime or specific to code-only usage:

| CSS var | Reason not in Figma |
|---|---|
| `--border-danger/warning/success` | Alert component only; tinted borders computed from primitive hex with opacity |
| `--background-danger/warning/success` | Alert component only |
| `--overlay` | Semi-transparent modal backdrop — not bound to components |
| `--skeleton` | Skeleton loader animation — not a design token per se |
| `--chart-5` | No DuBois semantic chart-5 token; uses `purple/500` directly |

For these, in Figma use the nearest primitive variable directly (e.g. `red/600` with opacity for danger borders) rather than expecting a semantic alias to exist.
