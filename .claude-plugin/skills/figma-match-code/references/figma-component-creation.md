# Figma Component Creation Guide

Patterns and rules for creating components in the Databricks UI starter kit Figma file (`KHFOMM4oUyT9XgeeXpbzns`).

---

## 1. Always use tokens, styles, and real components — never hardcode

| What you need | Correct approach | Wrong approach |
|---|---|---|
| A color | `figma.variables.importVariableByKeyAsync(key)` + `setBoundVariable` | `fills = [{ type: "SOLID", color: { r: 0.13, g: 0.44, b: 0.71 } }]` |
| A text style | `figma.importStyleByKeyAsync(key)` + `setTextStyleIdAsync` | `fontSize = 13` or `fontName = { family: "SF Pro" }` |
| An icon | `figma.importComponentByKeyAsync(key)` → create instance | Drawing a 14×14 frame placeholder |
| A primitive (Button, Input…) | `importComponentSetByKeyAsync` → find variant → `createInstance()` | Recreating the shape from scratch |

Token variable keys and component keys can be discovered via the Figma MCP `get_variable_defs` and `search_design_system` tools against file key `KHFOMM4oUyT9XgeeXpbzns`.

---

## 2. Always embed real component instances for interactive slots

**The problem:** When building composite components (Empty, Card, etc.) that contain an action slot, it's tempting to drop a text placeholder like `[Action]`. This is wrong — Code Connect maps the codebase's `<Button>` to Figma's Button component, so the Figma design must also embed a real Button instance.

**The rule:** Any slot in a Figma component that maps to a React component (`Button`, `Input`, `Badge`, etc.) must be a real imported instance, not a frame/text placeholder.

### Correct pattern

```js
// Import the component variant you need
const buttonComponent = await figma.importComponentByKeyAsync(
  "b56a945f378b71524d2caf03e6689fe702fa3f5f" // Variant=default, Size=sm
);

// Create an instance and customize the label
const btn = buttonComponent.createInstance();
const label = btn.findOne(n => n.type === "TEXT");
if (label) {
  await figma.loadFontAsync(label.fontName);
  label.characters = "Create new";
}

// Insert into parent's auto-layout at the right index
parent.insertChild(index, btn);
```

### Finding the right variant key

All Button variant keys are in `memory/figma_node_map.md`. Quick reference:

| Variant | Key |
|---|---|
| default / sm | `b56a945f378b71524d2caf03e6689fe702fa3f5f` |
| outline / sm | `82a0b4ee3b38fd1ceb3422a39e52d2b4f30c0612` |
| ghost / sm | `17e45dbbe09e72396230761d490300d408c53aac` |
| default / xs | `3eae3fca5ba45e108f16cd872ca9d3f204b9d0de` |
| ghost / icon-sm | `a5a1dd3b1a20014c772a4b5a8a390605dca03c90` |

### Replacing an existing placeholder

If a placeholder text node already exists, swap it in place to preserve auto-layout order:

```js
const placeholders = parent.findAll(n => n.type === "TEXT" && n.name === "[Action]");
for (const node of placeholders) {
  const idx = node.parent.children.indexOf(node);
  const btn = buttonComponent.createInstance();
  node.parent.insertChild(idx, btn);
  node.remove();
}
```

---

## 3. Always apply auto-layout to component sets after creation

**`combineAsVariants` requires `COMPONENT` children — not frames.** Use `figma.createComponent()`, never `figma.createFrame()`, when building variants for a component set. Passing frames throws: *"Cannot move node. A COMPONENT_SET node cannot have children of type other than COMPONENT"*.

```js
// ❌ Throws — createFrame() produces a FRAME, not a COMPONENT
const v1 = figma.createFrame();
v1.name = "State=Default";
figma.combineAsVariants([v1, v2], page); // ← error

// ✅ Correct
const v1 = figma.createComponent();
v1.name = "State=Default";
const v2 = figma.createComponent();
v2.name = "State=Hover";
const set = figma.combineAsVariants([v1, v2], page);
```

**The problem:** `figma.combineAsVariants()` and `ComponentSetNode.appendChild()` leave every variant at `(0, 0)` with no spacing — all variants are stacked invisibly on top of each other.

**The fix:** Call this helper immediately after `combineAsVariants` or after the last `appendChild`:

```js
function layoutComponentSet(set) {
  set.layoutMode         = "HORIZONTAL";
  set.layoutWrap         = "WRAP";
  set.itemSpacing        = 32;   // gap between variants
  set.counterAxisSpacing = 32;   // gap between wrapped rows
  set.paddingLeft        = 40;
  set.paddingRight       = 40;
  set.paddingTop         = 40;
  set.paddingBottom      = 40;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
}

// After combineAsVariants:
const set = figma.combineAsVariants(variants, page);
set.name = "MyComponent";
layoutComponentSet(set);   // ← always do this

// After appending new variants to an existing set:
existingSet.appendChild(newVariant);
layoutComponentSet(existingSet);  // ← re-run to reflow
```

Apply to **every** component set — no exceptions, no matter how few variants.

---

## 4. Active/selected state: use `primary` for text, `action/hover` for hover background

`action/hover` (`VariableID:1065:1060`, key `0422680699b474957c6b3152565b03dbda70c705`) is a **background overlay** — its resolved color includes 8% alpha. Binding it to a text fill makes the text 8% opaque (unreadable). It is designed for hover-state backgrounds only.

| Element | Variable | Note |
|---|---|---|
| Active/selected text label | `primary` (`35a88d92...`) at opacity=1 | Full-opacity blue |
| Inactive text | `foreground` (`e3cf81e7...`) at opacity=1 | |
| Active background (rest) | `primary` at 5% opacity | `bg-primary/5` in code |
| Active background (hover) | `action/hover` bound to fill | Its own 8% alpha renders correctly |

```js
// ✅ Text label on active state
const p = { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 1 };
labelNode.fills = [figma.variables.setBoundVariableForPaint(p, "color", primaryVar)];

// ✅ Hover-state background
variant.fills = [figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 1 },
  "color", actionHoverVar  // variable's own alpha (8%) applies automatically
)];

// ❌ Never use action/hover as a text color — it renders at 8% opacity
labelNode.fills = [figma.variables.setBoundVariableForPaint(p, "color", actionHoverVar)];
```

**Warning:** `setBoundVariableForPaint` with `action/hover` always produces `opacity: 0.08` in the readback regardless of the opacity you pass on the base paint. This is expected — the variable's alpha takes precedence. Do not try to "fix" the opacity by passing `opacity: 1` on the paint object; for a background this is correct behavior.

## 5. TreeItem icon slots — always target by slot name

The `TreeItem` component (node `1328:20`) has two distinct icon slots inside the `Content` frame:

```
Content
├── ChevronSlot → Icons/ChevronRight  (the expand arrow)
└── IconSlot    → Icons/Schema        (the item type icon)
```

**Never** use `findOne(n => n.name.toLowerCase().includes("icon"))` — it matches `Icons/ChevronRight` first (the name starts with `"Icons/"`) and swaps the chevron instead of the type icon.

```js
// ✅ Correct
const chevSlot = inst.findOne(n => n.name === "ChevronSlot");
const iconSlot  = inst.findOne(n => n.name === "IconSlot");
chevSlot.children[0].swapComponent(chevronComp); // restore/set chevron
iconSlot.children[0].swapComponent(typeIconComp); // set schema/catalog/table/etc.

// Get chevronComp from the component definition (not an icon import):
const treeItemSet = await figma.getNodeByIdAsync("1328:20");
const lvl1 = treeItemSet.children.find(c => c.name.includes("Level=1") && c.name.includes("nav"));
const chevronComp = lvl1.findOne(n => n.name === "ChevronSlot").children[0].mainComponent;

// ❌ Wrong — matches Icons/ChevronRight first, swaps the chevron
inst.findOne(n => n.type === "INSTANCE" && n.name.toLowerCase().includes("icon"))
    .swapComponent(typeIconComp);
```

Level 0 (section headers) have no icon argument — skip them. Level 2 items still have both slots; ChevronSlot may be invisible in that variant but `IconSlot` still needs the correct type icon.

## 6. Variant naming convention

Figma reads variant property/value from the component's `name` field using `Property=Value` syntax, comma-separated for multiple properties:

```js
variantSmall.name  = "Size=small";
variantMedium.name = "Size=default";
variantLarge.name  = "Size=large";
```

Multiple properties:
```js
frame.name = "Size=small, State=default";
frame.name = "Size=small, State=disabled";
```

The set's name becomes the component name shown in Figma's asset panel.

---

## 7. Applying variable bindings to a component

After creating an instance or frame, bind fill/stroke/text to Figma variables — never hardcode values.

**Correct pattern** (`figma.variables.setBoundVariableForPaint` is a static method on `figma.variables`, not on the node):

```js
const variable = await figma.variables.importVariableByKeyAsync("e3cf81e7...");
const paint = { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 1 };
node.fills = [figma.variables.setBoundVariableForPaint(paint, "color", variable)];
```

Variable keys for all semantic tokens are in `memory/figma_node_map.md`.

---

## 8. Components created in this file

All components and their node IDs are tracked in `memory/figma_node_map.md`. Before creating any component, check there first to avoid duplicates.

| Component | Node | Variants | Positioned width |
|---|---|---|---|
| Spinner | 1200-171 | small / default / large | 120px |
| Empty | 1201-25 | HasTitle × HasAction (4 variants) | 1672px |
| NotebookCell | 1203-43 | Python / SQL / Markdown / Scala / R | 3096px |
| Tree | 1204-33 | default / nav | 504px |
| SidePanel | 1205-11 | (single) | 280px |
| EditorTabBar | 1211-25 | default / active | 1224px |
| FilterPill | 1643:468 | Active × HasIcon × Hover (8 variants) | auto-layout |
| CatalogListRow | 1643:491 | State(Default/Hover) | auto-layout |

---

## 9. Checklist before publishing a new component

- [ ] All fills bound to Figma variables (no raw hex)
- [ ] All text nodes bound to text styles (no manual font size/weight)
- [ ] All icon slots use real icon instances (no placeholder frames)
- [ ] `layoutComponentSet(set)` called after `combineAsVariants` or final `appendChild`
- [ ] Component set has auto-layout (layoutMode=HORIZONTAL, wrap=WRAP, gap=32, padding=40)
- [ ] Node ID recorded in `memory/figma_node_map.md`
- [ ] Code Connect entry added to `src/figma-code-connect.figma.tsx`
- [ ] Audit status updated in `docs/audit-status.md`
