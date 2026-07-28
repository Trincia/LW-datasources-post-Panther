# Figma Icon System — Import & Drawing Guide

This guide covers how to correctly import DuBois SVG icons into Figma, the four failure modes discovered during the initial 445-icon import, and the fix scripts to run each time new icons are added.

**Figma file:** `KHFOMM4oUyT9XgeeXpbzns` — Icons page
**Code source:** `src/components/icons/` (synced from `~/universe/design-system/…/__generated/icons`)

---

## Correct Icon Component Structure

Every icon component must match this shape:

```
COMPONENT (16×16, layoutMode=NONE, FIXED sizing)
  └─ VECTOR  ← sits directly inside the component, no wrapper frame
       constraints: { horizontal: SCALE, vertical: SCALE }
       fills: [{ type: SOLID, color: { r:0, g:0, b:0 } }]
       strokes: []
       vectorPaths: single EVENODD entry (for any path with holes)
```

**No intermediate FRAME.** Vectors must be direct children of the component.

---

## Step-by-Step: Adding New Icons

Run these steps in order whenever new icons are synced via `node scripts/sync-icons.mjs`.

### Step 1 — Sync the code

```bash
node scripts/sync-icons.mjs
```

This writes new `src/components/icons/*.tsx` files and regenerates `index.ts`. Icons are not yet in Figma.

---

### Step 2 — Create Figma components (import via Plugin API)

New icon components are typically created with an intermediate `FRAME "vector"` wrapper from the import process. Run this script on the Icons page to fix the structure for all new components:

```js
// Run on the Icons page
const page = figma.root.children.find(p => p.name === "Icons");
const comps = page.findAll(n => n.type === "COMPONENT");

for (const comp of comps) {
  // Skip already-correct components (vectors already direct children)
  const directVectors = comp.children.filter(c => c.type === "VECTOR");
  if (directVectors.length > 0) continue;

  const frame = comp.children.find(c => c.type === "FRAME");
  if (!frame) continue;

  const vectors = frame.findAll(n => n.type === "VECTOR" || n.type === "GROUP");

  // Lift children out of the wrapper frame
  for (const v of vectors) {
    comp.appendChild(v);
  }
  frame.remove();

  // Set component to no auto-layout
  comp.layoutMode = "NONE";
  comp.resize(16, 16);

  // Clear stray fills on the component root
  comp.fills = [];

  // Set SCALE constraints on all vectors
  const allVecs = comp.findAll(n => n.type === "VECTOR");
  for (const vec of allVecs) {
    vec.constraints = { horizontal: "SCALE", vertical: "SCALE" };
  }

  // Center the vector group within 16×16
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const v of comp.children) {
    bounds.minX = Math.min(bounds.minX, v.x);
    bounds.minY = Math.min(bounds.minY, v.y);
    bounds.maxX = Math.max(bounds.maxX, v.x + v.width);
    bounds.maxY = Math.max(bounds.maxY, v.y + v.height);
  }
  const contentW = bounds.maxX - bounds.minX;
  const contentH = bounds.maxY - bounds.minY;
  const offsetX = (16 - contentW) / 2 - bounds.minX;
  const offsetY = (16 - contentH) / 2 - bounds.minY;
  for (const v of comp.children) {
    v.x += offsetX;
    v.y += offsetY;
  }
}
```

> **Special case:** Some icons have a GROUP at component level instead of VECTORs directly. GROUP nodes don't support `constraints` in the Plugin API — skip setting constraints on them. The centering math still applies.

---

### Step 3 — Fix winding rule (multi-loop NONZERO → EVENODD)

**Why this matters:** SVG compound paths with `fill-rule: evenodd` (e.g. a ring shape, icon with a cutout hole) import as `NONZERO` in Figma's `vectorNetwork`. With NONZERO, all enclosed areas fill solid — holes disappear.

Run this on all new icon components after Step 2:

```js
const page = figma.root.children.find(p => p.name === "Icons");
const vecs = page.findAll(n => n.type === "VECTOR");
let fixed = 0;

for (const vec of vecs) {
  const vn = vec.vectorNetwork;
  if (!vn?.regions) continue;

  const hasMultiLoop = vn.regions.some(r => r.loops?.length > 1 && r.windingRule === "NONZERO");
  if (!hasMultiLoop) continue;

  const updatedRegions = vn.regions.map(r =>
    r.loops?.length > 1 && r.windingRule === "NONZERO"
      ? { ...r, windingRule: "EVENODD" }
      : r
  );
  vec.vectorNetwork = { ...vn, regions: updatedRegions };
  fixed++;
}

return `Fixed ${fixed} vectors`;
```

---

### Step 4 — Fix split compound paths (NONE windingRule)

**Why this matters:** Some SVG compound paths get split into multiple `vectorPaths` entries during import. Any entry with `windingRule: "NONE"` renders nothing — the shape is invisible. Holes that should punch through also disappear because separate entries don't share fill-rule depth counting.

**Detection:**

```js
// Any vector with 2+ entries where at least one is NONE
const hasSplitCompound = vec.vectorPaths.length >= 2 &&
  vec.vectorPaths.some(p => p.windingRule === "NONE");
```

**Fix — combine all sub-paths into a single EVENODD entry:**

```js
const page = figma.root.children.find(p => p.name === "Icons");
const vecs = page.findAll(n => n.type === "VECTOR");
let fixed = 0;

for (const vec of vecs) {
  if (vec.vectorPaths.length < 2) continue;
  if (!vec.vectorPaths.some(p => p.windingRule === "NONE")) continue;

  // Check if ALL sub-paths are meant to fill (no holes) — e.g. bracket corner shapes
  // In that case keep them separate as NONZERO, don't merge.
  // You must visually verify this for any new icons that hit this branch.
  const allShouldFill = false; // set manually if needed

  if (allShouldFill) {
    vec.vectorPaths = vec.vectorPaths.map(p => ({ ...p, windingRule: "NONZERO" }));
  } else {
    const combined = vec.vectorPaths.map(p => p.data).join(" ");
    vec.vectorPaths = [{ windingRule: "EVENODD", data: combined }];
  }
  fixed++;
}

return `Fixed ${fixed} vectors`;
```

> **Exception (ZoomMarqueeSelection brackets):** The bracket corner sub-paths have no holes — all sub-paths fill. Keep them as two separate `NONZERO` entries rather than merging.

---

### Step 5 — Clear stray strokes

Stray strokes from the sync process add unexpected visual weight at scaled sizes and show as pink anchor dots in Figma's selection view.

```js
const page = figma.root.children.find(p => p.name === "Icons");
const vecs = page.findAll(n => n.type === "VECTOR");
let cleared = 0;

for (const vec of vecs) {
  if (vec.strokes.length > 0) {
    vec.strokes = [];
    cleared++;
  }
}

return `Cleared strokes on ${cleared} vectors`;
```

---

### Step 6 — Verify (spot-check)

After running all four fix scripts, spot-check these representative cases:

| Check | Icon to use | What to look for |
|---|---|---|
| Compound hole | `BriefcaseFill`, `CheckCircleFill` | Handle or checkmark cutout is visible |
| Head ring | `UserKey`, `UserTeam` | Circle around head is hollow, not filled |
| Magnifying glass | `ZoomMarqueeSelection` | Glass center is transparent |
| Selection brackets | `ZoomMarqueeSelection` (brackets vector) | Corner marks are solid filled |
| Stroke dots | Any icon, select it | No pink anchor dots in selection |
| Scaling | Any icon, resize instance to 24×24 | Stays proportional, no stroke weight change |

---

## Drawing New Icons Manually in Figma

If you're drawing a new icon from scratch (not synced from code):

1. **Component size:** Create as exactly 16×16. Set `layoutMode = "NONE"`.
2. **Vector layer:** Use the Pen tool to draw directly inside the component. Do not wrap in a frame.
3. **Fill:** Set fill to solid black `#000000`. No fills on the component container.
4. **Strokes:** None. Zero strokes.
5. **Constraints:** Set `horizontal: SCALE, vertical: SCALE` on the vector layer.
6. **Winding rule:** If your path has holes (a cutout, a ring, an enclosed negative space), use EVENODD in both `vectorPaths` and `vectorNetwork.regions`. Simple closed shapes without holes: NONZERO is fine.
7. **Compound paths with holes:** Keep all sub-paths in a **single** `vectorPaths` entry with `EVENODD`. Never split them into separate entries — separate entries cannot interact to punch holes.
8. **Centering:** Visually confirm the icon glyph is centered within the 16×16 bounding box.

---

## Failure Mode Reference

| Symptom | Root cause | Fix |
|---|---|---|
| Icon doesn't scale when instance is resized | FRAME wrapper around vectors; constraints not SCALE | Step 2 |
| Icon fills solid where there should be holes (cutout, handle, ring) | `vectorNetwork` region has `NONZERO` on a multi-loop path | Step 3 |
| Icon shape is invisible or partially invisible | `vectorPaths` entry has `windingRule: "NONE"` (split compound path) | Step 4 |
| Pink anchor dots on selection; unexpected visual weight at small sizes | Stray `strokes` on VECTOR nodes | Step 5 |
| Icon looks like a colored rectangle, not a colored glyph | Fills set on the COMPONENT/INSTANCE container, not on the VECTOR inside | Set fills only on the VECTOR child |

---

## Color Usage

- Base fill on all vectors is black `{ r:0, g:0, b:0 }`.
- To colorize an icon when placing it inside another component (e.g. NavItem), traverse into the VECTOR and set fills there.
- **Never** set fills on the COMPONENT or INSTANCE container — that creates a solid colored rectangle, not a colored icon.
- Bind to the `icon/fill` variable (`VariableID:509:308`) when the icon should respond to the design system's semantic color (e.g. muted-foreground in the nav).

---

## Icons with Known Structural Quirks

These icons required non-standard fixes during the initial import and should be re-verified after any re-sync:

| Icon | Issue | Resolution |
|---|---|---|
| `WorkflowCode` | Main shape was invisible (NONE windingRule) | Combined to single EVENODD vectorPaths |
| `WorkflowCube` | Main shape was invisible | Combined to single EVENODD vectorPaths |
| `UserTeam` | Head ring circles not hollow | Combined to single EVENODD vectorPaths |
| `UserSparkle` | Body partially invisible | Combined to single EVENODD vectorPaths |
| `UserHomeVolume` | Shape partially invisible + stray strokes | Combined EVENODD + cleared strokes |
| `UserKey` | Head ring + key circles not hollow + stray strokes | Combined EVENODD + cleared strokes |
| `WrenchSparkle` | Shapes partially invisible | Combined to single EVENODD vectorPaths |
| `PencilSparkle` | Main shape invisible | Combined to single EVENODD vectorPaths |
| `ZoomMarqueeSelection` | Glass not hollow; brackets must stay split as NONZERO | Glass: merged EVENODD; brackets: kept as 2× NONZERO |
| `AzVertical`, `BracketsX`, `CalendarRange`, `CatalogGear`, `CatalogOff`, `Certified` | GROUP at component level instead of VECTORs | Centered the GROUP; no constraints (Plugin API limitation) |
