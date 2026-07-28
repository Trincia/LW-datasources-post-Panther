#!/usr/bin/env node

/**
 * extract-dubois-icons.js
 *
 * Extracts DuBois icon SVGs from @databricks/design-system and converts them
 * into standalone React components compatible with shadcn/ui (no antd dependency).
 *
 * Usage:
 *   node scripts/extract-dubois-icons.js [--output <dir>] [--filter <pattern>]
 *
 * Options:
 *   --output, -o   Output directory (default: src/components/icons)
 *   --filter, -f   Regex pattern to filter icon names (e.g. "Catalog|Notebook|Pipeline")
 *   --all          Extract all 413 icons (default: only Databricks-specific icons)
 *
 * Examples:
 *   node scripts/extract-dubois-icons.js                          # DB-specific icons only
 *   node scripts/extract-dubois-icons.js --all                    # All 413 icons
 *   node scripts/extract-dubois-icons.js -f "Sparkle|Assistant"   # Only matching icons
 *   node scripts/extract-dubois-icons.js -o lib/icons             # Custom output dir
 */

const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag, short) => {
  const idx = args.findIndex((a) => a === flag || a === short);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const OUTPUT_DIR = getArg("--output", "-o") || "src/components/icons";
const FILTER = getArg("--filter", "-f");
const EXTRACT_ALL = args.includes("--all");

// Path to DuBois source SVGs
const DUBOIS_SVG_DIR = path.join(
  "node_modules",
  "@databricks",
  "design-system",
  "src",
  "assets",
  "icons"
);

// Path to DuBois generated TSX (fallback if SVGs not available)
const DUBOIS_TSX_DIR = path.join(
  "node_modules",
  "@databricks",
  "design-system",
  "src",
  "design-system",
  "Icon",
  "__generated",
  "icons"
);

// Databricks-specific icons that have no good Lucide equivalent.
// These are always extracted unless --filter is used.
const DB_SPECIFIC_ICONS = [
  // Data & Catalog
  "CatalogIcon", "CatalogCloudIcon", "CatalogGearIcon", "CatalogHIcon",
  "CatalogHomeIcon", "CatalogOffIcon", "CatalogSharedIcon",
  "DatabaseClockIcon", "DatabaseImportIcon", "DataIcon", "ErdIcon",
  "SchemaIcon", "StoredProcedureIcon",
  "TableClockIcon", "TableCombineIcon", "TableGlassesIcon", "TableGlobeIcon",
  "TableLightningIcon", "TableMeasureIcon", "TableModelIcon",
  "TableStreamIcon", "TableVectorIcon", "TableViewIcon",
  // Notebooks & Pipelines
  "NotebookIcon", "NotebookPipelineIcon", "PipelineIcon",
  "PipelineCodeIcon", "PipelineCubeIcon",
  "WorkflowsIcon", "WorkflowCodeIcon", "WorkflowCubeIcon",
  // ML & AI
  "AssistantIcon", "ModelsIcon", "FileModelIcon", "CloudModelIcon",
  "RobotIcon", "SparkleDoubleFillIcon", "SparkleDoubleIcon",
  "SparkleFillIcon", "SparkleRectangleIcon",
  "PencilSparkleIcon", "WrenchSparkleIcon", "UserSparkleIcon",
  "SpeechBubbleStarIcon", "SpeechBubbleQuestionMarkIcon",
  "SpeechBubbleQuestionMarkFillIcon",
  // Databricks UI
  "QueryEditorIcon", "QueryIcon", "CustomAppIcon", "WorkspacesIcon",
  "ReaderModeIcon", "StorefrontIcon",
  "SidebarAutoIcon", "SidebarCollapseIcon", "SidebarExpandIcon", "SidebarSyncIcon",
  "NeonProjectIcon",
  // Git
  "BranchIcon", "BranchCheckIcon", "BranchResetIcon",
  "FolderBranchIcon", "FolderBranchFillIcon", "FolderOpenBranchIcon",
  // Charts
  "BarChartIcon", "BarGroupedIcon", "BarStackedIcon", "BarStackedPercentageIcon",
  "BarsAscendingHorizontalIcon", "BarsAscendingVerticalIcon",
  "BarsDescendingHorizontalIcon", "BarsDescendingVerticalIcon",
  "ChartLineIcon", "TrendingIcon",
  // Sorting
  "SortAscendingIcon", "SortDescendingIcon", "SortUnsortedIcon",
  "SortHorizontalAscendingIcon", "SortHorizontalDescendingIcon",
  "SortVerticalAscendingIcon", "SortVerticalDescendingIcon",
  "SortLetterHorizontalAscendingIcon", "SortLetterHorizontalDescendingIcon",
  "SortLetterVerticalAscendingIcon", "SortLetterVerticalDescendingIcon",
  "SortLetterUnsortedIcon", "SortCustomHorizontalIcon", "SortCustomVerticalIcon",
  // Misc Databricks-specific
  "CellsSquareIcon", "IngestionIcon", "StreamIcon",
  "CertifiedIcon", "CertifiedFillIcon", "BadgeCodeIcon", "BadgeCodeOffIcon",
  "DagIcon", "DagHorizontalIcon", "DagVerticalIcon",
  "FolderCubeIcon", "FolderOpenCubeIcon", "FolderNodeIcon",
  "FileCubeIcon", "FilePipelineIcon", "FileLockIcon",
  "LayerGraphIcon", "LayerIcon", "ConnectIcon", "ArrowsConnectIcon",
  "TokenIcon", "SpeedometerIcon",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function svgToReactComponent(iconName, svgContent) {
  // Clean up SVG: normalize attributes to JSX
  let jsx = svgContent
    // Remove outer xml/doctype if present
    .replace(/<\?xml[^?]*\?>/g, "")
    // Convert SVG attributes to JSX camelCase
    .replace(/fill-rule/g, "fillRule")
    .replace(/clip-rule/g, "clipRule")
    .replace(/clip-path/g, "clipPath")
    .replace(/fill-opacity/g, "fillOpacity")
    .replace(/stroke-width/g, "strokeWidth")
    .replace(/stroke-linecap/g, "strokeLinecap")
    .replace(/stroke-linejoin/g, "strokeLinejoin")
    .replace(/stroke-dasharray/g, "strokeDasharray")
    .replace(/stop-color/g, "stopColor")
    .replace(/stop-opacity/g, "stopOpacity")
    // Replace hardcoded fill colors with currentColor (except "none" and "#fff"/"white")
    .replace(/fill="(?!none|#fff|white|currentColor)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none|#fff|white|currentColor)[^"]*"/g, 'stroke="currentColor"')
    // Replace the root <svg> tag to spread props
    .replace(
      /<svg([^>]*)>/,
      `<svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      {...props}
    >`
    );

  // Remove the original width/height/viewBox/xmlns from the cleaned SVG
  // (we set them explicitly above)
  jsx = jsx.replace(/\s+width="[^"]*"/g, "");
  jsx = jsx.replace(/\s+height="[^"]*"/g, "");
  jsx = jsx.replace(/\s+viewBox="[^"]*"/g, "");
  jsx = jsx.replace(/\s+xmlns="[^"]*"/g, "");
  jsx = jsx.replace(/\s+fill="none"/g, "");

  return `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ${iconName}Props extends React.SVGProps<SVGSVGElement> {
  /** Icon size in pixels. Default: 16 (DuBois standard). */
  size?: number | string;
  className?: string;
  /** Accessible label. When set, icon gets role="img". */
  ariaLabel?: string;
}

export const ${iconName} = forwardRef<SVGSVGElement, ${iconName}Props>(
  ({ size = 16, className, ariaLabel, ...props }, ref) => (
    ${jsx.trim()}
  )
);
${iconName}.displayName = "${iconName}";
`;
}

function generateIndex(iconNames) {
  return iconNames
    .sort()
    .map((name) => `export { ${name} } from "./${name}";`)
    .join("\n") + "\n";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // Determine which icons to extract
  let svgFiles;
  const useSvgSource = fs.existsSync(DUBOIS_SVG_DIR);
  const sourceDir = useSvgSource ? DUBOIS_SVG_DIR : DUBOIS_TSX_DIR;

  if (!fs.existsSync(sourceDir)) {
    console.error(
      `❌ Could not find DuBois icons. Make sure @databricks/design-system is installed.`
    );
    console.error(`   Looked in: ${DUBOIS_SVG_DIR} and ${DUBOIS_TSX_DIR}`);
    process.exit(1);
  }

  if (useSvgSource) {
    svgFiles = fs.readdirSync(DUBOIS_SVG_DIR).filter((f) => f.endsWith(".svg"));
  } else {
    svgFiles = fs
      .readdirSync(DUBOIS_TSX_DIR)
      .filter((f) => f.endsWith(".tsx") && f !== "index.ts");
  }

  // Filter icons
  let selectedFiles = svgFiles;

  if (FILTER) {
    const regex = new RegExp(FILTER, "i");
    selectedFiles = svgFiles.filter((f) => regex.test(f));
  } else if (!EXTRACT_ALL) {
    // Default: only Databricks-specific icons
    selectedFiles = svgFiles.filter((f) => {
      const name = f.replace(/\.(svg|tsx)$/, "");
      return DB_SPECIFIC_ICONS.includes(name);
    });
  }

  if (selectedFiles.length === 0) {
    console.error("❌ No icons matched the filter criteria.");
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const extractedNames = [];
  let errorCount = 0;

  for (const file of selectedFiles) {
    const iconName = file.replace(/\.(svg|tsx)$/, "");

    try {
      let svgContent;

      if (useSvgSource) {
        svgContent = fs.readFileSync(path.join(DUBOIS_SVG_DIR, file), "utf-8");
      } else {
        // Extract SVG from TSX — find the <svg>...</svg> block
        const tsx = fs.readFileSync(path.join(DUBOIS_TSX_DIR, file), "utf-8");
        const svgMatch = tsx.match(/<svg[\s\S]*?<\/svg>/);
        if (!svgMatch) {
          console.warn(`⚠️  Could not extract SVG from ${file}, skipping.`);
          errorCount++;
          continue;
        }
        // Convert JSX back to HTML-ish SVG for re-processing
        svgContent = svgMatch[0]
          .replace(/\{\.\.\.props\}/g, "")
          .replace(/fillRule=/g, "fill-rule=")
          .replace(/clipRule=/g, "clip-rule=")
          .replace(/clipPath=/g, "clip-path=");
      }

      const component = svgToReactComponent(iconName, svgContent);
      const outputPath = path.join(OUTPUT_DIR, `${iconName}.tsx`);
      fs.writeFileSync(outputPath, component, "utf-8");
      extractedNames.push(iconName);
    } catch (err) {
      console.warn(`⚠️  Error processing ${iconName}: ${err.message}`);
      errorCount++;
    }
  }

  // Generate barrel index
  const indexContent = generateIndex(extractedNames);
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexContent, "utf-8");

  console.log(`\n✅ Extracted ${extractedNames.length} DuBois icons to ${OUTPUT_DIR}/`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} icons had errors and were skipped.`);
  }
  console.log(`📦 Barrel export: ${OUTPUT_DIR}/index.ts`);
  console.log(`\nUsage:`);
  console.log(`  import { NotebookIcon, CatalogIcon } from "@/components/icons";`);
}

main();
