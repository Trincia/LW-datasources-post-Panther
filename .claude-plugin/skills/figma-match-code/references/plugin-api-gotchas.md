# Figma Plugin API Gotchas

Critical behaviours discovered when rebuilding Figma frames to match code. Read before writing any `use_figma` script.

---

## Sizing Modes

**`"AUTO"` not `"HUG"`** — the Plugin API uses `"AUTO"` for hug-contents, not `"HUG"`.
```js
frame.primaryAxisSizingMode = "AUTO";   // ✅ hugs height
frame.primaryAxisSizingMode = "HUG";    // ❌ throws validation error
```

**`resize()` resets both sizing modes to `"FIXED"`** — always re-set the modes you want after calling `resize()`.
```js
frame.resize(512, 10);
frame.primaryAxisSizingMode = "AUTO"; // re-enable height hugging after resize
```

**`layoutSizingHorizontal = "FILL"` must be set AFTER appending to parent** — the node must already be a child of an auto-layout frame or it throws.
```js
parent.appendChild(child);          // append first
child.layoutSizingHorizontal = "FILL"; // then set fill sizing
```

---

## Text Nodes

**Text wrapping** — to get a fixed-width text node that wraps height:
```js
textNode.resize(desiredWidth, 80);   // set width; use generous height (not 1)
textNode.textAutoResize = "HEIGHT";  // set AFTER resize — resize() resets this to "NONE"
```
The height reads as the value you passed until Figma's layout engine recalculates after the plugin exits. That's expected.

**Font must be loaded before setting `characters`** — and you must load the *exact* fontName the text node uses. Component text nodes often use `Semibold`, not `Regular`.
```js
const textNode = instance.findOne(n => n.type === "TEXT");
await figma.loadFontAsync(textNode.fontName); // use the node's actual fontName
textNode.characters = "New label";
```

**Use `"SF Pro Text"`, not `"SF Pro"`** — in the Plugin API, `{ family: "SF Pro", style: "Regular" }` loads correctly but renders all glyphs with zero advance width (text is invisible/zero-width). Always use `"SF Pro Text"` instead:
```js
// ❌ Renders as zero-width text (invisible)
await figma.loadFontAsync({ family: "SF Pro", style: "Regular" });

// ✅ Correct
await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
textNode.fontName = { family: "SF Pro Text", style: "Regular" };
```
This applies to all styles: Regular, Medium, Semibold, Bold. When reading `fontName` from an existing text node, it will already say `"SF Pro Text"` — use that value directly via `loadFontAsync(textNode.fontName)` to avoid the issue.

**`setProperties()` on component instances is unreliable** — it often silently fails without an error. Use `detachInstance()` + direct `characters` edit instead.
```js
// ❌ Often fails silently
instance.setProperties({ "Label#39:0": "GitHub" });

// ✅ Reliable
const detached = instance.detachInstance(); // replaces instance in parent
const t = detached.findOne(n => n.type === "TEXT");
await figma.loadFontAsync(t.fontName);
t.characters = "GitHub";
```

---

## Stale Canvas Render

Instance text overrides committed via the Plugin API are correct in the document model immediately, but **Figma's visual renderer is lazy** — it does not repaint until the user interacts with the file (e.g. clicking into a component). There is no programmatic way to force a full canvas repaint for instance text overrides.

**Neither the canvas nor `get_screenshot` can be reliably fixed from the plugin API.**

| | Behavior |
|---|---|
| **Document model** | Always correct immediately — source of truth |
| **Figma canvas** | Updates when user clicks/interacts — not controllable from plugin |
| **`get_screenshot` tool** | Independent cache — always stale after changes |

**The only reliable verification is API readback:**
```js
// ✅ Authoritative — reflects actual document state
const inst = await figma.getNodeByIdAsync("1626:435");
return inst.findAll(n => n.type === "TEXT").map(t => t.characters);
// → ["Owner", "Jocelyn Hickcox"] — correct even if canvas shows "Label/Value"
```

Do not use `get_screenshot` or visual inspection to verify programmatic changes. If readback is correct, the file is correct — the designer will see it properly when they open and interact with the frame.

---

**Never create a component and instantiate it in the same plugin run** — text overrides on instances will appear correct in the API but render stale on the canvas. The renderer hasn't fully processed the new component yet within the same execution context. Split into two `use_figma` calls: one to create the component, one to build the screen.

```js
// ❌ Same run: component created then immediately instantiated with text override
const comp = figma.createComponentFromNode(frame);
const inst = comp.createInstance();
inst.findOne(n => n.type === "TEXT").characters = "Owner"; // API correct, canvas stale

// ✅ Run 1: create the component (get its node ID from the return value)
// ✅ Run 2: getNodeByIdAsync + createInstance + visible toggle at the end
const comp = await figma.getNodeByIdAsync("1612:417");
const inst = comp.createInstance();
inst.findOne(n => n.type === "TEXT").characters = "Owner";
inst.visible = false; inst.visible = true; // force repaint
```

---

## Just-Created Components: Use `getNodeById`, Not `importComponentByKeyAsync`

`importComponentByKeyAsync` only works for **published** library components. If you create a component in run 1 and need to instantiate it in run 2, the component exists in the file but hasn't been published — `importComponentByKeyAsync` will throw "Component with key X not found".

**Solution:** capture the node ID from run 1's return value, then use `figma.getNodeById(id)` in run 2.

```js
// Run 1 — create the component, return its ID
const set = figma.combineAsVariants([defaultComp, hoverComp], figma.currentPage);
set.name = "SuggestionPill";
return { id: set.id, defaultVariantId: set.children[0].id };

// Run 2 — find it by ID, not by key
const pillComp = figma.getNodeById("1684:10"); // ✅ works for unpublished
const inst = pillComp.createInstance();

// ❌ This will throw "Component with key ... not found"
const pillComp = await figma.importComponentByKeyAsync("6f8fbfb5...");
```

---

## Button icon-xs instances: always swap the inner icon

When you instantiate `Button ghost/icon-xs` (or any icon-only button), the inner icon is whatever is set as default in the component — often a sparkle placeholder. You must explicitly swap it for every button instance:

```js
const btnGhostXs = await figma.importComponentByKeyAsync("8492689149c0486621b388ed3ab35d06d6731ce0");
const iconClose  = await figma.importComponentByKeyAsync("164a0d7792675cff5cd40002a401df4e94942ec6");

const btn = btnGhostXs.createInstance();
btn.name = "Close";

// ❌ Inner icon is still the default sparkle
parent.appendChild(btn);

// ✅ Swap after appending
parent.appendChild(btn);
const innerIcon = btn.findOne(n => n.type === "INSTANCE");
if (innerIcon) innerIcon.swapComponent(iconClose);
```

Helper for building icon buttons in one call:
```js
function makeIconBtn(btnComp, iconComp, label) {
  const btn = btnComp.createInstance();
  btn.name = label;
  return { btn, swap: (parent) => {
    parent.appendChild(btn);
    btn.findOne(n => n.type === "INSTANCE")?.swapComponent(iconComp);
  }};
}
```

---

## Cloning Nodes Across Pages / Before Clearing

**Clone nodes you need BEFORE you clear the parent frame** — removed nodes are gone permanently.
```js
// ✅ Clone logo before clearing cover frame
const logoClone = logoNode.clone();
figma.currentPage.appendChild(logoClone); // park at page level
// ... now safe to clear the frame
for (const c of [...frame.children]) c.remove();
// ... later use logoClone
headerLeft.appendChild(logoClone);
```

**Cloning from another page** — `clone()` puts the copy in the same parent. Immediately append it to the target page/frame to move it across.
```js
const logoCopy = shellPage.topBar.logo.clone(); // clone is in Shell page
myFrame.appendChild(logoCopy);                   // moves it to Cover page
```

---

## Screenshots & Verification

**`get_screenshot` returns cached images** — the screenshot tool may return the same image even after changes. Always verify by reading values back through the plugin:
```js
// Verify text updated
const t = node.findOne(n => n.type === "TEXT");
return t.characters; // authoritative — not the screenshot
```

**Screenshot a specific small node** to bypass full-frame cache: use the card or button's node ID rather than the whole page frame.

---

## Icons and Badges — Always Use Component Instances

**Never use placeholder rectangles or raw frames for icons or badges.** Always import and instantiate the real component.

```js
// ❌ Wrong — placeholder rect for an icon
const icon = figma.createRectangle();
icon.resize(12, 12);

// ✅ Correct — real icon instance
const tableIcon = await figma.importComponentByKeyAsync("9fff29c3b9592b83543cf766f3044cc95b5a03e4"); // Icons/Table
const iconInst = tableIcon.createInstance();
iconInst.resize(12, 12);

// ❌ Wrong — raw frame styled to look like a badge
const tb = figma.createFrame();
tb.cornerRadius = 4;
// ... manual fills, text node

// ✅ Correct — real Badge instance with text override
const badge = await figma.importComponentByKeyAsync("95186d8a0f342adc570e541e8c032a3233735526"); // Badge/teal
const inst = badge.createInstance();
parent.appendChild(inst); // append first
const t = inst.findOne(n => n.type === "TEXT");
await figma.loadFontAsync(t.fontName);
t.characters = "Certified";
inst.visible = false; inst.visible = true; // repaint after append
```

**Icon component keys** (Icons page):
| Code import | Figma key |
|---|---|
| `TableIcon` | `9fff29c3b9592b83543cf766f3044cc95b5a03e4` |

**Badge variant keys**:
| Variant | Key |
|---|---|
| `default` | `45bc59f26401460769c4e74a2eff3546bc5c4c1c` |
| `secondary` | `fdc6f9605181ffc879ddd8895e9883fa183652ac` |
| `destructive` | `92339e6ac02001e35d779a6da94b9880e8f0de97` |
| `teal` | `95186d8a0f342adc570e541e8c032a3233735526` |
| `indigo` | `176bd201a80cdf19c2f9240fc02369e2a4141ea8` |
| `coral` | `fbfaa74466d3ece318b3ef54c676394d881adb91` |
| `lemon` | `c855887a25e68990d3e63499ecb8d6cfff8f658a` |

For other icon keys: search the Icons page with `figma.root.children.find(p => p.name === "Icons").findAll(n => n.type === "COMPONENT" && n.name.includes("YourIcon"))`.

---

## Token & Style Binding

**`setBoundVariableForPaint` returns a new paint — it does NOT mutate the original.** This is the most common source of "everything is black" bugs. Always use the return value:

```js
// ❌ Bug — fill is still plain black, variable binding is discarded
const fill = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
figma.variables.setBoundVariableForPaint(fill, "color", bgVar);
node.fills = [fill]; // ← unbound, renders black

// ✅ Correct — use the returned bound paint
function vFill(variable) {
  return figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", variable
  );
}
node.fills = [vFill(bgVar)];
```

Always use tokens, never raw values:
```js
// ✅ Bind to semantic variable
node.fills = [figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", bgVar
)];

// ✅ Apply text style
textNode.textStyleId = bodyBaseStyle.id;

// ❌ Never hardcode
node.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
textNode.fontSize = 13;
```

Strokes with bottom-only border (like a header border-b):
```js
node.strokeAlign = "INSIDE";
node.strokeBottomWeight = 1;
node.strokeTopWeight = 0;
node.strokeLeftWeight = 0;
node.strokeRightWeight = 0;
```
