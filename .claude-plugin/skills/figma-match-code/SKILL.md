---
name: figma-match-code
description: Update any Figma frame or page to visually match the current codebase. Use when the user says "update Figma to match code", "sync this screen", "make Figma match the landing page", "rebuild this frame from the code", or "the Figma design is out of date".
---

# Figma Match Code

Rebuilds or updates a Figma frame to match what is currently in the codebase, using real component instances, design tokens, and text styles — no hardcoded values.

## Capabilities

- Read a React/Next.js page and translate its layout to Figma nodes via the Plugin API
- Rebuild frames using component instances, token variables, and text styles
- Handle auto-layout, text wrapping, and any UI primitive (Button, Input, Select, Badge, Table, Tabs, Dialog, Alert, Card, icons, etc.)
- Force canvas repaint after programmatic edits (stale render fix)
- Verify changes via plugin readback when screenshots are cached

## Workflow

### Phase 0: Component gap audit (REQUIRED — do this before touching Figma)
1. Read the target page file
2. List every sub-component defined inline or imported from `@/components` that appears 2+ times
3. For each, check whether a Figma component already exists using two sources:
   - **`docs/figma-node-map.md`** (committed to the repo) — the canonical list of component node IDs and variable keys for this file. If this file doesn't exist yet on your checkout, generate it by running the discovery script below.
   - **Figma MCP tool `search_design_system("ComponentName")`** — searches the live Figma file by name; always works regardless of whether the doc exists.

   **First-time / fresh checkout discovery script** (run via `use_figma` if `docs/figma-node-map.md` is missing):
   ```js
   const allComponents = figma.root.children.flatMap(p =>
     p.findAll(n => n.type === "COMPONENT" || n.type === "COMPONENT_SET")
   );
   return allComponents.map(n => ({ name: n.name, id: n.id, key: n.key, page: n.parent?.name }));
   ```
   Paste the output into `docs/figma-node-map.md` and commit it so teammates don't have to re-run it.
4. **Stop here** — present the gap list to the user or resolve it before proceeding:
   - **Exists in Figma** → note the node ID, use `importComponentByKeyAsync` later
   - **Missing from Figma** → create it as a proper Figma component first (token-bound fills, text styles, auto-layout), publish it, record its node ID
5. Never use a raw frame as a stand-in for a component that should exist — create it first

### Phase 1: Read the code
1. Read the target page file (e.g. `src/app/page.tsx`)
2. Identify sections: header, hero, cards/grid, footer
3. Note exact strings, component variants, icon names, and layout values

### Phase 2: Inspect the Figma frame
1. Use `get_screenshot` to see current state
2. Use `use_figma` to inspect frame children, dimensions, and page structure
3. Note which nodes need to be cleared vs reused

### Phase 3: Gather resources (before clearing anything)
1. Import variables via `importVariableByKeyAsync` — never use raw hex
2. Import text styles via `importStyleByKeyAsync` — never set fontSize/fontName manually
3. Import component keys for all UI primitives (Button, Input, Select, Badge, Table, Tabs, Dialog, Alert, Card, icons, etc.) via `importComponentByKeyAsync` — check `docs/figma-node-map.md` for node IDs and keys, or run `search_design_system` if the doc is missing
4. **Clone any existing nodes you'll reuse BEFORE clearing the frame** — once removed they're gone
5. Load all fonts upfront with `loadFontAsync` — include both Regular and Semibold for SF Pro

### Phase 4: Rebuild the frame
Follow the rules in `references/plugin-api-gotchas.md` for every node you create.

### Phase 5: Verify
1. **Always verify via API readback** — `findAll(n => n.type === "TEXT").map(t => t.characters)`. This is the only reliable source of truth.
2. Do not use `get_screenshot` to confirm text overrides — both the screenshot tool and the canvas are lazy-rendered and will show stale content until a user interacts with the file.
3. If readback is correct, the work is done. Tell the user to open Figma and click into the frame to trigger the canvas repaint.

## Resources

### References
- `references/plugin-api-gotchas.md`: Critical Figma Plugin API behaviours — sizing modes, text wrapping, SF Pro Text font fix, stale render fix, cloning gotchas. **Read before writing any `use_figma` code.**
- `references/figma-1to1-mapping.md`: Pitfalls translating code to Figma and back — tabs width, select sizing, table cell colors, pagination alignment, breadcrumb rules, SF Pro font issue.
- `references/figma-component-creation.md`: How to create Figma components correctly — token bindings, real component instances, variant positioning, naming convention, publish checklist.
- `references/figma-icon-system.md`: How to import DuBois SVG icons into Figma — correct structure, 4 failure modes (winding rule, split paths, stray strokes, scaling), fix scripts.
- `references/design-tokens-guide.md`: Full token inventory (Color + Typography), variable keys quick reference, sync scripts, and how to create new tokens in both code and Figma.

## Examples

### Example: Update a frame from the landing page
User says: "update the landing page frame in Figma to match the code"
Steps: Read `src/app/page.tsx` → inspect the target frame → clone any reused nodes before clearing → rebuild header/hero/cards/footer → nudge to repaint

### Example: Sync a screen to code
User says: "the Jobs page in Figma is out of date, sync it to the code"
Steps: Read `src/app/(demo)/jobs/page.tsx` → find the Jobs screen frame → clear and rebuild using PageHeader + Table + FilterBar component instances
