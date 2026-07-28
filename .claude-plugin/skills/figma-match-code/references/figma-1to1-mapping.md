# Figma → Code 1:1 Mapping Rules

Common pitfalls when translating Figma designs to code. Each section names the root cause, the symptom, and the correct fix.

---

## 1. TabsList line variant — border fills full container width

**Symptom:** The bottom border underline on a `variant="line"` Tabs bar only spans the tab labels, not the full container width.

**Root cause:** `TabsList` defaults to `w-fit`. The `line` variant now overrides this with `w-full` in the component definition (`src/components/ui/tabs.tsx`) — no manual override needed.

**Fix:** Use `variant="line"` as-is. Do not revert the `w-full` in the component.

```tsx
// ✅ Correct — border spans full container automatically
<TabsList variant="line">
```

---

## 2. SelectTrigger in filter bars — must hug content, not fill

**Symptom:** Filter dropdowns (Status, Creator, Tags) each expand to fill their flex row instead of sizing to their label.

**Root cause:** `SelectTrigger` has no default width, so in a `flex` container it acts like a block element and stretches. When the flex container wraps (`flex-wrap`), each select becomes the only item on its row and takes 100% width.

**Fix:** Add `className="w-auto min-w-[80px]"` to `SelectTrigger` for any filter/toolbar select that should hug content.

```tsx
// ❌ Wrong — stretches to fill flex row
<SelectTrigger>

// ✅ Correct — hugs label width
<SelectTrigger className="w-auto min-w-[80px]">
```

---

## 3. Table cell text — all data cells use `text-foreground`

**Symptom:** Secondary columns (Description, metadata) render in grey/muted text, looking visually de-emphasized compared to the Figma design.

**Root cause:** Defaulting to `text-muted-foreground` for anything that "looks secondary". In DuBois tables, `text-muted-foreground` is reserved for genuine supplementary text (timestamps, IDs shown beneath primary content). All data cell values should be `text-foreground`.

**Fix:** Never add `text-muted-foreground` to a `TableCell` unless the Figma design explicitly shows that column in grey.

```tsx
// ❌ Wrong — dims data that should be readable
<TableCell className="text-muted-foreground">{cluster.description}</TableCell>

// ✅ Correct — foreground is the default for table data
<TableCell>{cluster.description}</TableCell>
```

**Rule of thumb:**
- `text-foreground` → all data values
- `text-muted-foreground` → helper text, secondary badges, subtext *beneath* a primary value

---

## 4. Pagination — default is centered, override to right-align

**Symptom:** Pagination renders centered in the page even when the Figma design places it flush-right.

**Root cause:** The `Pagination` component renders `<nav className="mx-auto flex w-full justify-center">` — `w-full` + `justify-center` make it always centered regardless of its parent container.

**Fix:** Pass `className="justify-end"` to `Pagination` to override `justify-center`.

```tsx
// ❌ Wrong — always centered
<Pagination>

// ✅ Correct — right-aligned
<Pagination className="justify-end">
```

---

## 5. Always embed real component instances — no placeholder frames

See `figma-component-creation.md` §2. When a React component slot (e.g. `action`) maps to a Figma Button, the Figma design must also embed a real Button instance — not a `[Action]` text node or a plain frame.

---

## 6. Variant overlap — pre-position before `combineAsVariants`

See `figma-component-creation.md` §3. All variants land at `(0,0)` after `combineAsVariants`. Set `child.x` before calling it.

---

## 7. Breadcrumb — trailing chevron, no duplicate page title

**Symptom:** The breadcrumb ends with a `BreadcrumbPage` item that duplicates the page `<h2>` title directly below.

**Root cause:** Agents default to adding a `BreadcrumbPage` for the current item. In DuBois detail pages, the title IS the current item — a trailing chevron (separator) is sufficient to indicate drill-down depth.

**Fix:** End breadcrumb at the parent level with a trailing `BreadcrumbSeparator`. Never add `BreadcrumbPage` when its text equals the `PageHeader` title.

```tsx
// ❌ Wrong — "table_name" appears in both breadcrumb and h2
<BreadcrumbItem><BreadcrumbLink>schema_name</BreadcrumbLink></BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem><BreadcrumbPage>table_name</BreadcrumbPage></BreadcrumbItem>

// ✅ Correct — trailing chevron only
<BreadcrumbItem><BreadcrumbLink>schema_name</BreadcrumbLink></BreadcrumbItem>
<BreadcrumbSeparator />
```

---

## 8. Icon before title text — `inline-block align-middle`, not `inline-flex`

**Symptom:** A small icon next to the page title text renders inside a visible grey bounding box.

**Root cause:** Wrapping a SVG in `<span className="inline-flex items-center ...">` inside an `<h2>` causes browsers to render a visible block-level box around the inline-flex element.

**Fix:** Use a React fragment with `inline-block align-middle` directly on the SVG.

```tsx
// ❌ Wrong — grey box appears around icon inside h2
title={
  <span className="inline-flex items-center gap-2">
    <TableIcon size={18} className="shrink-0 text-muted-foreground" />
    {name}
  </span>
}

// ✅ Correct — icon renders inline with text, no box
title={
  <>
    <TableIcon size={16} className="mr-2 inline-block align-middle text-muted-foreground" />
    {name}
  </>
}
```

---

## 9. PageHeader `description` prop — not for badge rows

**Symptom:** Status/metadata badges below the title render with wrong sizing or muted color.

**Root cause:** The `description` slot wraps content in `text-hint text-muted-foreground` — designed for plain 12px helper text, not badge components.

**Fix:** Put metadata badge rows as a standalone `<div>` immediately after `<PageHeader />`, outside the component.

```tsx
// ❌ Wrong — text-hint wrapper breaks badge styling
<PageHeader description={<Badge variant="teal">Certified</Badge>} />

// ✅ Correct — full style control, no wrapper interference
<PageHeader ... />
<div className="flex items-center gap-2 -mt-2">
  <Badge variant="teal" className="gap-1">
    <CertifiedFillIcon size={12} /> Certified
  </Badge>
  <Badge variant="secondary" className="gap-1">
    <DomainsIcon size={12} /> Domain: Agriculture
  </Badge>
</div>
```

**Also:** Use `CertifiedFillIcon` (not `CertifiedFillSmallIcon`) inside badges. The Small variant is for sub-10px table cell contexts only.

---

## 10. Detail page — card border treatment

**Rule:** In a two-column detail layout (main content + right metadata sidebar):

| Zone | Treatment |
|---|---|
| Left content sections | Each a `overflow-hidden rounded-md border border-border bg-background` card |
| Card section header row | `bg-muted px-4 py-3` — grey, edge-to-edge |
| Table/diagram inside card | `border-t border-border` separating header from content; edge-to-edge (no side padding on the table wrapper) |
| Related sub-sections in one card | Internal `border-t border-border pt-4` separator; no additional card nesting |
| Right sidebar panels | No outer card border. Container uses `divide-y divide-border`; each `SidebarPanel` uses `py-4` padding only |

```tsx
// ✅ Left section card pattern
<div className="overflow-hidden rounded-md border border-border bg-background">
  <div className="bg-muted px-4 py-3">
    <span className="text-sm font-semibold text-foreground">Section Title</span>
  </div>
  <div className="border-t border-border p-4">
    {/* content */}
  </div>
</div>

// ✅ Right sidebar pattern — no outer border, dividers only
<div className="flex w-60 shrink-0 flex-col divide-y divide-border">
  <SidebarPanel title="About">...</SidebarPanel>
  <SidebarPanel title="Quality">...</SidebarPanel>
</div>
```

---

## 11. Text nodes in `use_figma` scripts — use `SF Pro Text`, never `SF Pro`

**Symptom:** Text created via the Figma Plugin API is invisible or renders as vertical character stacking (one character per line), despite `loadFontAsync` succeeding.

**Root cause:** `{ family: "SF Pro", style: "Regular" }` and `{ family: "SF Pro", style: "Semibold" }` load successfully for API property editing, but have **zero glyph advance width** in Figma's rendering engine. The text exists in the data but is visually absent.

**Fix:** Use `SF Pro Text` for body text (≤19pt) and `SF Pro Display` for large text (≥20pt). Never use plain `SF Pro` family in `use_figma` scripts.

```js
// ❌ Wrong — loads OK but renders invisible (w=0)
t.fontName = { family: "SF Pro", style: "Regular" };
t.fontName = { family: "SF Pro", style: "Semibold" };

// ✅ Correct — renders correctly
t.fontName = { family: "SF Pro Text", style: "Regular" };
t.fontName = { family: "SF Pro Text", style: "Semibold" };
```

**Also:** Text node width is always 0 until characters are set. To get correct width, set `textAutoResize = "WIDTH_AND_HEIGHT"` before setting characters. Then switch to `"HEIGHT"` and `layoutSizingHorizontal = "FILL"` if the text should wrap inside an auto-layout container.

---

## Quick reference

| Figma pattern | Common mistake | Correct code |
|---|---|---|
| Full-width tab underline | Reverting `w-full` in line variant | Keep `w-full` in `tabs.tsx` line variant |
| Filter dropdown hugging label | `<SelectTrigger>` (no width) | `<SelectTrigger className="w-auto min-w-[80px]">` |
| Table data cell | `className="text-muted-foreground"` | No class (inherits `text-foreground`) |
| Right-aligned pagination | `<Pagination>` | `<Pagination className="justify-end">` |
| Breadcrumb current page | `<BreadcrumbPage>table_name</BreadcrumbPage>` | Trailing `<BreadcrumbSeparator />` only |
| Icon before h2 title | `inline-flex` span wrapper | React fragment + `inline-block align-middle` on SVG |
| Metadata badges below title | `description` prop on PageHeader | Standalone `<div>` after `<PageHeader />` |
| Certified icon in badge | `CertifiedFillSmallIcon` | `CertifiedFillIcon size={12}` |
| Detail page left section | Unbounded content | `overflow-hidden rounded-md border border-border` card with `bg-muted` header |
| Detail page right sidebar | Individual card borders | `divide-y divide-border` container, no panel borders |
| Action slot in component | `[Action]` text/frame | Real `buttonComponent.createInstance()` |
| Figma variant set | `combineAsVariants` then position | Position `x` offsets first, then `combineAsVariants` |
| Text in use_figma script | `{ family: "SF Pro", style: ... }` | `{ family: "SF Pro Text", style: ... }` |
