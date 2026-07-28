#!/usr/bin/env node
/**
 * sync-tokens.mjs
 *
 * Reads DuBois token JSON files from universe/design-system and syncs:
 *   1. src/app/globals.css — @theme primitives + :root / .dark semantic vars
 *   2. Figma variables (color primitives + semantic aliases) via REST API
 *      — requires FIGMA_ACCESS_TOKEN env var and --figma flag
 *
 * Usage:
 *   node scripts/sync-tokens.mjs              # dry-run: prints diff only
 *   node scripts/sync-tokens.mjs --apply      # patches globals.css in-place
 *   FIGMA_ACCESS_TOKEN=xxx node scripts/sync-tokens.mjs --apply --figma
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const TOKENS_DIR = '/Users/joy/universe/design-system/src/theme/tokens';
const GLOBALS_CSS = join(ROOT, 'src/app/globals.css');
const FIGMA_FILE_KEY = 'KHFOMM4oUyT9XgeeXpbzns';

const APPLY  = process.argv.includes('--apply');
const FIGMA  = process.argv.includes('--figma');

// ─── 1. Load token files ───────────────────────────────────────────────────

const primitives = JSON.parse(readFileSync(join(TOKENS_DIR, 'primitives.json'),          'utf8'));
const lightTokens = JSON.parse(readFileSync(join(TOKENS_DIR, 'semantics.light_mode.json'), 'utf8'));
const darkTokens  = JSON.parse(readFileSync(join(TOKENS_DIR, 'semantics.dark_mode.json'),  'utf8'));

// ─── 2. Build primitive lookup ─────────────────────────────────────────────
// Flattens nested JSON into "Group/tokenName" → "#hex"

function buildLookup(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}/${k}` : k;
    if (v?.$value !== undefined) out[path] = v.$value;
    else if (typeof v === 'object' && v !== null) Object.assign(out, buildLookup(v, path));
  }
  return out;
}

const primLookup = buildLookup(primitives);

// ─── 3. Resolve {Primitives/...} references ────────────────────────────────

function resolveRef(value) {
  if (typeof value !== 'string') return String(value);
  const m = value.match(/^\{Primitives\/(.+)\}$/);
  if (!m) return value; // raw hex or rgba — use as-is
  const key = m[1];
  if (!primLookup[key]) throw new Error(`Unresolved primitive: "${key}"`);
  return primLookup[key];
}

// Flattens a semantics JSON object into leafTokenName → resolvedValue
function flattenSemantics(obj) {
  const out = {};
  function walk(node) {
    for (const [k, v] of Object.entries(node)) {
      if (v?.$value !== undefined) out[k] = resolveRef(v.$value);
      else if (typeof v === 'object' && v !== null) walk(v);
    }
  }
  walk(obj);
  return out;
}

const light = flattenSemantics(lightTokens);
const dark  = flattenSemantics(darkTokens);

// ─── 4. DuBois → shadcn CSS variable mapping ──────────────────────────────
// Maps each shadcn CSS var name to the DuBois semantic token key for each mode.
// DuBois light uses the Neutral palette; dark uses the Grey palette.
// Both are resolved via the shared primitives above.

const SEMANTIC_MAPPING = {
  // Core surfaces
  '--background':                  { l: 'backgroundPrimary',                    d: 'backgroundPrimary' },
  '--foreground':                  { l: 'textPrimary',                           d: 'textPrimary' },
  '--card':                        { l: 'backgroundPrimary',                    d: 'backgroundPrimary' },
  '--card-foreground':             { l: 'textPrimary',                           d: 'textPrimary' },
  '--popover':                     { l: 'backgroundPrimary',                    d: 'backgroundPrimary' },
  '--popover-foreground':          { l: 'textPrimary',                           d: 'textPrimary' },
  // Primary action
  '--primary':                     { l: 'actionPrimaryBackgroundDefault',       d: 'actionPrimaryBackgroundDefault' },
  '--primary-foreground':          { l: 'actionPrimaryTextDefault',              d: 'actionPrimaryTextDefault' },
  // Secondary surfaces
  '--secondary':                   { l: 'backgroundSecondary',                  d: 'backgroundSecondary' },
  '--secondary-foreground':        { l: 'textPrimary',                           d: 'textPrimary' },
  '--muted':                       { l: 'backgroundSecondary',                  d: 'backgroundSecondary' },
  '--muted-foreground':            { l: 'textSecondary',                         d: 'textSecondary' },
  '--accent':                      { l: 'backgroundSecondary',                  d: 'backgroundSecondary' },
  '--accent-foreground':           { l: 'textPrimary',                           d: 'textPrimary' },
  // Destructive
  '--destructive':                 { l: 'actionDangerPrimaryBackgroundDefault', d: 'actionDangerPrimaryBackgroundDefault' },
  // Borders & inputs
  '--border':                      { l: 'border',                               d: 'border' },
  '--input':                       { l: 'actionDefaultBorderDefault',           d: 'actionDefaultBorderDefault' },
  '--ring':                        { l: 'actionDefaultBorderFocus',              d: 'actionDefaultBorderFocus' },
  // Status
  '--success':                     { l: 'textValidationSuccess',                d: 'textValidationSuccess' },
  '--warning':                     { l: 'textValidationWarning',                d: 'textValidationWarning' },
  // Charts (same as their functional equivalents)
  '--chart-1':                     { l: 'actionPrimaryBackgroundDefault',       d: 'actionPrimaryBackgroundDefault' },
  '--chart-2':                     { l: 'textValidationSuccess',                d: 'textValidationSuccess' },
  '--chart-3':                     { l: 'textValidationWarning',                d: 'textValidationWarning' },
  '--chart-4':                     { l: 'actionDangerPrimaryBackgroundDefault', d: 'actionDangerPrimaryBackgroundDefault' },
  // Sidebar (mirrors main surfaces)
  '--sidebar':                     { l: 'backgroundSecondary',                  d: 'backgroundSecondary' },
  '--sidebar-foreground':          { l: 'textPrimary',                           d: 'textPrimary' },
  '--sidebar-primary':             { l: 'actionPrimaryBackgroundDefault',       d: 'actionPrimaryBackgroundDefault' },
  '--sidebar-primary-foreground':  { l: 'actionPrimaryTextDefault',              d: 'actionPrimaryTextDefault' },
  '--sidebar-accent':              { l: 'border',                               d: 'border' },
  '--sidebar-accent-foreground':   { l: 'textPrimary',                           d: 'textPrimary' },
  '--sidebar-border':              { l: 'border',                               d: 'border' },
  '--sidebar-ring':                { l: 'actionDefaultBorderFocus',              d: 'actionDefaultBorderFocus' },
  // Interaction state tints (pre-resolved rgba — Figma cannot compute var × opacity dynamically)
  '--action-default-bg-hover':     { l: 'actionDefaultBackgroundHover',         d: 'actionDefaultBackgroundHover' },
  '--action-default-bg-press':     { l: 'actionDefaultBackgroundPress',          d: 'actionDefaultBackgroundPress' },
  '--action-danger-bg-hover':      { l: 'actionDangerDefaultBackgroundHover',   d: 'actionDangerDefaultBackgroundHover' },
  '--action-danger-bg-press':      { l: 'actionDangerDefaultBackgroundPress',    d: 'actionDangerDefaultBackgroundPress' },
  // Table row states
  '--table-row-hover':             { l: 'tableBackgroundUnselectedHover',        d: 'tableBackgroundUnselectedHover' },
  '--table-row-selected':          { l: 'tableBackgroundSelectedDefault',        d: 'tableBackgroundSelectedDefault' },
  '--table-row-selected-hover':    { l: 'tableBackgroundSelectedHover',          d: 'tableBackgroundSelectedHover' },
  // Overlay + skeleton
  '--overlay':                     { l: 'overlayOverlay',                        d: 'overlayOverlay' },
  '--skeleton':                    { l: 'Skeleton',                              d: 'Skeleton' },
};

// Resolve final values
const resolved = {};
for (const [cssVar, { l, d }] of Object.entries(SEMANTIC_MAPPING)) {
  if (!light[l]) throw new Error(`Light token not found: "${l}"`);
  if (!dark[d])  throw new Error(`Dark token not found: "${d}"`);
  resolved[cssVar] = { light: light[l], dark: dark[d] };
}

// ─── 5. Primitive values for @theme ────────────────────────────────────────
// These are the DuBois palette values that go into the @theme block.
// "grey" = blue-tinted (used in dark mode semantics)
// "neutral" = true grey (used in light mode semantics)

const THEME_PRIMITIVES = {
  // Blue
  '--color-blue-100': primLookup['Blue/blue100'],
  '--color-blue-200': primLookup['Blue/blue200'],
  '--color-blue-300': primLookup['Blue/blue300'],
  '--color-blue-400': primLookup['Blue/blue400'],
  '--color-blue-500': primLookup['Blue/blue500'],
  '--color-blue-600': primLookup['Blue/blue600'],
  '--color-blue-700': primLookup['Blue/blue700'],
  '--color-blue-800': primLookup['Blue/blue800'],
  // Grey (blue-tinted — dark mode)
  '--color-grey-050': primLookup['Grey/grey050'],
  '--color-grey-100': primLookup['Grey/grey100'],
  '--color-grey-200': primLookup['Grey/grey200'],
  '--color-grey-300': primLookup['Grey/grey300'],
  '--color-grey-350': primLookup['Grey/grey350'],
  '--color-grey-400': primLookup['Grey/grey400'],
  '--color-grey-500': primLookup['Grey/grey500'],
  '--color-grey-600': primLookup['Grey/grey600'],
  '--color-grey-650': primLookup['Grey/grey650'],
  '--color-grey-700': primLookup['Grey/grey700'],
  '--color-grey-800': primLookup['Grey/grey800'],
  // Neutral (true grey — light mode)
  '--color-neutral-050': primLookup['Neutral/neutral050'],
  '--color-neutral-100': primLookup['Neutral/neutral100'],
  '--color-neutral-200': primLookup['Neutral/neutral200'],
  '--color-neutral-300': primLookup['Neutral/neutral300'],
  '--color-neutral-350': primLookup['Neutral/neutral350'],
  '--color-neutral-400': primLookup['Neutral/neutral400'],
  '--color-neutral-500': primLookup['Neutral/neutral500'],
  '--color-neutral-600': primLookup['Neutral/neutral600'],
  '--color-neutral-650': primLookup['Neutral/neutral650'],
  '--color-neutral-700': primLookup['Neutral/neutral700'],
  '--color-neutral-800': primLookup['Neutral/neutral800'],
  // Red
  '--color-red-100': primLookup['Red/red100'],
  '--color-red-200': primLookup['Red/red200'],
  '--color-red-300': primLookup['Red/red300'],
  '--color-red-400': primLookup['Red/red400'],
  '--color-red-500': primLookup['Red/red500'],
  '--color-red-600': primLookup['Red/red600'],
  '--color-red-700': primLookup['Red/red700'],
  '--color-red-800': primLookup['Red/red800'],
  // Green
  '--color-green-100': primLookup['Green/green100'],
  '--color-green-200': primLookup['Green/green200'],
  '--color-green-300': primLookup['Green/green300'],
  '--color-green-400': primLookup['Green/green400'],
  '--color-green-500': primLookup['Green/green500'],
  '--color-green-600': primLookup['Green/green600'],
  '--color-green-700': primLookup['Green/green700'],
  '--color-green-800': primLookup['Green/green800'],
  // Yellow
  '--color-yellow-100': primLookup['Yellow/yellow100'],
  '--color-yellow-200': primLookup['Yellow/yellow200'],
  '--color-yellow-300': primLookup['Yellow/yellow300'],
  '--color-yellow-400': primLookup['Yellow/yellow400'],
  '--color-yellow-500': primLookup['Yellow/yellow500'],
  '--color-yellow-600': primLookup['Yellow/yellow600'],
  '--color-yellow-700': primLookup['Yellow/yellow700'],
  '--color-yellow-800': primLookup['Yellow/yellow800'],
};

// ─── 6. Patch globals.css ──────────────────────────────────────────────────

let css = readFileSync(GLOBALS_CSS, 'utf8');
const original = css;
const changes = [];

function patchVar(varName, newValue, comment = '') {
  // Matches "  --var-name: <anything>;" with optional inline comment
  const re = new RegExp(`([ \\t]*${varName.replace(/[-]/g, '\\-')}:\\s*)([^;]+)(;[^\\n]*)`, 'g');
  const commentSuffix = comment ? `; /* ${comment} */` : ';';
  let matched = false;
  const next = css.replace(re, (_, prefix, oldVal, _semi) => {
    const trimmed = oldVal.trim();
    if (trimmed !== newValue) {
      changes.push(`  ${varName}: ${trimmed} → ${newValue}`);
    }
    matched = true;
    return `${prefix}${newValue}${commentSuffix}`;
  });
  if (matched) css = next;
}

// Patch semantic vars
for (const [cssVar, { light: lVal, dark: dVal }] of Object.entries(resolved)) {
  // We need to patch both :root and .dark separately.
  // Strategy: temporarily mark which block we're in by splitting on :root / .dark,
  // but that's fragile. Instead, patch the line value after ensuring we know context.
  // Since variable names are the same in both blocks, we'll patch by line context.
  // Simple approach: do two passes — one for :root block, one for .dark block.
  patchVar(cssVar, lVal); // patches first occurrence (inside :root)
}

// For .dark block overrides, we need to handle them separately since the
// same var name appears twice. Rebuild with a block-aware replace:
function patchBlock(blockSelector, varMap) {
  // Isolates the block and patches vars within it
  const blockRe = new RegExp(`(${blockSelector}\\s*\\{)([^}]*)(\\})`, 's');
  css = css.replace(blockRe, (match, open, body, close) => {
    let newBody = body;
    for (const [varName, newValue] of Object.entries(varMap)) {
      const lineRe = new RegExp(`([ \\t]*${varName.replace(/[-]/g, '\\-')}:\\s*)([^;]+)(;[^\\n]*)`, 'g');
      newBody = newBody.replace(lineRe, (_, prefix, oldVal, _semi) => {
        const trimmed = oldVal.trim();
        if (trimmed !== newValue) {
          changes.push(`  [.dark] ${varName}: ${trimmed} → ${newValue}`);
        }
        return `${prefix}${newValue};`;
      });
    }
    return `${open}${newBody}${close}`;
  });
}

// Re-run full patch using block-aware approach
css = original; // reset
const changes2 = [];

function patchBlockVars(css, selector, vars) {
  const blockRe = new RegExp(`(${selector}\\s*\\{)([\\s\\S]*?)(\\})(?=\\s*\\/\\*|\\s*@|\\s*\\.|\\s*:root|\\s*$)`, 'g');
  return css.replace(blockRe, (match, open, body, close) => {
    let newBody = body;
    for (const [varName, newValue] of Object.entries(vars)) {
      const lineRe = new RegExp(`([ \\t]*${varName.replace(/[/\\-]/g, '\\$&')}:\\s*)([^;]+)(;.*)`, 'g');
      newBody = newBody.replace(lineRe, (_, prefix, oldVal) => {
        const trimmed = oldVal.trim();
        if (trimmed !== newValue) {
          changes2.push(`  ${selector} ${varName}: ${trimmed} → ${newValue}`);
        }
        return `${prefix}${newValue};`;
      });
    }
    return `${open}${newBody}${close}`;
  });
}

const lightVars = Object.fromEntries(Object.entries(resolved).map(([k, v]) => [k, v.light]));
const darkVars  = Object.fromEntries(Object.entries(resolved).map(([k, v]) => [k, v.dark]));

css = patchBlockVars(css, ':root', lightVars);
css = patchBlockVars(css, '\\.dark', darkVars);

// Patch @theme primitive values
const themeVars = Object.fromEntries(
  Object.entries(THEME_PRIMITIVES).filter(([, v]) => v !== undefined)
);
css = patchBlockVars(css, '@theme', themeVars);

// ─── 7. Report + apply ─────────────────────────────────────────────────────

if (changes2.length === 0) {
  console.log('✅  globals.css is already up to date with DuBois tokens.');
} else {
  console.log(`\n📋  ${changes2.length} change(s) to globals.css:\n`);
  changes2.forEach(c => console.log(c));

  if (APPLY) {
    writeFileSync(GLOBALS_CSS, css);
    console.log(`\n✅  globals.css updated.`);
  } else {
    console.log('\n💡  Run with --apply to write changes.');
  }
}

// ─── 8. Figma variable sync ────────────────────────────────────────────────

if (FIGMA) {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) {
    console.error('\n❌  FIGMA_ACCESS_TOKEN not set. Set it and re-run with --figma.');
    process.exit(1);
  }

  console.log('\n🎨  Syncing Figma variables...');

  // Fetch current variables from Figma
  const res = await fetch(
    `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables/local`,
    { headers: { 'X-Figma-Token': token } }
  );
  const data = await res.json();

  if (data.error) {
    console.error('Figma API error:', data.error);
    process.exit(1);
  }

  const variables = data.meta?.variables ?? {};
  const collections = data.meta?.variableCollections ?? {};

  // Build name → variableId lookup
  const varByName = {};
  for (const [id, v] of Object.entries(variables)) {
    varByName[v.name] = { id, ...v };
  }

  // Map Figma primitive variable names → DuBois token values
  // Figma uses "blue/600" naming; DuBois JSON uses "Blue/blue600" nesting
  const FIGMA_PRIMITIVE_MAP = {
    // Blue
    'blue/100': primLookup['Blue/blue100'],
    'blue/200': primLookup['Blue/blue200'],
    'blue/300': primLookup['Blue/blue300'],
    'blue/400': primLookup['Blue/blue400'],
    'blue/500': primLookup['Blue/blue500'],
    'blue/600': primLookup['Blue/blue600'],
    'blue/700': primLookup['Blue/blue700'],
    'blue/800': primLookup['Blue/blue800'],
    // Grey
    'grey/050': primLookup['Grey/grey050'],
    'grey/100': primLookup['Grey/grey100'],
    'grey/200': primLookup['Grey/grey200'],
    'grey/300': primLookup['Grey/grey300'],
    'grey/350': primLookup['Grey/grey350'],
    'grey/400': primLookup['Grey/grey400'],
    'grey/500': primLookup['Grey/grey500'],
    'grey/600': primLookup['Grey/grey600'],
    'grey/650': primLookup['Grey/grey650'],
    'grey/700': primLookup['Grey/grey700'],
    'grey/760': primLookup['Grey/grey700'], // approximate — no grey760 in tokens
    'grey/730': primLookup['Grey/grey650'], // approximate — no grey730 in tokens
    'grey/800': primLookup['Grey/grey800'],
    // Red
    'red/400': primLookup['Red/red400'],
    'red/500': primLookup['Red/red500'],
    'red/600': primLookup['Red/red600'],
    'red/700': primLookup['Red/red700'],
    // Green
    'green/400': primLookup['Green/green400'],
    'green/500': primLookup['Green/green500'],
    'green/600': primLookup['Green/green600'],
    'green/700': primLookup['Green/green700'],
    // Yellow
    'yellow/500': primLookup['Yellow/yellow500'],
    'yellow/600': primLookup['Yellow/yellow600'],
    'yellow/700': primLookup['Yellow/yellow700'],
  };

  // Convert hex to Figma RGBA float format
  function hexToFigmaColor(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return { r, g, b, a: 1 };
  }

  // Find the mode IDs for the primitives collection
  // Figma variables have valuesByMode — find the single mode for primitive vars
  const updates = [];
  let figmaChanges = 0;

  for (const [figmaName, newHex] of Object.entries(FIGMA_PRIMITIVE_MAP)) {
    if (!newHex) continue;
    const figmaVar = varByName[figmaName];
    if (!figmaVar) {
      console.warn(`  ⚠️  Figma variable not found: "${figmaName}"`);
      continue;
    }
    const modeId = Object.keys(figmaVar.valuesByMode)[0];
    const currentVal = figmaVar.valuesByMode[modeId];
    const newColor = hexToFigmaColor(newHex);
    const changed =
      Math.abs((currentVal.r ?? 0) - newColor.r) > 0.001 ||
      Math.abs((currentVal.g ?? 0) - newColor.g) > 0.001 ||
      Math.abs((currentVal.b ?? 0) - newColor.b) > 0.001;
    if (changed) {
      console.log(`  ${figmaName}: #${Math.round(currentVal.r*255).toString(16).padStart(2,'0')}... → ${newHex}`);
      updates.push({
        variableId: figmaVar.id,
        modeId,
        value: newColor,
      });
      figmaChanges++;
    }
  }

  if (figmaChanges === 0) {
    console.log('  ✅  Figma primitive variables are already up to date.');
  } else if (APPLY) {
    // PATCH variables via REST API
    const patchRes = await fetch(
      `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables`,
      {
        method: 'POST',
        headers: { 'X-Figma-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableUpdates: updates.map(({ variableId, modeId, value }) => ({
            action: 'UPDATE',
            id: variableId,
            resolvedValuesByMode: { [modeId]: { type: 'COLOR', resolvedValue: value } },
          })),
        }),
      }
    );
    const patchData = await patchRes.json();
    if (patchData.error) {
      console.error('  ❌  Figma update error:', patchData.error);
    } else {
      console.log(`  ✅  Updated ${figmaChanges} Figma primitive variable(s).`);
    }
  } else {
    console.log(`\n  💡  ${figmaChanges} Figma variable(s) would be updated. Run with --apply to write.`);
  }

  // ── Semantic rgba variables (hover/press/table states) ──────────────────
  // These can't be expressed as references to solid hex primitives — they are
  // rgba tints. We create/update them in a "Semantic" collection in Figma.
  console.log('\n🎨  Syncing semantic rgba variables (hover/press/table states)...');

  // Parse rgba string → Figma color object
  function rgbaToFigmaColor(rgba) {
    const m = rgba.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(',').map(Number);
    return { r: r / 255, g: g / 255, b: b / 255, a: parseFloat(a) };
  }

  // Semantic vars to push: name → { light, dark }
  const SEMANTIC_RGBA_VARS = {
    'action/hover':           { light: light['actionDefaultBackgroundHover'],       dark: dark['actionDefaultBackgroundHover'] },
    'action/press':           { light: light['actionDefaultBackgroundPress'],        dark: dark['actionDefaultBackgroundPress'] },
    'action/danger-hover':    { light: light['actionDangerDefaultBackgroundHover'], dark: dark['actionDangerDefaultBackgroundHover'] },
    'action/danger-press':    { light: light['actionDangerDefaultBackgroundPress'],  dark: dark['actionDangerDefaultBackgroundPress'] },
    'table/row-hover':        { light: light['tableBackgroundUnselectedHover'],      dark: dark['tableBackgroundUnselectedHover'] },
    'table/row-selected':     { light: light['tableBackgroundSelectedDefault'],      dark: dark['tableBackgroundSelectedDefault'] },
    'table/row-selected-hover': { light: light['tableBackgroundSelectedHover'],     dark: dark['tableBackgroundSelectedHover'] },
  };

  // Find or identify the "Color" collection and its Light/Dark mode IDs
  const colorCollection = Object.values(collections).find(c => c.name === 'Color');
  if (!colorCollection) {
    console.warn('  ⚠️  No "Color" variable collection found — skipping semantic rgba sync.');
  } else {
    const modeIds = colorCollection.modes; // [{ modeId, name }]
    const lightModeId = modeIds.find(m => m.name === 'Light')?.modeId;
    const darkModeId  = modeIds.find(m => m.name === 'Dark')?.modeId;

    if (!lightModeId || !darkModeId) {
      console.warn('  ⚠️  Could not find Light/Dark modes in Color collection — skipping.');
    } else {
      const semanticCreates = [];
      const semanticUpdates = [];

      for (const [varName, { light: lVal, dark: dVal }] of Object.entries(SEMANTIC_RGBA_VARS)) {
        const lColor = rgbaToFigmaColor(lVal);
        const dColor = rgbaToFigmaColor(dVal);
        if (!lColor || !dColor) { console.warn(`  ⚠️  Could not parse rgba for "${varName}"`); continue; }

        const existing = varByName[varName];
        if (existing) {
          // Update existing variable's values for both modes
          semanticUpdates.push({ id: existing.id, name: varName, lColor, dColor, lModeId: lightModeId, dModeId: darkModeId });
          console.log(`  ~ ${varName}: updating rgba values`);
        } else {
          semanticCreates.push({ name: varName, lColor, dColor });
          console.log(`  + ${varName}: creating (light=${lVal} / dark=${dVal})`);
        }
      }

      if (APPLY && (semanticCreates.length || semanticUpdates.length)) {
        const payload = {
          variableCollections: [],
          variables: [
            ...semanticCreates.map(({ name }) => ({
              action: 'CREATE',
              name,
              variableCollectionId: colorCollection.id,
              resolvedType: 'COLOR',
              scopes: ['ALL_FILLS'],
            })),
            ...semanticUpdates.map(({ id }) => ({
              action: 'UPDATE',
              id,
            })),
          ],
          variableModeValues: [],
        };

        // First create variables, then set mode values in a second call
        const createRes = await fetch(
          `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables`,
          { method: 'POST', headers: { 'X-Figma-Token': token, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
        );
        const createData = await createRes.json();
        if (createData.error) { console.error('  ❌  Create error:', createData.error); }

        // Rebuild lookup after creates
        const allNewVars = { ...createData.variables ?? {} };
        const newVarByName = { ...varByName };
        for (const [id, v] of Object.entries(allNewVars)) newVarByName[v.name] = { id, ...v };

        // Set mode values for all semantic vars
        const modeValuePayload = {
          variableModeValues: Object.entries(SEMANTIC_RGBA_VARS).flatMap(([name, { light: lVal, dark: dVal }]) => {
            const v = newVarByName[name];
            if (!v) return [];
            const lColor = rgbaToFigmaColor(lVal);
            const dColor = rgbaToFigmaColor(dVal);
            return [
              { variableId: v.id, modeId: lightModeId, value: lColor },
              { variableId: v.id, modeId: darkModeId,  value: dColor },
            ];
          }),
        };
        const modeRes = await fetch(
          `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables`,
          { method: 'POST', headers: { 'X-Figma-Token': token, 'Content-Type': 'application/json' }, body: JSON.stringify(modeValuePayload) }
        );
        const modeData = await modeRes.json();
        if (modeData.error) { console.error('  ❌  Mode value error:', modeData.error); }
        else { console.log(`  ✅  Semantic rgba variables synced (${semanticCreates.length} created, ${semanticUpdates.length} updated).`); }
      } else if (!APPLY) {
        console.log(`  💡  ${semanticCreates.length} to create, ${semanticUpdates.length} to update. Run with --apply to write.`);
      } else {
        console.log('  ✅  Semantic rgba variables already up to date.');
      }
    }
  }
}
